import os
import osmnx as ox
import pandas as pd
import ast
from pymongo import MongoClient
from datetime import datetime, UTC

# === MongoDB Setup ===
MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB_NAME", "smarteradb")
COLL_NAME = os.getenv("MONGODB_COLLECTION_NAME", "datapoints")

if not MONGO_URI:
    raise RuntimeError("MONGODB_URI ni nastavljen.")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLL_NAME]
timestamp = datetime.now(UTC)


def parse_osm(places, tags):
    """
    Parse OpenStreetMap data for a list of places and a tag dictionary. Returns a count of features found.
    """
    try:
        gdf = ox.features_from_place(places, tags=tags)
        return len(gdf)
    except Exception as e:
        if "No matching features" not in str(e):
            print(f"Unexpected error for {places} with tags {tags}: {e}")

        return 0

# === Replaces reading "pilots.csv"
pilot_places = {
    "P1": [
        "Caldes, Valle di Sole, Italy",
        "Cavizzana, Valle di Sole, Italy",
        "Terzolas, Valle di Sole, Italy",
        "Male, Valle di Sole, Italy",
        "Croviana, Valle di Sole, Italy",
        "Dimaro Folgarida, Valle di Sole, Italy",
        "Commezzadura, Valle di Sole, Italy",
        "Mezzana, Valle di Sole, Italy",
        "Pellizzano, Valle di Sole, Italy",
        "Rabbi, Valle di Sole, Italy",
        "Peio, Valle di Sole, Italy",
        "Ossana, Valle di Sole, Italy",
        "Vermiglio, Valle di Sole, Italy"
    ],
    "P2": [
        "Sóller, Spain",
        "Fornalutx, Spain"
        # "Biniaraix, Spain" #napaka pri OSM podatkih
    ],
    "P3": [
        "Alavieska, Finland",
        "Kalajoki, Finland",
        "Nivala, Finland"
    ],
    "P4": [
        "Nevesinje, Bosnia and Herzegovina",
        "Gacko, Bosnia and Herzegovina",
        "Bileća, Bosnia and Herzegovina",
        "Trebinje, Bosnia and Herzegovina",
        "Berkovići, Bosnia and Herzegovina",
        "Kalinovik, Bosnia and Herzegovina",
        "Ljubinje, Bosnia and Herzegovina",
        "Istočni Mostar, Bosnia and Herzegovina"
    ],
    "P5": [
        "Padna, Slovenia",
        "Šmarje, Koper, Slovenia"
    ],
    "P6": [
        "Agatovo, Bulgaria",
        "Alexandrovo, Bulgaria",
        "Brestovo, Bulgaria",
        "Gorsko Slivovo, Bulgaria",
        "Kakrina, Bulgaria",
        "Karpachevo, Bulgaria",
        "Krushuna, Bulgaria",
        "Kramolin, Bulgaria",
        "Tepava, Bulgaria"
    ]
}

