import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  User, 
  Baby, 
  Stethoscope, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  Clock4, 
  XCircle,
  Tag,
  Hash,
  ArrowUpRight,
  Download,
  Database,
  Briefcase,
  History,
  Activity,
  Check
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

const STATUS_THEMES = {
  Approved: { bg: C.greenLight, color: C.green, icon: CheckCircle },
  'In Consultation': { bg: C.blueLight, color: C.blue, icon: Activity },
  Completed: { bg: C.greenLight, color: C.green, icon: ShieldCheck },
  Pending: { bg: C.amberLight, color: C.amber, icon: Clock4 },
  Rejected: { bg: C.redLight, color: C.red, icon: XCircle },
  Cancelled: { bg: C.redLight, color: C.red, icon: XCircle },
};

const AdminAppointmentsPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination State
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
          fetchBookings();
        } else {
          navigate("/");
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/bookings");
      const data = await res.json();
      if (data.status === "ok") {
        setBookings(data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      }
    } catch (err) { toast.error("Failed to fetch bookings"); }
    finally { setLoading(false); }
  };

  // --- Filtering & Pagination ---
  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const matchStatus = statusFilter === 'All' ? true : b.status === statusFilter;
      const matchSearch = (b.child_id?.babyName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (b.consultant_id?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (b.token_no || '').toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [bookings, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = useMemo(() => filtered.slice((page-1)*rowsPerPage, page*rowsPerPage), [filtered, page, rowsPerPage]);

  const stats = useMemo(() => [
    { label: 'Total Volume', value: bookings.length, icon: Database, color: C.primary, bg: C.primaryLight },
    { label: 'Pending Approvals', value: bookings.filter(b => b.status === 'Pending').length, icon: Clock4, color: C.amber, bg: C.amberLight },
    { label: 'Scheduled Today', value: bookings.filter(b => new Date(b.booking_date).toDateString() === new Date().toDateString()).length, icon: Calendar, color: C.blue, bg: C.blueLight },
    { label: 'Completed Care', value: bookings.filter(b => b.status === 'Completed').length, icon: CheckCircle, color: C.green, bg: C.greenLight },
  ], [bookings]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 700, color: C.muted }}>Accessing Appointment Center...</p>
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
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-0.025em' }}>Appointment Center</h1>
              <p style={{ color: C.muted, marginTop: '0.4rem', fontSize: '1rem' }}>Centralized control for clinical bookings, status management, and patient flow.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'white', border: `1px solid ${C.border}`, borderRadius: '10px', fontWeight: 700, color: C.text, cursor: 'pointer' }}>
                <Download size={18} /> Export Data
              </button>
              <button onClick={() => fetchBookings()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: C.primary, border: 'none', borderRadius: '10px', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                <History size={18} strokeWidth={2.5} /> Refresh List
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
          <div style={{ display: 'flex', gap: '0.6rem', background: 'white', padding: '0.35rem', borderRadius: '12px', border: `1px solid ${C.border}` }}>
            {['All', 'Pending', 'Approved', 'Completed', 'Rejected'].map(t => (
              <button 
                key={t}
                onClick={() => { setStatusFilter(t); setPage(1); }}
                style={{ 
                  padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', 
                  background: statusFilter === t ? C.primaryLight : 'transparent',
                  color: statusFilter === t ? C.primary : C.muted,
                  fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {t === 'All' ? 'Full Queue' : t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '500px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search by token, patient, or doctor..."
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
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Queue Token</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Patient Entity</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clinical Staff</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clinical Schedule</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map(b => {
                const theme = STATUS_THEMES[b.status] || { bg: C.bg, color: C.secondary, icon: Tag };
                return (
                  <tr key={b._id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.85rem', background: C.primaryLight, border: `1.5px solid ${C.primary}33`, borderRadius: '10px' }}>
                        <Hash size={14} color={C.primary} strokeWidth={3} />
                        <span style={{ fontWeight: 900, color: C.primary, fontSize: '0.95rem', letterSpacing: '0.5px' }}>{b.token_no}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue }}>
                          <Baby size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, color: C.text, fontSize: '0.9rem' }}>{b.child_id?.babyName || 'Unknown Patient'}</p>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                            <p style={{ fontSize: '0.7rem', color: C.muted }}>Reason: {b.reason}</p>
                            {b.priority_level === 'Urgent' && (
                              <span style={{ padding: '0.15rem 0.4rem', background: C.redLight, color: C.red, borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900 }}>URGENT</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.text, fontWeight: 800, fontSize: '0.85rem' }}>
                        <Stethoscope size={16} color={C.primary} /> Dr. {b.consultant_id?.name}
                      </div>
                      <p style={{ fontSize: '0.72rem', color: C.muted, marginTop: '0.2rem', paddingLeft: '1.4rem' }}>{b.consultant_id?.department}</p>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: C.secondary, fontSize: '0.85rem' }}>
                        <Calendar size={14} /> {new Date(b.booking_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.muted, fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        <Clock size={12} /> {b.booking_time}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', background: theme.bg, color: theme.color, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                        <theme.icon size={12} /> {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <button style={{ padding: '0.45rem', borderRadius: '8px', border: 'none', background: C.bg, color: C.muted, cursor: 'pointer' }}>
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" style={{ padding: '5rem', textAlign: 'center' }}>
                    <p style={{ fontWeight: 800, color: C.text, fontSize: '1.1rem' }}>Clinical queue empty</p>
                    <p style={{ color: C.muted, marginTop: '0.5rem' }}>No appointment records found for the current selection.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div style={{ padding: '1.25rem 1.5rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600 }}>
              Showing {paginated.length} of {filtered.length} clinical bookings
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
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminAppointmentsPage;
