import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import {
  Users, Baby, Syringe, CalendarCheck, TrendingUp, AlertTriangle,
  Activity, ClipboardList, Bell, ChevronRight, ArrowUpRight,
  ShieldCheck, Clock, Stethoscope
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ── Design Tokens ────────────────────────────────────────────
const C = {
  bg: '#F0F4FF',
  card: '#FFFFFF',
  border: '#E8ECF4',
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  green: '#10B981',
  greenLight: '#D1FAE5',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  red: '#EF4444',
  redLight: '#FEE2E2',
  blue: '#3B82F6',
  blueLight: '#DBEAFE',
  text: '#0F172A',
  muted: '#64748B',
  subtle: '#94A3B8',
};

// ── Sparkline mock data ──────────────────────────────────────
const weeklyData = [
  { day: 'Mon', vaccines: 12, appointments: 8 },
  { day: 'Tue', vaccines: 19, appointments: 14 },
  { day: 'Wed', vaccines: 14, appointments: 11 },
  { day: 'Thu', vaccines: 23, appointments: 17 },
  { day: 'Fri', vaccines: 18, appointments: 13 },
  { day: 'Sat', vaccines: 27, appointments: 21 },
  { day: 'Sun', vaccines: 9, appointments: 6 },
];

// ── Custom Tooltip for chart ─────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '0.75rem 1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 800, color: C.text, fontSize: '0.85rem', marginBottom: '0.35rem' }}>{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color, fontWeight: 700, fontSize: '0.8rem' }}>
            {p.dataKey === 'vaccines' ? '💉 Vaccines: ' : '📅 Appointments: '}{p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── KPI Card ─────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, trend, trendLabel, accent, accentLight, onClick }) => (
  <div onClick={onClick}
    style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '1.5rem', cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'; }}}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={accent} strokeWidth={2.5} />
      </div>
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', background: trend >= 0 ? C.greenLight : C.redLight, borderRadius: '20px' }}>
          <ArrowUpRight size={12} color={trend >= 0 ? C.green : C.red} style={{ transform: trend < 0 ? 'rotate(90deg)' : 'none' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: trend >= 0 ? C.green : C.red }}>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <div>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{label}</p>
      <p style={{ fontSize: '2.25rem', fontWeight: 900, color: C.text, lineHeight: 1 }}>{value ?? '—'}</p>
      {trendLabel && <p style={{ fontSize: '0.75rem', color: C.subtle, marginTop: '0.35rem' }}>{trendLabel}</p>}
    </div>
  </div>
);

