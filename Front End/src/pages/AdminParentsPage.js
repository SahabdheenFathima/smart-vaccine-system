import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';
import { 
  Search, 
  Users, 
  ChevronRight, 
  Filter, 
  Mail, 
  User, 
  Download,
  Trash2,
  Edit2,
  Info,
  Clock,
  ShieldCheck,
  Baby,
  MoreVertical,
  ExternalLink,
  MessageSquare,
  Lock
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

const AdminParentsPage = () => {
  const [userData, setUserData] = useState(null);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParent, setSelectedParent] = useState(null);
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
          fetchParents();
        } else {
          navigate("/");
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [navigate]);

  const fetchParents = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/parents");
      const data = await res.json();
      if (data.status === "ok") {
        setParents(data.data);
      } else {
        toast.error("Failed to fetch parents");
      }
    } catch (err) {
      toast.error("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = useMemo(() => {
    if (searchTerm.trim() === '') return parents;
    const lower = searchTerm.toLowerCase();
    return parents.filter(p => 
      p.fname.toLowerCase().includes(lower) || 
      p.email.toLowerCase().includes(lower)
    );
  }, [searchTerm, parents]);

  const stats = useMemo(() => {
    const multiChild = parents.filter(p => p.childrenCount > 1).length;
    return [
      { label: 'Total Guardians', value: parents.length, icon: Users, color: C.primary, bg: C.primaryLight },
      { label: 'Active Sessions', value: Math.floor(parents.length * 0.7), icon: Clock, color: C.green, bg: C.greenLight },
      { label: 'Multi-Child Homes', value: multiChild, icon: Baby, color: C.blue, bg: C.blueLight },
      { label: 'Verified Accounts', value: parents.length, icon: ShieldCheck, color: C.amber, bg: C.amberLight },
    ];
  }, [parents]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 700, color: C.muted }}>Accessing Guardian Registry...</p>
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
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-0.025em' }}>Parent Management</h1>
              <p style={{ color: C.muted, marginTop: '0.4rem', fontSize: '1rem' }}>Manage registered guardians and their pediatric profile associations.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'white', border: `1px solid ${C.border}`, borderRadius: '10px', fontWeight: 700, color: C.text, cursor: 'pointer' }}>
                <Download size={18} /> Export List
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: C.primary, border: 'none', borderRadius: '10px', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                <MessageSquare size={18} /> Broadcast Alert
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

        {/* --- Search --- */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.75rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = C.primary}
              onBlur={(e) => e.target.style.borderColor = C.border}
            />
          </div>
        </div>

        {/* --- Table --- */}
        <div style={{ background: 'white', borderRadius: '20px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Guardian Identity</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact Details</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Linked Children</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Access Status</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.length > 0 ? filteredParents.map(parent => (
                <tr key={parent._id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                        {parent.fname.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, color: C.text, fontSize: '0.95rem' }}>{parent.fname}</p>
                        <p style={{ fontSize: '0.75rem', color: C.muted, marginTop: '0.1rem' }}>Guardian User</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.text, fontWeight: 600, fontSize: '0.875rem' }}>
                      <Mail size={14} color={C.muted} /> {parent.email}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: parent.childrenCount > 0 ? C.blueLight : '#F1F5F9', color: parent.childrenCount > 0 ? C.blue : C.muted, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                      <Baby size={12} /> {parent.childrenCount} Linked Profile{parent.childrenCount !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', background: C.greenLight, color: C.green, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                      <ShieldCheck size={12} /> Verified Account
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedParent(parent)}
                      style={{ padding: '0.5rem 1rem', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '10px', color: C.primary, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.target.style.background = C.primary; e.target.style.color = 'white'; e.target.style.borderColor = C.primary; }}
                      onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.color = C.primary; e.target.style.borderColor = C.border; }}
                    >
                      Management
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: '5rem', textAlign: 'center' }}>
                    <p style={{ fontWeight: 800, color: C.text, fontSize: '1.1rem' }}>No guardian records found</p>
                    <p style={{ color: C.muted, marginTop: '0.5rem' }}>Check your search criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Side Panel --- */}
        {selectedParent && (
          <>
            <div 
              onClick={() => setSelectedParent(null)} 
              style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000 }} 
            />
            <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '500px', background: 'white', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', animation: 'slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              
              <div style={{ padding: '2rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.text }}>Guardian Profile</h2>
                    <p style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase' }}>UUID: {selectedParent._id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedParent(null)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: `1px solid ${C.border}`, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  &times;
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
                
                <section style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Info size={18} color={C.primary} />
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>Account Identity</h3>
                  </div>
                  <div style={{ background: '#F1F5F9', padding: '1.5rem', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600 }}>Full Name</span>
                      <span style={{ fontWeight: 800, color: C.text }}>{selectedParent.fname}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600 }}>Email Address</span>
                      <span style={{ fontWeight: 800, color: C.text }}>{selectedParent.email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600 }}>Account Status</span>
                      <span style={{ fontWeight: 800, color: C.green }}>Verified</span>
                    </div>
                  </div>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Baby size={18} color={C.blue} />
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>Associated Pediatric Profiles ({selectedParent.childrenCount})</h3>
                  </div>
                  
                  {selectedParent.children && selectedParent.children.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {selectedParent.children.map(child => (
                        <div key={child._id} className="child-list-item" style={{ padding: '1rem', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.blueLight, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Baby size={18} />
                            </div>
                            <div>
                              <p style={{ fontWeight: 800, color: C.text, fontSize: '0.9rem' }}>{child.babyName}</p>
                              <p style={{ fontSize: '0.75rem', color: C.muted }}>DOB: {new Date(child.birthDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <ChevronRight size={18} color={C.border} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', background: '#F8FAFC', border: `1px dashed ${C.border}`, borderRadius: '16px' }}>
                      <p style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600 }}>No linked pediatric profiles registered.</p>
                    </div>
                  )}
                </section>

                <section>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Lock size={18} color={C.amber} />
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>Admin Privileges</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button style={{ width: '100%', padding: '0.85rem', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '12px', color: C.text, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', paddingLeft: '1.25rem' }}>Reset Account Password</button>
                    <button style={{ width: '100%', padding: '0.85rem', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '12px', color: C.text, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', paddingLeft: '1.25rem' }}>Update Contact Information</button>
                    <button style={{ width: '100%', padding: '0.85rem', background: C.redLight, border: `1.5px solid ${C.red}20`, borderRadius: '12px', color: C.red, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>Deactivate Account</button>
                  </div>
                </section>
              </div>

              <div style={{ padding: '1.5rem 2.5rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, display: 'flex', gap: '1rem' }}>
                <button style={{ flex: 1, padding: '0.85rem', background: C.primary, border: 'none', borderRadius: '10px', color: 'white', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={18} /> Send Message
                </button>
              </div>
            </div>
          </>
        )}

      </div>
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .child-list-item:hover {
          border-color: ${C.primary} !important;
          background: ${C.primaryLight} !important;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminParentsPage;
