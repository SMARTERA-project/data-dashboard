import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { getBoundsLatLng, getCentroid } from '@/utils/geojson';

export function useFitToGeoJson(features: any[]) {
  const map = useMap();
  useEffect(() => {
    if (!features || features.length === 0) return;
    const bounds = getBoundsLatLng(features);
    if (
      bounds &&
      (bounds.southWest[0] !== bounds.northEast[0] ||
        bounds.southWest[1] !== bounds.northEast[1])
    ) {
      map.fitBounds([bounds.southWest as any, bounds.northEast as any], {
        padding: [30, 30],
      });
    } else {
      map.setView(getCentroid(features), 12);
    }
  }, [features, map]);
}
