import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Card, Grid, Skeleton, Box } from '@mui/material';

import { fetchDatapoints } from '@api/graphql/index';
import { SearchableGridItem } from '@components/layout/SearchFilter';

import { useTranslation } from 'react-i18next';

import { MetaInfo } from '../types/tab';

const TopNList = lazy(() => import('@components/charts/TopNList'));
const LineGraph = lazy(() => import('@components/charts/LineGraph'));
const GroupedBarGraph = lazy(
  () => import('@components/charts/GroupedBarGraph')
);
const BarGraph = lazy(() => import('@components/charts/BarGraph'));
const IconGridStats = lazy(() => import('@components/charts/IconGridStats'));

import GeoServerPolygonMaps from '@components/maps/GeoServerPolygonMaps';

import { Datapoint, LabeledData, TransformedEntry } from '@/types/datapoint';
import { TabProps } from '@/types/tab';

const ServicesTab: React.FC<TabProps> = ({ region }) => {
  const { t } = useTranslation();

  const [hospitalisationAgesData, setHospitalisationAgesData] =
    useState<LabeledData>({
      labels: [],
      values: [],
    });
  const [loadingHospitalisationAges, setLoadingHospitalisationAges] =
    useState(true);

  const [topDiagnoses, setTopDiagnoses] = useState<{
    labels: string[];
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ labels: [], values: [] });
  const [loadingTopDiagnoses, setLoadingTopDiagnoses] = useState(true);

  const [AllHospitalisations, setAllHospitalisations] = useState<{
    labels: string[];
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ labels: [], values: [] });
  const [loadingHospitalisations, setLoadingHospitalisations] = useState(true);

  const [youthNeet, setYouthNeet] = useState<{
    data: TransformedEntry[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ data: [] });
  const [loadingYouthNeet, setLoadingYouthNeet] = useState(true);

  const [educationalLevelData, setEducationalLevelData] = useState<{
    labels: string[];
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ labels: [], values: [] });
  const [loadingEducationalLevel, setLoadingEducationalLevel] = useState(true);

  const [enrollementData, setEnrollementData] = useState<{
    labels: string[];
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ labels: [], values: [] });
  const [loadingEnrollement, setLoadingEnrollement] = useState(true);

  const [disposalCapacityTrend, setDisposalCapacityTrend] = useState<{
    labels: string[];
    values: number[];
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
    regionName?: string;
  }>({ labels: [], values: [] });
  const [loadingDisposalCapacity, setLoadingDisposalCapacity] = useState(true);

  const [serviceIconsData, setServiceIconsData] = useState<any[]>([]);
  const [loadingServiceIcons, setLoadingServiceIcons] = useState(true);

  const [educationIconsData, setEducationIconsData] = useState<any[]>([]);
  const [loadingEducationIcons, setLoadingEducationIcons] = useState(true);

  useEffect(() => {
    if (!region.charts?.services?.includes('FetchAllHospitalisations')) return;

    setLoadingHospitalisations(true);
    fetchDatapoints('FetchAllHospitalisations', {
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

        setAllHospitalisations({
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
        console.error('Failed to load FetchAllHospitalisations data:', err)
      )
      .finally(() => setLoadingHospitalisations(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.services?.includes('FetchTopDiagnoses')) return;

    setLoadingTopDiagnoses(true);
    fetchDatapoints('FetchTopDiagnoses', { pilot_nuts2: region.pilot_nuts2 })
      .then((data: Datapoint[]) => {
        const top = data.slice(0, 8);
        const labels = top.map(item => `${item.dimensions[5]}`);
        const values = top.map(item => item.value);
        const meta: MetaInfo = top[0] ?? {};
        setTopDiagnoses({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(err => console.error('Failed to load top diagnoses:', err))
      .finally(() => setLoadingTopDiagnoses(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.services?.includes('FetchHospitalisationAges')) return;

    setLoadingHospitalisationAges(true);
    fetchDatapoints('FetchHospitalisationAges', {
      pilot_nuts2: region.pilot_nuts2,
    })
      .then((data: Datapoint[]) => {
        const ageGroupMap = new Map<string, number>();
        data.forEach(d => {
          const ageGroup = d.dimensions[1];
          const current = ageGroupMap.get(ageGroup) || 0;
          ageGroupMap.set(ageGroup, current + d.value);
        });

        const sorted = Array.from(ageGroupMap.entries()).sort(([a], [b]) =>
          a.localeCompare(b, 'en', { numeric: true })
        );

        const labels = sorted.map(([label]) => label);
        const values = sorted.map(([, value]) => value);
        const meta: MetaInfo = data[0] ?? {};

        setHospitalisationAgesData({
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
        console.error('Failed to load FetchHospitalisationAges data:', err)
      )
      .finally(() => setLoadingHospitalisationAges(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.services?.includes('FetchYouthNeet')) return;

    setLoadingYouthNeet(true);
    fetchDatapoints('FetchYouthNeet', { pilot_nuts2: region.pilot_nuts2 })
      .then((data: Datapoint[]) => {
        const transformed = data.map(d => ({
          year: d.dimensions.find(dim => /^\d{4}$/.test(dim)) || 'Unknown',
          gender:
            d.dimensions.find(dim => dim === 'Males' || dim === 'Females') ||
            'Unknown',
          value: d.value,
          ageGroup: d.dimensions.find(dim => dim.includes('age')) || 'Unknown',
          source: d.source || 'Unknown',
          survey: d.survey || 'Unknown',
          region: d.region || 'Unknown',
          timestamp: d.timestamp || 'Unknown',
          regionName: region.pilot_nuts2,
        }));

        const meta: MetaInfo = data[0] ?? {};
        setYouthNeet({
          data: transformed,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(err => console.error('Failed to load youth NEET data:', err))
      .finally(() => setLoadingYouthNeet(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.services?.includes('FetchEducationalLevel')) return;

    setLoadingEducationalLevel(true);
    fetchDatapoints('FetchEducationalLevel', {
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

        setEducationalLevelData({
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
        console.error('Failed to load FetchEducationalLevel data:', err)
      )
      .finally(() => setLoadingEducationalLevel(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.services?.includes('FetchEnrollement')) return;

    setLoadingEnrollement(true);
    fetchDatapoints('FetchEnrollement', { pilot_nuts2: region.pilot_nuts2 })
      .then((data: Datapoint[]) => {
        const categoryMap = new Map<string, number>();
        data.forEach(d => {
          const label =
            d.dimensions.find(dim => dim.toLowerCase().includes('education')) ||
            'Unknown';
          categoryMap.set(label, (categoryMap.get(label) || 0) + d.value);
        });

        const sorted = Array.from(categoryMap.entries()).sort(([a], [b]) =>
          a.localeCompare(b, 'en', { numeric: true })
        );

        const labels = sorted.map(([label]) => label);
        const values = sorted.map(([, value]) => value);
        const meta: MetaInfo = data[0] ?? {};

        setEnrollementData({
          labels,
          values,
          region: meta.region,
          source: meta.source,
          survey: meta.survey,
          timestamp: meta.timestamp,
          regionName: region.pilot_nuts2,
        });
      })
      .catch(err => console.error('Failed to load FetchEnrollement data:', err))
      .finally(() => setLoadingEnrollement(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.services?.includes('FetchDisposalCapacity')) return;

    setLoadingDisposalCapacity(true);
    fetchDatapoints('FetchDisposalCapacity', {
      pilot_nuts2: region.pilot_nuts2,
    })
      .then((data: Datapoint[]) => {
        const filtered = data.filter(d =>
          d.dimensions.includes('Rest capacity - cubic metres')
        );
        const sorted = filtered.sort((a, b) => {
          const aYear = a.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          const bYear = b.dimensions.find(d => /^\d{4}$/.test(d)) ?? '';
          return aYear.localeCompare(bYear);
        });

        const labels = sorted.map(
          d => d.dimensions.find(d => /^\d{4}$/.test(d)) || ''
        );
        const values = sorted.map(d => d.value);
        const meta: MetaInfo = sorted[0] ?? {};

        setDisposalCapacityTrend({
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
        console.error('Failed to load FetchDisposalCapacity data:', err)
      )
      .finally(() => setLoadingDisposalCapacity(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.services?.includes('FetchServiceIcons')) return;

    setLoadingServiceIcons(true);
    fetchDatapoints('FetchServiceIcons', { pilot: region.pilot })
      .then(data => {
        const iconsSource = Array.isArray(data) ? data[0] : data;
        const icons = [
          {
            label: 'OSM_service.hospital',
            icon: 'local_hospital',
            value: iconsSource?.hospital?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_service.bank',
            icon: 'account_balance',
            value: iconsSource?.bank?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_service.cafe',
            icon: 'local_cafe',
            value: iconsSource?.cafe?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_service.pharmacy',
            icon: 'local_pharmacy',
            value: iconsSource?.pharmacy?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_service.cinema',
            icon: 'movie',
            value: iconsSource?.cinema?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_service.marketplace',
            icon: 'storefront',
            value: iconsSource?.marketplace?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_service.shops',
            icon: 'shopping_bag',
            value: iconsSource?.shops?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_service.museum',
            icon: 'museum',
            value: iconsSource?.museum?.[0]?.value ?? 0,
          },
        ];
        setServiceIconsData(icons);
      })
      .catch(err =>
        console.error('Failed to load FetchServiceIcons data:', err)
      )
      .finally(() => setLoadingServiceIcons(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.services?.includes('FetchEducationIcons')) return;

    setLoadingEducationIcons(true);
    fetchDatapoints('FetchEducationIcons', { pilot: region.pilot })
      .then(data => {
        const iconsSource = Array.isArray(data) ? data[0] : data;
        const icons = [
          {
            label: 'OSM_serviceEducation.kindergarten',
            icon: 'child_friendly',
            value: iconsSource?.kindergarten?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_serviceEducation.school',
            icon: 'school',
            value: iconsSource?.school?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_serviceEducation.college',
            icon: 'apartment',
            value: iconsSource?.college?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_serviceEducation.university',
            icon: 'account_balance',
            value: iconsSource?.university?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_serviceEducation.educationOffice',
            icon: 'manage_accounts',
            value: iconsSource?.education_office?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_serviceEducation.employmentOffice',
            icon: 'work',
            value: iconsSource?.employment_office?.[0]?.value ?? 0,
          },
        ];
        setEducationIconsData(icons);
      })
      .catch(err =>
        console.error('Failed to load FetchEducationIcons data:', err)
      )
      .finally(() => setLoadingEducationIcons(false));
  }, [region]);

  return (
    <>
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        {region.charts?.services?.includes('FetchAllHospitalisations') && (
          <SearchableGridItem
            xs={12}
            md={6}
            lg={6}
            xl={6}
            title={t('dashboard.charts.services.hospitalDischargesTotal')}
            regionLevel="nuts2"
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 340 }}>
                {loadingHospitalisations ? (
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
                        'dashboard.charts.services.hospitalDischargesTotal'
                      )}
                      data={AllHospitalisations}
                      region={AllHospitalisations.region}
                      source={AllHospitalisations.source}
                      survey={AllHospitalisations.survey}
                      timestamp={AllHospitalisations.timestamp}
                      regionName={AllHospitalisations.regionName}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          </SearchableGridItem>
        )}

        {region.charts?.services?.includes('FetchTopDiagnoses') && (
          <SearchableGridItem
            xs={12}
            sm={6}
            md={6}
            lg={6}
            xl={6}
            title={t(
              'dashboard.charts.services.topHospitalDischargesByDiagnosis'
            )}
            regionLevel="nuts2"
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 380 }}>
                {loadingTopDiagnoses ? (
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
                    <TopNList
                      title={t(
                        'dashboard.charts.services.topHospitalDischargesByDiagnosis'
                      )}
                      labels={topDiagnoses.labels}
                      values={topDiagnoses.values}
                      region={topDiagnoses.region}
                      source={topDiagnoses.source}
                      survey={topDiagnoses.survey}
                      timestamp={topDiagnoses.timestamp}
                      regionName={topDiagnoses.regionName}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          </SearchableGridItem>
        )}

        {region.charts?.services?.includes('FetchYouthNeet') && (
          <SearchableGridItem
            xs={12}
            sm={12}
            md={12}
            lg={7}
            xl={6}
            title={t('dashboard.charts.services.youthNeetByGenderYear')}
            regionLevel="nuts2"
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 390 }}>
                {loadingYouthNeet ? (
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
                    <GroupedBarGraph
                      title={t(
                        'dashboard.charts.services.youthNeetByGenderYear'
                      )}
                      data={youthNeet.data}
                      labelKey="year"
                      groupKey="gender"
                      region={youthNeet.region}
                      source={youthNeet.source}
                      survey={youthNeet.survey}
                      timestamp={youthNeet.timestamp}
                      regionName={youthNeet.regionName}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          </SearchableGridItem>
        )}

        {region.charts?.services?.includes('FetchHospitalisationAges') && (
          <SearchableGridItem
            xs={12}
            md={12}
            lg={12}
            xl={12}
            title={t('dashboard.charts.services.hospitalDischargesByAgeGroup')}
            regionLevel="nuts2"
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 250 }}>
                {loadingHospitalisationAges ? (
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
                        'dashboard.charts.services.hospitalDischargesByAgeGroup'
                      )}
                      data={hospitalisationAgesData}
                      region={hospitalisationAgesData.region}
                      source={hospitalisationAgesData.source}
                      survey={hospitalisationAgesData.survey}
                      timestamp={hospitalisationAgesData.timestamp}
                      regionName={hospitalisationAgesData.regionName}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          </SearchableGridItem>
        )}

        {region.charts?.services?.includes('FetchEnrollement') && (
          <SearchableGridItem
            xs={12}
            md={6}
            lg={6}
            xl={6}
            title={t('dashboard.charts.services.educationalAttainmentYouth')}
            regionLevel="nuts2"
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 380 }}>
                {loadingEnrollement ? (
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
                        'dashboard.charts.services.educationalAttainmentYouth'
                      )}
                      data={enrollementData}
                      region={enrollementData.region}
                      source={enrollementData.source}
                      survey={enrollementData.survey}
                      timestamp={enrollementData.timestamp}
                      regionName={enrollementData.regionName}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          </SearchableGridItem>
        )}

        {region.charts?.services?.includes('FetchEducationalLevel') && (
          <SearchableGridItem
            xs={12}
            md={6}
            lg={6}
            xl={6}
            title={t('dashboard.charts.services.tertiaryEnrollment')}
            regionLevel="nuts2"
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 390 }}>
                {loadingEducationalLevel ? (
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
                      title={t('dashboard.charts.services.tertiaryEnrollment')}
                      data={educationalLevelData}
                      region={educationalLevelData.region}
                      source={educationalLevelData.source}
                      survey={educationalLevelData.survey}
                      timestamp={educationalLevelData.timestamp}
                      regionName={educationalLevelData.regionName}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          </SearchableGridItem>
        )}

        {region.charts?.services?.includes('FetchDisposalCapacity') && (
          <SearchableGridItem
            xs={12}
            md={6}
            lg={5}
            xl={6}
            title={t('dashboard.charts.services.disposalCapacity')}
            regionLevel="nuts2"
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 390 }}>
                {loadingDisposalCapacity ? (
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
                      title={t('dashboard.charts.services.disposalCapacity')}
                      data={disposalCapacityTrend}
                      unit="m³"
                      region={disposalCapacityTrend.region}
                      source={disposalCapacityTrend.source}
                      survey={disposalCapacityTrend.survey}
                      timestamp={disposalCapacityTrend.timestamp}
                      regionName={disposalCapacityTrend.regionName}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          </SearchableGridItem>
        )}

        {region.charts?.services?.includes('FetchServiceIcons') && (
          <SearchableGridItem
            xs={12}
            md={6}
            lg={6}
            xl={5}
            title={t('dashboard.charts.services.publicAndCommercial')}
            regionLevel={'area'}
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 220 }}>
                {loadingServiceIcons ? (
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
                      title={t('dashboard.charts.services.publicAndCommercial')}
                      data={serviceIconsData}
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

        {region.charts?.services?.includes('FetchEducationIcons') && (
          <SearchableGridItem
            xs={12}
            md={6}
            lg={6}
            xl={5}
            title={t('dashboard.charts.services.educationAndEmploymentInfra')}
            regionLevel={'area'}
          >
            <Card sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', minHeight: 220 }}>
                {loadingEducationIcons ? (
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
                        'dashboard.charts.services.educationAndEmploymentInfra'
                      )}
                      data={educationIconsData}
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

        {region.maps?.services &&
          region.maps?.services?.includes(
            'SMARTERA:EUROSTAT_POP_grid_POSTBOX_DENSITY_POST_OFFICE_DENSITY'
          ) && (
            <SearchableGridItem
              xs={12}
              title={[
                'postalServiceDensity',
                'postOfficeDensity',
                'postBoxDensity',
              ]
                .map(key => t(`dashboard.maps.services.${key}`))
                .join(' ')}
              regionLevel={
                region.id === 'tramuntana-soller' ||
                region.id === 'smarje-padna'
                  ? 'nuts3'
                  : 'area'
              }
            >
              <GeoServerPolygonMaps
                groupTitle={t('dashboard.maps.services.postalServiceDensity')}
                layerName="SMARTERA:EUROSTAT_POP_grid"
                pilotCode={region.pilot_geoserver}
                variants={[
                  {
                    valueProp: 'POST_OFFICE_DENSITY',
                    title: t('dashboard.maps.services.postOfficeDensity'),
                  },
                  {
                    valueProp: 'POSTBOX_DENSITY',
                    title: t('dashboard.maps.services.postBoxDensity'),
                  },
                ]}
                minColor="#c4ccbf"
                maxColor="#155040"
                mapHeight={400}
                columns={2}
                showLegend
                nullValueMode="zero"
                clipStrategy="minmax"
                valueScaleMode="unique"
                variantOptions={{
                  POST_OFFICE_DENSITY: {
                    renderMarkerTooltip: feature => (
                      <div style={{ minWidth: 100 }}>
                        <div style={{ padding: '6px 12px', fontSize: 16 }}>
                          {t('dashboard.maps.services.numberOfPostOffices')}
                        </div>
                        <hr />
                        <div
                          style={{
                            padding: '6px 12px',
                            fontSize: 16,
                            textAlign: 'right',
                          }}
                        >
                          {feature.properties?.['POST_OFFICE_DENSITY']}
                        </div>
                      </div>
                    ),
                  },
                  POSTBOX_DENSITY: {
                    renderMarkerTooltip: feature => (
                      <div style={{ minWidth: 100 }}>
                        <div style={{ padding: '6px 12px', fontSize: 16 }}>
                          {t('dashboard.maps.services.numberOfPostBoxes')}
                        </div>
                        <hr />
                        <div
                          style={{
                            padding: '6px 12px',
                            fontSize: 16,
                            textAlign: 'right',
                          }}
                        >
                          {feature.properties?.['POSTBOX_DENSITY']}
                        </div>
                      </div>
                    ),
                  },
                }}
              />
            </SearchableGridItem>
          )}

        {region.maps?.services &&
          region.maps?.services?.includes(
            'SMARTERA:EUROSTAT_POP_grid_CAR_ACCESS'
          ) && (
            <SearchableGridItem
              xs={12}
              title={[
                'carAccessibility',
                'carAccessibilityPost',
                'carAccessibilityEvCharger',
                'carAccessibilityGroceryStore',
                'carAccessibilityLibrary',
              ]
                .map(key => t(`dashboard.maps.services.${key}`))
                .join(' ')}
              regionLevel={region.id === 'smarje-padna' ? 'nuts3' : 'area'}
            >
              <GeoServerPolygonMaps
                groupTitle={t('dashboard.maps.services.carAccessibility')}
                layerName="SMARTERA:EUROSTAT_POP_grid"
                pilotCode={region.pilot_geoserver}
                variants={[
                  {
                    valueProp: 'CAR_ACCESS_POST',
                    title: t('dashboard.maps.services.carAccessibilityPost'),
                  },
                  {
                    valueProp: 'CAR_ACCESS_EV_CHARGER',
                    title: t(
                      'dashboard.maps.services.carAccessibilityEvCharger'
                    ),
                  },
                  {
                    valueProp: 'CAR_ACCESS_GROCERY_STORE',
                    title: t(
                      'dashboard.maps.services.carAccessibilityGroceryStore'
                    ),
                  },
                  {
                    valueProp: 'CAR_ACCESS_LIBRARY',
                    title: t('dashboard.maps.services.carAccessibilityLibrary'),
                  },
                ]}
                minColor="#155040"
                maxColor="#c4ccbf"
                mapHeight={300}
                columns={2}
                showLegend
                nullValueMode="hide"
                clipStrategy="quantile"
                valueScaleMode="numeric"
                variantOptions={{
                  CAR_ACCESS_POST: {
                    renderMarkerTooltip: feature => (
                      <div style={{ minWidth: 100 }}>
                        <div style={{ padding: '6px 12px', fontSize: 16 }}>
                          {t('dashboard.maps.services.carAccessibility')}
                        </div>
                        <hr />
                        <div
                          style={{
                            padding: '6px 12px',
                            fontSize: 16,
                            textAlign: 'right',
                          }}
                        >
                          {feature.properties?.['CAR_ACCESS_POST']?.toFixed(2)}{' '}
                          min
                        </div>
                      </div>
                    ),
                  },
                  CAR_ACCESS_EV_CHARGER: {
                    renderMarkerTooltip: feature => (
                      <div style={{ minWidth: 100 }}>
                        <div style={{ padding: '6px 12px', fontSize: 16 }}>
                          {t('dashboard.maps.services.carAccessibility')}
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
                            'CAR_ACCESS_EV_CHARGER'
                          ]?.toFixed(2)}{' '}
                          min
                        </div>
                      </div>
                    ),
                  },
                  CAR_ACCESS_GROCERY_STORE: {
                    renderMarkerTooltip: feature => (
                      <div style={{ minWidth: 100 }}>
                        <div style={{ padding: '6px 12px', fontSize: 16 }}>
                          {t('dashboard.maps.services.carAccessibility')}
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
                            'CAR_ACCESS_GROCERY_STORE'
                          ]?.toFixed(2)}{' '}
                          min
                        </div>
                      </div>
                    ),
                  },
                  CAR_ACCESS_LIBRARY: {
                    renderMarkerTooltip: feature => (
                      <div style={{ minWidth: 100 }}>
                        <div style={{ padding: '6px 12px', fontSize: 16 }}>
                          {t('dashboard.maps.services.carAccessibility')}
                        </div>
                        <hr />
                        <div
                          style={{
                            padding: '6px 12px',
                            fontSize: 16,
                            textAlign: 'right',
                          }}
                        >
                          {feature.properties?.['CAR_ACCESS_LIBRARY']?.toFixed(
                            2
                          )}{' '}
                          min
                        </div>
                      </div>
                    ),
                  },
                }}
              />
            </SearchableGridItem>
          )}
      </Grid>
    </>
  );
};

export default ServicesTab;
