import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Stack,
  IconButton,
  useTheme,
} from '@mui/material';

import { useTranslation } from 'react-i18next';

import { useNavigate, useParams } from 'react-router-dom';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { REGIONS } from '@data/regions';
import { Region } from '@/types/region';

import GeneralTab from '@tabs/GeneralTab';
import EnablingFactorsTab from '@tabs/EnablingFactorsTab';
import MobilityTab from '@tabs/MobilityTab';
import GovernanceTab from '@tabs/GovernanceTab';
import EconomyTab from '@tabs/EconomyTab';
import EnvironmentTab from '@tabs/EnvironmentTab';
import ServicesTab from '@tabs/ServicesTab';

import LanguageSelector from '@components/common/LanguageSelector';

import { SearchProvider } from '@contexts/SearchFilterContext';
import { SearchHeader } from '@components/layout/SearchFilter';

const TABS: { key: string; Component: React.FC<{ region: Region }> }[] = [
  { key: 'general', Component: GeneralTab },
  { key: 'enablingFactors', Component: EnablingFactorsTab },
  { key: 'mobilityTransport', Component: MobilityTab },
  { key: 'governancePolicy', Component: GovernanceTab },
  { key: 'economy', Component: EconomyTab },
  { key: 'environment', Component: EnvironmentTab },
  { key: 'services', Component: ServicesTab },
];

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { regionId } = useParams<{ regionId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!regionId) {
      navigate(`/dashboard/${REGIONS[0].id}`, { replace: true });
    }
  }, [regionId, navigate]);

  const currentIndex = REGIONS.findIndex(r => r.id === regionId);
  const region = REGIONS[currentIndex] ?? REGIONS[0];

  const prev = REGIONS[(currentIndex - 1 + REGIONS.length) % REGIONS.length];
  const next = REGIONS[(currentIndex + 1) % REGIONS.length];

  const [tabIndex, setTabIndex] = React.useState(0);
  const ActiveTab = TABS[tabIndex].Component;
  const activeKey = TABS[tabIndex].key;

  const suggestions = (() => {
    const val = t(`dashboard.suggestions.${activeKey}`, {
      returnObjects: true,
      defaultValue: [],
    }) as unknown;
    return Array.isArray(val) ? (val as string[]) : [];
  })();

  const tx = (maybeKeyOrText?: string) => {
    if (!maybeKeyOrText) return '';
    const translated = t(maybeKeyOrText);
    return translated === maybeKeyOrText ? maybeKeyOrText : translated;
  };

  type RegionLevels = Partial<
    Record<'nuts1' | 'nuts2' | 'nuts3' | 'area', string>
  >;

  const buildLocalizedLevels = (): RegionLevels => {
    const nuts1Label = tx(region.pilot_nuts1_label) || tx(region.pilot_nuts1);
    const nuts2Label = tx(region.pilot_nuts2_label) || tx(region.pilot_nuts2);
    const nuts3Label = tx(region.pilot_nuts3_label) || tx(region.pilot_nuts3);
    const areaLabel = tx(region.title);

    const levels: RegionLevels = {};
    if (nuts1Label) levels.nuts1 = nuts1Label;
    if (nuts2Label) levels.nuts2 = nuts2Label;
    if (nuts3Label) levels.nuts3 = nuts3Label;
    if (areaLabel) levels.area = areaLabel;

    if (region.id === 'east-herzegovina') {
      const onlyNuts1AndArea: RegionLevels = {};
      if (levels.nuts1) onlyNuts1AndArea.nuts1 = levels.nuts1;
      if (levels.area) onlyNuts1AndArea.area = levels.area;
      return onlyNuts1AndArea;
    }

    if (
      region.id === 'valle-di-sole' ||
      region.id === 'tramuntana-soller' ||
      region.id === 'northern-ostrobothnia' ||
      region.id === 'devetaki-plateau'
    ) {
      const withoutNuts1: RegionLevels = {};
      if (levels.nuts2) withoutNuts1.nuts2 = levels.nuts2;
      if (levels.nuts3) withoutNuts1.nuts3 = levels.nuts3;
      if (levels.area) withoutNuts1.area = levels.area;
      return withoutNuts1;
    }

    return levels;
  };

  const localizedRegionLevels = useMemo(
    () => buildLocalizedLevels(),
    [region.id, i18n.language]
  );

  return (
    <Box sx={{ mt: 2, mx: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Stack spacing={1}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontWeight="700"
          >
            {tx(region.country)}
          </Typography>

          <Stack direction="row" alignItems="center">
            <Typography variant="h4" fontWeight="800" minWidth="380px">
              {tx(region.title)}
            </Typography>

            <Box ml={1}>
              <IconButton
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': { backgroundColor: 'transparent' },
                  '&.Mui-focusVisible': { backgroundColor: 'transparent' },
                }}
                onClick={() => navigate(`/dashboard/${prev.id}`)}
              >
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': { backgroundColor: 'transparent' },
                  '&.Mui-focusVisible': { backgroundColor: 'transparent' },
                }}
                onClick={() => navigate(`/dashboard/${next.id}`)}
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

      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          my: 3,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTabs-indicator': {
            height: 2,
            borderRadius: 4,
            bgcolor: 'primary',
          },
        }}
      >
        {TABS.map(({ key }, idx) => (
          <Tab
            key={key}
            label={t(`dashboard.tabs.${key}`)}
            sx={{
              px: 2.5,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: tabIndex === idx ? '700' : '400',
            }}
          />
        ))}
      </Tabs>

      <SearchProvider
        key={region.id}
        regionKey={region.id}
        tabKey={activeKey}
        regionLevels={localizedRegionLevels}
        suggestedSearches={suggestions}
      >
        <SearchHeader />
        <ActiveTab region={region} />
      </SearchProvider>
    </Box>
  );
};

export default Dashboard;
