import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';

import { useTranslation } from 'react-i18next';

interface IconGridStatsProps {
  title?: string;
  data: {
    label: string;
    value: number;
    icon: string;
    unit?: string;
  }[];
  region?: string;
  source?: string;
  survey?: string;
  timestamp?: string;
  regionName?: string;
}

const IconGridStats: React.FC<IconGridStatsProps> = ({
  title,
  data = [],
  region,
  source,
  survey,
  timestamp,
  regionName,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!data.length) return null;

  return (
    <Box sx={{ width: '100%' }}>
      {title && (
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          {title}
        </Typography>
      )}

      <Grid container spacing={2}>
        {data.map(({ label, value, icon, unit }, index) => (
          <Grid item xs={6} md={4} lg={4} xl={4} key={index}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 32,
                  color: theme.palette.text.primary,
                }}
              >
                {icon}
              </span>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  {t(label)}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.secondary.main }}
                >
                  {value.toLocaleString('sl-SI')}
                  {unit && (
                    <span style={{ fontSize: '0.8rem', marginLeft: 4 }}>
                      {unit}
                    </span>
                  )}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {source && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 2 }}>
          {source}, {regionName},{' '}
          {timestamp ? new Date(timestamp).toLocaleDateString('sl-SI') : 'N/A'}
        </Typography>
      )}
    </Box>
  );
};

export default IconGridStats;
