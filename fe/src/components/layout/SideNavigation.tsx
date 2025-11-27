import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import smarteraLogoSmall from '@/assets/images/smartera-logo.svg';

import { SidebarProps } from '@/types/navigation';

const SIDEBAR_WIDTH = 92;

const navItems = [
  {
    key: 'home',
    icon: <HomeRoundedIcon sx={{ color: 'text.sideNavigation' }} />,
    path: '/',
  },
  {
    key: 'dashboard',
    icon: <SpaceDashboardRoundedIcon sx={{ color: 'text.sideNavigation' }} />,
    path: '/dashboard',
  },
  {
    key: 'analysis',
    icon: <TimelineRoundedIcon sx={{ color: 'text.sideNavigation' }} />,
    path: '/analysis',
  },
];

const SideNavigation: React.FC<SidebarProps> = ({
  onNavItemClick,
  mobileOpen = false,
}) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const isSelected = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  const handleClick = (key: string) => {
    onNavItemClick?.(key);
  };

  const content = (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        pt: 10,
      }}
    >
      <Box
        component="img"
        src={smarteraLogoSmall}
        alt="Smartera Logo"
        height={40}
        sx={{
          mb: 3,
          display: { xs: 'none', md: 'block' },
        }}
      />

      <List disablePadding>
        {navItems.map(item => (
          <ListItemButton
            key={item.key}
            onClick={() => handleClick(item.key)}
            sx={{
              flexDirection: 'column',
              justifyContent: 'center',
              my: 1,
              '&:hover': { backgroundColor: 'transparent' },
              '& .MuiSvgIcon-root': {
                color: isSelected(item.path)
                  ? 'text.menuItemSelected'
                  : 'text.sideNavigation',
                transition: 'color 300ms ease-in-out',
              },
              '&:hover .MuiSvgIcon-root': { color: 'text.menuItemSelected' },
              '& .MuiTypography-root': {
                color: isSelected(item.path)
                  ? 'text.menuItemSelected'
                  : 'text.sideNavigation',
                transition: 'color 300ms ease-in-out',
              },
              '&:hover .MuiTypography-root': { color: 'text.menuItemSelected' },
            }}
          >
            <ListItemIcon
              sx={{
                py: 0.7,
                borderRadius: 4,
                backgroundColor: isSelected(item.path)
                  ? 'background.menuItemSelected'
                  : 'transparent',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={t(`nav.${item.key}`)}
              sx={{
                '& .MuiListItemText-primary, & .MuiTypography-root': {
                  fontSize: '0.6875rem',
                  textAlign: 'center',
                  fontWeight: isSelected(item.path) ? '700' : '500',
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <IconButton
        onClick={() => handleClick('help')}
        sx={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          '& .MuiSvgIcon-root': {
            color: pathname.startsWith('/help')
              ? 'text.menuItemSelected'
              : 'text.sideNavigation',
            transition: 'color 300ms ease-in-out',
          },
          '&:hover .MuiSvgIcon-root': { color: 'text.menuItemSelected' },
        }}
      >
        <HelpOutlineOutlinedIcon />
      </IconButton>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            bgcolor: 'background.sideNavigation',
            color: 'text.sideNavigation',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            overflow: 'hidden',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: theme => theme.zIndex.drawer + 2,
          },
        }}
        open
      >
        {content}
      </Drawer>

      {mobileOpen && (
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,

            width: SIDEBAR_WIDTH,
            bgcolor: 'background.sideNavigation',
            color: 'text.sideNavigation',
            zIndex: theme => theme.zIndex.drawer + 1,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            pt: 10,
            overflow: 'hidden',
          }}
        >
          {content}
        </Box>
      )}
    </>
  );
};

export default SideNavigation;
