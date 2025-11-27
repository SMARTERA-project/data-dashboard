type LatLng = [number, number];

export function getAllCoords(features: any[]): LatLng[] {
  const coords: LatLng[] = [];
  const pushIf = (c: any) => {
    if (
      Array.isArray(c) &&
      typeof c[0] === 'number' &&
      typeof c[1] === 'number'
    ) {
      coords.push([c[1], c[0]]);
    }
  };
  const walk = (c: any) => {
    if (!c) return;
    if (Array.isArray(c) && Array.isArray(c[0])) c.forEach(walk);
    else pushIf(c);
  };
  for (const f of features || []) walk(f?.geometry?.coordinates);
  return coords;
}

export function getBoundsLatLng(features: any[]) {
  const coords = getAllCoords(features);
  if (coords.length === 0) return null;
  const lats = coords.map(p => p[0]);
  const lngs = coords.map(p => p[1]);
  return {
    southWest: [Math.min(...lats), Math.min(...lngs)] as LatLng,
    northEast: [Math.max(...lats), Math.max(...lngs)] as LatLng,
  };
}

export function getCentroid(features: any[]): LatLng {
  const coords = getAllCoords(features);
  if (coords.length === 0) return [50, 10];
  const [sumLat, sumLng] = coords.reduce(
    ([a, b], [lat, lng]) => [a + lat, b + lng],
    [0, 0]
  );
  return [sumLat / coords.length, sumLng / coords.length];
}
