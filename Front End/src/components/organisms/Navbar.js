import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    window.localStorage.removeItem("loggedIn");
    window.localStorage.removeItem("token");
    navigate('/sign-in');
  };

  return (
    <nav className="nav-premium">
      <div className="container-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%', padding: '0 2rem' }}>
        {/* Brand/Logo Section */}
        <div 
          onClick={() => navigate('/')} 
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer' }}
        >
          <div style={{ 
            width: '44px', height: '44px', background: 'var(--primary)', 
            borderRadius: '12px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', color: 'white', fontWeight: 800, 
            fontSize: '1.25rem', boxShadow: '0 10px 20px -5px var(--primary-glow)' 
          }}>
            SS
          </div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: 0 }}>Smart System</h2>
        </div>
        
        {/* Actions & User Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          {/* Notification Bell */}
          <button 
            onClick={() => navigate('/reminders')}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', 
              padding: '10px', color: 'var(--text-secondary)', borderRadius: '12px',
              transition: 'background 0.2s', position: 'relative'
            }}
            className="hover-bg"
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Live Indicator Dot */}
            <span style={{ 
              position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', 
              background: '#ef4444', borderRadius: '50%', border: '2px solid var(--bg-card)' 
            }}></span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', 
              padding: '10px', color: 'var(--text-secondary)', borderRadius: '12px',
              transition: 'background 0.2s'
            }}
            className="hover-bg"
          >
            {theme === 'light' ? (
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '2.5rem' }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Welcome, <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{user.fname}</span>
              </span>
              <button 
                onClick={handleLogout} 
                style={{ 
                  background: 'var(--border-color)', color: 'var(--text-primary)', 
                  padding: '0.625rem 1.25rem', borderRadius: '10px', border: 'none', 
                  fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
