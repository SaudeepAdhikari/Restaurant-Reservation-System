import React, { useEffect, useState } from 'react';
import { authFetch, apiPost } from '../utils/auth';
import '../styles/Offers.css';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false); // Add state to control form visibility
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
      // Use fetch directly so authFetch's JSON enforcement doesn't interfere
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
      // Debug log to verify form data
      console.log('Submitting offer data:', form);
      
      // Make sure numeric fields are properly converted
      const processedForm = {
        ...form,
        discountPercent: form.discountPercent ? Number(form.discountPercent) : undefined
      };
      
      const created = await authFetch('/api/owner/offers', { 
        method: 'POST', 
        body: JSON.stringify(processedForm)
      });
      
      console.log('Offer created:', created);
      setOffers(o => [created, ...o]);
      setForm({ restaurantId: '', title: '', description: '', image: '', startDate: '', endDate: '', promoCode: '', discountPercent: '' });
      setShowForm(false); // Hide the form after successful submission
    } catch (err) { 
      console.error('Error creating offer:', err);
      setErr(err.message || 'Failed to create offer'); 
    }
  }

  return (
    <div className="offers-page">
      <div className="offers-header">
        <h2>Offers</h2>
        <button 
          className="create-offer-btn" 
          onClick={() => setShowForm(prev => !prev)}
        >
          {showForm ? "Cancel" : "+ Create Offer"}
        </button>
      </div>
      <div className="offers-content">
        <div className={`offers-form-card ${showForm ? 'active' : ''}`}>
          <h3>Create Offer</h3>
          {err && <div className="error">{err}</div>}
          <form onSubmit={onSubmit} className="offers-form">
            <label>Restaurant</label>
            <select name="restaurantId" value={form.restaurantId} onChange={onChange} required>
              <option value="">Choose a restaurant</option>
              {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
            <label>Title</label>
            <input name="title" value={form.title} onChange={onChange} required />
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={onChange} />
            <label>Image</label>
            <input type="file" accept="image/*" onChange={onFile} />
            {uploading && <div className="muted">Uploading...</div>}
            {form.image && <div className="muted">Image set: {form.image}</div>}
            <label>Promo Code (optional)</label>
            <input name="promoCode" value={form.promoCode} onChange={onChange} placeholder="e.g. SAVE10" />
            <label>Discount Percent (0-100)</label>
            <input name="discountPercent" type="number" min="0" max="100" value={form.discountPercent} onChange={onChange} placeholder="10" />
            <label>Start Date</label>
            <input type="date" name="startDate" value={form.startDate} onChange={onChange} />
            <label>End Date</label>
            <input type="date" name="endDate" value={form.endDate} onChange={onChange} />
            <div className="actions">
              <button className="btn btn-primary" type="submit">Create Offer</button>
            </div>
          </form>
        </div>
        <div className="offers-list-card">
          <h3>Your Offers</h3>
          {loading && <div className="loading-indicator">Loading...</div>}
          {!loading && offers.length === 0 && <div className="empty-state">No offers yet.</div>}
          <div className="offers-list">
            {offers.map(o => (
              <div className="offer-item" key={o._id}>
                <div className="offer-main">
                  <div className="offer-title">{o.title}</div>
                  <div className="offer-desc">{o.description}</div>
                </div>
                <div className="offer-meta">{o.restaurantId && o.restaurantId.name ? o.restaurantId.name : 'Restaurant'} • {o.startDate ? new Date(o.startDate).toLocaleDateString() : '—'} - {o.endDate ? new Date(o.endDate).toLocaleDateString() : '—'}</div>
                {(o.promoCode || o.discountPercent) && (
                  <div className={`offer-promo small ${o.discountPercent ? 'offer-promo-discount' : ''}`}>
                    {o.promoCode ? `Code: ${o.promoCode}` : ''} 
                    {o.discountPercent ? <> • <span>{o.discountPercent}% off</span></> : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
