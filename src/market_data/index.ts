//MARKET FETCHING TOOL
//Below is a get test for the endpoint in question
/*
const url = new URL("https://api.weirdgloop.org/exchange/history/osrs/latest")
url.searchParams.append("name", "dragon dagger")
console.log(url.toString())
const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
        "User-Agent": "glienor futures market tools"
    },
});

const data = await response.json()
console.log(data)
*/

//The data population script - should get the most recent data endpoint once every 10 minutes
//if the updated value is more recent than our db value, populate our db with the new data

import { MarketClient, DumpData } from "./market_client.js";
import { InsertDailyData } from "../db/queries/daily_price_logs.js"
import { NewDailyPriceLogs } from "../db/schema.js"
import { GetLastUpdateTimestamp } from "../db/queries/meta.js"
import { db } from "../db/index.js";

const popClient = new MarketClient("glienor futures data fetcher");
const data= await popClient.getAllItems();
let {timestamp: storedTimestamp} = await GetLastUpdateTimestamp();
if (storedTimestamp === null) {
    const fetchedTimestamp = await popClient.getLastUpdate()
    const time = new Date(fetchedTimestamp.osrs)
    if (isNaN(time.getTime())) {
        throw new Error(`Invalid upstream timestamp: ${fetchedTimestamp.osrs}`);
    }
    storedTimestamp = time
}

console.log(storedTimestamp)
if ("success" in data) {
    console.error("Raw data in the form of Market Error: ", data.error)
} else {
    console.log(`Update Detected: ${data["%UPDATE_DETECTED%"]}`)
    console.log(`Jagex Timestamp: ${data["%JAGEX_TIMESTAMP%"]}`)
}


await fastChunkedDailyInsert(data, storedTimestamp)

//We want to chunk the data into smaller sizes - 1000 or so entries
//To do so - loop over key value pairs, insert them into chunks, put them into a chunk list.


async function fastChunkedDailyInsert(rawDump: DumpData, timestamp: Date) {
    if ("success" in rawDump && !data.success) {
        console.error("Raw data contained an error: ", rawDump.error);
        return;
    } else if ("success" in rawDump) {
        console.error("Raw dump contains unexpected field");
        return;
    };
    
    const chunkSize = 1000;
    let currentChunk = [];
    
    const insertPromises: Promise<any>[] =  [];

    for (const key in rawDump) {
        const rawEntry = rawDump[key];
        if (typeof rawEntry === "number") {
            continue;
        };

        let entry: NewDailyPriceLogs = {
            name: rawEntry.name,
            lastUpdate: timestamp,
            id: rawEntry.id,
            volume: rawEntry.volume,
        };

        currentChunk.push(entry);
        delete(rawDump[key]);  //This will get the gc to free some memory while waiting on async processes

        if (currentChunk.length >= chunkSize) {
            insertPromises.push(InsertDailyData(currentChunk));
            currentChunk = [];
        }
    };

    if (currentChunk.length > 0) {
        insertPromises.push(InsertDailyData(currentChunk));
    }

    await Promise.all(insertPromises)
};