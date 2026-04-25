import React from 'react';

const Card = ({ children, className = '', title, subtitle, ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-xl font-bold">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
