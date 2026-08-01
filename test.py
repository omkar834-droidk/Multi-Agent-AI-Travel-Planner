from tools.tavily_tool import tavily_search

from tools.flight_tool import search_flights
from backend import run_travel_agent



# respons=tavily_search("best hotel in dubai")

# print(respons)



# response = search_flights("Plan a 7 days india trip from us")

# print(response)


user_input = input("Enter travel request: ")

response = run_travel_agent(
    user_input=user_input,
    thread_id="test_user"
)

print("\nFINAL RESPONSE:\n")
print(response["answer"])



# from dotenv import load_dotenv
# import os

# load_dotenv()

# print(os.getenv("DATABASE_URL"))
