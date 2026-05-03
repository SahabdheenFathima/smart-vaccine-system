import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/templates/MainLayout';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Calendar, 
  Baby, 
  ArrowLeft, 
  RefreshCcw, 
  Syringe, 
  Info, 
  Zap, 
  CheckCircle2, 
  Activity,
  ChevronDown
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

const TIERS = {
  missed: {
    label: 'Action Required',
    priority: 'OVERDUE',
    color: C.red,
    bg: C.redLight,
    border: '#FECACA',
    icon: AlertTriangle,
    description: 'Vaccination date has passed. Immediate clinical action required.',
  },
  urgent: {
    label: 'High Priority',
    priority: 'DUE SOON',
    color: C.amber,
    bg: C.amberLight,
    border: '#FDE68A',
    icon: Zap,
    description: 'Scheduled within 48 hours — please finalize your visit.',
  },
  soft: {
    label: 'Upcoming',
    priority: 'REMINDER',
    color: C.primary,
    bg: C.primaryLight,
    border: '#C7D2FE',
    icon: Bell,
    description: 'Scheduled within 7 days — plan your hospital visit.',
  },
};

function classifyVaccine(vaccine) {
  if (vaccine.got) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = new Date(vaccine.scheduleDate);
  scheduled.setHours(0, 0, 0, 0);
  const diffDays = Math.round((scheduled - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'missed';
  if (diffDays === 0 || diffDays === 1) return 'urgent';
  if (diffDays <= 7) return 'soft';
  return null;
}

const RemindersDashboardPage = () => {
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:5001';

  const [reminders, setReminders] = useState({ missed: [], urgent: [], soft: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem('token');
      if (!token) { navigate('/sign-in'); return; }

      const userRes = await axios.post(`${API_BASE}/userData`, { token });
      if (userRes.data.status !== 'ok') { navigate('/sign-in'); return; }
      const email = userRes.data.data.email;

      const babiesRes = await axios.get(`${API_BASE}/api/user-babies/${email}`);
      if (babiesRes.data.status !== 'ok' || !babiesRes.data.data.length) {
        setLoading(false);
        return;
      }
      const babies = babiesRes.data.data;

      const vaccineArrays = await Promise.all(
        babies.map(b => axios.get(`${API_BASE}/api/vaccines/baby/${b._id}`))
      );

      const classified = { missed: [], urgent: [], soft: [] };
      vaccineArrays.forEach(res => {
        if (res.data.status !== 'ok') return;
        res.data.data.forEach(v => {
          const tier = classifyVaccine(v);
          if (tier) classified[tier].push(v);
        });
      });

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

  const totalAlerts = reminders.missed.length + reminders.urgent.length + reminders.soft.length;

  const visibleReminders = useMemo(() => {
    if (filter === 'all') return [
      ...reminders.missed.map(v => ({ v, tier: 'missed' })),
      ...reminders.urgent.map(v => ({ v, tier: 'urgent' })),
      ...reminders.soft.map(v => ({ v, tier: 'soft' })),
    ];
    return reminders[filter].map(v => ({ v, tier: filter }));
  }, [reminders, filter]);

  if (loading) return (
    <MainLayout>
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 700, color: C.muted }}>Analyzing Immunization Schedule...</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div style={{ background: C.bg, minHeight: '100vh', padding: '2.5rem 2.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* --- Header --- */}
        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <button onClick={() => navigate('/dashbord')} style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'white', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, cursor: 'pointer' }}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-0.025em' }}>Smart Reminders</h1>
                <p style={{ color: C.muted, marginTop: '0.4rem', fontSize: '1rem' }}>AI-powered vaccine escalation and temporal awareness system.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={fetchReminders} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'white', border: `1px solid ${C.border}`, borderRadius: '10px', fontWeight: 700, color: C.text, cursor: 'pointer' }}>
                <RefreshCcw size={18} /> Refresh
              </button>
              <button onClick={() => navigate('/vaccine-table')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: C.primary, border: 'none', borderRadius: '10px', fontWeight: 700, color: 'white', cursor: 'pointer' }}>
                <Calendar size={18} /> Full Schedule
              </button>
            </div>
          </div>

          {/* Stats Summary Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={22} color={C.primary} strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase' }}>Active Alerts</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: C.text, lineHeight: 1 }}>{totalAlerts}</p>
              </div>
            </div>
            {Object.entries(TIERS).map(([key, t]) => (
              <div key={key} style={{ background: t.bg, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <t.icon size={22} color={t.color} strokeWidth={2.5} />
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: t.color, textTransform: 'uppercase' }}>{t.priority}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: t.color, lineHeight: 1 }}>{reminders[key].length}</p>
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* --- Content Area --- */}
        {totalAlerts === 0 ? (
          <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: C.greenLight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: C.green }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.text }}>Immunization Shield Active</h2>
            <p style={{ color: C.muted, marginTop: '0.75rem', fontSize: '1.1rem', maxWidth: '500px', margin: '0.75rem auto 0' }}>No pending or upcoming vaccinations detected for the next 7 days. Your child's immunization profile is currently secure.</p>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', background: 'white', padding: '0.4rem', borderRadius: '14px', border: `1px solid ${C.border}`, width: 'fit-content' }}>
              {[
                { id: 'all', label: 'All Alerts', icon: Activity },
                { id: 'missed', label: 'Overdue', icon: AlertTriangle },
                { id: 'urgent', label: 'Next 48h', icon: Zap },
                { id: 'soft', label: 'Upcoming', icon: Bell },
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', 
                    background: filter === t.id ? C.primary : 'transparent',
                    color: filter === t.id ? 'white' : C.secondary,
                    fontWeight: 750, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <t.icon size={16} strokeWidth={filter === t.id ? 3 : 2} />
                  {t.label}
                  <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', background: filter === t.id ? 'rgba(255,255,255,0.2)' : C.bg, borderRadius: '20px', marginLeft: '0.2rem' }}>
                    {t.id === 'all' ? totalAlerts : reminders[t.id].length}
                  </span>
                </button>
              ))}
            </div>

            {/* Reminders List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {visibleReminders.map(({ v, tier }, idx) => {
                const t = TIERS[tier];
                const scheduled = new Date(v.scheduleDate);
                const today = new Date(); today.setHours(0, 0, 0, 0);
                scheduled.setHours(0, 0, 0, 0);
                const diffDays = Math.round((scheduled - today) / (1000 * 60 * 60 * 24));

                let temporalLabel;
                if (tier === 'missed') temporalLabel = `${Math.abs(diffDays)}d Overdue`;
                else if (diffDays === 0) temporalLabel = 'Due Today';
                else if (diffDays === 1) temporalLabel = 'Due Tomorrow';
                else temporalLabel = `Due in ${diffDays}d`;

                return (
                  <div key={v._id} className="reminder-card" style={{ 
                    background: 'white', borderRadius: '20px', border: `1.5px solid ${t.border}`, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', 
                    boxShadow: `0 4px 12px -2px ${t.color}10`, transition: 'all 0.3s ease', animation: `cardFadeIn 0.4s ease ${idx * 0.05}s both`
                  }}>
                    {/* Visual Pillar */}
                    <div style={{ width: '4px', height: '60px', background: t.color, borderRadius: '4px' }} />
                    
                    {/* Icon & Details */}
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color, flexShrink: 0 }}>
                      <Syringe size={28} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: C.text }}>{v.vaccineName}</h3>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: t.color, background: t.bg, padding: '0.2rem 0.6rem', borderRadius: '6px', letterSpacing: '0.05em' }}>{temporalLabel}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.secondary, fontSize: '0.85rem', fontWeight: 600 }}>
                          <Baby size={16} color={C.muted} /> {v.babyName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.secondary, fontSize: '0.85rem', fontWeight: 600 }}>
                          <Calendar size={16} color={C.muted} /> {scheduled.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Action Meta */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '200px' }}>
                      <p style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 500, lineHeight: 1.4 }}>{t.description}</p>
                      <button onClick={() => navigate('/vaccine-table')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, color: t.color, border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: 'auto' }}>
                        Clinic Details <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* --- System Protocol Footer --- */}
        <footer style={{ marginTop: '4rem', padding: '1.5rem', borderRadius: '16px', background: 'white', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
            <Info size={18} />
          </div>
          <p style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 500 }}>
            <strong style={{ color: C.text }}>Clinical Protocol Insight:</strong> All reminders are calculated from the real-time vaccination schedule. Administrated records are automatically excluded. 
            Overdue thresholds trigger priority SMS alerts to guardians.
          </p>
        </footer>

      </div>
      <style>{`
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reminder-card:hover {
          transform: translateX(6px);
          border-color: ${C.primary}33 !important;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08) !important;
        }
      `}</style>
    </MainLayout>
  );
};

export default RemindersDashboardPage;
