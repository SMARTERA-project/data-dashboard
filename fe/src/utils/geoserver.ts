export const WFS_ENDPOINT = 'https://ksimaps.oulu.fi/geoserver/wfs';

type WfsOptions = { cqlFilter?: string; srs?: string };

export function buildWfsUrl(typeNames: string, opts: WfsOptions = {}) {
  const { cqlFilter, srs = 'EPSG:4326' } = opts;
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames,
    outputFormat: 'application/json',
    srsName: srs,
  });
  if (cqlFilter) params.set('CQL_FILTER', cqlFilter);
  return `${WFS_ENDPOINT}?${params.toString()}`;
}
