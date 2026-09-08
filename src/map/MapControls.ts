import { Map, NavigationControl, GlobeControl, type IControl, type LngLatLike } from 'maplibre-gl'

// Styles: dark-matter-gl-style | positron-gl-style | voyager-gl-style
export const STYLE_URL =
  `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json?key=${import.meta.env.VITE_CARTO_KEY}`

export const HOME_VIEW = {
  center: [-82.4, 27.9] as LngLatLike,
  zoom: 4,
  pitch: 45,
  bearing: 0
}

// No native "home" control exists in maplibre-gl (GeolocateControl only
// does live user location, not a fixed point), so this is the minimal
// custom piece needed. Styled with maplibre's own ctrl classes so it
// matches the native buttons exactly.
class HomeControl implements IControl {
  private map?: Map
  private container!: HTMLDivElement

  onAdd(map: Map) {
    this.map = map
    this.container = document.createElement('div')
    this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group'

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'maplibregl-ctrl-icon'
    btn.title = 'Reset view'
    btn.style.display = 'flex'
    btn.style.alignItems = 'center'
    btn.style.justifyContent = 'center'
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z"/>
    </svg>`
    btn.onclick = () => this.map?.easeTo({ ...HOME_VIEW, duration: 800 })

    this.container.appendChild(btn)
    return this.container
  }

  onRemove() {
    this.container.parentNode?.removeChild(this.container)
    this.map = undefined
  }
}

// Replaces the compass button. There's no real terrain here (no
// raster-dem, no map.setTerrain) - this just flips the camera pitch
// between flat and HOME_VIEW's angle, so it's named for what it actually
// does rather than implying real 3D/elevation data.
class TiltControl implements IControl {
  private map?: Map
  private container!: HTMLDivElement
  private btn!: HTMLButtonElement
  private tilted = true

  onAdd(map: Map) {
    this.map = map
    this.container = document.createElement('div')
    this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group'

    this.btn = document.createElement('button')
    this.btn.type = 'button'
    this.btn.className = 'maplibregl-ctrl-icon'
    this.btn.title = 'Toggle tilt'
    this.btn.style.display = 'flex'
    this.btn.style.alignItems = 'center'
    this.btn.style.justifyContent = 'center'
    this.btn.innerHTML = this.icon()
    this.btn.onclick = () => this.toggle()

    this.container.appendChild(this.btn)
    return this.container
  }

  onRemove() {
    this.container.parentNode?.removeChild(this.container)
    this.map = undefined
  }

  private toggle() {
    if (!this.map) return
    const nextPitch = this.tilted ? 0 : HOME_VIEW.pitch
    this.map.easeTo({ pitch: nextPitch, duration: 500 })
    this.tilted = !this.tilted
    this.btn.innerHTML = this.icon()
  }

  // Filled when tilted (click to flatten), outline when flat (click to tilt)
  private icon() {
    return this.tilted
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 4l6 12H8l6-12zM6 12l4 8H2l4-8z"/>
        </svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 4l6 12H8l6-12zM6 12l4 8H2l4-8z"/>
        </svg>`
  }
}

export function addMapControls(map: Map) {
  map.addControl(new HomeControl())
  // Compass removed - TiltControl below replaces it with a toggle that
  // actually reflects what this map can do (pitch), instead of implying
  // bearing control we don't offer anyway (rotation is fully locked).
  map.addControl(new NavigationControl({ showCompass: false }))
  map.addControl(new TiltControl())
  map.addControl(new GlobeControl())
}