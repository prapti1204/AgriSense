# AgriSense frontend MVP

A frontend-only React application written in JavaScript (JSX) and built with Vite recreated from the complete source supplied by the connected Figma Make project. The app uses **AgriSense** branding as requested; the original reference uses CropAI. Settings and the standalone Farm Map extend the original visual style as requested.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:5173. For a production build, run `npm run build`. Run `npm run preview` to serve the build locally.

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

- Login accepts a valid email and a password of at least eight characters. Signup also validates the name. Social buttons simulate sign-in.
- Dashboard routes can be opened directly to demonstrate the design.
- Profile, farm details, theme, irrigation states, dismissed alerts, and preferences persist in this browser using localStorage.
- Passwords are never stored. Plant photo selection uses a temporary local preview; scans return a fixed mock result. The camera button demonstrates a scan with a bundled sample photo.
- Alerts support severity filters, dismissal, detail dialogs, and navigation to relevant screens.
- The farm map supports zone selection, data layers, zoom, and shared irrigation controls.
- Reports generate valid PDF and `.xlsx` downloads in the browser using mock values.
- Signup is a regular demo flow. Free-trial and payment-related marketing has been removed.

There is no backend, database, real authentication, external data API, or AI/ML service. Dates, sensor readings, predictions, and commercial figures are demonstration data retained from the reference.

## Structure and integration points

- `src/pages/`: landing, authentication pages, and the reusable dashboard shell.
- `src/components/dashboard/`: each feature screen.
- `src/components/ui/`: reusable fields, cards, switches, palette, and weather icons.
- `src/context/`: browser-only demo identity, farm state, theme, and feedback.
- `src/data/`: mock readings, browser storage helpers, and report export utilities.
- `src/routes/`: public route definitions.
- `public/assets/`: exact photographs referenced by Figma; fonts are bundled through Fontsource.

Future backend integration can replace the context actions and mock data with service calls while preserving page components. The current identity context is only a demo and does not provide access control.

## Reference and verification

[Figma Make reference](https://www.figma.com/make/ebD0WfatczTk2cT9nuIS4p/Smart-Agriculture-Monitoring-System)

All 24 source files returned by Figma MCP were inspected before implementation. The original file contains 13 routes, a Settings placeholder, and an embedded pest risk map. The completed Settings and standalone map bring this implementation to 14 routes.

The original desktop layouts, inline styles, chart configuration, icons, and exact photo variants were retained, with responsive styling and functioning demo controls added. Live screenshot comparison against Figma is unverified: MCP screenshots do not support Make files, the web preview requires sign-in, and native Figma access was unavailable.

Browser verification covered all routes, desktop and mobile layout, form validation, navigation, persistence, shared irrigation state, sample pest results, and report downloads. The exported PDF and Excel workbook were independently opened with PDF and spreadsheet parsers. Actual file selection could not be tested because the browser permission check rejected that action.

Preview images are in `docs/screenshots/`.
