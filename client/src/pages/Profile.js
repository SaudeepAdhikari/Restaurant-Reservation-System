import React, { useEffect, useState } from 'react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/customers/me`, {
      credentials: 'include'
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(res.status + ' ' + text);
        }
        return res.json();
      })
      .then(data => { if (mounted) setProfile(data); })
      .catch(err => { console.error(err); if (mounted) setError(err.message || String(err)); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Your Profile</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {profile && (
        <div style={{ marginTop: 16 }}>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleString()}</p>
        </div>
      )}
      {!loading && !profile && !error && (
        <p>No profile data available.</p>
      )}
    </main>
  );
}