# === Replaces reading "tags.csv"
tags_data = [
    {"value": "amenity=restaurant", "name": "Restaurant"},
    {"value": "amenity=hospital", "name": "Hospital"},
    {"value": "amenity=school", "name": "School"},
    {"value": "amenity=bank", "name": "Bank"},
    {"value": "amenity=cafe", "name": "Cafe"},
    {"value": "amenity=pharmacy", "name": "Pharmacy"},
    {"value": "amenity=cinema", "name": "Cinema"},
    {"value": "amenity=parking", "name": "Parking"},
    {"value": "amenity=fuel", "name": "Fuel Station"},
    {"value": "amenity=marketplace", "name": "Marketplace"},
    {"value": "amenity=vending_machine", "name": "Vending Machine"},
    {"value": "building=commercial", "name": "Commercial Building"},
    {"value": "man_made=offshore_platform", "name": "Offshore Platform"},
    {"value": "man_made=petroleum_well", "name": "Petroleum Well"},
    {"value": "man_made=pipeline", "name": "Pipeline"},
    {"value": "man_made=works", "name": "Industrial Works"},
    {"value": "office=company", "name": "Company Office"},
    {"value": "office=coworking", "name": "Coworking Space"},
    {"value": "shop=all", "name": "Shops"},
    {"value": "tourism=alpine_hut", "name": "Alpine Hut"},
    {"value": "tourism=attraction", "name": "Tourist Attraction"},
    {"value": "tourism=camp_pitch", "name": "Camp Pitch"},
    {"value": "tourism=camp_site", "name": "Camp Site"},
    {"value": "tourism=caravan_site", "name": "Caravan Site"},
    {"value": "building=chalet", "name": "Chalet"},
    {"value": "building=guest_house", "name": "Guest House"},
    {"value": "building=hostel", "name": "Hostel"},
    {"value": "building=hotel", "name": "Hotel"},
    {"value": "tourism=information", "name": "Tourist Info"},
    {"value": "tourism=motel", "name": "Motel"},
    {"value": "building=museum", "name": "Museum"},
    {"value": "tourism=wilderness_hut", "name": "Wilderness Hut"},
    {"value": "amenity=townhall", "name": "Townhall"},
    {"value": "amenity=courthouse", "name": "Courthouse"},
    {"value": "amenity=police", "name": "Police"},
    {"value": "amenity=fire_station", "name": "Fire Station"},
    {"value": "building=government", "name": "Government Building"},
    {"value": "barrier=bump_gate", "name": "Bump Gate"},
    {"value": "barrier=bus_trap", "name": "Bus Trap"},
    {"value": "barrier=cycle_barrier", "name": "Cycle Barrier"},
    {"value": "barrier=motorcycle_barrier", "name": "Motorcycle Barrier"},
    {"value": "barrier=sump_buster", "name": "Sump Buster"},
    {"value": "building=train_station", "name": "Train Station"},
    {"value": "building=transportation", "name": "Transport Building"},
    {"value": "highway=motorway", "name": "Motorway"},
    {"value": "public_transport=all", "name": "Public Transport"},
    {"value": "railway=all", "name": "Railways"},
    {"value": "route=all", "name": "Routes"},
    {"value": "amenity=recycling", "name": "Recycling"},
    {"value": "boundary=forest", "name": "Forest"},
    {"value": "boundary=forest_compartment", "name": "Forest Compartment"},
    {"value": "boundary=hazard", "name": "Hazard Area"},
    {"value": "boundary=national_park", "name": "National Park"},
    {"value": "boundary=protected_area", "name": "Protected Area"},
    {"value": "leisure=garden", "name": "Garden"},
    {"value": "leisure=nature_reserve", "name": "Nature Reserve"},
    {"value": "leisure=park", "name": "Park"},
    {"value": "man_made=gasometer", "name": "Gasometer"},
    {"value": "man_made=mineshaft", "name": "Mineshaft"},
    {"value": "man_made=wastewater_plant", "name": "Wastewater Plant"},
    {"value": "man_made=water_works", "name": "Water Works"},
    {"value": "natural=grass", "name": "Grassland"},
    {"value": "water=river", "name": "River"},
    {"value": "amenity=college", "name": "College"},
    {"value": "amenity=kindergarten", "name": "Kindergarten"},
    {"value": "amenity=university", "name": "University"},
    {"value": "office=educational_institution", "name": "Education Office"},
    {"value": "office=employment_agency", "name": "Employment Office"},
    {"value": "amenity=refugee_site", "name": "Refugee Site"},
    {"value": "amenity=internet_cafe", "name": "Internet Café"},
    {"value": "amenity=public_bath", "name": "Public Bath"},
    {"value": "amenity=water_point", "name": "Water Point"},
    {"value": "amenity=place_of_worship", "name": "Place of Worship"},
    {"value": "amenity=toilets", "name": "Public Toilets"}
]

tags_df = pd.DataFrame(tags_data)

# === Save to MongoDB as DataPoint ===
def insert_datapoint(source, survey, surveyName, region, fromUrl, dimensions, value):
    datapoint = {
        "source": source,
        "survey": survey,
        "surveyName": surveyName,
        "region": region,
        "fromUrl": fromUrl,
        "timestamp": timestamp,
        "dimensions": dimensions,
        "value": value
    }

    existing = collection.find_one({
        "source": source,
        "survey": survey,
        "region": region,
        "dimensions": dimensions,
        "value": value
    })

    if existing:
        collection.update_one({"_id": existing["_id"]}, {"$set": {"timestamp": timestamp}})
        # print(f"Updated timestamp for existing datapoint: {dimensions}")
    else:
        result = collection.insert_one(datapoint)
        print(f"Inserted new datapoint with ID: {result.inserted_id}")

# === Main processing
#results = []

for pilot, places in pilot_places.items():
    for _, tag_row in tags_df.iterrows():
        try:
            if "=all" in tag_row["value"]:
                key = tag_row["value"].split("=")[0]
                tag_dict = {key: True}
            else:
                key, val = tag_row["value"].split("=")
                tag_dict = {key: val}
        except Exception as e:
            print(f"Tag parsing error for {tag_row['value']}: {e}")
            continue

        tag_name = tag_row["name"]

        count = parse_osm(places, tag_dict)
        insert_datapoint(
            source="OSM",
            survey="osm_counts",
            surveyName="OSM Counts",
            region=pilot,
            fromUrl="https://www.openstreetmap.org",
            dimensions=[tag_name],
            value=count
        )
#        results.append({"PILOT": pilot, "TAG": tag_name, "COUNT": count})

client.close()

print("Done.")
# Output results
#results_df = pd.DataFrame(results)
#print(results_df)

#results_df.to_csv("osm_counts.csv", index=False)
