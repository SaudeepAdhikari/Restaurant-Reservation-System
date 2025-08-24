import React, { useEffect, useState } from 'react';
import './ManageTables.css';
import { apiGet, apiPut } from './api';

function ManageTables({ tables = [], onEdit, onDelete, onAdd }) {
  const [fetchedTables, setFetchedTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If parent supplies tables, prefer them. Otherwise fetch from API.
    if (tables && tables.length) return;
    let mounted = true;
    setLoading(true);
    apiGet('/tables')
      .then(res => {
        if (!mounted) return;
        if (!Array.isArray(res)) {
          setFetchedTables([]);
          return;
        }
        // Normalize server shape to local shape
        const normalized = res.map(t => ({
          id: t._id,
          name: t.name,
          capacity: typeof t.capacity !== 'undefined' ? t.capacity : t.seats,
          status: t.status || 'available',
          restaurantId: t.restaurant ? String(t.restaurant) : undefined,
          _raw: t
        }));
        setFetchedTables(normalized);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [tables]);

  const displayed = (tables && tables.length) ? tables : fetchedTables;

  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [savingStatusId, setSavingStatusId] = useState(null);

  return (
    <div className="manage-tables-wrapper">
      <div className="manage-tables-header">
        <h2>Manage Tables</h2>
        <button className="add-table-btn" onClick={onAdd}>+ Add Table</button>
      </div>

      {loading ? (
        <div style={{ padding: '1rem', textAlign: 'center' }}>Loading tables…</div>
      ) : error ? (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#c00' }}>Failed to load tables.</div>
      ) : (
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
            {(!displayed || displayed.length === 0) ? (
              <tr><td colSpan="5" className="no-tables">No tables found.</td></tr>
            ) : (
              displayed.map(table => (
                <tr key={table._id || table.id || table.id}>
                  <td>{table._id || table.id}</td>
                  <td>{table.name || '-'}</td>
                  <td>{typeof table.capacity !== 'undefined' ? table.capacity : (table.seats || '-')}</td>
                  <td><span className={`table-status table-status--${(table.status || 'available')}`}>{table.status || 'Available'}</span></td>
                  <td>
                    <button className="edit-btn" onClick={() => onEdit && onEdit(table)}>Edit</button>
                    <button className="delete-btn" onClick={() => onDelete && onDelete(table)}>Delete</button>
                    {' '}
                    <span style={{ marginLeft: 8 }}>
                      {
                        (() => {
                          const tid = table._id || table.id;
                          const current = selectedStatuses[tid] ?? (table.status || 'available');
                          return (
                            <>
                              <select value={current} onChange={e => setSelectedStatuses(s => ({ ...s, [tid]: e.target.value }))}>
                                <option value="available">Available</option>
                                <option value="reserved">Reserved</option>
                                <option value="occupied">Occupied</option>
                              </select>
                              <button style={{ marginLeft: 8 }} disabled={savingStatusId === tid} onClick={async () => {
                                const tid2 = tid;
                                const newStatus = selectedStatuses[tid2] ?? (table.status || 'available');
                                if (newStatus === (table.status || 'available')) return; // nothing to do
                                setSavingStatusId(tid2);
                                try {
                                  const updated = await apiPut(`/tables/${tid2}`, { status: newStatus });
                                  if (tables && tables.length) {
                                    if (onEdit) onEdit({ ...table, status: updated.status });
                                  } else {
                                    setFetchedTables(ft => ft.map(t => (t.id === tid2 ? { ...t, status: updated.status } : t)));
                                  }
                                } catch (err) {
                                  alert('Failed to update status: ' + (err.message || ''));
                                } finally {
                                  setSavingStatusId(null);
                                }
                              }}>OK</button>
                            </>
                          );
                        })()
                      }
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageTables;
