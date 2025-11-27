import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

interface PieChartGraphProps {
  width?: number;
  height?: number;
  title?: string;
  data: {
    labels: string[];
    values: number[];
  };
  region?: string;
  source?: string;
  survey?: string;
  timestamp?: string;
  regionName?: string;
}

const PieChartGraph: React.FC<PieChartGraphProps> = ({
  height = 350,
  title,
  region,
  survey,
  source,
  timestamp,
  data,
  regionName,
}) => {
  const theme = useTheme();
  const paletteColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];
  const pieData = data.labels.map((label, index) => ({
    id: index,
    value: data.values[index],
    label,
    color: paletteColors[index % paletteColors.length],
  }));

  return (
    <>
      <Box sx={{ width: '100%' }}>
        {title && (
          <Typography variant="h6" sx={{ mt: 2, mb: 0 }}>
            {title}
          </Typography>
        )}
        <PieChart
          height={height}
          margin={{ bottom: 80, top: 20 }}
          series={[
            {
              data: pieData,
            },
          ]}
          slotProps={{
            legend: {
              direction: 'column',
              position: { vertical: 'bottom', horizontal: 'right' },
              labelStyle: {
                fontSize: '0.85rem',
              },
            },
          }}
        />

        {source && timestamp && (
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
            {source} ({survey}), {regionName},{' '}
            {new Date(timestamp).toLocaleDateString('sl-SI')}
          </Typography>
        )}
      </Box>
    </>
  );
};

export default PieChartGraph;
