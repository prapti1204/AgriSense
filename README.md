# AgriSense MVP

A React application written in JavaScript (JSX), built with Vite, and backed by an Express/MongoDB API in `server/`. The app uses **AgriSense** branding as requested; the original reference uses CropAI. Settings and the standalone Farm Map extend the original visual style as requested.

## Team setup and run locally

### 1. Share the source code

Push the project to a private GitHub repository and invite your teammates. Commit the application code, `package.json` files, lockfiles, and `server/.env.example`. Do not commit `server/.env`, Atlas passwords, Gemini keys, or any other secrets. The repository ignores `.env`; `server/.env` is currently not tracked.

### 2. Give teammates access to MongoDB Atlas

Atlas is cloud-hosted, so teammates do not need to install MongoDB. Each teammate who needs to connect should:

1. Be invited to the Atlas project if they need to manage the cluster in the Atlas dashboard.
2. Add their current public IP address under **Network Access**. Avoid allowing access from every IP (`0.0.0.0/0`) for a shared project.
3. Use a dedicated database user with only `readWrite` access to the `agrisense` database. Prefer one database user per teammate so access can be revoked individually; do not share an Atlas account or an Atlas project/API key.

The MongoDB connection URI is a secret. Each teammate should put it in their own local `server/.env` file, shared through a password manager or another private channel—not chat committed to Git, a README, or a screenshot. If you want isolated development data, create a separate database such as `agrisense_dev`; everyone using the same database name and cluster shares the same records.

### 3. Install and configure locally

Install Node.js 20.19 or newer. From the project root, teammates run:

```sh
npm install
npm install --prefix server
cp server/.env.example server/.env
```

On Windows Command Prompt, use `copy server\\.env.example server\\.env` instead of `cp`.

Open `server/.env` and replace the sample values:

- `MONGODB_URI`: their Atlas connection URI, with `/agrisense` as the database path before any query string. Replace the username/password placeholders. URL-encode special characters in the password.
- `JWT_SECRET`: a private random value for local sessions; do not copy a production secret into this file.
- `CLIENT_ORIGIN`: keep `http://127.0.0.1:5173` for the default local Vite address.
- `GEMINI_API_KEY`: optional for running the app; required only for the crop recommendation endpoint.

### 4. Start the app

In two terminals, both opened at the project root:

```sh
npm run dev:api
```

```sh
npm run dev
```

Open http://127.0.0.1:5173. Confirm the API is ready at http://127.0.0.1:4000/api/health. The Vite server proxies `/api` to port 4000. For a production frontend build, run `npm run build`; `npm run preview` serves that build locally.

### Does the database work for everyone?

Yes, if each teammate's local `server/.env` has a working URI to the same Atlas cluster/database and Atlas allows their IP. The frontend and API run locally on each teammate's computer, while records are stored in Atlas and are shared. Creating an account, farm, zone, or other records in the shared database makes them visible to the team. Use a development database and avoid storing private or real customer data in it.

The API health endpoint is `/api/health`. The initial API slice includes signup/login/logout, profile and preferences, farm and zone creation/listing/edits, manual soil readings, cached weather, and a Gemini crop recommendation endpoint. Authenticated API routes use an HTTP-only session cookie. The API uses Open-Meteo for weather; Gemini crop recommendations require `GEMINI_API_KEY`.

## Screens

| Screen | Route |
| --- | --- |
| Landing | `/` |
| Login | `/login` |
| Signup | `/signup` |
| Dashboard | `/dashboard` |
| Crop Recommendations | `/dashboard/crop` |
| Weather Monitoring | `/dashboard/weather` |
| Soil Health | `/dashboard/soil` |
| Smart Irrigation | `/dashboard/irrigation` |
| Pest Detection | `/dashboard/pest` |
| Yield Prediction | `/dashboard/yield` |
| Alerts Center | `/dashboard/alerts` |
| Reports | `/dashboard/reports` |
| Interactive Farm Map | `/dashboard/map` |
| Settings | `/dashboard/settings` |

## Demo behavior

- Signup creates an account in MongoDB with a bcrypt password hash. Login uses an HTTP-only cookie session; dashboard routes require a valid API session. Social login is hidden until OAuth is configured.
- Dashboard routes can be opened directly to demonstrate the design.
- Profile and account preferences are stored in MongoDB. Theme, farm demo state, irrigation demo state, dismissed demo alerts, and remaining demo preferences still persist in this browser using localStorage.
- Passwords are never stored. Plant photo selection uses a temporary local preview; scans return a fixed mock result. The camera button demonstrates a scan with a bundled sample photo.
- Alerts support severity filters, dismissal, detail dialogs, and navigation to relevant screens.
- Weather Monitoring fetches current conditions and forecasts from Open-Meteo for the saved farm coordinates. Settings saves farm and zone records to the API; the farm map still uses demo imagery and browser demo state.
- The farm map supports zone selection, data layers, zoom, and shared irrigation controls.
- Reports generate valid PDF and `.xlsx` downloads in the browser using mock values.
- Signup is a regular demo flow. Free-trial and payment-related marketing has been removed.

The backend is an initial implementation, not the complete plan. Satellite ingestion, measured sensor ingestion, image storage/scanning, yield and irrigation predictions, alert generation, real report generation, and full dashboard data migration are not implemented yet. Dates, sensor readings, predictions, and commercial figures shown on dashboard screens may still be demonstration data retained from the reference. Gemini outputs are model-generated recommendations and are not a validated agronomic model.

## Structure and integration points

- `src/pages/`: landing, authentication pages, and the reusable dashboard shell.
- `src/components/dashboard/`: each feature screen.
- `src/components/ui/`: reusable fields, cards, switches, palette, and weather icons.
- `src/context/`: API-backed demo identity plus browser farm state, theme, and feedback.
- `src/data/`: mock readings, browser storage helpers, and report export utilities.
- `src/routes/`: public route definitions.
- `server/src/`: Express API, MongoDB models, authentication, validation, weather and Gemini adapters.
- `public/assets/`: exact photographs referenced by Figma; fonts are bundled through Fontsource.

Future backend integration can replace the context actions and mock data with service calls while preserving page components. The current identity context is only a demo and does not provide access control.

## Reference and verification

[Figma Make reference](https://www.figma.com/make/ebD0WfatczTk2cT9nuIS4p/Smart-Agriculture-Monitoring-System)

All 24 source files returned by Figma MCP were inspected before implementation. The original file contains 13 routes, a Settings placeholder, and an embedded pest risk map. The completed Settings and standalone map bring this implementation to 14 routes.

The original desktop layouts, inline styles, chart configuration, icons, and exact photo variants were retained, with responsive styling and functioning demo controls added. Live screenshot comparison against Figma is unverified: MCP screenshots do not support Make files, the web preview requires sign-in, and native Figma access was unavailable.

Browser verification covered all routes, desktop and mobile layout, form validation, navigation, persistence, shared irrigation state, sample pest results, and report downloads. The exported PDF and Excel workbook were independently opened with PDF and spreadsheet parsers. Actual file selection could not be tested because the browser permission check rejected that action.

Preview images are in `docs/screenshots/`.
