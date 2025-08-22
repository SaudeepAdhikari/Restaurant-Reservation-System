import React, { useEffect, useState, useMemo } from 'react';
import './TablesSection.css';

function TablesSection({ tables, reservations, onReserve }) {
  // Find reserved table IDs for current time (for demo, just check if any reservation exists for the table)
  const now = new Date();
  const reservedTableIds = reservations.map(r => r.tableId);

  const totalTables = tables.length;
  const reservedTables = reservedTableIds.length;
  const availableTables = Math.max(0, totalTables - reservedTables);

  // Animated counter component
  const AnimatedCounter = ({ value, duration = 900 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = null;
      const from = 0;
      const to = Number(value) || 0;
      if (to === 0) {
        setCount(0);
        return;
      }
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const current = Math.floor(progress * (to - from) + from);
        setCount(current);
        if (progress < 1) requestAnimationFrame(step);
      };
      const raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, [value, duration]);
    return <div className="stat-number" aria-live="polite">{count}</div>;
  };

  return (
    <section className="tables-grid-section">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Available Tables</div>
          <AnimatedCounter value={availableTables} />
        </div>
        <div className="stat-card">
          <div className="stat-label">Reserved Tables</div>
          <AnimatedCounter value={reservedTables} />
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Tables</div>
          <AnimatedCounter value={totalTables} />
        </div>
      </div>

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
