const https = require('https');
const http = require('http');
const { URL } = require('url');
const path = require('path');
const process = require('node:process');
const winston = require('winston');

const { DataSource } = require('./domain/DataSource');
const { DataPoint } = require('./domain/DataPoint');
const { connectToDb, getDb, closeDb } = require('./config/db'); 

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

// ---- KONFIGURACIJA IZ ENV ----
const {
    MONGO_URI,
    LOCATIONS_URL,
    RESOURCE_URL_TEMPLATE,
    MONGODB_DB_NAME = 'smarteradb',
    MONGODB_COLLECTION_NAME = 'datapoints',
} = process.env;

// brez občutljivih defaultov (ali zelo nedolžni)
if (!MONGO_URI) {
    logger.error('MONGO_URI ni nastavljen v okolju (process.env.MONGO_URI).');
    process.exit(1);
}

const client = new MongoClient(MONGO_URI);
const timestamp = new Date();

const locationsURL = LOCATIONS_URL || "https://smartera.scch.at/data/locations";
// TEMPLATE naj ne vsebuje tokena v kodi – dodaj ga v .env, če je potreben
const resourceUrlTemplate =
    RESOURCE_URL_TEMPLATE || "https://smartera.scch.at/data/{location}?accessToken=";

// --------------------------------

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
        logger.error('Error connecting to MongoDB:', error);
    }
}

function fetchLocationJSON(url = locationsURL, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('Too many redirects.'));

    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;

    const req = lib.get(url, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        const loc = res.headers.location;
        res.resume();
        if (!loc) return reject(new Error(`Redirect without a Location header (${res.statusCode}).`));
        const next = new URL(loc, u).toString(); 
        return resolve(fetchLocationJSON(next, redirects + 1));
      }

      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} when reading ${url}`));
      }

      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try {
          const arr = JSON.parse(raw);
          if (!Array.isArray(arr)) return reject(new Error('A JSON array is expected.'));

          const dataSources = arr.map((el, idx) => {
            const locationEncoded = encodeURIComponent(el.FULLNAME);
            const filled = resourceUrlTemplate.replace('{location}', locationEncoded);
            return new DataSource(idx, el.FULLNAME, el.COUNTRY, filled);
          });

          resolve(dataSources);
        } catch (e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function parseJsonData(jsonData, dataSource, collected) {
    if (!jsonData || !jsonData.smartnessIndex || !jsonData.smartnessIndexInfo) {
        logger.error("Incorrect JsonData structure...");
        return;
    }

    const surveyName = "AT-SSCH";
    const smartnessIndex = jsonData.smartnessIndex;  
    const smartnessIndexInfo = jsonData.smartnessIndexInfo;

    const dataPointSmartness = new DataPoint(
        surveyName,
        dataSource.name,
        dataSource.name,
        dataSource.region,
        dataSource.url,
        ["SmartnessIndex"],
        smartnessIndex
    );
    
    const dataPointSmartnessInfo = new DataPoint(
        surveyName,
        dataSource.name,
        dataSource.name,
        dataSource.region,
        dataSource.url,
        ["SmartnessIndexInfo"],
        smartnessIndexInfo
    );

    collected.push(dataPointSmartness);
    collected.push(dataPointSmartnessInfo);
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

                    if (!jsonData.smartnessIndex) {
                        logger.error("Missing data in smartnessIndex JSON for: " + dataSource.url);
                        reject("Missing data in smartnessIndex JSON for: "+ dataSource.url);
                    }

                    console.log(`Obdelujem ${dataSource.name} iz ${dataSource.url}`);

                    let collected = [];

                    await parseJsonData(jsonData, dataSource, collected);

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
            logger.error('Error in HTTP request: ', error);
            resolve(error);
        });
    });
}

async function run() {
    await connectToDb(); 
    let dataSources = await fetchLocationJSON();

    if (!dataSources || dataSources.length === 0) {
        logger.error("No data sources to process.");
        await closeDb(logger);
        return;
    }
    
    let promises = [];

    for (let dataSource of dataSources) {
        promises.push(fetchJson(dataSource).catch((e) => {
            logger.error(`Napaka pri obdelavi ${dataSource.url}`, e);
        }));
    }

    Promise.all(promises).then(async () => {
        await client.close();
        logger.info("Vse obdelano, povezava z MongoDB zaprta.");
        process.exit(0);
    });
    
    logger.info("Done");
}

process.on('SIGINT', async () => { await closeDb(logger); process.exit(0); });
process.on('SIGTERM', async () => { await closeDb(logger); process.exit(0); });

run();
