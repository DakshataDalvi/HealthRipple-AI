# HealthRipple AI

> **Simulate. Understand. Prepare.**

An AI-powered healthcare network resilience simulator that shows administrators how a disruption at one Primary Health Centre (PHC) cascades through the surrounding network.

---

## Problem

When a Primary Health Centre experiences a disruption — a medicine runs out, staff fall ill, patient volumes spike, or a facility closes — the impact rarely stays contained. Patients redistribute. Nearby PHCs absorb extra load. Medicine demand spikes. Secondary facilities inch toward critical capacity.

These cascades are largely invisible to administrators until they become crises.

**HealthRipple AI makes them visible — before they happen.**

---

## Solution

HealthRipple AI is a decision-support simulation prototype that:

1. Lets administrators select a PHC and define a disruption scenario
2. Runs a deterministic cascading simulation across the PHC network
3. Shows patient redistribution flows, capacity pressure, and secondary risks on an interactive map
4. Calls Google Gemini AI to generate a plain-language action plan with prioritised recommendations

---

## Key Features

| Feature | Description |
|---|---|
| **4 Disruption Scenarios** | Medicine Shortage, PHC Closure, Patient Demand Surge, Staff Shortage |
| **Cascading Engine** | Rule-based, deterministic, two-hop propagation with gravity-weighted redistribution |
| **Interactive Network Map** | Leaflet/OpenStreetMap with colour-coded markers and directional flow arrows |
| **Severity Control** | Low / Medium / High adjusts the magnitude of disruption and patient overflow |
| **AI Action Plan** | Gemini AI interprets simulation output and generates 4–5 prioritised recommendations |
| **Follow-up Chat** | Ask Gemini context-aware follow-up questions grounded in the simulation data |
| **What-If Rerun** | Change parameters and re-run without leaving the Results page |
| **PHC Network Table** | Searchable/filterable table of all 25 simulated PHCs |
| **Demo Scenario** | Pre-filled: PHC-07 / Amoxicillin shortage / 5 days — works immediately |

---

## Architecture

```
src/
├── data/
│   └── phcData.js          ← 25 simulated PHCs (coordinates, staff, medicines, status)
├── engine/
│   └── simulationEngine.js ← Deterministic cascading simulation (no ML, pure JS)
├── services/
│   └── geminiService.js    ← Gemini API client (prompt builder, retry, JSON parser)
├── components/
│   ├── Layout.jsx           ← Sidebar + top bar shell
│   ├── PHCMap.jsx           ← Leaflet map (Overview)
│   ├── SimulationMap.jsx    ← Simulation-aware map with flow arrows (Results)
│   ├── PHCDetailPanel.jsx   ← PHC detail side panel
│   ├── SimulationForm.jsx   ← Config form with severity/duration controls
│   ├── AIActionPlan.jsx     ← Gemini action plan UI (4 states: idle/loading/success/error)
│   └── StatusBadge.jsx      ← Stable / At Risk / Critical badge
└── pages/
    ├── Overview.jsx         ← Network map + quick-run form
    ├── Simulate.jsx         ← 4-step simulation configuration
    ├── PHCNetwork.jsx       ← Searchable PHC table
    ├── Results.jsx          ← Full results page with map, charts, AI plan
    └── About.jsx            ← Methodology, assumptions, disclaimer
```

**Data flow:**
```
User configures scenario
       ↓
simulationEngine.js (deterministic, ~1ms)
       ↓
Results page (map + charts + table)
       ↓  [user clicks "Generate AI Action Plan"]
geminiService.js → Gemini 2.0 Flash API
       ↓
AIActionPlan component (structured 6-section plan)
```

---

## Google AI / Gemini Usage

Gemini is used as an **intelligence layer on top of deterministic simulation results**. It does not replace or generate numerical data.

**What Gemini receives:**
- Disruption type, affected PHC, duration, severity
- Patient redistribution flows (from → to, volume)
- Capacity utilisation at each affected PHC
- Medicine stock/demand changes
- Secondary-risk PHC list
- Propagation timeline

**What Gemini produces:**
- Situation Summary (2–3 sentences)
- Primary & Secondary Impact analysis
- 3–5 Prioritised Recommended Actions with rationale
- Priority Facilities list
- "Why This Matters" cascading effect explanation

