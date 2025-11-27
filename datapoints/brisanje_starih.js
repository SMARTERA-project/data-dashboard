// delete_before_oct1.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "smarteradb";
const collectionName = process.env.MONGODB_COLLECTION || "datapoints";

// 1. oktober 2025, 00:00:00 UTC
const CUTOFF = new Date("2025-10-01T00:00:00.000Z");

async function main() {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const col = client.db(dbName).collection(collectionName);

		// Filter:
		// - source: "ESTAT"
		// - survey NI v ["EF_LAC_MAIN", "EF_LAC_VEGE"]
		// - timestamp (string ali Date) < 1.10.2025
		const filter = {
			source: "ESTAT",
			survey: { $nin: ["EF_LAC_MAIN", "EF_LAC_VEGE"] },
			$expr: { $lt: [{ $toDate: "$timestamp" }, CUTOFF] }
		};

		const res = await col.deleteMany(filter);
		console.log(
			`Zbrisanih ${res.deletedCount} dokumentov (pred 1.10.2025, source='ESTAT', survey != EF_LAC_*).`
		);
	} catch (err) {
		console.error("Napaka:", err);
		process.exitCode = 1;
	} finally {
		await client.close();
	}
}

main();
