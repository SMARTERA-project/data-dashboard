import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

interface MiniNumberProps {
  height?: number;
  title?: string;
  data: {
    values: number[];
  };
  unit?: string;
  survey?: string;
  region?: string;
  source?: string;
  timestamp?: string;
  regionName?: string;
}

const MiniNumber: React.FC<MiniNumberProps> = ({
  height = 60,
  title,
  data,
  survey,
  unit,
  region,
  source,
  timestamp,
  regionName,
}) => {
  const values = data.values;
  const currentValue = values[values.length - 1];

  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {title && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'left',
            width: '100%',
            marginBottom: 0,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
            textAlign: 'left',
            color: theme.palette.secondary.main,
          }}
        >
          {currentValue}
        </Typography>
        {unit && (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              marginLeft: '4px',
            }}
          >
            {unit}
          </Typography>
        )}
      </Box>
      {(source || timestamp) && (
        <Box sx={{ mt: 0 }}>
          {source && timestamp && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
              {source} ({survey}), {regionName},{' '}
              {new Date(timestamp).toLocaleDateString('sl-SI')}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MiniNumber;
