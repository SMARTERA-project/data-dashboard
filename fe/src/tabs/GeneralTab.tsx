import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Card, Grid, Skeleton, Box } from '@mui/material';
import { fetchDatapoints } from '@/api/graphql';
import { transformSingleValue } from '@utils/transformSingleValue';
import { useTranslation } from 'react-i18next';

import { Datapoint, LabeledData, TransformedEntry } from '@/types/datapoint';
import { TabProps } from '@/types/tab';
import { SimpleChartData } from '@/types/chart';

import GeoServerPolygonMaps from '@components/maps/GeoServerPolygonMaps';

import { SearchableGridItem } from '@components/layout/SearchFilter';

const BarGraph = lazy(() => import('@components/charts/BarGraph'));
const GroupedBarGraph = lazy(
  () => import('@components/charts/GroupedBarGraph')
);
const LineGraph = lazy(() => import('@components/charts/LineGraph'));
const MiniAreaGraph = lazy(() => import('@components/charts/MiniAreaGraph'));
const PieChartGraph = lazy(() => import('@components/charts/PieChartGraph'));
const DataTable = lazy(() => import('@components/charts/DataTable'));
const MiniNumber = lazy(() => import('@components/charts/MiniNumber'));
const TopNList = lazy(() => import('@components/charts/TopNList'));

