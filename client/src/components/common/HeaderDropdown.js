import React from 'react';
import './HeaderDropdown.css';

export default function HeaderDropdown({ items = [], visible = false, small = false }) {
  if (!visible) return null;

  const isActionList = items.length > 0 && typeof items[0] === 'object' && items[0].action;

  return (
    <div className={`hdr-dropdown ${small ? 'small' : ''}`} role="menu">
      <ul>
        {items.map((it, idx) => {
          if (isActionList) {
            return (
              <li key={idx} onClick={() => it.action && it.action()} className="hdr-item">
                {it.label}
              </li>
            );
          }
          return (
            <li key={idx} className="hdr-item">
              {it}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
