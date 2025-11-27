import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import { Box, Typography, Skeleton, Grid, Link } from '@mui/material';
import { renderToStaticMarkup } from 'react-dom/server';

import BaseTileLayer from '@/components/maps/BaseTileLayer';
import { buildWfsUrl } from '@/utils/geoserver';
import { clamp01, safeNumber, formatIsoDateToDmy } from '@/utils/number';
import { interpolateHex } from '@/utils/colors';
import { useFitToGeoJson } from '@/hooks/useFitToGeoJson';
import { useInvalidateSizeOnResize } from '@/hooks/useInvalidateSizeOnResize';

import { GeoServerPolygonMapsProps } from '@/types/maps';

import { useTranslation } from 'react-i18next';

type NullValueMode = 'ignore' | 'zero' | 'hide';
type ValueScaleMode = 'auto' | 'numeric' | 'binary' | 'unique';
type ClipStrategy = 'quantile' | 'minmax';
type TooltipFn = (feature: any) => React.ReactNode | string | null;

type VariantOption = {
  nullValueMode?: NullValueMode;
  valueScaleMode?: ValueScaleMode;
  clipStrategy?: ClipStrategy;
  clipQuantiles?: { low: number; high: number };
  categoryLimit?: number;
  categoryPalette?: string[];
  renderFeatureTooltip?: TooltipFn;
  renderMarkerTooltip?: TooltipFn;
};

type ExtendedProps = GeoServerPolygonMapsProps & {
  nullValueMode?: NullValueMode;
  valueScaleMode?: ValueScaleMode;
  clipStrategy?: ClipStrategy;
  clipQuantiles?: { low: number; high: number };
  categoryLimit?: number;
  categoryPalette?: string[];
  variantOptions?: Record<string, VariantOption>;
};

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

