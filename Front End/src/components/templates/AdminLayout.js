import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children, user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    window.localStorage.clear();
    navigate('/sign-in');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin-dashboard', icon: '📊' },
    { name: 'Parent Management', path: '/admin-parents', icon: '👪' },
    { name: 'Child Profiles', path: '/admin-children', icon: '👶' },
    { name: 'Consultant Directory', path: '/admin-consultants', icon: '🩺' },
    { name: 'Appointment Center', path: '/admin-appointments', icon: '📅' },

    { name: 'Vaccine Schedules', path: '/admin-vaccine-schedules', icon: '🗓️' },
    { name: 'Queue & Token Desk', path: '/admin-queue', icon: '📟' },
    { name: 'Notification Center', path: '/admin-notifications', icon: '📢' },
    { name: 'Reports & Analytics', path: '/admin-reports', icon: '📈' },
    { name: 'System Settings', path: '/admin-settings', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        background: 'var(--bg-card)', 
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100
      }}>
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '40px', height: '40px', background: 'var(--primary)', 
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: '1.25rem'
          }}>SS</div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>Smart System</h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Console</span>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }} className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                fontWeight: isActive ? 700 : 600,
                textDecoration: 'none',
                marginBottom: '0.25rem',
                transition: 'all 0.2s ease'
              })}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user?.fname?.charAt(0) || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.fname || 'Administrator'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hospital Staff</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{ 
          height: '70px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem',
          position: 'sticky', top: 0, zIndex: 90
        }}>
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search patients, tokens, or staff... (Cmd+K)" 
                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', fontSize: '0.9rem', outline: 'none' }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', position: 'relative' }}>
              🔔
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '2rem', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
