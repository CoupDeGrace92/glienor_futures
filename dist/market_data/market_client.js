import { URL } from "node:url";
import { getIDFromName } from "../db/queries/items.js";
export class WGMarketClient {
    baseUrl;
    userAgent;
    constructor(userAgent) {
        this.baseUrl = "https://api.weirdgloop.org";
        this.userAgent = userAgent;
    }
    async fetchJSON(path, queries) {
        const url = path.startsWith("http")
            ? new URL(path)
            : new URL(path, this.baseUrl);
        //The above allows us to specify full urls that are not our basepaths for methods
        if (queries) {
            for (const [key, value] of Object.entries(queries)) {
                url.searchParams.append(key, value);
            }
        }
        try {
            const response = await fetch(url.toString(), {
                headers: { 'User-Agent': this.userAgent },
                method: "GET",
            });
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            return await response.json();
        }
        catch (err) {
            console.error(`Request to ${url.pathname} failed:`, err);
            throw err;
        }
    }
    async getLastUpdate() {
        return this.fetchJSON("/exchange");
    }
    ;
    async getItemLatest(name) {
        return this.fetchJSON("/exchange/history/osrs/latest", { "name": name });
    }
    ;
    async getAllItems() {
        return this.fetchJSON("https://chisel.weirdgloop.org/gazproj/gazbot/os_dump.json");
    }
    ;
}
;
///RuneLite / OSRS Wiki Real-Time price data
export class MarketClient {
    baseURL;
    userAgent;
    constructor(userAgent) {
        this.baseURL = "https://prices.runescape.wiki/api/v1/osrs/";
        this.userAgent = userAgent;
    }
    ;
    async fetchJSON(path, queries) {
        const url = path.startsWith("http")
            ? new URL(path)
            : new URL(path, this.baseURL);
        if (queries) {
            for (const [key, value] of Object.entries(queries)) {
                url.searchParams.append(key, value);
            }
        }
        try {
            const response = await fetch(url.toString(), {
                headers: { "User-Agent": this.userAgent },
                method: "GET"
            });
            if (!response.ok) {
                throw new Error(`Response status not ok: ${response.status}`);
            }
            return await response.json();
        }
        catch (err) {
            console.error(`Request to ${url.pathname} failed:`, err);
            throw err;
        }
    }
    async getItemLatest(name) {
        const id = await getIDFromName(name); //possible improvement to store name/id table in local mem
        return await this.fetchJSON("latest", { "id": id.toString() });
    }
    async getAllItems() {
        return await this.fetchJSON("5m");
    }
    async bootstrapItems() {
        return await this.fetchJSON("mapping");
    }
}
;
