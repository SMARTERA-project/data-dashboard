import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

interface MiniAreaGraphProps {
  height?: number;
  title?: string;
  data: {
    values: number[];
  };
  unit?: string;
  region?: string;
  source?: string;
  survey?: string;
  timestamp?: string;
  regionName?: string;
}

const MiniAreaGraph: React.FC<MiniAreaGraphProps> = ({
  height = 60,
  title,
  data,
  region,
  survey,
  source,
  timestamp,
  regionName,
}) => {
  const values = data.values;
  const trendUp = values.length > 1 && values[values.length - 1] > values[0];

  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          width: '100%',
        }}
      >
        {title && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: -0.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            {trendUp ? (
              <ArrowUpward
                fontSize="small"
                sx={{ color: theme.palette.primary.main }}
              />
            ) : (
              <ArrowDownward
                fontSize="small"
                sx={{ color: theme.palette.warning.main }}
              />
            )}
          </Box>
        )}

        <LineChart
          xAxis={[{ data: values.map((_, i) => i.toString()) }]}
          series={[
            {
              data: values,
              curve: 'natural',
              area: true,
              showMark: false,
              color: theme.palette.secondary.main,
            },
          ]}
          height={height}
          leftAxis={null}
          bottomAxis={null}
          margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
          sx={{
            width: '100%',
            '& .MuiLineElement-root': { display: 'none' },
            '& .MuiPointElement-root': { display: 'none' },
            '& .MuiXAxis-root, & .MuiYAxis-root': { display: 'none' },
          }}
        />
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          {source} ({survey}), {regionName},{' '}
          {new Date(timestamp).toLocaleDateString('sl-SI')}
        </Typography>
      </Box>
    </>
  );
};

export default MiniAreaGraph;
