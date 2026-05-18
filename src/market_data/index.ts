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

import { WGMarketClient, WGDumpData, WGMarketData, MarketData, ItemData, MarketClient, MarketResponse } from "./market_client.js";
import { InsertDailyData } from "../db/queries/daily_price_logs.js"
import { InsertHistData } from "../db/queries/price_hist.js"
import { NewGranularPriceLogs, NewPriceHist } from "../db/schema.js"
import { GetGranularUpdate, GetHistoricUpdate, GetLastUpdateTimestamp } from "../db/queries/meta.js"

//Granular data stuff:
let granularUpdate: Date;
let historicalUpdate: Date;
const FIVE_MINUTES_MS = 5 * 60000;
const ONE_DAY_MS = 24*60*60000;

try {
    const [rawGranular, rawHist] = await Promise.all([
        GetGranularUpdate(),
        GetHistoricUpdate()
    ]);
    if (rawGranular.timestamp == null) {
        granularUpdate = new Date()
    } else {
        granularUpdate = new Date(rawGranular.timestamp.getTime() + FIVE_MINUTES_MS)
    }
    if (rawHist.timestamp == null) {
        historicalUpdate = new Date()
    } else {
        historicalUpdate = new Date(rawHist.timestamp.getTime()+ONE_DAY_MS)
    }
} catch {
    console.error(`Error fetching data from metadata table - starting data collection from now: ${new Date()}`)
    granularUpdate = new Date();
    historicalUpdate = new Date();
}

const MClient = new MarketClient(
    "gleinor_futures - @coupdegrace09214, github: https://github.com/CoupDeGrace92/glienor_futures",
    granularUpdate,
    historicalUpdate
)

let running = true;
process.on("SIGINT", () => {
    console.log("\nShutting down gracefully...");
    running = false
})

while (running) {
    const {granular, historic } = MClient.getUpdateTimes();
    await sleepUntil(new Date(Math.min(granular.getDate(), historic.getDate())));
    try{
        if (granular <= new Date()) {
            await populateGranular(MClient)
        }
        if (historic <= new Date()) {
            await populateHistoric(MClient)
        }
    } catch (err) {
        console.error("Error fetching data: ", err)
        //Add some time before trying to fetch again - probably want more complex handling logic here
    }
}

async function populateGranular(MClient: MarketClient) {
    let granularData: MarketData;
    try{
        granularData = await MClient.getAllItems()
    } catch (err) {
        console.error("Error fetching data: ", err)
        throw new Error("ERROR CAUGHT IN GRANULAR DATA")
    };
    const updateTimestamp = new Date(granularData.timestamp * 1000);
    if (isNaN(updateTimestamp.getTime())) {
        console.error("Error - timestamp could not be converted")
        throw new Error("ERROR CAUGHT IN GRANULAR DATA")
    }
    console.log(`[${new Date()}] - inserting granular data - [UPDATE AT: ${updateTimestamp}]`)
    await fastChunkedGranularInsert(granularData, updateTimestamp)
    console.log(`[${new Date()}] - Done inserting granular data`)
}

async function populateHistoric(MClient: MarketClient) {
    let historicData: MarketResponse;

    try{
        historicData = await MClient.getItemHist()
    } catch(err) {
        console.error("Error fetching data: ", err)
        throw new Error("ERROR CAUGHT IN HISTORICAL DATA")
    };
    if ("error" in historicData) {
        throw new Error(`Error fetching WierdGloop data: ${historicData.error}`)
    }
    let updateTimestamp: Date;
    
    if (typeof historicData["%JAGEX_TIMESTAMP%"] === "number") {
        updateTimestamp = new Date(historicData["%JAGEX_TIMESTAMP%"] * 1000)
    } else {
        throw new Error(`Update timestamp not present`)
    }

    console.log(`[${new Date()}] - inserting historic data - [UPDATE AT: ${updateTimestamp}]`)
    await fastChunkedHistoricInsert(historicData, updateTimestamp)
    console.log(`[${new Date()}] - Done inserting granular data`)
}


async function fastChunkedGranularInsert(rawDump: MarketData, timestamp: Date) {
    const chunkSize = 1000;
    let currentChunk = []

    const insertPromises: Promise<any>[] = []

    for (const [key, value] of Object.entries(rawDump.data)) {
        let entry: NewGranularPriceLogs = {
            lastUpdate: timestamp,
            id: Number(key),
            avgHighPrice: value.avgHighPrice,
            highPriceVolume: value.highPriceVolume,
            avgLowPrice: value.avgLowPrice,
            lowPriceVolume: value.lowPriceVolume
        }

        currentChunk.push(entry);
        delete(rawDump.data[Number(key)]);

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

async function fastChunkedHistoricInsert(rawDump: Record<string, number| WGMarketData>, timestamp: Date) {
    const chunkSize = 1000;
    let currentChunk = [];

    const insertPromises: Promise<any>[] = []

    for (const [key, value] of Object.entries(rawDump)) {
        if (typeof value === "number") {
            continue;
        }
        let id = Number(key)
        if (isNaN(id)) {
            console.log(`${key} could not be inserted into the hist items db`)
            throw new Error(`Entry does not have an id key: ${key}`)
        }
        let lastUpdate = new Date(value.timestamp)
        if (isNaN(lastUpdate.getTime())){
            throw new Error(`Entry's timestamp could not be read ${key}: ${value}`)
        }

        let entry: NewPriceHist = {
            id,
            lastUpdate,
            volume: value.volume,
            price: value.price
        }

        currentChunk.push(entry);
        delete(rawDump[key]);

        if (currentChunk.length >= chunkSize) {
            insertPromises.push(InsertHistData(currentChunk));
            currentChunk = [];
        }
    };

    if (currentChunk.length > 0) {
        insertPromises.push(InsertHistData(currentChunk));
    }

    await Promise.all(insertPromises)
}

async function sleepUntil(targetDate: Date): Promise<void> {
    const delay = targetDate.getTime() - Date.now();
    if (delay <= 0) {
        return
    };
    return new Promise(resolve => setTimeout(resolve, delay))
}