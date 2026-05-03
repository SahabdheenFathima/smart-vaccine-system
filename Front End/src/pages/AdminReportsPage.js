import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Users, 
  Baby, 
  Stethoscope, 
  Calendar, 
  Download, 
  FileText, 
  Printer, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Filter,
  Search,
  Database,
  Layers,
  Zap
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

const AdminReportsPage = () => {
  const [userData, setUserData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Pagination State (for Activity Logs)
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState('');

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
          fetchAnalytics();
        } else {
          navigate("/");
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/analytics");
      const data = await res.json();
      if (data.status === "ok") {
        setAnalytics(data.data);
      }
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  // --- Mock Activity Logs for Pagination Demo ---
  const activityLogs = useMemo(() => [
    { id: 1, type: 'Vaccination', patient: 'Baby Liam', staff: 'Dr. Sarah', status: 'Completed', date: '2026-05-02 10:30' },
    { id: 2, type: 'Growth Check', patient: 'Baby Emma', staff: 'Nurse John', status: 'Flagged', date: '2026-05-02 11:15' },
    { id: 3, type: 'Appointment', patient: 'Baby Noah', staff: 'Dr. Sarah', status: 'Approved', date: '2026-05-02 12:00' },
    { id: 4, type: 'Vaccination', patient: 'Baby Olivia', staff: 'Dr. James', status: 'Pending', date: '2026-05-02 13:45' },
    { id: 5, type: 'Consultation', patient: 'Baby James', staff: 'Dr. Sarah', status: 'Completed', date: '2026-05-02 14:30' },
    { id: 6, type: 'Milestone', patient: 'Baby Sophia', staff: 'Dr. Emma', status: 'Verified', date: '2026-05-02 15:10' },
    { id: 7, type: 'Vaccination', patient: 'Baby Ethan', staff: 'Nurse John', status: 'Missed', date: '2026-05-02 16:00' },
    { id: 8, type: 'Growth Check', patient: 'Baby Isabella', staff: 'Dr. James', status: 'Completed', date: '2026-05-02 16:45' },
  ], []);

  const filteredLogs = useMemo(() => 
    activityLogs.filter(log => log.patient.toLowerCase().includes(search.toLowerCase())),
    [activityLogs, search]
  );

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const paginatedLogs = useMemo(() => 
    filteredLogs.slice((page-1)*rowsPerPage, page*rowsPerPage),
    [filteredLogs, page, rowsPerPage]
  );

  if (loading || !analytics) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 700, color: C.muted }}>Synthesizing Clinical Intelligence...</p>
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
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-0.025em' }}>Reports & Analytics</h1>
              <p style={{ color: C.muted, marginTop: '0.4rem', fontSize: '1rem' }}>Enterprise-grade clinical insights and operational performance metrics.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => toast.success("Exporting PDF...")} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'white', border: `1px solid ${C.border}`, borderRadius: '10px', fontWeight: 700, color: C.text, cursor: 'pointer' }}>
                <FileText size={18} /> Export PDF
              </button>
              <button onClick={() => toast.success("Exporting CSV...")} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: C.primary, border: 'none', borderRadius: '10px', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                <Download size={18} strokeWidth={2.5} /> Download CSV
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {[
                { label: 'Clinical Database', value: analytics.totals.children + analytics.totals.parents, sub: 'Total Records', icon: Database, color: C.primary, bg: C.primaryLight, trend: '+12%', trendUp: true },
                { label: 'Vaccination Rate', value: analytics.rates.vaccineCompletion + '%', sub: 'Compliance', icon: ShieldCheck, color: C.green, bg: C.greenLight, trend: '+4.2%', trendUp: true },
                { label: 'Staff Efficiency', value: analytics.rates.bookingCompletion + '%', sub: 'Served Appts', icon: Stethoscope, color: C.blue, bg: C.blueLight, trend: '-1.5%', trendUp: false },
                { label: 'Operational Load', value: analytics.totals.bookings, sub: 'Monthly Appts', icon: Activity, color: C.amber, bg: C.amberLight, trend: '+28%', trendUp: true },
            ].map((s, idx) => (
              <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={22} color={s.color} strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: C.text, marginTop: '0.1rem', lineHeight: 1 }}>{s.value}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: s.trendUp ? C.green : C.red, fontWeight: 800, fontSize: '0.75rem' }}>
                        {s.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {s.trend}
                    </div>
                    <p style={{ fontSize: '0.65rem', color: C.muted, fontWeight: 600 }}>vs Last Month</p>
                </div>
              </div>
            ))}
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
            
            {/* Left Col: Trends & Analysis */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Registration Trend Chart */}
                <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: C.text }}>Patient Acquisition Trend</h3>
                            <p style={{ fontSize: '0.85rem', color: C.muted, marginTop: '0.2rem' }}>Monthly clinical enrollment metrics for current fiscal year.</p>
                        </div>
                        <div style={{ background: C.bg, padding: '0.4rem', borderRadius: '10px', display: 'flex', gap: '0.25rem' }}>
                            <button style={{ padding: '0.35rem 0.75rem', background: 'white', border: 'none', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 800, color: C.primary, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Monthly</button>
                            <button style={{ padding: '0.35rem 0.75rem', background: 'transparent', border: 'none', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 750, color: C.muted }}>Quarterly</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', paddingBottom: '2.5rem', borderBottom: `2px solid ${C.border}`, position: 'relative' }}>
                        {[40, 65, 45, 80, 55, 90, 110, 85, 105, 120].map((val, idx) => {
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
                            const h = (val / 120) * 100;
                            return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '8%', height: '100%' }}>
                                    <div style={{ 
                                        width: '100%', height: `${h}%`, background: idx === 6 ? C.primary : `${C.primary}33`, 
                                        borderRadius: '8px 8px 0 0', position: 'relative', transition: 'height 1s ease', 
                                        display: 'flex', justifyContent: 'center'
                                    }}>
                                        <div style={{ position: 'absolute', top: '-28px', background: C.text, color: 'white', padding: '0.2rem 0.4rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, opacity: idx === 6 ? 1 : 0 }}>{val}</div>
                                    </div>
                                    <span style={{ position: 'absolute', bottom: '-28px', fontSize: '0.75rem', fontWeight: 800, color: idx === 6 ? C.text : C.muted }}>{months[idx]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Departmental Workload */}
                <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: `1px solid ${C.border}`, background: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Layers size={18} color={C.primary} strokeWidth={2.5} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: C.text }}>Service Allocation by Department</h3>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        {[
                            { dept: 'Child Vaccination Unit', count: Math.floor(analytics.totals.bookings * 0.45), color: C.green, icon: ShieldCheck },
                            { dept: 'Pediatric Consultant Wing', count: Math.floor(analytics.totals.bookings * 0.35), color: C.blue, icon: Stethoscope },
                            { dept: 'Growth & Nutrition Clinic', count: Math.floor(analytics.totals.bookings * 0.15), color: C.amber, icon: Activity },
                            { dept: 'Development Specialist Center', count: Math.floor(analytics.totals.bookings * 0.05), color: C.primary, icon: Zap }
                        ].map((row, idx) => (
                            <div key={idx} style={{ marginBottom: idx === 3 ? 0 : '1.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${row.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: row.color }}>
                                            <row.icon size={14} strokeWidth={2.5} />
                                        </div>
                                        <span style={{ fontWeight: 800, color: C.text, fontSize: '0.85rem' }}>{row.dept}</span>
                                    </div>
                                    <span style={{ fontWeight: 900, color: C.text, fontSize: '0.9rem' }}>{row.count} <span style={{ fontWeight: 600, color: C.muted, fontSize: '0.75rem' }}>Patients</span></span>
                                </div>
                                <div style={{ width: '100%', height: '10px', background: C.bg, borderRadius: '5px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(row.count / analytics.totals.bookings) * 100}%`, background: row.color, borderRadius: '5px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Col: Efficiency Gauges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Gauge 1: Vaccine Compliance */}
                <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, padding: '2.5rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ background: C.greenLight, color: C.green, padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <TrendingUp size={12} /> Compliance Target Met
                        </div>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 900, color: C.text, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2rem' }}>Vaccine Integrity Rate</h3>
                    <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto' }}>
                        <svg width="180" height="180" viewBox="0 0 180 180">
                            <circle cx="90" cy="90" r="80" fill="none" stroke={C.bg} strokeWidth="16" />
                            <circle cx="90" cy="90" r="80" fill="none" stroke={C.green} strokeWidth="16" 
                                strokeDasharray="502.6" 
                                strokeDashoffset={502.6 - (502.6 * analytics.rates.vaccineCompletion) / 100} 
                                strokeLinecap="round" transform="rotate(-90 90 90)" style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '2.75rem', fontWeight: 900, color: C.green, lineHeight: 1 }}>{analytics.rates.vaccineCompletion}%</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 750, color: C.muted, marginTop: '0.4rem' }}>Success Rate</span>
                        </div>
                    </div>
                </div>

                {/* Gauge 2: Service Delivery */}
                <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, padding: '2.5rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ background: C.blueLight, color: C.blue, padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} /> Optimization Suggested
                        </div>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 900, color: C.text, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2rem' }}>Appointment Completion</h3>
                    <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto' }}>
                        <svg width="180" height="180" viewBox="0 0 180 180">
                            <circle cx="90" cy="90" r="80" fill="none" stroke={C.bg} strokeWidth="16" />
                            <circle cx="90" cy="90" r="80" fill="none" stroke={C.primary} strokeWidth="16" 
                                strokeDasharray="502.6" 
                                strokeDashoffset={502.6 - (502.6 * analytics.rates.bookingCompletion) / 100} 
                                strokeLinecap="round" transform="rotate(-90 90 90)" style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '2.75rem', fontWeight: 900, color: C.primary, lineHeight: 1 }}>{analytics.rates.bookingCompletion}%</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 750, color: C.muted, marginTop: '0.4rem' }}>Fulfillment</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- BOTTOM: Detailed Activity Logs (with Pagination) --- */}
        <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '1.75rem 2rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Zap size={20} color={C.amber} strokeWidth={2.5} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: C.text }}>Live Clinical Activity Stream</h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '400px', marginLeft: '2rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color={C.muted} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                    type="text" placeholder="Search activity..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} 
                    style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, background: C.bg, fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: '1rem 2rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Protocol</th>
                <th style={{ padding: '1rem 2rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Entity</th>
                <th style={{ padding: '1rem 2rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Staff</th>
                <th style={{ padding: '1rem 2rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Status</th>
                <th style={{ padding: '1rem 2rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 2rem' }}>
                    <div style={{ fontWeight: 800, color: C.text, fontSize: '0.85rem' }}>{log.type}</div>
                  </td>
                  <td style={{ padding: '1rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: C.text, fontSize: '0.85rem' }}>
                      <Baby size={14} color={C.blue} /> {log.patient}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: C.secondary, fontSize: '0.85rem' }}>
                      <Stethoscope size={14} /> {log.staff}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 2rem' }}>
                    <span style={{ padding: '0.25rem 0.6rem', background: log.status === 'Completed' ? C.greenLight : log.status === 'Flagged' ? C.redLight : C.blueLight, color: log.status === 'Completed' ? C.green : log.status === 'Flagged' ? C.red : C.blue, borderRadius: '20px', fontSize: '0.7rem', fontWeight: 900 }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 750, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} /> {log.date}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 700 }}>Showing {paginatedLogs.length} of {filteredLogs.length} activities</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.4rem', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', color: C.text }}>
                    <ChevronLeft size={18} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i+1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: page === i+1 ? C.primary : 'transparent', color: page === i+1 ? 'white' : C.text, fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>{i+1}</button>
                ))}
                <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} style={{ padding: '0.4rem', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'white', cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', color: C.text }}>
                    <ChevronRight size={18} />
                </button>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage;
