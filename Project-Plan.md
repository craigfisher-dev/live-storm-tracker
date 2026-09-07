# Live Storm Tracker

## Overview

Live Storm Tracker displays live wind, temperature, radar, and tracked hurricanes on a map, sourced from public agencies. Each is a separate layer the user toggles between.

The application renders as a tilted map with a globe toggle. Height is used where height means something: extruded storm intensity, extruded buildings for local context.

## Core Concept

Wind, temperature, and moisture are the physical ingredients storms are built from. Hurricanes are the confirmed, tracked result when those ingredients combine. Each layer in this application represents one part of that chain, and the user moves between them to see which part they want.

## What the Application Does Not Do

The application does not predict storm formation or forecast paths beyond what the National Hurricane Center itself publishes. It does not simulate weather. It displays current, sourced conditions and actual tracked storms only.

## Technology Stack

### Frontend Framework

- Vite, React and TypeScript template
- React
- TypeScript
- Tailwind CSS, for styling the interface elements such as layer toggle controls and the temperature popup. This is separate from the map rendering, which is MapLibre GL JS.

### Map Rendering

- MapLibre GL JS v6

MapLibre renders vector tiles client side. Every label, road, and boundary is drawn from geometry plus attributes at display time rather than baked into a tile image, so text size, color, halo, and filtering are all controlled from the style.

MapLibre v6 ships ESM only and requires the worker URL to be set explicitly via Vite's `?worker&url` query. Plain `?url` will work in dev and silently fail in production, because the emitted worker loses its sibling shared module and no vector tiles load. Verify with `npm run preview`, not just `npm run dev`.

### Camera and Projection

Mercator by default, with `GlobeControl` giving the user a built in toggle to globe projection.

Bearing is locked at zero. Tilt is not. MapLibre's `dragRotate` is a shim over two internal handlers, so disabling only `_mouseRotate` leaves right drag pitch working while the map can never spin. `_mouseRotate` is private API and can be renamed on a version bump, in which case drag to tilt stops working silently with no error. Recheck after upgrading MapLibre.

Touch and keyboard rotation are disabled through their proper public methods.

### Three Dimensional Elements

3D comes from MapLibre's own primitives rather than a separate engine:

- `fill-extrusion` layers for extruded geometry, used for buildings and for storm intensity
- Camera pitch, which is what makes extrusion visible at all
- deck.gl, added later, for GPU heavy layers such as wind particles and column layers

`fill-extrusion-height` is the only paint property that has to be set, since it defaults to zero and nothing extrudes without it. Color defaults to black, which reads correctly on the light Positron style but disappears on a dark style. Set `fill-extrusion-color` if the basemap ever switches to dark matter.

Every layer gets built flat first, then extruded in a second pass. Flat is shippable on its own, and it separates the data work from the graphics work.

The goal for the extruded pass is showing the true vertical scale of a storm rather than decorating it. Radar intensity and hurricane wind field both have real magnitude, and height is the honest way to render magnitude. How to get there is not decided. Options for radar run from contouring the decoded dBZ grid into polygon bands for a `fill-extrusion` layer, through deck.gl columns sampled from that grid, to a custom WebGL heightmap that samples the dBZ texture per vertex. Steps versus a smooth surface, cheapest versus best looking. Pick after the flat version is working and the data handling is understood.

### Data Sources

Weather and hurricane data sources are called directly from the browser and require no key. The basemap is the one exception: it uses CARTO's vector basemap service, which requires a free API key. See the Data Sources section below for full detail on each.

### Deployment

- wrangler, Cloudflare command line tool, development dependency
- @tailwindcss/vite plugin, integrated into the Vite config for build time styling
- @cloudflare/vite-plugin, integrated into the Vite config for Cloudflare deployment
- Deployment target: Cloudflare Workers with static assets, configured through the Vite plugin rather than a manually uploaded Pages project
- Deployment command: npm run deploy
- Local production preview command: npm run preview

MapLibre requires no Vite plugin. Its worker is handled through a standard Vite import and its CSS through a standard CSS import.

Exact endpoint URLs and tile patterns should be verified against each provider's current documentation at implementation time rather than assumed from this plan.

## Layers and Toggles

Each layer is an independent toggle, meant to be read one or two at a time rather than stacked. Whether any pairs should be mutually exclusive is a decision for when the toggle controls get built.

| Layer | Display | Represents |
|---|---|---|
| Wind | Animated particle flow showing real speed and direction | Atmospheric movement |
| Temperature | Color overlay and click for current conditions and forecast | Conditions that enable storm formation, including ocean heat and temperature gradients |
| Radar | Live precipitation from the past two hours plus short term forecast frames, colored by intensity | Moisture and active rainfall |
| Hurricanes | Position, category, and movement, with wind field extruded by intensity | The confirmed, named, tracked event |
| Buildings | Extruded from basemap vector tiles at high zoom | Local context under a storm |

Planned additional toggles:

- Wind altitude selector, allowing the user to view wind at the surface or at multiple pressure levels including jet stream height
- Global storm coverage beyond the Atlantic and Eastern Pacific basins, clearly labeled as a separate, less frequently updated data source
- Historical track display showing a storm's actual recorded path over time

## Data Sources

### CARTO, basemap

Provides the vector basemap, using the Positron style. Data is OpenStreetMap derived.

Free tier is five million tile requests per calendar month, no CARTO account needed to request a key. The key requirement currently applies only to CARTO's raster endpoints, which are being retired; vector is unaffected for now. CARTO recommends every basemap user hold a key regardless, since the requirement may extend to vector later, so the key is wired in already.

