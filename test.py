from tools.tavily_tool import tavily_search

from tools.flight_tool import search_flights


# respons=tavily_search("best hotel in dubai")

# print(respons)



response = search_flights("Plan a 7 days india trip from us")

print(response)

