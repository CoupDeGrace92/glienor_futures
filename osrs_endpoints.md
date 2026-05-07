To get all price data:

SET DESCRIPTIVE USER AGENT FOR THE REQUESTS

GET https://oldschool.runescape.wiki/?title=Module:GEPrices/data.json&action=raw&ctype=application%2Fjson

    This endpoint reports all current item prices in OSRS in key-value json pairs


ENDPOINTS BELOW ARE AT: api.weirdgloop.org/
Here is an example get request for a single item endpoint by name:

curl -x 'GET' 'http://api.weirdgloop.org/exchange/history/osrs/latest?<query params>
    e.g. 
    curl -X 'GET' \
  'https://api.weirdgloop.org/exchange/history/osrs/latest?name=dragon%20dagger' \
  -H 'accept: application/json'

The above would get a JSON response with price and volume data for a dragon dagger


For historical price data for a single item - 
/exchange/history/{game}/{filters}

For this usecase, we can also specify the filter compress=true so that all responses are in the form of { <Query Param>: [[time/price touple], [time/price touple]]}
This compression minimizes the size of the data structure since it does not have to return the id/name each run


The most recent time for an update can be accessed at:
http://api.weirdgloop.org/exchange


BULK DATA DUMP - https://chisel.weirdgloop.org/gazproj/gzbot/os_dump.json
USE A USER AGENT HEADER OR THIS WILL NOT WORK
These dumps occur around every 10 minutes and contain more information than just the name/price combo


THESE ENDPOINTS SHOULD BE SUFFICIENT FOR WHAT I WANT TO DO


HOWEVER - there are also endpoints at https://secure.runescape.com/m=itemdb_oldschool/api/...
More information available at:
runescape.wiki/w/Application_programming_interface

This is where we can get object sprites too in addition to other information so we can populate our graphs with the image as well.