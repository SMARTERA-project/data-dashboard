import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

type DonutProps = {
  value: number;
  label?: string;
  size?: number;
  thickness?: number;
  color?: string;
};

const Donut: React.FC<DonutProps> = ({
  value,
  label,
  size = 140,
  thickness = 5,
  color = '#7EB5AF',
}) => {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress
        variant="determinate"
        value={pct}
        size={size}
        thickness={thickness}
        sx={{ color }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          {value.toFixed(2)}
        </Typography>
        {label && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ lineHeight: 1 }}
          >
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Donut;
