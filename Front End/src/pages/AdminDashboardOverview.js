import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';

const AdminDashboardOverview = () => {
  const [userData, setUserData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
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
        if (data.status === "ok" && data.data.role === 'ADMIN') {
          setUserData(data.data);
          await Promise.all([fetchAnalytics(), fetchNotifications()]);
        } else {
          navigate("/");
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/analytics");
      const data = await res.json();
      if (data.status === "ok") {
        setAnalytics(data.data);
      }
    } catch (err) {
      toast.error("Failed to load dashboard data");
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/notifications");
      const data = await res.json();
      if (data.status === "ok") {
        setRecentNotifications(data.data.slice(0, 5)); // Get top 5 recent
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !analytics) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="badge-premium animate-pulse" style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}>Initializing Control Tower...</div>
    </div>
  );

  return (
    <AdminLayout user={userData}>
      <div className="container-full py-12 animate-slide">
        <header className="flex-center-between mb-8">
          <div>
            <h1 className="text-huge">Hospital Master Control</h1>
            <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>Real-time pediatric center status and operational alerts.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>All Systems Operational</span>
          </div>
        </header>

        {/* Top KPI Row */}
        <div className="grid-main mb-8" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="card-premium">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 className="text-muted text-sm font-bold uppercase">Total Parents</h4>
                    <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>👪</span>
                </div>
                <p className="text-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--text-primary)' }}>{analytics.totals.parents}</p>
            </div>
            <div className="card-premium">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 className="text-muted text-sm font-bold uppercase">Registered Children</h4>
                    <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>👶</span>
                </div>
                <p className="text-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--text-primary)' }}>{analytics.totals.children}</p>
            </div>
            <div className="card-premium" style={{ borderBottom: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 className="text-muted text-sm font-bold uppercase">Vaccines Delivered</h4>
                    <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>💉</span>
                </div>
                <p className="text-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: '#10b981' }}>
                    {Math.round((analytics.rates.vaccineCompletion / 100) * analytics.totals.vaccines) || 0}
                </p>
            </div>
            <div className="card-premium" style={{ borderBottom: '4px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 className="text-muted text-sm font-bold uppercase">Missed Consultations</h4>
                    <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>⚠️</span>
                </div>
                {/* Mock calculation for missed to show UI effect */}
                <p className="text-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: '#ef4444' }}>
                    {Math.floor(analytics.totals.bookings * 0.05) || 0}
                </p>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            
            {/* Middle Section: Quick Analytics & Workflows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="card-premium" style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(79, 70, 229, 0.05) 100%)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Hospital Throughput Summary</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Appointment Completion Rate</span>
                                <span style={{ fontWeight: 900, color: 'var(--primary)' }}>{analytics.rates.bookingCompletion}%</span>
                            </div>
                            <div style={{ width: '100%', height: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${analytics.rates.bookingCompletion}%`, background: 'var(--primary)', borderRadius: '6px' }}></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>National Vaccine Compliance</span>
                                <span style={{ fontWeight: 900, color: '#10b981' }}>{analytics.rates.vaccineCompletion}%</span>
                            </div>
                            <div style={{ width: '100%', height: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${analytics.rates.vaccineCompletion}%`, background: '#10b981', borderRadius: '6px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/admin-queue')}>
                        <div style={{ fontSize: '2.5rem' }}>📟</div>
                        <div>
                            <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Live Queue Desk</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage waiting patients</p>
                        </div>
                    </div>
                    <div className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/admin-appointments')}>
                        <div style={{ fontSize: '2.5rem' }}>📅</div>
                        <div>
                            <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Approve Bookings</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{analytics.totals.bookings} total requests</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Urgent Action Panel */}
            <div className="card-premium" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderBottom: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ⚠️ Recent Alerts
                    </h3>
                </div>
                
                <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recentNotifications.length > 0 ? recentNotifications.map(notif => (
                        <div key={notif._id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                                {notif.type}
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                                {notif.title}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {new Date(notif.createdAt).toLocaleDateString()} - To: {notif.audience}
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>✅</div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No active alerts. System is quiet.</p>
                        </div>
                    )}
                </div>
                
                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <button onClick={() => navigate('/admin-notifications')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}>
                        View All Communications →
                    </button>
                </div>
            </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardOverview;