const GeneralTab: React.FC<TabProps> = ({ region }) => {
  const { t } = useTranslation();

  const [populationBySexAge, setPopulationBySexAge] = useState<
    TransformedEntry[]
  >([]);
  const [loadingPopulationBySexAge, setLoadingPopulationBySexAge] =
    useState(true);

  const [populationBySexTotal, setPopulationBySexTotal] = useState<
    TransformedEntry[]
  >([]);
  const [loadingPopulationBySexTotal, setLoadingPopulationBySexTotal] =
    useState(true);

  const [totalPopulationChange, setTotalPopulationChange] = useState<
    TransformedEntry[]
  >([]);
  const [loadingTotalPopulationChange, setLoadingTotalPopulationChange] =
    useState(true);

  const [liveBirthsLastYear, setLiveBirthsLastYear] = useState<
    SimpleChartData & any
  >(null);
  const [loadingLiveBirthsLastYear, setLoadingLiveBirthsLastYear] =
    useState(true);

  const [deathsLastYear, setDeathsLastYear] = useState<SimpleChartData & any>(
    null
  );
  const [loadingDeathsLastYear, setLoadingDeathsLastYear] = useState(true);

  const [netMigrations, setNetMigrations] = useState<TransformedEntry[]>([]);
  const [loadingNetMigrations, setLoadingNetMigrations] = useState(true);

  const [demographicTableData, setDemographicTableData] = useState<{
    rows: any[];
    columns: any[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
  }>({ rows: [], columns: [] });
  const [loadingDemographicTableData, setLoadingDemographicTableData] =
    useState(true);

  const [censusYear, setCensusYear] = useState<string>('');

  const [topCitizenship, setTopCitizenship] = useState<LabeledData & any>({
    labels: [],
    values: [],
  });
  const [loadingTopCitizenship, setLoadingTopCitizenship] = useState(true);

  const [maritalStatusBarData, setMaritalStatusBarData] = useState<
    LabeledData & any
  >({ labels: [], values: [] });
  const [loadingMaritalStatusBarData, setLoadingMaritalStatusBarData] =
    useState(true);

  const [populationDensity, setPopulationDensity] = useState<LabeledData & any>(
    { labels: [], values: [] }
  );
  const [loadingPopulationDensity, setLoadingPopulationDensity] =
    useState(true);

  const getChartData = (src: TransformedEntry[]): SimpleChartData => {
    const tot = src.filter(d => d.gender === 'Total');
    return { labels: tot.map(d => d.ageGroup), values: tot.map(d => d.value) };
  };
  const getPieChartData = (src: TransformedEntry[]) => {
    const filt = src.filter(
      d => d.gender === 'Males' || d.gender === 'Females'
    );
    return { labels: filt.map(d => d.gender), values: filt.map(d => d.value) };
  };

  useEffect(() => {
    if (!region.charts?.general?.includes('FetchPopulationBySexAge')) return;

    setLoadingPopulationBySexAge(true);
    fetchDatapoints('FetchPopulationBySexAge', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then((data: Datapoint[]) => {
        const out = data.map(item => {
          const dims = item.dimensions;
          return {
            ageGroup: dims.find(d => /\d+ years/.test(d)) || '',
            gender: dims.includes('Males')
              ? 'Males'
              : dims.includes('Females')
                ? 'Females'
                : 'Total',
            value: item.value,
            region: item.region,
            source: item.source,
            survey: item.survey,
            timestamp: item.timestamp,
            regionName: region.pilot_nuts3,
          };
        });
        setPopulationBySexAge(out);
      })
      .catch(console.error)
      .finally(() => setLoadingPopulationBySexAge(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.general?.includes('FetchPopulationBySexTotal')) return;
    setLoadingPopulationBySexTotal(true);
    fetchDatapoints('FetchPopulationBySexTotal', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then((data: Datapoint[]) => {
        const out = data.map(item => ({
          ageGroup: 'Total',
          gender: item.dimensions.includes('Males')
            ? 'Males'
            : item.dimensions.includes('Females')
              ? 'Females'
              : 'Total',
          value: item.value,
          region: item.region,
          source: item.source,
          survey: item.survey,
          timestamp: item.timestamp,
          regionName: region.pilot_nuts3,
        }));
        setPopulationBySexTotal(out);
      })
      .catch(console.error)
      .finally(() => setLoadingPopulationBySexTotal(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.general?.includes('FetchTotalPopulationChange')) return;
    setLoadingTotalPopulationChange(true);
    fetchDatapoints('FetchTotalPopulationChange', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then((data: Datapoint[]) => {
        const out = data.map(item => ({
          ageGroup: item.dimensions.at(-1)!,
          gender: 'Total',
          value: item.value,
          region: item.region,
          source: item.source,
          survey: item.survey,
          timestamp: item.timestamp,
          regionName: region.pilot_nuts3,
        }));
        setTotalPopulationChange(out);
      })
      .catch(console.error)
      .finally(() => setLoadingTotalPopulationChange(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.general?.includes('FetchLiveBirthsLastYear')) return;
    setLoadingLiveBirthsLastYear(true);
    fetchDatapoints('FetchLiveBirthsLastYear', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then((data: Datapoint[]) => {
        const it = data[0];
        if (it) setLiveBirthsLastYear({ values: [it.value], ...it });
      })
      .catch(console.error)
      .finally(() => setLoadingLiveBirthsLastYear(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.general?.includes('FetchDeathsLastYear')) return;
    setLoadingDeathsLastYear(true);
    fetchDatapoints('FetchDeathsLastYear', { pilot_nuts3: region.pilot_nuts3 })
      .then(data => {
        setDeathsLastYear(transformSingleValue(data));
      })
      .catch(console.error)
      .finally(() => setLoadingDeathsLastYear(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.general?.includes('FetchNetMigrations')) return;
    setLoadingNetMigrations(true);
    fetchDatapoints('FetchNetMigrations', { pilot_nuts3: region.pilot_nuts3 })
      .then((data: Datapoint[]) => {
        const out = data.map(item => ({
          ageGroup: item.dimensions.at(-1)!,
          gender: 'Total',
          value: item.value,
          region: item.region,
          source: item.source,
          survey: item.survey,
          timestamp: item.timestamp,
          regionName: region.pilot_nuts3,
        }));
        setNetMigrations(out);
      })
      .catch(console.error)
      .finally(() => setLoadingNetMigrations(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.general?.includes('FetchAllDemographicData')) return;
    setLoadingDemographicTableData(true);
    fetchDatapoints('FetchAllDemographicData', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then((data: Datapoint[]) => {
        const rows = data.map((item, i) => {
          const dims = item.dimensions;
          return {
            id: i,
            birthCountry: dims[1],
            ageGroup: dims.find(d => /\d+ years/.test(d)) || '',
            gender: dims.includes('Males')
              ? 'Males'
              : dims.includes('Females')
                ? 'Females'
                : 'Total',
            householdType: dims[2],
            value: item.value,
          };
        });
        const columns = [
          { field: 'birthCountry', headerName: 'Birth Country', flex: 2 },
          { field: 'ageGroup', headerName: 'Age Group', flex: 2 },
          { field: 'gender', headerName: 'Gender', flex: 1 },
          { field: 'householdType', headerName: 'Household Type', flex: 4 },
          { field: 'value', headerName: 'Value', flex: 1, type: 'number' },
        ];
        const year = rows[0]?.ageGroup.match(/\d{4}/)?.[0] || '';
        setCensusYear(year);
        setDemographicTableData({
          rows,
          columns,
          region: data[0]?.region,
          source: data[0]?.source,
          survey: data[0]?.survey,
          timestamp: data[0]?.timestamp,
        });
      })
      .catch(console.error)
      .finally(() => setLoadingDemographicTableData(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (
      !region.charts?.general?.includes('FetchPopulationByCitizenshipCountry')
    )
      return;
    setLoadingTopCitizenship(true);
    fetchDatapoints('FetchPopulationByCitizenshipCountry', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then((data: Datapoint[]) => {
        const top10 = data.sort((a, b) => b.value - a.value).slice(0, 10);
        const m: Datapoint | {} = top10[0] || {};
        setTopCitizenship({
          labels: top10.map(d => d.dimensions[1]),
          values: top10.map(d => d.value),
          ...m,
        });
      })
      .catch(console.error)
      .finally(() => setLoadingTopCitizenship(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.general?.includes('FetchPopulationByMaritalStatus'))
      return;
    setLoadingMaritalStatusBarData(true);
    fetchDatapoints('FetchPopulationByMaritalStatus', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then((data: Datapoint[]) => {
        const filt = data.filter(d => d.dimensions[1] !== 'Total');
        const m = filt[0] || {};
        setMaritalStatusBarData({
          labels: filt.map(d => d.dimensions[1]),
          values: filt.map(d => d.value),
          ...m,
        });
      })
      .catch(console.error)
      .finally(() => setLoadingMaritalStatusBarData(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.general?.includes('FetchPopulationDensity')) return;

    setLoadingPopulationDensity(true);
    fetchDatapoints('FetchPopulationDensity', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then((data: Datapoint[]) => {
        const sorted = data.sort(
          (a, b) =>
            +a.dimensions.find(d => /\d{4}/.test(d))! -
            +b.dimensions.find(d => /\d{4}/.test(d))!
        );
        const m = sorted[0] || {};
        setPopulationDensity({
          labels: sorted.map(
            d => d.dimensions.find(d => /\d{4}/.test(d)) || ''
          ),
          values: sorted.map(d => d.value),
          ...m,
        });
      })
      .catch(console.error)
      .finally(() => setLoadingPopulationDensity(false));
  }, [region.pilot_nuts3]);

  const totalPopulationChangeData = getChartData(totalPopulationChange);

  const showBirths = region.charts?.general?.includes(
    'FetchLiveBirthsLastYear'
  );
  const showDeaths = region.charts?.general?.includes('FetchDeathsLastYear');
  const showNetMig = region.charts?.general?.includes('FetchNetMigrations');

  const miniColTitle = [
    showBirths && t('dashboard.charts.general.yearlyLiveBirths'),
    showDeaths && t('dashboard.charts.general.yearlyDeaths'),
    showNetMig && t('dashboard.charts.general.netMigrations'),
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <Grid
      container
      rowSpacing={2}
      columnSpacing={{ xs: 1, sm: 2, md: 3, lg: 2 }}
    >
      {region.charts?.general?.includes(
        'FetchPopulationByCitizenshipCountry'
      ) && (
        <SearchableGridItem
          xs={12}
          sm={6}
          md={4}
          lg={3}
          xl={3}
          title={t('dashboard.charts.general.leadingCitizenships')}
          regionLevel="nuts3"
        >
          <Card sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', minHeight: 380 }}>
              {loadingTopCitizenship ? (
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
                  <TopNList
                    title={t('dashboard.charts.general.leadingCitizenships')}
                    labels={topCitizenship.labels}
                    values={topCitizenship.values}
                    region={topCitizenship.region}
                    source={topCitizenship.source}
                    survey={topCitizenship.survey}
                    timestamp={topCitizenship.timestamp}
                    regionName={region.pilot_nuts3}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.general?.includes('FetchTotalPopulationChange') && (
        <SearchableGridItem
          xs={12}
          sm={12}
          md={8}
          lg={6}
          xl={6}
          title={t('dashboard.charts.general.totalPopulationChange')}
          regionLevel="nuts3"
        >
          <Card sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', minHeight: 380 }}>
              {loadingTotalPopulationChange ? (
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
                    title={t('dashboard.charts.general.totalPopulationChange')}
                    data={totalPopulationChangeData}
                    unit="people"
                    region={totalPopulationChange[0]?.region}
                    source={totalPopulationChange[0]?.source}
                    survey={totalPopulationChange[0]?.survey}
                    timestamp={totalPopulationChange[0]?.timestamp}
                    regionName={totalPopulationChange[0]?.regionName}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {(showBirths || showDeaths || showNetMig) && (
        <SearchableGridItem
          xs={12}
          sm={6}
          md={4}
          lg={3}
          xl={3}
          title={miniColTitle}
          regionLevel="nuts3"
        >
          <Grid container direction="column" rowSpacing={2}>
            {showBirths && (
              <SearchableGridItem
                xs={12}
                title={t('dashboard.charts.general.yearlyLiveBirths')}
                regionLevel="nuts3"
              >
                <Card sx={{ p: 2 }}>
                  <Box sx={{ position: 'relative', height: 100 }}>
                    {loadingLiveBirthsLastYear ? (
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
                          title={t('dashboard.charts.general.yearlyLiveBirths')}
                          data={liveBirthsLastYear}
                          unit="people"
                          region={liveBirthsLastYear?.region}
                          source={liveBirthsLastYear?.source}
                          survey={liveBirthsLastYear?.survey}
                          timestamp={liveBirthsLastYear?.timestamp}
                          regionName={region.pilot_nuts3}
                        />
                      </Suspense>
                    )}
                  </Box>
                </Card>
              </SearchableGridItem>
            )}

            {showDeaths && (
              <SearchableGridItem
                xs={12}
                title={t('dashboard.charts.general.yearlyDeaths')}
                regionLevel="nuts3"
              >
                <Card sx={{ p: 2 }}>
                  <Box sx={{ position: 'relative', height: 100 }}>
                    {loadingDeathsLastYear ? (
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
                          title={t('dashboard.charts.general.yearlyDeaths')}
                          data={deathsLastYear}
                          unit="people"
                          region={deathsLastYear?.region}
                          source={deathsLastYear?.source}
                          survey={deathsLastYear?.survey}
                          timestamp={deathsLastYear?.timestamp}
                          regionName={region.pilot_nuts3}
                        />
                      </Suspense>
                    )}
                  </Box>
                </Card>
              </SearchableGridItem>
            )}

            {showNetMig && (
              <SearchableGridItem
                xs={12}
                title={t('dashboard.charts.general.netMigrations')}
                regionLevel="nuts3"
              >
                <Card sx={{ p: 2 }}>
                  <Box sx={{ position: 'relative', height: 100 }}>
                    {loadingNetMigrations ? (
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
                          title={t('dashboard.charts.general.netMigrations')}
                          data={{ values: netMigrations.map(d => d.value) }}
                          unit="people"
                          region={netMigrations[0]?.region}
                          source={netMigrations[0]?.source}
                          survey={netMigrations[0]?.survey}
                          timestamp={netMigrations[0]?.timestamp}
                          regionName={region.pilot_nuts3}
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

      {region.charts?.general?.includes('FetchPopulationBySexTotal') && (
        <SearchableGridItem
          xs={12}
          sm={8}
          md={4}
          lg={3}
          xl={3}
          title={t('dashboard.charts.general.populationBySex')}
          regionLevel="nuts3"
        >
          <Card sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', minHeight: 300 }}>
              {loadingPopulationBySexTotal ? (
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
                  <PieChartGraph
                    title={t('dashboard.charts.general.populationBySex')}
                    data={getPieChartData(populationBySexTotal)}
                    region={populationBySexTotal[0]?.region}
                    source={populationBySexTotal[0]?.source}
                    survey={populationBySexTotal[0]?.survey}
                    timestamp={populationBySexTotal[0]?.timestamp}
                    regionName={populationBySexTotal[0]?.regionName}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.general?.includes('FetchPopulationBySexAge') && (
        <SearchableGridItem
          xs={12}
          sm={8}
          md={4}
          lg={9}
          xl={9}
          title={t('dashboard.charts.general.populationByAgeAndSex')}
          regionLevel="nuts3"
        >
          <Card sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', minHeight: 390 }}>
              {loadingPopulationBySexAge ? (
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
                  <GroupedBarGraph
                    title={t('dashboard.charts.general.populationByAgeAndSex')}
                    data={populationBySexAge}
                    labelKey="ageGroup"
                    groupKey="gender"
                    region={populationBySexAge[0]?.region}
                    source={populationBySexAge[0]?.source}
                    survey={populationBySexAge[0]?.survey}
                    timestamp={populationBySexAge[0]?.timestamp}
                    regionName={populationBySexAge[0]?.regionName}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.general?.includes('FetchPopulationByMaritalStatus') && (
        <SearchableGridItem
          xs={12}
          lg={6}
          xl={5}
          title={t('dashboard.charts.general.populationByMaritalStatus')}
          regionLevel="nuts3"
        >
          <Card sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', minHeight: 390 }}>
              {loadingMaritalStatusBarData ? (
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
                      'dashboard.charts.general.populationByMaritalStatus'
                    )}
                    data={maritalStatusBarData}
                    region={maritalStatusBarData.region}
                    source={maritalStatusBarData.source}
                    survey={maritalStatusBarData.survey}
                    timestamp={maritalStatusBarData.timestamp}
                    regionName={region.pilot_nuts3}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.general?.includes('FetchPopulationDensity') && (
        <SearchableGridItem
          xs={12}
          sm={8}
          md={12}
          lg={6}
          xl={7}
          title={t('dashboard.charts.general.populationDensity')}
          regionLevel="nuts3"
        >
          <Card sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', minHeight: 370 }}>
              {loadingPopulationDensity ? (
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
                    title={t('dashboard.charts.general.populationDensity')}
                    data={populationDensity}
                    unit="people/km²"
                    region={populationDensity.region}
                    source={populationDensity.source}
                    survey={populationDensity.survey}
                    timestamp={populationDensity.timestamp}
                    regionName={region.pilot_nuts3}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.maps?.general &&
        region.maps?.general?.includes('SMARTERA:EUROSTAT_POP_grid_TOT_P') && (
          <SearchableGridItem
            xs={12}
            title={t('dashboard.maps.general.populationDensity')}
            regionLevel={
              region.id === 'tramuntana-soller' || region.id === 'smarje-padna'
                ? 'nuts3'
                : 'area'
            }
          >
            <GeoServerPolygonMaps
              groupTitle={t('dashboard.maps.general.populationDensity')}
              layerName={'SMARTERA:EUROSTAT_POP_grid'}
              pilotCode={region.pilot_geoserver}
              variants={[
                region.id === 'east-herzegovina'
                  ? { valueProp: 'TOT_P_2011' }
                  : { valueProp: 'TOT_P_2021' },
              ]}
              minColor="#c4ccbf"
              maxColor="#155040"
              mapHeight={400}
              columns={1}
              showLegend
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
                    {region.id === 'east-herzegovina' ? '2011' : '2021'}
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
                    {region.id === 'east-herzegovina'
                      ? feature.properties?.['TOT_P_2011']
                      : feature.properties?.['TOT_P_2021']}
                  </div>
                </div>
              )}
            />
          </SearchableGridItem>
        )}

      {region.charts?.general?.includes('FetchAllDemographicData') && (
        <SearchableGridItem
          xs={12}
          lg={12}
          xl={12}
          title={t('dashboard.charts.general.populationByHouseholdTypeAgeSex')}
          regionLevel="nuts3"
        >
          <Card sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', minHeight: 400 }}>
              {loadingDemographicTableData ? (
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
                    title={
                      t(
                        'dashboard.charts.general.populationByHouseholdTypeAgeSex'
                      ) + `${censusYear})`
                    }
                    rows={demographicTableData.rows}
                    columns={demographicTableData.columns}
                    region={demographicTableData.region}
                    source={demographicTableData.source}
                    survey={demographicTableData.survey}
                    timestamp={demographicTableData.timestamp}
                    regionName={region.pilot_nuts3}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}
    </Grid>
  );
};

export default GeneralTab;
