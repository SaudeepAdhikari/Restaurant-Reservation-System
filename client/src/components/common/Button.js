import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  className = '', 
  onClick, 
  type = 'button',
  disabled = false,
  icon,
  isLoading = false
}) => {
  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      type={type}
      className={`btn-root btn-${variant} btn-${size} ${className} ${isLoading ? 'btn-loading' : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span className="btn-spinner" />
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          <span className="btn-content">{children}</span>
        </>
      )}
    </motion.button>
  );
};

export default Button;

