import React, { useMemo } from 'react';
import {
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid, { GridProps } from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';
import { useSearch } from '@contexts/SearchFilterContext';
import { useTranslation } from 'react-i18next';

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[\u0300-\u036f]/g, '');

export type RegionLevelKey = 'nuts1' | 'nuts2' | 'nuts3' | 'area';

export const SearchHeader: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    regionLevels,
    selectedLevels,
    toggleLevel,
  } = useSearch();

  const { t } = useTranslation();

  const orderedLevels = useMemo(
    () =>
      (
        [
          ['nuts1', regionLevels.nuts1],
          ['nuts2', regionLevels.nuts2],
          ['nuts3', regionLevels.nuts3],
          ['area', regionLevels.area],
        ] as Array<[RegionLevelKey, string | undefined]>
      ).filter(([, label]) => Boolean(label)),
    [regionLevels]
  );

  const mergedLevelGroups = useMemo(() => {
    type Group = { label: string; keys: RegionLevelKey[] };
    const out: Group[] = [];
    for (const [key, label] of orderedLevels) {
      const text = String(label);
      const last = out[out.length - 1];
      if (last && last.label === text) {
        last.keys.push(key);
      } else {
        out.push({ label: text, keys: [key] });
      }
    }
    return out;
  }, [orderedLevels]);

  const activeLevelGroups = useMemo(
    () =>
      mergedLevelGroups.filter(g => g.keys.some(k => selectedLevels.has(k))),
    [mergedLevelGroups, selectedLevels]
  );

  const levelHints: Record<RegionLevelKey, string> = useMemo(
    () => ({
      nuts1:
        t('searchfilter.hint.country') + ' / ' + t('searchfilter.hint.nuts1'),
      nuts2: t('searchfilter.hint.nuts2'),
      nuts3: t('searchfilter.hint.nuts3'),
      area: t('searchfilter.hint.pilotRegion'),
    }),
    [t]
  );

  const resultTooltipProps = useMemo(
    () => ({
      placement: 'bottom' as const,
      slotProps: {
        tooltip: {
          sx: {
            bgcolor: (theme: any) => theme.palette.background.paper,
            color: (theme: any) => theme.palette.text.primary,
            border: '1px solid',
            borderColor: (theme: any) => theme.palette.divider,
            boxShadow: (theme: any) => theme.shadows[1],
            fontSize: '0.75rem',
            px: 1,
            py: 0.5,
            borderRadius: 1,
          },
        },
        popper: {
          modifiers: [{ name: 'offset', options: { offset: [0, -8] } }],
          sx: {
            zIndex: (theme: any) => theme.zIndex.modal + 1,
          },
        },
      },
    }),
    []
  );

  const trimmedQuery = (searchQuery ?? '').trim();
  const hasActive = !!trimmedQuery || activeLevelGroups.length > 0;

  const clearGroup = (group: { keys: RegionLevelKey[] }) => {
    group.keys.forEach(k => {
      if (selectedLevels.has(k)) toggleLevel(k);
    });
  };

  return (
    <Stack spacing={2} sx={{ width: '100%' }} mb={4}>
      <Stack
        direction="row"
        spacing={6}
        alignItems="flex-start"
        sx={{ width: '100%', flexWrap: 'nowrap' }}
      >
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('searchfilter.searchfordata')}
            variant="outlined"
            value={searchQuery ?? ''}
            onChange={e => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'white',
                  borderRadius: 5,
                  fontSize: '1rem',
                },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.3)',
                },
                '&:hover fieldset': {
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.3)',
                },
              },
            }}
          />
        </Stack>

        <Stack spacing={1}>
          <Stack
            direction="row"
            spacing={0.8}
            alignItems="center"
            sx={{ flexShrink: 0 }}
            pt={0.5}
          >
            <Typography variant="body1" color="text.secondary" pr={1}>
              {t('searchfilter.areaLevel')}:
            </Typography>

            {mergedLevelGroups.map((group, idx) => {
              const allSelected = group.keys.every(k => selectedLevels.has(k));
              const onClick = () => {
                const shouldSelectAll = !allSelected;
                group.keys.forEach(k => {
                  const isSelected = selectedLevels.has(k);
                  if (shouldSelectAll && !isSelected) toggleLevel(k);
                  if (!shouldSelectAll && isSelected) toggleLevel(k);
                });
              };

              return (
                <React.Fragment key={group.keys.join('+')}>
                  {idx > 0 && (
                    <Typography variant="body1" color="text.secondary">
                      {'>'}
                    </Typography>
                  )}
                  <Chip
                    label={group.label}
                    variant="outlined"
                    color={allSelected ? 'primary' : 'default'}
                    onClick={onClick}
                    sx={{
                      fontWeight: allSelected ? 'bold' : undefined,
                      backgroundColor: allSelected
                        ? 'rgba(28, 82, 64, 0.08)'
                        : undefined,
                    }}
                  />
                </React.Fragment>
              );
            })}
          </Stack>
        </Stack>
      </Stack>

      {hasActive && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          flexWrap="wrap"
          aria-live="polite"
        >
          <Typography variant="body2" color="rgba(0,0,0,0.8)">
            {t('searchfilter.showingdatafor')}:
          </Typography>

          {trimmedQuery && (
            <Chip
              size="small"
              variant="outlined"
              label={`${t('searchfilter.search')}: "${trimmedQuery}"`}
              onDelete={() => setSearchQuery('')}
              sx={{
                borderColor: 'rgba(0,0,0,0.3)',
                color: 'rgba(0,0,0,0.8)',
                '& .MuiChip-deleteIcon': {
                  color: '#1C5240CC',
                  '&:hover': { color: '#1C5240' },
                },
              }}
            />
          )}

          {activeLevelGroups.map(group => {
            const hint = group.keys.map(k => levelHints[k]).join(' / ');
            return (
              <Tooltip
                key={group.keys.join('+')}
                {...resultTooltipProps}
                title={hint}
              >
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${t('searchfilter.area')}: ${group.label}`}
                  onDelete={() => clearGroup(group)}
                  sx={{
                    borderColor: 'rgba(0,0,0,0.3)',
                    color: 'rgba(0,0,0,0.8)',
                    '& .MuiChip-deleteIcon': {
                      color: '#1C5240CC',
                      '&:hover': { color: '#1C5240' },
                    },
                  }}
                />
              </Tooltip>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};

export type SearchableGridItemProps = GridProps & {
  title: string;
  regionLevel: RegionLevelKey | RegionLevelKey[];
  children: React.ReactNode;
};

export const SearchableGridItem: React.FC<SearchableGridItemProps> = ({
  title,
  regionLevel,
  children,
  ...gridProps
}) => {
  const { t } = useTranslation();
  const { searchQuery, selectedLevels } = useSearch();

  const levels = Array.isArray(regionLevel) ? regionLevel : [regionLevel];

  const anyLevelSelected = selectedLevels.size > 0;
  const matchesRegion =
    anyLevelSelected && levels.some(l => selectedLevels.has(l));

  const displayTitle = t(title);
  const matchesQuery = useMemo(() => {
    const q = normalize((searchQuery ?? '').trim());
    if (!q) return true;
    const hay = normalize(`${displayTitle} ${title}`);
    return hay.includes(q);
  }, [searchQuery, displayTitle, title]);

  if (!matchesRegion || !matchesQuery) return null;

  return (
    <Grid item {...gridProps}>
      {children}
    </Grid>
  );
};
