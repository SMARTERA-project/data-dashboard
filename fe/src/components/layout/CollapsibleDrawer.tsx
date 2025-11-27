import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
} from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

import { normalizeText } from '@/utils/string';
import { CollapsibleDrawerProps } from '@/types/navigation';

const SIDEBAR_WIDTH = 92;

const CollapsibleDrawer: React.FC<CollapsibleDrawerProps> = ({
  open,
  width,
  regions,
  selectedId,
  onToggle,
  onRegionSelect,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const queryNorm = normalizeText(searchQuery);

  const filteredRegions = regions.filter(reg => {
    const title = t(reg.title);
    const country = t(reg.country);
    const titleNorm = normalizeText(title);
    const countryNorm = normalizeText(country);
    return titleNorm.includes(queryNorm) || countryNorm.includes(queryNorm);
  });

  return (
  <Drawer
    variant="persistent"
    anchor="left"
    open={open}
    sx={{
      width: open ? width : 0,
      flexShrink: 0,
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      '& .MuiDrawer-paper': {
        width: open ? width : 0,
        position: 'fixed',
        top: 0,
        bottom: 0,         
        left: SIDEBAR_WIDTH,
        overflow: 'hidden',
        boxSizing: 'border-box',
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
      },
    }}
  >

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          pt: 6,
        }}
      >
        <Typography variant="h5" fontWeight="800">
          {t('drawer.title')}
        </Typography>
        <IconButton
          onClick={onToggle}
          sx={{
            '&:hover': { backgroundColor: 'transparent' },
            '&.Mui-focusVisible': { backgroundColor: 'transparent' },
          }}
        >
          <FirstPageIcon
            fontSize="medium"
            sx={{ color: theme.palette.text.secondary }}
          />
        </IconButton>
      </Box>

      <Box sx={{ px: 1.5, py: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('drawer.search')}
          variant="outlined"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 5,
                fontSize: '0.875rem',
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
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
        {filteredRegions.map(reg => {
          const title = t(reg.title);
          const country = t(reg.country);
          return (
            <ListItemButton
              key={reg.id}
              selected={reg.id === selectedId}
              onClick={() => onRegionSelect(reg.id)}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                py: 0.5,
                px: 2.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&.Mui-selected': {
                  backgroundColor: 'background.collapsibleMenuItemSelected',
                  borderRight: `4px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: 'background.collapsibleMenuItemSelected',
                  },
                },
                '&:hover': {
                  backgroundColor: 'background.collapsibleMenuItemSelected',
                },
              }}
            >
              <ListItemText
                primary={country}
                secondary={title}
                slotProps={{
                  primary: {
                    fontWeight: '300',
                    fontSize: '0.75rem',
                  },
                  secondary: {
                    fontWeight: '700',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
};

export default CollapsibleDrawer;
