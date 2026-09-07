import { useEffect, useRef } from 'react'
import { Map, NavigationControl, GlobeControl, setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
// v6 needs ?worker&url, not plain ?url - plain ?url works in dev then
// silently loads no tiles in a production build
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

setWorkerUrl(workerUrl)

// Styles: dark-matter-gl-style | positron-gl-style | voyager-gl-style
const STYLE_URL =
  `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json?key=${import.meta.env.VITE_CARTO_KEY}`

function App() {

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [-82.4, 27.9],
      zoom: 4,
      pitch: 45,
      bearing: 0,
      maxPitch: 60
    })

    mapRef.current = map

    // Bearing locked, tilt free. dragRotate is a shim over two internal
    // handlers - disabling only _mouseRotate leaves right-drag pitch alive.
    // _mouseRotate is private API: if a MapLibre upgrade renames it, tilt
    // silently stops working with no error. Recheck after version bumps.
    ;(map.dragRotate as any)._mouseRotate.disable()
    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()

    map.addControl(new NavigationControl({ visualizePitch: true }))
    map.addControl(new GlobeControl())

    // Layers have to wait for the style, or the source doesn't exist yet
    map.on('load', () => {
      // CARTO names its vector source "carto", not "openmaptiles"
      map.addLayer({
        id: 'buildings-3d',
        type: 'fill-extrusion',
        source: 'carto',
        'source-layer': 'building',
        minzoom: 13,
        // Height is the only paint property that has to be set - it
        // defaults to 0, so without it nothing extrudes. Color defaults to
        // black, which reads fine on a light style but disappears on
        // dark-matter. Set fill-extrusion-color if switching to a dark style.
        paint: {
          'fill-extrusion-height': ['get', 'render_height']
        }
      })
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