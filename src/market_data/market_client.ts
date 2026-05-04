export type MarketUpdateTime = {
    rs: string
    osrs: string
};

export type MarketError = {
    success: boolean
    error: string
}

export type MarketData = {
    id: string
    timestamp: string
    price: number
    volume: number
}

export type MarketResponse = MarketData | MarketError;

export class MarketClient {
    private baseUrl: string;
    private userAgent: string;

    constructor(userAgent: string) {
        this.baseUrl = "https://api.weirdgloop.org";
        this.userAgent = userAgent;
    }

    private async fetchJSON<T>(path: string, queries?: Record<string, string>): Promise<T> {
        let url = new URL(path, this.baseUrl);
        
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

    async getLastUpdate(): Promise<MarketUpdateTime> {
        return this.fetchJSON<MarketUpdateTime>("/exchange");
    };

    async getItemLatest(name: string): Promise<MarketResponse> {
        return this.fetchJSON<MarketResponse>("/exchange/history/osrs/latest", {name: name})
    };
};