CARTO and OpenStreetMap attribution must remain visible on the map. That is the condition of the free tier. MapLibre renders attribution automatically from the style, so the requirement is met by not removing the attribution control.

Style URL pattern: `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json?key=KEY`. Alternate styles are `dark-matter-gl-style` and `voyager-gl-style`. The `/gl/` path and `-gl-style/style.json` ending mark these as the vector service; raster URLs look like `/rastertiles/voyager/{z}/{x}/{y}.png` and should not be used.

CARTO's vector source is named `carto` in the style JSON, not `openmaptiles`. Layers referencing the basemap's own tiles must use that source name.

Vector basemap data is updated at least once a year, usually every three or six months. Raster data updates may stop entirely as part of the retirement.

Custom styling, if the stock style needs adjusting, is done by downloading the style JSON, editing it, and importing it locally instead of pointing at the hosted URL. Maputnik is a visual editor for this.

**Dev note:** tile responses are cached by the browser for the duration of their `Cache-Control` max-age. Chrome DevTools' "Offline" throttling mode masks this and makes it look like every tile is re-fetched on every reload. Use "No Throttling" and confirm tiles return `(disk cache)` with no request sent before drawing conclusions about tile usage.

### Open Meteo, wind and temperature

Provides wind speed and direction at the surface and across twenty eight atmospheric pressure levels. Provides current temperature and forecasts up to sixteen days. No key required. Ten thousand requests per day on the free tier for non commercial use.

### RainViewer, radar

Provides the past two hours of radar frames plus a short term forecast, delivered as map tiles. No key required. Free for personal, educational, and small scale use, without a service level agreement. Added to MapLibre as a raster source.

Tiles come pre-colored by precipitation intensity, with the color scheme selected as a parameter in the tile URL. Light rain through heavy rain is already encoded, so no client side color ramp is needed for the flat version. A legend will be, since the colors mean nothing without one.

RainViewer also offers a black and white dBZ scheme that encodes raw reflectivity in the pixel channels instead of display colors. The red component carries the value, `R & 128` marks snow, dBZ is `(R & 127) - 32`, and a fully transparent pixel means no radar coverage. This is the route to both custom coloring and any extruded version, since it turns the tile from a picture into a data grid. Format is still PNG either way. RainViewer has no vector tiles, and no radar provider does, because reflectivity is a continuous field rather than discrete geometry.

### National Hurricane Center, hurricanes

Public feed covering the Atlantic and Eastern and Central Pacific basins. No key required. Each active storm includes name, classification, wind speed, pressure, position, movement, and links to the official forecast.

NHC also publishes the forecast track and the cone of uncertainty as vector geometry, which means no contouring step: the cone is already a polygon and can go straight into a `fill-extrusion` layer. Height is ramped by forecast hour, so the cone rises as the forecast gets less certain.

The cone represents horizontal position uncertainty, not storm altitude. Extruding it vertically is a display choice and the legend has to say so, otherwise the layer implies something the data does not.

## Labels

Labels are vector rendered from the basemap style. Font size, weight, color, halo, and which places appear at which zoom are all set in the style.

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
- [x] maplibre-gl installed
- [x] CARTO API key requested and added to .env as VITE_CARTO_KEY
- [x] MapLibre worker URL configured via ?worker&url
- [x] npm run dev running with no errors or warnings
- [x] npm run preview confirmed loading tiles in a production build

## Deployment Setup

- [x] Cloudflare Worker project configured for static assets via the Vite plugin
- [x] First deployment pushed to Cloudflare with npm run deploy

## Build Order

1. [x] Base map
   - [x] MapLibre map instance with CARTO Positron vector style
   - [x] Camera pitch set so extruded geometry is visible
   - [x] Navigation control added
   - [x] Globe control added for the mercator and globe toggle
   - [x] Bearing locked, tilt left free
   - [x] Extruded buildings from the basemap's own vector tiles
2. [ ] Radar raster tile overlay, flat
3. [ ] Hurricane layer from the National Hurricane Center feed
   - [ ] Current position, category, and movement
   - [ ] Forecast track as a line layer
   - [ ] Cone of uncertainty as a `fill-extrusion` polygon, height ramped by forecast hour
4. [ ] Temperature layer with click for current conditions and forecast
5. [ ] Wind particle layer, built first as a static proof of concept, then animated
6. [ ] Layer toggle controls for switching between layers
7. [ ] Extruded pass over radar, once the flat version works

## Stretch Goals

- deck.gl for GPU accelerated wind particles and column layers
- Timeline scrubber for the radar frames
- Wind altitude toggle across multiple pressure levels
- Global storm coverage through IBTrACS, labeled as a distinct, less current data source
- Historical storm track lines
- Tornado tracking, using active tornado warnings from the National Weather Service API, shown as warned areas rather than a precise tracked path, since tornadoes move too quickly and locally for the same kind of position tracking used for hurricanes

## Version One Definition of Done

A tilted, pannable map with independently toggleable layers for wind, temperature, radar, and active hurricanes, all live and sourced from public data with no fabricated or simulated content, with storm intensity and buildings rendered as extruded geometry.

Globe projection is available through `GlobeControl` in version one, but it is unstyled and untested against the weather layers. It is not part of the version one definition of done.

## Version Two

The globe view. Every layer works on the globe, radar included.

- All five layers rendering correctly under globe projection. Raster tiles can seam between zoom levels on a globe, so the radar overlay needs the most work.
- `sky` style properties for sky color, horizon color, fog, and atmosphere blend. This is the base look and comes from the style spec.
- Star field behind the globe. Would be a custom WebGL layer rather than anything in the style spec.
- Shooting stars.
- A sun with directional lighting. Does not need to be astronomically accurate, though tying it to real time is an option since the data is already time stamped.