export interface GeoServerPointMapProps {
  layerName: string;
  title?: string;
  filterFeatures?: (features: any[]) => any[];
  renderMarkerTooltip?: (feature: any) => React.ReactNode;
  mapHeight?: number;
}

export interface Variant {
  valueProp: string;
  title?: string;
}

export interface GeoServerPolygonMapsProps {
  groupTitle: string;
  variants: Variant[];
  layerName: string | string[];
  pilotCode?: string;

  columns?: 1 | 2 | 3 | 4;
  mapHeight?: number;

  minColor?: string;
  maxColor?: string;
  showLegend?: boolean;

  renderFeatureTooltip?: (feature: any) => React.ReactNode | string | null;
  renderMarkerTooltip?: (feature: any) => React.ReactNode | string | null;
}