// ── Module Quick-Link Card ────────────────────────────────────
const ModuleCard = ({ icon: Icon, label, desc, accent, accentLight, path, navigate }) => (
  <div onClick={() => navigate(path)}
    style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = accentLight; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; e.currentTarget.style.transform = 'translateY(0)'; }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1.5px solid ${accent}20` }}>
      <Icon size={20} color={accent} strokeWidth={2.5} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontWeight: 800, color: C.text, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
      <p style={{ fontSize: '0.75rem', color: C.muted }}>{desc}</p>
    </div>
    <ChevronRight size={16} color={C.subtle} />
  </div>
);

// ── Status Pill ───────────────────────────────────────────────
const Pill = ({ status }) => {
  const map = {
    Completed: { bg: C.greenLight, color: C.green },
    Pending:   { bg: C.amberLight, color: C.amber },
    Missed:    { bg: C.redLight, color: C.red },
    Active:    { bg: C.blueLight, color: C.blue },
  };
  const s = map[status] || map.Pending;
  return (
    <span style={{ padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
const AdminDashboardOverview = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = window.localStorage.getItem('token');
      if (!token) { navigate('/sign-in'); return; }
      try {
        const ur = await fetch('http://localhost:5001/userData', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const ud = await ur.json();
        if (ud.status === 'ok' && ud.data.role === 'ADMIN') {
          setUserData(ud.data);
          const [ar, nr] = await Promise.all([
            fetch('http://localhost:5001/api/admin/analytics').then(r => r.json()),
            fetch('http://localhost:5001/api/admin/notifications').then(r => r.json()),
          ]);
          if (ar.status === 'ok') setAnalytics(ar.data);
          if (nr.status === 'ok') setNotifications(nr.data.slice(0, 4));
        } else navigate('/');
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, [navigate]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 700, color: C.muted }}>Loading Dashboard...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const a = analytics || { totals: {}, rates: {} };

  return (
    <AdminLayout user={userData}>
      <div style={{ background: C.bg, minHeight: '100vh', padding: '2rem 2.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
              {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Good {time.getHours() < 12 ? 'Morning' : time.getHours() < 18 ? 'Afternoon' : 'Evening'}, {userData?.fname?.split(' ')[0] || 'Admin'} 👋
            </h1>
            <p style={{ color: C.muted, marginTop: '0.35rem', fontSize: '0.95rem' }}>
              Here's what's happening at the hospital today.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.green, boxShadow: `0 0 0 3px ${C.greenLight}` }} />
              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: C.muted }}>All Systems Live</span>
            </div>
            <div style={{ padding: '0.6rem 1rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', fontWeight: 800, fontSize: '0.82rem', color: C.text, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', fontVariantNumeric: 'tabular-nums' }}>
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>

        {/* ── KPI Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <KpiCard icon={Users} label="Total Parents" value={a.totals?.parents ?? 0} trend={5.1} trendLabel="vs last month" accent={C.primary} accentLight={C.primaryLight} onClick={() => navigate('/admin-parents')} />
          <KpiCard icon={Baby} label="Registered Children" value={a.totals?.children ?? 0} trend={8.2} trendLabel="New registrations" accent={C.blue} accentLight={C.blueLight} onClick={() => navigate('/admin-children')} />
          <KpiCard icon={ShieldCheck} label="Vaccines Delivered" value={Math.round((a.rates?.vaccineCompletion / 100) * (a.totals?.vaccines || 0)) || 0} trend={12.4} trendLabel="Compliance improving" accent={C.green} accentLight={C.greenLight} onClick={() => navigate('/admin-vaccines')} />
          <KpiCard icon={AlertTriangle} label="Pending Alerts" value={Math.floor((a.totals?.bookings || 0) * 0.05)} trend={-3.1} trendLabel="Down from last week" accent={C.red} accentLight={C.redLight} onClick={() => navigate('/admin-notifications')} />
        </div>

        {/* ── Main Grid (Chart + Modules) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', marginBottom: '1.5rem' }}>

          {/* Area Chart */}
          <div style={{ background: C.card, borderRadius: '18px', border: `1px solid ${C.border}`, padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: C.text }}>Weekly Activity</h3>
                <p style={{ fontSize: '0.8rem', color: C.muted, marginTop: '0.2rem' }}>Vaccines administered vs. appointments</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.muted }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: C.primary, display: 'inline-block' }} />Vaccines
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.muted }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: C.green, display: 'inline-block' }} />Appointments
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.primary} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: C.muted, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="vaccines" stroke={C.primary} strokeWidth={2.5} fill="url(#gv)" dot={{ r: 4, fill: C.primary, strokeWidth: 0 }} activeDot={{ r: 6, fill: C.primary }} />
                <Area type="monotone" dataKey="appointments" stroke={C.green} strokeWidth={2.5} fill="url(#ga)" dot={{ r: 4, fill: C.green, strokeWidth: 0 }} activeDot={{ r: 6, fill: C.green }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Compliance Meters */}
          <div style={{ background: C.card, borderRadius: '18px', border: `1px solid ${C.border}`, padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: C.text }}>Compliance Rates</h3>
              <p style={{ fontSize: '0.8rem', color: C.muted, marginTop: '0.2rem' }}>Real-time hospital performance</p>
            </div>

            {[
              { label: 'Vaccine Compliance', value: a.rates?.vaccineCompletion ?? 0, color: C.green, icon: Syringe },
              { label: 'Appointment Rate', value: a.rates?.bookingCompletion ?? 0, color: C.primary, icon: CalendarCheck },
              { label: 'Child Coverage', value: a.totals?.children && a.totals?.parents ? Math.round((a.totals.children / Math.max(a.totals.parents, 1)) * 100) : 0, color: C.blue, icon: Baby },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <m.icon size={14} color={m.color} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: C.muted }}>{m.label}</span>
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: m.color }}>{m.value}%</span>
                </div>
                <div style={{ height: '8px', background: C.bg, borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(m.value, 100)}%`, background: m.color, borderRadius: '10px', transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '0.5rem', borderTop: `1px solid ${C.border}` }}>
              {[
                { label: 'Consultants', value: a.totals?.consultants ?? 0, icon: Stethoscope, color: C.amber },
                { label: 'Bookings', value: a.totals?.bookings ?? 0, icon: ClipboardList, color: C.blue },
              ].map(s => (
                <div key={s.label} style={{ background: C.bg, borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <s.icon size={16} color={s.color} />
                  <div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: C.text, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: '0.7rem', color: C.muted, fontWeight: 600 }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Row (Quick Modules + Alerts) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>

          {/* Module Quick Access */}
          <div style={{ background: C.card, borderRadius: '18px', border: `1px solid ${C.border}`, padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: C.text, marginBottom: '1.25rem' }}>Quick Access</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { icon: Syringe, label: 'Vaccine Schedules', desc: 'Manage immunization rules', accent: C.primary, accentLight: C.primaryLight, path: '/admin-vaccine-schedules' },
                { icon: ShieldCheck, label: 'Vaccination Registry', desc: 'Update patient status', accent: C.green, accentLight: C.greenLight, path: '/admin-vaccines' },
                { icon: Activity, label: 'Milestone Monitor', desc: 'Track child development', accent: C.blue, accentLight: C.blueLight, path: '/admin-milestones' },
                { icon: TrendingUp, label: 'Growth Management', desc: 'Height & weight records', accent: C.amber, accentLight: C.amberLight, path: '/admin-growth' },
                { icon: Stethoscope, label: 'Consultant Directory', desc: 'Manage specialists', accent: '#8B5CF6', accentLight: '#EDE9FE', path: '/admin-consultants' },
                { icon: CalendarCheck, label: 'Appointment Center', desc: 'Review & approve bookings', accent: '#EC4899', accentLight: '#FCE7F3', path: '/admin-appointments' },
              ].map(m => <ModuleCard key={m.path} {...m} navigate={navigate} />)}
            </div>
          </div>

          {/* Activity Feed */}
          <div style={{ background: C.card, borderRadius: '18px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem 1.75rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Bell size={18} color={C.primary} />
                <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: C.text }}>Recent Alerts</h3>
              </div>
              {notifications.length > 0 && (
                <span style={{ padding: '0.2rem 0.6rem', background: C.redLight, color: C.red, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>{notifications.length} new</span>
              )}
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 2rem', color: C.muted }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <ShieldCheck size={24} color={C.green} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>No active alerts</p>
                  <p style={{ fontSize: '0.8rem', color: C.subtle, marginTop: '0.25rem' }}>All systems are quiet.</p>
                </div>
              ) : notifications.map((n, i) => (
                <div key={n._id || i} style={{ padding: '1.1rem 1.75rem', borderBottom: i < notifications.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', gap: '0.85rem', alignItems: 'flex-start', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.amberLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={16} color={C.amber} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title || 'Notification'}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.3rem' }}>
                      <Pill status={n.type || 'Pending'} />
                      <span style={{ fontSize: '0.72rem', color: C.subtle }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '1rem 1.75rem', borderTop: `1px solid ${C.border}` }}>
              <button onClick={() => navigate('/admin-notifications')}
                style={{ width: '100%', padding: '0.7rem', border: `1.5px solid ${C.border}`, borderRadius: '10px', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = C.primaryLight; e.currentTarget.style.borderColor = C.primary; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = C.border; }}>
                View All Notifications <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardOverview;
