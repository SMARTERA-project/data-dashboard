import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  useTheme,
  Grid,
  Chip,
  Paper,
  LinearProgress,
  CircularProgress,
  Divider,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { fetchDatapoints } from '@/api/graphql';

import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import LanguageSelector from '@components/common/LanguageSelector';
import { REGIONS } from '@data/regions';
import PdfDownloads from '@components/analysis/PdfDownloads';
import Donut from '@components/charts/Donut';

const RegionVillages: Record<string, string[]> = {
  'valle-di-sole': [
    'P1 - Valle di Sole - Caldes',
    'P1 - Valle di Sole - Cavizzana',
    'P1 - Valle di Sole - Commezzadura',
    'P1 - Valle di Sole - Croviana',
    'P1 - Valle di Sole - Dimaro Folgarida',
    'P1 - Valle di Sole - Male',
    'P1 - Valle di Sole - Mezzana',
    'P1 - Valle di Sole - Ossana',
    'P1 - Valle di Sole - Peio',
    'P1 - Valle di Sole - Pellizzano',
    'P1 - Valle di Sole - Rabbi',
    'P1 - Valle di Sole - Terzolas',
    'P1 - Valle di Sole - Vermiglio',
  ],

  'tramuntana-soller': [
    'P2 - Soller Tramuntana - Fornalutx Biniaraix',
    'P2 - Soller Tramuntana - Port of Soller',
    'P2 - Soller Tramuntana - Soller',
  ],

  'northern-ostrobothnia': [
    'P3 - Northern Ostrobothnia - Alavieska',
    'P3 - Northern Ostrobothnia - Kalajoki',
    'P3 - Northern Ostrobothnia - Nivala',
  ],

  'east-herzegovina': [
    'P4 - East Herzegovina - Gacko',
    'P4 - East Herzegovina - Nevesinje',
    'P4 - East Herzegovina - Bileca',
  ],

  'smarje-padna': ['P5 - Smarje-Padna - Padna', 'P5 - Smarje-Padna - Smarje'],

  'devetaki-plateau': [
    'P6 - Devetaki Plateau - Agatovo',
    'P6 - Devetaki Plateau - Aleksandrovo',
    'P6 - Devetaki Plateau - Brestovo',
    'P6 - Devetaki Plateau - Gorsko Slivovo',
    'P6 - Devetaki Plateau - Kakrina',
    'P6 - Devetaki Plateau - Karpachevo',
    'P6 - Devetaki Plateau - Kramolin',
    'P6 - Devetaki Plateau - Krushuna',
    'P6 - Devetaki Plateau - Tepava',
  ],
};

const INDICATOR_CODES = [
  '1.1.1',
  '1.1.2',
  '1.1.4',
  '2.1.1',
  '2.2.2',
  '3.2.1',
] as const;
type IndicatorCode = (typeof INDICATOR_CODES)[number];
const trKey = (code: string) => code.replace(/\./g, '_');

const MAX_SELECTED_VILLAGES = 3;

type VillageMetrics = {
  overall: { value: number; max?: number };
  indicators: Record<IndicatorCode, { value: number; max: number }>;
  explanations: Partial<Record<IndicatorCode, string>>;
  meta?: {
    region?: string;
    source?: string;
    survey?: string;
    timestamp?: string;
  };
};

const MiniBar: React.FC<{ value: number; min: number; max: number }> = ({
  value,
  min,
  max,
}) => {
  const safeMax = max <= 0 ? 1 : max;
  const clamped = Math.max(min, Math.min(value, safeMax));
  const pct = ((clamped - min) / (safeMax - min || 1)) * 100;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Typography
        sx={{
          position: 'absolute',
          top: -27,
          left: `calc(${Math.min(Math.max(pct, 1), 97)}%)`,
          transform: 'translateX(-50%)',
          color: '#284F41',
          fontWeight: 600,
        }}
      >
        {clamped}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: '#f3f3f3',
          '& .MuiLinearProgress-bar': {
            borderRadius: 5,
            backgroundColor: '#284F41',
          },
        }}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 0.5,
        }}
      >
        <Typography variant="body2" fontWeight={700}>
          {min}
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          {safeMax}
        </Typography>
      </Box>
    </Box>
  );
};

