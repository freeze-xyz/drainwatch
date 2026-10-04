# DrainWatch: Stormwater &amp; Litter Watch

> **OneAquaHealth IEEE Global Hackathon 2026**  
> **Primary Track**: Track 6 — Resilience Informatics  
> **Subtitle**: *Community stormwater and litter readiness for healthier urban waterways.*  
> **Target Scenario**: Batu Pahat, Johor, Malaysia (Monsoon Storm Readiness & Urban Freshwater Ecosystems)  
> **Persistent Disclaimer**: *Prototype using simulated starter reports. Not an official flood or water-quality warning, emergency service, or authority reporting channel.*

---

## 1. Project Overview

**DrainWatch: Stormwater & Litter Watch** is an explainable, mobile-first community web prototype designed to help local residents, gotong-royong groups, and municipal coordinators protect both neighborhood drainage capacity and downstream freshwater ecosystems.

Rather than relying on black-box predictions or waiting for surface runoff to mobilize waste into waterways, DrainWatch combines **real location-based precipitation forecast data** from Open-Meteo with **geo-tagged citizen reports of visible drainage blockages and litter/dumping hotspots** to dynamically compute an **explainable priority score** for safe inspection before the storm arrives.

---

## 2. Integrated Issue Categories & Freshwater Ecosystem Scope

DrainWatch features a single integrated reporting and readiness system across **6 core categories**:
1. **Drainage blockage**: Clogged culverts, silt buildup, or obstructed inlets.
2. **Street litter hotspot**: Accumulated plastics, bottles, packaging along curbs.
3. **Illegal dumping**: Bulk rubbish, construction debris, or waste piles near drains.
4. **Suspected discharge**: Discolored surface runoff, oily sheen, or gray water outflow.
5. **Standing water**: Stagnant ponding, trapped puddle, or slow street drainage.
6. **Damaged drainage asset**: Cracked concrete sidewalls, collapsed conduits, or broken grates.

### Official Report Tags:
- **“Flooding risk”**: Issues impeding hydraulic conveyance.
- **“Runoff pollution risk”**: Debris, litter, or waste that stormwater can wash into the drainage network.
- **“Potential freshwater ecosystem impact”**: Issues with immediate or downstream threat to canals, streams, and coastal tributaries.
- **“Needs review”**: Provisional reports requiring photo evidence or community verification.

### Heavy Rain Debris Mobilization Dynamics:
Under **Heavy Rain (>20mm / 24h)**, unresolved litter hotspots, illegal dumping piles, and drainage blockages are elevated in priority with a transparent explanation:
> *“Heavy rain can mobilize debris into drainage systems and connected urban waterways.”*

### Why This Matters to Urban Waterways:
> *“Heavy rain can move litter, sediment, and visible debris from streets into drainage systems and connected waterways. This is a community observation of a potential runoff pathway; it does not measure water quality, contaminants, or ecological health.”*

---

## 3. Product Boundaries & Safety Principles

DrainWatch enforces strict product, environmental, and ethical boundaries:
- **Scenario-based community readiness prototype**: It is NOT an official flood warning, flood prediction, water-quality measurement, drainage asset map, emergency service, or authority-reporting system. Starter reports and locations are simulated and illustrative.
- **Wording Standard**: Strictly uses *"rain readiness," "Community Stormwater Readiness Notice — not an official flood or water-quality warning," "reported drainage issue,"* and *"forecast-based context."* Never claims flood prediction or contaminant detection.
- **Safety Directive**: Community observers are instructed to **observe only from a safe public location. Never enter drains, remove covers, walk or drive through floodwater, or approach moving water or unsafe roads. Follow official local emergency guidance.**
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
1. **Community Park Drain** (Jalan Tasik): Partial blockage, moderate, 2 days ago, pedestrian route (Needs photo evidence).
2. **Riverside Walk Inlet** (Sungai Batu Pahat): Overflowing surcharging drain, severe, 6 hours ago, near homes (Community-confirmed).
3. **Market Lane Culvert** (Pasar Besar area): Heavily blocked box culvert, severe, 5 days ago, near homes & school (Reported).
4. **Campus Access Drain** (Jalan Universiti): Damaged concrete wall & grate, moderate, 9 days ago, school & pedestrian route (Verified).
5. **Housing Area Storm Drain** (Taman Soga): Silt trap issue, minor, 12 hours ago (Resolved).
6. **Pasar Malam Street Litter Hotspot** (Jalan Penggaram): Accumulated single-use packaging & plastics along curb, moderate, 1 day ago (Photo-supported).
7. **Jalan Rahmat Bulk Waste Dumping** (Ditch Reserve): Construction debris and waste pile in drainage reserve, severe, 18 hours ago (Community-confirmed).
8. **Simpang Rantai Outfall Runoff** (Tributary Confluence): Cloudy surface discharge entering tributary culvert, moderate, 8 hours ago (Reported).
9. **Taman Maju Low-Lying Ponding** (Residential Curb): Stagnant stormwater ponding across low-gradient curb, minor, 2 days ago (Coordinator-verified).

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
