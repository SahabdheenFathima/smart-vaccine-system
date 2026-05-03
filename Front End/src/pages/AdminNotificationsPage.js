import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';
import { 
  Bell, 
  Send, 
  Save, 
  Eye, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  User, 
  Mail, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock, 
  Calendar, 
  History, 
  Zap, 
  Smartphone, 
  Target,
  Edit,
  Trash2,
  RefreshCcw,
  Bold,
  Italic,
  Underline,
  List,
  Link as LinkIcon,
  Database,
  ArrowUpRight
} from 'lucide-react';

// --- Design Tokens ---
const C = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  secondary: '#64748B',
  text: '#0F172A',
  muted: '#94A3B8',
  red: '#EF4444',
  redLight: '#FEE2E2',
  green: '#10B981',
  greenLight: '#D1FAE5',
  blue: '#3B82F6',
  blueLight: '#DBEAFE',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
};

const REACH_MAP = { 'All Parents': 250, 'Specific Parent': 1, 'All Staff': 12 };

const AdminNotificationsPage = () => {
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Compose State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('System Announcement');
  const [audience, setAudience] = useState('All Parents');
  const [targetEmail, setTargetEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // History/Filter State
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5); // History items per page

  const editorRef = useRef(null);

  const getEditorHTML = () => editorRef.current ? editorRef.current.innerHTML : '';
  const getEditorText = () => editorRef.current ? editorRef.current.innerText : '';

  useEffect(() => {
    const fetchData = async () => {
      const token = window.localStorage.getItem('token');
      if (!token) { navigate('/sign-in'); return; }
      try {
        const res = await fetch('http://localhost:5001/userData', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.status === 'ok' && data.data.role === 'ADMIN') {
          setUserData(data.data); fetchNotifications();
        } else { navigate('/'); }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/admin/notifications');
      const data = await res.json();
      if (data.status === 'ok') setNotifications(data.data);
    } catch { toast.error('Failed to fetch notification history'); }
    finally { setLoading(false); }
  };

  const execCmd = (cmd, isLink) => {
    if (isLink) {
      const url = prompt('Enter URL:');
      if (url) document.execCommand('createLink', false, url);
    } else {
      document.execCommand(cmd, false, null);
    }
    editorRef.current && editorRef.current.focus();
  };

  const handleSend = async (e, asDraft = false) => {
    e && e.preventDefault();
    const message = getEditorText().trim();
    if (!title.trim() || !message) { toast.error('Title and message are required'); return; }
    setIsSubmitting(true);
    const payload = { title, message: getEditorHTML(), type, audience, targetEmail, status: asDraft ? 'Draft' : 'Sent' };
    try {
      const res = await fetch('http://localhost:5001/api/admin/notifications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        toast.success(asDraft ? 'Saved as Draft!' : 'Notification Broadcasted!');
        setTitle(''); setTargetEmail('');
        if (editorRef.current) editorRef.current.innerHTML = '';
        fetchNotifications();
      } else { toast.error('Failed to send'); }
    } catch { toast.error('An error occurred'); }
    finally { setIsSubmitting(false); }
  };

  const handleResend = (notif) => {
    setTitle(notif.title);
    setType(notif.type);
    setAudience(notif.audience);
    setTargetEmail(notif.targetEmail || '');
    if (editorRef.current) editorRef.current.innerHTML = notif.message || '';
    toast.success('Loaded for resend review.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Filtering & Pagination ---
  const filtered = useMemo(() => {
    return notifications.filter(n => {
      const matchFilter = filter === 'All' || (n.status || 'Sent') === filter;
      const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || (n.message || '').toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [notifications, filter, search]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = useMemo(() => filtered.slice((page-1)*rowsPerPage, page*rowsPerPage), [filtered, page, rowsPerPage]);

  const stats = useMemo(() => [
    { label: 'Total Broadcasts', value: notifications.length, icon: Database, color: C.primary, bg: C.primaryLight },
    { label: 'Estimated Reach', value: notifications.reduce((acc, n) => acc + (REACH_MAP[n.audience] || 0), 0), icon: Users, color: C.blue, bg: C.blueLight },
    { label: 'Active Drafts', value: notifications.filter(n => n.status === 'Draft').length, icon: Edit, color: C.amber, bg: C.amberLight },
    { label: 'Urgent Alerts', value: notifications.filter(n => n.type === 'Urgent Alert').length, icon: Zap, color: C.red, bg: C.redLight },
  ], [notifications]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 700, color: C.muted }}>Initializing Broadcast Hub...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <AdminLayout user={userData}>
      <div style={{ background: C.bg, minHeight: '100vh', padding: '2rem 2.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* --- Header --- */}
        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-0.025em' }}>Notification Center</h1>
              <p style={{ color: C.muted, marginTop: '0.4rem', fontSize: '1rem' }}>Orchestrate system-wide broadcasts and targeted health alerts.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowPreview(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'white', border: `1px solid ${C.border}`, borderRadius: '10px', fontWeight: 700, color: C.text, cursor: 'pointer' }}>
                <Eye size={18} /> Mobile Preview
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {stats.map((s, idx) => (
              <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={22} color={s.color} strokeWidth={2.5} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: C.text, marginTop: '0.1rem', lineHeight: 1 }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* --- LEFT: Compose --- */}
          <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>
                <Send size={20} strokeWidth={2.5} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: C.text }}>Compose Broadcast</h2>
            </div>

            <form onSubmit={(e) => handleSend(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Broadcast Title</label>
                <input 
                    required type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Schedule Change Announcement"
                    style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: C.bg, fontSize: '0.95rem', fontWeight: 600, outline: 'none' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Alert Protocol</label>
                  <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: C.bg, fontSize: '0.95rem', fontWeight: 700, outline: 'none' }}>
                    <option>System Announcement</option>
                    <option>Vaccine Alert</option>
                    <option>Urgent Alert</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Target Audience</label>
                  <select value={audience} onChange={e => setAudience(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: C.bg, fontSize: '0.95rem', fontWeight: 700, outline: 'none' }}>
                    <option>All Parents</option>
                    <option>Specific Parent</option>
                    <option>All Staff</option>
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.green, fontSize: '0.7rem', fontWeight: 800, marginTop: '0.5rem' }}>
                    <Target size={12} /> Reach: ~{REACH_MAP[audience] || 0} Recipients
                  </div>
                </div>
              </div>

              {audience === 'Specific Parent' && (
                <div style={{ animation: 'slideDown 0.3s' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Recipient Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input required type="email" value={targetEmail} onChange={e => setTargetEmail(e.target.value)} placeholder="parent@hospital.gov.lk" style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: C.bg, fontSize: '0.95rem', fontWeight: 600, outline: 'none' }} />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Message Content</label>
                <div style={{ background: 'white', borderRadius: '12px', border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem', background: '#F8FAFC', borderBottom: `1.5px solid ${C.border}` }}>
                    {[
                      { icon: Bold, cmd: 'bold' },
                      { icon: Italic, cmd: 'italic' },
                      { icon: Underline, cmd: 'underline' },
                      { icon: List, cmd: 'insertUnorderedList' },
                      { icon: LinkIcon, cmd: 'createLink', isLink: true },
                    ].map((t, idx) => (
                      <button key={idx} type="button" onMouseDown={e => { e.preventDefault(); execCmd(t.cmd, t.isLink); }} style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.secondary }}>
                        <t.icon size={16} strokeWidth={2.5} />
                      </button>
                    ))}
                  </div>
                  <div 
                    ref={editorRef} contentEditable suppressContentEditableWarning
                    style={{ minHeight: '150px', padding: '1rem', fontSize: '0.95rem', lineHeight: 1.6, outline: 'none', background: 'white', color: C.text }}
                    data-placeholder="Draft your clinical broadcast here..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={isSubmitting} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '0.85rem', background: C.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)' }}>
                  <Send size={18} /> {isSubmitting ? 'Broadcasting...' : 'Broadcast Announcement'}
                </button>
                <button type="button" onClick={() => handleSend(null, true)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '0.85rem', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '12px', fontWeight: 800, color: C.text, cursor: 'pointer' }}>
                  <Save size={18} /> Draft
                </button>
              </div>
            </form>
          </div>

          {/* --- RIGHT: History --- */}
          <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <History size={20} color={C.primary} strokeWidth={2.5} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: C.text }}>Broadcast History</h2>
              </div>
              <span style={{ background: C.primaryLight, color: C.primary, fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                {notifications.length} Logs
              </span>
            </div>

            <div style={{ padding: '1rem 2rem', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: '0.5rem' }}>
              {['All', 'Sent', 'Draft'].map(f => (
                <button key={f} onClick={() => { setFilter(f); setPage(1); }} style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: 'none', background: filter === f ? C.primaryLight : 'transparent', color: filter === f ? C.primary : C.muted, fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>
                  {f}
                </button>
              ))}
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={14} color={C.muted} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Search logs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: '100%', padding: '0.45rem 1rem 0.45rem 2.25rem', borderRadius: '8px', border: `1.5px solid ${C.border}`, background: C.bg, fontSize: '0.8rem', outline: 'none' }} />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
              {paginated.length > 0 ? paginated.map(notif => {
                const status = notif.status || 'Sent';
                return (
                  <div key={notif._id} style={{ padding: '1.25rem', borderRadius: '16px', border: `1.5px solid ${C.border}`, marginBottom: '1.25rem', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900, background: notif.type === 'Urgent Alert' ? C.redLight : C.blueLight, color: notif.type === 'Urgent Alert' ? C.red : C.blue }}>
                        {notif.type}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: C.muted, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} /> {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: C.text, marginBottom: '0.5rem' }}>{notif.title}</h3>
                    <div style={{ fontSize: '0.85rem', color: C.secondary, lineHeight: 1.5, marginBottom: '1rem', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }} dangerouslySetInnerHTML={{ __html: notif.message }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: `1px dashed ${C.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 700, color: C.muted }}>
                        <Target size={12} /> {notif.audience}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: status === 'Sent' ? C.green : C.amber, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {status === 'Sent' ? <CheckCircle size={12} /> : <Edit size={12} />} {status}
                        </span>
                        <button onClick={() => handleResend(notif)} style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: `1.25px solid ${C.border}`, background: 'white', color: C.secondary, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                          <RefreshCcw size={12} style={{ marginRight: '0.2rem' }} /> Re-load
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <Bell size={40} color={C.muted} style={{ opacity: 0.3 }} />
                  <p style={{ marginTop: '1rem', fontWeight: 700, color: C.muted }}>No broadcast logs found</p>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            <div style={{ padding: '1rem 2rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 700 }}>{filtered.length} total entries</p>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.4rem', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', color: C.text }}>
                        <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: C.primary, margin: '0 0.5rem' }}>{page} / {totalPages || 1}</span>
                    <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} style={{ padding: '0.4rem', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'white', cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', color: C.text }}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* --- Mobile Preview Modal --- */}
        {showPreview && (
          <>
            <div onClick={() => setShowPreview(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000 }} />
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '360px', background: 'white', zIndex: 1001, borderRadius: '32px', padding: '2.5rem 1.5rem', boxShadow: '0 30px 60px rgba(0,0,0,0.25)', animation: 'modalSlide 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                <Smartphone size={18} color={C.muted} />
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mobile Environment</span>
              </div>
              <div style={{ background: '#F1F5F9', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Bell size={18} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: C.text }}>Smart Vaccine System</p>
                        <p style={{ fontSize: '0.6rem', color: C.muted }}>Now</p>
                    </div>
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: C.text, marginBottom: '0.4rem' }}>{title || 'No Title Entered'}</h4>
                <div style={{ fontSize: '0.8rem', color: C.secondary, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: getEditorHTML() || 'Message content preview...' }} />
              </div>
              <button onClick={() => setShowPreview(false)} style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem', background: C.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Dismiss Preview</button>
            </div>
          </>
        )}

      </div>
      <style>{`
        [contenteditable=true]:empty:before { content: attr(data-placeholder); color: #94A3B8; pointer-events: none; }
        @keyframes modalSlide { from { transform: translate(-50%, -45%); opacity: 0; } to { transform: translate(-50%, -50%); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;
