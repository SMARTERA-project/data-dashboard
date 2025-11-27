import React, { useMemo } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Stack,
  Button,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import { useTranslation } from 'react-i18next';

type PdfItem = { label: string; url: string };
type PdfMap = Record<string, PdfItem[]>;

const PDF_BASE = 'https://smartera.feri.um.si/api/pdf/';

const PDF_MAP: PdfMap = {
  'valle-di-sole': [
    { label: 'Caldes', url: `${PDF_BASE}P1-Valle-di-Sole-Caldes.pdf` },
    { label: 'Cavizzana', url: `${PDF_BASE}P1-Valle-di-Sole-Cavizzana.pdf` },
    {
      label: 'Commezzadura',
      url: `${PDF_BASE}P1-Valle-di-Sole-Commezzadura.pdf`,
    },
    { label: 'Croviana', url: `${PDF_BASE}P1-Valle-di-Sole-Croviana.pdf` },
    {
      label: 'Dimaro-Folgarida',
      url: `${PDF_BASE}P1-Valle-di-Sole-Dimaro-Folgarida.pdf`,
    },
    { label: 'Male', url: `${PDF_BASE}P1-Valle-di-Sole-Male.pdf` },
    { label: 'Mezzana', url: `${PDF_BASE}P1-Valle-di-Sole-Mezzana.pdf` },
    { label: 'Ossana', url: `${PDF_BASE}P1-Valle-di-Sole-Ossana.pdf` },
    { label: 'Peio', url: `${PDF_BASE}P1-Valle-di-Sole-Peio.pdf` },
    { label: 'Pellizzano', url: `${PDF_BASE}P1-Valle-di-Sole-Pellizzano.pdf` },
    { label: 'Rabbi', url: `${PDF_BASE}P1-Valle-di-Sole-Rabbi.pdf` },
    { label: 'Terzolas', url: `${PDF_BASE}P1-Valle-di-Sole-Terzolas.pdf` },
    { label: 'Vermiglio', url: `${PDF_BASE}P1-Valle-di-Sole-Vermiglio.pdf` },
  ],
  'soller-tramuntana': [
    {
      label: 'Fornalutx Biniaraix',
      url: `${PDF_BASE}P2-Soller-Tramuntana-Fornalutx-Biniaraix.pdf`,
    },
    {
      label: 'Port of Soller',
      url: `${PDF_BASE}P2-Soller-Tramuntana-Port-of-Soller.pdf`,
    },
    { label: 'Soller', url: `${PDF_BASE}P2-Soller-Tramuntana-Soller.pdf` },
  ],
  'northern-ostrobothnia': [
    {
      label: 'Alavieska',
      url: `${PDF_BASE}P3-Northern-Ostrobothnia-Alavieska.pdf`,
    },
    {
      label: 'Kalajoki',
      url: `${PDF_BASE}P3-Northern-Ostrobothnia-Kalajoki.pdf`,
    },
    { label: 'Nivala', url: `${PDF_BASE}P3-Northern-Ostrobothnia-Nivala.pdf` },
  ],
  'east-herzegovina': [
    { label: 'Gacko', url: `${PDF_BASE}P4-East-Herzegovina-Gacko.pdf` },
    { label: 'Nevesinje', url: `${PDF_BASE}P4-East-Herzegovina-Nevesinje.pdf` },
  ],
  'smarje-padna': [
    { label: 'Padna', url: `${PDF_BASE}P5-Smarje-Padna-Padna.pdf` },
  ],
  'devetaki-plateau': [
    { label: 'Agatovo', url: `${PDF_BASE}P6-Devetaki-Plateau-Agatovo.pdf` },
    {
      label: 'Aleksandrovo',
      url: `${PDF_BASE}P6-Devetaki-Plateau-Aleksandrovo.pdf`,
    },
    { label: 'Brestovo', url: `${PDF_BASE}P6-Devetaki-Plateau-Brestovo.pdf` },
    {
      label: 'Gorsko-Slivovo',
      url: `${PDF_BASE}P6-Devetaki-Plateau-Gorsko-Slivovo.pdf`,
    },
    { label: 'Kakrina', url: `${PDF_BASE}P6-Devetaki-Plateau-Kakrina.pdf` },
    {
      label: 'Karpachevo',
      url: `${PDF_BASE}P6-Devetaki-Plateau-Karpachevo.pdf`,
    },
    { label: 'Kramolin', url: `${PDF_BASE}P6-Devetaki-Plateau-Kramolin.pdf` },
    { label: 'Krushuna', url: `${PDF_BASE}P6-Devetaki-Plateau-Krushuna.pdf` },
    { label: 'Tepava', url: `${PDF_BASE}P6-Devetaki-Plateau-Tepava.pdf` },
  ],
};

const PDF_ALIASES: Record<string, keyof PdfMap> = {
  'tramuntana-soller': 'soller-tramuntana',
  soller: 'soller-tramuntana',
  tramuntana: 'soller-tramuntana',
};

const normalizeId = (id?: string) =>
  (id || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const PdfDownloads: React.FC<{ regionId?: string }> = ({ regionId }) => {
  const { t } = useTranslation();

  const items = useMemo(() => {
    const norm = normalizeId(regionId);
    const key = PDF_ALIASES[norm] || norm;
    return PDF_MAP[key] ?? [];
  }, [regionId]);

  if (!items.length) return null;

  return (
    <Grid item xs={12} sm={12} lg={4} xl={4} sx={{ mt: 2 }}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
        <Stack spacing={1} sx={{ mb: 1 }}>
          <Typography variant="h6" fontWeight={800}>
            {t('Want to learn more?')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('Access the comprehensive PDF reports below.')}
          </Typography>
        </Stack>

        <List disablePadding>
          {items.map(({ label, url }, idx) => (
            <React.Fragment key={label}>
              <ListItem
                disableGutters
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 0.5,
                  px: 1,
                }}
              >
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    variant: 'subtitle1',
                    fontWeight: 700,
                  }}
                />
                <Tooltip title={t('Download PDF') as string}>
                  <Button
                    variant="outlined"
                    size="small"
                    href={url}
                    download
                    target="_blank"
                    rel="noopener"
                    startIcon={<PictureAsPdfRoundedIcon />}
                  >
                    {t('Open report')}
                  </Button>
                </Tooltip>
              </ListItem>
              {idx < items.length - 1 && <Divider sx={{ my: 0.5 }} />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Grid>
  );
};

export default PdfDownloads;
