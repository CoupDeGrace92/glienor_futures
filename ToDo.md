1. DB setup
2. Connect to OSRS DATA API
3. Slogging (superbuilders/slog)
4. Market Data endpoints - get data from OSRS apis
5. REACT/HTML/CSS
   1. Get a landing page up without components first
   2. THEN - add react components - market data on a selected item
6. Interactive portion - ability to buy/sell items
   1. User Dashboards - market trends
   2. User Portfolio Tools
7. Futures Market
   1. RabbitMQ?

DEPLOY - Figure out if I can self host for free on one of the old laptops - find a site address.





FOR THE MARKETCLIENT CLASS:
1. We want a headers field, not just userAgent for the one specific header, that way we can append headers as needed
    1. This should be in the form of:
        private userAgent: Record<string, string>
    2. We want the userAgent string to be user specific or admin specific
2. we may want baseUrl to be specifiable in some way, chisel.api.weirdgloop is there for the datadump.
3. the getItemLatest may want to allow us to include more search params:
    async getItemLatest(name: string, params?: Record<string, string>) instead of what we currently have
4. Create a type for item returns - the data set is in a JSON form we understand so we should create a type contract that needs to be fufilled.


FOR DATA - 
    DB - name, id, price, volume, updated_at
    This DB stores up to 24 hours of data, gets cleaned with a Go program every hour

    Long Term Data - stores snapshot from a specific time each day/rolling average (have to check how data is stored on market watch) - we store current datapoint as the current days price, then average for the rest.