import {
  Container,
  Grid,
  Box,
  Typography,
  Stack,
  IconButton,
  useTheme,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import mapSrc from '../assets/images/map1.svg';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import LanguageSelector from '@components/common/LanguageSelector';

interface Region {
  id: string;
  name: string;
  xPct: number;
  yPct: number;
  path: string;
  labelPosition?: 'above' | 'below';
  xOffsetPct?: number;
}

const regions: Region[] = [
  {
    id: 'smarje-padna',
    name: 'dashboard.pilot.smarje-padna.title',
    xPct: 46,
    yPct: 75,
    path: '/dashboard/smarje-padna',
    xOffsetPct: 37,
  },
  {
    id: 'northern-ostrobothnia',
    name: 'dashboard.pilot.northern-ostrobothnia.title',
    xPct: 57,
    yPct: 22,
    path: '/dashboard/northern-ostrobothnia',
  },
  {
    id: 'devetaki-plateau',
    name: 'dashboard.pilot.devetaki-plateau.title',
    xPct: 67,
    yPct: 79,
    path: '/dashboard/devetaki-plateau',
    xOffsetPct: 15,
  },
  {
    id: 'valle-di-sole',
    name: 'dashboard.pilot.valle-di-sole.title',
    xPct: 41,
    yPct: 73,
    path: '/dashboard/valle-di-sole',
    xOffsetPct: -35,
  },
  {
    id: 'east-herzegovina',
    name: 'dashboard.pilot.east-herzegovina.title',
    xPct: 54,
    yPct: 86,
    path: '/dashboard/east-herzegovina',
    xOffsetPct: 30,
    labelPosition: 'below',
  },
  {
    id: 'tramuntana-soller',
    name: 'dashboard.pilot.tramuntana-soller.title',
    xPct: 25,
    yPct: 92,
    path: '/dashboard/tramuntana-soller',
  },
];

const Home: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Box sx={{ mt: 2, mx: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          sx={{ width: '100%' }}
        >
          <LanguageSelector />
        </Stack>
      </Box>
      <Container maxWidth="xl" sx={{ py: 12, height: '80vh' }}>
        <Grid
          container
          rowSpacing={2}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          sx={{ height: '100%' }}
          alignItems="center"
        >
          <Grid
            item
            xs={12}
            lg={7}
            sx={{
              textAlign: 'left',
              px: { xs: 2, sm: 4, md: 6, lg: 8 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h1" sx={{ pb: 2 }} fontWeight="800">
              {t('homepage.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('homepage.description')}
            </Typography>
          </Grid>

          <Grid
            item
            xs={12}
            lg={5}
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box position="relative" width="100%" height="100%">
              <Box
                component="img"
                src={mapSrc}
                alt="EU regions map"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />

              {regions.map(r => {
                const isBelow = r.labelPosition === 'below';

                return (
                  <Box
                    key={r.id}
                    component={Link}
                    to={r.path}
                    sx={{
                      position: 'absolute',
                      top: `${r.yPct}%`,
                      left: `${r.xPct}%`,
                      transform: 'translate(-50%, -100%)',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      color: theme.palette.primary.main,
                      '&:hover .pin-label': {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                      },
                      '&:hover .pin-icon': {
                        bgcolor: theme.palette.primary.main,
                      },
                      '&:hover .pin-icon-svg': {
                        color: '#fff',
                      },
                    }}
                  >
                    {!isBelow && (
                      <Box
                        sx={{ transform: `translateX(${r.xOffsetPct ?? 0}%)` }}
                      >
                        <Typography
                          variant="caption"
                          className="pin-label"
                          sx={{
                            mb: 0.2,
                            px: 1,
                            py: 0.5,
                            backgroundColor: 'white',
                            borderRadius: 1,
                            boxShadow: 1,
                            zIndex: 1,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {t(r.name)}
                        </Typography>
                      </Box>
                    )}

                    <IconButton
                      size="small"
                      aria-label={t(r.name)}
                      className="pin-icon"
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <LocationOnIcon
                        fontSize="inherit"
                        className="pin-icon-svg"
                      />
                    </IconButton>

                    {isBelow && (
                      <Box
                        sx={{ transform: `translateX(${r.xOffsetPct ?? 0}%)` }}
                      >
                        <Typography
                          variant="caption"
                          className="pin-label"
                          sx={{
                            mt: 0.2,
                            px: 1,
                            py: 0.5,
                            backgroundColor: 'white',
                            borderRadius: 1,
                            boxShadow: 1,
                            zIndex: 1,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {t(r.name)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Home;
