import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/templates/MainLayout';

/* ─────────────────────────────────────────────────────────────────────────
   Tier configuration
───────────────────────────────────────────────────────────────────────── */
const TIERS = {
  missed: {
    label: 'Missed',
    priority: 'CRITICAL',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.35)',
    glow: 'rgba(239,68,68,0.18)',
    icon: '🚨',
    dot: '#ef4444',
    badgeBg: 'rgba(239,68,68,0.15)',
    badgeColor: '#ef4444',
    description: 'Vaccination date has passed. Immediate action required.',
  },
  urgent: {
    label: 'Due Tomorrow',
    priority: 'URGENT',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.35)',
    glow: 'rgba(245,158,11,0.18)',
    icon: '⚡',
    dot: '#f59e0b',
    badgeBg: 'rgba(245,158,11,0.15)',
    badgeColor: '#d97706',
    description: 'Scheduled for tomorrow — arrange visit immediately.',
  },
  soft: {
    label: 'Upcoming',
    priority: 'REMINDER',
    color: '#4F46E5',
    bg: 'rgba(79,70,229,0.08)',
    border: 'rgba(79,70,229,0.25)',
    glow: 'rgba(79,70,229,0.12)',
    icon: '🔔',
    dot: '#4F46E5',
    badgeBg: 'rgba(79,70,229,0.12)',
    badgeColor: '#4F46E5',
    description: 'Scheduled within 7 days — plan ahead.',
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   Pure escalation logic — computes tier based on today
───────────────────────────────────────────────────────────────────────── */
function classifyVaccine(vaccine) {
  if (vaccine.got) return null; // administered — skip
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = new Date(vaccine.scheduleDate);
  scheduled.setHours(0, 0, 0, 0);
  const diffDays = Math.round((scheduled - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'missed';
  if (diffDays === 0 || diffDays === 1) return 'urgent';
  if (diffDays <= 7) return 'soft';
  return null; // outside the 7-day window
}

/* ─────────────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────────────── */
const PulsingDot = ({ color }) => (
  <span style={{ position: 'relative', display: 'inline-flex', width: 12, height: 12, flexShrink: 0 }}>
    <span style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      background: color, opacity: 0.5,
      animation: 'pingDot 1.4s cubic-bezier(0,0,0.2,1) infinite',
    }} />
    <span style={{ position: 'relative', borderRadius: '50%', width: 12, height: 12, background: color }} />
  </span>
);

const SectionHeader = ({ tier, count }) => {
  const t = TIERS[tier];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.875rem',
      marginBottom: '1rem', padding: '0.75rem 1.25rem',
      borderRadius: '1rem', background: t.bg,
      border: `1.5px solid ${t.border}`,
    }}>
      <PulsingDot color={t.dot} />
      <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.color }}>
        {t.priority}
      </span>
      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: t.color }}>
        {t.label}
      </span>
      <span style={{
        marginLeft: 'auto', minWidth: 26, height: 26, borderRadius: '50%',
        background: t.badgeBg, color: t.badgeColor,
        fontSize: '0.8rem', fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{count}</span>
    </div>
  );
};

