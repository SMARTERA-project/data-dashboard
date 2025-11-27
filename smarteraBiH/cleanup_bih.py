#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB_NAME", "smarteradb")
COLL_NAME = os.getenv("MONGODB_COLLECTION_NAME", "datapoints")

if not MONGO_URI:
    print("[ERROR] MONGODB_URI ni nastavljen.", file=sys.stderr)
    sys.exit(1)

def main():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLL_NAME]

    # preštej najprej
    count_before = collection.count_documents({"region": "bih"})
    print(f"[INFO] Najdenih {count_before} dokumentov z region='bih'.")

    if count_before == 0:
        print("[INFO] Ni podatkov za brisanje.")
        sys.exit(0)

    # izbriši
    result = collection.delete_many({"region": "bih"})
    print(f"[INFO] Izbrisanih {result.deleted_count} dokumentov.")

    sys.exit(0)

if __name__ == "__main__":
    main()
