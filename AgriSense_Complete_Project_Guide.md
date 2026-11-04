# AgriSense — Complete Prototype Documentation & Viva Examination Guide

> **Project Name:** AgriSense — Smart Agricultural Intelligence & Farm Advisory Platform  
> **Target Audience:** College Professor / Technical Viva Examiner  
> **Stack:** React 19, Vite 8, Node.js v22, Express 4, MongoDB Atlas (Mongoose 8), Google GenAI (Gemini), Open-Meteo API, OpenStreetMap  
> **Prepared For:** Academic Viva, Final Project Evaluation & Technical Demonstration  

---

## Table of Contents
1. [PART 1 — Page-by-Page Application Explanation](#part-1--page-by-page-application-explanation)
2. [PART 2 — Technical Architecture & Data Flow](#part-2--technical-architecture--data-flow)
3. [PART 3 — APIs & External Services](#part-3--apis--external-services)
4. [PART 4 — Database Design & Data Isolation](#part-4--database-design--data-isolation)
5. [PART 5 — How the Intelligent Features Work](#part-5--how-the-intelligent-features-work)
6. [PART 6 — Data Sources, Telemetry & Accuracy](#part-6--data-sources-telemetry--accuracy)
7. [PART 7 — Professor's Viva Questions & Answers](#part-7--professors-viva-questions--answers)
8. [PART 8 — Live 5-to-7 Minute Demonstration Script](#part-8--live-5-to-7-minute-demonstration-script)
9. [PART 9 — Honest Limitations & Academic Disclosure](#part-9--honest-limitations--academic-disclosure)
10. [ONE-PAGE QUICK REVISION CHEAT SHEET](#one-page-quick-revision-cheat-sheet)

---

# PART 1 — Page-by-Page Application Explanation

This section describes every page and panel in the AgriSense application. Use the **30-Second Viva Pitch** under each section to explain the panel to your examiner quickly and concisely.

---

### 1.1 Authentication Pages: Login & Signup
* **File Paths:** [`src/pages/Login.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/pages/Login.jsx), [`src/pages/Signup.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/pages/Signup.jsx)
* **Purpose:** Provides secure user onboarding, authentication, and session management using JSON Web Tokens (JWT).
* **Information Displayed:**
  * Login: Email and password fields, remember-me toggle, link to registration, and error feedback alerts.
  * Signup: Full name, email, password, password confirmation, and accurate Terms of Service / Privacy disclosure.
* **Major Actions & Buttons:**
  * `Sign In` / `Create Account`: Validates client-side inputs, transmits credentials via HTTPS POST, stores the returned JWT in browser storage (`localStorage`), and redirects to `/dashboard`.
  * `Demo Credentials` button: Pre-populates the login form for testing.
* **Data Sources & Backend Endpoints:**
  * Calls `POST /auth/login` or `POST /auth/signup`.
  * Interacts with the `User` collection in MongoDB.
* **Behind the Scenes:**
  * Passwords are never stored as plaintext. The backend hashes passwords using `bcryptjs` (salt rounds = 10).
  * Upon successful authentication, the backend signs a JWT payload `{ userId: user._id }` using `process.env.JWT_SECRET` with an expiration window (7 days).
  * Frontend [`AuthContext.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/context/AuthContext.jsx) captures this token and attaches it to the HTTP `Authorization: Bearer <TOKEN>` header for all future requests.
* **30-Second Viva Pitch:**
  > *"Our authentication system uses stateless JSON Web Tokens. When the user logs in, the Node/Express backend verifies the bcrypt password hash against MongoDB. It returns a cryptographically signed JWT that the React frontend stores locally and attaches to the HTTP Bearer header of every API call to guarantee strict user-isolated data access."*

---

### 1.2 Main Dashboard
* **File Path:** [`src/components/dashboard/MainDashboard.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/components/dashboard/MainDashboard.jsx)
* **Purpose:** Serves as the executive farm overview, synthesizing live microclimate conditions, soil test summaries, field zones, active alerts, and quick actions into a single operational interface.
* **Information Displayed:**
  * Top Metric Cards: Current Temperature, Ambient Humidity, Active Field Zones count, and Pending Alerts count.
  * Microclimate Snapshot: Real-time temperature, wind speed, UV index, and 48-hour rain likelihood.
  * Field Zones Inventory: Zone cards showing assigned crop, area, schedule mode, and moisture levels.
  * Critical Alert Notifications: High-priority agronomic issues (e.g., moisture deficits, extreme heat).
* **Major Actions & Buttons:**
  * `Refresh Telemetry`: Triggers a synchronized refetch of weather, farm alerts, and zone metrics.
  * `Add Soil Reading` / `Configure Farm`: Contextual action buttons routing users to relevant sub-panels.
  * Zone card click: Directs the user to that zone's specific recommendations or irrigation status.
* **Data Sources & Backend Endpoints:**
  * Calls `GET /farms/:farmId/weather`, `GET /farms/:farmId/alerts`, `GET /farms/:farmId/zones`, and `GET /farms/:farmId/soil-readings`.
  * Interacts with MongoDB collections `Farm`, `Zone`, `SoilReading`, `WeatherSnapshot`.
* **Behind the Scenes:**
  * [`FarmContext.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/context/FarmContext.jsx) loads farm details on boot. The dashboard checks if the farm has valid GPS coordinates. If yes, it fetches Open-Meteo microclimate telemetry and evaluates dynamic agronomic alert rules.
* **30-Second Viva Pitch:**
  > *"The Main Dashboard is an aggregation interface. It consumes four REST endpoints simultaneously: farm zones, latest soil tests, Open-Meteo live weather, and dynamic alert rules. It never displays hardcoded numbers—if telemetry is missing, it displays clear empty states prompting the user to enter data."*

---

### 1.3 Farm Details & Settings
* **File Path:** [`src/components/dashboard/SettingsPanel.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/components/dashboard/SettingsPanel.jsx)
* **Purpose:** Enables farmers to register their property, configure geographical coordinates, manage field zones, update profile credentials, and configure system preferences.
* **Tabs & Sub-sections:**
  1. `Profile`: User full name, email address, password change.
  2. `Farm Details`: Farm property name, general location text, land area (ha or acres), and precise decimal GPS latitude/longitude.
  3. `Farm Zones`: Dynamic inventory of sub-plots. Includes **Add Zone** form and **Inline Zone Editor** (allows modifying crop species and field area).
  4. `Notifications`: Toggle alert push and email notification preferences.
  5. `Appearance`: System, Dark, or Light UI theme switcher.
* **Major Actions & Buttons:**
  * `Save Farm` / `Update Farm`: Dispatches `POST /farms` or `PATCH /farms/:farmId`.
  * `Add Zone`: Dispatches `POST /farms/:farmId/zones`.
  * `Edit Zone` -> `Save Changes`: Dispatches `PATCH /zones/:zoneId` with updated crop species and acreage.
* **Data Sources & Backend Endpoints:**
  * Calls `PATCH /auth/profile`, `POST/PATCH /farms`, `POST /farms/:farmId/zones`, `PATCH /zones/:zoneId`.
  * Writes directly to `User`, `Farm`, and `Zone` Mongoose models.
* **Behind the Scenes:**
  * Strict validation is enforced via Zod (`farmPatchSchema`, `zonePatchSchema`). Coordinates must fall within latitude (-90 to 90) and longitude (-180 to 180). Areas must be positive finite numbers.
* **30-Second Viva Pitch:**
  > *"The Settings Panel is where ground-truth farm metadata originates. It captures GPS coordinates required for live weather querying and satellite mapping. It also manages field zones with acreage and crop species, which feed directly into our irrigation deficit calculations and heuristic yield forecasting."*

---

### 1.4 Weather Monitoring
* **File Path:** [`src/components/dashboard/WeatherPanel.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/components/dashboard/WeatherPanel.jsx)
* **Purpose:** Provides localized agrometeorological tracking using Open-Meteo forecasts to anticipate crop thermal stress and rain events.
* **Information Displayed:**
  * Current conditions: Temperature (°C), apparent 'feels like' temperature, relative humidity (%), surface wind speed (km/h), and atmospheric pressure.
  * 7-Day Agricultural Forecast: Daily maximum/minimum temperatures, precipitation totals (mm), and rainfall probability percentages.
  * Visual Precipitation Bar Chart: Hourly/daily rain projections.
* **Major Actions & Buttons:**
  * `Refresh Weather`: Flushes local frontend cache and queries the backend weather cache.
* **Data Sources & Backend Endpoints:**
  * Calls `GET /farms/:farmId/weather`.
  * Backend queries the Open-Meteo API using the farm's stored latitude and longitude.
  * Caches responses in the `WeatherSnapshot` collection in MongoDB.
* **Behind the Scenes:**
  * To avoid rate limits on third-party meteorological APIs, the Express backend checks MongoDB for an unexpired `WeatherSnapshot` (< 30 minutes old). If valid, it returns cached telemetry. If expired or missing, it queries Open-Meteo, saves a new snapshot with an automated MongoDB TTL index, and returns the fresh payload.
* **30-Second Viva Pitch:**
  > *"The Weather Panel integrates the free Open-Meteo API without requiring client-side API keys. The server caches weather snapshots in MongoDB with a 30-minute Time-To-Live index to conserve bandwidth and reduce latency, supplying real-time rain probability to our irrigation advisor."*

---

### 1.5 Soil Health Monitoring
* **File Path:** [`src/components/dashboard/SoilPanel.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/components/dashboard/SoilPanel.jsx)
* **Purpose:** Tracks key macronutrients (Nitrogen, Phosphorus, Potassium), soil pH acidity/alkalinity, and volumetric soil moisture across farm zones over time.
* **Information Displayed:**
  * Macronutrient KPI cards (N, P, K in mg/kg with qualitative ratings: Low, Optimal, High).
  * pH Gauge / Indicator (with acidic vs alkaline classification).
  * Volumetric Soil Moisture percentage.
  * Historical Soil Health Chart (tracking nutrient levels across observation dates).
  * Historical Test Log table showing test timestamp, method (manual, laboratory, sensor), and notes.
* **Major Actions & Buttons:**
  * `Record Soil Test`: Opens a structured modal dialog where users input measured chemical values, select the zone, specify the sampling method (Lab Assay, Manual Field Kit, Sensor), and provide observation notes.
  * Zone Filter: Filters chemical records by individual field zone.
* **Data Sources & Backend Endpoints:**
  * Calls `GET /farms/:farmId/soil-readings` and `POST /zones/:zoneId/soil-readings`.
  * Persists records to the `SoilReading` collection in MongoDB.
* **Behind the Scenes:**
  * When a user records a reading, Mongoose validates that values are positive finite numbers. Once stored, these readings immediately influence the dynamic alerts, crop recommendation inputs, and irrigation advisories across the platform.
* **30-Second Viva Pitch:**
  > *"Soil Health tracks verified field assays and sensor tests. Farmers can log N-P-K in milligrams per kilogram, pH, and volumetric moisture. Rather than fabricating continuous fake sensor streams, AgriSense honestly tracks historical tests, differentiating laboratory assays from field kit measurements."*

---

### 1.6 AI Crop Recommendations
* **File Path:** [`src/components/dashboard/CropPanel.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/components/dashboard/CropPanel.jsx)
* **Purpose:** Delivers agricultural decision support by recommending optimal crop cultivars based on real soil chemistry, local climate, and field dimensions using Google Gemini.
* **Information Displayed:**
  * Top Recommended Crop Hero Banner with qualitative suitability score (e.g., 85%).
  * Itemized Agronomic Rationale (why this crop fits the current soil pH, nitrogen reserves, and temperature).
  * Secondary / Alternative Crop Options.
  * Historical Recommendation Runs list with timestamps and model versions.
* **Major Actions & Buttons:**
  * Zone Selector: Switches recommendation context between zones.
  * `Run AI Recommendation`: Invokes Google Gemini against the zone's latest soil test and live weather data.
  * `Retry Prediction`: Visible if a transient API network timeout or rate limit occurs.
* **Data Sources & Backend Endpoints:**
  * Calls `POST /zones/:zoneId/predictions/crop` and `GET /zones/:zoneId/predictions?type=crop`.
  * Communicates with Google Gemini API (`@google/genai` SDK) and MongoDB `PredictionRun`.
* **Behind the Scenes:**
  * The backend compiles a strict context payload: current crop, soil readings (pH, N, P, K, moisture), and weather (temperature, humidity, precipitation). It submits this to Gemini with a strict JSON schema (`cropRecommendationSchema`).
  * If soil data is missing, Gemini is strictly instructed to return `status: "insufficient_data"` rather than hallucinating fake advice.
  * The structured result is stored in MongoDB's `PredictionRun` collection for auditability.
* **30-Second Viva Pitch:**
  > *"Our Crop Recommendation feature connects Google's Gemini generative AI directly to real farm data. The backend sends the latest soil readings and weather forecast to Gemini, enforcing a structured JSON response schema. The result is validated with Zod and saved to MongoDB so farmers have an auditable history of AI recommendations."*

---

### 1.7 Plant Disease & Pest Detection
* **File Path:** [`src/components/dashboard/PestPanel.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/components/dashboard/PestPanel.jsx)
* **Purpose:** Analyzes photos of diseased crops, infected leaves, or insect infestations using Gemini Vision to identify pathogens and suggest biological/chemical treatments.
* **Information Displayed:**
  * Interactive Image Upload Dropzone & Live Camera Capture viewfinder.
  * Image Preview container.
  * Diagnostic Findings Card: Identified Issue Name, Scientific Name, Pathology Category (fungal, bacterial, pest, deficiency, healthy), Severity Level, and AI-Estimated Confidence.
  * Detailed Symptom Breakdown, Organic Treatments, and Conventional Management steps.
  * Scan History showing previous diagnostic runs for that zone.
* **Major Actions & Buttons:**
  * `Upload Image`: Selects a local image (JPEG, PNG, WebP up to 5 MB).
  * `Use Camera`: Accesses the device webcam/mobile camera via HTML5 `getUserMedia`.
  * `Run AI Diagnosis`: Converts image to Base64 and dispatches it to the backend.
  * `Retry Analysis`: Re-submits without losing the uploaded file if an API capacity error occurs.
* **Data Sources & Backend Endpoints:**
  * Calls `POST /zones/:zoneId/predictions/pest` and `GET /zones/:zoneId/predictions?type=pest`.
  * Interacts with Google Gemini Vision and stores audits in `PredictionRun`.
* **Behind the Scenes:**
  * The frontend encodes the image to Base64 via `FileReader`.
  * The backend verifies the image size (< 5 MB), strips any data URL scheme prefixes, and constructs an inline image part for Gemini Vision.
  * Gemini inspects plant pathology against a strict JSON schema. If the image is blurry, blank, or not a plant, it returns `identified: false, category: "unknown"`, refusing to hallucinate diseases.
* **30-Second Viva Pitch:**
  > *"Pest Detection uses multimodal vision analysis. The farmer uploads a leaf photo from their mobile device or camera. The server validates the image, passes it to Gemini Vision with an agronomic pathology prompt, and returns structured data including scientific names, organic treatments, and confidence ratings."*

---

### 1.8 Smart Irrigation Advisory
* **File Path:** [`src/components/dashboard/IrrigationPanel.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/components/dashboard/IrrigationPanel.jsx)
* **Purpose:** Calculates scientific water requirements to prevent under-watering or over-watering, factoring in crop water benchmarks and upcoming rainfall.
* **Information Displayed:**
  * Overall Farm Irrigation Need status card (e.g., "1 Zone Needs Water" vs "Moisture Optimal").
  * Rainfall Forecast Alert Banner (highlights when expected rainfall makes irrigation unnecessary).
  * Pump Telemetry Hardware Disclaimer (clarifies advisory mode vs physical pump control).
  * Zone Watering Cards: Soil moisture level, target moisture, recommended volume in Litres, depth equivalent in mm, and recommended run time in minutes.
* **Major Actions & Buttons:**
  * `Refresh Advisory`: Recomputes water balance using the latest soil test and live weather forecast.
  * `Schedule Mode Toggle`: Sets the zone's operational intent (Manual vs Scheduled).
  * `Auto-Advisory Mode Toggle`: Enables automatic recommendation recalculation.
* **Data Sources & Backend Endpoints:**
  * Calls `GET /farms/:farmId/irrigation-advisory` and `PATCH /zones/:zoneId`.
  * Computations execute on the backend via [`agronomicEngine.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/services/agronomicEngine.js).
* **Behind the Scenes:**
  * The backend retrieves the latest soil moisture reading for each zone.
  * If upcoming 48-hour rainfall $\ge 8\text{ mm}$ or rain probability $\ge 65\%$, status is marked `Delayed (Rain Expected)` and recommended litres is set to 0.
  * If moisture is below the crop threshold, the deficit percentage is calculated. Water depth in mm is determined ($\text{deficit} \times 0.45$), converted to Litres using zone surface area ($1\text{ mm} \times 1\text{ m}^2 = 1\text{ Litre}$), and pump duration is estimated assuming standard $5\text{ mm/hour}$ delivery.
* **30-Second Viva Pitch:**
  > *"Our Smart Irrigation system is an explainable agronomic engine. It computes soil moisture deficit against crop baselines. If Open-Meteo forecasts rain within 48 hours, it recommends delaying irrigation to conserve water. Otherwise, it calculates the exact volume in litres and minutes needed to reach field capacity."*

---

### 1.9 Crop Yield Prediction
* **File Path:** [`src/components/dashboard/YieldPanel.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/components/dashboard/YieldPanel.jsx)
* **Purpose:** Provides transparent harvest yield forecasting using regional FAO/ICAR cultivar potential baselines adjusted for soil chemical balance and weather conditions.
* **Information Displayed:**
  * Total Farm Harvest Expectation Hero Card (Total Expected kg, Minimum kg, Maximum kg).
  * Model Methodology Badge: "Agronomic Heuristic (FAO/ICAR Baselines)".
  * Zone Harvest Potential vs Adjusted Projection Bar Chart (comparing baseline capability to adjusted estimates).
  * Per-Crop Breakdown Cards: Cultivar name, baseline yield/ha, combined multiplier factor (e.g., 94% or 108%), and influencing factors (+4% optimal pH, -8% nitrogen deficit, -8% heat stress).
  * Configuration Status: Clearly shows which inputs are configured (Crop, Weather) and what is missing (e.g., Zone area).
* **Major Actions & Buttons:**
  * `Recalculate Estimates`: Refetches data and recalculates heuristic yield projections.
  * `Configure Zone in Settings`: Direct route to Settings if field dimensions or crops are unconfigured.
* **Data Sources & Backend Endpoints:**
  * Calls `GET /farms/:farmId/yield-estimate`.
  * Calculated by [`agronomicEngine.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/services/agronomicEngine.js).
* **Behind the Scenes:**
  * Starts with standardized regional cultivar yields per hectare (e.g., Rice: 3,800 kg/ha, Wheat: 3,600 kg/ha, Tomato: 22,000 kg/ha).
  * Applies empirical modifiers: soil pH ($\pm 12\%$), available Nitrogen ($\pm 8\%$), Phosphorus ($-5\%$), Potassium ($+3\%$), daytime temperature stress ($-8\%$ if $>36^\circ\text{C}$), and rainfall sufficiency ($+3\%$).
  * The combined factor is bounded between $0.60$ and $1.35$. Base potential ($\text{baseline} \times \text{area}$) is multiplied by this factor with a $\pm 10\%$ confidence interval.
* **30-Second Viva Pitch:**
  > *"Yield prediction uses an explainable heuristic model rather than an opaque black box. We take verified FAO and ICAR regional crop benchmarks, scale them by field acreage, and adjust for soil macronutrients and weather stress. Every factor is clearly listed so the farmer understands why the yield was adjusted up or down."*

---

### 1.10 Dynamic Alerts
* **File Path:** [`src/components/dashboard/AlertsPanel.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/components/dashboard/AlertsPanel.jsx)
* **Purpose:** Alerts farmers to emerging threats such as drought stress, soil acidification, nutrient deficiencies, or impending frost.
* **Information Displayed:**
  * Alert Counter Cards (Critical, Warning, Info, Total Active).
  * Alert Stream: Severity badges, timestamps, descriptive titles, plain-English explanations of why the alert triggered, and practical corrective actions.
* **Major Actions & Buttons:**
  * `Dismiss`: Dismisses an individual alert.
  * `Dismiss All Active`: Clears all current alerts.
  * Filter Pills: Filters alerts by severity (All, Critical, Warning, Info).
* **Data Sources & Backend Endpoints:**
  * Calls `GET /farms/:farmId/alerts`.
  * Backend evaluates rules dynamically against `SoilReading` and `WeatherSnapshot` models.
* **Behind the Scenes:**
  * Alerts are generated dynamically on demand using clear rules:
    * High Temperature Alert: Temperature $\ge 38^\circ\text{C}$.
    * Frost Alert: Temperature $\le 3^\circ\text{C}$.
    * Drought Stress Alert: Soil moisture $\le 25\%$.
    * Waterlogging Alert: Soil moisture $\ge 85\%$.
    * Soil Acidification: $\text{pH} < 5.5$.
    * Severe Nitrogen Depletion: $\text{Nitrogen} < 90\text{ mg/kg}$.
  * Dismissals are persisted in browser `localStorage` scoped to the specific user and farm (`agrisense_dismissed_alerts_<userId>_<farmId>`). Dismissed alerts never reappear after a page reload.
* **30-Second Viva Pitch:**
  > *"Alerts in AgriSense are dynamic rule-based triggers derived from live weather and verified soil readings. If soil moisture drops below 25% or temperatures exceed 38 degrees, an alert is generated with actionable guidance. Dismissals are stored in local storage scoped per user and farm so they persist across logins."*

---

### 1.11 Reports & Document Exports
* **File Path:** [`src/components/dashboard/ReportsPanel.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/components/dashboard/ReportsPanel.jsx), [`src/data/reportExports.js`](file:///c:/Users/Atharva/Desktop/AgriSense/src/data/reportExports.js)
* **Purpose:** Generates professional PDF dossiers and multi-sheet Excel workbooks containing genuine stored farm telemetry for bank loan applications, government subsidies, or agronomic audits.
* **Information Displayed:**
  * Key Metric Cards: Total Land Managed, Active Crop Species, Average Soil Moisture, Irrigation Need.
  * Zone Telemetry Bar Chart: Visualizing zone acreage against recorded moisture.
  * Dedicated Report Options:
    1. Comprehensive Farm Audit Dossier (PDF).
    2. Complete Agronomic Analytics Workbook (Excel).
    3. Soil Chemistry & Nutrient Profile (PDF).
    4. Irrigation & Water Conservation Log (Excel).
    5. Crop Yield & Harvest Projections (Excel).
* **Major Actions & Buttons:**
  * `Export Comprehensive PDF`: Generates and downloads a multi-page, formatted PDF document with official headers and categorized tables.
  * `Export Complete Excel`: Generates and downloads an `.xlsx` workbook containing 6 individual sheets (`Farm Summary`, `Field Zones`, `Soil Tests`, `Irrigation Advisory`, `Yield Projections`, `Field Alerts`).
* **Data Sources & Backend Endpoints:**
  * Aggregates data from `GET /farms/:farmId`, `GET /farms/:farmId/zones`, `GET /farms/:farmId/soil-readings`, `GET /farms/:farmId/weather`, `GET /farms/:farmId/irrigation-advisory`, and `GET /farms/:farmId/yield-estimate`.
* **Behind the Scenes:**
  * Generated on the client using `jspdf` and custom XML-based workbook generators (`fflate`).
  * Every row is explicitly tagged with its data origin: `"Laboratory Verified"`, `"IoT Telemetry"`, `"User-Entered Manual"`, `"Live Weather"`, `"Open-Meteo Forecast"`, `"Agronomic Advisory (Modelled)"`, or `"Agronomic Heuristic Estimate"`.
* **30-Second Viva Pitch:**
  > *"Our reporting engine generates professional PDF dossiers and six-sheet Excel workbooks entirely on the client side using jsPDF. Every exported number is explicitly labeled by its origin—whether it is an empirical laboratory assay, an Open-Meteo weather forecast, or a heuristic yield estimate."*

---

### 1.12 Interactive Farm Map
* **File Path:** [`src/components/dashboard/FarmMapPanel.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/components/dashboard/FarmMapPanel.jsx)
* **Purpose:** Visualizes property geography, coordinates, and zone locations using OpenStreetMap tiles.
* **Information Displayed:**
  * OpenStreetMap interactive map centered on the farm's genuine GPS coordinates.
  * Farm Location Pin and GPS Coordinates metadata bar.
  * Zone Selector Sidebar showing zone name, assigned crop, area, and operational status.
  * Empty State Guard: If farm coordinates are not set, it displays a clear message directing the user to Settings, refusing to invent a fake location.
* **Major Actions & Buttons:**
  * `+` / `-` Zoom Controls: Dynamically recalculates the bounding box coordinates (`bbox`) to zoom in and out.
  * `Reset View`: Restores default farm zoom level.
  * `Configure Farm Coordinates`: Navigates to Settings when GPS coordinates are missing.
* **Data Sources & Backend Endpoints:**
  * Consumes coordinates from `FarmContext` (`farm.coordinates.latitude`, `farm.coordinates.longitude`).
  * Embeds OpenStreetMap directly using coordinate bounding box math.
* **Behind the Scenes:**
  * Calculates dynamic bounding box parameters:
    $$\Delta = \frac{0.025}{\text{zoomLevel}}, \quad \text{minLon} = \text{lon} - 1.4\Delta, \quad \text{maxLon} = \text{lon} + 1.4\Delta, \quad \text{minLat} = \text{lat} - \Delta, \quad \text{maxLat} = \text{lat} + \Delta$$
  * Passes this bounding box into OpenStreetMap's embed service.
* **30-Second Viva Pitch:**
  > *"The Farm Map embeds OpenStreetMap centered on the farm's real GPS coordinates. It dynamically computes bounding box dimensions as the user adjusts the zoom level. If coordinates are missing, it displays an honest empty state prompting configuration rather than showing a fabricated location."*

---

# PART 2 — Technical Architecture & Data Flow

### 2.1 Complete Tech Stack Overview

| Layer | Technology | Version | Purpose in AgriSense |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 19.0.0 | Component-based reactive UI rendering |
| **Build Tool & Bundler** | Vite | 8.3.1 | High-speed ESM development server & production bundler |
| **Routing** | React Router DOM | 7.18.4 | Client-side declarative SPA routing |
| **Icons & UI** | Lucide React | 1.47.0 | Consistent agricultural and interface iconography |
| **Charting Engine** | Recharts | 3.10.1 | Responsive SVG charting for weather, soil, and yield |
| **PDF Generation** | jsPDF | 4.2.1 | Client-side programmatic vector PDF document generation |
| **Excel Compression** | fflate | 0.8.3 | High-speed ZIP compression for `.xlsx` workbook generation |
| **Backend Runtime** | Node.js | v22.17.1 | Asynchronous, event-driven JavaScript server runtime |
| **Web Server** | Express | 4.21.2 | RESTful HTTP routing, middleware, and request validation |
| **Database** | MongoDB Atlas | 7.0+ | Cloud NoSQL document database |
| **ODM** | Mongoose | 8.13.0 | Object Data Modeling, schema validation, and index control |
| **Validation** | Zod | 3.24.2 | Strict schema validation for request bodies and AI responses |
| **Password Hashing** | bcryptjs | 3.0.2 | One-way cryptographic password salting and hashing |
| **Tokens** | jsonwebtoken | 9.0.2 | Stateless JSON Web Token creation and verification |
| **AI Integration** | @google/genai | 0.1.2 | Official Google GenAI SDK for Gemini models |

---

### 2.2 End-to-End Data Flow Pipeline

```mermaid
flowchart TD
    subgraph Client["Frontend (React 19 + Vite)"]
        UI["UI Panel / Page Component"]
        Context["Context Provider (Auth / Farm / Theme)"]
        APIClient["API Client (apiRequest.js with Bearer JWT)"]
    end

    subgraph Server["Backend (Node.js + Express)"]
        AuthMiddleware["JWT Authentication Middleware"]
        Validator["Zod Schema Validator Middleware"]
        Router["Express Routes (farmRoutes / authRoutes)"]
        ServiceLayer["Service Layer (agronomicEngine / weatherService)"]
    end

    subgraph Storage["Data & Cloud Services"]
        Atlas[("MongoDB Atlas Database")]
        Gemini["Google Gemini AI (3.5-flash-lite)"]
        OpenMeteo["Open-Meteo Meteorological API"]
        OSM["OpenStreetMap Tile Server"]
    end

    UI --> Context
    Context --> APIClient
    APIClient -->|HTTP Request + Bearer Token| AuthMiddleware
    AuthMiddleware --> Validator
    Validator --> Router
    Router --> ServiceLayer

    ServiceLayer -->|Mongoose Queries| Atlas
    ServiceLayer -->|Fetch Live Weather| OpenMeteo
    ServiceLayer -->|Multimodal / Text Inference| Gemini
    UI -.->|Direct Tile Embed| OSM

    Atlas -->|Documents| ServiceLayer
    OpenMeteo -->|Forecast JSON| ServiceLayer
    Gemini -->|Structured Prediction JSON| ServiceLayer

    ServiceLayer --> Router
    Router -->|Sanitized JSON Response| APIClient
    APIClient --> Context
    Context --> UI
```

---

### 2.3 Authentication & Security Architecture
1. **Stateless JWT Authorization:**
   * When a user logs in, the server signs a JWT containing the user's MongoDB `_id`:
     $$\text{Token} = \text{sign}(\{\text{userId}: \text{user.\_id}\}, \text{JWT\_SECRET}, \{\text{expiresIn}: \text{"7d"}\})$$
   * The token is stored in the browser's `localStorage` and sent with every request in the `Authorization: Bearer <TOKEN>` header.
2. **Middleware Verification:**
   * [`auth.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/middleware/auth.js) intercepts incoming requests, extracts the Bearer token, verifies its signature using `jwt.verify`, and loads the user record into `req.user`.
3. **Strict Multi-Tenant Farm Isolation:**
   * To prevent User A from accessing User B's farm by tampering with IDs in the URL, every endpoint calls `getOwnedFarm(farmId, userId)` or `getOwnedZone(zoneId, userId)` in [`ownership.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/services/ownership.js).
   * It performs an atomic database lookup: `Farm.findOne({ _id: farmId, ownerId: userId })`. If the user is not the recorded owner, the server immediately throws a `404 FARM_NOT_FOUND` error.

---

### 2.4 Environment Variables Configuration
The server loads environment variables using Node.js `--env-file=server/.env` or `dotenv`. They are validated on startup using Zod in [`env.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/config/env.js):

| Variable | Required | Purpose | Example Value |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Optional | Application runtime environment | `development` / `production` |
| `PORT` | Optional | Express server network port | `4000` |
| `CLIENT_ORIGIN` | Yes | Permitted frontend CORS origin | `http://127.0.0.1:5173` |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/agrisense` |
| `JWT_SECRET` | Yes | 256-bit cryptographic signing key | Minimum 32 characters random string |
| `GEMINI_API_KEY` | Optional | Google AI Studio access key | `AIzaSy...` |
| `GEMINI_MODEL` | Optional | Google Gemini model identifier | `gemini-3.5-flash-lite` |
| `WEATHER_CACHE_MINUTES` | Optional | Time-To-Live for weather cache | `30` |

---

# PART 3 — APIs & External Services

### 3.1 External Third-Party APIs Used

```mermaid
flowchart LR
    AgriSenseBackend["AgriSense Backend (Express)"]
    GeminiAPI["Google Gemini API\n(@google/genai)"]
    OpenMeteoAPI["Open-Meteo Weather API\n(v1/forecast)"]
    AtlasCloud["MongoDB Atlas\n(Cloud Cluster)"]

    AgriSenseBackend -->|Crop & Pest Inference| GeminiAPI
    AgriSenseBackend -->|Hourly & 7-Day Forecast| OpenMeteoAPI
    AgriSenseBackend -->|Connection Pool| AtlasCloud
```

#### 1. Google Gemini API (Text & Reasoning)
* **Purpose:** Generates personalized crop recommendations based on farm data.
* **Implementation File:** [`geminiPredictionService.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/services/geminiPredictionService.js)
* **Information Sent:** Farm zone details, crop species, soil readings (moisture, pH, NPK), and weather conditions.
* **Information Received:** Structured JSON containing recommendation status (`ready`, `insufficient_data`), top crop recommendations with suitability percentages, itemized rationale, and missing input warnings.
* **Authentication:** Requires `GEMINI_API_KEY` in `server/.env`.
* **Cost & Limits:** Tested and verified on Google AI Studio's Free Tier using `gemini-3.5-flash-lite`.

#### 2. Google Gemini Vision API (Multimodal Image Understanding)
* **Purpose:** Analyzes plant, leaf, and pest photos for agricultural pathology.
* **Implementation File:** [`geminiVisionService.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/services/geminiVisionService.js)
* **Information Sent:** Raw Base64-encoded image bytes, MIME type (JPEG/PNG/WebP), reported crop context, and an expert pathology prompt.
* **Information Received:** Structured JSON: `identified` (boolean), `issueName`, `scientificName`, `category` (pest, disease, deficiency, healthy, unknown), `severity` (low, moderate, high, severe), `confidence` (0 to 1), `symptoms` array, `treatments` array, and `diagnosisNotes`.
* **Authentication:** Shared `GEMINI_API_KEY`.
* **Safeguard:** If a blank or non-plant image is provided, Gemini returns `identified: false` and `category: "unknown"`, refusing to hallucinate diseases.

#### 3. Open-Meteo Weather API
* **Purpose:** Supplies localized weather data and 7-day agricultural forecasts without commercial API keys.
* **Implementation File:** [`weatherService.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/services/weatherService.js)
* **URL Called:** `https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&current=...&daily=...`
* **Information Sent:** Farm latitude, longitude, and requested meteorological variables.
* **Information Received:** Current temperature, relative humidity, wind speed, precipitation sum, and 7-day rain probability.
* **Authentication:** None required (Open Access for non-commercial educational use up to 10,000 calls/day).

#### 4. OpenStreetMap (Geospatial Mapping)
* **Purpose:** Renders dynamic interactive maps showing the farm's location.
* **Implementation File:** [`FarmMapPanel.jsx`](file:///c:/Users/Atharva/Desktop/AgriSense/src/components/dashboard/FarmMapPanel.jsx)
* **Mechanism:** Direct client iframe embed using calculated GPS bounding boxes (`bbox`).
* **Authentication:** None required.

---

### 3.2 Internal Backend REST API Route Reference

| Method | Endpoint | Authenticated | Purpose |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/signup` | No | Registers new user account; hashes password with bcrypt |
| `POST` | `/auth/login` | No | Authenticates user credentials; returns JWT token |
| `GET` | `/auth/me` | Yes | Retrieves authenticated user profile & preferences |
| `PATCH` | `/auth/profile` | Yes | Updates user name, email, or password |
| `GET` | `/farms` | Yes | Lists all farms owned by the authenticated user |
| `POST` | `/farms` | Yes | Creates a new farm with GPS coordinates & area |
| `GET` | `/farms/:farmId` | Yes | Retrieves details of a specific owned farm |
| `PATCH` | `/farms/:farmId` | Yes | Updates farm name, location label, area, or coordinates |
| `GET` | `/farms/:farmId/zones` | Yes | Lists all field zones belonging to the farm |
| `POST` | `/farms/:farmId/zones` | Yes | Creates a new field zone with crop and acreage |
| `GET` | `/zones/:zoneId` | Yes | Retrieves details of a single field zone |
| `PATCH` | `/zones/:zoneId` | Yes | Updates zone crop, area, or irrigation schedule mode |
| `POST` | `/zones/:zoneId/soil-readings` | Yes | Records a field, lab, or sensor soil test |
| `GET` | `/farms/:farmId/soil-readings` | Yes | Retrieves historical soil health tests for the farm |
| `GET` | `/farms/:farmId/weather` | Yes | Fetches cached or live Open-Meteo microclimate forecast |
| `GET` | `/farms/:farmId/alerts` | Yes | Evaluates and returns dynamic soil & climate alerts |
| `POST` | `/zones/:zoneId/predictions/crop` | Yes | Runs Gemini AI crop recommendation engine |
| `GET` | `/zones/:zoneId/predictions` | Yes | Retrieves historical AI prediction runs by type |
| `POST` | `/zones/:zoneId/predictions/pest` | Yes | Runs Gemini Vision leaf pathology diagnosis |
| `GET` | `/farms/:farmId/irrigation-advisory`| Yes | Runs agronomic water deficit calculation |
| `GET` | `/farms/:farmId/yield-estimate` | Yes | Runs FAO/ICAR heuristic yield calculation |

---

# PART 4 — Database Design & Data Isolation

### 4.1 Database Models & Schema Specifications

```mermaid
erDiagram
    User ||--o{ Farm : "owns (ownerId)"
    User ||--o{ SoilReading : "records (submittedBy)"
    User ||--o{ PredictionRun : "initiates (requestedBy)"
    Farm ||--o{ Zone : "contains (farmId)"
    Farm ||--o{ SoilReading : "has tests (farmId)"
    Farm ||--o{ WeatherSnapshot : "caches weather (farmId)"
    Farm ||--o{ PredictionRun : "tracks predictions (farmId)"
    Zone ||--o{ SoilReading : "scoped to (zoneId)"
    Zone ||--o{ PredictionRun : "scoped to (zoneId)"
```

#### 1. `User` Model ([`User.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/models/User.js))
* Stores user identity and authentication credentials.
* **Fields:** `name` (String), `email` (String, unique, lowercase), `passwordHash` (String, hidden by default with `select: false`), `preferences` (notifications boolean, theme enum: light/dark/system), `timestamps` (createdAt, updatedAt).

#### 2. `Farm` Model ([`Farm.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/models/Farm.js))
* Stores property boundaries and geographical location.
* **Fields:** `ownerId` (ObjectId referencing User, indexed), `name` (String), `locationLabel` (String), `coordinates` ({ latitude: Number, longitude: Number }), `timezone` (String), `area` (Number), `areaUnit` (enum: ha, acre), `timestamps`.
* **Indexes:** `{ ownerId: 1, createdAt: -1 }`.

#### 3. `Zone` Model ([`Zone.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/models/Zone.js))
* Subdivides farms into distinct management units with specific crops and acreage.
* **Fields:** `farmId` (ObjectId referencing Farm, indexed), `name` (String), `crop` (String), `area` (Number), `areaUnit` (enum: ha, acre), `geometry` (Point or Polygon coordinates), `irrigation` ({ desiredMode: manual/scheduled, targetLitres: Number }), `timestamps`.
* **Indexes:** `{ farmId: 1, createdAt: 1 }`.

#### 4. `SoilReading` Model ([`SoilReading.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/models/SoilReading.js))
* Stores chemical soil tests and volumetric moisture assays.
* **Fields:** `farmId` (ObjectId referencing Farm), `zoneId` (ObjectId referencing Zone), `submittedBy` (ObjectId referencing User), `readings` (embedded subdocuments for `nitrogen`, `phosphorus`, `potassium`, `ph`, `moisture` each with `value` and `unit`), `method` (enum: lab, manual, sensor), `source` (String), `observedAt` (Date), `notes` (String), `timestamps`.
* **Indexes:** `{ farmId: 1, zoneId: 1, observedAt: -1 }`.

#### 5. `WeatherSnapshot` Model ([`WeatherSnapshot.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/models/WeatherSnapshot.js))
* Caches external meteorological telemetry to protect API rate limits.
* **Fields:** `farmId` (ObjectId referencing Farm), `provider` (String, e.g. "open-meteo"), `coordinates` ({ latitude, longitude }), `payload` (Mixed object containing current and daily forecasts), `observedAt` (Date), `fetchedAt` (Date), `expiresAt` (Date).
* **Indexes:** `{ farmId: 1, fetchedAt: -1 }` and a **TTL Index** `{ expiresAt: 1 }, { expireAfterSeconds: 0 }`. MongoDB automatically deletes documents once `expiresAt` has passed.

#### 6. `PredictionRun` Model ([`PredictionRun.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/models/PredictionRun.js))
* Stores an audit log of AI inferences and agronomic model runs.
* **Fields:** `farmId` (ObjectId referencing Farm), `zoneId` (ObjectId referencing Zone), `requestedBy` (ObjectId referencing User), `type` (enum: crop, yield, pest, irrigation), `status` (queued, running, completed, failed), `inputSnapshot` (Mixed object containing the exact parameters passed), `result` (Mixed object containing the returned data), `provider` (gemini, agronomic-engine), `modelVersion` (String), `promptVersion` (String), `error` (String), `completedAt` (Date).
* **Indexes:** `{ farmId: 1, createdAt: -1 }`.

---

# PART 5 — How the Intelligent Features Work

```mermaid
flowchart TD
    subgraph Feature1["1. Crop Recommendation (AI)"]
        A1["Farm Zone + Soil + Weather"] --> B1["Prompt & JSON Schema"]
        B1 --> C1["Google Gemini AI"]
        C1 --> D1["Zod Schema Validation"]
        D1 --> E1["PredictionRun Collection"]
    end

    subgraph Feature2["2. Pest Detection (Multimodal AI)"]
        A2["Leaf Photo (Camera / Upload)"] --> B2["Clean Raw Base64 Bytes"]
        B2 --> C2["Gemini Vision API"]
        C2 --> D2["Pathology Schema Validation"]
        D2 --> E2["PredictionRun Collection"]
    end

    subgraph Feature3["3. Smart Irrigation (Deterministic Math)"]
        A3["Soil Moisture Deficit"] --> B3{"Forecast Rain >= 8mm?"}
        B3 -- Yes --> C3["Status: Delayed (Rain Expected)"]
        B3 -- No --> D3["Litres = Depth (mm) * Area (m²)"]
    end

    subgraph Feature4["4. Yield Prediction (Heuristic Model)"]
        A4["FAO/ICAR Regional Baseline (kg/ha)"] --> B4["Soil Factors (pH, N, P, K)"]
        B4 --> C4["Weather Factors (Heat stress, Rain)"]
        C4 --> D4["Bounded Multiplier (0.60 to 1.35)"]
        D4 --> E4["Expected Yield ± 10% Range"]
    end
```

### 5.1 AI Crop Recommendation Engine
1. **Context Compilation:** The backend fetches the latest soil test for the zone (`readings.ph`, `readings.nitrogen`, etc.) and the Open-Meteo forecast.
2. **Prompt Formulation:** The prompt instructs Gemini to act as a cautious agronomic advisor, recommending crops suited to the specific soil pH and climate while forbidding hallucination if data is missing.
3. **Structured Schema Output:** Google GenAI's `responseSchema` forces Gemini to reply in strict JSON matching `cropRecommendationSchema`.
4. **Validation:** [`cropRecommendationResultSchema.safeParse()`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/services/geminiPredictionService.js#L71) validates the output. If valid, it is stored in `PredictionRun` and sent to the frontend.

### 5.2 Gemini Vision Pest & Pathology Detection
1. **Client Processing:** The user selects or captures a photo. JavaScript's `FileReader` converts the binary file into a data URL string.
2. **Server Validation:** The backend validates file size ($\le 5\text{ MB}$) and strips the data URL prefix using `.replace(/^data:[^;]+;base64,/, "")` to extract raw Base64 bytes.
3. **Visual Inspection:** The image part is sent to Gemini Vision alongside a pathology prompt and schema.
4. **Non-Hallucination Guard:** If Gemini detects that the image is blurry, blank, or not a plant, it returns `identified: false, category: "unknown"`.

### 5.3 Smart Irrigation Advisory Formula
The irrigation advisory is an agronomic mathematical model implemented in [`agronomicEngine.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/services/agronomicEngine.js):

1. **Precipitation Check:**
   $$\text{rainForecast48h} = \text{rainToday} + \text{rainTomorrow}$$
   $$\text{If } \text{rainForecast48h} \ge 8\text{ mm} \quad \text{or} \quad \text{rainProbability} \ge 65\% \implies \textbf{Status: Delayed (Rain Expected)}$$
   *Recommended Litres = 0. Supplemental watering is held to conserve water and prevent root rot.*

2. **Moisture Deficit Calculation:**
   If no rain is expected, soil moisture is compared against optimal cultivar ranges (e.g., Rice: 60–80%):
   $$\text{deficitPct} = \text{targetMoisture} - \text{currentMoisture}$$
   $$\text{recommendedMm} = \min(30, \max(5, \text{round}(\text{deficitPct} \times 0.45)))$$

3. **Volumetric Requirement:**
   $$\text{areaSqM} = \text{areaInHectares} \times 10,000 \quad (\text{or } \text{areaInAcres} \times 4046.86)$$
   $$\text{recommendedLitres} = \text{recommendedMm} \times \text{areaSqM} \quad (\text{since } 1\text{ mm depth on } 1\text{ m}^2 = 1\text{ Litre})$$
   $$\text{estimatedDurationMinutes} = \text{round}\left(\frac{\text{recommendedMm}}{5\text{ mm/hr}} \times 60\right)$$

### 5.4 Crop Yield Heuristic Model
Yield estimation is a transparent benchmark model based on published FAO and ICAR agricultural statistics:

1. **Baseline Potential:** Standard regional yield potentials:
   * Rice: 3,800 kg/ha | Wheat: 3,600 kg/ha | Maize: 5,200 kg/ha | Tomato: 22,000 kg/ha | Potato: 19,000 kg/ha
   $$\text{potentialKg} = \text{baselineKgPerHa} \times \text{areaInHa}$$

2. **Soil Chemical Multipliers:**
   * $\text{Acidic pH } (\text{pH} < \text{optimal} - 0.5): -12\%$
   * $\text{Alkaline pH } (\text{pH} > \text{optimal} + 0.5): -10\%$
   * $\text{Optimal pH}: +4\%$
   * $\text{Low Nitrogen } (<110\text{ mg/kg}): -8\%$ | $\text{Favorable Nitrogen } (140-280\text{ mg/kg}): +5\%$
   * $\text{Low Phosphorus } (<15\text{ mg/kg}): -5\%$
   * $\text{Good Potassium } (\ge 160\text{ mg/kg}): +3\%$

3. **Climatic Multipliers:**
   * $\text{Thermal Heat Stress } (\text{Temp} \ge 36^\circ\text{C}): -8\%$
   * $\text{Optimal Growth Temp } (20-30^\circ\text{C}): +4\%$
   * $\text{Adequate 7-Day Rainfall } (15-80\text{ mm}): +3\%$

4. **Bounding & Interval Calculation:**
   $$\text{combinedFactor} = \min(1.35, \max(0.60, \text{soilFactor} \times \text{weatherFactor}))$$
   $$\text{expectedKg} = \text{round}(\text{potentialKg} \times \text{combinedFactor})$$
   $$\text{minKg} = \text{round}(\text{expectedKg} \times 0.90), \quad \text{maxKg} = \text{round}(\text{expectedKg} \times 1.10)$$

---

# PART 6 — Data Sources, Telemetry & Accuracy

To answer questions about IoT hardware truthfully, use this classification table:

| Category | Telemetry / Metric | Exact Data Origin | Hardware Dependency |
| :--- | :--- | :--- | :--- |
| **Live Weather** | Temp, Humidity, Wind, Pressure | Open-Meteo REST API (`api.open-meteo.com`) | None (Queried via farm GPS coordinates) |
| **Weather Forecast** | 48h Rain, 7-Day Precipitation | Open-Meteo Forecasting Models | None |
| **Soil Chemistry** | Nitrogen, Phosphorus, Potassium, pH | User entry in Soil Panel modal | Manual field kits or lab assays |
| **Soil Moisture** | Volumetric Moisture (%) | User entry or recorded test | Field kit, tensiometer, or IoT probe |
| **Crop Recommendations**| Suitability %, Agronomic Rationale| Google Gemini Generative AI | None (Cloud inference) |
| **Plant Pathology** | Disease Diagnosis, Treatment | Google Gemini Vision Multimodal AI | Mobile phone camera or uploaded photo |
| **Irrigation Advisory** | Water Deficit, Litres, Duration | Deterministic Agronomic Math Formula | None (Advisory model; physical pumps need IoT) |
| **Yield Forecasting** | Harvest kg, Min/Max Ranges | Regional FAO/ICAR Benchmarks + Modifiers | None (Agronomic heuristic calculation) |

### What AgriSense Can Do Today vs What Requires Physical Hardware
* **Fully Functional Without Physical Hardware Today:**
  * Localized live microclimate tracking and 7-day rainfall forecasting.
  * Logging and tracking soil test results across field zones.
  * AI-powered crop selection and multimodal plant pathology from leaf photos.
  * Calculating exact irrigation water volume deficits and timing.
  * Predicting harvest yields with explainable soil/weather factors.
  * Generating PDF audits and multi-sheet Excel workbooks.
* **What Would Require Physical IoT Hardware in the Future:**
  * Automated real-time streaming of soil moisture every minute (requires in-ground RS-485 or LoRaWAN soil probes).
  * Direct physical pump valve actuation (requires an IoT relay controller connected via MQTT).

---

# PART 7 — Professor's Viva Questions & Answers

### Core Software Engineering & Architecture
1. **Why did you choose React for the frontend?**  
   *Answer:* React uses a virtual DOM and component architecture, allowing us to update live weather charts, zone switches, and alert dismissals reactively without full page reloads.

2. **Why use Vite instead of Create React App?**  
   *Answer:* Vite provides instant Hot Module Replacement using native ES Modules during development and creates highly optimized production bundles using Rollup, building our entire app in under two seconds.

3. **Why choose Node.js and Express for the backend?**  
   *Answer:* Node.js uses an asynchronous, non-blocking I/O event loop that efficiently handles concurrent calls to MongoDB, Open-Meteo, and Google Gemini using a single JavaScript codebase across both client and server.

4. **Why choose MongoDB Atlas instead of a relational SQL database like MySQL or PostgreSQL?**  
   *Answer:* Agricultural telemetry involves flexible, semi-structured data. Soil test kits record varying sets of micronutrients, weather APIs return nested forecast trees, and AI models produce dynamic JSON payloads. MongoDB’s document model stores these structures natively without rigid schema migrations.

5. **What is an API?**  
   *Answer:* An Application Programming Interface is a formalized communication contract allowing software applications to exchange data and request operations using standard protocols like HTTP.

6. **What is REST?**  
   *Answer:* Representational State Transfer is an architectural style using standard HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`) with stateless communication, predictable URLs, and structured JSON payloads.

7. **How does JWT authentication work in AgriSense?**  
   *Answer:* When credentials are submitted, the backend verifies the bcrypt password hash. If valid, it signs a JSON Web Token with the user's ID using our secret key. The frontend stores this token and sends it in the `Authorization: Bearer` header on every protected request.

8. **Where is the JWT stored, and why?**  
   *Answer:* It is stored in browser `localStorage`, allowing the session to persist across tab closes and page refreshes.

9. **How do you keep multiple farmers' data isolated in the same database?**  
   *Answer:* Every protected query verifies ownership using `ownerId: req.user._id`. The helper function `getOwnedFarm()` prevents User A from viewing or modifying User B's farm, returning a 404 error if an unowned ID is requested.

10. **What is Mongoose?**  
    *Answer:* Mongoose is an Object Data Modeling library for MongoDB that enforces data types, schema validation rules, default values, and index definitions in JavaScript.

---

### External Integrations & AI Implementation
11. **What is the difference between an internal API and an external API?**  
    *Answer:* Internal APIs are endpoints built in our Express server (like `/farms` or `/zones`) to communicate with our database. External APIs are third-party cloud services (like Google Gemini and Open-Meteo) that our server queries over HTTPS.

12. **How does Google Gemini work in your application?**  
    *Answer:* The server compiles zone soil tests and weather forecasts into a structured prompt. Using the `@google/genai` SDK, it submits this prompt with a strict JSON schema. Gemini returns structured recommendation data that we validate with Zod and persist in MongoDB.

13. **Which Gemini model is configured, and why?**  
    *Answer:* We use `gemini-3.5-flash-lite`. It provides high inference speed, supports multimodal vision inputs, enforces JSON schema compliance, and has active free-tier quota on Google AI Studio.

14. **How does image-based pest and disease detection work?**  
    *Answer:* The client encodes an uploaded or camera-captured leaf image into Base64 format. The server strips header prefixes, validates file size ($\le 5\text{ MB}$), and passes the image bytes to Gemini Vision alongside a pathology prompt and schema.

15. **What happens if a user uploads a blurry photo or an image of an object that is not a plant?**  
    *Answer:* Gemini Vision is instructed to verify that the image contains plant tissue. If unclear or non-agricultural, it returns `identified: false` and `category: "unknown"`, explaining the issue in the diagnosis notes rather than fabricating a disease.

16. **Why do you use Open-Meteo instead of OpenWeatherMap?**  
    *Answer:* Open-Meteo provides free, open-access meteorological and agricultural forecast data without commercial API key requirements, supplying hourly rain probabilities essential for irrigation decisions.

17. **How does the weather caching system work?**  
    *Answer:* To avoid redundant external API calls, our server stores fetched weather in a MongoDB `WeatherSnapshot` collection. It uses a Time-To-Live index that expires documents after 30 minutes, automatically purging stale snapshots.

18. **How does the Farm Map work?**  
    *Answer:* It embeds OpenStreetMap using a dynamic bounding box calculated from the farm's genuine GPS coordinates and zoom level. If coordinates are missing, it shows an empty state rather than fabricating a location.

---

### Agronomic Logic, Calculations & Reliability
19. **How do you calculate smart irrigation requirements?**  
    *Answer:* The server checks if upcoming 48-hour rainfall is $\ge 8\text{ mm}$ or rain probability is $\ge 65\%$. If so, irrigation is delayed. Otherwise, it calculates moisture deficit against crop benchmarks, converts the deficit to mm depth, and calculates total litres based on zone area.

20. **Does your irrigation system activate actual physical pumps?**  
    *Answer:* No. It provides an agronomic decision advisory. Physical pump activation would require an IoT relay gateway, which the UI explains in a hardware notice.

21. **How is crop yield predicted?**  
    *Answer:* We start with regional FAO and ICAR cultivar baseline yields per hectare, scale by field acreage, and apply empirical percentage adjustments for soil pH, nitrogen, phosphorus, potassium, and heat stress.

22. **What is the difference between an AI model and a rule-based agronomic calculation?**  
    *Answer:* AI models (like Gemini) use probabilistic neural networks for unstructured reasoning and visual pathology. Rule-based models (like our irrigation and yield calculators) use deterministic, explainable mathematical formulas based on verified agricultural science.

23. **How does AgriSense work without physical in-ground IoT sensors?**  
    *Answer:* Farmers log soil kit measurements or laboratory assay results. Weather data is retrieved via GPS coordinates from Open-Meteo. The platform operates effectively with manual sampling, and can connect to live IoT streams when hardware is installed.

24. **How are alerts generated dynamically?**  
    *Answer:* When the `/alerts` endpoint is called, the server evaluates current weather and soil readings against threshold rules (e.g., moisture $< 25\%$, temp $\ge 38^\circ\text{C}$). Dismissals are stored in browser `localStorage` scoped to the user and farm.

25. **What happens when an external service like Google Gemini experiences downtime?**  
    *Answer:* Our backend catches the error using [`geminiError.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/lib/geminiError.js), hides sensitive keys, and returns a structured 503 error. The frontend catches this, preserves existing data, and displays a Retry button.

26. **What is the function of the exponential backoff in your Gemini service?**  
    *Answer:* Our `withGeminiRetry` utility intercepts transient 503 capacity errors or network timeouts and retries the request up to three times with increasing delays ($1.5\text{s}, 3\text{s}, 6\text{s}$ plus jitter) before failing gracefully.

27. **What is Zod and where is it used?**  
    *Answer:* Zod is a TypeScript-first schema validation library. In AgriSense, it validates incoming HTTP request bodies and runtime JSON responses from Gemini against required schemas.

28. **How does the PDF export feature work?**  
    *Answer:* It generates multi-page PDF documents entirely on the client side using `jspdf`, reading verified records from React context and labeling each data point with its origin.

29. **How does the Excel export work without external server libraries?**  
    *Answer:* It generates OpenXML spreadsheet XML documents in memory and compresses them into `.xlsx` binary workbooks using `fflate`.

30. **What makes AgriSense different from a standard farm dashboard?**  
    *Answer:* Standard dashboards typically display static metrics or generic tables. AgriSense connects live meteorological data to soil chemistry, validates leaf photos with vision AI, and provides explainable, auditable recommendations.

---

### Codebase & Technical Architecture Questions
31. **What does `express-async-handler` do in your routes?**  
    *Answer:* It catches unhandled Promise rejections in asynchronous Express route handlers and forwards them to our centralized error middleware without requiring repetitive `try/catch` blocks.

32. **Why does your User schema use `select: false` on the passwordHash field?**  
    *Answer:* This ensures Mongoose excludes password hashes from database queries by default, preventing accidental exposure in API responses.

33. **What is CORS and how is it configured in your server?**  
    *Answer:* Cross-Origin Resource Sharing is a browser security mechanism. In [`app.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/app.js), the `cors` middleware explicitly restricts API access to our frontend origin (`http://127.0.0.1:5173`).

34. **How do you prevent Base64 decoding errors with the Gemini SDK?**  
    *Answer:* The Gemini SDK expects raw Base64 bytes. In [`geminiVisionService.js`](file:///c:/Users/Atharva/Desktop/AgriSense/server/src/services/geminiVisionService.js), we strip the `data:image/...;base64,` prefix using regular expressions before transmission.

35. **What is a MongoDB compound index and where is it used in AgriSense?**  
    *Answer:* A compound index indexes multiple fields together. In `SoilReading`, we use `{ farmId: 1, zoneId: 1, observedAt: -1 }` to optimize queries for a specific zone's recent test history.

---

# PART 8 — Live 5-to-7 Minute Demonstration Script

Follow this step-by-step walkthrough during your evaluation:

```mermaid
journey
    title 5-to-7 Minute Live Viva Demonstration Flow
    section Introduction
      Log in & introduce architecture: 5: Presenter
    section Field Setup
      Show Settings & Zone Acreage: 4: Presenter
    section Climate & Soil
      Show Live Open-Meteo & Soil Test Log: 5: Presenter
    section AI Inference
      Run Gemini Recommendation & Leaf Scan: 5: Presenter
    section Advisory & Export
      Explain Irrigation Math & Export PDF: 5: Presenter
```

### 1. Introduction & Authentication (Minute 0:00 – 1:00)
* **What to Do:** Open `http://localhost:5173/login`. Log in using your registered account.
* **What to Show:** Point out the clean layout, responsive design, and transition to `/dashboard`.
* **What to Say:**  
  *"Good morning, Professor. This is AgriSense, a full-stack agricultural decision support platform built with React, Node.js, Express, MongoDB Atlas, and Google Gemini AI. When I logged in, our backend verified my salted bcrypt password and issued a JWT token stored in local storage, which isolates my farm data from other users."*

### 2. Farm Configuration & Map (Minute 1:00 – 2:00)
* **What to Do:** Click **Settings** in the sidebar. Show the **Farm Details** and **Farm Zones** tabs. Click on **Farm Map**.
* **What to Show:** Point out the registered farm ("KJ farm"), coordinates (`19.076, 72.8777`), field zone ("North field", 2.5 ha, Rice), and the OpenStreetMap view.
* **What to Say:**  
  *"In Settings, the farmer configures ground-truth data: farm acreage, GPS coordinates, and field zones with specific crops. On the Farm Map, we embed OpenStreetMap centered on these coordinates. Notice our system avoids placeholder data—if coordinates are not set, it prompts configuration rather than showing a fake location."*

### 3. Local Weather & Soil Health (Minute 2:00 – 3:30)
* **What to Do:** Click **Weather**, then navigate to **Soil Health**. Open the **Record Soil Test** modal.
* **What to Show:** The 7-day Open-Meteo forecast and precipitation chart. In Soil Health, show the NPK values, pH gauge, volumetric moisture (38%), and historical test table.
* **What to Say:**  
  *"Our Weather panel connects to the Open-Meteo API using farm coordinates, with snapshots cached in MongoDB using a 30-minute TTL index. In Soil Health, we track verified chemical tests. Here on North field, we have an assay showing 38% moisture and a pH of 6.4, labeled as a manual field test."*

### 4. AI Crop Recommendation & Pest Detection (Minute 3:30 – 5:00)
* **What to Do:** Click **Crop Recommendations**. Select "North field" and click **Run AI Recommendation**. Then open **Pest Detection** and upload a plant leaf photo (or use the camera).
* **What to Show:** The top recommendation card (Rice, suitability score, rationale) and the historical audit run. In Pest Detection, show the pathology findings, scientific name, severity, and treatments.
* **What to Say:**  
  *"In Crop Recommendations, our backend compiles soil readings and local weather, sending them to Google Gemini with a strict JSON schema. In Pest Detection, we send raw leaf image bytes to Gemini Vision. If a blurry or non-plant image is uploaded, it marks it as unknown, preventing hallucinated diagnoses."*
* *Contingency Note:* If external API limits are reached, showcase the previous completed run in the history table.

### 5. Smart Irrigation, Yield & Reports (Minute 5:00 – 6:30)
* **What to Do:** Click **Irrigation**, then **Yield Prediction**, and finish on **Reports**. Click **Export Comprehensive PDF**.
* **What to Show:** The calculated water deficit (250,000 Litres, 120 mins) and the rainfall hold notice. In Yield, show the 10,640 kg estimate with factor breakdown (+4% pH, -8% heat). Open the generated PDF report.
* **What to Say:**  
  *"Our Smart Irrigation engine uses transparent agronomic calculations. Because soil moisture is 38% against a 60% baseline for rice, it calculates a 22% deficit, requiring 250,000 Litres over 120 minutes. If rain was forecast, it would hold watering. Yield prediction adjusts FAO baselines using verified soil nutrients and temperatures. Finally, our reporting tool compiles all verified telemetry into an official PDF report labeled by data origin."*

### 6. Conclusion (Minute 6:30 – 7:00)
* **What to Say:**  
  *"To summarize, AgriSense demonstrates how modern web architecture, cloud databases, and AI can provide practical decision support for farmers while maintaining transparency about data sources and hardware boundaries. Thank you, Professor. I am ready for your questions."*

---

# PART 9 — Honest Limitations & Academic Disclosure

For a transparent academic presentation, be upfront about these system boundaries:

```mermaid
quadrantChart
    title Technical Capability vs Operational Boundary
    x-axis "Manual / User-Assisted" --> "Automated / Cloud"
    y-axis "Heuristic / Advisory" --> "Empirically Verified"
    quadrant-1 "Live Weather Tracking"
    quadrant-2 "Soil Test History"
    quadrant-3 "Advisory Water Balance"
    quadrant-4 "Gemini AI Inferences"
    "Open-Meteo Weather": [0.85, 0.90]
    "Soil Assays Log": [0.25, 0.85]
    "Irrigation Equation": [0.65, 0.45]
    "Yield Heuristic Model": [0.55, 0.35]
    "Gemini Crop Advice": [0.80, 0.30]
    "Gemini Vision Scan": [0.75, 0.40]
```

1. **AI Rate Limits & Quotas:**  
   Google AI Studio's Free Tier has rate limits (RPM) and daily quotas. When limits are exceeded, Gemini returns a 429 error. The application handles this gracefully, displaying clear alerts and Retry buttons.

2. **No Direct Physical IoT Actuation:**  
   The application does not physically actuate water pumps or valves. It provides an agronomic decision advisory. Physical control requires an IoT relay gateway and MQTT broker.

3. **Manual Soil Data Entry:**  
   Without in-ground sensors, soil chemistry values are entered manually from laboratory reports or field testing kits.

4. **Heuristic Yield Estimates vs Scientific Models:**  
   Yield predictions are educational heuristic estimates based on regional FAO/ICAR benchmarks. They provide general guidance rather than guaranteed harvest outcomes.

5. **Internet Connectivity Requirement:**  
   As a cloud-connected architecture (MongoDB Atlas, Gemini API, Open-Meteo), the application requires an active internet connection to authenticate and fetch forecasts.

---

# ONE-PAGE QUICK REVISION CHEAT SHEET

### System Overview & Tech Stack
* **Frontend:** React 19 (SPA), Vite 8, React Router v7, Recharts, jsPDF, fflate.
* **Backend:** Node.js v22, Express 4, Mongoose 8, Zod schema validation, bcryptjs.
* **Database:** MongoDB Atlas with 6 collections: `User`, `Farm`, `Zone`, `SoilReading`, `WeatherSnapshot`, `PredictionRun`.
* **AI Model:** Google Gemini `gemini-3.5-flash-lite` via `@google/genai` SDK.
* **Weather Service:** Open-Meteo REST API (free, open-access, non-commercial).
* **Mapping:** OpenStreetMap embed using coordinate bounding box math.

### Key Equations & Algorithms
* **Moisture Deficit Depth:**
  $$\text{Deficit \%} = \text{Target Moisture} - \text{Current Moisture}$$
  $$\text{Depth (mm)} = \min(30, \max(5, \text{round}(\text{Deficit \%} \times 0.45)))$$
* **Irrigation Water Volume:**
  $$\text{Volume (Litres)} = \text{Depth (mm)} \times \text{Area (m}^2\text{)} \quad (1\text{ mm on } 1\text{ m}^2 = 1\text{ L})$$
* **Irrigation Rain Guard:**
  $$\text{If } \text{Rain}_{\text{48h}} \ge 8\text{ mm} \quad \text{or} \quad \text{Rain Probability} \ge 65\% \implies \text{Hold Irrigation (0 Litres)}$$
* **Yield Prediction:**
  $$\text{Potential (kg)} = \text{Regional Baseline (kg/ha)} \times \text{Area (ha)}$$
  $$\text{Expected Yield} = \text{Potential} \times \text{Combined Factor (bounded between } 0.60 \text{ and } 1.35\text{)}$$
  $$\text{Range} = \text{Expected} \pm 10\%$$

### Security, Isolation & Database Facts
* **Stateless JWT:** Signed with HMAC-SHA256, contains `userId`, validated via Bearer header.
* **Passwords:** Salted and hashed with `bcryptjs` (10 rounds); never stored in plaintext.
* **Multi-Tenant Protection:** Enforced via `Farm.findOne({ _id: farmId, ownerId: req.user._id })`.
* **Weather Snapshot TTL:** MongoDB automatic index: `{ expiresAt: 1 }, { expireAfterSeconds: 0 }`.

### The 4 Intelligent Engines Summary
1. **Crop Recommendation:** Gemini AI + soil test + weather $\to$ structured JSON schema $\to$ `PredictionRun`.
2. **Pest Detection:** Leaf photo $\to$ Base64 bytes $\to$ Gemini Vision $\to$ pathology findings.
3. **Smart Irrigation:** Soil moisture vs crop threshold $\to$ Open-Meteo rain check $\to$ Litres & run time.
4. **Yield Prediction:** FAO baseline $\times$ area $\times$ soil chemical modifiers $\times$ climate modifiers.
