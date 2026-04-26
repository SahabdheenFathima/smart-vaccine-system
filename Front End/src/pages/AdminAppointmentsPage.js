import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';

const AdminAppointmentsPage = () => {
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
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
          fetchBookings();
        } else {
          navigate("/");
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/bookings");
      const data = await res.json();
      if (data.status === "ok") {
        setBookings(data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      }
    } catch (err) { toast.error("Failed to fetch bookings"); }
    finally { setLoading(false); }
  };



  const filteredBookings = statusFilter === 'All' 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

  const getStatusColor = (status) => {
    switch(status) {
        case 'Approved': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
        case 'In Consultation': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' };
        case 'Completed': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
        case 'Pending': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
        case 'Rejected': 
        case 'Cancelled': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
        default: return { bg: 'rgba(156, 163, 175, 0.1)', text: '#6b7280' };
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="badge-premium animate-pulse">Loading Appointment Center...</div>
    </div>
  );

  return (
    <AdminLayout user={userData}>
      <div className="container-full py-12 animate-slide">
        <header className="flex-center-between mb-big">
          <div>
            <h1 className="text-huge">Appointment Center</h1>
            <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>Manage all hospital bookings, approvals, and queue dispatching.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            {['All', 'Pending', 'Approved', 'Completed', 'Rejected'].map(status => (
                <button 
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    style={{ 
                        padding: '0.5rem 1rem', 
                        borderRadius: '8px', 
                        border: 'none',
                        background: statusFilter === status ? 'var(--primary)' : 'transparent',
                        color: statusFilter === status ? 'white' : 'var(--text-secondary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {status}
                </button>
            ))}
          </div>
        </header>

        <div className="card-premium" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Token</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Patient Details</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Assigned Consultant</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Schedule</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>

              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? filteredBookings.map(b => {
                  const colors = getStatusColor(b.status);
                  return (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover:bg-gray-50">
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'inline-block', padding: '0.5rem 0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '1px' }}>
                            {b.token_no}
                        </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{b.child_id?.babyName || 'Unknown Patient'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Reason: {b.reason}</div>
                        {b.priority_level === 'Urgent' && (
                            <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 800, borderRadius: '4px' }}>URGENT</span>
                        )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Dr. {b.consultant_id?.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{b.consultant_id?.department}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{new Date(b.booking_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            🕒 {b.booking_time}
                        </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ 
                            padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800,
                            background: colors.bg, color: colors.text, display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.text }}></span>
                            {b.status}
                        </span>
                    </td>

                  </tr>
              )}) : (
                <tr>
                  <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No appointments found in this category.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointmentsPage;
