import { useEffect, useRef } from 'react'
import { Map, setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
// v6 needs ?worker&url, not plain ?url - plain ?url works in dev then
// silently loads no tiles in a production build
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { STYLE_URL, HOME_VIEW, addMapControls } from './map/MapControls'

setWorkerUrl(workerUrl)

function App() {

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: HOME_VIEW.center,
      zoom: HOME_VIEW.zoom,
      pitch: HOME_VIEW.pitch,
      bearing: HOME_VIEW.bearing,
      maxPitch: 60
    })

    mapRef.current = map

    // Pitch is now toggle-only (TiltControl), so all manual tilt/rotate
    // gestures are disabled - right-click-drag, two-finger touch pitch,
    // and keyboard rotation. dragRotate.disable() covers both bearing
    // and pitch since maplibre treats right-drag as one composite
    // handler; no need to reach into private internals anymore.
    map.dragRotate.disable()
    map.touchPitch.disable()
    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()

    addMapControls(map)

    // Layers have to wait for the style, or the source doesn't exist yet
    map.on('load', () => {
      // CARTO names its vector source "carto", not "openmaptiles"
      map.addLayer({
        id: 'buildings-3d',
        type: 'fill-extrusion',
        source: 'carto',
        'source-layer': 'building',
        minzoom: 14,
        // Voyager's own building-top color, so extrusions match the flat
        // footprints underneath. Height has to be set - it defaults to 0,
        // so without it nothing extrudes.
        paint: {
          'fill-extrusion-color': '#f3eadc',
          'fill-extrusion-height': ['get', 'render_height'],
          'fill-extrusion-opacity': 0.85
        }
      })
      // extrusions instead of drifting off them.
      map.setPaintProperty('building-top', 'fill-translate', [0, 0])
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full h-screen" />
  )
}

export default App