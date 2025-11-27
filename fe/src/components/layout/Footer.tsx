import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import SmarteraLogo from '@/assets/images/smartera-full-logo.svg';
import EuLogo from '@/assets/images/eu-logo.jpg';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = React.memo(() => {
  const { t } = useTranslation();

  return (
    <Box component="footer" px={5} py={3}>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={10}
      >
        <a
          href="https://smartera-project.eu/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Box
            component="img"
            src={SmarteraLogo}
            alt="Smartera Logo"
            height={40}
          />
        </a>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Box component="img" src={EuLogo} alt="EU Logo" height={30} />
          <Typography variant="body2" lineHeight={1.3}>
            {t('footer.euLogoText1')}
            <br />
            {t('footer.euLogoText2')}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
});

export default Footer;
