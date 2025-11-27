import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

import SideNavigation from '@components/layout/SideNavigation';
import CollapsibleDrawer from '@components/layout/CollapsibleDrawer';

import { REGIONS } from '@data/regions';

import ScrollTopButton from '@components/common/ScrollTopButton';
import Footer from '@components/layout/Footer';

const DRAWER_WIDTH = 250;
const SIDEBAR_WIDTH = 92;

const MainLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAnalysisRoute = pathname.startsWith('/analysis');

  const [dashboardDrawerOpen, setDashboardDrawerOpen] = useState(false);
  const [analysisDrawerOpen, setAnalysisDrawerOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
  if (!isMobile) {
    document.body.style.overflow = '';
    document.body.style.position = '';
    return;
  }

  const mobileMenuOpen =
    mobileSidebarOpen || dashboardDrawerOpen || analysisDrawerOpen;

  if (mobileMenuOpen) {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
  } else {
    document.body.style.overflow = '';
    document.body.style.position = '';
  }
}, [isMobile, mobileSidebarOpen, dashboardDrawerOpen, analysisDrawerOpen]);


  useEffect(() => {
    if (!isDashboardRoute) setDashboardDrawerOpen(false);
  }, [isDashboardRoute]);

  useEffect(() => {
    if (!isAnalysisRoute) setAnalysisDrawerOpen(false);
  }, [isAnalysisRoute]);

  

  const handleNavItemClick = (key: string) => {
    if (key === 'dashboard') {
      if (!isDashboardRoute) {
        setDashboardDrawerOpen(true);
        navigate(`/dashboard/${REGIONS[0].id}`);
      } else {
        setDashboardDrawerOpen(o => !o);
      }
    } else if (key === 'analysis') {
      if (!isAnalysisRoute) {
        setAnalysisDrawerOpen(true);
        navigate(`/analysis/${REGIONS[0].id}`);
      } else {
        setAnalysisDrawerOpen(o => !o);
      }
    } else if (key === 'home') {
      navigate('/');
    } else if (key === 'help') {
      navigate('/help');
    }
  };

  const handleMobileSidebarToggle = () => {
    setMobileSidebarOpen(open => !open);
  };

  const selectedRegionId = pathname.split('/')[2];

  return (
    <Box display="flex" sx={{ minHeight: '100vh', position: 'relative' }}>
      <SideNavigation
        onNavItemClick={handleNavItemClick}
        mobileOpen={mobileSidebarOpen}
      />

      {isDashboardRoute && (
        <Box
          sx={{
            display: {
              xs: dashboardDrawerOpen ? 'block' : 'none',
              md: 'block',
            },
            position: { xs: 'fixed', md: 'relative' },
            top: { xs: 0, md: 'auto' },
            left: { xs: 0, md: 'auto' },
            height: '100vh',
            flexShrink: 0,
            width: {
              xs: DRAWER_WIDTH,
              md: dashboardDrawerOpen ? DRAWER_WIDTH : 0,
            },
            zIndex: {
              xs: theme.zIndex.drawer + 1,
              md: 'auto',
            },
          }}
        >
          <CollapsibleDrawer
            open={dashboardDrawerOpen}
            width={DRAWER_WIDTH}
            regions={REGIONS}
            selectedId={selectedRegionId}
            onRegionSelect={id => {
              navigate(`/dashboard/${id}`);
              if (isMobile) {
                setDashboardDrawerOpen(false);
                setMobileSidebarOpen(false);
              }
            }}
            onToggle={() => setDashboardDrawerOpen(o => !o)}
          />
        </Box>
      )}

      {isAnalysisRoute && (
        <Box
          sx={{
            display: { xs: analysisDrawerOpen ? 'block' : 'none', md: 'block' },
            position: { xs: 'fixed', md: 'relative' },
            top: { xs: 0, md: 'auto' },
            left: { xs: 0, md: 'auto' },
            height: '100vh',
            flexShrink: 0,
            width: {
              xs: DRAWER_WIDTH,
              md: analysisDrawerOpen ? DRAWER_WIDTH : 0,
            },
            zIndex: {
              xs: theme.zIndex.drawer + 1,
              md: 'auto',
            },
          }}
        >
          <CollapsibleDrawer
            open={analysisDrawerOpen}
            width={DRAWER_WIDTH}
            regions={REGIONS}
            selectedId={selectedRegionId}
            onRegionSelect={id => {
              navigate(`/analysis/${id}`);
              if (isMobile) {
                setAnalysisDrawerOpen(false);
                setMobileSidebarOpen(false);
              }
            }}
            onToggle={() => setAnalysisDrawerOpen(o => !o)}
          />
        </Box>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <IconButton
          aria-label="open navigation"
          onClick={handleMobileSidebarToggle}
          sx={{
            display: { xs: 'inline-flex', md: 'none' },
            position: 'fixed',
            top: 12,
            left: mobileSidebarOpen ? `${SIDEBAR_WIDTH / 2}px` : 12,
            transform: mobileSidebarOpen ? 'translateX(-50%)' : 'none',
            zIndex: theme.zIndex.drawer + 2,
            bgcolor: mobileSidebarOpen
              ? 'background.sideNavigation'
              : 'background.paper',
            boxShadow: 1,
            '&:hover': {
              bgcolor: mobileSidebarOpen
                ? 'background.sideNavigation'
                : 'background.paper',
            },
          }}
        >
          <MenuRoundedIcon
            sx={{
              color: mobileSidebarOpen ? '#fff' : 'text.primary',
              transition: 'color 0.1s ease',
            }}
          />
        </IconButton>

        <Box
          sx={{
            p: { xs: 2, md: 3 },
            pt: { xs: 7, md: 3 },
            flexGrow: 1,
          }}
        >
          <Outlet />
        </Box>

        <ScrollTopButton />
        <Footer />
      </Box>
    </Box>
  );
};

export default MainLayout;
