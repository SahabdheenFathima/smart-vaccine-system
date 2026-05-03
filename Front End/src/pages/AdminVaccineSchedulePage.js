import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';
import { 
  Syringe, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Clock, 
  Calendar, 
  Info, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  ShieldCheck, 
  Activity,
  Shield,
  FileText,
  Settings,
  Download,
  Database,
  ArrowUpRight,
  Play,
  Pause
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

const PRIORITY_THEMES = {
  Critical: { bg: C.redLight, color: C.red, icon: AlertCircle },
  High:     { bg: C.amberLight, color: C.amber, icon: Info },
  Medium:   { bg: C.blueLight, color: C.blue, icon: Activity },
  Low:      { bg: '#F1F5F9', color: C.secondary, icon: Settings },
};

const EMPTY_FORM = {
  vaccineName: '',
  vaccineCode: '',
  doseOrder: 1,
  recommendedAgeLabel: '',
  description: '',
  priorityLevel: 'Medium',
  status: 'Active',
  notes: '',
  scheduleType: 'days',
  scheduleValue: '',
};

const AdminVaccineSchedulePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Auth guard
  useEffect(() => {
    const init = async () => {
      const token = window.localStorage.getItem('token');
      if (!token) { navigate('/sign-in'); return; }
      try {
        const r = await fetch('http://localhost:5001/userData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const d = await r.json();
        if (d.status === 'ok' && d.data.role === 'ADMIN') {
          setUserData(d.data);
          fetchRules();
        } else navigate('/');
      } catch (e) { console.error(e); }
    };
    init();
  }, [navigate]);

  const fetchRules = async () => {
    try {
      const r = await fetch('http://localhost:5001/api/vaccine-schedules?status=all');
      const d = await r.json();
      if (d.status === 'ok') setRules(d.data);
    } catch (e) {
      toast.error('Failed to load schedule rules');
    } finally {
      setLoading(false);
    }
  };

  const buildPayload = () => {
    const payload = {
      ...form,
      doseOrder: Number(form.doseOrder),
      daysAfterBirth:   null,
      weeksAfterBirth:  null,
      monthsAfterBirth: null,
      yearsAfterBirth:  null,
    };
    const val = Number(form.scheduleValue);
    if (form.scheduleType === 'days')   payload.daysAfterBirth   = val;
    if (form.scheduleType === 'weeks')  payload.weeksAfterBirth  = val;
    if (form.scheduleType === 'months') payload.monthsAfterBirth = val;
    if (form.scheduleType === 'years')  payload.yearsAfterBirth  = val;
    return payload;
  };

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    let scheduleType = 'days';
    let scheduleValue = 0;
    if (rule.daysAfterBirth   != null) { scheduleType = 'days';   scheduleValue = rule.daysAfterBirth; }
    else if (rule.weeksAfterBirth  != null) { scheduleType = 'weeks';  scheduleValue = rule.weeksAfterBirth; }
    else if (rule.monthsAfterBirth != null) { scheduleType = 'months'; scheduleValue = rule.monthsAfterBirth; }
    else if (rule.yearsAfterBirth  != null) { scheduleType = 'years';  scheduleValue = rule.yearsAfterBirth; }

    setForm({
      ...rule,
      scheduleType,
      scheduleValue,
    });
    setIsEditing(true);
    setEditId(rule._id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url    = isEditing ? `http://localhost:5001/api/vaccine-schedules/${editId}` : 'http://localhost:5001/api/vaccine-schedules';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const d = await r.json();
      if (d.status === 'ok') {
        toast.success(isEditing ? 'Schedule rule updated!' : 'New schedule rule added!');
        setIsModalOpen(false);
        fetchRules();
      } else {
        toast.error(d.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (rule) => {
    try {
      const r = await fetch(`http://localhost:5001/api/vaccine-schedules/${rule._id}/toggle-status`, { method: 'POST' });
      const d = await r.json();
      if (d.status === 'ok') {
        toast.success(`"${rule.vaccineName}" is now ${d.data.status}`);
        fetchRules();
      }
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (rule) => {
    if (!window.confirm(`⚠️ Permanently delete "${rule.vaccineName}"?`)) return;
    try {
      const r = await fetch(`http://localhost:5001/api/vaccine-schedules/${rule._id}`, { method: 'DELETE' });
      const d = await r.json();
      if (d.status === 'ok') {
        toast.success('Rule permanently deleted');
        fetchRules();
      }
    } catch { toast.error('Failed to delete rule'); }
  };

  // --- Filtering & Pagination ---
  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      const matchSearch = r.vaccineName.toLowerCase().includes(search.toLowerCase()) ||
                          r.vaccineCode.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' ? true : r.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [rules, search, filterStatus]);

  const totalPages = Math.ceil(filteredRules.length / itemsPerPage);
  const paginatedRules = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRules.slice(start, start + itemsPerPage);
  }, [filteredRules, currentPage, itemsPerPage]);

  const stats = useMemo(() => [
    { label: 'Total Rules', value: rules.length, icon: Database, color: C.primary, bg: C.primaryLight },
    { label: 'Active Schedules', value: rules.filter(r => r.status === 'Active').length, icon: ShieldCheck, color: C.green, bg: C.greenLight },
    { label: 'Critical Path', value: rules.filter(r => r.priorityLevel === 'Critical').length, icon: AlertCircle, color: C.red, bg: C.redLight },
    { label: 'Avg. Dose Rank', value: (rules.reduce((acc,r) => acc + r.doseOrder, 0) / rules.length || 0).toFixed(1), icon: Activity, color: C.blue, bg: C.blueLight },
  ], [rules]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 700, color: C.muted }}>Syncing Schedule Engine...</p>
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
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-0.025em' }}>Vaccine Schedule Management</h1>
              <p style={{ color: C.muted, marginTop: '0.4rem', fontSize: '1rem' }}>Database-driven immunization rules engine with real-time propagation.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'white', border: `1px solid ${C.border}`, borderRadius: '10px', fontWeight: 700, color: C.text, cursor: 'pointer' }}>
                <Download size={18} /> Export Rules
              </button>
              <button onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: C.primary, border: 'none', borderRadius: '10px', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                <Plus size={18} strokeWidth={3} /> New Schedule
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

        {/* --- Filters & Search --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', background: 'white', padding: '0.35rem', borderRadius: '12px', border: `1px solid ${C.border}` }}>
            {['all', 'Active', 'Inactive'].map(t => (
              <button 
                key={t}
                onClick={() => { setFilterStatus(t); setCurrentPage(1); }}
                style={{ 
                  padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', 
                  background: filterStatus === t ? C.primaryLight : 'transparent',
                  color: filterStatus === t ? C.primary : C.muted,
                  fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s',
                  textTransform: 'capitalize'
                }}
              >
                {t === 'all' ? 'All Rules' : t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '500px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search vaccine name or code..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.75rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>
            <select 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{ padding: '0.7rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.85rem', fontWeight: 600, color: C.text, outline: 'none' }}
            >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* --- Data Table --- */}
        <div style={{ background: 'white', borderRadius: '20px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vaccine Details</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Code</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Dose Rank</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Schedule Rule</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Priority</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {paginatedRules.length > 0 ? paginatedRules.map(rule => {
                const isActive = rule.status === 'Active';
                const theme = PRIORITY_THEMES[rule.priorityLevel] || PRIORITY_THEMES.Medium;
                
                let scheduleDisplay = '—';
                if (rule.daysAfterBirth != null) scheduleDisplay = `${rule.daysAfterBirth} days`;
                else if (rule.weeksAfterBirth != null) scheduleDisplay = `${rule.weeksAfterBirth} weeks`;
                else if (rule.monthsAfterBirth != null) scheduleDisplay = `${rule.monthsAfterBirth} months`;
                else if (rule.yearsAfterBirth != null) scheduleDisplay = `${rule.yearsAfterBirth} years`;

                return (
                  <tr key={rule._id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.2s', opacity: isActive ? 1 : 0.6 }} onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>
                          <Syringe size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, color: C.text, fontSize: '0.9rem' }}>{rule.vaccineName}</p>
                          <p style={{ fontSize: '0.7rem', color: C.muted }}>{rule.recommendedAgeLabel || 'Age label not set'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <code style={{ padding: '0.25rem 0.6rem', background: '#F1F5F9', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: C.secondary }}>{rule.vaccineCode}</code>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ fontWeight: 800, color: C.text, fontSize: '0.85rem' }}>Rank {rule.doseOrder}</span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.primary, fontWeight: 800, fontSize: '0.85rem' }}>
                        <Clock size={14} /> {scheduleDisplay}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', background: theme.bg, color: theme.color, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                        <theme.icon size={12} /> {rule.priorityLevel}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', background: isActive ? C.greenLight : '#F1F5F9', color: isActive ? C.green : C.muted, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                        {isActive ? <ShieldCheck size={12} /> : <Pause size={12} />} {rule.status}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleOpenEdit(rule)} style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', background: C.primaryLight, color: C.primary, cursor: 'pointer' }} title="Edit Rule"><Edit2 size={16} /></button>
                        <button onClick={() => handleToggleStatus(rule)} style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', background: isActive ? C.amberLight : C.greenLight, color: isActive ? C.amber : C.green, cursor: 'pointer' }} title={isActive ? 'Disable' : 'Enable'}>{isActive ? <Pause size={16} /> : <Play size={16} />}</button>
                        <button onClick={() => handleDelete(rule)} style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', background: C.redLight, color: C.red, cursor: 'pointer' }} title="Delete Rule"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" style={{ padding: '5rem', textAlign: 'center' }}>
                    <p style={{ fontWeight: 800, color: C.text, fontSize: '1.1rem' }}>No schedule rules found</p>
                    <p style={{ color: C.muted, marginTop: '0.5rem' }}>Check your search criteria or add a new rule.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div style={{ padding: '1.25rem 1.5rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600 }}>
              Showing {paginatedRules.length} of {filteredRules.length} rules
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: `1.5px solid ${C.border}`, background: 'white', color: currentPage === 1 ? C.muted : C.text, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex' }}
              >
                <ChevronLeft size={18} />
              </button>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{ 
                      width: '32px', height: '32px', borderRadius: '8px', border: 'none', 
                      background: currentPage === i + 1 ? C.primary : 'transparent',
                      color: currentPage === i + 1 ? 'white' : C.text,
                      fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: `1.5px solid ${C.border}`, background: 'white', color: (currentPage === totalPages || totalPages === 0) ? C.muted : C.text, cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', display: 'flex' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* --- Creation/Edit Modal --- */}
        {isModalOpen && (
          <>
            <div onClick={() => setIsModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000 }} />
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', background: 'white', zIndex: 1001, borderRadius: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', animation: 'modalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              
              <div style={{ padding: '1.75rem 2rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: C.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Settings size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: C.text }}>{isEditing ? 'Configure Rule' : 'New Schedule Entry'}</h2>
                    <p style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase' }}>Rule Configuration Protocol</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: `1px solid ${C.border}`, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>&times;</button>
              </div>

              <div style={{ padding: '2rem', maxHeight: '75vh', overflowY: 'auto' }}>
                <form id="schedule-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Vaccine Common Name *</label>
                        <input required className="input-field" value={form.vaccineName} onChange={e => setForm({...form, vaccineName: e.target.value})} placeholder="e.g. Hepatitis B" style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontWeight: 600 }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Clinical Code *</label>
                        <input required className="input-field" value={form.vaccineCode} onChange={e => setForm({...form, vaccineCode: e.target.value.toUpperCase()})} placeholder="HBV-01" style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontWeight: 700, color: C.primary }} />
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${C.border}` }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.primary, textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> Temporal Scheduling Rule</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: C.secondary, marginBottom: '0.4rem' }}>Time Interval Unit</label>
                            <select className="input-field" value={form.scheduleType} onChange={e => setForm({...form, scheduleType: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontWeight: 600 }}>
                                <option value="days">Days Post-Birth</option>
                                <option value="weeks">Weeks Post-Birth</option>
                                <option value="months">Months Post-Birth</option>
                                <option value="years">Years Post-Birth</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: C.secondary, marginBottom: '0.4rem' }}>Interval Value</label>
                            <input required type="number" min="0" className="input-field" value={form.scheduleValue} onChange={e => setForm({...form, scheduleValue: e.target.value})} placeholder="0" style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontWeight: 700 }} />
                        </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Dose Order Rank</label>
                        <input type="number" min="1" className="input-field" value={form.doseOrder} onChange={e => setForm({...form, doseOrder: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontWeight: 600 }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Recommended Age Label</label>
                        <input className="input-field" value={form.recommendedAgeLabel} onChange={e => setForm({...form, recommendedAgeLabel: e.target.value})} placeholder="e.g. At Birth" style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontWeight: 600 }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Clinical Description</label>
                    <textarea className="input-field" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe vaccine purpose and clinical efficacy..." style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, minHeight: '80px', fontWeight: 500 }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Priority Level</label>
                        <select className="input-field" value={form.priorityLevel} onChange={e => setForm({...form, priorityLevel: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontWeight: 700 }}>
                            <option>Critical</option>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Initial Status</label>
                        <select className="input-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontWeight: 700 }}>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                  </div>
                </form>
              </div>

              <div style={{ padding: '1.5rem 2rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, display: 'flex', gap: '1rem', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
                <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.85rem', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '10px', fontWeight: 800, color: C.text, cursor: 'pointer' }}>Discard</button>
                <button form="schedule-form" type="submit" style={{ flex: 2, padding: '0.85rem', background: C.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)' }}>{isSubmitting ? 'Processing...' : (isEditing ? 'Commit Changes' : 'Initialize Schedule')}</button>
              </div>
            </div>
          </>
        )}

      </div>
      <style>{`
        @keyframes modalSlide {
          from { transform: translate(-50%, -40%); opacity: 0; }
          to { transform: translate(-50%, -50%); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .input-field:focus {
          border-color: ${C.primary} !important;
          outline: none;
          box-shadow: 0 0 0 4px ${C.primaryLight};
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminVaccineSchedulePage;