**Explicit grounding instruction:** Gemini is instructed to use only the supplied simulation data and to say so rather than invent information.

**Model:** `gemini-2.0-flash`  
**Temperature:** `0.3` (low, to reduce hallucination)  
**Retry:** 2 retries with exponential backoff for rate limits / network errors

---

## Dataset / Data Generation

> ⚠ **All PHC data is entirely simulated.** No real patient records, government health data, or live operational data has been used.

The prototype uses synthetic data for **25 Primary Health Centres** across Nashik district, Maharashtra, with:

- Realistic lat/lng coordinates within the district
- Patient volumes: 50–145 patients/day (based on typical rural PHC ranges)
- Bed capacity: 20–50 beds
- Staff: 1–3 doctors, 3–10 nurses
- Medicine inventory: 5 medicines per PHC with stock and daily demand
- Pre-assigned `nearbyPHCIds` for network topology
- Initial status: stable / at-risk / critical (mix)

**Why Nashik?** It has both urban and rural PHCs across a range of talukas, making it a geographically interesting prototype setting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Map | React-Leaflet 5 + OpenStreetMap |
| Charts | Recharts 3 |
| AI | Google Gemini 2.0 Flash (REST API) |
| Icons | Lucide React |
| Deployment | Vercel |
| Database | None (all data is in-memory for this prototype) |

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm 9+
- A Google Gemini API key (get one free at [aistudio.google.com](https://aistudio.google.com/app/apikey))

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd healthripple-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your Gemini API key

# 4. Start the development server
npm run dev

# 5. Open http://localhost:5173
```

### Quick demo

The application ships with a pre-configured demo scenario:
- **PHC:** Chandwad PHC (PHC-07)
- **Disruption:** Medicine Shortage
- **Medicine:** Amoxicillin
- **Duration:** 5 days
- **Severity:** Medium

Navigate to **Simulate** and click **Run Simulation** to see the full cascade.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_GEMINI_API_KEY` | Yes (for AI) | Google Gemini API key |

Create a `.env` file in the project root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Security note:** The API key is read from `import.meta.env.VITE_GEMINI_API_KEY` at build time. For production, consider proxying the Gemini API through a server-side function to prevent key exposure in the browser bundle. The `.env` file is excluded from git via `.gitignore`.

---

## Vercel Deployment

1. Push the project to a GitHub repository
2. Import the repository in [Vercel](https://vercel.com)
3. Add the environment variable in Vercel's dashboard:
   - **Key:** `VITE_GEMINI_API_KEY`
   - **Value:** your Gemini API key
4. Deploy

The `dist/` build output is auto-detected by Vercel.

---

## Limitations

- **Simulated data only** — not connected to any real health information system
- **No authentication** — this prototype does not implement login or access control
- **No persistence** — simulation results are held in React state and lost on page refresh
- **Single district** — the district selector is cosmetic; all data is for Nashik
- **Static network topology** — `nearbyPHCIds` are pre-defined; dynamic topology is not modelled
- **No temporal modelling** — the engine computes a steady-state snapshot, not day-by-day changes
- **AI key in client bundle** — for this hackathon prototype, the Gemini key is used client-side; a production implementation would proxy through a backend

---

## Future Scalability

- **Real data integration** — connect to HMIS or NHA APIs for live PHC data
- **Server-side Gemini proxy** — protect the API key and add caching
- **Supabase backend** — persist simulation runs, enable comparison over time
- **Multi-district** — parametric data model works for any Indian district
- **More disruption types** — equipment failure, power outage, flood/disaster events
- **Validated thresholds** — calibrate risk percentages with domain experts
- **Temporal simulation** — day-by-day propagation model for multi-week scenarios
- **Export** — PDF/CSV report generation for administrative use
- **Mobile** — responsive optimisation for field use on tablets

---

## Disclaimer

HealthRipple AI is a **hackathon decision-support simulation prototype**. It does not predict real-world healthcare outcomes, does not constitute medical advice, and must not be used to make clinical or administrative decisions without validation against real operational data.

---

*Built for Build with AI Communities Hackathon · Nashik District · Maharashtra*
