import React from 'react';
import Navbar from '../organisms/Navbar';

const MainLayout = ({ children, user }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar user={user} />
      <main style={{ flex: '1 0 auto' }}>
        {children}
      </main>
      <footer style={{ 
        padding: '3rem 2.5rem', 
        textAlign: 'center', 
        borderTop: '1px solid var(--border-color)', 
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        fontWeight: 500,
        background: 'var(--bg-card)'
      }}>
        <div className="container-full">
          &copy; {new Date().getFullYear()} Smart System Health Portal. All rights reserved. 
          <span style={{ margin: '0 10px' }}>&bull;</span>
          Professional Healthcare Management
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
