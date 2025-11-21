import React, { useEffect, useState } from 'react';
import { authFetch } from '../utils/auth';
import '../styles/Offers.css';
import '../styles/Restaurants.css'; // Reuse form styles

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ restaurantId: '', title: '', description: '', image: '', startDate: '', endDate: '', promoCode: '', discountPercent: '' });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      authFetch('/api/owner/offers').catch(e => { setErr(e.message); return []; }),
      authFetch('/api/owner/restaurants').catch(() => [])
    ]).then(([offersData, rests]) => {
      if (!mounted) return;
      setOffers(offersData || []);
      setRestaurants(rests || []);
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function onFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('owner_token');
      const url = (process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/uploads/image';
      const res = await fetch(url, { method: 'POST', body: formData, headers: { Authorization: token ? `Bearer ${token}` : undefined } });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setForm(f => ({ ...f, image: data.path }));
    } catch (err) {
      setErr(err.message || String(err));
    } finally { setUploading(false); }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    try {
      const processedForm = {
        ...form,
        discountPercent: form.discountPercent ? Number(form.discountPercent) : undefined
      };

      const created = await authFetch('/api/owner/offers', {
        method: 'POST',
        body: JSON.stringify(processedForm)
      });

      setOffers(o => [created, ...o]);
      setForm({ restaurantId: '', title: '', description: '', image: '', startDate: '', endDate: '', promoCode: '', discountPercent: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Error creating offer:', err);
      setErr(err.message || 'Failed to create offer');
    }
  }

  return (
    <div className="offers-page">
      <div className="page-header-actions">
        <div>
          <h1 className="page-title">Special Offers</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Create promotions to attract more customers</p>
        </div>
        <button
          className="btn-base btn-primary"
          onClick={() => setShowForm(prev => !prev)}
        >
          {showForm ? "Cancel" : "+ Create Offer"}
        </button>
      </div>

      <div className="offers-content">
        <div className={`offers-form-card ${showForm ? 'active' : ''}`}>
          {err && <div className="error-banner">{err}</div>}
          <form onSubmit={onSubmit}>
            <div className="form-section">
              <h3 className="form-section-title">New Offer Details</h3>

              <div className="form-group">
                <label className="form-label">Restaurant</label>
                <select className="form-input" name="restaurantId" value={form.restaurantId} onChange={onChange} required>
                  <option value="">Choose a restaurant</option>
                  {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" name="title" value={form.title} onChange={onChange} required placeholder="e.g. Summer Sale" />
                </div>
                <div className="form-group">
                  <label className="form-label">Promo Code (Optional)</label>
                  <input className="form-input" name="promoCode" value={form.promoCode} onChange={onChange} placeholder="e.g. SAVE10" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" name="description" value={form.description} onChange={onChange} placeholder="Describe the offer..." />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Discount %</label>
                  <input className="form-input" name="discountPercent" type="number" min="0" max="100" value={form.discountPercent} onChange={onChange} placeholder="10" />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date" name="startDate" value={form.startDate} onChange={onChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-input" type="date" name="endDate" value={form.endDate} onChange={onChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image</label>
                <input type="file" accept="image/*" onChange={onFile} className="form-input" />
                {uploading && <div className="muted" style={{ marginTop: '0.5rem' }}>Uploading...</div>}
              </div>

              <div className="form-actions">
                <button className="btn-base btn-primary" type="submit">Publish Offer</button>
              </div>
            </div>
          </form>
        </div>

        <div className="offers-list-card">
          {loading && <div className="loading-container"><div className="loading-spinner"></div></div>}
          {!loading && offers.length === 0 && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏷️</div>
              <h3>No Active Offers</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Create an offer to boost your sales.</p>
            </div>
          )}
          <div className="offers-list">
            {offers.map(o => (
              <div className="offer-item" key={o._id}>
                <div className="offer-main">
                  <div className="offer-title">{o.title}</div>
                  <div className="offer-desc">{o.description}</div>
                </div>

                {(o.promoCode || o.discountPercent) && (
                  <div className={`offer-promo ${o.discountPercent ? 'offer-promo-discount' : ''}`}>
                    {o.promoCode && <span>Code: <strong>{o.promoCode}</strong></span>}
                    {o.promoCode && o.discountPercent && <span> • </span>}
                    {o.discountPercent && <span>{o.discountPercent}% OFF</span>}
                  </div>
                )}

                <div className="offer-meta">
                  {o.restaurantId && o.restaurantId.name ? o.restaurantId.name : 'Restaurant'} • {o.startDate ? new Date(o.startDate).toLocaleDateString() : '—'} - {o.endDate ? new Date(o.endDate).toLocaleDateString() : '—'}
                </div>

                <div className="offer-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button className="btn-base btn-sm btn-secondary" onClick={() => alert('Edit coming soon')}>Edit</button>
                  <button className="btn-base btn-sm btn-danger" onClick={() => alert('Delete coming soon')}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

