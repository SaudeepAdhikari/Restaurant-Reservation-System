import React, { useState } from 'react';
import '../styles/modules/FilterMenu.css';

export default function FilterMenu({ filters = {}, onChange = () => {} }) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(filters);

  const apply = () => { onChange(local); setOpen(false); };
  const reset = () => { const r = { rating: null, budget: null, openOnly: false }; setLocal(r); onChange(r); };

  return (
    <div className="filter-root">
      <button className="filterBtn" onClick={() => setOpen(s => !s)} aria-expanded={open} aria-haspopup="true">Filters ⚙️</button>
      {open && (
        <div className="filterMenu" role="menu">
          <div className="filter-row">
            <label>Min Rating</label>
            <select value={local.rating || ''} onChange={e => setLocal({...local, rating: e.target.value || null})}>
              <option value="">Any</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>
          <div className="filter-row">
            <label>Budget</label>
            <select value={local.budget || ''} onChange={e => setLocal({...local, budget: e.target.value || null})}>
              <option value="">Any</option>
              <option value="$">$</option>
              <option value="$$">$$</option>
              <option value="$$$">$$$</option>
            </select>
          </div>
          <div className="filter-row">
            <label>Open Now</label>
            <input type="checkbox" checked={!!local.openOnly} onChange={e => setLocal({...local, openOnly: e.target.checked})} />
          </div>
          <div className="filter-actions">
            <button onClick={apply} className="applyBtn">Apply</button>
            <button onClick={reset} className="resetBtn">Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}
