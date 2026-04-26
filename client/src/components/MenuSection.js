import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import '../styles/MenuSection.css';

function MenuSection({ menu }) {
  if (!menu || menu.length === 0) return null;

  return (
    <div className="premium-menu-section">
      <div className="menu-header-row">
        <h2 className="section-title">
          <UtensilsCrossed size={22} className="title-icon" />
          Signature Menu
        </h2>
        <span className="menu-count">{menu.length} Items</span>
      </div>

      <div className="premium-menu-grid">
        {menu.map((item, idx) => (
          <div className="premium-menu-item" key={idx}>
            <div className="menu-item-info">
              <span className="item-name">{item.name}</span>
              <p className="item-description">{item.description || 'Specially prepared with the finest ingredients.'}</p>
            </div>
            <div className="menu-item-price-box">
              <span className="price-tag">${item.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuSection;
