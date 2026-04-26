import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';

const AdminNotificationsPage = () => {
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('System Announcement');
  const [audience, setAudience] = useState('All Parents');
  const [targetEmail, setTargetEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          fetchNotifications();
        } else {
          navigate("/");
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/notifications");
      const data = await res.json();
      if (data.status === "ok") {
        setNotifications(data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch notification history");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      const payload = { title, message, type, audience, targetEmail };

      try {
        const res = await fetch("http://localhost:5001/api/admin/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(data.status === "ok") {
            toast.success("Notification Broadcasted Successfully!");
            setTitle('');
            setMessage('');
            setTargetEmail('');
            fetchNotifications(); // Refresh history
        } else {
            toast.error("Failed to send notification");
        }
      } catch (err) {
          toast.error("An error occurred");
      } finally {
          setIsSubmitting(false);
      }
  };

  const getBadgeStyle = (type) => {
      switch(type) {
          case 'Vaccine Alert': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
          case 'Urgent Alert': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
          default: return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="badge-premium animate-pulse">Loading Notification Center...</div>
    </div>
  );

  return (
    <AdminLayout user={userData}>
      <div className="container-full py-12 animate-slide">
        <header className="mb-big">
          <h1 className="text-huge">Notification Center</h1>
          <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>Broadcast system announcements and targeted health alerts.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Compose Panel */}
            <div className="card-premium" style={{ alignSelf: 'start' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📢 Compose Alert
                </h2>
                
                <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label className="text-sm font-bold mb-2 block text-muted">Message Title</label>
                        <input 
                            required 
                            type="text" 
                            className="input-premium w-full" 
                            placeholder="e.g. Clinic Closed Tomorrow" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm font-bold mb-2 block text-muted">Alert Type</label>
                            <select className="input-premium w-full" value={type} onChange={(e) => setType(e.target.value)}>
                                <option>System Announcement</option>
                                <option>Vaccine Alert</option>
                                <option>Urgent Alert</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold mb-2 block text-muted">Audience Target</label>
                            <select className="input-premium w-full" value={audience} onChange={(e) => setAudience(e.target.value)}>
                                <option>All Parents</option>
                                <option>Specific Parent</option>
                            </select>
                        </div>
                    </div>

                    {audience === 'Specific Parent' && (
                        <div className="animate-slide">
                            <label className="text-sm font-bold mb-2 block text-muted">Target Email</label>
                            <input 
                                required={audience === 'Specific Parent'} 
                                type="email" 
                                className="input-premium w-full" 
                                placeholder="parent@example.com"
                                value={targetEmail}
                                onChange={(e) => setTargetEmail(e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-bold mb-2 block text-muted">Message Body</label>
                        <textarea 
                            required 
                            className="input-premium w-full" 
                            style={{ minHeight: '120px', resize: 'vertical' }}
                            placeholder="Type your official announcement here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-premium w-full" 
                        disabled={isSubmitting}
                        style={{ padding: '1rem', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}
                    >
                        {isSubmitting ? 'Broadcasting...' : 'Broadcast Notification'}
                    </button>
                </form>
            </div>

            {/* History Feed */}
            <div className="card-premium" style={{ background: 'var(--bg-main)', border: 'none', padding: 0 }}>
                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Broadcast History</h2>
                </div>
                
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
                    {notifications.length > 0 ? notifications.map(notif => {
                        const style = getBadgeStyle(notif.type);
                        return (
                        <div key={notif._id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, background: style.bg, color: style.color }}>
                                    {notif.type}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {new Date(notif.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{notif.title}</h3>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {notif.message}
                            </p>
                            
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                <span>🎯 Audience: {notif.audience} {notif.targetEmail ? `(${notif.targetEmail})` : ''}</span>
                                <span style={{ color: '#10b981' }}>✓ Sent</span>
                            </div>
                        </div>
                    )}) : (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                            <span style={{ fontSize: '2.5rem', opacity: 0.5 }}>📭</span>
                            <p style={{ marginTop: '1rem', fontWeight: 600 }}>No announcements have been broadcasted yet.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;
