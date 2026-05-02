import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';

const AdminQueuePage = () => {
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
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
          fetchBookings();
          // Simulate live updates every 10 seconds (until WebSockets are fully implemented)
          const interval = setInterval(fetchBookings, 10000);
          return () => clearInterval(interval);
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
        // Filter for TODAY's bookings only for the live queue
        const today = new Date().toDateString();
        const todaysBookings = data.data.filter(b => new Date(b.booking_date).toDateString() === today);
        setBookings(todaysBookings);
      }
    } catch (err) {
      console.error("Failed to fetch live queue");
    } finally {
      setLoading(false);
    }
  };

  const { nowServing, waiting, completed } = useMemo(() => {
    const nowServing = bookings.filter(b => b.status === 'In Consultation');
    // Sort waiting by priority first, then token number (implicitly by time)
    const waiting = bookings.filter(b => b.status === 'Approved').sort((a, b) => {
        if(a.priority_level === 'Urgent' && b.priority_level !== 'Urgent') return -1;
        if(b.priority_level === 'Urgent' && a.priority_level !== 'Urgent') return 1;
        return a.token_no.localeCompare(b.token_no);
    });
    const completed = bookings.filter(b => b.status === 'Completed');

    return { nowServing, waiting, completed };
  }, [bookings]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="badge-premium animate-pulse" style={{ fontSize: '1.5rem', padding: '1rem 2rem' }}>Initializing Live Queue System...</div>
    </div>
  );

  return (
    <AdminLayout user={userData}>
      <div className="container-full py-6 animate-slide" style={{ minHeight: '100%' }}>
        <header className="flex-center-between mb-8">
          <div>
            <h1 className="text-huge" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>Live Queue Board</h1>
            <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>Digital Signage Interface - Auto-refreshes every 10 seconds.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)', padding: '1rem 2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', animation: 'pulse 2s infinite' }}></div>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px' }}>SYSTEM LIVE</span>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', height: 'calc(100vh - 200px)' }}>
            
            {/* Left Column: Now Serving (Massive Display) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>📢</span> Now Serving
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', flex: 1, alignContent: 'start' }}>
                    {nowServing.length > 0 ? nowServing.map(serving => (
                        <div key={serving._id} style={{ 
                            background: 'var(--bg-card)', borderRadius: '24px', padding: '3rem 2rem', 
                            border: '2px solid var(--primary)', boxShadow: '0 10px 30px rgba(79, 70, 229, 0.15)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'var(--primary)' }}></div>
                            
                            <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-2px', marginBottom: '1rem' }}>
                                {serving.token_no}
                            </div>
                            
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {serving.child_id?.babyName || 'Patient'}
                            </div>
                            
                            <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem', marginTop: '1rem' }}>
                                Proceed to Dr. {serving.consultant_id?.name}
                            </div>
                        </div>
                    )) : (
                        <div style={{ 
                            background: 'rgba(0,0,0,0.02)', borderRadius: '24px', padding: '4rem 2rem', 
                            border: '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gridColumn: '1 / -1'
                        }}>
                            <span style={{ fontSize: '4rem', opacity: 0.5, marginBottom: '1rem' }}>☕</span>
                            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>No patients currently in consultation.</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Waiting Queue */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '1px' }}>
                        Waiting List ({waiting.length})
                    </h2>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {waiting.length > 0 ? waiting.map((w, index) => (
                        <div key={w._id} style={{ 
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                            borderBottom: '1px solid var(--border-color)', background: w.priority_level === 'Urgent' ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-secondary)', opacity: 0.5, minWidth: '20px' }}>
                                {index + 1}.
                            </div>
                            <div style={{ 
                                padding: '0.5rem 1rem', background: w.priority_level === 'Urgent' ? '#ef4444' : 'var(--bg-main)', 
                                color: w.priority_level === 'Urgent' ? 'white' : 'var(--text-primary)', 
                                borderRadius: '8px', fontWeight: 900, letterSpacing: '1px', border: w.priority_level !== 'Urgent' ? '1px solid var(--border-color)' : 'none'
                            }}>
                                {w.token_no}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>Dr. {w.consultant_id?.name?.split(' ')[0]}</div>
                                {w.priority_level === 'Urgent' && <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 800, marginTop: '2px' }}>URGENT</div>}
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            The waiting list is currently empty.
                        </div>
                    )}
                </div>

                {/* Mini Completed Strip */}
                {completed.length > 0 && (
                    <div style={{ padding: '1rem 2rem', borderTop: '1px solid var(--border-color)', background: 'rgba(16, 185, 129, 0.05)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Recently Completed</div>
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {completed.slice(-5).map(c => (
                                <span key={c._id} style={{ padding: '0.25rem 0.5rem', background: 'white', color: '#10b981', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.2)' }}>
                                    {c.token_no}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
        </div>
      </div>
      <style>{`
        @keyframes pulse {
            0% { opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { opacity: 0.8; box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminQueuePage;
