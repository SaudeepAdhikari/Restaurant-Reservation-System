import React from 'react';
import './Card.css';

const Card = ({ children, className = '', hover = true, glass = false }) => {
    return (
        <div className={`card ${hover ? 'card-hover' : ''} ${glass ? 'card-glass' : ''} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