const readNumeric = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const GeoServerPolygonMaps: React.FC<ExtendedProps> = ({
  groupTitle,
  variants,
  layerName,
  pilotCode,

  columns = 3,
  mapHeight = 400,

  minColor,
  maxColor,
  showLegend = false,

  renderFeatureTooltip,
  renderMarkerTooltip,

  nullValueMode = 'ignore',
  valueScaleMode = 'auto',
  clipStrategy = 'quantile',
  clipQuantiles = { low: 5, high: 95 },
  categoryLimit = 12,
  categoryPalette,
  variantOptions = {},
}) => {
  const { t, i18n } = useTranslation();

  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const layer = Array.isArray(layerName) ? layerName[0] : layerName;
  const effectiveCql = pilotCode ? `PILOT_AREA = '${pilotCode}'` : undefined;

  useEffect(() => {
    setFeatures([]);
    setError('');
    setTimestamp(null);
    if (!layer) return;

    setLoading(true);
    fetch(buildWfsUrl(layer, { cqlFilter: effectiveCql }))
      .then(res => {
        if (!res.ok) throw new Error(`WFS error ${res.status}`);
        return res.json();
      })
      .then(data => {
        setFeatures(data.features || []);
        setTimestamp(data.timeStamp || null);
      })
      .catch(e => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, [layer, effectiveCql]);

  const formattedDate = useMemo(
    () => formatIsoDateToDmy(timestamp),
    [timestamp]
  );

  const mdCols = Math.max(1, Math.min(12, Math.floor(12 / columns)));
  const rows = Math.max(1, Math.ceil((variants?.length || 1) / columns));
  const fullSkeletonHeight =
    24 + 16 + rows * (mapHeight + (showLegend ? 36 : 0) + 32);
  const showSkeleton = loading;

  const percentile = (sorted: number[], p: number) => {
    if (!sorted.length) return NaN;
    const x = (p / 100) * (sorted.length - 1);
    const i = Math.floor(x);
    const j = Math.ceil(x);
    if (i === j) return sorted[i];
    const t = x - i;
    return sorted[i] * (1 - t) + sorted[j] * t;
  };

  const variantComputations = useMemo(() => {
    return variants.map(v => {
      const opt = variantOptions[v.valueProp] || {};
      const modeNull: NullValueMode = opt.nullValueMode ?? nullValueMode;
      const requestedScale: ValueScaleMode =
        opt.valueScaleMode ?? valueScaleMode;
      const clipMode: ClipStrategy = opt.clipStrategy ?? clipStrategy;
      const q = opt.clipQuantiles ?? clipQuantiles;
      const catLimit = Math.max(2, opt.categoryLimit ?? categoryLimit);
      const catPalette = opt.categoryPalette ?? categoryPalette;

      const vals: number[] = [];
      for (const f of features) {
        const raw = readNumeric(f?.properties?.[v.valueProp]);
        if (raw === null) {
          if (modeNull === 'zero') vals.push(0);
        } else {
          vals.push(raw);
        }
      }

      const set = new Set(vals);
      const isAllZeroOrOne =
        vals.length > 0 && [...set].every(x => x === 0 || x === 1);

      let effectiveScale: Exclude<ValueScaleMode, 'auto'> =
        requestedScale === 'auto'
          ? isAllZeroOrOne
            ? 'binary'
            : 'numeric'
          : requestedScale;

      const uniqueValues = [...new Set(vals)].sort((a, b) => a - b);
      if (requestedScale === 'unique') {
        if (uniqueValues.length > 0 && uniqueValues.length <= catLimit) {
          effectiveScale = 'unique';
        } else {
          effectiveScale = 'numeric';
        }
      }

      if (effectiveScale === 'unique') {
        const k = Math.max(1, uniqueValues.length);
        const colors: string[] =
          catPalette && catPalette.length
            ? uniqueValues.map((_, i) => catPalette[i % catPalette.length])
            : uniqueValues.map((_, i) =>
                interpolateHex(minColor, maxColor, k === 1 ? 1 : i / (k - 1))
              );

        const colorByValue = new Map<number, string>();
        uniqueValues.forEach((val, i) => colorByValue.set(val, colors[i]));

        const getColor = (x: number | undefined) => {
          if (x === undefined || x === null) {
            return colors[0] ?? minColor;
          }
          const c = colorByValue.get(x);
          if (c) return c;
          if (x === 0 && !colorByValue.has(0)) return colors[0] ?? minColor;
          return colors[0] ?? minColor;
        };

        const legendItems = uniqueValues.map((val, i) => ({
          value: val,
          label: String(val),
          color: colors[i],
        }));

        return {
          v,
          modeNull,
          scale: 'unique' as const,
          isBinary: false,
          isUnique: true,
          getColor,
          legendItems,
          legendStops: null as any,
          trueMin: uniqueValues[0] ?? 0,
          trueMax: uniqueValues[uniqueValues.length - 1] ?? 0,
          clipMode,
          clipMin: uniqueValues[0] ?? 0,
          clipMax: uniqueValues[uniqueValues.length - 1] ?? 0,
        };
      }

      if (effectiveScale === 'binary') {
        const colors = [minColor, maxColor];
        const getColor = (x: number) => (x >= 0.5 ? colors[1] : colors[0]);
        const legendStops = [
          {
            color: colors[0],
            label: t('dashboard.maps.helpers.notAvailable'),
            present: set.has(0),
          },
          {
            color: colors[1],
            label: t('dashboard.maps.helpers.available'),
            present: set.has(1),
          },
        ];
        return {
          v,
          modeNull,
          scale: 'binary' as const,
          isBinary: true,
          isUnique: false,
          getColor,
          legendStops,
          trueMin: 0,
          trueMax: 1,
          clipMode,
          clipMin: 0,
          clipMax: 1,
        };
      }

      const sorted = [...vals].sort((a, b) => a - b);
      const trueMin = sorted.length ? sorted[0] : 0;
      const trueMax = sorted.length ? sorted[sorted.length - 1] : 0;

      let clipMin = trueMin;
      let clipMax = trueMax;

      if (clipMode === 'quantile') {
        const pLo = percentile(sorted, Math.max(0, Math.min(100, q.low ?? 5)));
        const pHi = percentile(
          sorted,
          Math.max(0, Math.min(100, q.high ?? 95))
        );
        clipMin = Number.isFinite(pLo) ? pLo : trueMin;
        clipMax = Number.isFinite(pHi) ? pHi : trueMax;
        if (!(clipMax > clipMin)) {
          clipMin = trueMin;
          clipMax = trueMax;
        }
      }

      const span = clipMax - clipMin;
      const toT = (xRaw: number) => {
        if (
          !(Number.isFinite(clipMin) && Number.isFinite(clipMax)) ||
          span <= 0
        )
          return 0;
        const x = safeNumber(xRaw, clipMin);
        const clamped = Math.max(clipMin, Math.min(clipMax, x));
        return clamp01((clamped - clipMin) / span);
      };

      const getColor = (x: number) =>
        interpolateHex(minColor, maxColor, toT(x));

      return {
        v,
        modeNull,
        scale: 'numeric' as const,
        isBinary: false,
        isUnique: false,
        getColor,
        legendStops: null as any,
        trueMin,
        trueMax,
        clipMode,
        clipMin,
        clipMax,
      };
    });
  }, [
    variants,
    features,
    minColor,
    maxColor,
    nullValueMode,
    valueScaleMode,
    clipStrategy,
    clipQuantiles,
    categoryLimit,
    categoryPalette,
    variantOptions,
    i18n.language,
  ]);

  const sharedFitFeatures = useMemo(() => {
    if (!features.length || !variantComputations.length) return features;

    const hideVariants = variantComputations.filter(
      vc => vc.modeNull === 'hide'
    );
    if (hideVariants.length === 0) {
      return features;
    }

    const union: any[] = [];
    for (const f of features) {
      const isVisibleForSomeHideVariant = hideVariants.some(vc => {
        const raw = readNumeric(f?.properties?.[vc.v.valueProp]);
        return raw !== null;
      });
      if (isVisibleForSomeHideVariant) union.push(f);
    }

    return union.length ? union : features;
  }, [features, variantComputations]);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        p: 2,
        width: '100%',
      }}
    >
      {showSkeleton ? (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={fullSkeletonHeight}
        />
      ) : (
        <>
          <Typography variant="h6" fontWeight={700} mb={1} pt={1}>
            {groupTitle}
          </Typography>

          <Grid container spacing={3}>
            {variantComputations.map((c, i) => {
              const opt = variantOptions[c.v.valueProp] || {};
              const perVariantTooltip: TooltipFn | undefined =
                opt.renderFeatureTooltip ||
                opt.renderMarkerTooltip ||
                renderFeatureTooltip ||
                renderMarkerTooltip;

              return (
                <Grid key={c.v.valueProp + i} item xs={12} md={mdCols}>
                  <Box>
                    {c.v.title && (
                      <Typography variant="subtitle1" fontWeight={700} mb={1}>
                        {c.v.title}
                      </Typography>
                    )}

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
                        key={`${layer}|${c.v.valueProp}|${effectiveCql ?? ''}|${c.modeNull}|${c.scale}|${c.clipMode}|${c.clipMin}|${c.clipMax}|${i18n.language}`}
                        center={[50, 10]}
                        zoom={2}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <BaseTileLayer />

                        <GeoJSON
                          data={{ type: 'FeatureCollection', features }}
                          style={(f: any) => {
                            const raw = readNumeric(
                              f?.properties?.[c.v.valueProp]
                            );

                            if (raw === null && c.modeNull === 'hide') {
                              return {
                                color: '#ffffff',
                                opacity: 0,
                                weight: 0,
                                fillColor: '#ffffff',
                                fillOpacity: 0,
                                fill: false,
                              };
                            }

                            let valueForColor: number | undefined =
                              raw ?? undefined;
                            if (raw === null && c.modeNull === 'zero')
                              valueForColor = 0;

                            const fillColor =
                              c.scale === 'unique'
                                ? (c as any).getColor(valueForColor)
                                : (c as any).getColor(
                                    raw === null
                                      ? c.modeNull === 'zero'
                                        ? 0
                                        : c.clipMin
                                      : raw
                                  );

                            return {
                              color: '#ffffff',
                              weight: 0.5,
                              opacity: 1,
                              fillColor,
                              fillOpacity: 0.6,
                              fill: true,
                            };
                          }}
                          onEachFeature={(feature, layer) => {
                            if (!perVariantTooltip) return;

                            const raw = readNumeric(
                              feature?.properties?.[c.v.valueProp]
                            );
                            if (raw === null && c.modeNull === 'hide') return;

                            const valueForTooltip =
                              raw === null
                                ? c.modeNull === 'zero'
                                  ? 0
                                  : raw
                                : raw;

                            const featureForTooltip =
                              valueForTooltip === raw
                                ? feature
                                : {
                                    ...feature,
                                    properties: {
                                      ...feature.properties,
                                      [c.v.valueProp]: valueForTooltip,
                                    },
                                  };

                            const jsx = perVariantTooltip(
                              featureForTooltip as any
                            );
                            if (!jsx) return;

                            const html =
                              typeof jsx === 'string'
                                ? jsx
                                : renderToStaticMarkup(<>{jsx}</>);
                            (layer as any).bindTooltip(html, {
                              direction: 'top',
                              opacity: 1,
                              offset: [0, -2],
                            });
                          }}
                        />

                        <FitToGeoJsonNode features={sharedFitFeatures} />
                        <InvalidateSizeOnResizeNode
                          deps={[sharedFitFeatures.length]}
                        />
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

                    {showLegend && (
                      <Box sx={{ mt: 1 }}>
                        {c.isBinary ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              flexWrap: 'wrap',
                            }}
                          >
                            {(c.legendStops as any[])
                              .filter((s: any) => s.present)
                              .map((s: any) => (
                                <Box
                                  key={s.label}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 14,
                                      height: 14,
                                      bgcolor: s.color,
                                      border: '1px solid #ccc',
                                      borderRadius: 0.5,
                                    }}
                                  />
                                  <Typography variant="caption">
                                    {s.label}
                                  </Typography>
                                </Box>
                              ))}
                          </Box>
                        ) : (c as any).isUnique ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              flexWrap: 'wrap',
                            }}
                          >
                            {(c as any).legendItems.map((item: any) => (
                              <Box
                                key={item.label}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 14,
                                    height: 14,
                                    bgcolor: item.color,
                                    border: '1px solid #ccc',
                                    borderRadius: 0.5,
                                  }}
                                />
                                <Typography variant="caption">
                                  {item.label}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              width: '100%',
                            }}
                          >
                            <Typography variant="caption">
                              {String(Math.round(c.trueMin))}
                            </Typography>

                            <Box
                              sx={{
                                position: 'relative',
                                flex: 1,
                                height: 6,
                                borderRadius: 3,
                                overflow: 'hidden',
                              }}
                            >
                              <Box
                                sx={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: `linear-gradient(90deg, ${minColor}, ${maxColor})`,
                                }}
                              />
                              {(() => {
                                const span = c.trueMax - c.trueMin;
                                const loPct =
                                  span > 0
                                    ? ((c.clipMin - c.trueMin) / span) * 100
                                    : 0;
                                const hiPct =
                                  span > 0
                                    ? ((c.clipMax - c.trueMin) / span) * 100
                                    : 100;
                                return (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      left: `${loPct}%`,
                                      width: `${Math.max(0, hiPct - loPct)}%`,
                                      top: 0,
                                      bottom: 0,
                                      border: '1px solid rgba(0,0,0,0.25)',
                                      borderRadius: 3,
                                      background: 'rgba(255,255,255,0.15)',
                                      pointerEvents: 'none',
                                    }}
                                  />
                                );
                              })()}
                            </Box>

                            <Typography variant="caption">
                              {String(Math.round(c.trueMax))}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

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
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default GeoServerPolygonMaps;
