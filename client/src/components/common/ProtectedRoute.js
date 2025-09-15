import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/customers/me`, { credentials: 'include' })
      .then(res => {
        if (!mounted) return;
        if (!res.ok) {
          setAuthed(false);
        } else {
          setAuthed(true);
        }
      })
      .catch(() => { if (mounted) setAuthed(false); })
      .finally(() => { if (mounted) setChecking(false); });

    return () => { mounted = false; };
  }, []);

  if (checking) return null; // or a spinner
  return authed ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
