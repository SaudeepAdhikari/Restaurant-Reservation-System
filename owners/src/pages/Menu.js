import React, { useState } from 'react';
import MenuModal from '../components/MenuModal';
import Header from '../components/Header';
import '../styles/Menu.css';

const initialMenu = [
  { id: 1, name: 'Margherita Pizza', price: 12, category: 'Main', image: null },
  { id: 2, name: 'Tiramisu', price: 7, category: 'Dessert', image: null }
];

function Menu() {
  const [menu, setMenu] = useState(initialMenu);
  const [modal, setModal] = useState({ open: false, item: null });

  const handleAdd = () => setModal({ open: true, item: null });
  const handleEdit = item => setModal({ open: true, item });
  const handleDelete = id => setMenu(menu.filter(m => m.id !== id));
  const handleSave = item => {
    if (item.id) {
      setMenu(menu.map(m => (m.id === item.id ? item : m)));
    } else {
      setMenu([...menu, { ...item, id: Date.now() }]);
    }
    setModal({ open: false, item: null });
  };

  function handleProfile() {
    // placeholder - navigate to profile or open modal
    alert('Open owner profile (not implemented)');
  }

  return (
    <div className="menu-page">
      <Header title="Menu Items" onProfile={handleProfile} />
      <div style={{padding:'8px 16px'}}>
        <button className="btn-primary" onClick={handleAdd}>Add Item</button>
      </div>
      <div className="menu-grid">
        {menu.map(m => (
          <div className="menu-card" key={m.id}>
            <div className="menu-info">
              <h4>{m.name}</h4>
              <div>Category: {m.category}</div>
              <div>Price: ${m.price}</div>
            </div>
            <div className="menu-actions">
              <button className="btn-secondary" onClick={() => handleEdit(m)}>Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(m.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {modal.open && (
        <MenuModal
          item={modal.item}
          onClose={() => setModal({ open: false, item: null })}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default Menu;
