import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';

/** Free OpenStreetMap raster tiles — no API key required. */
export const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
};

/** Esri world imagery — free for display with attribution (no Google key). */
export const SATELLITE_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Tiles © Esri',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'esri',
      type: 'raster',
      source: 'esri',
    },
  ],
};

const customStyleUrl = process.env.EXPO_PUBLIC_MAP_STYLE_URL?.trim();

export function streetMapStyle(): string | StyleSpecification {
  return customStyleUrl && customStyleUrl.length > 0 ? customStyleUrl : OSM_RASTER_STYLE;
}

export function satelliteMapStyle(): StyleSpecification {
  return SATELLITE_RASTER_STYLE;
}
