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
const popClient = new MarketClient("glienor futures data fetcher");
const d = await popClient.getAllItems();
if ("success" in d && !d.success) {
    console.error("API returned an error: ", d.error);
}
else {
    console.log(d);
}
