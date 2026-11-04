# AgriSense — Smart Agricultural Intelligence & Decision Support Platform

AgriSense is a production-grade full-stack agricultural decision support platform. Built with **React 19**, **Vite**, **Node.js (Express)**, **MongoDB Atlas**, **Google Gemini AI**, and **Open-Meteo**, AgriSense delivers localized microclimate forecasting, soil chemistry tracking, AI crop suitability recommendations, multimodal plant pathology detection, explainable irrigation advisories, and heuristic yield estimations.

---

## Architecture & Tech Stack

* **Frontend:** React 19 (JSX), Vite 8, React Router v7, Recharts, Lucide Icons, jsPDF, fflate.
* **Backend:** Node.js v22, Express 4, Mongoose 8, Zod schema validation, bcryptjs, JSON Web Tokens (JWT).
* **Database:** MongoDB Atlas (Cloud NoSQL document store with compound and TTL automatic cache-expiration indexes).
* **AI Integrations:** Google GenAI SDK (`@google/genai`) using `gemini-3.5-flash-lite` for crop reasoning and multimodal leaf image inspection.
* **Weather & Geospatial:** Open-Meteo Meteorological Forecast API and OpenStreetMap dynamic tile embedding.

---

## Team Setup & Running Locally

### 1. Share the Source Code
Clone the repository or pull the latest changes:
```sh
git clone <repository-url>
cd AgriSense
```
Ensure `server/.env` is **never** committed to Git. The repository includes `server/.env.example` as a template.

### 2. Configure MongoDB Atlas
Atlas is cloud-hosted, so teammates do not need a local MongoDB daemon installed:
1. In the MongoDB Atlas dashboard, navigate to **Network Access** and add your current public IP address (or `0.0.0.0/0` for development environments).
2. Create a dedicated database user with `readWrite` access to the `agrisense` database.
3. Obtain your cluster connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/agrisense?retryWrites=true&w=majority
   ```
   *(Ensure special characters in passwords are URL-encoded).*

### 3. Install Dependencies & Configure `.env`
Ensure **Node.js 20.19 or newer** is installed. From the project root:

```sh
# Install frontend dependencies
npm install

# Install backend dependencies
npm install --prefix server

# Copy environment template
cp server/.env.example server/.env
```
*(On Windows Command Prompt, use `copy server\.env.example server\.env` instead of `cp`).*

Open `server/.env` and configure the following parameters:

```env
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://127.0.0.1:5173

# MongoDB Atlas connection URI (replace with your credentials)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/agrisense

# Random secret key for signing authentication JWTs (minimum 32 characters)
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long

# Google AI Studio API Key (for Gemini recommendations and disease detection)
GEMINI_API_KEY=AIzaSy...

# Google Gemini model (gemini-3.5-flash-lite has active free-tier quota)
GEMINI_MODEL=gemini-3.5-flash-lite

