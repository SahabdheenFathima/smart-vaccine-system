import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', width: '100%' }} className={className}>
      {label && <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>}
      <input 
        className="input-field"
        style={{ border: error ? '1.5px solid var(--danger)' : '1.5px solid var(--border-color)' }}
        {...props} 
      />
      {error && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 600 }}>{error}</span>}
    </div>
  );
};

export default Input;
