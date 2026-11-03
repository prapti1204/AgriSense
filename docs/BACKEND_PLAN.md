# AgriSense backend plan

## Goal and scope

Turn the existing React demo into a farm specific application. Build a Node.js API that owns accounts, farms, zones, observations, alerts, and reports. It fetches outside data and offers one stable contract for Gemini-powered predictions. The UI should display the source and observation time of every live value.

The initial usable slice is: sign up, define a farm and its field location, see live weather, save soil readings, view farm zones, and run one prediction against a real input set. Expand to imagery, more predictions, and automation after that works end to end.

## Current implementation status

The first backend scaffold is in `server/`: Express 5, Mongoose, Zod validation, password hashing, HTTP-only JWT cookie sessions, account/profile endpoints, farm and zone endpoints, manual soil readings, cached Open-Meteo weather, and a first crop-recommendation adapter using Gemini structured JSON output. The frontend login and signup call the API, and dashboard routes require an authenticated session. Settings can create or update a farm with coordinates and create/list its zones through the API. Weather Monitoring now loads current conditions and a seven-day forecast from the farm's saved coordinates and shows provider/fetch-time metadata. The Vite development server proxies `/api` to port 4000. MongoDB Atlas connectivity, signup, farm, and zone creation have been confirmed in the user's local setup.

This remains an initial slice; live weather has not yet been confirmed in the user's browser. Gemini has not yet been configured or verified. Satellite ingestion is intentionally deferred. Most dashboard feature panels still contain mock values and browser-persisted demo state; they are not yet migrated to API data. Yield, pest-image, and irrigation predictions are not implemented.

## What the current frontend actually does

| Screen or feature | Current input and behavior | Backend need |
| --- | --- | --- |
| Login, signup, profile | `AuthContext` calls the API and dashboard routes require an authenticated session | Accounts, password hashing, session security, profile updates |
| Farm settings and map | Settings saves one API farm and its zones; the map is still a static photo with percentage markers and demo state | Farm and zone records, geocoded location, field polygons or at least point coordinates; imagery layer only when georeferenced |
| Overview | Hardcoded metric cards plus mock weather, soil, alerts, recommendations | Aggregate the same sources used by each detail screen; remove independent numbers that disagree with detail views |
| Weather | API-backed current conditions, hourly temperature, seven-day forecast and precipitation forecast; refresh action and source/fetch time | Weather adapter keyed by farm coordinates, periodic refresh and cache, observation and forecast timestamps |
| Soil | Static overall NPK/pH/moisture and separate per zone table | Manual sample entry initially; later sensor ingestion. Store units, method, zone, measured time, and freshness |
| Irrigation | Browser only auto mode and zone switches; usage and savings are fixed | Persist schedules, targets, usage and desired mode. Treat switches as planning state until real controllers exist |
| Pest | Upload previews a photo but every scan returns the same result; recent detections are fixed | Validated image upload, scan request/result/history, model adapter and reviewable treatment guidance |
| Crop recommendations | One fixed crop, alternatives, confidence and profit figures | Prediction inputs/results with model version and missing input handling; market price and cost data needed for profit |
| Yield | Fixed crop totals and monthly actual vs predicted chart | Prediction history plus separately recorded actual harvests; do not derive actual yield from satellite alone |
| Alerts | Fixed alerts, browser only dismissal; badge counts another fixed subset | Farm scoped alert rules, read/dismiss state per user, consistent counts and filters |
| Reports | PDF and XLSX are made from hardcoded 2024 numbers | Server supplied report dataset or generated files, period and provenance; do not claim revenue without recorded sales/costs |
| Settings | Browser only notification switches; integration switches simulate connections | Persist preferences; show actual provider/sensor connection status; keep theme locally if desired |

The search bar currently searches navigation labels only. It does not require a search service for the first backend release. Social login is hidden until OAuth is configured.

## Recommended architecture

```text
React UI -> /api/v1 (Express) -> service layer -> MongoDB
                                  |-> weather adapter
                                  |-> satellite imagery adapter
                                  |-> Gemini prediction adapter
                                  |-> private image storage
                    scheduled jobs -> refresh source data, run analyses, evaluate alert rules
```

Use Express and MongoDB for the project's MERN stack, with Mongoose schemas and request validation (Zod). Keep provider credentials only on the server. Use a small scheduled worker/process for ingestion and long running analysis; add a queue only when job volume requires it. Serve the frontend and API from the same origin in production where possible. Version the API from the start. Gemini should interpret normalized, provenance-bearing inputs prepared by the backend; it does not replace weather/satellite providers or geospatial calculations.

Separate **raw observations**, **derived metrics**, and **predictions**. Each value should carry `source`, `observedAt` or `validFor`, `fetchedAt`, `unit`, `quality/status`, and optional `modelVersion`. The API may return `null` plus a reason when data is unavailable. It must never silently substitute demo values into a live response.

