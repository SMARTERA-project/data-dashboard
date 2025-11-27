import React from 'react';
import {
  ResponsiveChartContainer,
  BarPlot,
  ChartsXAxis,
  ChartsYAxis,
  ChartsTooltip,
} from '@mui/x-charts';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface BarGraphProps {
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
  barColorHex?: string;
  regionName?: string;
}

const BarGraph: React.FC<BarGraphProps> = ({
  title,
  data,
  unit,
  region,
  source,
  survey,
  timestamp,
  barColorHex,
  regionName,
}) => {
  const theme = useTheme();

  function wrapLabel(label: string, maxCharsPerLine = 20): string {
    const words = label.split(' ');
    const lines: string[] = [];
    let line = '';

    for (const word of words) {
      if ((line + word).length <= maxCharsPerLine) {
        line += word + ' ';
      } else {
        if (line.trim()) lines.push(line.trim());
        if (word.length > maxCharsPerLine && !word.includes('-')) {
          for (let i = 0; i < word.length; i += maxCharsPerLine) {
            lines.push(word.slice(i, i + maxCharsPerLine));
          }
          line = '';
        } else {
          line = word + ' ';
        }
      }
    }
    if (line.trim()) lines.push(line.trim());
    return lines.join('\n');
  }

  const wrappedLabels = data.labels.map(l => wrapLabel(l, 20));
  const maxLines = wrappedLabels
    .map(l => (l.match(/\n/g) || []).length + 1)
    .reduce((max, cur) => Math.max(max, cur), 1);
  const lineHeightPx = 14;
  const bottomMargin = maxLines * lineHeightPx + 8;

  const numericValues = data.values.map(v =>
    typeof v === 'string' ? parseFloat(v) : v
  );

  if (!wrappedLabels.length || !numericValues.length) return null;

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 350,
      }}
    >
      {title && (
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          {title}
        </Typography>
      )}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <ResponsiveChartContainer
          margin={{ top: 20, right: 20, bottom: bottomMargin, left: 70 }}
          xAxis={[
            {
              scaleType: 'band',
              data: wrappedLabels,
              tickLabelInterval: () => true,
            },
          ]}
          series={[
            {
              type: 'bar',
              data: numericValues,
              color: barColorHex || theme.palette.secondary.main,
            },
          ]}
        >
          <ChartsXAxis
            tickLabelStyle={{
              whiteSpace: 'pre',
              fontSize: 11,
              textAnchor: 'middle',
              fill: theme.palette.text.primary,
            }}
          />

          <BarPlot />

          <ChartsYAxis
            labelStyle={{
              fontSize: 12,
              fill: theme.palette.text.primary,
            }}
          />
          <ChartsTooltip />
        </ResponsiveChartContainer>
      </Box>

      {source && timestamp && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          {source} ({survey}), {regionName},{' '}
          {new Date(timestamp).toLocaleDateString('sl-SI')}
        </Typography>
      )}
    </Box>
  );
};

export default BarGraph;