const buildSurveyCandidates = (name: string): string[] => {
  const normSep = name.replace(/\s*-\s*/g, ' - ');
  const dehyphenParts = normSep
    .split(' - ')
    .map(p => p.replace(/-/g, ' ').replace(/\s+/g, ' ').trim())
    .join(' - ');
  const allHyphensToSpaces = name.replace(/-/g, ' ').replace(/\s+/g, ' ');
  const compactSepHyphen = normSep.replace(/ - /g, '-');
  return Array.from(
    new Set([
      name,
      normSep,
      dehyphenParts,
      allHyphensToSpaces,
      compactSepHyphen,
    ])
  );
};

const Analysis: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { regionId } = useParams<{ regionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [villageData, setVillageData] = useState<
    Record<string, VillageMetrics>
  >({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeVillageIds, setActiveVillageIds] = useState<string[]>([]);

  useEffect(() => {
    if (!regionId) navigate(`/analysis/${REGIONS[0].id}`, { replace: true });
  }, [regionId, navigate]);

  const villagesForRegion = RegionVillages[regionId || ''] || [];

  useEffect(() => {
    const fetchSmartnessData = async () => {
      try {
        setLoading(true);
        const allData: Record<string, VillageMetrics> = {};

        for (const villageName of villagesForRegion) {
          try {
            const tryNames = buildSurveyCandidates(villageName);
            let datapoints: any[] = [];
            let usedSurvey = '';

            for (const candidate of tryNames) {
              const res = await fetchDatapoints('FetchSmartness', {
                village: candidate,
              });
              const count = Array.isArray(res) ? res.length : 0;
              if (count) {
                datapoints = res;
                usedSurvey = candidate;
                break;
              }
            }

            if (!datapoints.length) {
              console.warn(
                '[Analysis] No SmartnessIndex for',
                villageName,
                'nodes:',
                datapoints
              );
              continue;
            }

            const overallNode = datapoints.find(
              (dp: any) =>
                Array.isArray(dp.dimensions) &&
                dp.dimensions.some((d: string) =>
                  ['SmartnessIndex', 'smaertnessIndex'].includes(d)
                )
            );

            const indicators: Record<
              IndicatorCode,
              { value: number; max: number }
            > = {
              '1.1.1': { value: 0, max: 0 },
              '1.1.2': { value: 0, max: 0 },
              '1.1.4': { value: 0, max: 0 },
              '2.1.1': { value: 0, max: 0 },
              '2.2.2': { value: 0, max: 0 },
              '3.2.1': { value: 0, max: 0 },
            };

            const explanations: Partial<Record<IndicatorCode, string>> = {};
            let overallValue = 0;
            let overallMax: number | undefined = undefined;

            if (overallNode?.value) {
              if (typeof overallNode.value.sm_n === 'number')
                overallValue = overallNode.value.sm_n;
              if (typeof overallNode.value.sm_n_max === 'number')
                overallMax = overallNode.value.sm_n_max;

              for (const code of INDICATOR_CODES) {
                const v = Number(overallNode.value[code] ?? 0);
                const m = Number(overallNode.value[`${code}_max`] ?? 0);
                const exp = overallNode.value[`${code}_explanation`];
                indicators[code] = {
                  value: isNaN(v) ? 0 : v,
                  max: isNaN(m) ? 0 : m,
                };
                if (typeof exp === 'string' && exp.trim())
                  explanations[code] = exp.trim();
              }
            } else {
              console.warn(
                '[Analysis] SmartnessIndex node missing for survey:',
                usedSurvey || villageName
              );
            }

            allData[villageName] = {
              overall: { value: overallValue, max: overallMax },
              indicators,
              explanations,
              meta: {
                region: overallNode?.region,
                source: overallNode?.source,
                survey: overallNode?.surveyName ?? usedSurvey,
                timestamp: overallNode?.timestamp,
              },
            };
          } catch (err) {
            console.error(`Failed to fetch data for ${villageName}:`, err);
          }
        }

        setVillageData(allData);
      } catch (error) {
        console.error('Failed to fetch smartness data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (villagesForRegion.length > 0) {
      setActiveVillageIds(villagesForRegion.slice(0, MAX_SELECTED_VILLAGES));
      fetchSmartnessData();
    }
  }, [villagesForRegion.join(',')]);

  const currentIndex = REGIONS.findIndex(r => r.id === regionId);
  const region = REGIONS[currentIndex] ?? REGIONS[0];
  const prev = REGIONS[(currentIndex - 1 + REGIONS.length) % REGIONS.length];
  const next = REGIONS[(currentIndex + 1) % REGIONS.length];

  const handleVillageToggle = (villageName: string) => {
    setActiveVillageIds(prevIds => {
      const isSelected = prevIds.includes(villageName);

      if (isSelected) {
        return prevIds.filter(id => id !== villageName);
      }

      if (prevIds.length < MAX_SELECTED_VILLAGES) {
        return [...prevIds, villageName];
      }

      return prevIds;
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mx: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Stack spacing={1}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontWeight="700"
          >
            {t(region.country)}
          </Typography>

          <Stack direction="row" alignItems="center">
            <Typography variant="h4" fontWeight="800" minWidth="380px">
              {t(region.title)}
            </Typography>

            <Box ml={1}>
              <IconButton
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': { backgroundColor: 'transparent' },
                }}
                onClick={() => navigate(`/analysis/${prev.id}`)}
              >
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': { backgroundColor: 'transparent' },
                }}
                onClick={() => navigate(`/analysis/${next.id}`)}
              >
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </Box>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <LanguageSelector />
        </Stack>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        mt={2}
        flexWrap="wrap"
        sx={{ rowGap: 1 }}
      >
        {villagesForRegion.map(villageName => {
          const selected = activeVillageIds.includes(villageName);
          const parts = villageName.split('-');
          const displayName = parts.slice(3).join(' ') || villageName;

          const isLimitReached =
            !selected && activeVillageIds.length >= MAX_SELECTED_VILLAGES;

          return (
            <Tooltip
              key={villageName}
              title={
                isLimitReached
                  ? t('dashboard.charts.analysis.maxVillagesSelected', {
                      count: MAX_SELECTED_VILLAGES,
                    })
                  : ''
              }
              disableFocusListener={!isLimitReached}
              disableHoverListener={!isLimitReached}
              disableTouchListener={!isLimitReached}
            >
              <Chip
                label={displayName}
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                onClick={() => handleVillageToggle(villageName)}
                disabled={isLimitReached}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  cursor: isLimitReached ? 'not-allowed' : 'pointer',
                }}
              />
            </Tooltip>
          );
        })}
      </Stack>

      <Paper variant="outlined" sx={{ mt: 2, p: 2, pr: 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `280px repeat(${activeVillageIds.length}, minmax(220px, 1fr))`,
            rowGap: 2,
            columnGap: 2,
            alignItems: 'center',
          }}
        >
          <Box />
          {activeVillageIds.map(villageName => {
            const parts = villageName.split('-');
            const displayName = parts.slice(3).join(' ') || villageName;
            return (
              <Box key={`head-${villageName}`}>
                <Typography variant="subtitle1" fontWeight={800} align="center">
                  {displayName}
                </Typography>
              </Box>
            );
          })}

          <Box>
            <Typography variant="h6" fontWeight={800}>
              {t('dashboard.charts.analysis.smartnessIndex.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.charts.analysis.smartnessIndex.description')}{' '}
              {t(
                'Closer to 1.0 reflects stronger performance across indicators.'
              )}
            </Typography>
          </Box>
          {activeVillageIds.map(villageName => {
            const data = villageData[villageName];
            const val = data?.overall.value ?? 0;
            const max = data?.overall.max ?? 1;
            const normalized = max > 0 ? val / max : val;
            return (
              <Stack
                key={`overall-${villageName}`}
                alignItems="center"
                justifyContent="center"
                sx={{ py: 2 }}
              >
                <Donut value={normalized} label={t('Index')} />
              </Stack>
            );
          })}

          <Box
            sx={{
              gridColumn: `1 / span ${activeVillageIds.length + 1}`,
              py: 1,
            }}
          >
            <Divider />
          </Box>

          {INDICATOR_CODES.map(code => (
            <React.Fragment key={code}>
              <Box sx={{ pt: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" fontWeight={800}>
                    {`${t('dashboard.charts.analysis.indicator', { defaultValue: 'Indicator' })} ${code}: ${t(
                      `dashboard.charts.analysis.indicators.${trKey(code)}.name`,
                      { defaultValue: '' }
                    )}`}
                  </Typography>
                  <Tooltip
                    title={(
                      t(
                        `dashboard.charts.analysis.indicators.${trKey(code)}.description`
                      ) || ''
                    ).toString()}
                  >
                    <IconButton
                      size="small"
                      onClick={() =>
                        setExpanded(e => (e === code ? null : code))
                      }
                    >
                      <ExpandMoreIcon
                        fontSize="small"
                        sx={{
                          transform:
                            expanded === code ? 'rotate(180deg)' : 'none',
                          transition: '0.2s',
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {t(
                    `dashboard.charts.analysis.indicators.${trKey(code)}.description`
                  )}
                </Typography>
              </Box>

              {activeVillageIds.map(villageName => {
                const v =
                  villageData[villageName]?.indicators[code]?.value ?? 0;
                const m = villageData[villageName]?.indicators[code]?.max ?? 0;
                return (
                  <Box key={`${villageName}-${code}`} sx={{ py: 1 }}>
                    <MiniBar value={v} min={0} max={m || 1} />
                  </Box>
                );
              })}

              {expanded === code && (
                <Box
                  sx={{ gridColumn: `1 / span ${activeVillageIds.length + 1}` }}
                >
                  <Accordion
                    expanded
                    disableGutters
                    sx={{ boxShadow: 'none', bgcolor: 'transparent' }}
                  >
                    <AccordionSummary
                      expandIcon={<></>}
                      sx={{ display: 'none' }}
                    />
                    <AccordionDetails sx={{ px: 0 }}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: `280px repeat(${activeVillageIds.length}, minmax(220px, 1fr))`,
                          columnGap: 2,
                        }}
                      >
                        <Box />
                        {activeVillageIds.map(villageName => {
                          const parts = villageName.split('-');
                          const displayName =
                            parts.slice(3).join(' ') || villageName;
                          return (
                            <Paper
                              key={`desc-${villageName}-${code}`}
                              variant="outlined"
                              sx={{ p: 2, borderRadius: 2 }}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                gutterBottom
                              >
                                {displayName} — {t('Explanation')}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ whiteSpace: 'pre-wrap' }}
                              >
                                {villageData[villageName]?.explanations?.[
                                  code
                                ] ||
                                  (t(
                                    `dashboard.charts.analysis.indicators.${trKey(code)}.description`
                                  ) as string)}
                              </Typography>
                            </Paper>
                          );
                        })}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              )}
            </React.Fragment>
          ))}
        </Box>
      </Paper>

      <Box mt={3}>
        <Grid container spacing={2} justifyContent="flex-start">
          <PdfDownloads regionId={regionId} />
        </Grid>
      </Box>
    </Box>
  );
};

export default Analysis;
