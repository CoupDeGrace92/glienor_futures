import { BootstrapItemName } from "../db/queries/items.js";
import { MarketClient } from "./market_client.js";

const client = new MarketClient(
    "gleinor_futures - @coupdegrace09214, github: https://github.com/CoupDeGrace92/glienor_futures",
    new Date(), //Should be changed if we ever want to bootstrap granular data
    new Date(), //Should be changed if we ever are bootsrapping historical data with this client
    new Date(),
    new Date()
);

try {
    const data = await client.bootstrapItems()
    await BootstrapItemName(data)
    console.log("finished populating item db")
} catch (err) {
    throw new Error(`Something went wrong populating the items table: ${err}`)
}