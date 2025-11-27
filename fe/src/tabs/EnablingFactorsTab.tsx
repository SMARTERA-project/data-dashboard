import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Card, Grid, Skeleton, Box } from '@mui/material';

import { fetchDatapoints } from '@api/graphql/index';
import { useTranslation } from 'react-i18next';

import { Datapoint, LabeledData } from '@/types/datapoint';
import { TabProps, MetaInfo } from '@/types/tab';

import GeoServerPolygonMaps from '@components/maps/GeoServerPolygonMaps';
import { SearchableGridItem } from '@components/layout/SearchFilter';

const DataTable = lazy(() => import('@components/charts/DataTable'));
const BarGraph = lazy(() => import('@components/charts/BarGraph'));
const MiniNumber = lazy(() => import('@components/charts/MiniNumber'));
const MiniAreaGraph = lazy(() => import('@components/charts/MiniAreaGraph'));
const IconGridStats = lazy(() => import('@/components/charts/IconGridStats'));

const EnablingFactorsTab: React.FC<TabProps> = ({ region }) => {
  const { t } = useTranslation();

  const [InternetPercentage, setInternetPercentage] = useState<LabeledData>({
    labels: [],
    values: [],
  });
  const [enterpriseTableData, setEnterpriseTableData] = useState<{
    columns: any[];
    rows: any[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ columns: [], rows: [] });

  const [loadingInternet, setLoadingInternet] = useState(true);
  const [loadingEnterprises, setLoadingEnterprises] = useState(true);

  const [internetUseData, setInternetUseData] = useState<LabeledData>({
    labels: [],
    values: [],
  });
  const [loadingUse, setLoadingUse] = useState(true);

  const [internetFreqData, setInternetFreqData] = useState<LabeledData>({
    labels: [],
    values: [],
  });
  const [loadingFreq, setLoadingFreq] = useState(true);

  const [lastOnlineData, setLastOnlineData] = useState<{
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ values: [] });
  const [loadingLast, setLoadingLast] = useState(true);

  const [lastPurchaseHistory, setLastPurchaseHistory] = useState<{
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ values: [] });
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [govInternet, setGovInternet] = useState<{
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ values: [] });
  const [loadingGov, setLoadingGov] = useState(true);

  const [enablingIconsData, setEnablingIconsData] = useState<any[]>([]);
  const [loadingEnablingIcons, setLoadingEnablingIcons] = useState(true);

  useEffect(() => {
    if (!region.charts?.enablingFactors?.includes('FetchInternetUse')) return;
    setLoadingUse(true);
    fetchDatapoints('FetchInternetUse', { pilot_nuts2: region.pilot_nuts2 })
      .then((data: Datapoint[]) => {
        const labels = data.map((d: any) => d.dimensions[1] || '');
        const values = data.map((d: any) => d.value);
        const meta: MetaInfo = data[0] || {};
        setInternetUseData({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(err => console.error('Failed to load internet use data:', err))
      .finally(() => setLoadingUse(false));
  }, [region.pilot_nuts2]);

  useEffect(() => {
    if (!region.charts?.enablingFactors?.includes('FetchInternetEnterprises'))
      return;
    setLoadingEnterprises(true);
    fetchDatapoints('FetchInternetEnterprises', {
      pilot_nuts2: region.pilot_nuts2,
    })
      .then((data: Datapoint[]) => {
        const rows = data.map((item: any, index: number) => {
          const dims = item.dimensions;
          return {
            id: index,
            industry: dims[1] ?? 'Unknown Industry',
            size: dims[2] ?? 'Unknown Size',
            speed: dims[3] ?? 'Unknown Speed',
            year: dims[6] ?? 'Unknown Year',
            value: item.value,
            regionName: region.pilot_nuts2,
          };
        });
        const columns = [
          { field: 'industry', headerName: 'Industry', flex: 4 },
          { field: 'size', headerName: 'Enterprise Size', flex: 2 },
          { field: 'speed', headerName: 'Internet Speed', flex: 4 },
          { field: 'year', headerName: 'Year', flex: 1 },
          {
            field: 'value',
            headerName: 'Percentage of Enterprises',
            flex: 1,
            type: 'number',
          },
        ];
        const meta: MetaInfo = data[0] ?? {};
        setEnterpriseTableData({
          columns,
          rows,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(error =>
        console.error('Error fetching internet enterprise data:', error)
      )
      .finally(() => setLoadingEnterprises(false));
  }, [region.pilot_nuts2]);

  useEffect(() => {
    if (!region.charts?.enablingFactors?.includes('FetchInternetFrequency'))
      return;
    setLoadingFreq(true);
    fetchDatapoints('FetchInternetFrequency', {
      pilot_nuts2: region.pilot_nuts2,
    })
      .then((data: Datapoint[]) => {
        const labels = data.map((d: any) => d.dimensions[1] || '');
        const values = data.map((d: any) => d.value);
        const meta: MetaInfo = data[0] || {};
        setInternetFreqData({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(error =>
        console.error('Failed to load internet usage frequency data:', error)
      )
      .finally(() => setLoadingFreq(false));
  }, [region.pilot_nuts2]);

  useEffect(() => {
    if (!region.charts?.enablingFactors?.includes('FetchLastOnlinePurchase'))
      return;
    setLoadingLast(true);
    fetchDatapoints('FetchLastOnlinePurchase', {
      pilot_nuts2: region.pilot_nuts2,
    })
      .then((data: Datapoint[]) => {
        const item = data[0];
        if (!item) return;
        setLastOnlineData({
          values: [item.value],
          region: item.region,
          source: item.source,
          survey: item.survey,
          timestamp: item.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(error =>
        console.error('Failed to load last online purchase data:', error)
      )
      .finally(() => setLoadingLast(false));
  }, [region.pilot_nuts2]);

  useEffect(() => {
    if (
      !region.charts?.enablingFactors?.includes(
        'FetchLastOnlinePurchaseHistory'
      )
    )
      return;
    setLoadingHistory(true);
    fetchDatapoints('FetchLastOnlinePurchaseHistory', {
      pilot_nuts2: region.pilot_nuts2,
    })
      .then((data: Datapoint[]) => {
        const values = data.map((d: any) => d.value);
        const meta: MetaInfo = data[0] || {};
        setLastPurchaseHistory({
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(error =>
        console.error('Failed to load last online purchase history:', error)
      )
      .finally(() => setLoadingHistory(false));
  }, [region.pilot_nuts2]);

  useEffect(() => {
    if (
      !region.charts?.enablingFactors?.includes('FetchGovernmentOverInternet')
    )
      return;
    setLoadingGov(true);
    fetchDatapoints('FetchGovernmentOverInternet', {
      pilot_nuts2: region.pilot_nuts2,
    })
      .then((data: Datapoint[]) => {
        const item = data[0];
        if (!item) return;
        setGovInternet({
          values: [item.value],
          region: item.region,
          source: item.source,
          survey: item.survey,
          timestamp: item.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(error =>
        console.error('Failed to load government over internet data:', error)
      )
      .finally(() => setLoadingGov(false));
  }, [region.pilot_nuts2]);

  useEffect(() => {
    if (!region.charts?.enablingFactors?.includes('FetchEnablingIcons')) return;
    setLoadingEnablingIcons(true);
    fetchDatapoints('FetchEnablingIcons', { pilot: region.pilot })
      .then((data: any) => {
        const iconsSource = Array.isArray(data) ? data[0] : data;
        const icons = [
          {
            label: 'OSM.coworkingSpace',
            icon: 'desk',
            value: iconsSource?.coworking_space?.[0]?.value ?? 0,
          },
          {
            label: 'OSM.companyOffice',
            icon: 'apartment',
            value: iconsSource?.company_office?.[0]?.value ?? 0,
          },
        ];
        setEnablingIconsData(icons);
      })
      .catch(err =>
        console.error('Failed to load FetchEnablingIcons data:', err)
      )
      .finally(() => setLoadingEnablingIcons(false));
  }, [region]);

  const miniColTitle = [
    t('dashboard.charts.enablingFactors.buyingOnlineLast3Months'),
    t('dashboard.charts.enablingFactors.buyingOnlineLast3Months'),
    t('dashboard.charts.enablingFactors.onlineInteractionWithAuthorities'),
  ].join(' • ');

  return (
    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      {region.maps?.enablingFactors?.includes(
        'SMARTERA:EUROSTAT_POP_grid_COVER_GSM_COVER_3G_COVER_4G'
      ) && (
        <SearchableGridItem
          xs={12}
          title={['mobileCoverage', 'gsmCoverage', 'coverage3g', 'coverage4g']
            .map(key => t(`dashboard.maps.enablingFactors.${key}`))
            .join(' ')}
          regionLevel={
            region.id === 'tramuntana-soller' || region.id === 'smarje-padna'
              ? 'nuts3'
              : 'area'
          }
        >
          <GeoServerPolygonMaps
            groupTitle={t('dashboard.maps.enablingFactors.mobileCoverage')}
            layerName={'SMARTERA:EUROSTAT_POP_grid'}
            pilotCode={region.pilot_geoserver}
            variants={[
              {
                valueProp: 'COVER_GSM',
                title: t('dashboard.maps.enablingFactors.gsmCoverage'),
              },
              {
                valueProp: 'COVER_3G',
                title: t('dashboard.maps.enablingFactors.coverage3g'),
              },
              {
                valueProp: 'COVER_4G',
                title: t('dashboard.maps.enablingFactors.coverage4g'),
              },
            ]}
            minColor="#ef7e57CC"
            maxColor="#155040CC"
            mapHeight={500}
            columns={3}
            showLegend
          />
        </SearchableGridItem>
      )}

      {region.charts?.enablingFactors?.includes('FetchInternetFrequency') && (
        <SearchableGridItem
          xs={12}
          sm={12}
          md={12}
          lg={7}
          xl={5}
          title={t('dashboard.charts.enablingFactors.internetUseFrequency')}
          regionLevel="nuts2"
        >
          <Card sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', minHeight: 350 }}>
              {loadingFreq ? (
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
                      'dashboard.charts.enablingFactors.internetUseFrequency'
                    )}
                    data={{
                      labels: internetFreqData.labels,
                      values: internetFreqData.values,
                    }}
                    unit="%"
                    region={internetFreqData.region}
                    source={internetFreqData.source}
                    survey={internetFreqData.survey}
                    timestamp={internetFreqData.timestamp}
                    regionName={internetFreqData.regionName}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.enablingFactors?.includes('FetchLastOnlinePurchase') && (
        <SearchableGridItem
          xs={12}
          sm={12}
          md={12}
          lg={5}
          xl={3}
          title={miniColTitle}
          regionLevel="nuts2"
        >
          <Grid container direction="column" rowSpacing={2}>
            <SearchableGridItem
              xs={12}
              title={t(
                'dashboard.charts.enablingFactors.buyingOnlineLast3Months'
              )}
              regionLevel="nuts2"
            >
              <Card sx={{ p: 2 }}>
                <Box sx={{ position: 'relative', height: 100 }}>
                  {loadingLast ? (
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
                      <MiniNumber
                        title={t(
                          'dashboard.charts.enablingFactors.buyingOnlineLast3Months'
                        )}
                        data={{ values: lastOnlineData.values }}
                        unit="%"
                        region={lastOnlineData.region}
                        source={lastOnlineData.source}
                        survey={lastOnlineData.survey}
                        timestamp={lastOnlineData.timestamp}
                        height={60}
                        regionName={lastOnlineData.regionName}
                      />
                    </Suspense>
                  )}
                </Box>
              </Card>
            </SearchableGridItem>

            <SearchableGridItem
              xs={12}
              title={t(
                'dashboard.charts.enablingFactors.buyingOnlineLast3Months'
              )}
              regionLevel="nuts2"
            >
              <Card sx={{ p: 2 }}>
                <Box sx={{ position: 'relative', height: 100 }}>
                  {loadingHistory ? (
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
                      <MiniAreaGraph
                        title={t(
                          'dashboard.charts.enablingFactors.buyingOnlineLast3Months'
                        )}
                        data={{ values: lastPurchaseHistory.values }}
                        region={lastPurchaseHistory.region}
                        source={lastPurchaseHistory.source}
                        survey={lastPurchaseHistory.survey}
                        timestamp={lastPurchaseHistory.timestamp}
                        height={60}
                        regionName={lastPurchaseHistory.regionName}
                      />
                    </Suspense>
                  )}
                </Box>
              </Card>
            </SearchableGridItem>

            <SearchableGridItem
              xs={12}
              title={t(
                'dashboard.charts.enablingFactors.onlineInteractionWithAuthorities'
              )}
              regionLevel="nuts2"
            >
              <Card sx={{ p: 2 }}>
                <Box sx={{ position: 'relative', height: 100 }}>
                  {loadingGov ? (
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
                      <MiniNumber
                        title={t(
                          'dashboard.charts.enablingFactors.onlineInteractionWithAuthorities'
                        )}
                        data={{ values: govInternet.values }}
                        unit="%"
                        region={govInternet.region}
                        source={govInternet.source}
                        survey={govInternet.survey}
                        timestamp={govInternet.timestamp}
                        height={60}
                        regionName={govInternet.regionName}
                      />
                    </Suspense>
                  )}
                </Box>
              </Card>
            </SearchableGridItem>
          </Grid>
        </SearchableGridItem>
      )}

      {region.charts?.enablingFactors?.includes('FetchEnablingIcons') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={4}
          xl={4}
          title={t('dashboard.charts.enablingFactors.enablingInfrastructure')}
          regionLevel="area"
        >
          <Card sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', minHeight: 100 }}>
              {loadingEnablingIcons ? (
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
                  <IconGridStats
                    title={t(
                      'dashboard.charts.enablingFactors.enablingInfrastructure'
                    )}
                    data={enablingIconsData}
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

      {region.charts?.enablingFactors?.includes('FetchInternetUse') && (
        <SearchableGridItem
          xs={12}
          sm={12}
          md={12}
          lg={8}
          xl={12}
          title={t('dashboard.charts.enablingFactors.internetUseActivities')}
          regionLevel="nuts2"
        >
          <Card sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', minHeight: 300 }}>
              {loadingUse ? (
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
                      'dashboard.charts.enablingFactors.internetUseActivities'
                    )}
                    data={{
                      labels: internetUseData.labels,
                      values: internetUseData.values,
                    }}
                    unit="%"
                    region={internetUseData.region}
                    source={internetUseData.source}
                    survey={internetUseData.survey}
                    timestamp={internetUseData.timestamp}
                    regionName={internetUseData.regionName}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.enablingFactors?.includes('FetchInternetEnterprises') && (
        <SearchableGridItem
          xs={12}
          sm={12}
          md={12}
          lg={12}
          xl={12}
          title={t(
            'dashboard.charts.enablingFactors.internetAccessSpeedEnterprises'
          )}
          regionLevel="nuts2"
        >
          <Card sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', minHeight: 400 }}>
              {loadingEnterprises ? (
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
                  <DataTable
                    title={t(
                      'dashboard.charts.enablingFactors.internetAccessSpeedEnterprises'
                    )}
                    rows={enterpriseTableData.rows}
                    columns={enterpriseTableData.columns}
                    region={enterpriseTableData.region}
                    source={enterpriseTableData.source}
                    survey={enterpriseTableData.survey}
                    timestamp={enterpriseTableData.timestamp}
                    regionName={enterpriseTableData.regionName}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.maps?.enablingFactors?.includes(
        'SMARTERA:EUROSTAT_POP_grid_CELL_TOWER_DENSITY'
      ) && (
        <SearchableGridItem
          xs={12}
          sm={6}
          title={t('dashboard.maps.enablingFactors.cellTowerDensity')}
          regionLevel={
            region.id === 'tramuntana-soller' || region.id === 'smarje-padna'
              ? 'nuts3'
              : 'area'
          }
        >
          <GeoServerPolygonMaps
            groupTitle={t('dashboard.maps.enablingFactors.cellTowerDensity')}
            layerName={'SMARTERA:EUROSTAT_POP_grid'}
            pilotCode={region.pilot_geoserver}
            variants={[{ valueProp: 'CELL_TOWER_DENSITY' }]}
            minColor="#c4ccbf"
            maxColor="#155040"
            mapHeight={400}
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
                  {t('dashboard.maps.enablingFactors.numberOfCellTowers')}
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
                  {feature.properties?.['CELL_TOWER_DENSITY']}
                </div>
              </div>
            )}
          />
        </SearchableGridItem>
      )}
    </Grid>
  );
};

export default EnablingFactorsTab;
