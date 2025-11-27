import * as React from 'react';
import {
  Map as LeafletMap,
  TileLayer as LeafletTileLayer,
  CircleMarker as LeafletCircleMarker,
  Tooltip as LeafletTooltip,
  Layer,
  PathOptions,
} from 'leaflet';
import type { Feature, Geometry } from 'geojson';

declare module 'react-leaflet' {
  export interface MapContainerProps
    extends React.HTMLAttributes<HTMLDivElement> {
    center?: [number, number];
    zoom?: number;
    whenCreated?: (map: LeafletMap) => void;
  }

  export interface TileLayerProps {
    url: string;
    attribution?: string;
  }

  export interface CircleMarkerProps {
    center: [number, number];
    radius?: number;
    pathOptions?: any;
  }

  export interface TooltipProps {
    direction?: string;
    offset?: [number, number];
    opacity?: number;
  }
}

declare module 'react-leaflet' {
  interface GeoJSONProps {
    style?: PathOptions | ((feature?: Feature<Geometry, any>) => PathOptions);
    onEachFeature?: (feature: Feature<Geometry, any>, layer: Layer) => void;
  }
}
