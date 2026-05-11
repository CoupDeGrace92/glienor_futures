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
import { MarketClient } from "./market_client.js";
import { InsertDailyData } from "../db/queries/daily_price_logs.js";
import { GetLastUpdateTimestamp } from "../db/queries/meta.js";
const popClient = new MarketClient("glienor futures data fetcher");
const data = await popClient.getAllItems();
let timestampObj = await GetLastUpdateTimestamp();
let fetchedTimestamp;
/*
Diagnostic Checks for updates
*/
if ("success" in data) {
    console.error(`Market error: ${data.error}`);
}
else if (typeof data["%JAGEX_TIMESTAMP%"] !== "number") {
    console.error("JAGEX TIMESTAMP NOT THE EXPECTED TYPE");
}
else if (typeof data["%UPDATE_DETECTED%"] !== "number") {
    console.error("UPDATE DETECTED NOT THE EXPECTED TYPE");
}
else {
    console.log(`NOW: ${new Date().toISOString()}`);
    console.log(`JAGEX TIMESTAMP: ${new Date(data["%JAGEX_TIMESTAMP%"] * 1000).toISOString()}`);
    console.log(`UPDATE DETECTED: ${new Date(data["%UPDATE_DETECTED%"] * 1000).toISOString()}`);
}
if ("success" in data) {
    console.error(`Market error: ${data.error}`);
}
else if (typeof data["%JAGEX_TIMESTAMP%"] !== "number") {
    console.error(`%JAGEX TIMESTAMP% not the expected type: ${data["%JAGEX_TIMESTAMP%"]}`);
}
else {
    fetchedTimestamp = new Date(data["%JAGEX_TIMESTAMP%"] * 1000);
    if (isNaN(fetchedTimestamp.getTime())) {
        console.error(`%JAGEX_TIMESTAMP$ could not be converted to a timestamp: ${data["JAGEX_TIMESTAMP%"]}`);
        const update = await popClient.getLastUpdate();
        fetchedTimestamp = new Date(update.osrs);
        if (isNaN(fetchedTimestamp.getTime())) {
            throw new Error("[FATAL] - BOTH DUMP TIMESTAMP AND /exchange TIMESTAMP WERE UNABLE TO BE CONVERTED INTO TIMESTAMPS");
        }
        else
            (console.log("/exchange timestamp: ", fetchedTimestamp));
    }
    else
        (console.log("%JAGEX_TIMESTAMP%: ", fetchedTimestamp));
    if (timestampObj == null || timestampObj.timestamp == null || timestampObj.timestamp < fetchedTimestamp) {
        console.log(`[${new Date()}] - Inserting new data - [UPDATED AT: ${fetchedTimestamp}]`);
        await fastChunkedDailyInsert(data, fetchedTimestamp);
        console.log(`${new Date()} - Data inserted`);
    }
}
async function fastChunkedDailyInsert(rawDump, timestamp) {
    if ("success" in rawDump && !data.success) {
        console.error("Raw data contained an error: ", rawDump.error);
        return;
    }
    else if ("success" in rawDump) {
        console.error("Raw dump contains unexpected field");
        return;
    }
    ;
    const chunkSize = 1000;
    let currentChunk = [];
    const insertPromises = [];
    for (const key in rawDump) {
        const rawEntry = rawDump[key];
        if (typeof rawEntry === "number") {
            continue;
        }
        ;
        let entry = {
            name: rawEntry.name,
            lastUpdate: timestamp,
            id: rawEntry.id,
            volume: rawEntry.volume,
        };
        currentChunk.push(entry);
        delete (rawDump[key]); //This will get the gc to free some memory while waiting on async processes
        if (currentChunk.length >= chunkSize) {
            insertPromises.push(InsertDailyData(currentChunk));
            currentChunk = [];
        }
    }
    ;
    if (currentChunk.length > 0) {
        insertPromises.push(InsertDailyData(currentChunk));
    }
    await Promise.all(insertPromises);
}
;
