import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, CircleMarker, Tooltip } from 'react-leaflet';
import { Box, Typography, Skeleton, Link } from '@mui/material';

import BaseTileLayer from '@/components/maps/BaseTileLayer';
import { buildWfsUrl } from '@/utils/geoserver';
import { formatIsoDateToDmy } from '@/utils/number';
import {
  valueToBin,
  buildLegendLabels,
  getConsistentIncrement,
} from '@/utils/bins';
import { useFitToGeoJson } from '@/hooks/useFitToGeoJson';
import { useInvalidateSizeOnResize } from '@/hooks/useInvalidateSizeOnResize';

import { GeoServerPointMapProps } from '@/types/maps';

const FitToGeoJsonNode: React.FC<{ features: any[] }> = ({ features }) => {
  useFitToGeoJson(features);
  return null;
};
const InvalidateSizeOnResizeNode: React.FC<{ deps?: any[] }> = ({
  deps = [],
}) => {
  useInvalidateSizeOnResize(deps);
  return null;
};

function makeSixBinSizeScale(features: any[]) {
  const counts = (features || [])
    .map((f: any) => Number(f?.properties?.count ?? 1))
    .filter((n: number) => Number.isFinite(n) && n > 0);

  if (counts.length === 0) {
    const thresholds = [10, 20, 40, 60, 80, 100];
    return {
      thresholds,
      radii: [3, 5, 7, 9, 10.5, 12] as const,
      min: 1,
      max: 100,
    };
  }

  counts.sort((a, b) => a - b);
  const n = counts.length;
  const quantile = (p: number) =>
    counts[Math.min(n - 1, Math.max(0, Math.floor(p * (n - 1))))];

  const raw = [1, 2, 3, 4, 5, 6].map(k => quantile(k / 6));

  const thresholds: number[] = [];
  for (let i = 0; i < raw.length; i++) {
    const inc = getConsistentIncrement(raw[i]);
    let val = Math.ceil(raw[i] / inc) * inc;
    if (i > 0 && val <= thresholds[i - 1]) {
      val = thresholds[i - 1] + inc;
    }
    thresholds.push(val);
  }

  const last = thresholds[thresholds.length - 1];
  if (last < counts[n - 1]) {
    const inc = getConsistentIncrement(counts[n - 1]);
    thresholds[thresholds.length - 1] = Math.ceil(counts[n - 1] / inc) * inc;
  }

  return {
    thresholds,
    radii: [3, 5, 7, 9, 10.5, 12] as const,
    min: counts[0],
    max: counts[n - 1],
  };
}

const GeoServerPointMap: React.FC<GeoServerPointMapProps> = ({
  layerName,
  title,
  filterFeatures,
  renderMarkerTooltip,
  mapHeight = 400,
}) => {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const markerColor = '#1C5240';

  const sizeScale = useMemo(() => makeSixBinSizeScale(features), [features]);

  const markerRadius = (feature: any) => {
    const count = Number(feature?.properties?.count ?? 1);
    return sizeScale.radii[valueToBin(count, sizeScale.thresholds)];
  };

  const legendLabels = useMemo(
    () => buildLegendLabels(sizeScale.min, sizeScale.thresholds),
    [sizeScale.min, sizeScale.thresholds]
  );

  useEffect(() => {
    setFeatures([]);
    setError('');
    setTimestamp(null);
    if (!layerName) return;

    setLoading(true);
    fetch(buildWfsUrl(layerName))
      .then(res => {
        if (!res.ok) throw new Error(`WFS error ${res.status}`);
        return res.json();
      })
      .then(data => {
        let feats = data.features || [];
        if (filterFeatures) feats = filterFeatures(feats);
        setFeatures(feats);
        setTimestamp(data.timeStamp || null);
      })
      .catch(e => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, [layerName, filterFeatures]);

  const formattedDate = formatIsoDateToDmy(timestamp);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        p: 2,
        mb: 3,
        width: '100%',
      }}
    >
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={mapHeight + 120} />
      ) : (
        <>
          <Typography variant="h6" fontWeight={700} mb={1} pt={1}>
            {title}
          </Typography>

          <Box
            sx={{
              height: mapHeight,
              width: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <MapContainer
              key={layerName}
              center={[50, 10]}
              zoom={9}
              style={{ height: '100%', width: '100%' }}
            >
              <BaseTileLayer />

              {features.map((feature, idx) => (
                <CircleMarker
                  key={feature.id || idx}
                  center={[
                    feature?.geometry?.coordinates?.[1],
                    feature?.geometry?.coordinates?.[0],
                  ]}
                  radius={markerRadius(feature)}
                  pathOptions={{
                    color: markerColor,
                    fillColor: markerColor,
                    fillOpacity: 0.6,
                    weight: 0.5,
                  }}
                >
                  {renderMarkerTooltip && (
                    <Tooltip direction="top" offset={[0, -2]} opacity={1}>
                      {renderMarkerTooltip(feature)}
                    </Tooltip>
                  )}
                </CircleMarker>
              ))}

              <FitToGeoJsonNode features={features} />
              <InvalidateSizeOnResizeNode deps={[features.length]} />
            </MapContainer>

            {error && (
              <Typography
                role="alert"
                variant="body2"
                color="error"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  bgcolor: 'background.paper',
                  px: 1,
                  borderRadius: 1,
                }}
              >
                {error}
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 1 }}>
            <Box
              aria-label="Map legend"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                flexWrap: 'wrap',
              }}
            >
              {legendLabels.map((label, i) => {
                const r = sizeScale.radii[i];
                const size = Math.max(6, r * 2);
                return (
                  <Box
                    key={`legend-bin-${i}`}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        width: size,
                        height: size,
                        borderRadius: '50%',
                        bgcolor: markerColor,
                        opacity: 0.6,
                        border: `1px solid ${markerColor}`,
                        flex: '0 0 auto',
                      }}
                    />
                    <Typography variant="caption">{label}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1 }}
          >
            <Link
              href="https://ksimaps.oulu.fi/geoserver"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              color="inherit"
            >
              GeoServer
            </Link>
            {formattedDate ? `, ${formattedDate}` : ''}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default GeoServerPointMap;
