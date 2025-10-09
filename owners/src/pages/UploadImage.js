import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Legacy page kept for compatibility. Redirects immediately to the new Upload Menu page.
export default function UploadImage() {
  const navigate = useNavigate();
  useEffect(() => {
    // short timeout so if someone lands here they get redirected; keeps history clean
    const id = setTimeout(() => navigate('/upload-menu', { replace: true }), 50);
    return () => clearTimeout(id);
  }, [navigate]);

  return (
    <div style={{maxWidth:780,margin:'24px auto',padding:24,textAlign:'center'}}>
      <h3>Redirecting to Upload Menu</h3>
      <p className="muted small">If you are not redirected automatically, <Link to="/upload-menu">click here</Link>.</p>
    </div>
  );
}
