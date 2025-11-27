import React from 'react';
import { Box, Typography, List, ListItem, Grid } from '@mui/material';

interface TopNListProps {
  title?: string;
  labels: string[];
  values: number[];
  region?: string;
  source?: string;
  survey?: string;
  timestamp?: string;
  regionName?: string;
}

const TopNList: React.FC<TopNListProps> = ({
  title,
  labels = [],
  values = [],
  region,
  source,
  survey,
  timestamp,
  regionName,
}) => {
  if (!labels.length || !values.length) return null;

  return (
    <Box
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}
    >
      {title && (
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          {title}
        </Typography>
      )}
      <List dense disablePadding sx={{ flex: 1 }}>
        {labels.map((label, index) => (
          <ListItem key={index} sx={{ py: 0.5 }}>
            <Grid container alignItems="center">
              <Grid item xs>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {label}
                </Typography>
              </Grid>
              <Grid item>
                <Typography
                  variant="body1"
                  align="right"
                  sx={{ fontSize: '1rem', whiteSpace: 'nowrap' }}
                >
                  {values[index]}
                </Typography>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
      {source && timestamp && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          {source} ({survey}), {regionName},{' '}
          {new Date(timestamp).toLocaleDateString('sl-SI')}
        </Typography>
      )}
    </Box>
  );
};

export default TopNList;
