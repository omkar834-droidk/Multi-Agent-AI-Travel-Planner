let currentThreadId = localStorage.getItem("voyagent_thread_id") || null;
let latestAnswerMarkdown = "";
let routeMap = null;
const geocodeCache = {};

/* ============ SPLIT-FLAP HEADLINE ============ */
(function initSplitHeadline() {
    const el = document.getElementById("splitHeadline");
    if (!el) return;

    const text = el.textContent;
    el.textContent = "";

    text.split("").forEach((char, i) => {
        const span = document.createElement("span");
        span.className = "flap";
        span.style.animationDelay = `${i * 0.025}s`;
        span.textContent = char === " " ? "\u00A0" : char;
        el.appendChild(span);
    });
})();

/* ============ PROMPT HELPERS ============ */
function setPrompt(text) {
    document.getElementById("userInput").value = text;
    document.getElementById("userInput").focus();
}

const PIPELINE_STAGES = [
    "Supervisor is checking your request…",
    "Routing to the right specialist agents…",
    "Checking flights & airports…",
    "Scouting hotels…",
    "Reading the weather…",
    "Crunching the budget…",
    "Drafting your itinerary…"
];
let pipelineInterval = null;

function setLoading(isLoading) {
    const sendBtn = document.getElementById("sendBtn");
    const btnText = document.getElementById("btnText");
    const btnLoader = document.getElementById("btnLoader");
    const pipelineStatus = document.getElementById("pipelineStatus");

    sendBtn.disabled = isLoading;

    if (isLoading) {
        btnText.classList.add("hidden");
        btnLoader.classList.remove("hidden");

        let stageIndex = 0;
        pipelineStatus.textContent = PIPELINE_STAGES[0];
        pipelineStatus.classList.remove("hidden");

        pipelineInterval = setInterval(() => {
            stageIndex = (stageIndex + 1) % PIPELINE_STAGES.length;
            pipelineStatus.textContent = PIPELINE_STAGES[stageIndex];
        }, 1800);
    } else {
        btnText.classList.remove("hidden");
        btnLoader.classList.add("hidden");

        if (pipelineInterval) {
            clearInterval(pipelineInterval);
            pipelineInterval = null;
        }
        pipelineStatus.classList.add("hidden");
    }
}

