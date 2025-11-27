const https = require('https');
const fs = require('fs');
const path = require('path');
const process = require('node:process');
const winston = require('winston');

const { DataSource } = require('./domain/DataSource');
const { DataPoint } = require('./domain/DataPoint');
const { connectToDb, getDb, closeDb } = require('./config/db');

const timestamp = new Date();

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} - ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({
            filename: 'data/datapoints.log',
            level: 'debug',
        }),
        new winston.transports.Console({
            level: 'error', 
        })
    ]
});

const {
    MONGODB_URI,
    MONGODB_DB_NAME = 'smarteradb',
    MONGODB_COLLECTION_NAME = 'datapoints',
} = process.env;

if (!MONGODB_URI) {
    logger.error('MONGODB_URI ni nastavljen v okolju (process.env.MONGODB_URI).');
    process.exit(1);
}

const client = new MongoClient(MONGODB_URI);
const timestamp = new Date();

class DataSource {
    constructor(id, name, region, url) {
        this.id = id;
        this.name = name;
        this.region = region;
        this.url = url;
    }
}

class Stevec {
    constructor(index) {
        this.index = index;
    }
}

class DataPoint {
    constructor(source, survey, surveyName, region, fromUrl, dimensions, value) {
        this.source = source;
        this.survey = survey;
        this.surveyName = surveyName;
        this.region = region;
        this.fromUrl = fromUrl;
        this.timestamp = timestamp;
        this.dimensions = dimensions;
        this.value = value;
    }
}

async function connectToDb() {
    try {
        await client.connect();

        logger.info("Povezano z MongoDB");
    } catch (error) {
        logger.error('Napaka pri povezovanju z MongoDB:', error);
    }
}

function readDataSourceCSV(datoteka) {
    try {
        const pot = path.resolve(__dirname, datoteka);
        const podatki = fs.readFileSync(pot, 'utf8');

        let dataSources = [];

        let lines = podatki.split("\n");

        for (let line of lines) {

            if (line.startsWith("#")) {
                continue;
            }

            let parts = line.split(";");

            if (parts.length < 4) {
                logger.error("Incorrect CSV file structure: " + line);
                continue;
            }

            let url = parts[3].replaceAll("\r", "").trim();

            dataSources.push(new DataSource(parts[2], parts[0], parts[1], url));

        }

        return dataSources;

    } catch (error) {
        logger.error('Error reading configuration file:', error);
        return null;
    }
}

async function visit(jsonData, dataSource, depth, categories, counter, collected) {
    if (!jsonData || !jsonData.size) {
        logger.error("Incorrect JsonData structure...");
        return;
    }

    let size = jsonData.size;
    let ids = jsonData.id;
    let dimensions = jsonData.dimension;
    let values = jsonData.value;
    let source = jsonData.extension.agencyId;
    let noElem = size.length;

    let dim = dimensions[ids[depth]];

    for (let i = 0; i < size[depth]; i++) {
        let label = dim.label;
        let catDim= dim.category;
        let keys = Object.keys(catDim.label);
        let cat = catDim.label[keys[i]];
        let k = categories.slice(0);
        k.push(cat);

        if (noElem === depth + 1) {
            

            if (values[counter.index] === undefined) {
                counter.index = counter.index + 1;
                continue;
            } 

            const dataPoint = new DataPoint(
                source,
                dataSource.id,
                dataSource.name,
                dataSource.region,
                dataSource.url,
                k,
                values[counter.index]
            );
            
            counter.index = counter.index + 1;
            collected.push(dataPoint);

        } else {
            await visit(jsonData, dataSource, depth + 1, k, counter, collected);
        }
    }
}

async function fetchJson(dataSource) {
    return new Promise((resolve, reject) => {
        const url = dataSource.url.trim();

        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', async () => {
                try {
                    const jsonData = JSON.parse(data);

                    if (!jsonData.extension) {
                        logger.error("Missing data in JSON for: " + dataSource.url);
                        reject("Missing data in JSON for " + dataSource.url);
                    }

                    const collected = [];
                    await visit(jsonData, dataSource, 0, [], new Counter(0), collected);

            const db = client.db(MONGODB_DB_NAME);
            const collection = db.collection(MONGODB_COLLECTION_NAME);

                    const bulkOps = collected.map(dp => ({
                        updateOne: {
                            filter: {
                                source: dp.source,
                                survey: dp.survey,
                                region: dp.region,
                                dimensions: dp.dimensions
                            },
                            update: {
                                $set: {
                                    ...dp
                                }
                            },
                            upsert: true
                        }
                    }));

                    if (bulkOps.length > 0) {
                        const result = await collection.bulkWrite(bulkOps, { ordered: false });
                        logger.debug(`Bulk insert/update complete for ${dataSource.name}: ${result.upsertedCount} upserts, ${result.modifiedCount} modified`);
                    }

                    resolve();
                } catch (error) {
                    logger.error('Error parsing or processing JSON: ', error);
                    resolve(error);
                }
            });
        }).on('error', (error) => {
            logger.error('Error in HTTP request:', error);
            resolve(error);
        });
    });
}

async function run() {
    await connectToDb(logger); 
    let dataSources = readDataSourceCSV('data/estat.csv');

    if (!dataSources || dataSources.length === 0) {
        logger.error("No data sources to process.");
        await closeDb(logger);  
        return;
    }

    let promises = [];

    for (let dataSource of dataSources) {
        promises.push(fetchJson(dataSource).catch((e) => {
            logger.error(`Error during processing ${dataSource.url}`, e);
        })
        );
    }

    await Promise.all(promises);

    await closeDb(logger);
    logger.info("All processed, MongoDB connection closed.");
    process.exit(0);
}

process.on('SIGINT', async () => { await closeDb(logger); process.exit(0); });
process.on('SIGTERM', async () => { await closeDb(logger); process.exit(0); });

run();
