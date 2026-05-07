export class MarketClient {
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
        return this.fetchJSON("/exchange/history/osrs/latest", { name: name });
    }
    ;
    async getAllItems() {
        return this.fetchJSON("https://chisel.weirdgloop.org/gazproj/gazbot/os_dump.json");
    }
}
;
