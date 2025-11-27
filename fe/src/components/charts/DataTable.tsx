import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';

interface DataTableProps {
  title?: string;
  rows: any[];
  columns: GridColDef[];
  region?: string;
  source?: string;
  survey?: string;
  timestamp?: string;
  regionName?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  rows,
  region,
  survey,
  source,
  timestamp,
  regionName,
}) => {
  if (!rows || rows.length === 0) return null;

  const columns: GridColDef[] = Object.keys(rows[0])
    .filter(key => key !== 'id')
    .map(key => ({
      field: key,
      headerName: key.charAt(0).toUpperCase() + key.slice(1),
      flex: 1,
    }));

  const rowsWithId = rows.map((row, index) => ({ id: index, ...row }));

  return (
    <>
      {title && (
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          {title}
        </Typography>
      )}
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rowsWithId}
          columns={columns}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
        />
      </div>
      <Typography variant="caption" color="textSecondary">
        {source} ({survey}), {regionName},{' '}
        {timestamp ? new Date(timestamp).toLocaleDateString('sl-SI') : 'N/A'}
      </Typography>
    </>
  );
};

export default DataTable;