## Real data strategy

1. **Farm coordinates:** collect latitude/longitude at onboarding. For satellite analysis, require zone polygons in GeoJSON; the current pixel markers and stock photo cannot be used as geospatial boundaries. A point can support weather while polygon drawing is developed.
2. **Weather:** evaluate Open-Meteo or another weather provider for current, hourly, forecast, and historical data at farm coordinates. Cache according to provider terms and update cadence. Label forecast data distinctly from observations. A weather station is a later optional source.
3. **Satellite (later phase):** evaluate a land-imagery route through Sentinel-2 via Copernicus Data Space or Sentinel Hub. Copernicus Marine is an ocean service, not a farm-field imagery source. Fetch scenes covering zone polygons, filter cloud cover, compute NDVI or similar vegetation indices using geospatial tooling, and record acquisition date/cloud fraction. Send derived features and their provenance to Gemini; do not rely on an LLM to calculate geospatial indices. Revisit periods and clouds mean no guaranteed real-time image. Verify current API terms, quotas, and coverage before choosing a provider.
4. **Soil:** satellite indices are vegetation proxies, not direct N, P, K, pH, or root zone moisture readings. Start with user entered lab/sample readings; later add authenticated sensor ingestion. Never label estimated values as measured.
5. **Yield and economics:** enter actual harvest weight and, if profit is shown, sales prices and costs. Model output is forecast yield with interval and model provenance. Without these records, hide actual and profit metrics or label them unavailable.
6. **Pest images:** user photos are distinct from satellite imagery. Store the upload privately, pass its storage reference to the model adapter, and retain scan/result history.

For an academic MVP, one weather provider plus one satellite vegetation index is sufficient real external data. Avoid making the whole app wait on a paid imagery or prediction service; use provider adapters and fixture based integration tests.

## Data model

| Collection | Core fields |
| --- | --- |
| `users` | email (unique), password hash, name, preferences, createdAt |
| `farms` | ownerId, name, location label, coordinates, timezone, area and areaUnit |
| `zones` | farmId, name, crop, area, GeoJSON polygon or point, irrigation configuration |
| `observations` | farmId, zoneId optional, kind, value, unit, source, method, observedAt, fetchedAt, quality |
| `weatherSnapshots` | farmId, provider, current, hourly, daily, fetchedAt, expiresAt |
| `satelliteScenes` | farmId, zoneId, provider, sceneId, acquiredAt, cloudFraction, index summary, asset reference |
| `predictionRuns` | farmId, zoneId, type (`crop`, `yield`, `pest`, `irrigation`), input snapshot, output, status, provider, modelVersion, createdAt, completedAt, error |
| `pestScans` | farmId, zoneId, image reference, predictionRunId, reviewed status |
| `irrigationPlans` / `irrigationEvents` | farmId, zoneId, mode, scheduledAt, duration, targetLitres, actualLitres, status |
| `harvests` | farmId, zoneId, crop, harvestedAt, actualKg, optional price/cost records |
| `alerts` / `alertStates` | farmId, zoneId optional, type, severity, title, message, generatedAt, source reference; userId, readAt, dismissedAt |
| `reports` | farmId, type, period, generation status, file reference, generatedAt, source snapshot |

Index by farm/zone/time. Check farm ownership on every read and write. Do not store image binary or large satellite rasters in MongoDB; store them in private object storage or a managed file service and keep references in records.

## Proposed API contract

All examples are under `/api/v1`. Return ISO timestamps and numeric values with documented units. Use consistent error objects and pagination on histories.

