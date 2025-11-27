import React from 'react';
import {
  ResponsiveChartContainer,
  BarPlot,
  ChartsXAxis,
  ChartsYAxis,
  ChartsTooltip,
  ChartsLegend,
} from '@mui/x-charts';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { TransformedEntry } from '@/types/datapoint';

interface GroupedBarGraphProps {
  title?: string;
  data: TransformedEntry[];
  labelKey?: keyof TransformedEntry;
  groupKey?: keyof TransformedEntry;
  region?: string;
  source?: string;
  survey?: string;
  timestamp?: string;
  regionName?: string;
}

const GroupedBarGraph: React.FC<GroupedBarGraphProps> = ({
  title,
  data,
  labelKey = 'ageGroup',
  groupKey = 'gender',
  region,
  source,
  survey,
  timestamp,
  regionName,
}) => {
  const theme = useTheme();

  function wrapLabel(label: string, maxCharsPerLine = 12): string {
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

  const rawLabels = Array.from(new Set(data.map(d => String(d[labelKey]))));

  const wrappedLabels = rawLabels.map(l => wrapLabel(l, 12));

  const maxLines = wrappedLabels
    .map(l => (l.match(/\n/g) || []).length + 1)
    .reduce((mx, cur) => Math.max(mx, cur), 1);

  const lineHeightPx = 14;
  const bottomMargin = maxLines * lineHeightPx + 8;

  const groups = Array.from(new Set(data.map(d => String(d[groupKey]))));
  const series = groups.map((group, idx) => ({
    type: 'bar' as const,
    data: rawLabels.map(label => {
      const match = data.find(
        d => String(d[labelKey]) === label && String(d[groupKey]) === group
      );
      return match?.value ?? 0;
    }),
    label: group,
    color:
      idx === 0
        ? theme.palette.primary.main
        : idx === 1
          ? theme.palette.secondary.main
          : theme.palette.warning.main,
  }));

  if (!wrappedLabels.length || !series.length) return null;

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 360,
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
          sx={{ flex: 1, minHeight: 0 }}
          margin={{
            top: 50,
            right: 20,
            bottom: bottomMargin,
            left: 60,
          }}
          xAxis={[
            {
              scaleType: 'band',
              data: wrappedLabels,
            },
          ]}
          yAxis={[
            {
              valueFormatter: v =>
                typeof v === 'number' ? v.toLocaleString('sl-SI') : String(v),
            },
          ]}
          series={series}
        >
          <BarPlot />
          <ChartsXAxis
            labelStyle={{
              whiteSpace: 'pre',
              textAnchor: 'middle',
              fontSize: 12,
              fill: theme.palette.text.primary,
            }}
          />
          <ChartsYAxis />
          <ChartsTooltip />
          <ChartsLegend
            direction="row"
            position={{ vertical: 'top', horizontal: 'middle' }}
          />
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

export default GroupedBarGraph;
