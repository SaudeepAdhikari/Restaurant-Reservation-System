import React, { useEffect, useState } from 'react';
import '../../styles/Toast.css';

export default function Toast({ message, actions = [], onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (message) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [message]);
  if (!message) return null;
  return (
    <div className={`app-toast ${visible ? 'in' : 'out'}`}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{flex:1}}>{message}</div>
        <div style={{display:'flex',gap:8}}>
          {actions.map((a, i) => (
            <button key={i} className="btn-secondary small-btn" onClick={() => { try { if (a.onAction) a.onAction(); } finally { if (onClose) onClose(); } }}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
