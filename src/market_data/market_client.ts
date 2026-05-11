import { URL } from "node:url";
import { getIDFromName } from "../db/queries/items.js";

///Wierd Gloop Price data - dump from Jagex once per day
export type WGMarketUpdateTime = {
    rs: string
    osrs: string
};

export type WGMarketError = {
    success: boolean
    error: string
}

export type WGMarketData = {
    id: string
    timestamp: string
    price: number
    volume: number
}

export type MarketResponse = WGMarketData | WGMarketError;

export class WGMarketClient {
    private baseUrl: string;
    private userAgent: string;

    constructor(userAgent: string) {
        this.baseUrl = "https://api.weirdgloop.org";
        this.userAgent = userAgent;
    }

    private async fetchJSON<T>(path: string, queries?: Record<string, string>): Promise<T> {
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
                headers: {'User-Agent': this.userAgent},
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json() as T;
        } catch (err) {
            console.error(`Request to ${url.pathname} failed:`, err);
            throw err;
        }
    }

    async getLastUpdate(): Promise<WGMarketUpdateTime> {
        return this.fetchJSON<WGMarketUpdateTime>("/exchange");
    };

    async getItemLatest(name: string): Promise<MarketResponse> {
        return this.fetchJSON<MarketResponse>("/exchange/history/osrs/latest", {"name": name})
    };

    async getAllItems(): Promise<WGDumpData> {
        return this.fetchJSON<any>("https://chisel.weirdgloop.org/gazproj/gazbot/os_dump.json");
    };
};

export type WGDumpData = Record<string, WGDumpInfo | number> | WGMarketError;

export type WGDumpInfo = {
    name: string,
    examine: string,
    id: number,
    members: boolean,
    icon: string,
    price: number,
    last: number,
    volume: number,
};


///RuneLite / OSRS Wiki Real-Time price data
export class MarketClient {
    private baseURL: string;
    private userAgent: string;

    constructor(userAgent: string) {
        this.baseURL = "https://prices.runescape.wiki/api/v1/osrs/";
        this.userAgent = userAgent;
    };

    private async fetchJSON<T>(path: string, queries?: Record<string, string>): Promise<T> {
        const url = path.startsWith("http")
            ? new URL(path)
            : new URL(path, this.baseURL);

        if (queries) {
            for (const [key, value] of Object.entries(queries)) {
                url.searchParams.append(key,value)
            }
        }

        try {
            const response = await fetch(url.toString(), {
                headers: {"User-Agent": this.userAgent},
                method: "GET"
            })

            if (!response.ok) {
                throw new Error(`Response status not ok: ${response.status}`);
            }

            return await response.json() as T

        } catch (err) {
            console.error(`Request to ${url.pathname} failed:`, err);
            throw err;
        }
    }

    async getItemLatest(name: string): Promise<MarketData> {
        const id = await getIDFromName(name) //possible improvement to store name/id table in local mem
        return await this.fetchJSON<MarketData>("latest", {"id": id.toString()})
    }

    async getAllItems(): Promise<MarketData> {
        return await this.fetchJSON<MarketData>("5m")
    }

    async bootstrapItems(): Promise<ItemName[]> {
        return await this.fetchJSON<ItemName[]>("mapping")
    }

};

export type MarketData = {
    data: Record<number, ItemData>,
    timestamp: number, //This comes in as a UNIX timestamp - we convert it to ISO elsewhere
};

export type ItemData = {
    avgHighPrice: number | null,
    highPriceVolume: number,
    avgLowPrice: number | null,
    lowPriceVolume: number,
};

export type ItemName = {
    id: number,
    name: string
}