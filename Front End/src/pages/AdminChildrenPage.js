import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';
import { 
  Search, 
  Baby, 
  ChevronRight, 
  Filter, 
  MoreVertical, 
  Weight, 
  Ruler, 
  Calendar, 
  Mail, 
  User, 
  AlertCircle,
  FileText,
  Download,
  Trash2,
  Edit2,
  Info,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Activity,
  Users
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
};

const AdminChildrenPage = () => {
  const [userData, setUserData] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedChild, setSelectedChild] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const navigate = useNavigate();

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
          fetchChildren();
        } else {
          navigate("/");
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [navigate]);

  const fetchChildren = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/children");
      const data = await res.json();
      if (data.status === "ok") {
        setChildrenData(data.data);
      } else {
        toast.error("Failed to fetch child records");
      }
    } catch (err) {
      toast.error("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate age in months
  const calculateAgeMonths = (birthDate) => {
    const dob = new Date(birthDate);
    const today = new Date();
    let months = (today.getFullYear() - dob.getFullYear()) * 12;
    months -= dob.getMonth();
    months += today.getMonth();
    return months <= 0 ? 0 : months;
  };

  const filteredChildren = useMemo(() => {
    let result = childrenData;
    
    // Search Filter
    if (searchTerm.trim() !== '') {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.babyName?.toLowerCase().includes(lower) || 
        c.email?.toLowerCase().includes(lower)
      );
    }

    // Status Filter
    if (filterType === 'Flagged') {
      result = result.filter(child => {
        const ageMonths = calculateAgeMonths(child.birthDate);
        return child.weight && parseFloat(child.weight) < 3000 && ageMonths > 6;
      });
    } else if (filterType === 'Newborn') {
      result = result.filter(child => calculateAgeMonths(child.birthDate) <= 1);
    }

    return result;
  }, [searchTerm, filterType, childrenData]);

  const stats = useMemo(() => {
    const flagged = childrenData.filter(child => {
      const ageMonths = calculateAgeMonths(child.birthDate);
      return child.weight && parseFloat(child.weight) < 3000 && ageMonths > 6;
    }).length;
    
    const newborn = childrenData.filter(child => calculateAgeMonths(child.birthDate) <= 1).length;

    return [
      { label: 'Total Children', value: childrenData.length, icon: Baby, color: C.primary, bg: C.primaryLight },
      { label: 'Newborns', value: newborn, icon: Clock, color: C.blue, bg: C.blueLight },
      { label: 'Flagged Profiles', value: flagged, icon: AlertCircle, color: C.red, bg: C.redLight },
      { label: 'Growth tracked', value: childrenData.filter(c => c.weight).length, icon: TrendingUp, color: C.green, bg: C.greenLight },
    ];
  }, [childrenData]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 700, color: C.muted }}>Accessing Pediatric Database...</p>
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
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-0.025em' }}>Child Profiles Database</h1>
              <p style={{ color: C.muted, marginTop: '0.4rem', fontSize: '1rem' }}>Central repository for all pediatric health records and clinical history.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'white', border: `1px solid ${C.border}`, borderRadius: '10px', fontWeight: 700, color: C.text, cursor: 'pointer' }}>
                <Download size={18} /> Export Data
              </button>
              <button onClick={() => navigate('/add-baby')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: C.primary, border: 'none', borderRadius: '10px', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                <User size={18} /> Register Child
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {stats.map((s, idx) => (
              <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={24} color={s.color} strokeWidth={2.5} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 900, color: C.text, marginTop: '0.1rem', lineHeight: 1 }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* --- Filters & Search --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', background: 'white', padding: '0.4rem', borderRadius: '12px', border: `1px solid ${C.border}` }}>
            {['All', 'Newborn', 'Flagged'].map(t => (
              <button 
                key={t}
                onClick={() => setFilterType(t)}
                style={{ 
                  padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', 
                  background: filterType === t ? C.primaryLight : 'transparent',
                  color: filterType === t ? C.primary : C.muted,
                  fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '500px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search patient name, parent email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = C.primary}
                onBlur={(e) => e.target.style.borderColor = C.border}
              />
            </div>
            <button style={{ padding: '0.75rem', background: 'white', border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text, cursor: 'pointer' }}>
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* --- Children Data List --- */}
        <div style={{ background: 'white', borderRadius: '20px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Patient Details</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Age / Vital Metrics</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact Entity</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Registry Status</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.length > 0 ? filteredChildren.map(child => {
                const ageMonths = calculateAgeMonths(child.birthDate);
                const isFlagged = child.weight && parseFloat(child.weight) < 3000 && ageMonths > 6;
                const weightKg = child.weight ? (parseFloat(child.weight) / 1000).toFixed(1) : '--';

                return (
                  <tr key={child._id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, fontWeight: 800 }}>
                          <Baby size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, color: C.text, fontSize: '0.95rem' }}>{child.babyName}</p>
                          <p style={{ fontSize: '0.75rem', color: C.muted, marginTop: '0.1rem' }}>UID: {child._id.substring(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text }}>{ageMonths} months</p>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                            <span style={{ fontSize: '0.7rem', color: C.muted, display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Weight size={10} /> {weightKg} kg</span>
                            <span style={{ fontSize: '0.7rem', color: C.muted, display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Ruler size={10} /> {child.height || '--'} cm</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: C.text }}>{child.motherName || 'Not Stated'}</p>
                        <p style={{ fontSize: '0.75rem', color: C.muted, marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={12} /> {child.email}</p>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {isFlagged ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', background: C.redLight, color: C.red, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                          <AlertCircle size={12} /> Underweight Flag
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', background: C.greenLight, color: C.green, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                          <ShieldCheck size={12} /> Healthy Profile
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedChild(child)}
                        style={{ padding: '0.5rem 1rem', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '10px', color: C.primary, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.target.style.background = C.primary; e.target.style.color = 'white'; e.target.style.borderColor = C.primary; }}
                        onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.color = C.primary; e.target.style.borderColor = C.border; }}
                      >
                        Clinical Summary
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" style={{ padding: '5rem', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                      <Search size={32} color={C.muted} />
                    </div>
                    <p style={{ fontWeight: 800, color: C.text, fontSize: '1.1rem' }}>No medical records matched your search</p>
                    <p style={{ color: C.muted, marginTop: '0.5rem' }}>Try adjusting your keywords or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ padding: '1.25rem 1.5rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600 }}>Showing {filteredChildren.length} of {childrenData.length} patient records</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ padding: '0.5rem 1rem', background: 'white', border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, color: C.muted, cursor: 'not-allowed' }}>Previous</button>
              <button style={{ padding: '0.5rem 1rem', background: 'white', border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, color: C.text, cursor: 'pointer' }}>Next</button>
            </div>
          </div>
        </div>

        {/* --- Detailed Patient Side Panel --- */}
        {selectedChild && (
          <>
            <div 
              onClick={() => setSelectedChild(null)} 
              style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, transition: 'all 0.3s' }} 
            />
            <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '550px', background: 'white', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', animation: 'slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              
              {/* Drawer Header */}
              <div style={{ padding: '2rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: C.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Baby size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.text }}>Clinical Summary</h2>
                    <p style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient ID: {selectedChild._id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedChild(null)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: `1px solid ${C.border}`, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  &times;
                </button>
              </div>

              {/* Drawer Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
                
                {/* Section: Basic Profile */}
                <section style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Info size={18} color={C.primary} />
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>Biometric Identity</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div style={{ background: '#F1F5F9', padding: '1.25rem', borderRadius: '16px' }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Full Name</p>
                      <p style={{ fontWeight: 900, color: C.text, fontSize: '1.1rem' }}>{selectedChild.babyName}</p>
                    </div>
                    <div style={{ background: '#F1F5F9', padding: '1.25rem', borderRadius: '16px' }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Birth Date</p>
                      <p style={{ fontWeight: 900, color: C.text, fontSize: '1.1rem' }}>{new Date(selectedChild.birthDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    </div>
                    <div style={{ background: '#F1F5F9', padding: '1.25rem', borderRadius: '16px' }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Mother's Name</p>
                      <p style={{ fontWeight: 900, color: C.text, fontSize: '1.1rem' }}>{selectedChild.motherName || 'N/A'}</p>
                    </div>
                    <div style={{ background: '#F1F5F9', padding: '1.25rem', borderRadius: '16px' }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Delivery Mode</p>
                      <p style={{ fontWeight: 900, color: C.primary, fontSize: '1.1rem' }}>{selectedChild.deliveryMethod || 'Normal'}</p>
                    </div>
                  </div>
                </section>

                {/* Section: Medical Vitals */}
                <section style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Activity size={18} color={C.green} />
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>Biochemical Vitals (At Birth)</h3>
                  </div>
                  <div style={{ background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}><Weight size={20} /></div>
                        <div><p style={{ fontSize: '0.75rem', fontWeight: 700, color: C.muted }}>Weight</p><p style={{ fontWeight: 900, fontSize: '1.1rem' }}>{selectedChild.weight || '--'} g</p></div>
                      </div>
                      <div style={{ height: '4px', width: '100px', background: C.border, borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '70%', background: C.primary }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.green }}><Ruler size={20} /></div>
                        <div><p style={{ fontSize: '0.75rem', fontWeight: 700, color: C.muted }}>Height</p><p style={{ fontWeight: 900, fontSize: '1.1rem' }}>{selectedChild.height || '--'} cm</p></div>
                      </div>
                      <div style={{ height: '4px', width: '100px', background: C.border, borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '60%', background: C.green }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue }}><Info size={20} /></div>
                      <div><p style={{ fontSize: '0.75rem', fontWeight: 700, color: C.muted }}>Head Circumference</p><p style={{ fontWeight: 900, fontSize: '1.1rem' }}>{selectedChild.headCircumference || '--'} cm</p></div>
                    </div>
                  </div>
                </section>

                {/* Section: Parent / Guardian */}
                <section style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Users size={18} color={C.blue} />
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>Parent / Guardian Registry</h3>
                  </div>
                  <div style={{ background: '#F8FAFC', border: `1px dashed ${C.border}`, borderRadius: '16px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white' }}>{selectedChild.motherName?.charAt(0) || 'P'}</div>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>{selectedChild.motherName || 'Unknown'}</p>
                        <p style={{ fontSize: '0.8rem', color: C.muted }}>Primary Guardian</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: C.secondary, fontSize: '0.85rem' }}>
                        <Mail size={14} /> {selectedChild.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: C.secondary, fontSize: '0.85rem' }}>
                        <Calendar size={14} /> Mother's Age: {selectedChild.motherAge || 'N/A'} yrs
                      </div>
                    </div>
                  </div>
                </section>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button style={{ flex: 1, padding: '1rem', background: C.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Edit2 size={16} /> Edit Profile
                  </button>
                  <button style={{ flex: 1, padding: '1rem', background: 'white', color: C.red, border: `1.5px solid ${C.red}20`, borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Trash2 size={16} /> Delete Record
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div style={{ padding: '1.5rem 2.5rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}` }}>
                <button style={{ width: '100%', padding: '0.85rem', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '10px', color: C.text, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                  <FileText size={18} /> Generate Full Clinical Report (PDF)
                </button>
              </div>
            </div>
          </>
        )}

      </div>
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); opacity: 0.8; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminChildrenPage;
