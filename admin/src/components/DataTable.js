import React, { useState } from 'react';
import '../styles/DataTable.css';

function DataTable({ columns, data, actions = [] }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const filtered = data.filter(row =>
    columns.some(col => String(row[col.key]).toLowerCase().includes(search.toLowerCase()))
  );
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);
  const pageCount = Math.ceil(filtered.length / pageSize);

  return (
    <div className="datatable-wrapper">
      <div className="datatable-controls">
        <input
          className="datatable-search"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <table className="datatable">
        <thead>
          <tr>
            {columns.map(col => <th key={col.key}>{col.label}</th>)}
            {actions.length > 0 && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paged.map(row => (
            <tr key={row.id}>
              {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
              {actions.length > 0 && (
                <td>
                  {actions.map((a,i) => (
                    <button key={i} className="datatable-action" onClick={() => a.onClick(row)}>{a.label}</button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="datatable-pagination">
        <button disabled={page===1} onClick={()=>setPage(p=>p-1)}>&lt;</button>
        <span>Page {page} of {pageCount}</span>
        <button disabled={page===pageCount} onClick={()=>setPage(p=>p+1)}>&gt;</button>
      </div>
    </div>
  );
}

export default DataTable;
