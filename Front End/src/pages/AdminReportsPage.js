import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';

const AdminReportsPage = () => {
  const [userData, setUserData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
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
          fetchAnalytics();
        } else {
          navigate("/");
        }
      } catch (err) { console.error(err); }
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
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="badge-premium animate-pulse" style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}>Compiling Hospital Reports...</div>
    </div>
  );

  return (
    <AdminLayout user={userData}>
      <div className="container-full py-12 animate-slide">
        <header className="flex-center-between mb-big">
          <div>
            <h1 className="text-huge">Reports & Analytics</h1>
            <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>Macro-level insights into hospital operations and patient compliance.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-outline-premium" onClick={() => toast.success("PDF Export Triggered")}>📄 Export PDF</button>
              <button className="btn-premium" onClick={() => toast.success("Excel Export Triggered")}>📊 Export Excel</button>
          </div>
        </header>

        {/* Global Overview KPIs */}
        <div className="grid-main mb-8" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="card-premium" style={{ background: 'var(--bg-main)' }}>
                <h4 className="text-muted text-sm font-bold uppercase mb-2">Total Parents</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{analytics.totals.parents}</div>
            </div>
            <div className="card-premium" style={{ background: 'var(--bg-main)' }}>
                <h4 className="text-muted text-sm font-bold uppercase mb-2">Total Children</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{analytics.totals.children}</div>
            </div>
            <div className="card-premium" style={{ background: 'var(--bg-main)' }}>
                <h4 className="text-muted text-sm font-bold uppercase mb-2">Active Consultants</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{analytics.totals.consultants}</div>
            </div>
            <div className="card-premium" style={{ background: 'var(--bg-main)' }}>
                <h4 className="text-muted text-sm font-bold uppercase mb-2">Total Bookings</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{analytics.totals.bookings}</div>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            
            {/* Left Column: Data Visualization */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Custom CSS Bar Chart: Clinic Engagement */}
                <div className="card-premium">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Monthly Patient Registrations (Mock Trend)</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingBottom: '2rem', borderBottom: '2px solid var(--border-color)', position: 'relative' }}>
                        {[40, 65, 45, 80, 55, 90, 110].map((val, idx) => {
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
                            const heightPercentage = Math.min((val / 110) * 100, 100);
                            return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '10%' }}>
                                <div style={{ 
                                    width: '100%', height: `${heightPercentage}%`, background: 'var(--primary)', 
                                    borderRadius: '6px 6px 0 0', position: 'relative', transition: 'height 1s ease-out'
                                }}>
                                    <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontWeight: 700, fontSize: '0.85rem' }}>
                                        {val}
                                    </span>
                                </div>
                                <span style={{ position: 'absolute', bottom: '-25px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {months[idx]}
                                </span>
                            </div>
                        )})}
                    </div>
                </div>

                {/* Table View: Department Workload */}
                <div className="card-premium" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Department Workload Distribution</h3>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <tbody>
                            {[
                                { dept: 'Child Clinic', count: Math.floor(analytics.totals.bookings * 0.4), color: '#3b82f6' },
                                { dept: 'Vaccination Unit', count: Math.floor(analytics.totals.bookings * 0.35), color: '#10b981' },
                                { dept: 'Nutrition Center', count: Math.floor(analytics.totals.bookings * 0.15), color: '#f59e0b' },
                                { dept: 'Development Clinic', count: Math.floor(analytics.totals.bookings * 0.1), color: '#8b5cf6' }
                            ].map(row => (
                                <tr key={row.dept} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>{row.dept}</td>
                                    <td style={{ padding: '1rem 1.5rem', width: '50%' }}>
                                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${(row.count / analytics.totals.bookings) * 100 || 0}%`, background: row.color }}></div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 800, textAlign: 'right' }}>{row.count} Appts</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Column: Performance Rates */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Circular Progress Mock */}
                <div className="card-premium" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        National Vaccine Compliance
                    </h3>
                    
                    <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
                        {/* CSS Circle */}
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="90" fill="none" stroke="var(--bg-main)" strokeWidth="20" />
                            <circle cx="100" cy="100" r="90" fill="none" stroke="#10b981" strokeWidth="20" 
                                strokeDasharray="565.48" 
                                strokeDashoffset={565.48 - (565.48 * analytics.rates.vaccineCompletion) / 100} 
                                strokeLinecap="round"
                                transform="rotate(-90 100 100)"
                                style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{analytics.rates.vaccineCompletion}%</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.5rem' }}>Fully Vaccinated</span>
                        </div>
                    </div>
                </div>

                <div className="card-premium" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Appointment Completion
                    </h3>
                    
                    <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="90" fill="none" stroke="var(--bg-main)" strokeWidth="20" />
                            <circle cx="100" cy="100" r="90" fill="none" stroke="var(--primary)" strokeWidth="20" 
                                strokeDasharray="565.48" 
                                strokeDashoffset={565.48 - (565.48 * analytics.rates.bookingCompletion) / 100} 
                                strokeLinecap="round"
                                transform="rotate(-90 100 100)"
                                style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{analytics.rates.bookingCompletion}%</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.5rem' }}>Successfully Served</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage;
