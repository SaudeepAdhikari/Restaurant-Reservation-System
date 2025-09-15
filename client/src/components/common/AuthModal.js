import React, { useState } from 'react';
import Login from '../../pages/Login';
import Signup from '../../pages/Signup';
import '../../styles/BookingModal.css';

function AuthModal({ show, setShow }) {
  const [isLogin, setIsLogin] = useState(true);

  if (!show) return null;

  return (
    <div className="booking-modal-wrapper">
      <div className="modal-overlay" onClick={() => setShow(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <button className={isLogin ? 'btn-primary' : ''} onClick={() => setIsLogin(true)}>Login</button>
            <button className={!isLogin ? 'btn-primary' : ''} onClick={() => setIsLogin(false)} style={{ marginLeft: 10 }}>Sign Up</button>
          </div>
          {isLogin ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
