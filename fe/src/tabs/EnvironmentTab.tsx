import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Card, Grid, Skeleton, Box } from '@mui/material';

import { fetchDatapoints } from '@/api/graphql';
import { SearchableGridItem } from '@components/layout/SearchFilter';

import { Datapoint, LabeledData } from '@/types/datapoint';
import { useTranslation } from 'react-i18next';
import { TabProps, MetaInfo } from '@/types/tab';

const BarGraph = lazy(() => import('@components/charts/BarGraph'));
const MiniNumber = lazy(() => import('@components/charts/MiniNumber'));
const MiniAreaGraph = lazy(() => import('@components/charts/MiniAreaGraph'));
const IconGridStats = lazy(() => import('@components/charts/IconGridStats'));
const LineGraph = lazy(() => import('@components/charts/LineGraph'));

const EnvironmentTab: React.FC<TabProps> = ({ region }) => {
  const { t } = useTranslation();

  const [heatingDaysData, setHeatingDaysData] = useState<{
    labels: string[];
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ labels: [], values: [] });
  const [loadingHeatingDays, setLoadingHeatingDays] = useState(true);

  const [coolingDaysData, setCoolingDaysData] = useState<{
    labels: string[];
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ labels: [], values: [] });
  const [loadingCoolingDays, setLoadingCoolingDays] = useState(true);

  const [landUseData, setLandUseData] = useState<{
    labels: string[];
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ labels: [], values: [] });
  const [loadingLandUse, setLoadingLandUse] = useState(true);

  const [recyclingFacilitiesData, setRecyclingFacilitiesData] = useState<{
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ values: [] });
  const [loadingRecyclingFacilities, setLoadingRecyclingFacilities] =
    useState(true);

  const [recyclingPlusData, setRecyclingPlusData] = useState<{
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ values: [] });
  const [loadingRecyclingPlus, setLoadingRecyclingPlus] = useState(true);

  const [energyRecoveryData, setEnergyRecoveryData] = useState<{
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ values: [] });
  const [loadingEnergyRecovery, setLoadingEnergyRecovery] = useState(true);

  const [environmentIconsData, setEnvironmentIconsData] = useState<any[]>([]);
  const [loadingEnvironmentIcons, setLoadingEnvironmentIcons] = useState(true);

  const [additionalEnvIconsData, setAdditionalEnvIconsData] = useState<any[]>(
    []
  );
  const [loadingAdditionalEnvIcons, setLoadingAdditionalEnvIcons] =
    useState(true);

  const [miningBIH, setMiningBIH] = useState<LabeledData & MetaInfo>({
    labels: [],
    values: [],
  });
  const [loadingMiningBIH, setLoadingMiningBIH] = useState(true);

  useEffect(() => {
    if (!region.charts?.environment?.includes('FetchHeatingDays')) return;

    setLoadingHeatingDays(true);
    fetchDatapoints('FetchHeatingDays', { pilot_nuts3: region.pilot_nuts3 })
      .then((data: Datapoint[]) => {
        const sorted = [...data].sort((a, b) => {
          const aYear = a.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          const bYear = b.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          return aYear.localeCompare(bYear);
        });

        const labels = sorted.map(
          d => d.dimensions.find(d => /^\d{4}$/.test(d)) || ''
        );
        const values = sorted.map(d => d.value);
        const meta: MetaInfo = sorted[0] ?? {};

        setHeatingDaysData({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts3,
        });
      })
      .catch(err => console.error('Failed to load FetchHeatingDays data:', err))
      .finally(() => setLoadingHeatingDays(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.environment?.includes('FetchCoolingDays')) return;

    setLoadingCoolingDays(true);
    fetchDatapoints('FetchCoolingDays', { pilot_nuts3: region.pilot_nuts3 })
      .then((data: Datapoint[]) => {
        const sorted = [...data].sort((a, b) => {
          const aYear = a.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          const bYear = b.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          return aYear.localeCompare(bYear);
        });

        const labels = sorted.map(
          d => d.dimensions.find(d => /^\d{4}$/.test(d)) || ''
        );
        const values = sorted.map(d => d.value);
        const meta: MetaInfo = sorted[0] ?? {};

        setCoolingDaysData({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts3,
        });
      })
      .catch(err => console.error('Failed to load FetchCoolingDays data:', err))
      .finally(() => setLoadingCoolingDays(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.environment?.includes('FetchLandUse')) return;

    setLoadingLandUse(true);
    fetchDatapoints('FetchLandUse', { pilot_nuts2: region.pilot_nuts2 })
      .then((data: Datapoint[]) => {
        const categoryMap = new Map<string, number>();

        data.forEach(d => {
          const label = d.dimensions[3];
          const current = categoryMap.get(label) || 0;
          categoryMap.set(label, current + d.value);
        });

        const sorted = Array.from(categoryMap.entries()).sort(([a], [b]) =>
          a.localeCompare(b, 'en', { numeric: true })
        );

        const labels = sorted.map(([label]) => label);
        const values = sorted.map(([, value]) => value);
        const meta: MetaInfo = data[0] ?? {};

        setLandUseData({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(err => console.error('Failed to load FetchLandUse data:', err))
      .finally(() => setLoadingLandUse(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.environment?.includes('FetchRecyclingFacilities'))
      return;

    setLoadingRecyclingFacilities(true);
    fetchDatapoints('FetchRecyclingFacilities', {
      pilot_nuts2: region.pilot_nuts2,
    })
      .then((data: Datapoint[]) => {
        const sorted = [...data].sort((a, b) => {
          const aYear = a.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          const bYear = b.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          return aYear.localeCompare(bYear);
        });

        const values = sorted.map(d => d.value);
        const meta: MetaInfo = sorted[sorted.length - 1] ?? {};

        setRecyclingFacilitiesData({
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(err =>
        console.error('Failed to load FetchRecyclingFacilities data:', err)
      )
      .finally(() => setLoadingRecyclingFacilities(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.environment?.includes('FetchRecyclingPlusFacilities'))
      return;

    setLoadingRecyclingPlus(true);
    fetchDatapoints('FetchRecyclingPlusFacilities', {
      pilot_nuts2: region.pilot_nuts2,
    })
      .then((data: Datapoint[]) => {
        const sorted = [...data].sort((a, b) => {
          const aYear = a.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          const bYear = b.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          return aYear.localeCompare(bYear);
        });

        const values = sorted.map(d => d.value);
        const meta: MetaInfo = sorted[sorted.length - 1] ?? {};

        setRecyclingPlusData({
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(err =>
        console.error('Failed to load FetchRecyclingPlusFacilities data:', err)
      )
      .finally(() => setLoadingRecyclingPlus(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.environment?.includes('FetchEnergyRecovery')) return;

    setLoadingEnergyRecovery(true);
    fetchDatapoints('FetchEnergyRecovery', { pilot_nuts2: region.pilot_nuts2 })
      .then((data: Datapoint[]) => {
        const sorted = [...data].sort((a, b) => {
          const aYear = a.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          const bYear = b.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          return aYear.localeCompare(bYear);
        });

        const values = sorted.map(d => d.value);
        const meta: MetaInfo = sorted[sorted.length - 1] ?? {};

        setEnergyRecoveryData({
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(err =>
        console.error('Failed to load FetchEnergyRecovery data:', err)
      )
      .finally(() => setLoadingEnergyRecovery(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.environment?.includes('FetchEnvironmentIcons')) return;

    setLoadingEnvironmentIcons(true);
    fetchDatapoints('FetchEnvironmentIcons', { pilot: region.pilot })
      .then((data: any) => {
        const source = Array.isArray(data) ? data[0] : data;
        const icons = [
          {
            label: 'OSM_environment.forest',
            icon: 'forest',
            value: source?.forest?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_environment.river',
            icon: 'waves',
            value: source?.river?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_environment.garden',
            icon: 'yard',
            value: source?.garden?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_environment.park',
            icon: 'park',
            value: source?.park?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_environment.nationalPark',
            icon: 'landscape',
            value: source?.national_park?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_environment.protectedArea',
            icon: 'security',
            value: source?.protected_area?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_environment.natureReserve',
            icon: 'eco',
            value: source?.nature_reserve?.[0]?.value ?? 0,
          },
        ];
        setEnvironmentIconsData(icons);
      })
      .catch(err =>
        console.error('Failed to load FetchEnvironmentIcons data:', err)
      )
      .finally(() => setLoadingEnvironmentIcons(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.environment?.includes('FetchAdditionalEnvIcons'))
      return;

    setLoadingAdditionalEnvIcons(true);
    fetchDatapoints('FetchAdditionalEnvIcons', { pilot: region.pilot })
      .then((data: any) => {
        const source = Array.isArray(data) ? data[0] : data;
        const icons = [
          {
            label: 'OSM_environmentAdditional.waterPoint',
            icon: 'water_drop',
            value: source?.waterpoint?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_environmentAdditional.recycling',
            icon: 'recycling',
            value: source?.recycling?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_environmentAdditional.wastewaterPlant',
            icon: 'science',
            value: source?.wastewater?.[0]?.value ?? 0,
          },
        ];
        setAdditionalEnvIconsData(icons);
      })
      .catch(err =>
        console.error('Failed to load FetchAdditionalEnvIcons data:', err)
      )
      .finally(() => setLoadingAdditionalEnvIcons(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.environment?.includes('FetchMiningBIH')) return;

    setLoadingMiningBIH(true);
    fetchDatapoints('FetchMiningBIH', {})
      .then((rows: Datapoint[]) => {
        const pts = rows
          .map(r => {
            const month =
              r.dimensions.find(d => /^\d{4}-(0[1-9]|1[0-2])$/.test(d)) || '';
            return { month, value: Number(r.value), meta: r };
          })
          .sort((a, b) => a.month.localeCompare(b.month));

        const m = pts.at(-1)?.meta ?? rows[0] ?? ({} as any);
        setMiningBIH({
          labels: pts.map(p => p.month),
          values: pts.map(p => p.value),
          region: m.region,
          source: m.source,
          survey: (m as any).surveyName ?? (m as any).survey,
          timestamp: m.timestamp,
        });
      })
      .catch(err => console.error('FetchMiningBIH error:', err))
      .finally(() => setLoadingMiningBIH(false));
  }, [region]);

  const showRecycling = region.charts?.environment?.includes(
    'FetchRecyclingFacilities'
  );
  const showEnergyRecovery = region.charts?.environment?.includes(
    'FetchEnergyRecovery'
  );
  const showRecyclingPlus = region.charts?.environment?.includes(
    'FetchRecyclingPlusFacilities'
  );

  const kpiColTitle = [
    showRecycling && t('dashboard.charts.environment.recyclingFacilitiesCount'),
    showEnergyRecovery && t('dashboard.charts.environment.energyRecovery'),
    showRecyclingPlus &&
      t('dashboard.charts.environment.recyclingPlusFacilitiesCount'),
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <>
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        {region.charts?.environment?.includes('FetchHeatingDays') && (
          <SearchableGridItem
            xs={12}
            md={12}
            lg={12}
            xl={12}
            title={t('dashboard.charts.environment.heatingDegreeDays')}
            regionLevel="nuts3"
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 260 }}>
                {loadingHeatingDays ? (
                  <Skeleton
                    variant="rectangular"
                    sx={{ position: 'absolute', inset: 0, height: '100%' }}
                  />
                ) : (
                  <Suspense
                    fallback={
                      <Skeleton
                        variant="rectangular"
                        sx={{ position: 'absolute', inset: 0, height: '100%' }}
                      />
                    }
                  >
                    <BarGraph
                      title={t(
                        'dashboard.charts.environment.heatingDegreeDays'
                      )}
                      data={heatingDaysData}
                      unit="days"
                      region={heatingDaysData.region}
                      source={heatingDaysData.source}
                      survey={heatingDaysData.survey}
                      timestamp={heatingDaysData.timestamp}
                      regionName={heatingDaysData.regionName}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          </SearchableGridItem>
        )}

        {region.charts?.environment?.includes('FetchCoolingDays') && (
          <SearchableGridItem
            xs={12}
            md={12}
            lg={12}
            xl={12}
            title={t('dashboard.charts.environment.coolingDegreeDays')}
            regionLevel="nuts3"
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 260 }}>
                {loadingCoolingDays ? (
                  <Skeleton
                    variant="rectangular"
                    sx={{ position: 'absolute', inset: 0, height: '100%' }}
                  />
                ) : (
                  <Suspense
                    fallback={
                      <Skeleton
                        variant="rectangular"
                        sx={{ position: 'absolute', inset: 0, height: '100%' }}
                      />
                    }
                  >
                    <BarGraph
                      title={t(
                        'dashboard.charts.environment.coolingDegreeDays'
                      )}
                      data={coolingDaysData}
                      unit="days"
                      barColorHex="#1C5240"
                      region={coolingDaysData.region}
                      source={coolingDaysData.source}
                      survey={coolingDaysData.survey}
                      timestamp={coolingDaysData.timestamp}
                      regionName={coolingDaysData.regionName}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          </SearchableGridItem>
        )}

        {region.charts?.environment?.includes('FetchLandUse') && (
          <SearchableGridItem
            xs={12}
            md={8}
            lg={8}
            xl={8}
            title={t('dashboard.charts.environment.landUseDistribution')}
            regionLevel="nuts2"
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 400 }}>
                {loadingLandUse ? (
                  <Skeleton
                    variant="rectangular"
                    sx={{ position: 'absolute', inset: 0, height: '100%' }}
                  />
                ) : (
                  <Suspense
                    fallback={
                      <Skeleton
                        variant="rectangular"
                        sx={{ position: 'absolute', inset: 0, height: '100%' }}
                      />
                    }
                  >
                    <BarGraph
                      title={t(
                        'dashboard.charts.environment.landUseDistribution'
                      )}
                      data={landUseData}
                      barColorHex="#6BB8AD"
                      region={landUseData.region}
                      source={landUseData.source}
                      survey={landUseData.survey}
                      timestamp={landUseData.timestamp}
                      regionName={landUseData.regionName}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          </SearchableGridItem>
        )}

        {(showRecycling || showEnergyRecovery || showRecyclingPlus) && (
          <SearchableGridItem
            xs={12}
            md={6}
            lg={4}
            xl={4}
            title={kpiColTitle}
            regionLevel="nuts2"
          >
            <Grid container direction="column" rowSpacing={2}>
              {showRecycling && (
                <SearchableGridItem
                  xs={12}
                  title={t(
                    'dashboard.charts.environment.recyclingFacilitiesCount'
                  )}
                  regionLevel="nuts2"
                >
                  <Card sx={{ p: 2 }}>
                    <Box sx={{ position: 'relative', minHeight: 100 }}>
                      {loadingRecyclingFacilities ? (
                        <Skeleton
                          variant="rectangular"
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            height: '100%',
                          }}
                        />
                      ) : (
                        <Suspense
                          fallback={
                            <Skeleton
                              variant="rectangular"
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                height: '100%',
                              }}
                            />
                          }
                        >
                          <MiniNumber
                            title={t(
                              'dashboard.charts.environment.recyclingFacilitiesCount'
                            )}
                            data={recyclingFacilitiesData}
                            unit=""
                            region={recyclingFacilitiesData.region}
                            source={recyclingFacilitiesData.source}
                            survey={recyclingFacilitiesData.survey}
                            timestamp={recyclingFacilitiesData.timestamp}
                            regionName={recyclingFacilitiesData.regionName}
                          />
                        </Suspense>
                      )}
                    </Box>
                  </Card>
                </SearchableGridItem>
              )}

              {showEnergyRecovery && (
                <SearchableGridItem
                  xs={12}
                  title={t('dashboard.charts.environment.energyRecovery')}
                  regionLevel="nuts2"
                >
                  <Card sx={{ p: 2 }}>
                    <Box sx={{ position: 'relative', minHeight: 100 }}>
                      {loadingEnergyRecovery ? (
                        <Skeleton
                          variant="rectangular"
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            height: '100%',
                          }}
                        />
                      ) : (
                        <Suspense
                          fallback={
                            <Skeleton
                              variant="rectangular"
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                height: '100%',
                              }}
                            />
                          }
                        >
                          <MiniAreaGraph
                            title={t(
                              'dashboard.charts.environment.energyRecovery'
                            )}
                            data={energyRecoveryData}
                            region={energyRecoveryData.region}
                            source={energyRecoveryData.source}
                            survey={energyRecoveryData.survey}
                            timestamp={energyRecoveryData.timestamp}
                            regionName={energyRecoveryData.regionName}
                          />
                        </Suspense>
                      )}
                    </Box>
                  </Card>
                </SearchableGridItem>
              )}

              {showRecyclingPlus && (
                <SearchableGridItem
                  xs={12}
                  title={t(
                    'dashboard.charts.environment.recyclingPlusFacilitiesCount'
                  )}
                  regionLevel="nuts2"
                >
                  <Card sx={{ p: 2 }}>
                    <Box sx={{ position: 'relative', minHeight: 100 }}>
                      {loadingRecyclingPlus ? (
                        <Skeleton
                          variant="rectangular"
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            height: '100%',
                          }}
                        />
                      ) : (
                        <Suspense
                          fallback={
                            <Skeleton
                              variant="rectangular"
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                height: '100%',
                              }}
                            />
                          }
                        >
                          <MiniNumber
                            title={t(
                              'dashboard.charts.environment.recyclingPlusFacilitiesCount'
                            )}
                            data={recyclingPlusData}
                            unit=""
                            region={recyclingPlusData.region}
                            source={recyclingPlusData.source}
                            survey={recyclingPlusData.survey}
                            timestamp={recyclingPlusData.timestamp}
                            regionName={recyclingPlusData.regionName}
                          />
                        </Suspense>
                      )}
                    </Box>
                  </Card>
                </SearchableGridItem>
              )}
            </Grid>
          </SearchableGridItem>
        )}

        {region.charts?.environment?.includes('FetchMiningBIH') && (
          <SearchableGridItem
            xs={12}
            lg={12}
            xl={12}
            title={t('dashboard.charts.environment.miningCoalLigniteIndex')}
            regionLevel="nuts1"
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 350 }}>
                {loadingMiningBIH ? (
                  <Skeleton
                    variant="rectangular"
                    sx={{ position: 'absolute', inset: 0, height: '100%' }}
                  />
                ) : (
                  <Suspense
                    fallback={
                      <Skeleton
                        variant="rectangular"
                        sx={{ position: 'absolute', inset: 0, height: '100%' }}
                      />
                    }
                  >
                    <LineGraph
                      title={t(
                        'dashboard.charts.environment.miningCoalLigniteIndex'
                      )}
                      data={miningBIH}
                      unit="index"
                      region={miningBIH.region}
                      source={miningBIH.source}
                      survey={miningBIH.survey}
                      timestamp={miningBIH.timestamp}
                      regionName={region.pilot_nuts1}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          </SearchableGridItem>
        )}

        {region.charts?.environment?.includes('FetchEnvironmentIcons') && (
          <SearchableGridItem
            xs={12}
            md={6}
            lg={6}
            xl={6}
            title={t('dashboard.charts.environment.greenSpaceIndicators')}
            regionLevel={'area'}
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 220 }}>
                {loadingEnvironmentIcons ? (
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      height: '100%',
                      borderRadius: 2,
                    }}
                  />
                ) : (
                  <Suspense
                    fallback={
                      <Skeleton
                        variant="rectangular"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          height: '100%',
                          borderRadius: 2,
                        }}
                      />
                    }
                  >
                    <IconGridStats
                      title={t(
                        'dashboard.charts.environment.greenSpaceIndicators'
                      )}
                      data={environmentIconsData}
                      region={region.pilot}
                      source="OSM"
                      survey="OpenStreetMap"
                      timestamp={new Date().toISOString()}
                      regionName={t(region.title)}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          </SearchableGridItem>
        )}

        {region.charts?.environment?.includes('FetchAdditionalEnvIcons') && (
          <SearchableGridItem
            xs={12}
            md={6}
            lg={6}
            xl={6}
            title={t('dashboard.charts.environment.utilityIndicators')}
            regionLevel={'area'}
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 220 }}>
                {loadingAdditionalEnvIcons ? (
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      height: '100%',
                      borderRadius: 2,
                    }}
                  />
                ) : (
                  <Suspense
                    fallback={
                      <Skeleton
                        variant="rectangular"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          height: '100%',
                          borderRadius: 2,
                        }}
                      />
                    }
                  >
                    <IconGridStats
                      title={t(
                        'dashboard.charts.environment.utilityIndicators'
                      )}
                      data={additionalEnvIconsData}
                      region={region.pilot}
                      source="OSM"
                      survey="OpenStreetMap"
                      timestamp={new Date().toISOString()}
                      regionName={t(region.title)}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          </SearchableGridItem>
        )}
      </Grid>
    </>
  );
};

export default EnvironmentTab;
