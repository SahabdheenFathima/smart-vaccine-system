import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import Button from '../components/atoms/Button';

const DashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = window.localStorage.getItem("token");
      if (!token) { navigate("/sign-in"); return; }
      try {
        const res = await fetch("http://localhost:5001/userData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.status === "ok") setUserData(data.data);
        else navigate("/sign-in");
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="badge-premium animate-pulse">Establishing Secure Session...</div>
    </div>
  );

  const handleQuickAction = (path) => {
    navigate(path);
  };

  return (
    <MainLayout user={userData}>
      <div className="container-full py-12 animate-slide">
        {/* Header Section */}
        <header className="flex-center-between mb-big">
          <div>
            <h1 className="text-huge">Dashboard</h1>
            <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>Welcome back! Here is an overview of your child's health.</p>
          </div>
          <button onClick={() => navigate('/add-baby')} className="btn-premium">
            <span style={{ fontSize: '1.5rem' }}>+</span>
            Register New Baby
          </button>
        </header>

        {/* Main Features Grid */}
        <div className="grid-main mb-big">
          <div className="card-premium h-full" onClick={() => navigate('/vaccine-table')} style={{ cursor: 'pointer' }}>
            <div className="badge-premium">Immunization</div>
            <h3 className="text-title" style={{ fontSize: '1.75rem', marginTop: '1.5rem' }}>Vaccination Registry</h3>
            <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.7' }}>Stay on top of upcoming vaccines. Monitor doses and download certified records.</p>
            <div className="flex-center mt-auto" style={{ color: 'var(--primary)', fontWeight: 800 }}>
              View Full Schedule <span style={{ marginLeft: '0.5rem' }}>&rarr;</span>
            </div>
          </div>

          <div className="card-premium h-full" onClick={() => navigate('/analytics')} style={{ cursor: 'pointer' }}>
            <div className="badge-premium">Development</div>
            <h3 className="text-title" style={{ fontSize: '1.75rem', marginTop: '1.5rem' }}>Growth & Vitals</h3>
            <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.7' }}>Analyze height, weight, and development milestones with interactive health charts.</p>
            <div className="flex-center mt-auto" style={{ color: 'var(--primary)', fontWeight: 800 }}>
              Open Analytics <span style={{ marginLeft: '0.5rem' }}>&rarr;</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <section className="mt-big">
          <div className="flex-center-between mb-8">
            <h2 className="text-title" style={{ fontSize: '1.5rem' }}>Quick Overview</h2>
            <span className="text-muted text-sm font-bold uppercase tracking-wider">Health Services</span>
          </div>
          <div className="grid-actions">
            {[
              { label: 'Milestones', path: '/milestones', icon: '🎯' },
              { label: 'Profile History', path: '/baby-history', icon: '👶' },
              { label: 'Smart Reminders', path: '/reminders', icon: '🔔' }
            ].map(action => (
              <button 
                key={action.label} 
                className="btn-outline-premium"
                onClick={() => handleQuickAction(action.path)}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{action.icon}</div>
                <span style={{ fontSize: '1rem', fontWeight: 800 }}>{action.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* No modal needed anymore since 'Under Development' actions are removed */}
    </MainLayout>
  );
};

export default DashboardPage;
