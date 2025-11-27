import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Card, Grid, Skeleton, Box } from '@mui/material';
import { fetchDatapoints } from '@api/graphql/index';
import { useTranslation } from 'react-i18next';

import { Datapoint, LabeledData } from '@/types/datapoint';
import { TabProps, MetaInfo } from '@/types/tab';

import GeoServerPointMap from '@components/maps/GeoServerPointMap';
import GeoServerPolygonMaps from '@components/maps/GeoServerPolygonMaps';
import { SearchableGridItem } from '@components/layout/SearchFilter';

const LineGraph = lazy(() => import('@components/charts/LineGraph'));
const TopNList = lazy(() => import('@components/charts/TopNList'));
const BarGraph = lazy(() => import('@components/charts/BarGraph'));
const DataTable = lazy(() => import('@components/charts/DataTable'));
const IconGridStats = lazy(() => import('@components/charts/IconGridStats'));

const TIME_RE = /^\d{4}(?:-[1-4]Q)?$/;
const timeDim = (dims: string[]) => dims.find(d => TIME_RE.test(d)) ?? '';

const MobilityTab: React.FC<TabProps> = ({ region }) => {
  const { t } = useTranslation();

  const [transportedGoodsData, setTransportedGoodsData] = useState<LabeledData>(
    { labels: [], values: [] }
  );
  const [transportedGoodsBihData, setTransportedGoodsBihData] =
    useState<LabeledData>({ labels: [], values: [] });
  const [loadingTransportedGoodsBih, setLoadingTransportedGoodsBih] =
    useState(true);
  const [importedGoodsData, setImportedGoodsData] = useState<{
    labels: string[];
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ labels: [], values: [] });
  const [electricVehiclesData, setElectricVehiclesData] = useState<{
    labels: string[];
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ labels: [], values: [] });
  const [loadingElectricVehicles, setLoadingElectricVehicles] = useState(true);
  const [loadingImportedGoods, setLoadingImportedGoods] = useState(true);
  const [loadingTransportedGoods, setLoadingTransportedGoods] = useState(true);
  const [topTransported, setTopTransported] = useState<{
    labels: string[];
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ labels: [], values: [] });
  const [loadingTopTransported, setLoadingTopTransported] = useState(true);
  const [transportedDetails, setTransportedDetails] = useState<any[]>([]);
  const [loadingTransportedDetails, setLoadingTransportedDetails] =
    useState(true);
  const [transportedMeta, setTransportedMeta] = useState<{
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({});
  const [railwayPassengersData, setRailwayPassengersData] =
    useState<LabeledData>({ labels: [], values: [] });
  const [loadingRailwayPassengers, setLoadingRailwayPassengers] =
    useState(true);
  const [mobilityIconsData, setMobilityIconsData] = useState<any[]>([]);
  const [loadingMobilityIcons, setLoadingMobilityIcons] = useState(true);
  const [publicTransportIconsData, setPublicTransportIconsData] = useState<
    any[]
  >([]);
  const [loadingPublicTransportIcons, setLoadingPublicTransportIcons] =
    useState(true);
  const [transportedGoodsIndexBihData, setTransportedGoodsIndexBihData] =
    useState<LabeledData>({ labels: [], values: [] });
  const [loadingTransportedGoodsIndexBih, setLoadingTransportedGoodsIndexBih] =
    useState(true);

  useEffect(() => {
    if (!region.charts?.mobility?.includes('FetchTransportedGoodsIndexBIH'))
      return;
    setLoadingTransportedGoodsIndexBih(true);
    fetchDatapoints('FetchTransportedGoodsIndexBIH', {})
      .then((data: Datapoint[]) => {
        const sorted = [...data].sort((a, b) => {
          const ta = timeDim(a.dimensions);
          const tb = timeDim(b.dimensions);
          return ta.localeCompare(tb);
        });
        const labels = sorted.map(d => timeDim(d.dimensions)); // e.g., "2011-1Q"
        const values = sorted.map(d => d.value);
        const meta: MetaInfo = sorted[0] ?? {};
        setTransportedGoodsIndexBihData({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: (meta as any).surveyName ?? meta.survey,
          timestamp: meta.timestamp,
        });
      })
      .catch(err =>
        console.error('Failed to load FetchTransportedGoodsIndexBIH data:', err)
      )
      .finally(() => setLoadingTransportedGoodsIndexBih(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.mobility?.includes('FetchTransportedGoods')) return;
    setLoadingTransportedGoods(true);
    fetchDatapoints('FetchTransportedGoods', {
      pilot_nuts3: region.pilot_nuts3,
    })
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
        setTransportedGoodsData({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts3,
        });
      })
      .catch(err =>
        console.error('Failed to load FetchTransportedGoods data:', err)
      )
      .finally(() => setLoadingTransportedGoods(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.mobility?.includes('FetchTransportedGoodsBIH')) return;
    setLoadingTransportedGoodsBih(true);
    fetchDatapoints('FetchTransportedGoodsBIH', {})
      .then((data: Datapoint[]) => {
        const sorted = [...data].sort((a, b) => {
          const aDim =
            a.dimensions.find(d => /^\d{4}(-Q[1-4])?$/.test(d)) ?? '';
          const bDim =
            b.dimensions.find(d => /^\d{4}(-Q[1-4])?$/.test(d)) ?? '';
          return aDim.localeCompare(bDim);
        });
        const labels = sorted.map(
          d => d.dimensions.find(d => /^\d{4}(-Q[1-4])?$/.test(d)) || ''
        );
        const values = sorted.map(d => d.value);
        const meta: MetaInfo = sorted[0] ?? {};
        setTransportedGoodsBihData({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
        });
      })
      .catch(err =>
        console.error('Failed to load FetchTransportedGoodsBIH data:', err)
      )
      .finally(() => setLoadingTransportedGoodsBih(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.mobility?.includes('FetchTopTransported')) return;
    setLoadingTopTransported(true);
    fetchDatapoints('FetchTopTransported', { pilot_nuts3: region.pilot_nuts3 })
      .then((data: Datapoint[]) => {
        const sorted = data.sort((a, b) => b.value - a.value).slice(0, 7);
        const labels = sorted.map(
          d =>
            d.dimensions.find(
              dim => dim !== 'Annual' && !/^\d{4}$/.test(dim)
            ) || 'Unknown'
        );
        const values = sorted.map(d => d.value);
        const meta: MetaInfo = sorted[0] ?? {};
        setTopTransported({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts3,
        });
      })
      .catch(err =>
        console.error('Failed to load FetchTopTransported data:', err)
      )
      .finally(() => setLoadingTopTransported(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.mobility?.includes('FetchImportedGoods')) return;
    setLoadingImportedGoods(true);
    fetchDatapoints('FetchImportedGoods', { pilot_nuts3: region.pilot_nuts3 })
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
        setImportedGoodsData({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts3,
        });
      })
      .catch(err =>
        console.error('Failed to load FetchImportedGoods data:', err)
      )
      .finally(() => setLoadingImportedGoods(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.mobility?.includes('FetchElectricVehicles')) return;
    setLoadingElectricVehicles(true);
    fetchDatapoints('FetchElectricVehicles', {
      pilot_nuts2: region.pilot_nuts2,
    })
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
        setElectricVehiclesData({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(err =>
        console.error('Failed to load FetchElectricVehicles data:', err)
      )
      .finally(() => setLoadingElectricVehicles(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.mobility?.includes('FetchTransportedDetails')) return;
    setLoadingTransportedDetails(true);
    fetchDatapoints('FetchTransportedDetails', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then((data: Datapoint[]) => {
        const transformed = data.map(d => {
          const year = d.dimensions.find(dim => /^\d{4}$/.test(dim)) || '';
          const mode =
            d.dimensions.find(dim => !['Annual', year].includes(dim)) || '';
          return { year, mode, value: d.value };
        });
        const meta: MetaInfo = data[0] ?? {};
        setTransportedDetails(transformed);
        setTransportedMeta({
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts3,
        });
      })
      .catch(err =>
        console.error('Failed to load FetchTransportedDetails data:', err)
      )
      .finally(() => setLoadingTransportedDetails(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.mobility?.includes('FetchRailwayPassengers')) return;
    setLoadingRailwayPassengers(true);
    fetchDatapoints('FetchRailwayPassengers', {
      pilot_nuts2: region.pilot_nuts2,
    })
      .then((data: Datapoint[]) => {
        const labels = data.map(d => d.dimensions[3]); // destination region
        const values = data.map(d => d.value);
        const meta: MetaInfo = data[0] ?? {};
        setRailwayPassengersData({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(err =>
        console.error('Failed to load FetchRailwayPassengers data:', err)
      )
      .finally(() => setLoadingRailwayPassengers(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.mobility?.includes('FetchMobilityIcons')) return;
    setLoadingMobilityIcons(true);
    fetchDatapoints('FetchMobilityIcons', { pilot: region.pilot })
      .then((data: any) => {
        const iconsSource = Array.isArray(data) ? data[0] : data;
        const icons = [
          {
            label: 'OSM_mobility.parking',
            icon: 'local_parking',
            value: iconsSource?.parking?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_mobility.fuelStation',
            icon: 'local_gas_station',
            value: iconsSource?.fuel_station?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_mobility.cycleBarrier',
            icon: 'pedal_bike',
            value: iconsSource?.cycle_barrier?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_mobility.motorcycleBarrier',
            icon: 'motorcycle',
            value: iconsSource?.motorcycle_barrier?.[0]?.value ?? 0,
          },
        ];
        setMobilityIconsData(icons);
      })
      .catch(err =>
        console.error('Failed to load FetchMobilityIcons data:', err)
      )
      .finally(() => setLoadingMobilityIcons(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.mobility?.includes('FetchPublicTransportIcons')) return;
    setLoadingPublicTransportIcons(true);
    fetchDatapoints('FetchPublicTransportIcons', { pilot: region.pilot })
      .then((data: any) => {
        const iconsSource = Array.isArray(data) ? data[0] : data;
        const icons = [
          {
            label: 'OSM_mobility.motorway',
            icon: 'alt_route',
            value: iconsSource?.motorway?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_mobility.trainStation',
            icon: 'train',
            value: iconsSource?.train_station?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_mobility.publicTransport',
            icon: 'directions_bus',
            value: iconsSource?.public_transport?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_mobility.railways',
            icon: 'directions_railway_2',
            value: iconsSource?.railways?.[0]?.value ?? 0,
          },
        ];
        setPublicTransportIconsData(icons);
      })
      .catch(err =>
        console.error('Failed to load FetchPublicTransportIcons data:', err)
      )
      .finally(() => setLoadingPublicTransportIcons(false));
  }, [region]);

  const showMobilityIcons =
    region.charts?.mobility?.includes('FetchMobilityIcons');
  const showPulbicTransportIcons = region.charts?.mobility?.includes(
    'FetchPublicTransportIcons'
  );

  const miniColTitle = [
    showMobilityIcons &&
      t('dashboard.charts.mobilityTransport.additionalMobilityIndicators'),
    showPulbicTransportIcons &&
      t('dashboard.charts.mobilityTransport.keyPublicTransportIndicators'),
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      {region.charts?.mobility?.includes('FetchTransportedGoods') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={6}
          xl={4}
          title={t('dashboard.charts.mobilityTransport.transportedGoodsLoaded')}
          regionLevel="nuts3"
        >
          <Card
            sx={{ p: 2, height: 390, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingTransportedGoods ? (
                <Skeleton
                  variant="rectangular"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
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
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  }
                >
                  <LineGraph
                    title={t(
                      'dashboard.charts.mobilityTransport.transportedGoodsLoaded'
                    )}
                    data={transportedGoodsData}
                    region={transportedGoodsData.region}
                    source={transportedGoodsData.source}
                    survey={transportedGoodsData.survey}
                    timestamp={transportedGoodsData.timestamp}
                    unit="tkm"
                    regionName={transportedGoodsData.regionName}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.mobility?.includes('FetchTopTransported') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={6}
          xl={4}
          title={t('dashboard.charts.mobilityTransport.mostTransportedGoods')}
          regionLevel="nuts3"
        >
          <Card sx={{ p: 2, height: 390 }}>
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingTopTransported ? (
                <Skeleton
                  variant="rectangular"
                  sx={{ width: '100%', height: 360 }}
                />
              ) : (
                <Suspense
                  fallback={
                    <Skeleton
                      variant="rectangular"
                      sx={{ width: '100%', height: 360 }}
                    />
                  }
                >
                  <TopNList
                    title={t(
                      'dashboard.charts.mobilityTransport.mostTransportedGoods'
                    )}
                    labels={topTransported.labels}
                    values={topTransported.values}
                    region={topTransported.region}
                    source={topTransported.source}
                    survey={topTransported.survey}
                    timestamp={topTransported.timestamp}
                    regionName={topTransported.regionName}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.mobility?.includes('FetchImportedGoods') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={6}
          xl={4}
          title={t(
            'dashboard.charts.mobilityTransport.transportedGoodsUnloaded'
          )}
          regionLevel="nuts3"
        >
          <Card
            sx={{ p: 2, height: 390, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingImportedGoods ? (
                <Skeleton
                  variant="rectangular"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
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
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  }
                >
                  <LineGraph
                    title={t(
                      'dashboard.charts.mobilityTransport.transportedGoodsUnloaded'
                    )}
                    data={importedGoodsData}
                    region={importedGoodsData.region}
                    source={importedGoodsData.source}
                    survey={importedGoodsData.survey}
                    timestamp={importedGoodsData.timestamp}
                    unit="tons"
                    regionName={importedGoodsData.regionName}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.mobility?.includes('FetchElectricVehicles') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={6}
          xl={4}
          title={t('dashboard.charts.mobilityTransport.electricPassengerCars')}
          regionLevel="nuts2"
        >
          <Card
            sx={{ p: 2, height: 500, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingElectricVehicles ? (
                <Skeleton
                  variant="rectangular"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
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
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  }
                >
                  <BarGraph
                    title={t(
                      'dashboard.charts.mobilityTransport.electricPassengerCars'
                    )}
                    data={electricVehiclesData}
                    region={electricVehiclesData.region}
                    source={electricVehiclesData.source}
                    survey={electricVehiclesData.survey}
                    timestamp={electricVehiclesData.timestamp}
                    unit=""
                    barColorHex="#1C5240"
                    regionName={electricVehiclesData.regionName}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.mobility?.includes('FetchTransportedDetails') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={12}
          xl={8}
          title={t(
            'dashboard.charts.mobilityTransport.transportedGoodsBreakdown'
          )}
          regionLevel="nuts3"
        >
          <Card sx={{ p: 2 }}>
            {loadingTransportedDetails ? (
              <Skeleton
                variant="rectangular"
                sx={{ width: '100%', height: 400 }}
              />
            ) : (
              <Suspense
                fallback={
                  <Skeleton
                    variant="rectangular"
                    sx={{ width: '100%', height: 400 }}
                  />
                }
              >
                <DataTable
                  title={t(
                    'dashboard.charts.mobilityTransport.transportedGoodsBreakdown'
                  )}
                  rows={transportedDetails}
                  columns={[]}
                  region={transportedMeta.region}
                  source={transportedMeta.source}
                  survey={transportedMeta.survey}
                  timestamp={transportedMeta.timestamp}
                  regionName={transportedMeta.regionName}
                />
              </Suspense>
            )}
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.mobility?.includes('FetchRailwayPassengers') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={6}
          xl={7}
          title={t(
            'dashboard.charts.mobilityTransport.railwayPassengerTransport'
          )}
          regionLevel="nuts2"
        >
          <Card
            sx={{ p: 2, height: 390, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingRailwayPassengers ? (
                <Skeleton
                  variant="rectangular"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
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
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  }
                >
                  <BarGraph
                    title={t(
                      'dashboard.charts.mobilityTransport.railwayPassengerTransport'
                    )}
                    data={railwayPassengersData}
                    region={railwayPassengersData.region}
                    source={railwayPassengersData.source}
                    survey={railwayPassengersData.survey}
                    timestamp={railwayPassengersData.timestamp}
                    unit="passengers"
                    barColorHex="#6BB8AD"
                    regionName={railwayPassengersData.regionName}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {(region.charts?.mobility?.includes('FetchMobilityIcons') ||
        region.charts?.mobility?.includes('FetchPublicTransportIcons')) && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={7}
          xl={5}
          title={miniColTitle}
          regionLevel="area"
        >
          {region.charts?.mobility?.includes('FetchMobilityIcons') &&
            mobilityIconsData?.length > 0 && (
              <SearchableGridItem
                xs={12}
                title={t(
                  'dashboard.charts.mobilityTransport.additionalMobilityIndicators'
                )}
                regionLevel="area"
              >
                <Card sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ flex: 1, position: 'relative' }}>
                    {loadingMobilityIcons ? (
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={200}
                      />
                    ) : (
                      <Suspense
                        fallback={
                          <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={200}
                          />
                        }
                      >
                        <IconGridStats
                          title={t(
                            'dashboard.charts.mobilityTransport.additionalMobilityIndicators'
                          )}
                          data={mobilityIconsData}
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

          {region.charts?.mobility?.includes('FetchPublicTransportIcons') &&
            publicTransportIconsData?.length > 0 && (
              <SearchableGridItem
                xs={12}
                title={t(
                  'dashboard.charts.mobilityTransport.keyPublicTransportIndicators'
                )}
                regionLevel="area"
              >
                <Card sx={{ p: 2 }}>
                  <Box sx={{ flex: 1, position: 'relative' }}>
                    {loadingPublicTransportIcons ? (
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={200}
                      />
                    ) : (
                      <Suspense
                        fallback={
                          <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={200}
                          />
                        }
                      >
                        <IconGridStats
                          title={t(
                            'dashboard.charts.mobilityTransport.keyPublicTransportIndicators'
                          )}
                          data={publicTransportIconsData}
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
        </SearchableGridItem>
      )}

      {region.charts?.mobility?.includes('FetchTransportedGoodsBIH') && (
        <SearchableGridItem
          xs={12}
          md={12}
          lg={7}
          xl={7}
          title={t('dashboard.charts.mobilityTransport.transportedGoodsBIH')}
          regionLevel="nuts1"
        >
          <Card
            sx={{ p: 2, height: 390, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingTransportedGoodsBih ? (
                <Skeleton
                  variant="rectangular"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
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
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  }
                >
                  <LineGraph
                    title={t(
                      'dashboard.charts.mobilityTransport.transportedGoodsBIH'
                    )}
                    data={transportedGoodsBihData}
                    region={transportedGoodsBihData.region}
                    source={transportedGoodsBihData.source}
                    survey={transportedGoodsBihData.survey}
                    timestamp={transportedGoodsBihData.timestamp}
                    unit="tons"
                    regionName={region.pilot_nuts1}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.mobility?.includes('FetchTransportedGoodsIndexBIH') && (
        <SearchableGridItem
          xs={12}
          md={12}
          lg={12}
          xl={12}
          title={t(
            'dashboard.charts.mobilityTransport.transportedGoodsIndexBIH'
          )}
          regionLevel="nuts1"
        >
          <Card
            sx={{ p: 2, height: 390, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingTransportedGoodsIndexBih ? (
                <Skeleton
                  variant="rectangular"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
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
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  }
                >
                  <LineGraph
                    title={t(
                      'dashboard.charts.mobilityTransport.transportedGoodsIndexBIH'
                    )}
                    data={transportedGoodsIndexBihData}
                    region={transportedGoodsIndexBihData.region}
                    source={transportedGoodsIndexBihData.source}
                    survey={transportedGoodsIndexBihData.survey}
                    timestamp={transportedGoodsIndexBihData.timestamp}
                    unit="index"
                    regionName={region.pilot_nuts1}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.maps?.mobility &&
        region.maps?.mobility?.includes('BUS_STOP_DENSITY') && (
          <SearchableGridItem
            xs={12}
            sm={6}
            title={t('dashboard.maps.mobilityTransport.busStopDensity')}
            regionLevel={
              region.id === 'tramuntana-soller' || region.id === 'smarje-padna'
                ? 'nuts3'
                : 'area'
            }
          >
            <GeoServerPolygonMaps
              groupTitle={t('dashboard.maps.mobilityTransport.busStopDensity')}
              layerName={'SMARTERA:EUROSTAT_POP_grid'}
              pilotCode={region.pilot_geoserver}
              variants={[{ valueProp: 'BUS_STOP_DENSITY' }]}
              minColor="#c4ccbf"
              maxColor="#155040"
              mapHeight={500}
              columns={1}
              showLegend
              nullValueMode="zero"
              renderMarkerTooltip={feature => (
                <div style={{ minWidth: 100 }}>
                  <div
                    style={{
                      paddingTop: 6,
                      paddingBottom: 6,
                      paddingLeft: 12,
                      paddingRight: 12,
                      fontSize: 16,
                    }}
                  >
                    {t('dashboard.maps.mobilityTransport.numberOfBusStops')}
                  </div>
                  <hr />
                  <div
                    style={{
                      paddingTop: 6,
                      paddingBottom: 6,
                      paddingLeft: 12,
                      paddingRight: 12,
                      fontSize: 16,
                      textAlign: 'right',
                    }}
                  >
                    {feature.properties?.['BUS_STOP_DENSITY']}
                  </div>
                </div>
              )}
            />
          </SearchableGridItem>
        )}

      {region.maps?.mobility &&
        (region.maps?.mobility?.includes('SMARTERA:IT_aggregated_stops') ||
          region.maps?.mobility?.includes('SMARTERA:ES_aggregated_stops') ||
          region.maps?.mobility?.includes('SMARTERA:FI_aggregated_stops') ||
          region.maps?.mobility?.includes('SMARTERA:SI_aggregated_stops')) && (
          <SearchableGridItem
            xs={12}
            sm={6}
            title={t('dashboard.maps.mobilityTransport.dailyBusStopFrequency')}
            regionLevel={
              region.id === 'tramuntana-soller' || region.id === 'smarje-padna'
                ? 'nuts3'
                : 'area'
            }
          >
            <GeoServerPointMap
              layerName={region.maps.mobility[0]}
              title={t(
                'dashboard.maps.mobilityTransport.dailyBusStopFrequency'
              )}
              renderMarkerTooltip={feature => (
                <div style={{ minWidth: 100 }}>
                  <div
                    style={{
                      paddingTop: 6,
                      paddingBottom: 6,
                      paddingLeft: 12,
                      paddingRight: 12,
                      fontSize: 16,
                    }}
                  >
                    {feature.properties.similar_stop_name}
                  </div>
                  <hr />
                  <div
                    style={{
                      paddingTop: 6,
                      paddingBottom: 6,
                      paddingLeft: 12,
                      paddingRight: 12,
                      fontSize: 16,
                      textAlign: 'right',
                    }}
                  >
                    {feature.properties.count}
                  </div>
                </div>
              )}
              mapHeight={500}
            />
          </SearchableGridItem>
        )}

      {region.maps?.mobility &&
        region.maps?.mobility?.includes(
          'SMARTERA:EUROSTAT_POP_grid_CYCLING_NETWORK_LENGTH'
        ) && (
          <SearchableGridItem
            xs={12}
            title={[
              'cyclingWalkingInfrastructure',
              'allCyclingAccessiblePathLength',
              'designatedWalkingCyclingPathLength',
              'residentialWalkingCyclingPathLength',
            ]
              .map(key => t(`dashboard.maps.mobilityTransport.${key}`))
              .join(' ')}
            regionLevel={region.id === 'smarje-padna' ? 'nuts3' : 'area'}
          >
            <GeoServerPolygonMaps
              groupTitle={t(
                'dashboard.maps.mobilityTransport.cyclingWalkingInfrastructure'
              )}
              layerName={'SMARTERA:EUROSTAT_POP_grid'}
              pilotCode={region.pilot_geoserver}
              variants={[
                {
                  valueProp: 'CYCLING_NETWORK_ALL_LENGTH',
                  title: t(
                    'dashboard.maps.mobilityTransport.allCyclingAccessiblePathLength'
                  ),
                },
                {
                  valueProp: 'CYCLING_NETWORK_SELECTION_LENGTH',
                  title: t(
                    'dashboard.maps.mobilityTransport.designatedWalkingCyclingPathLength'
                  ),
                },
                {
                  valueProp: 'CYCLING_NETWORK_RESIDENTIAL_LENGTH',
                  title: t(
                    'dashboard.maps.mobilityTransport.residentialWalkingCyclingPathLength'
                  ),
                },
              ]}
              minColor="#c4ccbf"
              maxColor="#155040"
              mapHeight={400}
              columns={3}
              showLegend
              nullValueMode={
                region.id === 'tramuntana-soller' ? 'hide' : 'zero'
              }
              valueScaleMode="numeric"
              variantOptions={{
                CYCLING_NETWORK_ALL_LENGTH: {
                  renderMarkerTooltip: feature => (
                    <div style={{ minWidth: 100 }}>
                      <div style={{ padding: '6px 12px', fontSize: 16 }}>
                        {t(
                          'dashboard.maps.mobilityTransport.summedWalkingCyclingPathLength'
                        )}
                      </div>
                      <hr />
                      <div
                        style={{
                          padding: '6px 12px',
                          fontSize: 16,
                          textAlign: 'right',
                        }}
                      >
                        {feature.properties?.[
                          'CYCLING_NETWORK_ALL_LENGTH'
                        ]?.toFixed(2)}{' '}
                        km
                      </div>
                    </div>
                  ),
                },
                CYCLING_NETWORK_SELECTION_LENGTH: {
                  renderMarkerTooltip: feature => (
                    <div style={{ minWidth: 100 }}>
                      <div style={{ padding: '6px 12px', fontSize: 16 }}>
                        {t(
                          'dashboard.maps.mobilityTransport.summedWalkingCyclingPathLength'
                        )}
                      </div>
                      <hr />
                      <div
                        style={{
                          padding: '6px 12px',
                          fontSize: 16,
                          textAlign: 'right',
                        }}
                      >
                        {feature.properties?.[
                          'CYCLING_NETWORK_SELECTION_LENGTH'
                        ]?.toFixed(2)}{' '}
                        km
                      </div>
                    </div>
                  ),
                },
                CYCLING_NETWORK_RESIDENTIAL_LENGTH: {
                  renderMarkerTooltip: feature => (
                    <div style={{ minWidth: 100 }}>
                      <div style={{ padding: '6px 12px', fontSize: 16 }}>
                        {t(
                          'dashboard.maps.mobilityTransport.summedWalkingCyclingPathLength'
                        )}
                      </div>
                      <hr />
                      <div
                        style={{
                          padding: '6px 12px',
                          fontSize: 16,
                          textAlign: 'right',
                        }}
                      >
                        {feature.properties?.[
                          'CYCLING_NETWORK_RESIDENTIAL_LENGTH'
                        ]?.toFixed(2)}{' '}
                        km
                      </div>
                    </div>
                  ),
                },
              }}
            />
          </SearchableGridItem>
        )}
    </Grid>
  );
};

export default MobilityTab;
