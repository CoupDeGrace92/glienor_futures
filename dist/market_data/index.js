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
//Granular data stuff:
const granularClient = new MarketClient("gleinor_futures - @coupdegrace09214, github: https://github.com/CoupDeGrace92/glienor_futures");
let granularData;
try {
    granularData = await granularClient.getAllItems();
}
catch (err) {
    console.error("Error fetching data: ", err);
    //ADD SYNC ERROR HERE
    throw new Error("ERROR CAUGHT IN GRANULAR DATA - NOT LOOPING YET SO WE BREAK");
}
;
const updateTimestamp = new Date(granularData.timestamp * 1000);
if (isNaN(updateTimestamp.getTime())) {
    console.error("Error - timestamp could not be converted");
    //ADD SYNC ERROR HERE
    throw new Error("ERROR CAUGHT IN GRANULAR DATA - NOT LOOPING YET SO WE BREAK");
}
console.log(`[${new Date()}] - inserting data - [UPDATE AT: ${updateTimestamp}]`);
await fastChunkedGranularInsert(granularData, updateTimestamp);
console.log(`[${new Date()}] - Done inserting data`);
async function fastChunkedGranularInsert(rawDump, timestamp) {
    const chunkSize = 1000;
    let currentChunk = [];
    const insertPromises = [];
    for (const [key, value] of Object.entries(rawDump.data)) {
        let entry = {
            lastUpdate: timestamp,
            id: Number(key),
            avgHighPrice: value.avgHighPrice,
            highPriceVolume: value.highPriceVolume,
            avgLowPrice: value.avgLowPrice,
            lowPriceVolume: value.lowPriceVolume
        };
        currentChunk.push(entry);
        delete (rawDump.data[Number(key)]);
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
