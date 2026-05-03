import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/templates/AdminLayout';
import serverURL from '../config';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Baby, 
  Syringe, 
  Calendar, 
  Mail, 
  ShieldCheck, 
  ArrowUpRight,
  MoreVertical,
  Download,
  Database,
  User,
  Info,
  Check,
  X,
  RotateCcw
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

const SC = {
  Completed: { bg: C.greenLight, color: C.green, icon: CheckCircle },
  Pending:   { bg: C.amberLight, color: C.amber, icon: Clock },
  Missed:    { bg: C.redLight, color: C.red, icon: AlertCircle },
};

const AdminVaccinesPage = () => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [confirmModal, setConfirmModal] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchVaccines(); }, []);

  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/api/vaccines`);
      if (res.data.status === 'ok') {
        const today = new Date(); today.setHours(0,0,0,0);
        const processed = res.data.data.map(v => {
          let ds = v.status || 'Pending';
          if (!v.got && ds === 'Pending' && new Date(v.scheduleDate) < today) ds = 'Missed';
          if (v.got) ds = 'Completed';
          return { ...v, ds };
        });
        setVaccines(processed);
      }
    } catch { toast.error('Failed to fetch records'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async () => {
    if (!confirmModal) return;
    setUpdatingId(confirmModal.id);
    try {
      await axios.put(`${serverURL}/api/vaccines/${confirmModal.id}/status`, { status: confirmModal.newStatus });
      toast.success(`Marked as ${confirmModal.newStatus}`);
      fetchVaccines();
    } catch { toast.error('Update failed'); }
    finally { setUpdatingId(null); setConfirmModal(null); }
  };

  const filtered = useMemo(() =>
    vaccines.filter(v =>
      (filterStatus === 'All' || v.ds === filterStatus) &&
      ((v.babyName||'').toLowerCase().includes(search.toLowerCase()) ||
       (v.vaccineName||'').toLowerCase().includes(search.toLowerCase()))
    ), [vaccines, filterStatus, search]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = useMemo(() => filtered.slice((page-1)*rowsPerPage, page*rowsPerPage), [filtered, page, rowsPerPage]);

  const stats = useMemo(() => [
    { label: 'Total Records', value: vaccines.length, icon: Database, color: C.primary, bg: C.primaryLight },
    { label: 'Completed', value: vaccines.filter(v=>v.ds==='Completed').length, icon: CheckCircle, color: C.green, bg: C.greenLight },
    { label: 'Pending', value: vaccines.filter(v=>v.ds==='Pending').length, icon: Clock, color: C.amber, bg: C.amberLight },
    { label: 'Missed', value: vaccines.filter(v=>v.ds==='Missed').length, icon: AlertCircle, color: C.red, bg: C.redLight },
  ], [vaccines]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 700, color: C.muted }}>Accessing Vaccination Registry...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <AdminLayout>
      <div style={{ background: C.bg, minHeight: '100vh', padding: '2rem 2.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* --- Header --- */}
        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-0.025em' }}>Vaccination Registry</h1>
              <p style={{ color: C.muted, marginTop: '0.4rem', fontSize: '1rem' }}>Centralized status control center for hospital-wide immunization monitoring.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'white', border: `1px solid ${C.border}`, borderRadius: '10px', fontWeight: 700, color: C.text, cursor: 'pointer' }}>
                <Download size={18} /> Export CSV
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: C.primary, border: 'none', borderRadius: '10px', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                <ArrowUpRight size={18} strokeWidth={3} /> Clinical Report
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
            {['All', 'Pending', 'Completed', 'Missed'].map(t => (
              <button 
                key={t}
                onClick={() => { setFilterStatus(t); setPage(1); }}
                style={{ 
                  padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', 
                  background: filterStatus === t ? C.primaryLight : 'transparent',
                  color: filterStatus === t ? C.primary : C.muted,
                  fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {t === 'All' ? 'All Records' : t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '500px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search child name or vaccine type..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.75rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>
            <select 
                value={rowsPerPage} 
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
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
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Patient Entity</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vaccine Detail</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Age Label</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Scheduled Date</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>Update Registry</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map((v, idx) => {
                const sc = SC[v.ds] || SC.Pending;
                return (
                  <tr key={v._id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue }}>
                          <Baby size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, color: C.text, fontSize: '0.9rem' }}>{v.babyName || 'Unknown'}</p>
                          <p style={{ fontSize: '0.7rem', color: C.muted, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={12} /> {v.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.primary, fontWeight: 800, fontSize: '0.9rem' }}>
                        <Syringe size={16} /> {v.vaccineName}
                      </div>
                      <p style={{ fontSize: '0.7rem', color: C.muted, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.2rem' }} title={v.description}>
                        {v.description || 'No clinical description'}
                      </p>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {v.ageLabel ? (
                        <span style={{ padding: '0.3rem 0.6rem', background: C.primaryLight, color: C.primary, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>{v.ageLabel}</span>
                      ) : (
                        <span style={{ color: C.muted }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.secondary, fontSize: '0.85rem', fontWeight: 600 }}>
                        <Calendar size={14} /> {new Date(v.scheduleDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: sc.bg, color: sc.color, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                        <sc.icon size={12} /> {v.ds}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {['Pending', 'Completed', 'Missed'].filter(s => s !== v.ds).map(ns => (
                          <button 
                            key={ns}
                            disabled={updatingId === v._id}
                            onClick={() => setConfirmModal({ id: v._id, newStatus: ns, vaccineName: v.vaccineName, childName: v.babyName })}
                            style={{ 
                                padding: '0.45rem 0.75rem', borderRadius: '8px', border: 'none', 
                                background: ns === 'Completed' ? C.greenLight : ns === 'Missed' ? C.redLight : C.bg,
                                color: ns === 'Completed' ? C.green : ns === 'Missed' ? C.red : C.secondary,
                                fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '0.3rem'
                            }}
                          >
                            {ns === 'Completed' ? <Check size={14} /> : ns === 'Missed' ? <X size={14} /> : <RotateCcw size={14} />} {ns}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" style={{ padding: '5rem', textAlign: 'center' }}>
                    <p style={{ fontWeight: 800, color: C.text, fontSize: '1.1rem' }}>No vaccination records found</p>
                    <p style={{ color: C.muted, marginTop: '0.5rem' }}>Adjust your filters or search keywords.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div style={{ padding: '1.25rem 1.5rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600 }}>
              Showing {paginated.length} of {filtered.length} entries
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                disabled={page === 1}
                onClick={() => setPage(prev => prev - 1)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: `1.5px solid ${C.border}`, background: 'white', color: page === 1 ? C.muted : C.text, cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex' }}
              >
                <ChevronLeft size={18} />
              </button>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setPage(i + 1)}
                    style={{ 
                      width: '32px', height: '32px', borderRadius: '8px', border: 'none', 
                      background: page === i + 1 ? C.primary : 'transparent',
                      color: page === i + 1 ? 'white' : C.text,
                      fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(prev => prev + 1)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: `1.5px solid ${C.border}`, background: 'white', color: (page === totalPages || totalPages === 0) ? C.muted : C.text, cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', display: 'flex' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* --- Confirmation Modal --- */}
      {confirmModal && (
        <>
          <div onClick={() => setConfirmModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '450px', background: 'white', zIndex: 1001, borderRadius: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.15)', animation: 'modalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: confirmModal.newStatus === 'Completed' ? C.greenLight : confirmModal.newStatus === 'Missed' ? C.redLight : C.amberLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: confirmModal.newStatus === 'Completed' ? C.green : confirmModal.newStatus === 'Missed' ? C.red : C.amber }}>
                {confirmModal.newStatus === 'Completed' ? <Check size={32} strokeWidth={3} /> : confirmModal.newStatus === 'Missed' ? <X size={32} strokeWidth={3} /> : <RotateCcw size={32} strokeWidth={3} />}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: C.text, marginBottom: '0.75rem' }}>Update Clinical Status</h3>
              <p style={{ color: C.secondary, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Marking <strong>{confirmModal.vaccineName}</strong> as <strong style={{ color: SC[confirmModal.newStatus].color }}>{confirmModal.newStatus}</strong> for patient <strong>{confirmModal.childName}</strong>. 
                <br /><span style={{ fontSize: '0.85rem' }}>This action will be logged in the medical record.</span>
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setConfirmModal(null)} style={{ flex: 1, padding: '0.85rem', background: '#F1F5F9', border: 'none', borderRadius: '12px', fontWeight: 800, color: C.secondary, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleStatusUpdate} style={{ flex: 2, padding: '0.85rem', background: SC[confirmModal.newStatus].color, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    Confirm {confirmModal.newStatus}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes modalSlide {
          from { transform: translate(-50%, -40%); opacity: 0; }
          to { transform: translate(-50%, -50%); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminVaccinesPage;
