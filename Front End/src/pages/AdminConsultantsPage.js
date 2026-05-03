import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  User, 
  Mail, 
  ShieldCheck, 
  Award, 
  Stethoscope, 
  Clock, 
  Calendar, 
  MapPin, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Briefcase,
  Hospital,
  ArrowUpRight,
  Info,
  X
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

const AdminConsultantsPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentConsultant, setCurrentConsultant] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const commonSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const toggleDay = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleSlot = (slot) => {
    setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

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
          fetchConsultants();
        } else {
          navigate("/sign-in");
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  const fetchConsultants = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/consultants");
      const data = await res.json();
      if (data.status === "ok") setConsultants(data.data);
    } catch (err) { toast.error("Failed to fetch consultants"); }
  };

  const handleSaveConsultant = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const consultantData = {
      name:            formData.get('name'),
      email:           formData.get('email'),
      registration_no: formData.get('registration_no'),
      specialization:  formData.get('specialization'),
      qualification:   formData.get('qualification'),
      experience:      parseInt(formData.get('experience')),
      hospital_name:   formData.get('hospital_name'),
      department:      formData.get('department'),
      available_days:  selectedDays,
      available_slots: selectedSlots,
      status:          formData.get('status')
    };

    try {
      const url = currentConsultant 
        ? `http://localhost:5001/api/consultants/${currentConsultant._id}`
        : `http://localhost:5001/api/consultants`;
      
      const method = currentConsultant ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consultantData),
      });
      const data = await res.json();
      
      if (data.status === "ok") {
        toast.success(currentConsultant ? 'Profile updated' : 'Consultant onboarded!');
        setIsModalOpen(false);
        fetchConsultants();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (consultant) => {
    if (!window.confirm(`Permanently delete Dr. ${consultant.name}'s profile?`)) return;
    try {
      const res = await fetch(`http://localhost:5001/api/consultants/${consultant._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'ok') {
        toast.success('Record deleted');
        fetchConsultants();
      } else {
        toast.error(data.error || 'Deletion failed');
      }
    } catch { toast.error('Failed to delete'); }
  };

  // --- Filtering & Pagination ---
  const filtered = useMemo(() =>
    consultants.filter(c =>
      (filterDept === 'All' || c.department === filterDept) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) || 
       c.specialization.toLowerCase().includes(search.toLowerCase()))
    ), [consultants, filterDept, search]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = useMemo(() => filtered.slice((page-1)*rowsPerPage, page*rowsPerPage), [filtered, page, rowsPerPage]);

  const stats = useMemo(() => [
    { label: 'Total Medical Staff', value: consultants.length, icon: Users, color: C.primary, bg: C.primaryLight },
    { label: 'Active Status', value: consultants.filter(c => c.status === 'Active').length, icon: ShieldCheck, color: C.green, bg: C.greenLight },
    { label: 'Pediatric Specialists', value: consultants.filter(c => c.specialization === 'Pediatrician').length, icon: Stethoscope, color: C.blue, bg: C.blueLight },
    { label: 'Clinical Experience', value: (consultants.reduce((acc, c) => acc + (c.experience || 0), 0) / consultants.length || 0).toFixed(1) + 'y', icon: Award, color: C.amber, bg: C.amberLight },
  ], [consultants]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 700, color: C.muted }}>Synchronizing Clinical Directory...</p>
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
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-0.025em' }}>Consultant Management</h1>
              <p style={{ color: C.muted, marginTop: '0.4rem', fontSize: '1rem' }}>Administer medical staff profiles, clinical specializations, and system access.</p>
            </div>
            <button 
              onClick={() => { 
                setCurrentConsultant(null); 
                setSelectedDays(['Monday', 'Wednesday', 'Friday']);
                setSelectedSlots(['09:00 AM', '10:00 AM']);
                setIsModalOpen(true); 
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', background: C.primary, border: 'none', borderRadius: '12px', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}
            >
              <Plus size={18} strokeWidth={3} /> Add Consultant
            </button>
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
            {['All', 'Child Clinic', 'Vaccination Unit', 'Nutrition Clinic'].map(t => (
              <button 
                key={t}
                onClick={() => { setFilterDept(t); setPage(1); }}
                style={{ 
                  padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', 
                  background: filterDept === t ? C.primaryLight : 'transparent',
                  color: filterDept === t ? C.primary : C.muted,
                  fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {t === 'All' ? 'Full Directory' : t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '500px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search by doctor name or expertise..."
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
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Medical Professional</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clinical Details</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Affiliation</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Experience</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map(c => (
                <tr key={c._id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>
                        <User size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, color: C.text, fontSize: '0.9rem' }}>Dr. {c.name}</p>
                        <p style={{ fontSize: '0.7rem', color: C.muted, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={12} /> {c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.blue, fontWeight: 800, fontSize: '0.85rem' }}>
                      <Stethoscope size={14} /> {c.specialization}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: C.muted, marginTop: '0.2rem' }}>{c.qualification}</p>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: C.secondary, fontSize: '0.85rem' }}>
                      <Hospital size={14} color={C.muted} /> {c.department}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: C.muted, marginTop: '0.2rem' }}>{c.hospital_name}</p>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ fontWeight: 800, color: C.text, fontSize: '0.85rem' }}>{c.experience} Years</span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', background: c.status === 'Active' ? C.greenLight : C.redLight, color: c.status === 'Active' ? C.green : C.red, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                      {c.status === 'Active' ? <ShieldCheck size={12} /> : <AlertCircle size={12} />} {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => { 
                          setCurrentConsultant(c); 
                          setSelectedDays(c.available_days || []);
                          setSelectedSlots(c.available_slots || []);
                          setIsModalOpen(true); 
                        }}
                        style={{ padding: '0.45rem', borderRadius: '8px', border: 'none', background: C.primaryLight, color: C.primary, cursor: 'pointer' }} 
                        title="Edit Profile"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c)}
                        style={{ padding: '0.45rem', borderRadius: '8px', border: 'none', background: C.redLight, color: C.red, cursor: 'pointer' }} 
                        title="Remove Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: '5rem', textAlign: 'center' }}>
                    <p style={{ fontWeight: 800, color: C.text, fontSize: '1.1rem' }}>Clinical directory empty</p>
                    <p style={{ color: C.muted, marginTop: '0.5rem' }}>No medical staff records found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div style={{ padding: '1.25rem 1.5rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600 }}>
              Showing {paginated.length} of {filtered.length} medical staff
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

        {/* --- Creation/Edit Modal --- */}
        {isModalOpen && (
          <>
            <div onClick={() => setIsModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(6px)', zIndex: 1000 }} />
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '850px', maxHeight: '90vh', background: 'white', zIndex: 1001, borderRadius: '28px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', animation: 'modalSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              
              <div style={{ padding: '1.75rem 2.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderTopLeftRadius: '28px', borderTopRightRadius: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: C.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase size={26} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: C.text }}>{currentConsultant ? 'Modify Credentials' : 'Staff Onboarding'}</h2>
                    <p style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase' }}>Clinical Staff Registry Protocol</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: `1px solid ${C.border}`, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
                <form id="consultant-form" onSubmit={handleSaveConsultant} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  
                  {/* Bio Section */}
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: C.primary, textTransform: 'uppercase', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} /> Identity & Credentials</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Full Medical Name *</label>
                        <input name="name" defaultValue={currentConsultant?.name} required className="input-field" placeholder="Dr. John Doe" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontWeight: 600 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Medical Registration No *</label>
                        <input name="registration_no" defaultValue={currentConsultant?.registration_no} required className="input-field" placeholder="SLMC-XXXXX" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontWeight: 700, color: C.primary }} />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>System Access Email *</label>
                        <div style={{ position: 'relative' }}>
                          <Mail size={18} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                          <input name="email" type="email" required className="input-field" placeholder="doctor@hospital.lk" style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 2.75rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontWeight: 600 }} />
                        </div>
                        {!currentConsultant && <p style={{ fontSize: '0.7rem', color: C.muted, marginTop: '0.5rem' }}>System will auto-generate and send login credentials to this address.</p>}
                      </div>
                    </div>
                  </div>

                  {/* Professional Section */}
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: C.primary, textTransform: 'uppercase', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Stethoscope size={16} /> Clinical Profile</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Clinical Specialization</label>
                        <select name="specialization" defaultValue={currentConsultant?.specialization || "Pediatrician"} className="input-field" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontWeight: 700 }}>
                            <option>Pediatrician</option>
                            <option>Vaccination Officer</option>
                            <option>Child Nutritionist</option>
                            <option>Development Specialist</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Assigned Department</label>
                        <select name="department" defaultValue={currentConsultant?.department || "Child Clinic"} className="input-field" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontWeight: 700 }}>
                            <option>Child Clinic</option>
                            <option>Vaccination Unit</option>
                            <option>Nutrition Clinic</option>
                            <option>Development Clinic</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Highest Qualification</label>
                        <input name="qualification" defaultValue={currentConsultant?.qualification} required className="input-field" placeholder="MBBS, MD (Pediatrics)" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontWeight: 600 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Years of Experience</label>
                        <input name="experience" type="number" defaultValue={currentConsultant?.experience} required className="input-field" placeholder="10" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontWeight: 700 }} />
                      </div>
                    </div>
                  </div>

                  {/* Availability Section */}
                  <div style={{ background: '#F8FAFC', padding: '1.75rem', borderRadius: '20px', border: `1px solid ${C.border}` }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: C.primary, textTransform: 'uppercase', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> Clinical Duty Cycle</h4>
                    
                    <div style={{ marginBottom: '1.75rem' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Active Consultation Days</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        {daysOfWeek.map(day => (
                          <button 
                            key={day} type="button" onClick={() => toggleDay(day)}
                            style={{ 
                              padding: '0.6rem 1.1rem', borderRadius: '10px', border: '1.5px solid', fontWeight: 750, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
                              borderColor: selectedDays.includes(day) ? C.primary : C.border,
                              background: selectedDays.includes(day) ? C.primaryLight : 'white',
                              color: selectedDays.includes(day) ? C.primary : C.secondary
                            }}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Time Slot Allocation</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.6rem' }}>
                        {commonSlots.map(slot => (
                          <button 
                            key={slot} type="button" onClick={() => toggleSlot(slot)}
                            style={{ 
                              padding: '0.6rem', borderRadius: '10px', border: '1.5px solid', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s',
                              borderColor: selectedSlots.includes(slot) ? C.blue : C.border,
                              background: selectedSlots.includes(slot) ? C.blueLight : 'white',
                              color: selectedSlots.includes(slot) ? C.blue : C.secondary
                            }}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Operational Section */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Hospital Affiliation</label>
                      <div style={{ position: 'relative' }}>
                        <Hospital size={18} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input name="hospital_name" defaultValue={currentConsultant?.hospital_name || "Central Government Hospital"} required className="input-field" style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 2.75rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontWeight: 600 }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Personnel Status</label>
                      <select name="status" defaultValue={currentConsultant?.status || "Active"} className="input-field" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontWeight: 800, color: C.text }}>
                        <option>Active</option>
                        <option>On Leave</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>

                </form>
              </div>

              <div style={{ padding: '1.75rem 2.5rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, display: 'flex', gap: '1rem', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '1rem', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '14px', fontWeight: 800, color: C.text, cursor: 'pointer' }}>Cancel</button>
                <button form="consultant-form" type="submit" style={{ flex: 2, padding: '1rem', background: C.primary, color: 'white', border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 15px rgba(79, 70, 229, 0.25)' }}>{isSubmitting ? 'Syncing...' : (currentConsultant ? 'Update Clinical Profile' : 'Onboard Professional')}</button>
              </div>
            </div>
          </>
        )}

      </div>
      <style>{`
        @keyframes modalSlide {
          from { transform: translate(-50%, -45%); opacity: 0; }
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

export default AdminConsultantsPage;