| Method and path | Purpose |
| --- | --- |
| `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Account lifecycle; use secure HTTP only cookies or another well defined session mechanism |
| `PATCH /me`, `GET/PATCH /me/preferences` | Profile and notification settings |
| `GET/POST /farms`, `GET/PATCH /farms/:farmId` | Farm selection and edits |
| `GET/POST /farms/:farmId/zones`, `GET/PATCH /zones/:zoneId` | Zone details, geometry and crop |
| `GET /farms/:farmId/overview` | Coherent dashboard summary and per card provenance |
| `GET /farms/:farmId/weather` | Current, hourly, seven day and history series |
| `GET /farms/:farmId/soil`, `POST /zones/:zoneId/soil-readings` | Latest readings and manual/sample entry |
| `GET /farms/:farmId/satellite`, `GET /zones/:zoneId/vegetation` | Available scenes and dated vegetation metrics |
| `GET/PATCH /farms/:farmId/irrigation`, `GET/PATCH /zones/:zoneId/irrigation`, `GET /zones/:zoneId/irrigation-events` | Desired mode, plans, and recorded usage; no physical actuator commands in the MVP |
| `POST /farms/:farmId/pest-scans`, `GET /farms/:farmId/pest-scans`, `GET /pest-scans/:scanId` | Multipart photo scan and history; `202 Accepted` with status if asynchronous |
| `POST /zones/:zoneId/predictions/crop`, `POST /zones/:zoneId/predictions/yield`, `GET /prediction-runs/:runId` | Trigger and poll model runs; save input snapshots |
| `POST /zones/:zoneId/harvests`, `GET /farms/:farmId/yield` | Actual yield records and forecast/chart response |
| `GET /farms/:farmId/alerts`, `PATCH /alerts/:alertId`, `POST /farms/:farmId/alerts/read-all` | Filter, mark read/dismiss; unread count comes from same query |
| `GET /farms/:farmId/reports`, `POST /farms/:farmId/reports`, `GET /reports/:reportId/download` | List, generate, download PDF/XLSX using the report's actual dataset |
| `GET /farms/:farmId/integrations` | Provider connection/refresh status; no simulated connect button |

Example prediction response shape:

```json
{
  "id": "run_123",
  "type": "yield",
  "status": "completed",
  "farmId": "farm_123",
  "zoneId": "zone_123",
  "createdAt": "2026-11-03T09:00:00Z",
  "input": { "weatherSnapshotId": "weather_123", "soilReadingIds": ["soil_123"], "satelliteSceneId": "scene_123" },
  "result": { "crop": "rice", "predictedKg": 2050, "lowerKg": 1700, "upperKg": 2350, "confidence": null },
  "provider": "team-model",
  "modelVersion": "0.1.0"
}
```

Keep a consistent outer envelope for Gemini results. `confidence` should only be shown if it can be calibrated; a range can be more honest for yield. For crop recommendations, return ranked crop IDs, qualitative suitability scores, explanatory factors and required input features. For pest results, include disease/pest label, risk, score, treatment text source, and an `uncertain` outcome. Review treatment advice against local agronomic guidance before displaying chemical and dosage instructions.

## Gemini integration boundary

The backend owns input collection, validation, feature normalization, job status, provenance, provider credentials, output validation, persistence, timeouts, and conversion to the public API response. Call Gemini from the server only. Request structured output for each prediction type, validate it again with Zod, and store the model name, prompt/schema version, input snapshot, source timestamps, and result. Use explicit `insufficient_data` and `uncertain` outcomes; never ask Gemini to fill missing sensor or satellite values. Any suitability score is qualitative unless calibrated against outcome data. Review treatment advice against trusted local agronomic guidance before displaying chemical or dosage instructions.

Gemini can receive user-provided plant images, but that does not remove the need for image validation, private storage, result uncertainty, and evaluation against reviewed examples. Add one prediction type at a time. Do not imply that a Gemini-generated yield estimate is validated until it has been compared with actual harvest records. Keep weather, satellite retrieval, raster processing, and irrigation-control boundaries outside the model adapter.

## Build order and completion checks

1. **Foundation:** create `server/`, environment examples, API validation/errors, MongoDB connection and migrations or seed scripts. Sign up/login/logout, ownership checks, and protected dashboard navigation. Check that one user cannot read another user's farm.
2. **Farm and weather vertical slice:** farm/zone CRUD, coordinates, weather provider adapter/cache, overview endpoint, and frontend loading/error/stale states. Check that changing farm location changes the weather response and that provider failure is visible without fabricated values.
3. **Soil, map, irrigation state:** manual soil entry and history; zone geometry; persistent plans/usage/mode. Check source/time/unit display, shared map/irrigation state, and that UI switches do not imply physical activation.
4. **AI contract and first prediction:** complete the Gemini adapter for crop recommendations using real soil/weather inputs. Save run status and input snapshots, validate structured output, and record the configured model. Check missing-data/uncertain behavior and compare recommendations with a reviewed evaluation set before presenting them as reliable.
5. **Pest scans, imagery and alerts:** image validation/storage, scan history, satellite ingestion/index computation, alert rules and per user read state. Check cloud/no scene handling and alert count consistency.
6. **Reports and cleanup:** make all pages use API data, generate reports from recorded data, remove demo claims and stale 2024 numbers, add focused API/integration tests and a deployment runbook. Verify a fresh account can complete the whole flow.

## Decisions to settle before implementation

- First prediction after the crop adapter: choose whether to add yield, pest image scan, or irrigation recommendation; define required inputs and evaluation data for each.
- Pilot farm location and fields: actual coordinates and polygon boundaries, or a clearly identified sample farm for development.
- Soil source: manual lab results or a known sensor device/API; NPK and pH cannot be filled from satellite imagery.
- Whether irrigation is only a planning feature or will connect to physical controllers. Physical control needs a separate safety and device integration design.
- Whether reports need revenue/profit figures; if yes, add harvest sales and expense input before displaying them.
- Weather/imagery provider accounts, quotas, terms, and deployment budget, verified against current documentation.
