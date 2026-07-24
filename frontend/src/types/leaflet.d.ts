import * as L from 'leaflet'

declare module 'leaflet' {
  namespace Control {
    class Draw extends L.Control {
      constructor(options?: any)
    }
  }

  interface DrawEvents {
    Created: {
      layer: L.Layer
      layerType: string
    }
    Edited: {
      layers: L.FeatureGroup
    }
    Deleted: {
      layers: L.FeatureGroup
    }
  }
}
