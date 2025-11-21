import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/auth';
import '../styles/Menu.css';



function MenuList() {
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState('');
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  // Derived categories from items
  const categories = ['All', ...new Set(items.map(i => i.category || 'Mains'))];

  useEffect(() => {
    authFetch('/api/owner/restaurants')
      .then(rests => {
        setRestaurants(rests);
        if (rests.length) {
          setSelected(rests[0]._id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selected) {
      setItems([]);
      return;
    }

    setLoading(true);
    authFetch(`/api/owner/menu/restaurant/${selected}`)
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selected]);

  useEffect(() => {
    let result = items;

    // Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(lower) || i.description?.toLowerCase().includes(lower));
    }

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter(i => (i.category || 'Mains') === activeCategory);
    }

    setFilteredItems(result);
  }, [items, searchTerm, activeCategory]);

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await authFetch(`/api/owner/menu/${id}`, { method: 'DELETE' });
      setItems(s => s.filter(x => x._id !== id));
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  }

  if (loading && restaurants.length === 0) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="menu-page">
      <div className="page-header-actions">
        <div>
          <h1 className="page-title">Menu Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Curate your restaurant's culinary offerings</p>
        </div>
        <button
          className="btn-base btn-primary"
          onClick={() => navigate('/menu/new')}
          disabled={!selected}
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
        >
          + Add Item
        </button>
      </div>

      {restaurants.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
          <h3>No Restaurants Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You need to create a restaurant before adding a menu.</p>
          <button className="btn-base btn-primary" onClick={() => navigate('/restaurant/new')}>Create Restaurant</button>
        </div>
      ) : (
        <>
          <div className="menu-controls-wrapper">
            <div className="menu-controls-top">
              <div className="restaurant-selector-group">
                <label className="selector-label">Restaurant:</label>
                <select
                  className="premium-select"
                  value={selected}
                  onChange={e => setSelected(e.target.value)}
                >
                  {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {items.length > 0 && (
              <div className="category-filters">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredItems.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 0', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                {items.length === 0 ? "No menu items found for this restaurant." : "No items match your search."}
              </p>
              {items.length === 0 && (
                <button
                  className="btn-base btn-secondary"
                  style={{ marginTop: '1.5rem' }}
                  onClick={() => navigate('/menu/new')}
                >
                  Add First Item
                </button>
              )}
            </div>
          ) : (
            <div className="menu-grid">
              {filteredItems.map(i => (
                <div key={i._id} className="menu-card">
                  <div className="menu-image-container">
                    {i.image ? (
                      <img src={i.image} alt={i.name} className="menu-image" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                        No Image
                      </div>
                    )}
                    <div className="menu-overlay-actions">
                      <button className="overlay-btn" title="Edit" onClick={() => alert('Edit feature coming soon')}>✏️</button>
                      <button className="overlay-btn danger" title="Delete" onClick={() => handleDelete(i._id)}>🗑️</button>
                    </div>
                  </div>
                  <div className="menu-info">
                    <div className="menu-header">
                      <h3 className="menu-name">{i.name}</h3>
                      <span className="menu-price-tag">${i.price}</span>
                    </div>
                    <p className="menu-description">{i.description || 'No description available.'}</p>
                    <div className="menu-tags">
                      <span className="menu-tag">{i.category || 'Mains'}</span>
                      {i.isVegetarian && <span className="menu-tag" style={{ color: 'green', borderColor: 'green' }}>Veg</span>}
                      {i.isSpicy && <span className="menu-tag" style={{ color: 'red', borderColor: 'red' }}>Spicy</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


export default MenuList;

