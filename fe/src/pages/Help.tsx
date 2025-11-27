import React, { useState } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Stack,
  Button,
  ButtonGroup,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import LanguageSelector from '@components/common/LanguageSelector';

import nuts2MapSrc from '../assets/images/nuts2-map.svg';
import nuts3MapSrc from '../assets/images/nuts3-map.svg';

type NutsLevel = 'nuts2' | 'nuts3';

const Help: React.FC = () => {
  const { t } = useTranslation();
  const [level, setLevel] = useState<NutsLevel>('nuts2');

  const currentMapSrc = level === 'nuts2' ? nuts2MapSrc : nuts3MapSrc;

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

      <Container maxWidth="xl" sx={{ py: 12 }}>
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
            lg={5}
            sx={{
              textAlign: 'left',
              px: { xs: 2, sm: 4, md: 1, lg: 1 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h3" sx={{ pb: 2 }} fontWeight="800">
              {t('help.title')}
            </Typography>

            <Typography variant="h6" sx={{ mb: 1 }} fontWeight="800">
              {t('help.sections.dataTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {t('help.sections.dataText')}
            </Typography>

            <Typography variant="h6" sx={{ mb: 1 }} fontWeight="700">
              {t('help.sections.mapTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t('help.sections.mapText')}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            lg={7}
            xl={7}
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 820,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <ButtonGroup
                variant="outlined"
                sx={{ mb: 2 }}
                aria-label={t('help.map.levelToggleAria') as string}
              >
                <Button
                  onClick={() => setLevel('nuts2')}
                  variant={level === 'nuts2' ? 'contained' : 'outlined'}
                >
                  {t('help.map.nuts2')}
                </Button>
                <Button
                  onClick={() => setLevel('nuts3')}
                  variant={level === 'nuts3' ? 'contained' : 'outlined'}
                >
                  {t('help.map.nuts3')}
                </Button>
              </ButtonGroup>

              <Box
                component="img"
                src={currentMapSrc}
                alt={t('help.map.alt', {
                  level: t(
                    level === 'nuts2' ? 'help.map.nuts2' : 'help.map.nuts3'
                  ),
                })}
                sx={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: 2,
                  display: 'block',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Help;
