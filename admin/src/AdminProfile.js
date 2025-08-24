import React, { useEffect, useState } from 'react';
import { apiGet, apiPut, apiPost } from './api';
import './AdminProfile.css';

function AdminProfile({ authUser, onMenuAdded, onTableAdded }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [newRest, setNewRest] = useState({ name: '', location: '', description: '', openingHours: '', contactInfo: '' });
  const [newMenu, setNewMenu] = useState({ restaurantId: '', name: '', price: '', category: '', description: '' });
  const [newTable, setNewTable] = useState({ restaurantId: '', name: '', capacity: '' });
  const [showCreateRestaurantModal, setShowCreateRestaurantModal] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);
  

  useEffect(() => {
    if (!authUser || !authUser.id) {
      // Not authenticated — redirect to login
      window.location.hash = '#login';
      return;
    }

    let mounted = true;
    setLoading(true);
    apiGet(`/user/${authUser.id}`)
      .then(data => {
        if (!mounted) return;
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err.message || 'Failed to load profile');
        setLoading(false);
      });

    return () => { mounted = false; };
  }, [authUser]);

  // load restaurants for this user
  useEffect(() => {
    let mounted = true;
    async function loadR() {
      try {
        const res = await apiGet('/restaurants');
        if (!mounted) return;
        setRestaurants(res);
      } catch (e) {
        // ignore
      }
    }
    loadR();
    return () => { mounted = false; };
  }, [authUser]);

  

  // keep form in sync when profile changes
  useEffect(() => {
    const initialName = profile ? (profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(' ')) : '';
  setForm({ name: initialName || '', email: profile?.email || '', phone: profile?.phone || '', currentPassword: '', newPassword: '', confirmPassword: '' });
  }, [profile]);

  if (loading) return <div style={{padding: '2rem'}}>Loading profile…</div>;
  if (error) return <div style={{padding: '2rem', color: 'var(--danger)'}}>Error: {error}</div>;
  if (!profile) return <div style={{padding: '2rem'}}>No profile available.</div>;

  // Friendly name handling
  const displayName = profile.name || ([profile.firstName, profile.lastName].filter(Boolean).join(' ') || (authUser && authUser.name) || 'Admin');

  return (
  <div className="admin-profile-page" style={{padding: '2rem'}}>
      {/* Toast */}
      {toast && (
        <div className={`profile-toast ${toast.type === 'error' ? 'error' : 'success'}`}>
          {toast.text}
        </div>
      )}
      <h2>Profile</h2>
  <div className="admin-profile-card" style={{maxWidth: 720, position: 'relative'}}>
        {!editing && (
          <div className="profile-actions-wrap">
            <button className="profile-btn" onClick={() => setEditing(true)}>Edit profile</button>
            <div className="profile-actions">
              <button className="profile-btn" onClick={() => setShowCreateRestaurantModal(true)}>Create restaurant</button>
              <button className="profile-btn" onClick={() => setShowAddMenuModal(true)}>Add menu item</button>
              <button className="profile-btn" onClick={() => setShowAddTableModal(true)}>Add table</button>
            </div>
          </div>
        )}
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <div className="admin-profile-avatar">{ (displayName || 'A').slice(0,2).toUpperCase() }</div>
          <div>
              
              
              <div style={{display:'grid', gap:8}}>
                {restaurants.map(r => <div key={r._id} style={{padding:8, border:'1px solid #eee'}}>{r.name} — {r.location}</div>)}
              </div>

              <hr style={{margin:'12px 0'}} />
              

              <hr style={{margin:'12px 0'}} />
              

              {/* Create Restaurant Modal */}
              {showCreateRestaurantModal && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}} onClick={() => setShowCreateRestaurantModal(false)}>
                  <div style={{background:'#fff', padding:20, borderRadius:8, minWidth:320}} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
                    <h3>Create restaurant</h3>
                    <div style={{display:'grid', gap:8}}>
                      <input placeholder="Name" value={newRest.name} onChange={e => setNewRest(r => ({ ...r, name: e.target.value }))} />
                      <input placeholder="Location" value={newRest.location} onChange={e => setNewRest(r => ({ ...r, location: e.target.value }))} />
                      <input placeholder="Description" value={newRest.description} onChange={e => setNewRest(r => ({ ...r, description: e.target.value }))} />
                      <input placeholder="Opening hours (e.g. Mon-Fri 9:00-21:00)" value={newRest.openingHours} onChange={e => setNewRest(r => ({ ...r, openingHours: e.target.value }))} />
                      <input placeholder="Contact info (phone/email)" value={newRest.contactInfo} onChange={e => setNewRest(r => ({ ...r, contactInfo: e.target.value }))} />
                      <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:8}}>
                        <button className="profile-btn" onClick={() => setShowCreateRestaurantModal(false)}>Cancel</button>
                        <button className="profile-btn" disabled={busy} onClick={async () => {
                          if (!newRest.name) return setToast({ type: 'error', text: 'Name required' });
                          setBusy(true);
                          try {
                            const payload = { name: newRest.name, location: newRest.location, description: newRest.description, openingHours: newRest.openingHours, contactInfo: newRest.contactInfo };
                            const created = await apiPost('/restaurants', payload);
                            setRestaurants(s => [created, ...s]);
                            setNewRest({ name: '', location: '', description: '', openingHours: '', contactInfo: '' });
                            setShowCreateRestaurantModal(false);
                            setToast({ type: 'success', text: 'Restaurant created' });
                          } catch (err) { setToast({ type: 'error', text: 'Failed to create restaurant' }); }
                          setBusy(false);
                        }}>Create</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Menu Modal */}
              {showAddMenuModal && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}} onClick={() => setShowAddMenuModal(false)}>
                  <div style={{background:'#fff', padding:20, borderRadius:8, minWidth:320}} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
                    <h3>Add menu item</h3>
                    <div style={{display:'grid', gap:8}}>
                      
                      <select value={newMenu.restaurantId} onChange={e => setNewMenu(m => ({ ...m, restaurantId: e.target.value }))}>
                        <option value="">Select restaurant</option>
                        {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                      </select>
                      <input placeholder="Dish name" value={newMenu.name} onChange={e => setNewMenu(m => ({ ...m, name: e.target.value }))} />
                      <input placeholder="Price" value={newMenu.price} onChange={e => setNewMenu(m => ({ ...m, price: e.target.value }))} />
                      <input placeholder="Category" value={newMenu.category} onChange={e => setNewMenu(m => ({ ...m, category: e.target.value }))} />
                      <textarea placeholder="Description" value={newMenu.description} onChange={e => setNewMenu(m => ({ ...m, description: e.target.value }))} rows={2} />
                      <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:8}}>
                        <button className="profile-btn" onClick={() => setShowAddMenuModal(false)}>Cancel</button>
                        <button className="profile-btn" disabled={busy} onClick={async () => {
                          if (!newMenu.restaurantId || !newMenu.name) return setToast({ type: 'error', text: 'Select restaurant and name' });
                          setBusy(true);
                          try {
                            const created = await apiPost('/menu', { restaurantId: newMenu.restaurantId, name: newMenu.name, price: parseFloat(newMenu.price) || 0, category: newMenu.category, description: newMenu.description });
                            setNewMenu({ restaurantId: '', name: '', price: '', category: '', description: '' });
                            setShowAddMenuModal(false);
                            setToast({ type: 'success', text: 'Menu item added' });
                            if (onMenuAdded) onMenuAdded(created);
                          } catch (err) { setToast({ type: 'error', text: 'Failed to add menu item' }); }
                          setBusy(false);
                        }}>Add menu</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Table Modal */}
              {showAddTableModal && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}} onClick={() => setShowAddTableModal(false)}>
                  <div style={{background:'#fff', padding:20, borderRadius:8, minWidth:320}} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
                    <h3>Add table</h3>
                    <div style={{display:'grid', gap:8}}>
                      
                      <select value={newTable.restaurantId} onChange={e => setNewTable(t => ({ ...t, restaurantId: e.target.value }))}>
                        <option value="">Select restaurant</option>
                        {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                      </select>
                      <input placeholder="Table name" value={newTable.name} onChange={e => setNewTable(t => ({ ...t, name: e.target.value }))} />
                      <input placeholder="Capacity" value={newTable.capacity} onChange={e => setNewTable(t => ({ ...t, capacity: e.target.value }))} />
                      <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:8}}>
                        <button className="profile-btn" onClick={() => setShowAddTableModal(false)}>Cancel</button>
                        <button className="profile-btn" disabled={busy} onClick={async () => {
                          if (!newTable.restaurantId || !newTable.name) return setToast({ type: 'error', text: 'Select restaurant and name' });
                          setBusy(true);
                          try {
                            const created = await apiPost('/tables', { restaurantId: newTable.restaurantId, name: newTable.name, capacity: parseInt(newTable.capacity, 10) || 1 });
                            setNewTable({ restaurantId: '', name: '', capacity: '' });
                            setShowAddTableModal(false);
                            setToast({ type: 'success', text: 'Table added' });
                            if (onTableAdded) onTableAdded(created);
                          } catch (err) { setToast({ type: 'error', text: 'Failed to add table' }); }
                          setBusy(false);
                        }}>Add table</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <hr style={{margin:'12px 0'}} />
            <div style={{fontSize: 18, fontWeight: 600}}>{displayName}</div>
            <div style={{color: 'var(--muted-text, #666)'}}>{profile.email || authUser.email}</div>
          </div>
        </div>

        <hr style={{margin: '1rem 0'}} />

        <div>
          {!editing ? (
            <dl style={{display: 'grid', gridTemplateColumns: '150px 1fr', rowGap: 8, columnGap: 12}}>
              <dt style={{fontWeight: 600}}>Full name</dt>
              <dd>{displayName}</dd>

              <dt style={{fontWeight: 600}}>Email</dt>
              <dd>{profile.email || '—'}</dd>

              <dt style={{fontWeight: 600}}>Phone</dt>
              <dd>{profile.phone || '—'}</dd>

              <dt style={{fontWeight: 600}}>Role</dt>
              <dd>{profile.isAdmin ? 'Administrator' : 'User'}</dd>

              <dt style={{fontWeight: 600}}>Member since</dt>
              <dd>{profile.createdAt ? new Date(profile.createdAt).toLocaleString() : '—'}</dd>
            </dl>
          ) : (
            <form onSubmit={async (e) => {
                e.preventDefault();
                // validate password fields if provided
                if (form.newPassword || form.confirmPassword) {
                  if (!form.currentPassword) { alert('Please provide your current password to change it'); return; }
                  if (form.newPassword.length < 8) { alert('Password must be at least 8 characters'); return; }
                  if (form.newPassword !== form.confirmPassword) { alert('New passwords do not match'); return; }
                }
                const payload = { name: form.name, email: form.email, phone: form.phone };
                if (form.newPassword) { payload.password = form.newPassword; payload.oldPassword = form.currentPassword; }
                try {
                  const updated = await apiPut(`/user/${authUser.id}`, payload);
                  setProfile(updated);
                  setEditing(false);
                  setForm(f => ({ ...f, newPassword: '', confirmPassword: '' }));
                  alert('Profile updated');
                } catch (err) {
                  alert('Failed to save: ' + (err.message || ''));
                }
              }}>
              <div style={{display: 'grid', gap: 8}}>
                <label>
                  Full name
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </label>
                <label>
                  Email
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </label>
                <label>
                  Phone
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </label>

                <hr />
                <div style={{fontWeight:600, marginTop:4}}>Change password (optional)</div>
                <label>
                  Current password
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <input name="current-password-field" autoComplete="new-password" spellCheck="false" type={showCurrentPassword ? 'text' : 'password'} value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} />
                    <button type="button" className="profile-btn" onClick={() => setShowCurrentPassword(s => !s)} aria-pressed={showCurrentPassword}>{showCurrentPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </label>
                <label>
                  New password
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <input name="new-password-field" autoComplete="new-password" spellCheck="false" type={showNewPassword ? 'text' : 'password'} value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} />
                    <button type="button" className="profile-btn" onClick={() => setShowNewPassword(s => !s)} aria-pressed={showNewPassword}>{showNewPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </label>
                <label>
                  Confirm new password
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <input name="confirm-password-field" autoComplete="new-password" spellCheck="false" type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                    <button type="button" className="profile-btn" onClick={() => setShowConfirmPassword(s => !s)} aria-pressed={showConfirmPassword}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </label>

                <div style={{display: 'flex', gap: 8}}>
                  <button type="submit" className="profile-btn">Save</button>
                  <button type="button" className="profile-btn" onClick={() => { setEditing(false); const initialName = profile ? (profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(' ')) : ''; setForm({ name: initialName || '', email: profile.email || '', phone: profile.phone || '', currentPassword: '', newPassword: '', confirmPassword: '' }); }}>Cancel</button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
