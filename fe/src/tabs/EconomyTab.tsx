import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Card, Grid, Skeleton, Box, Typography } from '@mui/material';
import { fetchDatapoints } from '@/api/graphql';
import { useTranslation } from 'react-i18next';

const GroupedBarGraph = lazy(
  () => import('@components/charts/GroupedBarGraph')
);
const BarGraph = lazy(() => import('@components/charts/BarGraph'));
const LineGraph = lazy(() => import('@components/charts/LineGraph'));
const MiniAreaGraph = lazy(() => import('@components/charts/MiniAreaGraph'));
const PieChartGraph = lazy(() => import('@components/charts/PieChartGraph'));
const DataTable = lazy(() => import('@components/charts/DataTable'));
const MiniNumber = lazy(() => import('@components/charts/MiniNumber'));
const TopNList = lazy(() => import('@components/charts/TopNList'));
const IconGridStats = lazy(() => import('@components/charts/IconGridStats'));
import { SearchableGridItem } from '@components/layout/SearchFilter';

import { Datapoint, LabeledData, TransformedEntry } from '@/types/datapoint';
import { TabProps, MetaInfo } from '@/types/tab';
import { SimpleChartData } from '@/types/chart';

const EconomyTab: React.FC<TabProps> = ({ region }) => {
  const { t } = useTranslation();

  const [gvaData, setGvaData] = useState<TransformedEntry[]>([]);
  const [loadingGva, setLoadingGva] = useState(true);

  const [nomProd, setNomProd] = useState<SimpleChartData & MetaInfo>({
    labels: [],
    values: [],
  });
  const [loadingNomProd, setLoadingNomProd] = useState(true);

  const [gdpLast, setGdpLast] = useState<(SimpleChartData & MetaInfo) | null>(
    null
  );
  const [loadingGdpLast, setLoadingGdpLast] = useState(true);

  const [gdpPerCapita, setGdpPerCapita] = useState<TransformedEntry[]>([]);
  const [loadingGdpPerCapita, setLoadingGdpPerCapita] = useState(true);

  const [empStruct, setEmpStruct] = useState<
    { rows: any[]; columns: any[] } & MetaInfo
  >({ rows: [], columns: [] });
  const [loadingEmpStruct, setLoadingEmpStruct] = useState(true);

  const [topEmp, setTopEmp] = useState<LabeledData & MetaInfo>({
    labels: [],
    values: [],
  });
  const [loadingTopEmp, setLoadingTopEmp] = useState(true);

  const [nacEmp, setNacEmp] = useState<SimpleChartData & MetaInfo>({
    labels: [],
    values: [],
  });
  const [loadingNacEmp, setLoadingNacEmp] = useState(true);

  const [bizSize, setBizSize] = useState<SimpleChartData & MetaInfo>({
    labels: [],
    values: [],
  });
  const [loadingBizSize, setLoadingBizSize] = useState(true);

  const [patents, setPatents] = useState<LabeledData & MetaInfo>({
    labels: [],
    values: [],
  });
  const [loadingPatents, setLoadingPatents] = useState(true);

  const [hgeTop, setHgeTop] = useState<LabeledData & MetaInfo>({
    labels: [],
    values: [],
  });
  const [loadingHgeTop, setLoadingHgeTop] = useState(true);

  const [touristLodging, setTouristLodging] = useState<any[]>([]);
  const [loadingTouristLodging, setLoadingTouristLodging] = useState(true);

  const [economyIcons, setEconomyIcons] = useState<any[]>([]);
  const [loadingEconomyIcons, setLoadingEconomyIcons] = useState(true);

  const [econActBIH, setEconActBIH] = useState<LabeledData>({
    labels: [],
    values: [],
  });
  const [econActBIHMeta, setEconActBIHMeta] = useState<MetaInfo>({});
  const [loadingEconActBIH, setLoadingEconActBIH] = useState(true);

  const [servicesIndex, setServicesIndex] = useState<{ values: number[] }>({
    values: [],
  });
  const [servicesMeta, setServicesMeta] = useState<MetaInfo>({});
  const [loadingServicesIndex, setLoadingServicesIndex] = useState(true);

  const [netEarningsBIH, setNetEarningsBIH] = useState<LabeledData & MetaInfo>({
    labels: [],
    values: [],
  });
  const [loadingNetEarningsBIH, setLoadingNetEarningsBIH] = useState(true);

  const [grossPayBIH, setGrossPayBIH] = useState<LabeledData & MetaInfo>({
    labels: [],
    values: [],
  });
  const [loadingGrossPayBIH, setLoadingGrossPayBIH] = useState(true);

  const [empBySector23, setEmpBySector23] = useState<LabeledData & MetaInfo>({
    labels: [],
    values: [],
  });
  const [loadingEmpBySector23, setLoadingEmpBySector23] = useState(true);

  const [touristNights, setTouristNights] = useState<LabeledData & MetaInfo>({
    labels: [],
    values: [],
  });
  const [loadingTouristNights, setLoadingTouristNights] = useState(true);

  const [companiesBIH, setCompaniesBIH] = useState<LabeledData & MetaInfo>({
    labels: [],
    values: [],
  });
  const [loadingCompaniesBIH, setLoadingCompaniesBIH] = useState(true);

  const [employmentBIH, setEmploymentBIH] = useState<LabeledData & MetaInfo>({
    labels: [],
    values: [],
  });
  const [loadingEmploymentBIH, setLoadingEmploymentBIH] = useState(true);

  const getTotalSeries = (src: TransformedEntry[]): SimpleChartData => {
    const tot = src.filter(d => d.gender === 'Total');
    return { labels: tot.map(d => d.ageGroup), values: tot.map(d => d.value) };
  };

  const getSurveyName = (m: any): string | undefined => {
    if (!m) return undefined;
    const candidates = [
      m.surveyName,
      m.survey_name,
      m.surveyTitle,
      m.survey_title,
      m.survey,
      m.dataset,
      m.metadata?.survey,
      m.meta?.survey,
    ];
    const s = candidates.find(
      v => typeof v === 'string' && v.trim().length > 0
    );
    return s?.trim();
  };

  useEffect(() => {
    if (
      !region.charts?.economy?.includes('FetchGrossValueAddedAtCurrentPrices')
    )
      return;
    setLoadingGva(true);
    fetchDatapoints('FetchGrossValueAddedAtCurrentPrices', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then((data: Datapoint[]) => {
        const out = data.map(it => ({
          ageGroup: it.dimensions[4],
          gender: it.dimensions[1],
          value: it.value,
          region: it.region,
          source: it.source,
          survey: it.survey,
          timestamp: it.timestamp,
          regionName: region.pilot_nuts3,
        }));
        setGvaData(out);
      })
      .catch(console.error)
      .finally(() => setLoadingGva(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchNominalProductivity')) return;
    setLoadingNomProd(true);
    fetchDatapoints('FetchNominalProductivity', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then((data: Datapoint[]) => {
        const vals = data.map(d => d.value);
        const m = data[0] ?? {};
        setNomProd({ labels: [], values: vals, ...m });
      })
      .catch(console.error)
      .finally(() => setLoadingNomProd(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchGdpPerInhabitantLastYear'))
      return;
    setLoadingGdpLast(true);
    fetchDatapoints('FetchGdpPerInhabitantLastYear', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then((data: Datapoint[]) => {
        const it = data[0];
        if (it) setGdpLast({ labels: [], values: [it.value], ...it });
      })
      .catch(console.error)
      .finally(() => setLoadingGdpLast(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchGdpPerInhabitant')) return;
    setLoadingGdpPerCapita(true);
    fetchDatapoints('FetchGdpPerInhabitant', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then((data: Datapoint[]) => {
        const arr = data.map(it => ({
          ageGroup: it.dimensions[it.dimensions.length - 1],
          gender: it.dimensions.includes('Males')
            ? 'Males'
            : it.dimensions.includes('Females')
              ? 'Females'
              : 'Total',
          value: it.value,
          region: it.region,
          source: it.source,
          survey: it.survey,
          timestamp: it.timestamp,
          regionName: region.pilot_nuts3,
        }));
        setGdpPerCapita(arr);
      })
      .catch(console.error)
      .finally(() => setLoadingGdpPerCapita(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchEmployerStructure')) return;
    setLoadingEmpStruct(true);
    fetchDatapoints('FetchEmployerStructure', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then(data => {
        const rows = data.map((it, i) => ({
          id: i,
          employmentType: it.dimensions[1],
          sector: it.dimensions[2],
          value: it.value,
        }));
        const columns = [
          { field: 'employmentType', headerName: 'Employment Type', flex: 3 },
          { field: 'sector', headerName: 'Business Sector (NACE)', flex: 4 },
          { field: 'value', headerName: 'Value', flex: 1, type: 'number' },
        ];
        const m = data[0] ?? {};
        setEmpStruct({ rows, columns, ...m });
      })
      .catch(console.error)
      .finally(() => setLoadingEmpStruct(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchTopEmploymentCategories'))
      return;
    setLoadingTopEmp(true);
    fetchDatapoints('FetchTopEmploymentCategories', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then(data => {
        const top10 = data.sort((a, b) => b.value - a.value).slice(0, 10);
        const m = top10[0] ?? {};
        setTopEmp({
          labels: top10.map(d => d.dimensions[2]),
          values: top10.map(d => d.value),
          ...m,
        });
      })
      .catch(console.error)
      .finally(() => setLoadingTopEmp(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchNumberNACEmployees')) return;
    setLoadingNacEmp(true);
    fetchDatapoints('FetchNumberNACEmployees', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then(data => {
        const it = data[0];
        if (it) setNacEmp({ values: [it.value], ...it });
      })
      .catch(console.error)
      .finally(() => setLoadingNacEmp(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchBusinessSizeClass')) return;
    setLoadingBizSize(true);
    fetchDatapoints('FetchBusinessSizeClass', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then(data => {
        const m = data[0] ?? {};
        setBizSize({
          labels: data.map(d => d.dimensions[2]),
          values: data.map(d => d.value),
          ...m,
        });
      })
      .catch(console.error)
      .finally(() => setLoadingBizSize(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchPatentApplication')) return;
    setLoadingPatents(true);
    fetchDatapoints('FetchPatentApplication', {
      pilot_nuts1: region.pilot_nuts1,
    })
      .then(data => {
        const sorted = data.sort((a, b) => {
          const yA = +a.dimensions.find(d => /\d{4}/.test(d))!;
          const yB = +b.dimensions.find(d => /\d{4}/.test(d))!;
          return yA - yB;
        });
        const m = sorted[0] ?? {};
        setPatents({
          labels: sorted.map(
            d => d.dimensions.find(d => /\d{4}/.test(d)) || ''
          ),
          values: sorted.map(d => d.value),
          ...m,
        });
      })
      .catch(console.error)
      .finally(() => setLoadingPatents(false));
  }, [region.pilot_nuts1]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchHighGrowingEnterprises'))
      return;
    setLoadingHgeTop(true);
    fetchDatapoints('FetchHighGrowingEnterprises', {
      pilot_nuts3: region.pilot_nuts3,
    })
      .then(data => {
        const sorted = data.sort((a, b) => b.value - a.value);
        const m = sorted[0] ?? {};
        setHgeTop({
          labels: sorted.map(d => d.dimensions[2]),
          values: sorted.map(d => d.value),
          ...m,
        });
      })
      .catch(console.error)
      .finally(() => setLoadingHgeTop(false));
  }, [region.pilot_nuts3]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchTouristLodgingIcons')) return;
    setLoadingTouristLodging(true);
    fetchDatapoints('FetchTouristLodgingIcons', { pilot: region.pilot })
      .then((data: any) => {
        const icons = [
          {
            label: 'OSM_economy.alpineHut',
            icon: 'cabin',
            value: data.alpine_hut?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.campPitch',
            icon: 'camping',
            value: data.camp_pitch?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.campSite',
            icon: 'camping',
            value: data.camp_site?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.caravanSite',
            icon: 'rv_hookup',
            value: data.caravan_site?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.chalet',
            icon: 'holiday_village',
            value: data.chalet?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.guestHouse',
            icon: 'house',
            value: data.guest_house?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.hostel',
            icon: 'meeting_room',
            value: data.hostel?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.hotel',
            icon: 'hotel',
            value: data.hotel?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.motel',
            icon: 'local_hotel',
            value: data.motel?.[0]?.value ?? 0,
          },
        ];
        setTouristLodging(icons);
      })
      .catch(console.error)
      .finally(() => setLoadingTouristLodging(false));
  }, [region.pilot]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchEconomyIcons')) return;
    setLoadingEconomyIcons(true);
    fetchDatapoints('FetchEconomyIcons', { pilot: region.pilot })
      .then((data: any) => {
        const icons = [
          {
            label: 'OSM_economy.restaurant',
            icon: 'restaurant',
            value: data.restaurant?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.cinema',
            icon: 'movie',
            value: data.cinema?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.vendingMachine',
            icon: 'cookie',
            value: data.vending_machine?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.pipeline',
            icon: 'valve',
            value: data.pipeline?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.industrialWorks',
            icon: 'factory',
            value: data.industrial_works?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.touristAttraction',
            icon: 'attractions',
            value: data.tourist_attraction?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.touristInfo',
            icon: 'info',
            value: data.tourist_info?.[0]?.value ?? 0,
          },
          {
            label: 'OSM_economy.museum',
            icon: 'museum',
            value: data.museum?.[0]?.value ?? 0,
          },
        ];
        setEconomyIcons(icons);
      })
      .catch(console.error)
      .finally(() => setLoadingEconomyIcons(false));
  }, [region.pilot]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchEconomyActivitiesBIH')) return;
    setLoadingEconActBIH(true);
    fetchDatapoints('FetchEconomyActivitiesBIH', {})
      .then((rows: Datapoint[]) => {
        const labels = rows.map(r => r.dimensions[1] || '');
        const values = rows.map(r => r.value);
        setEconActBIH({ labels, values });
        const m = rows[0] ?? ({} as any);
        setEconActBIHMeta({
          region: m.region,
          source: m.source,
          survey: (m as any).surveyName ?? m.survey,
          timestamp: m.timestamp,
        });
      })
      .catch(err => console.error('FetchEconomyActivitiesBIH error:', err))
      .finally(() => setLoadingEconActBIH(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchTotalServicesIndexBIH')) return;
    setLoadingServicesIndex(true);
    fetchDatapoints('FetchTotalServicesIndexBIH', {})
      .then((rows: Datapoint[]) => {
        const values = rows.map(r => Math.round(r.value));
        setServicesIndex({ values });
        const m = rows[0] ?? ({} as any);
        setServicesMeta({
          region: m.region,
          source: m.source,
          survey: (m as any).surveyName ?? m.survey,
          timestamp: m.timestamp,
        });
      })
      .catch(err => console.error('FetchTotalServicesIndexBIH error:', err))
      .finally(() => setLoadingServicesIndex(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchTotalNetEarningsBIH')) return;
    setLoadingNetEarningsBIH(true);
    fetchDatapoints('FetchTotalNetEarningsBIH', {})
      .then((rows: Datapoint[]) => {
        const sorted = [...rows].sort((a, b) =>
          (a.dimensions[1] || '').localeCompare(b.dimensions[1] || '')
        );
        setNetEarningsBIH({
          labels: sorted.map(r => r.dimensions[1] || ''),
          values: sorted.map(r => Number(r.value)),
          region: sorted[0]?.region,
          source: sorted[0]?.source,
          survey: (sorted[0] as any)?.surveyName ?? sorted[0]?.survey,
          timestamp: sorted[0]?.timestamp,
          regionName: region.pilot_nuts3,
        });
      })
      .catch(err => console.error('FetchTotalNetEarningsBIH error:', err))
      .finally(() => setLoadingNetEarningsBIH(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchGrossPayBIH')) return;
    setLoadingGrossPayBIH(true);
    fetchDatapoints('FetchGrossPayBIH', {})
      .then((rows: Datapoint[]) => {
        const sorted = [...rows].sort((a, b) =>
          (a.dimensions[1] || '').localeCompare(b.dimensions[1] || '')
        );
        setGrossPayBIH({
          labels: sorted.map(r => r.dimensions[1] || ''),
          values: sorted.map(r => Number(r.value)),
          region: sorted[0]?.region,
          source: sorted[0]?.source,
          survey: (sorted[0] as any)?.surveyName ?? sorted[0]?.survey,
          timestamp: sorted[0]?.timestamp,
        });
      })
      .catch(err => console.error('FetchGrossPayBIH error:', err))
      .finally(() => setLoadingGrossPayBIH(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchTransportedGoodsIndexBIH'))
      return;
    setLoadingEmpBySector23(true);
    fetchDatapoints('FetchTransportedGoodsIndexBIH', {})
      .then((rows: Datapoint[]) => {
        const grouped: Record<string, number> = {};
        rows.forEach(r => {
          const label = r.dimensions[1] || '';
          grouped[label] = (grouped[label] ?? 0) + Number(r.value);
        });
        const top = Object.entries(grouped)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15);
        const labels = top.map(([k]) => k);
        const values = top.map(([, v]) => v);
        const m = rows[0] ?? ({} as any);
        setEmpBySector23({
          labels,
          values,
          region: m.region,
          source: m.source,
          survey: (m as any).surveyName ?? m.survey,
          timestamp: m.timestamp,
        });
      })
      .catch(err => console.error('FetchTransportedGoodsIndexBIH error:', err))
      .finally(() => setLoadingEmpBySector23(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchTouristNightsBIH')) return;
    setLoadingTouristNights(true);
    fetchDatapoints('FetchTouristNightsBIH', {})
      .then((rows: Datapoint[]) => {
        const monthly = rows
          .map(r => {
            const m = r.dimensions.find(d => /^\d{4}-(0[1-9]|1[0-2])$/.test(d));
            return m ? { month: m, value: Number(r.value), meta: r } : null;
          })
          .filter(Boolean) as {
          month: string;
          value: number;
          meta: Datapoint;
        }[];
        monthly.sort((a, b) => a.month.localeCompare(b.month));
        const labels = monthly.map(x => x.month);
        const values = monthly.map(x => x.value);
        const meta = monthly[0]?.meta;
        setTouristNights({
          labels,
          values,
          region: meta?.region,
          source: meta?.source,
          survey: getSurveyName(meta),
          timestamp: meta?.timestamp,
        });
      })
      .catch(err => console.error('FetchTouristNightsBIH error:', err))
      .finally(() => setLoadingTouristNights(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchCompaniesBIH')) return;
    setLoadingCompaniesBIH(true);
    fetchDatapoints('FetchCompaniesBIH', {})
      .then((rows: Datapoint[]) => {
        const items = rows.map(r => {
          const token =
            r.dimensions.find(d => /^\d{4}(-\d{2})?$/.test(d)) ?? '';
          const label = token || r.dimensions[r.dimensions.length - 1] || '';
          const year = token ? parseInt(token.slice(0, 4), 10) : -Infinity;
          return { label, value: Number(r.value), year, meta: r };
        });
        items.sort((a, b) => a.year - b.year || a.label.localeCompare(b.label));
        const m = items[0]?.meta ?? ({} as any);
        setCompaniesBIH({
          labels: items.map(i => i.label),
          values: items.map(i => i.value),
          region: m.region,
          source: m.source,
          survey: m.surveyName ?? m.survey,
          timestamp: m.timestamp,
        });
      })
      .catch(err => console.error('FetchCompaniesBIH error:', err))
      .finally(() => setLoadingCompaniesBIH(false));
  }, [region]);

  useEffect(() => {
    if (!region.charts?.economy?.includes('FetchEmploymentBIH')) return;
    setLoadingEmploymentBIH(true);
    fetchDatapoints('FetchEmploymentBIH', {})
      .then((rows: Datapoint[]) => {
        const unique: Record<string, Datapoint> = {};
        for (const r of rows) {
          const label = r.dimensions[1] || '';
          if (!unique[label]) unique[label] = r;
        }
        const sorted = Object.values(unique)
          .sort((a, b) => Number(b.value) - Number(a.value))
          .slice(0, 8);
        const cleanLabel = (s: string) =>
          s.toLowerCase().replace(/^\p{L}/u, c => c.toUpperCase());
        const labels = sorted.map(r => cleanLabel(r.dimensions[1] || ''));
        const values = sorted.map(r => Number(r.value));
        const m = sorted[0] ?? ({} as any);
        setEmploymentBIH({
          labels,
          values,
          region: m.region,
          source: m.source,
          survey: m.surveyName ?? m.survey,
          timestamp: m.timestamp,
        });
      })
      .catch(err => console.error('FetchEmploymentBIH error:', err))
      .finally(() => setLoadingEmploymentBIH(false));
  }, [region]);

  const showNomProd = region.charts?.economy?.includes(
    'FetchNominalProductivity'
  );
  const showGdpLast = region.charts?.economy?.includes(
    'FetchGdpPerInhabitantLastYear'
  );
  const showNacEmp = region.charts?.economy?.includes(
    'FetchNumberNACEmployees'
  );

  const miniColTitle = [
    showNomProd && t('dashboard.charts.economy.nominalLabourProductivity'),
    showGdpLast && t('dashboard.charts.economy.gdpLastYear'),
    showNacEmp && t('dashboard.charts.economy.employedPersonsNACE'),
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <Grid
      container
      rowSpacing={2}
      columnSpacing={{ xs: 1, sm: 2, md: 3, lg: 2 }}
    >
      {region.charts?.economy?.includes(
        'FetchGrossValueAddedAtCurrentPrices'
      ) && (
        <SearchableGridItem
          xs={12}
          lg={8}
          xl={8}
          title={t('dashboard.charts.economy.gvaByCurrency')}
          regionLevel="nuts3"
        >
          <Card
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ flex: 1, position: 'relative', minHeight: 300 }}>
              {loadingGva ? (
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
                    title={t('dashboard.charts.economy.gvaByCurrency')}
                    data={gvaData}
                    labelKey="ageGroup"
                    groupKey="gender"
                    region={gvaData[0]?.region}
                    source={gvaData[0]?.source}
                    survey={gvaData[0]?.survey}
                    timestamp={gvaData[0]?.timestamp}
                    regionName={gvaData[0]?.regionName}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {(showNomProd || showGdpLast || showNacEmp) && (
        <SearchableGridItem
          xs={12}
          md={4}
          lg={4}
          xl={4}
          title={miniColTitle}
          regionLevel="nuts3"
        >
          <Grid container direction="column" rowSpacing={2}>
            {showNomProd && (
              <SearchableGridItem
                xs={12}
                title={t('dashboard.charts.economy.nominalLabourProductivity')}
                regionLevel="nuts3"
              >
                <Card sx={{ p: 2 }}>
                  <Box sx={{ position: 'relative', height: 120 }}>
                    {loadingNomProd ? (
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
                            'dashboard.charts.economy.nominalLabourProductivity'
                          )}
                          data={nomProd}
                          region={nomProd.region}
                          source={nomProd.source}
                          survey={nomProd.survey}
                          timestamp={nomProd.timestamp}
                          regionName={region.pilot_nuts3}
                        />
                      </Suspense>
                    )}
                  </Box>
                </Card>
              </SearchableGridItem>
            )}

            {showGdpLast && (
              <SearchableGridItem
                xs={12}
                title={t('dashboard.charts.economy.gdpLastYear')}
                regionLevel="nuts3"
              >
                <Card sx={{ p: 2 }}>
                  <Box sx={{ position: 'relative', height: 80 }}>
                    {loadingGdpLast ? (
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
                          title={t('dashboard.charts.economy.gdpLastYear')}
                          data={gdpLast!}
                          unit="mio €"
                          region={gdpLast!.region}
                          source={gdpLast!.source}
                          survey={gdpLast!.survey}
                          timestamp={gdpLast!.timestamp}
                          regionName={region.pilot_nuts3}
                        />
                      </Suspense>
                    )}
                  </Box>
                </Card>
              </SearchableGridItem>
            )}

            {showNacEmp && (
              <SearchableGridItem
                xs={12}
                title={t('dashboard.charts.economy.employedPersonsNACE')}
                regionLevel="nuts3"
              >
                <Card sx={{ p: 2 }}>
                  <Box sx={{ position: 'relative', height: 80 }}>
                    {loadingNacEmp ? (
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
                            'dashboard.charts.economy.employedPersonsNACE'
                          )}
                          data={nacEmp}
                          unit="thousand"
                          region={nacEmp.region}
                          source={nacEmp.source}
                          survey={nacEmp.survey}
                          timestamp={nacEmp.timestamp}
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

      {region.charts?.economy?.includes('FetchTopEmploymentCategories') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={5}
          xl={4}
          title={t('dashboard.charts.economy.topEmploymentCategories')}
          regionLevel="nuts3"
        >
          <Card
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingTopEmp ? (
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
                    title={t(
                      'dashboard.charts.economy.topEmploymentCategories'
                    )}
                    labels={topEmp.labels}
                    values={topEmp.values}
                    region={topEmp.region}
                    source={topEmp.source}
                    survey={topEmp.survey}
                    timestamp={topEmp.timestamp}
                    regionName={region.pilot_nuts3}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.economy?.includes('FetchGdpPerInhabitant') && (
        <SearchableGridItem
          xs={12}
          lg={8}
          xl={8}
          title={t('dashboard.charts.economy.gdpPerInhabitant')}
          regionLevel="nuts3"
        >
          <Card
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: 260,
            }}
          >
            <Box sx={{ flex: 1, minHeight: 400 }}>
              {loadingGdpPerCapita ? (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={450}
                  sx={{ borderRadius: 2, bgcolor: 'grey.200' }}
                />
              ) : (
                <Suspense
                  fallback={
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={400}
                      sx={{ borderRadius: 2, bgcolor: 'grey.200' }}
                    />
                  }
                >
                  <BarGraph
                    title={t('dashboard.charts.economy.gdpPerInhabitant')}
                    unit="mio €"
                    data={getTotalSeries(gdpPerCapita)}
                    region={gdpPerCapita[0]?.region}
                    source={gdpPerCapita[0]?.source}
                    survey={gdpPerCapita[0]?.survey}
                    timestamp={gdpPerCapita[0]?.timestamp}
                    regionName={region.pilot_nuts3}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.economy?.includes('FetchBusinessSizeClass') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={4}
          xl={4}
          title={t('dashboard.charts.economy.enterpriseSizeClass')}
          regionLevel="nuts3"
        >
          <Card sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', minHeight: 300 }}>
              {loadingBizSize ? (
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
                    title={t('dashboard.charts.economy.enterpriseSizeClass')}
                    data={bizSize}
                    region={bizSize.region}
                    source={bizSize.source}
                    survey={bizSize.survey}
                    timestamp={bizSize.timestamp}
                    regionName={region.pilot_nuts3}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.economy?.includes('FetchEmployerStructure') && (
        <SearchableGridItem
          xs={12}
          lg={8}
          xl={8}
          title={t('dashboard.charts.economy.employmentByBusinessSector')}
          regionLevel="nuts3"
        >
          <Card
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingEmpStruct ? (
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
                      'dashboard.charts.economy.employmentByBusinessSector'
                    )}
                    rows={empStruct.rows}
                    columns={empStruct.columns}
                    region={empStruct.region}
                    source={empStruct.source}
                    survey={empStruct.survey}
                    timestamp={empStruct.timestamp}
                    regionName={region.pilot_nuts3}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.economy?.includes('FetchPatentApplication') && (
        <SearchableGridItem
          xs={12}
          lg={6}
          xl={8}
          title={t('dashboard.charts.economy.patentApplicationsPerMillion')}
          regionLevel="nuts1"
        >
          <Card
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingPatents ? (
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
                      'dashboard.charts.economy.patentApplicationsPerMillion'
                    )}
                    data={patents}
                    unit="applications"
                    region={patents.region}
                    source={patents.source}
                    survey={patents.survey}
                    timestamp={patents.timestamp}
                    regionName={region.pilot_nuts1}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.economy?.includes('FetchHighGrowingEnterprises') && (
        <SearchableGridItem
          xs={12}
          lg={6}
          xl={4}
          title={t('dashboard.charts.economy.highGrowthEnterprises')}
          regionLevel="nuts3"
        >
          <Card
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingHgeTop ? (
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
                    title={t('dashboard.charts.economy.highGrowthEnterprises')}
                    labels={hgeTop.labels}
                    values={hgeTop.values}
                    region={hgeTop.region}
                    source={hgeTop.source}
                    survey={hgeTop.survey}
                    timestamp={hgeTop.timestamp}
                    regionName={region.pilot_nuts3}
                  />
                </Suspense>
              )}
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
              HGE has an average annualised growth in employees that is greater
              than 10% over a 3 year period and must have had at least 10
              employees at the beginning of said growth period.
            </Typography>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.economy?.includes('FetchTouristLodgingIcons') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={6}
          xl={4}
          title={t('dashboard.charts.economy.touristLodgingFacilities')}
          regionLevel={'area'}
        >
          <Card sx={{ p: 2 }}>
            {loadingTouristLodging ? (
              <Skeleton variant="rectangular" width="100%" height={200} />
            ) : (
              <Suspense
                fallback={
                  <Skeleton variant="rectangular" width="100%" height={200} />
                }
              >
                <IconGridStats
                  title={t('dashboard.charts.economy.touristLodgingFacilities')}
                  data={touristLodging}
                  region={region.pilot}
                  source="OSM"
                  survey="OpenStreetMap"
                  timestamp={new Date().toISOString()}
                  regionName={t(region.title)}
                />
              </Suspense>
            )}
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.economy?.includes('FetchEconomyIcons') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={6}
          xl={4}
          title={t('dashboard.charts.economy.additionalEconomyIndicators')}
          regionLevel={'area'}
        >
          <Card sx={{ p: 2 }}>
            {loadingEconomyIcons ? (
              <Skeleton variant="rectangular" width="100%" height={200} />
            ) : (
              <Suspense
                fallback={
                  <Skeleton variant="rectangular" width="100%" height={200} />
                }
              >
                <IconGridStats
                  title={t(
                    'dashboard.charts.economy.additionalEconomyIndicators'
                  )}
                  data={economyIcons}
                  region={region.pilot}
                  source="OSM"
                  survey="OpenStreetMap"
                  timestamp={new Date().toISOString()}
                  regionName={t(region.title)}
                />
              </Suspense>
            )}
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.economy?.includes('FetchEconomyActivitiesBIH') && (
        <SearchableGridItem
          xs={12}
          md={12}
          lg={12}
          xl={9}
          title={t('dashboard.charts.economy.bihActivitiesIndex')}
          regionLevel="nuts1"
        >
          <Card
            sx={{ p: 2, height: 390, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingEconActBIH ? (
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
                    title={t('dashboard.charts.economy.bihActivitiesIndex')}
                    data={econActBIH}
                    unit="index (2021=100)"
                    region={econActBIHMeta.region}
                    source={econActBIHMeta.source}
                    survey={econActBIHMeta.survey}
                    timestamp={econActBIHMeta.timestamp}
                    regionName={region.pilot_nuts1}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.economy?.includes('FetchTotalServicesIndexBIH') && (
        <SearchableGridItem
          xs={12}
          md={4}
          lg={3}
          xl={3}
          title={t('dashboard.charts.economy.totalServicesAndEarnings')}
          regionLevel="nuts1"
        >
          <Card sx={{ p: 2, mb: 2 }}>
            {loadingServicesIndex ? (
              <Skeleton variant="rectangular" height={80} />
            ) : (
              <Suspense
                fallback={<Skeleton variant="rectangular" height={80} />}
              >
                <MiniNumber
                  title={t('dashboard.charts.economy.totalServicesIndex')}
                  data={servicesIndex}
                  region={servicesMeta.region}
                  source={servicesMeta.source}
                  survey={servicesMeta.survey}
                  timestamp={servicesMeta.timestamp}
                  regionName={region.pilot_nuts1}
                />
              </Suspense>
            )}
          </Card>

          {region.charts?.economy?.includes('FetchGrossPayBIH') && (
            <Card sx={{ p: 2, mb: 2 }}>
              <Box sx={{ position: 'relative', height: 120 }}>
                {loadingGrossPayBIH ? (
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
                        'dashboard.charts.economy.totalGrossEarningsBIH'
                      )}
                      data={grossPayBIH}
                      unit="BAM"
                      region={grossPayBIH.region}
                      source={grossPayBIH.source}
                      survey={grossPayBIH.survey}
                      timestamp={grossPayBIH.timestamp}
                      regionName={region.pilot_nuts1}
                    />
                  </Suspense>
                )}
              </Box>
            </Card>
          )}
        </SearchableGridItem>
      )}

      {region.charts?.economy?.includes('FetchTotalNetEarningsBIH') && (
        <SearchableGridItem
          xs={12}
          lg={7}
          xl={8}
          title={t('dashboard.charts.economy.totalNetEarningsBIH')}
          regionLevel="nuts1"
        >
          <Card
            sx={{ p: 2, height: 390, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingNetEarningsBIH ? (
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
                    title={t('dashboard.charts.economy.totalNetEarningsBIH')}
                    data={netEarningsBIH}
                    unit="BAM"
                    region={netEarningsBIH.region}
                    source={netEarningsBIH.source}
                    survey={netEarningsBIH.survey}
                    timestamp={netEarningsBIH.timestamp}
                    regionName={region.pilot_nuts1}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.economy?.includes('FetchCompaniesBIH') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={5}
          xl={4}
          title={t('dashboard.charts.economy.numberOfCompaniesBIH')}
          regionLevel="nuts1"
        >
          <Card
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingCompaniesBIH ? (
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
                    title={t('dashboard.charts.economy.numberOfCompaniesBIH')}
                    unit="enterprises"
                    data={companiesBIH}
                    region={companiesBIH.region}
                    source={companiesBIH.source}
                    survey={companiesBIH.survey}
                    timestamp={companiesBIH.timestamp}
                    regionName={region.pilot_nuts1}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.economy?.includes('FetchTouristNightsBIH') && (
        <SearchableGridItem
          xs={12}
          lg={7}
          xl={8}
          title={t('dashboard.charts.economy.touristNightsBIH')}
          regionLevel="nuts1"
        >
          <Card
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ flex: 1, minHeight: 360 }}>
              {loadingTouristNights ? (
                <Skeleton variant="rectangular" width="100%" height={360} />
              ) : (
                <Suspense
                  fallback={
                    <Skeleton variant="rectangular" width="100%" height={360} />
                  }
                >
                  <BarGraph
                    title={t('dashboard.charts.economy.touristNightsBIH')}
                    unit="nights"
                    data={touristNights}
                    region={touristNights.region}
                    source={touristNights.source}
                    survey={touristNights.survey}
                    timestamp={touristNights.timestamp}
                  />
                </Suspense>
              )}
            </Box>
          </Card>
        </SearchableGridItem>
      )}

      {region.charts?.economy?.includes('FetchEmploymentBIH') && (
        <SearchableGridItem
          xs={12}
          md={6}
          lg={5}
          xl={4}
          title={t('dashboard.charts.economy.employmentTopSectorsBIH')}
          regionLevel="nuts1"
        >
          <Card
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              {loadingEmploymentBIH ? (
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
                    title={t(
                      'dashboard.charts.economy.employmentTopSectorsBIH'
                    )}
                    labels={employmentBIH.labels}
                    values={employmentBIH.values}
                    region={employmentBIH.region}
                    source={employmentBIH.source}
                    survey={employmentBIH.survey}
                    timestamp={employmentBIH.timestamp}
                    regionName={region.pilot_nuts1}
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

export default EconomyTab;
