import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

interface LineGraphProps {
  width?: number;
  height?: number;
  title?: string;
  data: {
    labels: string[];
    values: number[];
  };
  unit?: string;
  region?: string;
  source?: string;
  survey?: string;
  timestamp?: string;
  regionName?: string;
}

const LineGraph: React.FC<LineGraphProps> = ({
  height = 300,
  title,
  data,
  unit,
  region,
  survey,
  source,
  timestamp,
  regionName,
}) => {
  const theme = useTheme();

  if (!data.labels.length || !data.values.length) return null;

  return (
    <>
      <Box sx={{ width: '100%' }}>
        {title && (
          <Typography variant="h6" sx={{ mt: 2, mb: 0 }}>
            {title}
          </Typography>
        )}
        <LineChart
          xAxis={[{ scaleType: 'point', data: data.labels }]}
          series={[
            {
              data: data.values,
              color: theme.palette.secondary.main,
            },
          ]}
          height={height}
          margin={{ left: 60 }}
        />
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          {source} ({survey}), {regionName},{' '}
          {timestamp ? new Date(timestamp).toLocaleDateString('sl-SI') : 'N/A'}
        </Typography>
      </Box>
    </>
  );
};

export default LineGraph;
