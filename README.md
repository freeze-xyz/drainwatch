# DrainWatch — Weather-Triggered Community Drain Readiness

> **OneAquaHealth IEEE Global Hackathon 2026**  
> **Primary Track**: Track 6 — Resilience Informatics  
> **Target Scenario**: Batu Pahat, Johor, Malaysia (Monsoon Storm Readiness)  
> **Persistent Disclaimer**: *Prototype using simulated starter reports. Not an official flood warning or emergency service.*

---

## 1. Project Overview

**DrainWatch** is an explainable, mobile-first community web prototype designed to help local residents, neighborhood gotong-royong groups, and municipal coordinators prepare for heavy rainfall events. 

Rather than relying on black-box predictions or waiting for surface water to pool into emergencies, DrainWatch combines **real location-based precipitation forecast data** from Open-Meteo with **geo-tagged citizen reports of visible drainage blockages** (e.g. leaf litter, trash buildup, damaged culvert walls) to dynamically compute an **explainable priority score** for safe inspection before the storm arrives.

---

## 2. The Real Problem Addressed

In many Southeast Asian urban and suburban corridors like Batu Pahat, Johor, localized street inundation often occurs not because regional drainage capacity is fundamentally exceeded, but because **minor, visible surface obstructions choke street inlets, culverts, and grating slots** immediately prior to downpours.

### Challenges in Current Practice:
1. **Coordination Lag**: Municipal maintenance crews cannot inspect every minor neighborhood inlet before a storm.
2. **Citizen Frustration**: Residents observe clogged drains but have no structured channel to coordinate safe verification or understand which issues are most urgent given incoming rainfall.
3. **Data Disconnect**: Weather forecasts exist in isolation from community physical infrastructure reports.

### The DrainWatch Solution:
DrainWatch bridges this gap by automatically elevating the priority of reported blockages when an Open-Meteo forecast indicates incoming moderate or heavy rainfall, guiding communities toward **safe, proactive verification** before precipitation starts.

---

## 3. Product Boundaries & Safety Principles

DrainWatch enforces strict product and ethical boundaries:
- **Scenario-based community readiness prototype**: It is NOT an official flood warning, flood prediction, drainage asset map, emergency service, or authority-reporting system. Starter reports and locations are simulated and illustrative.
- **Wording Standard**: Strictly uses *"rain readiness," "reported drainage issue," "priority for safe verification,"* and *"forecast-based context."* Never claims flood prediction.
- **Safety Directive**: Community observers are instructed to **never enter drains or floodwater**, and to report dangerous or persistent obstructions directly to local authorities (such as Majlis Perbandaran Batu Pahat - MPBP). DrainWatch does not transmit reports to any authority.
- **Public Location Observation**: All submissions require observer confirmation that data was recorded safely from public walkways or curbs.
- **Privacy Safeguards**: Observers must avoid photographing identifiable people, private homes, vehicle license plates, or sensitive installations.

---

## 4. Photo-Supported Evidence & Trust Architecture

Photo evidence is treated as a **core trust feature**, not an optional decoration. Photos are termed **"photo-supported evidence"** rather than "proof" or "authentication," preserving human/community verification.

### Evidence States:
1. `needs_evidence`: Text-only report (permitted only for Minor severity). Capped below Critical ($P \le 13$) and cannot trigger 1 km nearby readiness notices.
2. `photo_submitted`: At least one photo attached with timestamp and coordinates (+2 evidence points if $\le 7$ days).
3. `community_confirmed`: Community-confirmed — independent confirmation recorded by a secondary observer via *"Confirm current condition"* (+2 confirmation points).
4. `coordinator_verified`: Inspected by a local neighborhood coordinator.
5. `resolved`: Cleared or verified safe (-10 deduction).

### Photo Freshness & 1 km Readiness Notices:
- **7-Day Freshness Window**: Photos are considered current only if uploaded within the last 7 days.
- **Outdated Notice**: Older photos display: *“Photo may be outdated — update requested”* and forfeit evidence points.
- **1 km Nearby Readiness Notice**: Only a current (≤7d), photo-supported active/confirmed report can trigger a 1 km nearby readiness notice.

---

## 5. Deterministic Scoring Methodology

$$P = \text{Severity} + \text{Weather} + \text{Age} + \text{PhotoEvidence} + \text{Confirmation} + \text{Vulnerability} - \text{Resolution}$$

| Component | Condition / Value | Score Contribution |
| :--- | :--- | :--- |
| **Issue Severity** | `overflowing` | **+8** |
| | `blocked` | **+6** |
| | `damaged` | **+5** |
| | `partial_blockage` | **+3** |
| **Weather Context** | Heavy rain forecast (> 20 mm / 24h) | **+6** |
| *(Open-Meteo API)* | Moderate rain forecast (5–20 mm / 24h) | **+3** |
| | Low rain forecast (< 5 mm / 24h) | **+0** |
| **Report Age** | Older than 7 days (persistent) | **+3** |
| | 4–7 days | **+2** |
| | 1–3 days | **+1** |
| | Younger than 24 hours | **+0** |
| **Photo Evidence** | Current photo evidence (uploaded $\le 7$ days) | **+2** |
| | Photo outdated (> 7 days) or missing | **+0** |
| **Confirmations** | Community confirmation by 2nd observer (or $\ge 2$ confirms) | **+2** |
| | < 2 confirmations | **+0** |
| **Vulnerability** | Near residential homes, school, clinic, or pedestrian route | **+2** |
| | None of the above | **+0** |
| **Resolution Status** | `resolved` | **-10** |
| | `verified` or marked as reported by user | **-2** |
| | `active` | **-0** |
| **Evidence Cap** | `needs_evidence` state capped below Critical | **Max 13 (High)** |

