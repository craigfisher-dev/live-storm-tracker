# Live Storm Tracker

## Overview

Live Storm Tracker is a 3D globe application that tracks storms by displaying the real atmospheric conditions that drive their formation, including wind, temperature, and precipitation, alongside actively tracked hurricanes. All data is live and sourced from public agencies. The application includes multiple toggleable layers so a user can view any combination of conditions and events at once, entirely in 3D.

This is not a single purpose hurricane tracker. It is a comprehensive storm visualization tool built around four independent, toggleable layers that together represent the full picture of a storm system: the conditions that enable it, and the tracked event itself.

## Core Concept

Wind, temperature, and moisture are the physical ingredients storms are built from. Hurricanes are the confirmed, tracked result when those ingredients combine. Each layer in this application represents one part of that chain, and each can be shown or hidden independently.

## What the Application Does Not Do

The application does not predict storm formation or forecast paths beyond what the National Hurricane Center itself publishes. It does not simulate weather. It displays current, sourced conditions and actual tracked storms only.

## Technology Stack

### Frontend Framework

- Vite, React and TypeScript template
- React
- TypeScript
- Tailwind CSS, for styling the interface elements such as layer toggle controls and the temperature popup. This is separate from the three dimensional rendering, which is CesiumJS.

### Three Dimensional Rendering

- CesiumJS

### Data Sources

Weather and hurricane data sources are called directly from the browser and require no key. Base imagery is the one exception: it uses Esri's ArcGIS basemap service, which requires a free API key. See the Data Sources section below for full detail on each.

### Deployment

- wrangler, Cloudflare command line tool, development dependency
- @tailwindcss/vite plugin, integrated into the Vite config for build time styling
- @cloudflare/vite-plugin, integrated into the Vite config for Cloudflare deployment
- Deployment target: Cloudflare Workers with static assets, configured through the Vite plugin rather than a manually uploaded Pages project
- Deployment command: npm run deploy
- Local production preview command: npm run preview

Weather and hurricane data sources are free, require no key, and are called directly from the frontend. Base imagery uses a free Esri API key instead, since it isn't a keyless service. Exact endpoint URLs and tile patterns should be verified against each provider's current documentation at implementation time rather than assumed from this plan.

## Layers and Toggles

Each layer is an independent toggle. Any combination can be active at once.

| Layer | Display | Represents |
|---|---|---|
| Wind | Animated particle flow showing real speed and direction | Atmospheric movement |
| Temperature | Color overlay and click for current conditions and forecast | Conditions that enable storm formation, including ocean heat and temperature gradients |
| Radar | Live precipitation from the past two hours plus short term forecast frames | Moisture and active rainfall |
| Hurricanes | Active storm position, category, and movement | The confirmed, named, tracked event |

Planned additional toggles:

- Wind altitude selector, allowing the user to view wind at the surface or at multiple pressure levels including jet stream height
- Global storm coverage beyond the Atlantic and Eastern Pacific basins, clearly labeled as a separate, less frequently updated data source
- Historical track display showing a storm's actual recorded path over time

## Data Sources

### Esri, base imagery

Provides satellite imagery as the base layer, using ArcGIS World Imagery. Requires a free Esri API key, scoped to basemaps only and restricted to the app's own domains. Free tier is 2 million tiles per month, no payment method on file, so the basemap simply stops loading if that's ever hit rather than generating a bill. Zoom is capped at level 8 to keep tile usage low, which still shows towns, major roads, and regional context. If usage ever approaches the free tier limit, the fallback is to lower the zoom cap and basemap resolution further before switching providers.

No labels layer right now - see the Labels Todo section below.

### Open Meteo, wind and temperature

Provides wind speed and direction at the surface and across twenty eight atmospheric pressure levels. Provides current temperature and forecasts up to sixteen days. No key required. Ten thousand requests per day on the free tier for non commercial use.

### RainViewer, radar

Provides the past two hours of radar frames plus a short term forecast, delivered as map tiles. No key required. Free for personal, educational, and small scale use, without a service level agreement.

### National Hurricane Center, hurricanes

Public feed covering the Atlantic and Eastern and Central Pacific basins. No key required. Each active storm includes name, classification, wind speed, pressure, position, movement, and links to the official forecast.

## Labels Todo

Currently no labels on the globe - satellite imagery only for now.

Tried and ruled out:

- Esri's older raster boundaries and places layer - text was too small and blurry, baked into the tile images so it can't be resized
- Esri's newer vector-based imagery labels layer - same problem, text still too small
- CARTO's labels-only tiles - hard to read against satellite imagery

Next attempt should not be Esri. Options to look into: a proper city/places dataset (something like Natural Earth's populated places) rendered as real Cesium Label entities instead of a tile layer, so font size is fully controllable and always sharp.

## Project Setup

- [x] Vite, React, and TypeScript scaffold created
- [x] Tailwind CSS installed
- [x] Tailwind CSS configured in the Vite config
- [x] Default Vite starter index.css styling removed
- [x] Default Vite and React starter markup and logic removed from App.tsx
- [x] App.css removed
- [x] Default assets folder icons removed
- [x] Leftover starter content removed from main.tsx
- [x] Wrangler installed
- [x] Cloudflare Vite plugin installed
- [x] Cloudflare Vite plugin configured in vite.config.ts
- [x] wrangler.jsonc generated via wrangler setup
- [x] Deploy and preview scripts added to package.json
- [x] three, react three fiber, drei, and three globe removed, in favor of CesiumJS
- [x] CesiumJS installed
- [x] CesiumJS configured
- [x] npm run dev running with no errors or warnings

## Deployment Setup

- [x] Cloudflare Worker project configured for static assets via the Vite plugin
- [x] First deployment pushed to Cloudflare with npm run deploy, done once the initial commit is ready to go live

## Build Order

1. [ ] Static rotating globe with base imagery
   - [x] Basic sphere rendering with mesh, sphereGeometry, and meshPhongMaterial, built by hand in Three.js and React Three Fiber to learn 3D rendering concepts, before switching the project's rendering approach to CesiumJS
   - [x] CesiumJS viewer set up
   - [x] Esri satellite imagery wired up as the CesiumJS base layer, zoom capped at level 8
   - [ ] Labels - see Labels Todo section
2. [ ] Wind particle layer, built first as a flat proof of concept, then adapted to wrap correctly around the globe
3. [ ] Temperature layer with click for current conditions and forecast
4. [ ] Radar tile overlay, using the same tile engine pattern as the base imagery
5. [ ] Hurricane markers from the National Hurricane Center feed, positioned so the storm's structure is visible through the wind and radar layers beneath it
6. [ ] Layer toggle controls allowing any combination of the four layers to be shown or hidden

## Stretch Goals

- Wind altitude toggle across multiple pressure levels
- Global storm coverage through IBTrACS, labeled as a distinct, less current data source
- Historical storm track lines
- Tornado tracking, using active tornado warnings from the National Weather Service API, shown as warned areas rather than a precise tracked path, since tornadoes move too quickly and locally for the same kind of position tracking used for hurricanes

## Version One Definition of Done

A globe that can be rotated, with independently toggleable layers for wind, temperature, radar, and active hurricanes, all live and sourced from public data with no fabricated or simulated content.