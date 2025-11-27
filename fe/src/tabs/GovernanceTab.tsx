import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Card, Grid, Skeleton, Box, Typography } from '@mui/material';
import { fetchDatapoints } from '@api/graphql/index';
import IconGridStats from '@/components/charts/IconGridStats';
import { SearchableGridItem } from '@components/layout/SearchFilter';

const BarGraph = lazy(() => import('@components/charts/BarGraph'));
const MiniNumber = lazy(() => import('@components/charts/MiniNumber'));

import { useTranslation } from 'react-i18next';
import { Datapoint, LabeledData } from '@/types/datapoint';
import { TabProps, MetaInfo } from '@/types/tab';

const GovernanceTab: React.FC<TabProps> = ({ region }) => {
  const { t } = useTranslation();

  const [employeesData, setEmployeesData] = useState<LabeledData>({
    labels: [],
    values: [],
  });
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [employeesNr, setEmployeesNr] = useState<Datapoint | null>(null);
  const [peopleNr, setPeopleNr] = useState<Datapoint | null>(null);
  const [loadingRatio, setLoadingRatio] = useState(true);

  const [rdData, setRdData] = useState<{
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ values: [] });
  const [loadingRD, setLoadingRD] = useState(true);

  const [governanceIconsData, setGovernanceIconsData] = useState<any[]>([]);
  const [loadingGovernanceIcons, setLoadingGovernanceIcons] = useState(true);

  useEffect(() => {
    if (!region.charts?.governance?.includes('FetchEmployees')) return;

    setLoadingEmployees(true);
    fetchDatapoints('FetchEmployees', { pilot_nuts3: region.pilot_nuts3 })
      .then((data: Datapoint[]) => {
        const sorted = [...data].sort((a, b) => {
          const aYear = a.dimensions[5] ?? '';
          const bYear = b.dimensions[5] ?? '';
          return aYear.localeCompare(bYear);
        });

        const labels = sorted.map(d => d.dimensions[5]); // year as label
        const values = sorted.map(d => d.value);
        const meta: MetaInfo = sorted[sorted.length - 1] ?? ({} as any);

        setEmployeesData({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts3,
        });
      })
      .catch(err => console.error('Failed to load FetchEmployees data:', err))
      .finally(() => setLoadingEmployees(false));
  }, [region]);

  useEffect(() => {
    if (
      !region.charts?.governance?.includes('FetchEmployeesNr') ||
      !region.charts?.governance?.includes('FetchPeopleNr')
    )
      return;

    setLoadingRatio(true);

    Promise.all([
      fetchDatapoints('FetchEmployeesNr', { pilot_nuts3: region.pilot_nuts3 }),
      fetchDatapoints('FetchPeopleNr', { pilot_nuts3: region.pilot_nuts3 }),
    ])
      .then(([employeesDataRes, peopleDataRes]) => {
        const employees = employeesDataRes.sort((a, b) => b.value - a.value)[0];
        const people = peopleDataRes.sort((a, b) => b.value - a.value)[0];

        if (employees && people) {
          setEmployeesNr(employees);
          setPeopleNr(people);
        }
      })
      .catch(err => console.error('Failed to load employment ratio data:', err))
      .finally(() => setLoadingRatio(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.governance?.includes('FetchRD')) return;

    setLoadingRD(true);
    fetchDatapoints('FetchRD', { pilot_nuts2: region.pilot_nuts2 })
      .then((data: Datapoint[]) => {
        const sorted = [...data].sort((a, b) => {
          const aYear = a.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          const bYear = b.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          return aYear.localeCompare(bYear);
        });

        const values = sorted.map(d => d.value);
        const meta: MetaInfo = sorted[sorted.length - 1] ?? ({} as any);

        setRdData({
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(err => console.error('Failed to load FetchRD data:', err))
      .finally(() => setLoadingRD(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.governance?.includes('FetchGovernanceIcons')) return;

    setLoadingGovernanceIcons(true);
    fetchDatapoints('FetchGovernanceIcons', { pilot: region.pilot })
      .then((data: any) => {
        const iconsSource = Array.isArray(data) ? data[0] : data;

        const icons = [
          {
            label: 'OSM_governance.townhall',
            icon: 'account_balance',
            value: iconsSource?.townhall?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_governance.courthouse',
            icon: 'balance',
            value: iconsSource?.courthouse?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_governance.governmentBuilding',
            icon: 'apartment',
            value: iconsSource?.government_building?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_governance.police',
            icon: 'local_police',
            value: iconsSource?.police?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_governance.fireStation',
            icon: 'fire_truck',
            value: iconsSource?.fire_station?.[0]?.value ?? 0,
          },
        ];

        setGovernanceIconsData(icons);
      })
      .catch(err =>
        console.error('Failed to load FetchGovernanceIcons data:', err)
      )
      .finally(() => setLoadingGovernanceIcons(false));
  }, [region]);

  const employmentRate = +(employeesNr && peopleNr
    ? (((employeesNr.value * 1000) / peopleNr.value) * 100).toFixed(1)
    : 0);

  const rdLatestValue = rdData?.values?.length
    ? rdData.values[rdData.values.length - 1]
    : 0;

  const showEmploymentRate =
    region.charts?.governance?.includes('FetchEmployees') &&
    region.charts?.governance?.includes('FetchEmployeesNr') &&
    region.charts?.governance?.includes('FetchPeopleNr');

  const showRD = region.charts?.governance?.includes('FetchRD');

  const miniColTitle = [
    showEmploymentRate && t('dashboard.charts.governancePolicy.employmentRate'),
    showRD && t('dashboard.charts.governancePolicy.rdExpenditure'),
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      {region.charts?.governance?.includes('FetchEmployees') && (
        <SearchableGridItem
          xs={12}
          md={10}
          lg={10}
          xl={8}
          title={t('dashboard.charts.governancePolicy.employedPersonsTotal')}
          regionLevel="nuts3"
        >
          <Card
            sx={{ p: 2, height: 390, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingEmployees ? (
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
                      'dashboard.charts.governancePolicy.employedPersonsTotal'
                    )}
                    data={employeesData}
                    region={employeesData.region}
                    source={employeesData.source}
                    survey={employeesData.survey}
                    timestamp={employeesData.timestamp}
                    regionName={employeesData.regionName}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {(showEmploymentRate || showRD) && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={4}
          xl={4}
          title={miniColTitle}
          regionLevel={['nuts2', 'nuts3']}
        >
          <Grid container direction="column" rowSpacing={2}>
            {showEmploymentRate && (
              <SearchableGridItem
                xs={12}
                title={t('dashboard.charts.governancePolicy.employmentRate')}
                regionLevel="nuts3"
              >
                <Card
                  sx={{
                    p: 2,
                    height: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  {loadingRatio ? (
                    <Skeleton
                      variant="rectangular"
                      sx={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Suspense
                      fallback={
                        <Skeleton
                          variant="rectangular"
                          sx={{ width: '100%', height: '100%' }}
                        />
                      }
                    >
                      <MiniNumber
                        title={t(
                          'dashboard.charts.governancePolicy.employmentRate'
                        )}
                        data={{ values: [employmentRate] }}
                        unit="%"
                        region={employeesNr?.region || ''}
                        source={`${employeesNr?.source || 'N/A'}, ${peopleNr?.source || 'N/A'}`}
                        survey={`${employeesNr?.survey || 'N/A'} / ${peopleNr?.survey || 'N/A'}`}
                        timestamp={employeesNr?.timestamp || ''}
                        regionName={region.pilot_nuts3}
                      />
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ mt: 1 }}
                      >
                        {t(
                          'dashboard.charts.governancePolicy.employmentRateNote',
                          'The ratio between employed people and total population.'
                        )}
                      </Typography>
                    </Suspense>
                  )}
                </Card>
              </SearchableGridItem>
            )}

            {showRD && (
              <SearchableGridItem
                xs={12}
                title={t('dashboard.charts.governancePolicy.rdExpenditure')}
                regionLevel="nuts2"
              >
                <Card
                  sx={{
                    p: 2,
                    height: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  {loadingRD ? (
                    <Skeleton
                      variant="rectangular"
                      sx={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Suspense
                      fallback={
                        <Skeleton
                          variant="rectangular"
                          sx={{ width: '100%', height: '100%' }}
                        />
                      }
                    >
                      <MiniNumber
                        title={t(
                          'dashboard.charts.governancePolicy.rdExpenditure'
                        )}
                        data={{ values: [rdLatestValue] }}
                        unit=""
                        region={rdData.region}
                        source={rdData.source}
                        survey={rdData.survey}
                        timestamp={rdData.timestamp}
                        regionName={rdData.regionName}
                      />
                    </Suspense>
                  )}
                </Card>
              </SearchableGridItem>
            )}
          </Grid>
        </SearchableGridItem>
      )}

      {region.charts?.governance?.includes('FetchGovernanceIcons') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={6}
          xl={5}
          title={t('dashboard.charts.governancePolicy.keyGovernanceIndicators')}
          regionLevel={'area'}
        >
          <Card sx={{ p: 2, mb: 2 }}>
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingGovernanceIcons ? (
                <Skeleton variant="rectangular" width="100%" height={200} />
              ) : (
                <Suspense
                  fallback={
                    <Skeleton variant="rectangular" width="100%" height={200} />
                  }
                >
                  <IconGridStats
                    title={t(
                      'dashboard.charts.governancePolicy.keyGovernanceIndicators'
                    )}
                    data={governanceIconsData}
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
  );
};

export default GovernanceTab;
