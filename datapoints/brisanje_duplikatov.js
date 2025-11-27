// brisanje_duplikatov.js
// Uporaba:
//   node brisanje_duplikatov.js          # brisanje
//   node brisanje_duplikatov.js --dry-run # samo izpis
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "smarteradb";
const collectionName = process.env.MONGODB_COLLECTION || "datapoints";
const SOURCE = "ESTAT";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const col = client.db(dbName).collection(collectionName);

    const cursor = col.aggregate([
      { $match: { source: SOURCE } },
      // normaliziraj timestamp (če je string), varno tudi če je že Date
      { $addFields: { ts: { $toDate: "$timestamp" } } },
      { $sort: { ts: -1 } },
      {
        $group: {
          _id: {
            survey: "$survey",
            region: "$region",
            dimensions: "$dimensions",
          },
          keep: { $first: "$_id" },
          all: { $push: "$_id" },
        },
      },
      {
        $project: {
          _id: 0,
          toDelete: { $setDifference: ["$all", ["$keep"]] },
        },
      },
      { $unwind: "$toDelete" },
      // ⬇️ ključni popravek: vrni objekt z _id
      { $project: { _id: "$toDelete" } },
    ]);

    const ids = [];
    for await (const doc of cursor) ids.push(doc._id);

    if (ids.length === 0) {
      console.log("✅ Ni duplikatov za brisanje (source='ESTAT').");
      return;
    }

    console.log(`🧾 Najdenih ${ids.length} starejših duplikatov.`);
    if (dryRun) {
      console.log("DRY RUN: ne brišem ničesar.");
      return;
    }

    // po želji briši v batchih, če je zelo veliko id-jev
    const res = await col.deleteMany({ _id: { $in: ids } });
    console.log(`🧹 Zbrisanih ${res.deletedCount} dokumentov (obdržan najnovejši).`);
  } catch (err) {
    console.error("❌ Napaka:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
