import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';

/* ─── Inline Styles ─────────────────────────────────────────── */
const S = {
  page: { padding: '2.5rem 0', animation: 'slideUp 0.5s cubic-bezier(.4,0,.2,1)' },
  header: { marginBottom: '2rem' },
  h1: { fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' },
  sub: { fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.25rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' },
  label: { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
    border: '1.5px solid var(--border-color)', background: 'var(--bg-input)',
    color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500,
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
  },
  reachBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    background: 'rgba(16,185,129,0.1)', color: '#059669',
    fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem',
    borderRadius: '20px', marginTop: '0.4rem',
  },
  toolbar: {
    display: 'flex', gap: '2px', flexWrap: 'wrap', padding: '0.4rem 0.6rem',
    background: 'var(--bg-main)', borderRadius: '8px 8px 0 0',
    border: '1.5px solid var(--border-color)', borderBottom: 'none',
  },
  toolBtn: {
    padding: '0.3rem 0.55rem', borderRadius: '6px', border: 'none',
    background: 'transparent', cursor: 'pointer', fontSize: '0.85rem',
    fontWeight: 700, color: 'var(--text-secondary)', transition: 'all 0.15s',
  },
  editorArea: {
    minHeight: '130px', padding: '0.85rem 1rem',
    borderRadius: '0 0 10px 10px', border: '1.5px solid var(--border-color)',
    borderTop: 'none', background: 'var(--bg-input)',
    color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6,
    outline: 'none', overflowY: 'auto',
  },
  actionRow: { display: 'flex', gap: '0.75rem', marginTop: '1.25rem' },
  btnPrimary: {
    flex: 1, background: '#5C59E8', color: 'white',
    padding: '0.85rem 1.25rem', borderRadius: '10px', border: 'none',
    fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(92,89,232,0.3)',
  },
  btnSecondary: {
    padding: '0.85rem 1.1rem', borderRadius: '10px',
    border: '1.5px solid var(--border-color)', background: 'var(--bg-card)',
    color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem',
    cursor: 'pointer', transition: 'all 0.2s', display: 'flex',
    alignItems: 'center', gap: '0.4rem',
  },
  btnIcon: {
    width: '42px', height: '42px', borderRadius: '10px',
    border: '1.5px solid var(--border-color)', background: 'var(--bg-card)',
    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
  },
  historyCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: '16px', overflow: 'hidden',
  },
  historyInner: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '620px', overflowY: 'auto' },
  filterRow: { display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' },
  chip: {
    padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem',
    fontWeight: 700, border: '1.5px solid var(--border-color)',
    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
  },
  chipActive: {
    padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem',
    fontWeight: 700, border: '1.5px solid #5C59E8',
    background: 'rgba(92,89,232,0.08)', color: '#5C59E8', cursor: 'pointer', transition: 'all 0.2s',
  },
  searchWrap: { padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)' },
  searchInput: {
    width: '100%', padding: '0.55rem 1rem 0.55rem 2.25rem',
    borderRadius: '8px', border: '1.5px solid var(--border-color)',
    background: 'var(--bg-main)', color: 'var(--text-primary)',
    fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
  },
  notifItem: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: '12px', padding: '1.1rem 1.25rem', transition: 'box-shadow 0.2s',
  },
  notifTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' },
  notifTitle: { fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', flex: 1 },
  timestamp: { fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' },
  notifMsg: { fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' },
  notifFoot: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)' },
  targetLabel: { fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' },
  footRight: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  resendBtn: {
    padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem',
    fontWeight: 700, border: '1.5px solid var(--border-color)',
    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
  },
  statusSent: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#10B981' },
  statusSched: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' },
  statusDraft: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' },
  previewOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  previewPhone: {
    width: '340px', background: '#fff', borderRadius: '28px',
    padding: '2rem 1.5rem', boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
    position: 'relative',
  },
  empty: { textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' },
};

const REACH_MAP = { 'All Parents': 250, 'Specific Parent': 1, 'All Staff': 12 };

const TOOLBAR_CMDS = [
  { cmd: 'bold', label: 'B', style: { fontWeight: 900 } },
  { cmd: 'italic', label: 'I', style: { fontStyle: 'italic' } },
  { cmd: 'underline', label: 'U', style: { textDecoration: 'underline' } },
  { cmd: 'insertUnorderedList', label: '≡', style: {} },
  { cmd: 'createLink', label: '🔗', style: {}, isLink: true },
];

function formatTs(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');
}

function getTypeBadge(type) {
  const map = {
    'Vaccine Alert': { bg: 'rgba(16,185,129,0.1)', color: '#059669' },
    'Urgent Alert': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
    'System Announcement': { bg: 'rgba(92,89,232,0.1)', color: '#5C59E8' },
  };
  return map[type] || map['System Announcement'];
}

const AdminNotificationsPage = () => {
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('System Announcement');
  const [audience, setAudience] = useState('All Parents');
  const [targetEmail, setTargetEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
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
    toast.success('Loaded for resend — review and broadcast.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filtered = notifications.filter(n => {
    const matchFilter = filter === 'All' || (n.status || 'Sent') === filter;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || (n.message || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="badge-premium animate-pulse">Loading Notification Center...</div>
    </div>
  );

  return (
    <AdminLayout user={userData}>
      <div className="container-full" style={S.page}>
        {/* Header */}
        <header style={S.header}>
          <h1 style={S.h1}>🔔 Notification Center</h1>
          <p style={S.sub}>Broadcast system announcements and targeted health alerts to your community.</p>
        </header>

        <div style={S.grid}>
          {/* ── LEFT: Compose ── */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <span style={{ fontSize: '1.2rem' }}>📢</span>
              <span style={S.cardTitle}>Compose Alert</span>
            </div>

            <form onSubmit={(e) => handleSend(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Title */}
              <div>
                <label style={S.label}>Message Title</label>
                <input
                  required type="text"
                  style={S.input} placeholder="e.g. Clinic Closed Tomorrow"
                  value={title} onChange={e => setTitle(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#5C59E8'; e.target.style.boxShadow = '0 0 0 3px rgba(92,89,232,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Type + Audience */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={S.label}>Alert Type</label>
                  <select style={S.input} value={type} onChange={e => setType(e.target.value)}>
                    <option>System Announcement</option>
                    <option>Vaccine Alert</option>
                    <option>Urgent Alert</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Audience Target</label>
                  <select style={S.input} value={audience} onChange={e => setAudience(e.target.value)}>
                    <option>All Parents</option>
                    <option>Specific Parent</option>
                    <option>All Staff</option>
                  </select>
                  <div style={S.reachBadge}>
                    <span>👥</span>
                    <span>Reaches ~{REACH_MAP[audience] || 0} {audience === 'Specific Parent' ? 'recipient' : 'people'}</span>
                  </div>
                </div>
              </div>

              {/* Target Email */}
              {audience === 'Specific Parent' && (
                <div style={{ animation: 'slideUp 0.3s ease' }}>
                  <label style={S.label}>Target Email</label>
                  <input
                    required type="email" style={S.input}
                    placeholder="parent@example.com"
                    value={targetEmail} onChange={e => setTargetEmail(e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#5C59E8'; e.target.style.boxShadow = '0 0 0 3px rgba(92,89,232,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              )}

              {/* WYSIWYG Message Body */}
              <div>
                <label style={S.label}>Message Body</label>
                <div style={S.toolbar}>
                  {TOOLBAR_CMDS.map(t => (
                    <button key={t.cmd} type="button" style={{ ...S.toolBtn, ...t.style }}
                      onMouseDown={e => { e.preventDefault(); execCmd(t.cmd, t.isLink); }}
                      title={t.cmd}
                    >{t.label}</button>
                  ))}
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', alignSelf: 'center', padding: '0 0.25rem' }}>Rich Text</span>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  style={S.editorArea}
                  data-placeholder="Type your official announcement here..."
                  onFocus={e => { e.target.style.borderColor = '#5C59E8'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; }}
                />
              </div>

              {/* Action Row */}
              <div style={S.actionRow}>
                <button type="submit" style={{ ...S.btnPrimary, opacity: isSubmitting ? 0.7 : 1 }} disabled={isSubmitting}>
                  <span>🚀</span> {isSubmitting ? 'Broadcasting...' : 'Broadcast'}
                </button>
                <button type="button" style={S.btnSecondary} onClick={() => handleSend(null, true)}>
                  <span>💾</span> Draft
                </button>
                <button type="button" style={S.btnIcon} title="Preview" onClick={() => setShowPreview(true)}>
                  👁
                </button>
              </div>
            </form>
          </div>

          {/* ── RIGHT: History ── */}
          <div style={S.historyCard}>
            {/* Header */}
            <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>📋</span>
              <span style={S.cardTitle}>Broadcast History</span>
              <span style={{ marginLeft: 'auto', background: 'rgba(92,89,232,0.1)', color: '#5C59E8', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                {notifications.length} total
              </span>
            </div>

            {/* Filter Chips */}
            <div style={S.filterRow}>
              {['All', 'Sent', 'Draft', 'Scheduled'].map(f => (
                <button key={f} type="button"
                  style={filter === f ? S.chipActive : S.chip}
                  onClick={() => setFilter(f)}
                >{f}</button>
              ))}
            </div>

            {/* Search */}
            <div style={S.searchWrap}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: 'var(--text-secondary)', pointerEvents: 'none' }}>🔍</span>
                <input
                  type="text" style={S.searchInput}
                  placeholder="Search announcements..."
                  value={search} onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* List */}
            <div style={S.historyInner}>
              {filtered.length > 0 ? filtered.map(notif => {
                const badge = getTypeBadge(notif.type);
                const status = notif.status || 'Sent';
                return (
                  <div key={notif._id} style={S.notifItem}>
                    <div style={S.notifTop}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, background: badge.bg, color: badge.color }}>
                        {notif.type}
                      </span>
                      <span style={S.timestamp}>{formatTs(notif.createdAt)}</span>
                    </div>
                    <div style={S.notifTitle}>{notif.title}</div>
                    <div style={S.notifMsg} dangerouslySetInnerHTML={{ __html: notif.message }} />
                    <div style={S.notifFoot}>
                      <span style={S.targetLabel}>
                        🎯 {notif.audience}{notif.targetEmail ? ` · ${notif.targetEmail}` : ''}
                      </span>
                      <div style={S.footRight}>
                        {status === 'Sent' && <span style={S.statusSent}>✈️ Sent</span>}
                        {status === 'Scheduled' && <span style={S.statusSched}>🕐 Scheduled</span>}
                        {status === 'Draft' && <span style={S.statusDraft}>✏️ Draft</span>}
                        <button style={S.resendBtn} onClick={() => handleResend(notif)}
                          onMouseEnter={e => { e.target.style.borderColor = '#5C59E8'; e.target.style.color = '#5C59E8'; }}
                          onMouseLeave={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.color = 'var(--text-secondary)'; }}
                        >Resend</button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={S.empty}>
                  <div style={{ fontSize: '2.5rem', opacity: 0.4 }}>📭</div>
                  <p style={{ marginTop: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    {search ? 'No results found.' : 'No announcements yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Preview Modal ── */}
        {showPreview && (
          <div style={S.previewOverlay} onClick={() => setShowPreview(false)}>
            <div style={S.previewPhone} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textAlign: 'center', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                📱 Mobile Preview
              </div>
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#5C59E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1rem' }}>🔔</div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>Smart Vaccine System</div>
                    <div style={{ fontSize: '0.6rem', color: '#cbd5e1' }}>now</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.35rem' }}>{title || 'Notification Title'}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: getEditorHTML() || 'Your message will appear here...' }} />
              </div>
              <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                Audience: <strong>{audience}</strong>
              </div>
              <button onClick={() => setShowPreview(false)} style={{ display: 'block', width: '100%', marginTop: '1.25rem', padding: '0.65rem', borderRadius: '10px', border: 'none', background: '#5C59E8', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                Close Preview
              </button>
            </div>
          </div>
        )}

        <style>{`
          [contenteditable=true]:empty:before {
            content: attr(data-placeholder);
            color: var(--text-secondary);
            pointer-events: none;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;