### Priority Thresholds:
- **Critical** ($P \ge 14$): Red pin with pulsing radar ring; requires current photo-supported evidence.
- **High** ($10 \le P \le 13$): Orange pin; heightened readiness required.
- **Medium** ($6 \le P \le 9$): Amber pin; standard inspection queue.
- **Low** ($P \le 5$): Blue/grey pin; low immediate consequence.
- **Resolved**: Green pin; verified cleared by neighborhood or municipal crew.

---

## 6. User Workflow

1. **Review Rain Readiness**: Check the weather readiness banner (Low, Moderate, Heavy) and 24h precipitation forecast for Batu Pahat.
2. **1 km Nearby Readiness Notice**: Detects active, photo-supported issues within 1.0 km of the current or selected location.
3. **Inspect Priority Locations**: Browse the Leaflet map and ranked priority side panel. Click any marker or list card to open the explainable breakdown.
4. **Take Action**:
   - **Confirm Current Condition**: A secondary observer endorses the report, updating status to `community_confirmed` (+2 points).
   - **Marked as Reported by User**: Logs that an observer contacted municipal channels (not transmitted by app).
   - **Mark Resolved**: Records that the inlet was cleared, deducting 10 points and marking the pin green.
5. **Submit Report / Map Asset**:
   - **Map Drainage Asset**: Requires timestamped photo evidence and GPS coordinates, labeled *“Community-mapped — requires verification.”*
   - **Report Issue**: Moderate and Severe issues require photo upload. Minor issues without photo are marked *“Needs photo evidence”* and capped below Critical.
6. **Interactive Demo Mode**:
   - **"Demo: Add Priority Report"**: Injects a severe blocked drain near homes with recent timestamp and photo that immediately claims the #1 Critical spot.
   - **"Scenario Switcher"**: Test Live weather, Heavy Rain (>20mm), Moderate Rain (12mm), or Low Rain (<5mm) to observe dynamic re-ranking.
   - **"Reset Demo Data"**: Restores the 5 pristine starter reports in Batu Pahat.

---

## 6. Seed Dataset (Batu Pahat, Johor)

All seed reports are clearly marked: *"Demo workspace — simulated citizen reports. Location points are illustrative."*
1. **Community Park Drain** (Jalan Tasik): Partial blockage, moderate, 2 days ago, pedestrian route.
2. **Riverside Walk Inlet** (Sungai Batu Pahat): Overflowing surcharging drain, severe, 6 hours ago, near homes.
3. **Market Lane Culvert** (Pasar Besar area): Heavily blocked box culvert, severe, 5 days ago, near homes & school, reported to authority.
4. **Campus Access Drain** (Jalan Universiti): Damaged concrete wall & grate, moderate, 9 days ago, school & pedestrian route, verified.
5. **Housing Area Storm Drain** (Taman Soga): Silt trap issue, minor, 12 hours ago, resolved.

---

## 7. Technologies Used

- **Frontend Framework**: React 18 + Vite (JavaScript).
- **Styling**: Tailwind CSS (custom environmental resilience palette: Navy `#001f54`, Ocean Teal `#1282a2`, Sky Blue `#0284c7`, Amber `#f59e0b`, Red `#ef4444`, Green `#10b981`).
- **Mapping**: Leaflet + OpenStreetMap tile layer (100% open source, zero paid APIs, custom colored SVG markers).
- **Weather API**: Open-Meteo Forecast API (`hourly=precipitation`, 24h calculated sum, no API key required).
- **State & Storage**: Browser `localStorage` (offline resilient, no cloud database or credentials needed).
- **Icons**: `lucide-react`.

---

## 8. Data Sources & Attribution

- **Weather Forecasts**: Weather data by [Open-Meteo.com](https://open-meteo.com) under CC BY 4.0.
- **Cartography & Map Tiles**: Map data &copy; [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) under ODbL.
- **Hackathon Context**: OneAquaHealth IEEE Global Hackathon 2026.

---

## 9. Local Setup & Deployment

### Prerequisites
- Node.js v18+ (tested on Node v20.18.0)
- npm v9+

### Setup Commands
```bash
# 1. Clone or navigate to the directory
cd drainwatch

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

### Deployment to Vercel or Netlify
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: **None required** (Zero configuration needed).

---

## 10. Verification & Automated Testing

A dedicated test suite is included in `test_engine.js`:
```bash
node test_engine.js
```
Verifies:
- All 5 starter seed records meet schema constraints.
- Precipitation status thresholds (Low <5mm, Moderate 5-20mm, Heavy >20mm).
- Mathematical correctness of the Priority Score formula across various conditions.
- Explainability string generation and safety wording enforcement.
