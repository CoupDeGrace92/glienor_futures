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

const client = new MarketClient("glienor futures admin");
const data = await client.getItemLatest("abyssal whip");
if ("success" in data && !data.success) {
    console.error("API returned an error: ", data.error)
} else {
    for (const [name, item] of Object.entries(data)) {
        console.log(`${name} has a price of ${item.price} with a traded volume ${item.volume}`);
    }
}