import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/templates/MainLayout';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Baby, 
  Info, 
  ArrowLeft,
  Calendar,
  Syringe,
  FileText,
  ChevronDown,
  LayoutGrid,
  List,
  MoreVertical,
  CheckCircle2,
  Database
} from 'lucide-react';

// --- Design Tokens ---
const C = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#F3F4F6',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  secondary: '#64748B',
  text: '#0F172A',
  muted: '#94A3B8',
  red: '#EF4444',
  redLight: '#FEE2E2',
  green: '#10B981',
  greenLight: '#D1FAE5',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
};

const API = 'http://localhost:5001';

const STATUS_CFG = {
  Completed: { bg: C.greenLight, color: '#065F46', icon: CheckCircle2, label: 'Completed' },
  Pending: { bg: C.amberLight, color: '#92400E', icon: Clock, label: 'Pending' },
  Missed: { bg: C.redLight, color: '#991B1B', icon: AlertCircle, label: 'Missed' },
};

const deriveStatus = (v) => {
  if (v.got || v.status === 'Completed') return 'Completed';
  if (v.status === 'Missed') return 'Missed';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (new Date(v.scheduleDate) < today) return 'Missed';
  return 'Pending';
};

const calculateAgeAtSchedule = (birthDate, scheduleDate) => {
  if (!birthDate || !scheduleDate) return 'At Birth';
  const birth = new Date(birthDate);
  const schedule = new Date(scheduleDate);
  
  const diffTime = schedule.getTime() - birth.getTime();
  if (diffTime <= 0) return 'At Birth';
  
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) return `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} Week${weeks > 1 ? 's' : ''}`;
  }
  
  let months = (schedule.getFullYear() - birth.getFullYear()) * 12;
  months += schedule.getMonth() - birth.getMonth();
  if (schedule.getDate() < birth.getDate()) months--;

  if (months < 12) return `${months} Month${months !== 1 ? 's' : ''}`;
  
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths === 0 ? `${years} Year${years > 1 ? 's' : ''}` : `${years}Y ${remMonths}M`;
};