function showError(message) {
    const errorBox = document.getElementById("errorBox");
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
    errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideError() {
    const errorBox = document.getElementById("errorBox");
    errorBox.classList.add("hidden");
    errorBox.textContent = "";
}

/* ============ TRIP INFO EXTRACTION (for the boarding pass stub) ============ */
function extractTripInfo(message) {
    const info = { from: null, to: null, days: null, budget: null };

    const dayMatch = message.match(/(\d+)\s*days?/i);
    if (dayMatch) info.days = `${dayMatch[1]} Days`;

    const budgetMatch = message.match(/(?:under|within|budget of)?\s*([\d,.]+)\s*(lakhs?|lakh|k|thousand|usd|\$|taka|bdt)/i);
    if (budgetMatch) {
        info.budget = `${budgetMatch[1]} ${budgetMatch[2]}`.trim().toUpperCase();
    }

    const fromMatch = message.match(/from\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/);
    if (fromMatch) info.from = fromMatch[1];

    const toTripMatch = message.match(/([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)\s+trip/i);
    const toWordMatch = message.match(/\bto\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/);
    if (toWordMatch) {
        info.to = toWordMatch[1];
    } else if (toTripMatch) {
        info.to = toTripMatch[1];
    }

    return info;
}

function cityCode(name) {
    if (!name) return "—";
    return name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "—";
}

function updateBoardingPass(info, threadId) {
    document.getElementById("bpFromCode").textContent = cityCode(info.from) || "—";
    document.getElementById("bpFromName").textContent = info.from || "Origin";

    document.getElementById("bpToCode").textContent = cityCode(info.to) || "—";
    document.getElementById("bpToName").textContent = info.to || "Destination";

    document.getElementById("bpDuration").textContent = info.days || "—";
    document.getElementById("bpBudget").textContent = info.budget || "Flexible";

    document.getElementById("threadInfo").textContent = threadId || "—";
}

/* ============ ROUTE MAP ============ */
async function geocodeCity(name) {
    if (!name) return null;
    const key = name.toLowerCase();

    if (geocodeCache[key]) return geocodeCache[key];

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(name)}`
        );
        const results = await response.json();

        if (!results || results.length === 0) return null;

        const coords = {
            lat: parseFloat(results[0].lat),
            lon: parseFloat(results[0].lon),
            label: results[0].display_name.split(",")[0]
        };

        geocodeCache[key] = coords;
        return coords;
    } catch (err) {
        return null;
    }
}

async function updateRouteMap(info) {
    const mapSection = document.getElementById("mapSection");
    const mapCaption = document.getElementById("mapCaption");

    if (!info.to) {
        mapSection.classList.add("hidden");
        return;
    }

    const [originCoords, destCoords] = await Promise.all([
        geocodeCity(info.from),
        geocodeCity(info.to)
    ]);

    if (!destCoords) {
        mapSection.classList.add("hidden");
        return;
    }

    mapSection.classList.remove("hidden");

    if (!routeMap) {
        routeMap = L.map("routeMap", {
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18
        }).addTo(routeMap);
    } else {
        routeMap.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                routeMap.removeLayer(layer);
            }
        });
    }

    const destIcon = L.divIcon({
        className: "",
        html: '<div style="background:#FFB020;width:14px;height:14px;border-radius:50%;border:2px solid #0A0E17;"></div>',
        iconSize: [14, 14]
    });
    const originIcon = L.divIcon({
        className: "",
        html: '<div style="background:#22D3B0;width:14px;height:14px;border-radius:50%;border:2px solid #0A0E17;"></div>',
        iconSize: [14, 14]
    });

    L.marker([destCoords.lat, destCoords.lon], { icon: destIcon }).addTo(routeMap);

    if (originCoords) {
        L.marker([originCoords.lat, originCoords.lon], { icon: originIcon }).addTo(routeMap);

        const line = L.polyline(
            [[originCoords.lat, originCoords.lon], [destCoords.lat, destCoords.lon]],
            { color: "#FFB020", weight: 2, dashArray: "6 6" }
        ).addTo(routeMap);

        routeMap.fitBounds(line.getBounds(), { padding: [30, 30] });
        mapCaption.textContent = `${originCoords.label} → ${destCoords.label}`;
    } else {
        routeMap.setView([destCoords.lat, destCoords.lon], 5);
        mapCaption.textContent = destCoords.label;
    }
}

/* ============ AGENT TRACE / INTELLIGENCE PANEL ============ */
const AGENT_META = [
    { key: "flight_agent", label: "Flights", icon: "✈️" },
    { key: "hotel_agent", label: "Hotels", icon: "🏨" },
    { key: "weather_agent", label: "Weather", icon: "🌤️" },
    { key: "budget_agent", label: "Budget", icon: "💰" },
    { key: "itinerary_agent", label: "Itinerary", icon: "🗓️" }
];

function renderAgentChips(selectedAgents) {
    const container = document.getElementById("agentChips");
    const selected = new Set(selectedAgents || []);

    container.innerHTML = AGENT_META.map(agent => {
        const isActive = selected.has(agent.key);
        const cls = isActive ? "agent-chip active" : "agent-chip";
        return `<span class="${cls}">${agent.icon} ${agent.label}</span>`;
    }).join("");
}

function renderWeatherCard(weatherResults) {
    const card = document.getElementById("weatherCard");
    const body = document.getElementById("weatherBody");

    if (!weatherResults || !weatherResults.trim()) {
        card.classList.add("hidden");
        return;
    }

    body.textContent = weatherResults.trim();
    card.classList.remove("hidden");
}

function renderBudgetCard(budgetResults) {
    const card = document.getElementById("budgetCard");
    const body = document.getElementById("budgetBody");

    if (!budgetResults || !budgetResults.trim()) {
        card.classList.add("hidden");
        return;
    }

    if (typeof marked !== "undefined") {
        body.innerHTML = marked.parse(budgetResults);
    } else {
        body.innerText = budgetResults;
    }

    card.classList.remove("hidden");
}

function renderAgentTrace(data) {
    const traceSection = document.getElementById("agentTraceSection");
    const reasoningNote = document.getElementById("reasoningNote");

    renderAgentChips(data.selected_agents);
    renderWeatherCard(data.weather_results);
    renderBudgetCard(data.budget_results);

    if (data.supervisor_reasoning && data.supervisor_reasoning.trim()) {
        reasoningNote.textContent = `Why these agents: ${data.supervisor_reasoning.trim()}`;
        reasoningNote.classList.remove("hidden");
    } else {
        reasoningNote.classList.add("hidden");
    }

    traceSection.classList.remove("hidden");
}

function hideAgentTrace() {
    document.getElementById("agentTraceSection").classList.add("hidden");
}


function showResult(data, tripInfo) {
    latestAnswerMarkdown = data.answer;

    const approvalSection = document.getElementById("approvalSection");
    if (approvalSection) approvalSection.classList.add("hidden");

    const resultSection = document.getElementById("resultSection");
    const resultBox = document.getElementById("resultBox");

    if (typeof marked !== "undefined") {
        resultBox.innerHTML = marked.parse(data.answer);
    } else {
        resultBox.innerText = data.answer;
    }

    updateBoardingPass(tripInfo, data.thread_id);
    renderAgentTrace(data);

    resultSection.classList.remove("hidden");
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ============ HUMAN-IN-THE-LOOP APPROVAL ============ */
let pendingTripInfo = { from: null, to: null, days: null, budget: null };

function showApprovalPanel(data, tripInfo) {
    pendingTripInfo = tripInfo;

    const resultSection = document.getElementById("resultSection");
    resultSection.classList.add("hidden");

    const approvalSection = document.getElementById("approvalSection");
    const approvalNote = document.getElementById("approvalNote");
    const draftBox = document.getElementById("draftItineraryBox");
    const feedbackInput = document.getElementById("feedbackInput");

    approvalNote.textContent = data.approval_request ||
        "Please review the draft itinerary below.";

    const draftText = data.itinerary || data.answer || "";

    if (typeof marked !== "undefined") {
        draftBox.innerHTML = marked.parse(draftText);
    } else {
        draftBox.innerText = draftText;
    }

    feedbackInput.value = "";

    renderAgentTrace(data);

    approvalSection.classList.remove("hidden");
    approvalSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setApprovalLoading(isLoading) {
    document.getElementById("approveBtn").disabled = isLoading;
    document.getElementById("reviseBtn").disabled = isLoading;
}

async function resumeTravel(approved) {
    if (!currentThreadId) {
        showError("No active plan to resume. Please submit a new request.");
        return;
    }

    hideError();
    setApprovalLoading(true);

    const feedback = document.getElementById("feedbackInput").value.trim();

    try {
        const response = await fetch("/api/travel/resume", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                thread_id: currentThreadId,
                approved: approved,
                feedback: feedback
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "Something went wrong while resuming the plan.");
        }

        if (data.requires_approval) {
            // Revised draft is ready for another round of review.
            showApprovalPanel(data, pendingTripInfo);
        } else {
            showResult(data, pendingTripInfo);
        }

    } catch (error) {
        showError(error.message);
    } finally {
        setApprovalLoading(false);
    }
}

function approveItinerary() {
    resumeTravel(true);
}

function requestRevision() {
    const feedback = document.getElementById("feedbackInput").value.trim();

    if (!feedback) {
        showError("Please add a note on what to change before requesting a revision.");
        return;
    }

    resumeTravel(false);
}

/* ============ SEND MESSAGE ============ */
async function sendMessage() {
    hideError();

    const input = document.getElementById("userInput");
    const message = input.value.trim();

    if (!message) {
        showError("Please enter your travel request first.");
        return;
    }

    setLoading(true);

    document.getElementById("approvalSection").classList.add("hidden");
    document.getElementById("resultSection").classList.add("hidden");
    hideAgentTrace();

    const tripInfo = extractTripInfo(message);
    updateRouteMap(tripInfo);

    try {
        const response = await fetch("/api/travel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                thread_id: currentThreadId
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "Something went wrong.");
        }

        currentThreadId = data.thread_id;
        localStorage.setItem("voyagent_thread_id", currentThreadId);

        if (data.guardrail_allowed === false) {
            hideAgentTrace();
            showError(data.guardrail_reason || data.answer || "This request is outside travel planning.");
        } else if (data.requires_approval) {
            showApprovalPanel(data, tripInfo);
        } else {
            showResult(data, tripInfo);
        }

    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

/* ============ COPY / DOWNLOAD ============ */
function copyResult() {
    const resultBox = document.getElementById("resultBox");
    const text = resultBox.innerText;

    if (!text) return;

    navigator.clipboard.writeText(text)
        .then(() => {
            const copyBtn = document.querySelector(".copy-btn");
            const oldText = copyBtn.textContent;
            copyBtn.textContent = "Copied!";
            setTimeout(() => {
                copyBtn.textContent = oldText;
            }, 1400);
        })
        .catch(() => {
            showError("Could not copy result.");
        });
}

function downloadPDF() {
    const pdfContent = document.getElementById("pdfContent");

    if (!latestAnswerMarkdown || !pdfContent) {
        showError("No travel plan available to download.");
        return;
    }

    const downloadBtn = document.querySelector(".download-btn");
    const oldText = downloadBtn.textContent;

    downloadBtn.textContent = "Preparing PDF...";
    downloadBtn.disabled = true;

    const options = {
        margin: 0.5,
        filename: "voyagent-ai-boarding-pass.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    };

    html2pdf()
        .set(options)
        .from(pdfContent)
        .save()
        .then(() => {
            downloadBtn.textContent = oldText;
            downloadBtn.disabled = false;
        })
        .catch(() => {
            downloadBtn.textContent = oldText;
            downloadBtn.disabled = false;
            showError("Could not download PDF.");
        });
}

document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "Enter") {
        sendMessage();
    }
});