import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Select,
  MenuItem
} from '@mui/material';

const ExecutionHistory = ({ history }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');

  const filteredHistory = history.filter(entry => 
    entry.code.includes(filter) || 
    entry.output.includes(filter)
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
      <TextField
        label="Filter"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ m: 2 }}
      />
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>Language</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Output</TableCell>
            <TableCell>Execution Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Table content */}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={filteredHistory.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </Paper>
  );
};

export default ExecutionHistory; 