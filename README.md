<div align="center">

<img src="https://img.shields.io/badge/%F0%9F%A7%AD-VOYAGENT%20AI-FF6B6B?style=for-the-badge&labelColor=0C1130" height="46" />

# Voyagent AI
### Multi-Agent Travel Planner

*Boarding your itinerary, one agent at a time.* 🎫✈️🏨🗓️

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&size=20&duration=2500&pause=1000&colors=FF6B6B,FF9F5C,FFD166,4FC3F7,B388FF&center=true&vCenter=true&multiline=true&width=650&height=80&lines=Flights+%2B+Hotels+%2B+Itinerary+%E2%80%94+Auto-Assembled;Powered+by+LangGraph+Multi-Agent+Workflows;FastAPI+%C2%B7+Groq+%C2%B7+PostgreSQL+%C2%B7+Tavily" alt="Typing SVG" />

<br/>

![Coral](https://img.shields.io/badge/-FF6B6B?style=flat-square&color=FF6B6B) ![Sunset](https://img.shields.io/badge/-FF9F5C?style=flat-square&color=FF9F5C) ![Gold](https://img.shields.io/badge/-FFD166?style=flat-square&color=FFD166) ![Sky](https://img.shields.io/badge/-4FC3F7?style=flat-square&color=4FC3F7) ![Violet](https://img.shields.io/badge/-B388FF?style=flat-square&color=B388FF) ![Mint](https://img.shields.io/badge/-3DDC97?style=flat-square&color=3DDC97)

<br/>

[![Live Demo](https://img.shields.io/badge/🔗_LIVE_DEMO-Visit_App-FF6B6B?style=for-the-badge&labelColor=0C1130)](https://multi-agent-ai-travel-planner-1-u86f.onrender.com)
[![GitHub Repo](https://img.shields.io/badge/📦_Source-GitHub-FFD166?style=for-the-badge&labelColor=0C1130)](https://github.com/omkar834-droidk/Multi-Agent-AI-Travel-Planner)
[![License](https://img.shields.io/badge/⚖️_License-MIT-4FC3F7?style=for-the-badge&labelColor=0C1130)](LICENSE)

</div>

---

## 🌐 Live Demo

<div align="center">

### 🔗 **[multi-agent-ai-travel-planner-1-u86f.onrender.com](https://multi-agent-ai-travel-planner-1-u86f.onrender.com)**

| 🎫 Ask | 🤖 Agents Work | 📄 Get a Boarding Pass |
|:---:|:---:|:---:|
| Type your trip in plain English | Flight → Hotel → Itinerary → Final Agent | Download / copy your full plan |

</div>

---

## 🧭 What is Voyagent AI?

**Voyagent AI** is a multi-agent travel planning system. Give it a one-line request —
*"Plan a 7 day Japan trip from Bangladesh under 2 lakhs"* — and a crew of specialized
AI agents built with **LangGraph** work in sequence to search live flights, pull hotel
recommendations, build a day-by-day itinerary, and format it all into a clean, shareable
**boarding-pass styled itinerary**, downloadable as a PDF.

---

## 🏗️ Architecture

```mermaid
flowchart LR
    U([👤 User Request]) --> A[✈️ Flight Agent<br/><sub>AviationStack API</sub>]
    A --> B[🏨 Hotel Agent<br/><sub>Tavily Search</sub>]
    B --> C[🗓️ Itinerary Agent<br/><sub>Groq · LLaMA 3.3 70B</sub>]
    C --> D[📋 Final Response Agent<br/><sub>Formats Boarding Pass</sub>]
    D --> R([🎟️ Itinerary Delivered])

    subgraph Memory[" "]
    P[(PostgreSQL<br/>Checkpointer)]
    end

    A -.state.- P
    B -.state.- P
    C -.state.- P
    D -.state.- P

    style U fill:#FF6B6B,stroke:#0C1130,color:#0C1130
    style R fill:#FFD166,stroke:#0C1130,color:#0C1130
    style A fill:#151B4D,stroke:#FF6B6B,color:#fff
    style B fill:#151B4D,stroke:#FF9F5C,color:#fff
    style C fill:#151B4D,stroke:#FFD166,color:#fff
    style D fill:#151B4D,stroke:#4FC3F7,color:#fff
    style P fill:#B388FF,stroke:#0C1130,color:#0C1130
```

Each agent is a node in a **LangGraph `StateGraph`**, with a **PostgreSQL checkpointer**
persisting conversation state per `thread_id` — so a user can continue refining the same
trip across requests.

---

## 🧰 Tech Stack

<div align="center">

### 🧠 AI / Orchestration
![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logoColor=white)
![LLaMA](https://img.shields.io/badge/LLaMA%203.3%2070B-0467DF?style=for-the-badge&logo=meta&logoColor=white)
![LangSmith](https://img.shields.io/badge/LangSmith-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)

### ⚙️ Backend
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white)
![Uvicorn](https://img.shields.io/badge/Uvicorn-2A2A2A?style=for-the-badge&logo=gunicorn&logoColor=white)
![Jinja2](https://img.shields.io/badge/Jinja2-B41717?style=for-the-badge&logo=jinja&logoColor=white)

### 🗄️ Data & External APIs
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tavily](https://img.shields.io/badge/Tavily%20Search-FFD166?style=for-the-badge&logoColor=black)
![AviationStack](https://img.shields.io/badge/AviationStack-4FC3F7?style=for-the-badge&logoColor=black)

### 🎨 Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Leaflet](https://img.shields.io/badge/Leaflet.js-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![html2pdf](https://img.shields.io/badge/html2pdf.js-DA1F26?style=for-the-badge)
![Marked](https://img.shields.io/badge/Marked.js-000000?style=for-the-badge)

### ☁️ Deployment
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

</div>

---

## ✨ Features

- 🤖 **4-agent LangGraph pipeline** — Flight Agent → Hotel Agent → Itinerary Agent → Final Response Agent
- ✈️ **Live flight lookups** via AviationStack, with smart country/city → IATA resolution (`pycountry`, `airportsdata`)
- 🏨 **Hotel & sightseeing research** via Tavily web search
- 🧠 **LLM-generated day-by-day itinerary** using Groq's LLaMA 3.3 70B
- 💾 **Persistent conversation memory** — PostgreSQL-backed LangGraph checkpointer keyed by `thread_id`
- 🎫 **Boarding-pass styled UI** — colorful travel-poster theme, split-flap animated headline
- 🗺️ **Route preview map** with Leaflet.js + OpenStreetMap geocoding
- 📄 **One-click PDF export** and copy-to-clipboard of the final itinerary
- 🔍 **LangSmith tracing** for observability into agent runs

---

## 📂 Project Structure

```
Multi-Agent-AI-Travel-Planner/
├── app.py                  # FastAPI app — routes, static & template mounting
├── backend.py               # LangGraph StateGraph — agents + PostgreSQL checkpointer
├── tools/
│   ├── __init__.py
│   ├── flight_tool.py        # AviationStack integration + IATA resolution
│   └── tavily_tool.py        # Tavily web search wrapper
├── static/
│   ├── style.css              # Voyagent AI colorful UI theme
│   └── script.js               # Frontend logic, map, PDF export
├── templates/
│   └── index.html               # Main UI template
├── .env.example                   # Environment variable template
├── .gitignore
├── .dockerignore
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/omkar834-droidk/Multi-Agent-AI-Travel-Planner.git
cd Multi-Agent-AI-Travel-Planner
```

### 2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment variables
Create a `.env` file in the project root:

```env
DATABASE_URL=your_postgresql_connection_string
GROQ_API_KEY=your_groq_api_key
AVIATIONSTACK_API_KEY=your_aviationstack_api_key
TAVILY_API_KEY=your_tavily_api_key
DEFAULT_ORIGIN_IATA=DAC

LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_api_key
LANGSMITH_PROJECT=travel-agent
```

> ⚠️ Never commit your real `.env` file — keep it listed in `.gitignore` (already included).

### 5. Run the app
```bash
python app.py
```

Visit **http://127.0.0.1:8000** and start planning ✈️

---

## 🖥️ How It Works

1. User types a natural language trip request into the **Request Desk**.
2. `flight_agent` parses the route (city/country → IATA) and queries **AviationStack** for live flight data.
3. `hotel_agent` queries **Tavily** for hotel and sightseeing recommendations.
4. `itinerary_agent` (Groq LLaMA 3.3 70B) drafts a structured day-by-day plan.
5. `final_agent` formats everything into the final **Trip Summary → Flights → Hotels → Itinerary → Budget → Recommendations** response.
6. The frontend renders it as a **boarding pass**, plots a **route map**, and offers **PDF / copy export**.

---

## 🗺️ Roadmap

- [ ] Real fare pricing via Amadeus / Skyscanner API
- [ ] Hotel booking links + price comparison
- [ ] Multi-city itinerary support
- [ ] User accounts & saved trips
- [x] Deploy live demo 🔗

---

## 🧑‍💻 Author

**Omkar Salunke**

[![GitHub](https://img.shields.io/badge/GitHub-omkar834--droidk-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/omkar834-droidk)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Omkar%20Salunke-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/omkar-salunke-712696351)

---

<div align="center">

### ⭐ If you like this project, consider giving it a star!

![Coral](https://img.shields.io/badge/-FF6B6B?style=flat-square&color=FF6B6B) ![Sunset](https://img.shields.io/badge/-FF9F5C?style=flat-square&color=FF9F5C) ![Gold](https://img.shields.io/badge/-FFD166?style=flat-square&color=FFD166) ![Sky](https://img.shields.io/badge/-4FC3F7?style=flat-square&color=4FC3F7) ![Violet](https://img.shields.io/badge/-B388FF?style=flat-square&color=B388FF) ![Mint](https://img.shields.io/badge/-3DDC97?style=flat-square&color=3DDC97)

*Built with FastAPI · LangGraph · Groq · PostgreSQL · Tavily · AviationStack*

</div>
