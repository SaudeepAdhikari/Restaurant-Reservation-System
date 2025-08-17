import React from 'react';
import './TablesSection.css';

function TablesSection({ tables, reservations, onReserve }) {
  // Find reserved table IDs for current time (for demo, just check if any reservation exists for the table)
  const now = new Date();
  const reservedTableIds = reservations.map(r => r.tableId);

  return (
    <section className="tables-grid-section">
      <h2 className="tables-grid-title">Available Tables</h2>
      <div className="tables-grid">
        {tables.map(table => {
          const isReserved = reservedTableIds.includes(table.id);
          return (
            <div className={`table-card${isReserved ? ' table-card--reserved' : ''}`} key={table.id}>
              <div className="table-card-header">Table {table.id}</div>
              <div className="table-card-body">
                <div className="table-card-capacity">Seats: {table.seats}</div>
                <div className={`table-card-status${isReserved ? ' table-card-status--reserved' : ' table-card-status--available'}`}>{isReserved ? 'Reserved' : 'Available'}</div>
              </div>
              <button className="table-card-btn" onClick={() => onReserve(table)} disabled={isReserved}>
                Reserve
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TablesSection;