const ReminderCard = ({ vaccine, tier }) => {
  const t = TIERS[tier];
  const scheduled = new Date(vaccine.scheduleDate);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  scheduled.setHours(0, 0, 0, 0);
  const diffDays = Math.round((scheduled - today) / (1000 * 60 * 60 * 24));

  let daysLabel;
  if (tier === 'missed') daysLabel = `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
  else if (diffDays === 0) daysLabel = 'Due today';
  else if (diffDays === 1) daysLabel = 'Due tomorrow';
  else daysLabel = `Due in ${diffDays} days`;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1.25rem',
      padding: '1.25rem 1.5rem',
      borderRadius: '1.25rem',
      border: `1.5px solid ${t.border}`,
      background: t.bg,
      boxShadow: `0 4px 20px -4px ${t.glow}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
      animation: 'cardIn 0.4s ease both',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 28px -4px ${t.glow}`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 20px -4px ${t.glow}`; }}
    >
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: '12px', flexShrink: 0,
        background: t.badgeBg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1.4rem',
      }}>
        {t.icon}
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
            {vaccine.vaccineName}
          </span>
          <span style={{
            padding: '0.2rem 0.625rem', borderRadius: '2rem',
            background: t.badgeBg, color: t.badgeColor,
            fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>{t.label}</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          <span style={{ fontWeight: 600, color: t.color }}>{daysLabel}</span>
          {' · '}
          {scheduled.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          👶 {vaccine.babyName}
        </div>
      </div>

      {/* Right meta */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {t.priority}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '160px' }}>
          {t.description}
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div style={{
    textAlign: 'center', padding: '4rem 2rem',
    background: 'var(--bg-card)', borderRadius: '1.5rem',
    border: '1.5px solid var(--border-color)',
  }}>
    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>All Clear!</h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
      No upcoming, urgent, or missed vaccines in the next 7 days.
    </p>
  </div>
);

const StatBadge = ({ tier, count }) => {
  if (!count) return null;
  const t = TIERS[tier];
  return (
    <div style={{
      flex: '1 1 120px', padding: '1.5rem', borderRadius: '1.25rem',
      background: t.bg, border: `1.5px solid ${t.border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
      boxShadow: `0 4px 16px -4px ${t.glow}`,
    }}>
      <span style={{ fontSize: '2rem' }}>{t.icon}</span>
      <span style={{ fontSize: '2rem', fontWeight: 900, color: t.color, lineHeight: 1 }}>{count}</span>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: t.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {t.label}
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────────────────── */
const RemindersDashboardPage = () => {
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:5001';

  const [reminders, setReminders] = useState({ missed: [], urgent: [], soft: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | missed | urgent | soft
  const [lastRefreshed, setLastRefreshed] = useState(null);

  /* ── data fetch ─────────────────────────────────────────────────── */
  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem('token');
      if (!token) { navigate('/sign-in'); return; }

      // 1. Resolve user
      const userRes = await axios.post(`${API_BASE}/userData`, { token });
      if (userRes.data.status !== 'ok') { navigate('/sign-in'); return; }
      const email = userRes.data.data.email;

      // 2. Fetch all babies for this user
      const babiesRes = await axios.get(`${API_BASE}/api/user-babies/${email}`);
      if (babiesRes.data.status !== 'ok' || !babiesRes.data.data.length) {
        setLoading(false);
        return;
      }
      const babies = babiesRes.data.data;

      // 3. Fetch vaccines for every baby in parallel
      const vaccineArrays = await Promise.all(
        babies.map(b => axios.get(`${API_BASE}/api/vaccines/baby/${b._id}`))
      );

      // 4. Classify each vaccine
      const classified = { missed: [], urgent: [], soft: [] };
      vaccineArrays.forEach(res => {
        if (res.data.status !== 'ok') return;
        res.data.data.forEach(v => {
          const tier = classifyVaccine(v);
          if (tier) classified[tier].push(v);
        });
      });

      // Sort each tier: missed newest-overdue first; others soonest first
      classified.missed.sort((a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate));
      classified.urgent.sort((a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate));
      classified.soft.sort((a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate));

      setReminders(classified);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Reminders fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate, API_BASE]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  /* ── derived values ──────────────────────────────────────────────── */
  const total = reminders.missed.length + reminders.urgent.length + reminders.soft.length;

  const visibleReminders = (() => {
    if (filter === 'all') return [
      ...reminders.missed.map(v => ({ v, tier: 'missed' })),
      ...reminders.urgent.map(v => ({ v, tier: 'urgent' })),
      ...reminders.soft.map(v => ({ v, tier: 'soft' })),
    ];
    return reminders[filter].map(v => ({ v, tier: filter }));
  })();

  /* ── tabs ────────────────────────────────────────────────────────── */
  const tabs = [
    { key: 'all', label: 'All', count: total },
    { key: 'missed', label: '🚨 Missed', count: reminders.missed.length },
    { key: 'urgent', label: '⚡ Urgent', count: reminders.urgent.length },
    { key: 'soft', label: '🔔 Upcoming', count: reminders.soft.length },
  ];

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <MainLayout>
      <style>{`
        @keyframes pingDot {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, var(--border-color) 25%, var(--bg-card) 50%, var(--border-color) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 1rem;
        }
        .reminder-tab {
          padding: 0.5rem 1.25rem;
          border-radius: 2rem;
          border: 1.5px solid var(--border-color);
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s;
        }
        .reminder-tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(79,70,229,0.3);
        }
        .reminder-tab:not(.active):hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(79,70,229,0.06);
        }
      `}</style>

      <div className="container-full py-8 animate-slide" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>

        {/* ── Page Header ─────────────────────────────────── */}
        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-back" onClick={() => navigate('/dashbord')}>
              <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
                <h1 className="text-huge">Smart Reminders</h1>
                {total > 0 && (
                  <span style={{
                    padding: '0.35rem 0.875rem', borderRadius: '2rem',
                    background: reminders.missed.length ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                    color: reminders.missed.length ? '#ef4444' : '#d97706',
                    fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {total} Active Alert{total !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-muted mt-1">
                Multi-level vaccination reminder dashboard · Auto-classified escalation system
              </p>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
              {lastRefreshed && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Updated {lastRefreshed.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={fetchReminders}
                disabled={loading}
                style={{
                  padding: '0.6rem 1.25rem', borderRadius: '0.75rem',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-card)', cursor: loading ? 'not-allowed' : 'pointer',
                  color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  opacity: loading ? 0.5 : 1, transition: 'all 0.2s',
                }}
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => navigate('/vaccine-table')}
                style={{
                  padding: '0.6rem 1.25rem', borderRadius: '0.75rem',
                  border: 'none', background: 'var(--primary)',
                  color: 'white', fontSize: '0.8rem', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}
              >
                💉 Full Schedule
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          /* ── Skeleton Loader ──────────────────────────── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 96 }} />
            ))}
          </div>
        ) : total === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* ── Summary Stats ──────────────────────────── */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <StatBadge tier="missed" count={reminders.missed.length} />
              <StatBadge tier="urgent" count={reminders.urgent.length} />
              <StatBadge tier="soft" count={reminders.soft.length} />
            </div>

            {/* ── Escalation Legend ──────────────────────── */}
            <div style={{
              padding: '1rem 1.5rem', borderRadius: '1.25rem',
              background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
              marginBottom: '2rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Escalation Policy (FR8 — Smart Reminder System)
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[
                  { icon: '🚨', label: 'Missed', desc: 'Past scheduled date, not administered', color: '#ef4444' },
                  { icon: '⚡', label: 'T-1 Day', desc: 'Scheduled within 24 hours', color: '#d97706' },
                  { icon: '🔔', label: 'T-7 Days', desc: 'Scheduled within 7 days', color: '#4F46E5' },
                ].map(({ icon, label, desc, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <span>{icon}</span>
                    <span style={{ fontWeight: 800, color }}>{label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>— {desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Filter Tabs ────────────────────────────── */}
            <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`reminder-tab${filter === t.key ? ' active' : ''}`}
                >
                  {t.label}
                  <span style={{
                    background: filter === t.key ? 'rgba(255,255,255,0.25)' : 'var(--primary-glow)',
                    color: filter === t.key ? 'white' : 'var(--primary)',
                    borderRadius: '2rem', padding: '0.1rem 0.5rem',
                    fontSize: '0.7rem', fontWeight: 900,
                  }}>{t.count}</span>
                </button>
              ))}
            </div>

            {/* ── Grouped / Flat List ───────────────────── */}
            {filter === 'all' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {(['missed', 'urgent', 'soft']).map(tier => {
                  const items = reminders[tier];
                  if (!items.length) return null;
                  return (
                    <section key={tier}>
                      <SectionHeader tier={tier} count={items.length} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {items.map(v => <ReminderCard key={v._id} vaccine={v} tier={tier} />)}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div>
                {visibleReminders.length > 0 ? (
                  <>
                    <SectionHeader tier={filter} count={visibleReminders.length} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {visibleReminders.map(({ v, tier }) => <ReminderCard key={v._id} vaccine={v} tier={tier} />)}
                    </div>
                  </>
                ) : (
                  <EmptyState />
                )}
              </div>
            )}

            {/* ── Compliance footnote ───────────────────── */}
            <div style={{
              marginTop: '3rem', padding: '1rem 1.5rem', borderRadius: '1rem',
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              fontSize: '0.78rem', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
            }}>
              <span>🛡️</span>
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>Smart Reminder Engine v2</strong>
                {' '}— All reminders are computed in real-time from the live vaccination schedule.
                Vaccines marked as administered are automatically excluded. Thresholds: Missed &lt; 0d · Urgent ≤ 1d · Soft ≤ 7d.
              </span>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default RemindersDashboardPage;
