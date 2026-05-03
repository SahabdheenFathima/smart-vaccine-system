import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import toast from 'react-hot-toast';
import { Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  LineElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from "chart.js";
import { 
  Stethoscope, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  MoreVertical, 
  FileText, 
  Activity, 
  TrendingUp, 
  ClipboardList, 
  Pill, 
  Zap, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  LayoutDashboard,
  UserCheck,
  History,
  Timer,
  Info,
  ChevronLeft,
  X,
  Save,
  Send,
  Eye,
  Tag,
  ArrowUpRight,
  Database,
  Menu,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

// --- Design Tokens ---
const C = {
  bg: '#F1F5FF',
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
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  blue: '#3B82F6',
  blueLight: '#DBEAFE',
  sidebar: '#0F172A',
};

// ── Shared Stat Card ──────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <div style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'relative' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      {trend && (
        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: trend > 0 ? C.green : C.red, background: trend > 0 ? C.greenLight : C.redLight, padding: '0.25rem 0.75rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          {trend > 0 ? '+' : ''}{trend}% <TrendingUp size={12} />
        </span>
      )}
    </div>
    <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</h3>
    <div style={{ fontSize: '2.25rem', fontWeight: 950, color: C.text, marginTop: '0.25rem', letterSpacing: '-0.02em' }}>{value}</div>
    <p style={{ fontSize: '0.85rem', color: C.muted, marginTop: '0.5rem', fontWeight: 600 }}>{subtitle}</p>
  </div>
);

