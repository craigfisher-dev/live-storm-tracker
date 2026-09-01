# Live Storm Tracker

## Overview

A 3D globe application displaying the real atmospheric conditions that drive storm formation, including wind, temperature, and precipitation, alongside actively tracked hurricanes. All data is live and sourced from public agencies. The application includes multiple toggleable layers so a user can view any combination of conditions and events at once, entirely in 3D.

This is not a single purpose hurricane tracker. It is a comprehensive storm visualization tool built around four independent, toggleable layers that together represent the full picture of a storm system: the conditions that enable it, and the tracked event itself.

## Core Concept

Wind, temperature, and moisture are the physical ingredients storms are built from. Hurricanes are the confirmed, tracked result when those ingredients combine. Each layer in this application represents one part of that chain, and each can be shown or hidden independently.

## What the Application Does Not Do

The application does not predict storm formation or forecast paths beyond what the National Hurricane Center itself publishes. It does not simulate weather. It displays current, sourced conditions and actual tracked storms only.

## Technology Stack

| Component | Technology |
|---|---|
| 3D rendering | React, React Three Fiber, three globe |
| Base imagery | NASA GIBS, called directly from the browser, no key required |
| Wind and temperature data | Open Meteo, called directly from the browser, no key required |
| Precipitation radar | RainViewer, called directly from the browser, no key required |
| Hurricane data | National Hurricane Center public storm feed, called directly from the browser, no key required |
| Hosting | Static frontend, Cloudflare Pages or Vercel, free tier |

No backend is required for version one. Every data source is free, requires no key, and can be called directly from the frontend. Exact endpoint URLs and tile patterns should be verified against each provider's current documentation at implementation time rather than assumed from this plan.

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

### NASA GIBS, base imagery

Provides daily updated satellite imagery as XYZ map tiles, used with the tile engine method on the globe object. No key required.

### Open Meteo, wind and temperature

Provides wind speed and direction at the surface and across twenty eight atmospheric pressure levels. Provides current temperature and forecasts up to sixteen days. No key required. Ten thousand requests per day on the free tier for non commercial use.

### RainViewer, radar

Provides the past two hours of radar frames plus a short term forecast, delivered as map tiles. No key required. Free for personal, educational, and small scale use, without a service level agreement.

### National Hurricane Center, hurricanes

Public feed covering the Atlantic and Eastern and Central Pacific basins. No key required. Each active storm includes name, classification, wind speed, pressure, position, movement, and links to the official forecast.

## Build Order

1. Static rotating globe with GIBS base imagery
2. Wind particle layer, built first as a flat proof of concept, then adapted to wrap correctly around the sphere
3. Temperature layer with click for current conditions and forecast
4. Radar tile overlay, using the same tile engine pattern as the base imagery
5. Hurricane markers from the National Hurricane Center feed, positioned so the storm's structure is visible through the wind and radar layers beneath it
6. Layer toggle controls allowing any combination of the four layers to be shown or hidden

## Stretch Goals

- Wind altitude toggle across multiple pressure levels
- Global storm coverage through IBTrACS, labeled as a distinct, less current data source
- Historical storm track lines

## Version One Definition of Done

A globe that can be rotated, with independently toggleable layers for wind, temperature, radar, and active hurricanes, all live and sourced from public data with no fabricated or simulated content.