const VaccineSchedulePage = () => {
  const navigate = useNavigate();
  const [babies, setBabies] = useState([]);
  const [selectedBabyId, setSelectedBabyId] = useState('');
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchVaccines = useCallback(async (babyId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/vaccines/baby/${babyId}`);
      if (res.data.status === 'ok') {
        setVaccines(res.data.data.map(v => ({ ...v, ds: deriveStatus(v) })));
      }
    } catch { toast.error('Failed to synchronize vaccine directory'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = window.localStorage.getItem('token');
      if (!token) { navigate('/sign-in'); return; }
      try {
        const ur = await axios.post(`${API}/userData`, { token });
        if (ur.data.status === 'ok') {
          const br = await axios.get(`${API}/api/user-babies/${ur.data.data.email}`);
          if (br.data.status === 'ok' && br.data.data.length > 0) {
            setBabies(br.data.data);
            setSelectedBabyId(br.data.data[0]._id);
            fetchVaccines(br.data.data[0]._id);
          } else setLoading(false);
        } else navigate('/sign-in');
      } catch { navigate('/sign-in'); }
    };
    init();
  }, [navigate, fetchVaccines]);

  const handleBabyChange = (e) => {
    const id = e.target.value;
    setSelectedBabyId(id);
    setPage(1);
    fetchVaccines(id);
  };

  // --- Logic Processing ---
  const filtered = useMemo(() => {
    return vaccines.filter(v => {
      const matchStatus = filterStatus === 'All' || v.ds === filterStatus;
      const matchSearch = v.vaccineName.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [vaccines, filterStatus, search]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = useMemo(() => filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage), [filtered, page, rowsPerPage]);

  const stats = useMemo(() => ({
    total: vaccines.length,
    completed: vaccines.filter(v => v.ds === 'Completed').length,
    pending: vaccines.filter(v => v.ds === 'Pending').length,
    missed: vaccines.filter(v => v.ds === 'Missed').length,
    rate: vaccines.length ? Math.round((vaccines.filter(v => v.ds === 'Completed').length / vaccines.length) * 100) : 0,
  }), [vaccines]);

  if (loading && babies.length === 0) return (
    <MainLayout>
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 700, color: C.muted }}>Accessing Medical Records...</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem', fontFamily: 'Inter, system-ui, sans-serif', background: C.bg, minHeight: '100vh' }}>
        
        {/* --- Header Section --- */}
        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <button onClick={() => navigate('/dashbord')} style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'white', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, cursor: 'pointer', transition: 'all 0.2s' }}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-0.025em' }}>Vaccination Record</h1>
                <p style={{ color: C.muted, marginTop: '0.4rem', fontSize: '1rem' }}>Clinical history and future schedule for your child.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {babies.length > 0 && (
                <div style={{ position: 'relative' }}>
                  <Baby size={18} color={C.primary} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <select 
                    value={selectedBabyId} onChange={handleBabyChange}
                    style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', border: `1.5px solid ${C.primary}33`, borderRadius: '12px', fontWeight: 750, fontSize: '0.9rem', color: C.primary, background: 'white', cursor: 'pointer', outline: 'none', appearance: 'none', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)' }}
                  >
                    {babies.map(b => <option key={b._id} value={b._id}>{b.babyName}</option>)}
                  </select>
                  <ChevronDown size={14} color={C.primary} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              )}
              <button onClick={() => toast.success("Downloading Record...")} style={{ padding: '0.75rem 1.25rem', background: C.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)' }}>
                <Download size={18} /> Export PDF
              </button>
            </div>
          </div>

          {/* Clinical Progress Banner */}
          {!loading && vaccines.length > 0 && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', marginBottom: '2.5rem', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="36" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                        <circle cx="40" cy="40" r="36" fill="none" stroke={C.primary} strokeWidth="8" 
                            strokeDasharray="226.2" 
                            strokeDashoffset={226.2 - (226.2 * stats.rate) / 100} 
                            strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                        />
                    </svg>
                    <span style={{ position: 'absolute', fontSize: '1.1rem', fontWeight: 900, color: C.primary }}>{stats.rate}%</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: C.text }}>Protection Status</h3>
                  <p style={{ color: C.muted, fontSize: '0.9rem', marginTop: '0.2rem' }}>{stats.completed} of {stats.total} vaccines successfully administered.</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '2.5rem' }}>
                {[{ label: 'Completed', val: stats.completed, color: C.green, bg: C.greenLight, icon: ShieldCheck }, 
                  { label: 'Upcoming', val: stats.pending, color: C.amber, bg: C.amberLight, icon: Clock },
                  { label: 'Missed', val: stats.missed, color: C.red, bg: C.redLight, icon: AlertCircle }].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                        <s.icon size={20} strokeWidth={2.5} />
                    </div>
                    <p style={{ fontSize: '1.4rem', fontWeight: 900, color: C.text, lineHeight: 1 }}>{s.val}</p>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginTop: '0.4rem', letterSpacing: '0.05em' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* --- Filter & Action Bar --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.6rem', background: 'white', padding: '0.35rem', borderRadius: '12px', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            {['All', 'Pending', 'Completed', 'Missed'].map(s => (
              <button 
                key={s} 
                onClick={() => { setFilterStatus(s); setPage(1); }} 
                style={{
                    padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
                    background: filterStatus === s ? C.primary : 'transparent',
                    color: filterStatus === s ? 'white' : C.secondary,
                    fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {s} {s !== 'All' && <span style={{ opacity: 0.7, fontSize: '0.75rem', marginLeft: '0.2rem' }}>{vaccines.filter(v => v.ds === s).length}</span>}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '500px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" placeholder="Search vaccine name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.9rem', fontWeight: 500, outline: 'none' }}
              />
            </div>
            <select 
              value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              style={{ padding: '0.75rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.85rem', fontWeight: 700, color: C.text, outline: 'none', cursor: 'pointer' }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
        </div>

        {/* --- Main Table Layout --- */}
        <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', position: 'sticky', top: 0, zIndex: 10 }}>Vaccine Specification</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', position: 'sticky', top: 0, zIndex: 10 }}>Age Protocol</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', position: 'sticky', top: 0, zIndex: 10 }}>Clinical Description</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', position: 'sticky', top: 0, zIndex: 10 }}>Scheduled Date</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', position: 'sticky', top: 0, zIndex: 10, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(rowsPerPage)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td colSpan="5" style={{ padding: '1.25rem' }}>
                        <div className="skeleton" style={{ height: '30px', width: '100%', background: '#F1F5F9', borderRadius: '6px' }}></div>
                      </td>
                    </tr>
                  ))
                ) : paginated.length > 0 ? paginated.map((v, idx) => {
                  const sc = STATUS_CFG[v.ds] || STATUS_CFG.Pending;
                  const currentBaby = babies.find(b => b._id === selectedBabyId);
                  const dynamicAge = calculateAgeAtSchedule(currentBaby?.birthDate, v.scheduleDate);
                  
                  return (
                    <tr 
                      key={v._id} 
                      style={{ 
                        borderBottom: `1px solid ${C.border}`, 
                        background: idx % 2 === 0 ? 'white' : '#F8FAFC',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = C.primaryLight + '33'}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#F8FAFC'}
                    >
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>
                            <Syringe size={20} strokeWidth={2.5} />
                          </div>
                          <span style={{ fontWeight: 800, color: C.text, fontSize: '0.95rem' }}>{v.vaccineName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ padding: '0.35rem 0.85rem', background: '#E2E8F0', color: C.secondary, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase' }}>
                          {dynamicAge}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', maxWidth: '350px' }}>
                        <div style={{ fontSize: '0.85rem', color: C.secondary, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }} title={v.description}>
                          {v.description || 'No detailed description available for this protocol.'}
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 750, color: C.text, fontSize: '0.9rem' }}>
                          <Calendar size={16} color={C.muted} />
                          {new Date(v.scheduleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', background: sc.bg, color: sc.color, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                          <sc.icon size={12} strokeWidth={3} />
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                      <div style={{ width: '64px', height: '64px', background: C.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: C.muted }}>
                        <Database size={32} />
                      </div>
                      <p style={{ fontWeight: 800, color: C.text, fontSize: '1.1rem' }}>No clinical records found</p>
                      <p style={{ color: C.muted, marginTop: '0.5rem' }}>Try adjusting your search filters or selecting another child.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- Modern Pagination Footer --- */}
          <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 700 }}>
              Showing {paginated.length} of {filtered.length} protocols
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                disabled={page === 1}
                onClick={() => setPage(prev => prev - 1)}
                style={{ padding: '0.5rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, background: 'white', color: page === 1 ? C.muted : C.text, cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', transition: 'all 0.2s' }}
              >
                <ChevronLeft size={18} />
              </button>
              
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setPage(i + 1)}
                    style={{ 
                      width: '36px', height: '36px', borderRadius: '10px', border: 'none', 
                      background: page === i + 1 ? C.primary : 'transparent',
                      color: page === i + 1 ? 'white' : C.text,
                      fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(prev => prev + 1)}
                style={{ padding: '0.5rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, background: 'white', color: (page === totalPages || totalPages === 0) ? C.muted : C.text, cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', display: 'flex', transition: 'all 0.2s' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* --- Security & RBAC Notice --- */}
        <div style={{ marginTop: '3rem', padding: '1.5rem', borderRadius: '16px', border: `1px dashed ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
            <FileText size={18} />
          </div>
          <p style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 500, lineHeight: 1.5 }}>
            <strong style={{ color: C.secondary }}>Data Integrity Protocol:</strong> This vaccination record is an official clinical transcript. Guardians have <strong>read-only access</strong>. For discrepancies or status updates, please consult your assigned pediatrician or vaccination officer.
          </p>
        </div>

      </div>
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .skeleton { background: linear-gradient(90deg, #F1F5F9 25%, #F8FAFC 50%, #F1F5F9 75%); background-size: 400px 100%; animation: shimmer 1.5s infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </MainLayout>
  );
};

export default VaccineSchedulePage;
