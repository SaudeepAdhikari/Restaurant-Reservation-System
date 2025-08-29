import React, { useState } from 'react';
import TableModal from '../components/TableModal';
import Header from '../components/Header';
import '../styles/Tables.css';

const initialTables = [
  { id: 1, name: 'Table 1', capacity: 4, available: true },
  { id: 2, name: 'Table 2', capacity: 2, available: false }
];

function Tables() {
  const [tables, setTables] = useState(initialTables);
  const [modal, setModal] = useState({ open: false, table: null });

  const handleAdd = () => setModal({ open: true, table: null });
  const handleEdit = table => setModal({ open: true, table });
  const handleDelete = id => setTables(tables.filter(t => t.id !== id));
  const handleSave = table => {
    if (table.id) {
      setTables(tables.map(t => (t.id === table.id ? table : t)));
    } else {
      setTables([...tables, { ...table, id: Date.now() }]);
    }
    setModal({ open: false, table: null });
  };

  function handleProfile() {
    alert('Open owner profile (not implemented)');
  }

  return (
    <div className="tables-page">
      <Header title="Tables" onProfile={handleProfile} />
      <div style={{padding:'8px 16px'}}>
        <button className="btn-primary" onClick={handleAdd}>Add Table</button>
      </div>
      <div className="tables-grid">
        {tables.map(t => (
          <div className="table-card" key={t.id}>
            <div className="table-info">
              <h4>{t.name}</h4>
              <div>Capacity: {t.capacity}</div>
              <div>Status: {t.available ? 'Available' : 'Unavailable'}</div>
            </div>
            <div className="table-actions">
              <button className="btn-secondary" onClick={() => handleEdit(t)}>Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(t.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {modal.open && (
        <TableModal
          table={modal.table}
          onClose={() => setModal({ open: false, table: null })}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default Tables;
