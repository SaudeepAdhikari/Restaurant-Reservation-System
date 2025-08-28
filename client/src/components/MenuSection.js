import React from 'react';
import '../styles/MenuSection.css';

function MenuSection({ menu }) {
  return (
    <div className="menu-section">
      <h4>Menu</h4>
      <div className="menu-grid">
        {menu.map((item, idx) => (
          <div className="menu-item" key={idx}>
            <span>{item.name}</span>
            <span className="menu-price">{item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuSection;
