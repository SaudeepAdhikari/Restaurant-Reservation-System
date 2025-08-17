import React from 'react';
import './ManageTables.css';

function ManageTables({ tables = [], onEdit, onDelete, onAdd }) {
  return (
    <div className="manage-tables-wrapper">
      <div className="manage-tables-header">
        <h2>Manage Tables</h2>
        <button className="add-table-btn" onClick={onAdd}>+ Add Table</button>
      </div>
      <table className="tables-admin-table">
        <thead>
          <tr>
            <th>Table ID</th>
            <th>Name</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tables.length === 0 ? (
            <tr><td colSpan="5" className="no-tables">No tables found.</td></tr>
          ) : (
            tables.map(table => (
              <tr key={table.id}>
                <td>{table.id}</td>
                <td>{table.name || '-'}</td>
                <td>{table.seats}</td>
                <td><span className={`table-status table-status--${table.status || 'available'}`}>{table.status || 'Available'}</span></td>
                <td>
                  <button className="edit-btn" onClick={() => onEdit(table)}>Edit</button>
                  <button className="delete-btn" onClick={() => onDelete(table)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManageTables;