# Weather cache expiration in minutes (TTL index in MongoDB)
WEATHER_CACHE_MINUTES=30
```

### 4. Start the Application
Open two terminal windows at the project root:

**Terminal 1 (Backend Express API on port 4000):**
```sh
npm run dev:api
```

**Terminal 2 (Frontend Vite Server on port 5173):**
```sh
npm run dev
```

* **Frontend UI:** Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.
* **API Health Check:** Confirm the backend is running at [http://127.0.0.1:4000/api/health](http://127.0.0.1:4000/api/health).
* **Frontend Production Build:** Run `npm run build` to verify production bundling (built with Vite in ~2 seconds). Run `npm run preview` to test the production bundle locally.

---

## Screen & Route Inventory

| Screen | Route | Description & Live Data Source |
| :--- | :--- | :--- |
| **Landing Page** | `/` | Product overview, features breakdown, and direct login/signup entry. |
| **Authentication** | `/login`, `/signup` | Secure onboarding with bcrypt password hashing and JWT issuance. |
| **Main Dashboard** | `/dashboard` | Live operational overview synthesizing weather, soil tests, field zones, and active alerts. |
| **Crop Recommendations** | `/dashboard/crop` | AI-generated crop suitability recommendations via Google Gemini based on real soil & weather data. |
| **Weather Monitoring** | `/dashboard/weather` | Live microclimate conditions and 7-day agricultural forecasts powered by Open-Meteo. |
| **Soil Health** | `/dashboard/soil` | Field test logging modal, NPK macronutrient tracking, pH gauge, moisture levels, and historical charts. |
| **Smart Irrigation** | `/dashboard/irrigation` | Soil moisture deficit calculations, rainfall hold checks, and water volume requirements (Litres / run-time). |
| **Pest & Disease Detection**| `/dashboard/pest` | Multimodal leaf image analysis via Gemini Vision with biological/chemical treatment suggestions. |
| **Yield Prediction** | `/dashboard/yield` | Explainable harvest potential modeling based on FAO/ICAR cultivar benchmarks and soil/climate factors. |
| **Alerts Center** | `/dashboard/alerts` | Dynamic threshold alert triggers (heat, drought, acidification) with persistent per-user dismissal. |
| **Reports & Dossiers** | `/dashboard/reports` | Client-side export of official PDF dossiers (jsPDF) and 6-sheet Excel workbooks (fflate) with data origin labels. |
| **Interactive Farm Map** | `/dashboard/map` | Real OpenStreetMap view centered on the farm's GPS coordinates with dynamic bounding box zooming. |
| **Settings & Farm Setup** | `/dashboard/settings` | Property configuration, decimal GPS coordinate entry, inline zone management (crop/acreage), and preferences. |

---

## Complete Feature Implementations (All 6 Iterations Complete)

### 1. Multi-Tenant Farm Isolation & Authentication
* Passwords are encrypted with `bcryptjs` (10 salt rounds) and excluded from queries by default (`select: false`).
* Stateless JWT authentication attaches an authorization Bearer token to all requests.
* Strict tenant isolation via `getOwnedFarm(farmId, userId)` ensures users can only access farms and zones they own.

### 2. Live Weather with Intelligent Caching
* Real-time weather is fetched from the Open-Meteo API using the farm's actual latitude and longitude.
* Telemetry is cached in MongoDB (`WeatherSnapshot`) with a 30-minute Time-To-Live (TTL) index, preventing redundant external API calls.

### 3. Verified Soil Health Monitoring
* Farmers can record field kit, laboratory, or sensor test readings (Nitrogen, Phosphorus, Potassium in mg/kg, pH, and volumetric moisture).
* Stores full historical records in MongoDB without fabricating continuous simulated streams.

### 4. AI-Powered Crop Recommendation
* Compiles zone soil chemistry and live weather into a structured prompt sent to Google Gemini (`gemini-3.5-flash-lite`).
* Enforces strict JSON schema validation via Zod. If data is insufficient, Gemini honestly returns `status: "insufficient_data"`.
* Every prediction run is recorded in the `PredictionRun` collection for auditability.

### 5. Multimodal Plant Disease & Pest Detection
* Farmers can upload leaf photos or capture images directly using their device camera (`getUserMedia`).
* Images are validated (< 5 MB) and sent to Gemini Vision.
* Outputs structured pathology: issue name, scientific name, severity, confidence, organic treatments, and conventional management. Blank or non-plant images return `identified: false` to prevent hallucinations.

### 6. Smart Irrigation Advisory
* Computes volumetric moisture deficits against cultivar baselines (e.g., Rice: 60–80%).
* **Precipitation Guard:** If upcoming 48-hour rainfall is $\ge 8\text{ mm}$ or rain probability $\ge 65\%$, status is set to `Delayed (Rain Expected)` and recommended litres is set to 0.
* When irrigation is needed, it calculates exact water volume in Litres ($1\text{ mm depth} \times 1\text{ m}^2 = 1\text{ Litre}$) and estimated pump duration in minutes.
* Clearly labeled as an agronomic advisory; physical pump operation is distinguished from advisory calculations.

### 7. Explainable Yield Prediction
* Utilizes published regional FAO/ICAR crop potential baselines (e.g., Rice: 3,800 kg/ha, Wheat: 3,600 kg/ha).
* Applies empirical adjustments for soil pH ($\pm 12\%$), available Nitrogen ($\pm 8\%$), Phosphorus ($-5\%$), Potassium ($+3\%$), heat stress ($-8\%$ if $>36^\circ\text{C}$), and rainfall sufficiency ($+3\%$).
* Provides minimum, expected, and maximum yield projections with an itemized breakdown of contributing factors.

### 8. Dynamic Alert Evaluation
* Real-time rule evaluation across soil and weather data:
  * Heat Stress: $\ge 38^\circ\text{C}$ | Frost: $\le 3^\circ\text{C}$
  * Drought: Moisture $\le 25\%$ | Waterlogging: Moisture $\ge 85\%$
  * Acidification: $\text{pH} < 5.5$ | Severe Nitrogen Depletion: $\text{N} < 90\text{ mg/kg}$
* Dismissal state is saved in `localStorage` scoped per user and farm, persisting across page reloads.

### 9. Auditable Reports & Document Exports
* **Comprehensive PDF Dossier:** Generated client-side using `jspdf`. Includes official headers, farm overview, verified soil chemistry, weather conditions, irrigation advisories, and yield projections.
* **Complete Excel Workbook:** Multi-sheet `.xlsx` file generated via `fflate` containing 6 sheets (`Farm Summary`, `Field Zones`, `Soil Tests`, `Irrigation Advisory`, `Yield Projections`, `Field Alerts`).
* Every data point is tagged with its origin (`"Laboratory Verified"`, `"IoT Telemetry"`, `"User-Entered Manual"`, `"Live Weather"`, `"Open-Meteo Forecast"`, `"Agronomic Advisory (Modelled)"`, `"Agronomic Heuristic Estimate"`).

### 10. Interactive Farm Map
* Uses OpenStreetMap centered on the farm's genuine GPS coordinates.
* Dynamically calculates bounding box coordinates (`bbox`) as the user zooms in and out.
* Includes missing-coordinate guards that display an empty state prompting configuration rather than showing a fabricated location.

---

## Directory Structure

```
AgriSense/
├── package.json              # Frontend dependencies and scripts
├── vite.config.js            # Vite configuration with /api reverse proxy to port 4000
├── index.html                # Application HTML root
├── public/assets/            # Agricultural photography & static branding assets
├── docs/screenshots/         # Application preview screenshots
├── src/
│   ├── components/
│   │   ├── dashboard/        # Feature panel components (MainDashboard, CropPanel, PestPanel, etc.)
│   │   └── ui/               # Reusable UI controls (PanelCard, Toggle, Palette, Icons)
│   ├── context/              # React Context providers (AuthContext, FarmContext, ThemeContext, FeedbackContext)
│   ├── data/                 # API client wrapper (api.js) and report generators (reportExports.js, xlsxWorkbook.js)
│   ├── pages/                # Top-level page components (Landing, Login, Signup, Dashboard)
│   └── routes/               # Public route definitions
├── server/
│   ├── package.json          # Express API dependencies and scripts
│   ├── .env.example          # Environment variables template
│   ├── .env                  # Local secret configuration (git-ignored)
│   └── src/
│       ├── app.js            # Express application setup, security middleware, and route mounting
│       ├── index.js          # HTTP server listener and graceful shutdown handling
│       ├── config/           # Database connection and validated environment schema
│       ├── middleware/       # JWT auth, validation, rate limiting, and error handling
│       ├── models/           # Mongoose models (User, Farm, Zone, SoilReading, WeatherSnapshot, PredictionRun)
│       ├── routes/           # Express route controllers (authRoutes.js, farmRoutes.js)
│       ├── services/         # Domain engines (agronomicEngine, geminiPredictionService, geminiVisionService, weatherService)
│       └── validators/       # Zod request validation schemas
└── AgriSense_Complete_Project_Guide.md # Comprehensive documentation and viva examination dossier
```

---

## Technical & Academic Disclosures

1. **AI Rate Limits:** Google AI Studio's Free Tier enforces rate limits (RPM) and daily quotas on Gemini models. If limits are reached, the API returns a 429 status code. The application handles this gracefully with exponential backoff retries and UI retry buttons.
2. **Advisory System vs. Physical Actuation:** AgriSense provides scientific irrigation advisories and calculations. It does not directly actuate physical water pumps or valves, which would require an in-field IoT relay controller.
3. **Soil Telemetry:** Without connected in-ground IoT sensors, soil chemistry values are entered manually from field testing kits or laboratory soil analysis reports.
4. **Heuristic Yield Modeling:** Harvest yield projections are educational heuristic estimates based on regional FAO/ICAR cultivar benchmarks. They provide general guidance rather than guaranteed commercial outcomes.
