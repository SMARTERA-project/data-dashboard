import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import LanguageSelector from '@components/common/LanguageSelector';

const NotFound: React.FC = () => {
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

      <Box
        sx={{
          minHeight: '70vh',
          bgcolor: theme => theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 28,
              color: 'primary.main',
            }}
          >
            404
          </Box>

          <Typography variant="h3" fontWeight={800}>
            {t('notFound.title')}
          </Typography>

          <Typography variant="body1" color="text.secondary" maxWidth={420}>
            {t('notFound.description')}
          </Typography>

          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/"
            sx={{ mt: 1 }}
          >
            {t('notFound.backButton', { defaultValue: 'Go home' })}
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default NotFound;
