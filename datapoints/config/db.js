const { MongoClient } = require("mongodb");

let client;
let db;

async function connectToDb(logger) {
    
  const uri = process.env.MONGO_URI || "mongodb://root:8fKWLMMqV8c3j79HHI1i@smartera-mongo:27017";
  const dbName = process.env.MONGO_DB || "smarteradb";

  if (!client) {
    client = new MongoClient(uri, { ignoreUndefined: true });
  }

  if (!client.topology || client.topology.isDestroyed()) {
    await client.connect();
    logger?.info?.("Connected to MongoDB successfully.");
  }

  db = client.db(dbName);
  return db;
}


function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToDb() first.");
  }
  return db;
}


async function closeDb(logger) {
  if (client) {
    try {
      await client.close();
      logger?.info?.("MongoDB connection closed.");
    } finally {
      client = undefined;
      db = undefined;
    }
  }
}

module.exports = { connectToDb, getDb, closeDb };