// ── Overview Module ───────────────────────────────────────────
const OverviewModule = ({ pendingAppointments, stats, onCallNext }) => (
  <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
      <StatCard title="Active Consultations" value={stats.total} subtitle="Today's total bookings" icon={Users} color={C.primary} trend={14} />
      <StatCard title="Awaiting Review" value={stats.pending} subtitle="In clinical queue" icon={Timer} color={C.amber} />
      <StatCard title="Finalized Today" value={stats.completed} subtitle="Sessions archived" icon={CheckCircle2} color={C.green} />
      <StatCard title="Priority Critical" value={stats.urgent} subtitle="Urgent medical review" icon={AlertCircle} color={C.red} />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.25rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 950, color: C.text, letterSpacing: '-0.01em' }}>Immediate Schedule</h3>
          <button style={{ color: C.primary, fontSize: '0.85rem', fontWeight: 850, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Full Directory <ArrowUpRight size={16} />
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Time Slot</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Patient Profile</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.65rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {pendingAppointments.slice(0, 5).map((app, idx) => (
              <tr key={app._id} style={{ borderBottom: `1px solid ${C.border}`, background: idx % 2 === 0 ? 'transparent' : C.bg + '44' }}>
                <td style={{ padding: '1.25rem 1rem', fontWeight: 850, color: C.text, fontSize: '0.9rem' }}>{app.time_slot || '10:00 AM'}</td>
                <td style={{ padding: '1.25rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: C.primary }}>{app.child_id?.babyName?.charAt(0)}</div>
                    <span style={{ fontWeight: 800, color: C.text }}>{app.child_id?.babyName}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                  <span style={{ padding: '0.4rem 0.8rem', background: app.priority_level === 'Urgent' ? C.redLight : C.blueLight, color: app.priority_level === 'Urgent' ? C.red : C.blue, borderRadius: '20px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    {app.priority_level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: C.primary, borderRadius: '24px', padding: '2.5rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: `0 15px 35px ${C.primary}44` }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Activity size={22} /> Token Monitor</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '1.5rem', borderRadius: '20px' }}>
              <p style={{ opacity: 0.8, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Now Serving</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 950 }}>#{pendingAppointments[0]?.token_no || 'N/A'}</h2>
            </div>
            <button 
              onClick={onCallNext}
              style={{ background: 'white', color: C.primary, border: 'none', padding: '1rem', borderRadius: '16px', fontWeight: 950, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1rem' }}
            >
              Examine Next <ChevronRight size={20} />
            </button>
          </div>
          <Database size={200} style={{ position: 'absolute', right: '-20%', bottom: '-20%', opacity: 0.05 }} />
        </div>
      </div>
    </div>
  </div>
);

// --- Clinical Note Drawer ---
const ClinicalNoteDrawer = ({ isOpen, onClose, appointmentData, onSave }) => {
  const [template, setTemplate] = useState('');
  const child = appointmentData?.child_id || {};
  const [saving, setSaving] = useState(false);
  
  const [noteData, setNoteData] = useState({
    subjective: '',
    objective: { weight: child.weight || '', height: child.height || '', temperature: '', pulse: '', oxygenSaturation: '', additionalNotes: '' },
    assessment: '',
    plan: { medicines: '', labTests: '', advice: '', followUpDate: '' },
    tags: '',
    visibility: 'summary_parent'
  });

  const handleSave = async (status) => {
    setSaving(true);
    try {
      const payload = {
        childId: appointmentData.child_id?._id,
        appointmentId: appointmentData._id,
        consultantId: appointmentData.consultant_id?._id,
        subjective: noteData.subjective,
        objective: noteData.objective,
        assessment: noteData.assessment,
        plan: {
          medicines: noteData.plan.medicines.split(',').map(s=>s.trim()).filter(Boolean),
          labTests: noteData.plan.labTests.split(',').map(s=>s.trim()).filter(Boolean),
          advice: noteData.plan.advice,
          followUpDate: noteData.plan.followUpDate || null
        },
        tags: noteData.tags.split(',').map(s=>s.trim()).filter(Boolean),
        visibility: noteData.visibility,
        status: status
      };

      const res = await fetch('http://localhost:5001/api/clinical-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'ok') {
        toast.success(`Session ${status === 'Final' ? 'Archived' : 'Saved as Draft'}`);
        if (status === 'Final') onSave(appointmentData._id, 'Completed');
        if (status === 'Final') onClose();
      }
    } catch (e) { toast.error("Synchronization failure"); }
    finally { setSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(6px)', zIndex: 1000 }} onClick={onClose} />
      <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '680px', height: '100vh', background: 'white', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '-25px 0 60px rgba(0,0,0,0.15)', animation: 'slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div style={{ padding: '2.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.bg }}>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 950, color: C.text, letterSpacing: '-0.03em' }}>Clinical Assessment</h3>
            <p style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 700, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={16} /> Patient: {child?.babyName} · Ref: {appointmentData?.token_no}
            </p>
          </div>
          <button onClick={onClose} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'white', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = C.muted}><X size={22} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>SOAP Protocol: Subjective</h4>
            <textarea 
                rows="4" placeholder="Report clinical findings and parental observations..." value={noteData.subjective} onChange={e => setNoteData({...noteData, subjective: e.target.value})}
                style={{ width: '100%', padding: '1.5rem', borderRadius: '18px', border: `1.5px solid ${C.border}`, background: C.bg, fontSize: '0.95rem', fontWeight: 600, outline: 'none', resize: 'none' }}
            />
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>SOAP Protocol: Objective</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {['weight', 'height', 'temperature', 'pulse'].map(field => (
                <div key={field}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 900, color: C.secondary, marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase' }}>{field}</label>
                    <input 
                        type="text" value={noteData.objective[field]} onChange={e => setNoteData({...noteData, objective: {...noteData.objective, [field]: e.target.value}})}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '1rem', fontWeight: 800, outline: 'none' }}
                    />
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Clinical Assessment & Plan</h4>
            <input 
                type="text" placeholder="Primary Diagnosis / Impression..." value={noteData.assessment} onChange={e => setNoteData({...noteData, assessment: e.target.value})}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '1rem', fontWeight: 800, outline: 'none', marginBottom: '1.5rem' }}
            />
            <textarea 
                rows="3" placeholder="Care directives, follow-up advice, and prescriptions..." value={noteData.plan.advice} onChange={e => setNoteData({...noteData, plan: {...noteData.plan, advice: e.target.value}})}
                style={{ width: '100%', padding: '1.5rem', borderRadius: '18px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.95rem', fontWeight: 600, outline: 'none', resize: 'none' }}
            />
          </section>
        </div>

        <div style={{ padding: '2.5rem', borderTop: `1px solid ${C.border}`, display: 'flex', gap: '1.5rem', background: 'white' }}>
          <button 
            onClick={() => handleSave('Draft')} disabled={saving}
            style={{ flex: 1, padding: '1.1rem', borderRadius: '18px', border: `2px solid ${C.border}`, background: 'white', color: C.secondary, fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
          >
            <Save size={22} /> Save Draft
          </button>
          <button 
            onClick={() => handleSave('Final')} disabled={saving}
            style={{ flex: 2, padding: '1.1rem', borderRadius: '18px', border: 'none', background: C.primary, color: 'white', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: `0 8px 25px ${C.primary}44` }}
          >
            <Send size={22} /> Archive Session
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
};

// --- Clinical Profile Module ---
const ClinicalProfileModule = ({ appointmentData, updateAppointmentStatus }) => {
  const childData = appointmentData?.child_id;
  const [growthData, setGrowthData] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!childData?._id) return;
    setLoading(true);
    try {
      const [growthRes, vacRes, noteRes] = await Promise.all([
        fetch(`http://localhost:5001/api/growth/baby/${childData._id}`),
        fetch(`http://localhost:5001/api/vaccines/baby/${childData._id}`),
        fetch(`http://localhost:5001/api/clinical-notes/${childData._id}`)
      ]);
      const gData = await growthRes.json();
      const vData = await vacRes.json();
      const nData = await noteRes.json();
      
      if (gData.status === 'ok') setGrowthData(gData.data);
      if (vData.status === 'ok') setVaccines(vData.data);
      if (nData.status === 'ok') setNotes(nData.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [childData?._id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!childData) return (
    <div style={{ height: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '32px', border: `1px solid ${C.border}`, textAlign: 'center', padding: '3rem' }}>
      <div>
        <div style={{ width: '100px', height: '100px', background: C.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', color: C.muted }}><Stethoscope size={50} /></div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 950, color: C.text, letterSpacing: '-0.02em' }}>Initialize Patient Examination</h2>
        <p style={{ color: C.muted, marginTop: '1rem', fontSize: '1.15rem', maxWidth: '500px' }}>Select a patient from the session directory to load their longitudinal clinical record.</p>
      </div>
    </div>
  );

  const age = childData.birthDate ? new Date().getFullYear() - new Date(childData.birthDate).getFullYear() : 'N/A';

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '2.5rem', borderRadius: '32px', border: `1px solid ${C.border}`, marginBottom: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', fontWeight: 950, color: C.primary }}>{childData.babyName?.charAt(0)}</div>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 950, color: C.text, letterSpacing: '-0.03em' }}>{childData.babyName}</h2>
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: C.secondary, background: C.bg, padding: '0.3rem 1rem', borderRadius: '10px' }}>{age} YEARS OLD</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: C.secondary, background: C.bg, padding: '0.3rem 1rem', borderRadius: '10px' }}>FILE: #{childData._id?.slice(-8).toUpperCase()}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setIsDrawerOpen(true)} style={{ padding: '1rem 2rem', background: C.primary, color: 'white', border: 'none', borderRadius: '18px', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: `0 10px 25px ${C.primary}33` }}>
          <Zap size={20} /> Finalize Session
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: C.text, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Activity size={22} color={C.primary} /> Clinical Vitals</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[ { label: 'Current Weight', val: childData.weight, unit: 'kg' }, { label: 'Length/Height', val: childData.height, unit: 'cm' }, { label: 'Head Cir.', val: childData.headCircumference, unit: 'cm' }, { label: 'Blood Group', val: childData.bloodGroup || 'A+', unit: '' } ].map(v => (
              <div key={v.label} style={{ background: C.bg, padding: '1.5rem', borderRadius: '24px', border: `1.5px solid ${C.border}` }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>{v.label}</p>
                <div style={{ fontSize: '1.75rem', fontWeight: 950, color: C.text }}>{v.val || '--'} <span style={{ fontSize: '0.9rem', color: C.muted, fontWeight: 700 }}>{v.unit}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', border: `1px solid ${C.border}`, maxHeight: '450px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: C.text, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><ShieldCheck size={22} color={C.green} /> Immunization Log</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {vaccines.map(v => (
              <div key={v._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: C.bg, borderRadius: '20px', border: `1px solid ${C.border}` }}>
                <div>
                    <p style={{ fontWeight: 900, color: C.text, fontSize: '1rem' }}>{v.vaccineName}</p>
                    <p style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700, marginTop: '0.2rem' }}>{new Date(v.scheduleDate).toLocaleDateString()}</p>
                </div>
                <span style={{ padding: '0.4rem 1rem', background: v.got ? C.greenLight : C.amberLight, color: v.got ? C.green : C.amber, borderRadius: '14px', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase' }}>{v.got ? 'Archived' : 'Awaiting'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ClinicalNoteDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} appointmentData={appointmentData} onSave={(appId, status) => { updateAppointmentStatus(appId, status); setIsDrawerOpen(false); }} />
    </div>
  );
};

// --- Appointments Module ---
const AppointmentsModule = ({ pendingAppointments, onExamine, updateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = pendingAppointments.filter(app => {
    const matchSearch = app.child_id?.babyName?.toLowerCase().includes(searchTerm.toLowerCase()) || app.token_no?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    return activeFilter === 'All' || app.status === activeFilter;
  });

  return (
    <div style={{ background: 'white', borderRadius: '32px', border: `1px solid ${C.border}`, padding: '3rem', boxShadow: '0 4px 25px rgba(0,0,0,0.02)', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: C.text, letterSpacing: '-0.02em' }}>Session Directory</h3>
        <div style={{ position: 'relative', width: '380px' }}>
          <Search size={20} color={C.muted} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" placeholder="Search by clinical token or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '1rem 1rem 1rem 3.25rem', borderRadius: '18px', border: `2px solid ${C.border}`, background: C.bg, fontSize: '0.95rem', fontWeight: 700, outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem' }}>
        {['All', 'Pending', 'Approved', 'Completed'].map(f => (
          <button 
            key={f} onClick={() => setActiveFilter(f)} 
            style={{ padding: '0.65rem 1.5rem', borderRadius: '14px', border: activeFilter === f ? 'none' : `1px solid ${C.border}`, background: activeFilter === f ? C.primary : 'white', color: activeFilter === f ? 'white' : C.secondary, fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {f}
          </button>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
            <th style={{ padding: '1.5rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 950, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Token ID</th>
            <th style={{ padding: '1.5rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 950, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Patient Record</th>
            <th style={{ padding: '1.5rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 950, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Protocol Time</th>
            <th style={{ padding: '1.5rem 1rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 950, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
            <th style={{ padding: '1.5rem 1rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 950, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((app, idx) => (
            <tr key={app._id} style={{ borderBottom: `1px solid ${C.border}`, background: idx % 2 === 0 ? 'white' : C.bg + '44' }}>
              <td style={{ padding: '1.75rem 1rem', fontWeight: 950, color: C.primary, fontSize: '1.2rem' }}>#{app.token_no}</td>
              <td style={{ padding: '1.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: C.primaryLight, color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950 }}>{app.child_id?.babyName?.charAt(0)}</div>
                  <div>
                    <p style={{ fontWeight: 900, color: C.text, fontSize: '1.05rem' }}>{app.child_id?.babyName}</p>
                    <p style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>ID: {app.child_id?._id?.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
              </td>
              <td style={{ padding: '1.75rem 1rem', color: C.secondary, fontWeight: 800, fontSize: '0.95rem' }}>{app.time_slot}</td>
              <td style={{ padding: '1.75rem 1rem', textAlign: 'center' }}>
                <span style={{ padding: '0.5rem 1rem', background: app.status === 'Completed' ? C.greenLight : app.status === 'Pending' ? C.amberLight : C.blueLight, color: app.status === 'Completed' ? C.green : app.status === 'Pending' ? C.amber : C.blue, borderRadius: '24px', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase' }}>{app.status}</span>
              </td>
              <td style={{ padding: '1.75rem 1rem', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => onExamine(app)} style={{ background: 'white', border: `2px solid ${C.primary}`, color: C.primary, padding: '0.65rem 1.5rem', borderRadius: '14px', fontWeight: 950, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.color = 'white'; }} onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = C.primary; }}>Examine</button>
                  {app.status === 'Pending' && <button onClick={() => updateStatus(app._id, 'Approved')} style={{ background: C.green, border: 'none', color: 'white', padding: '0.65rem 1.5rem', borderRadius: '14px', fontWeight: 950, fontSize: '0.85rem', cursor: 'pointer', boxShadow: `0 4px 12px ${C.green}44` }}>Approve</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Main Dashboard Component ---
const ConsultantDashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleExamine = (childData) => { setSelectedProfile(childData); setActiveTab('profile'); };

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/bookings`);
      const data = await response.json();
      if (data.status === "ok") {
        setPendingAppointments(data.data.filter(app => app.consultant_id?._id === userData?._id));
      }
    } catch (error) { console.error(error); }
  }, [userData?._id]);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (!token) { navigate("/sign-in"); return; }
    const init = async () => {
      try {
        const response = await fetch("http://localhost:5001/userData", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (data.status === "ok" && data.data.role === 'CONSULTANT') {
          setUserData(data.data);
        } else { navigate("/"); }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    init();
  }, [navigate]);

  useEffect(() => { if (userData) fetchAppointments(); }, [userData, fetchAppointments]);

  const updateStatus = async (id, status) => {
    try {
        const res = await fetch(`http://localhost:5001/api/bookings/${id}/status`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data.status === 'ok') { toast.success(`Status: ${status}`); fetchAppointments(); }
    } catch (e) { toast.error("Update failure"); }
  };

  const stats = useMemo(() => ({
    total: pendingAppointments.length,
    pending: pendingAppointments.filter(a => a.status === 'Pending').length,
    completed: pendingAppointments.filter(a => a.status === 'Completed').length,
    urgent: pendingAppointments.filter(a => a.priority_level === 'Urgent').length,
  }), [pendingAppointments]);

  const sidebarW = collapsed ? '72px' : '260px';

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ width: '40px', height: '40px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ── Sidebar (Admin Style) ── */}
      <aside style={{
        width: sidebarW, minWidth: sidebarW, background: C.sidebar, display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100, transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden',
      }}>
        <div style={{ padding: collapsed ? '1.25rem 0' : '1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)', justifyContent: collapsed ? 'center' : 'space-between', minHeight: '70px' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={18} color="white" strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', lineHeight: 1.2 }}>SmartCare</p>
                <p style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Clinical Staff</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="white" strokeWidth={2.5} />
            </div>
          )}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748B', cursor: 'pointer', borderRadius: '7px', padding: '0.35rem', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}>
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Expand button (collapsed mode) */}
        {collapsed && (
          <div style={{ padding: '0.75rem 0', display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={() => setCollapsed(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748B', cursor: 'pointer', borderRadius: '7px', padding: '0.4rem', display: 'flex' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        <nav style={{ flex: 1, padding: collapsed ? '1rem 0' : '1rem 0.75rem' }}>
          {!collapsed && <p style={{ fontSize: '0.62rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0.6rem 0.75rem 0.5rem' }}>Navigation</p>}
          {[ { id: 'overview', label: 'Clinical Hub', icon: LayoutDashboard },
             { id: 'appointments', label: 'Session Registry', icon: ClipboardList },
             { id: 'profile', label: 'Active Exam', icon: Stethoscope } ].map(tab => (
            <button 
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '0.75rem', padding: collapsed ? '0.7rem 0' : '0.625rem 0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: collapsed ? 0 : '9px', marginBottom: '4px', border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(90deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))' : 'transparent',
                color: activeTab === tab.id ? '#A5B4FC' : '#94A3B8', fontWeight: activeTab === tab.id ? 800 : 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s ease',
                borderLeft: activeTab === tab.id && !collapsed ? '2px solid #6366F1' : '2px solid transparent',
              }}
            >
              <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              {!collapsed && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: collapsed ? '1rem 0' : '1rem 0.75rem' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.6rem 0.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.9rem' }}>{userData?.name?.charAt(0)}</div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#E2E8F0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Dr. {userData?.name}</p>
                <p style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 700 }}>Staff ID: {userData?._id?.slice(-5).toUpperCase()}</p>
              </div>
            </div>
          )}
          <button onClick={() => { window.localStorage.clear(); navigate('/sign-in'); }} style={{ width: '100%', padding: '0.65rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '9px', color: '#F87171', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <LogOut size={16} strokeWidth={2.5} /> {!collapsed && <span>End Session</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Body ── */}
      <main style={{ flex: 1, marginLeft: sidebarW, transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)', minWidth: 0 }}>
        {/* Header (Admin Style) */}
        <header style={{ height: '70px', background: 'white', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2.5rem', position: 'sticky', top: 0, zIndex: 90 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.secondary, display: 'flex' }}><Menu size={22} /></button>
            <div style={{ position: 'relative' }}>
              <Search size={16} color={C.muted} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search session records..." style={{ padding: '0.55rem 1rem 0.55rem 2.25rem', border: `1.5px solid ${C.border}`, borderRadius: '10px', fontSize: '0.85rem', color: C.text, width: '300px', background: C.bg + '44' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ position: 'relative', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '10px', padding: '0.5rem', color: C.secondary, cursor: 'pointer' }}><Bell size={18} /><span style={{ position: 'absolute', top: '-3px', right: '-3px', width: '9px', height: '9px', background: C.red, borderRadius: '50%', border: '2px solid white' }} /></button>
            <div style={{ width: '1px', height: '24px', background: C.border }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg + '44' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>{userData?.name?.charAt(0)}</div>
              <p style={{ fontWeight: 800, fontSize: '0.8rem', color: C.text }}>{userData?.name?.split(' ')[0]}</p>
            </div>
          </div>
        </header>

        {/* Dynamic Body */}
        <div style={{ padding: '2.5rem 3rem' }}>
          {activeTab === 'overview' && <OverviewModule pendingAppointments={pendingAppointments} stats={stats} onCallNext={() => setActiveTab('appointments')} />}
          {activeTab === 'appointments' && <AppointmentsModule pendingAppointments={pendingAppointments} onExamine={handleExamine} updateStatus={updateStatus} />}
          {activeTab === 'profile' && <ClinicalProfileModule appointmentData={selectedProfile} updateAppointmentStatus={updateStatus} />}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ConsultantDashboardPage;
