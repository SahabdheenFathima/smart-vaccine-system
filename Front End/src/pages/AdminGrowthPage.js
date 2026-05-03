import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../components/templates/AdminLayout';
import serverURL from '../config';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Weight, 
  Ruler, 
  Calendar, 
  Baby, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  Info,
  Clock,
  ArrowUpRight,
  User,
  Activity,
  ClipboardList,
  ShieldCheck
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

const AdminGrowthPage = () => {
  const [growthRecords, setGrowthRecords] = useState([]);
  const [babies, setBabies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    babyId: '',
    date: new Date().toISOString().split('T')[0],
    height: '',
    weight: '',
    headCircumference: '',
    age: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [growthRes, babiesRes] = await Promise.all([
        axios.get(`${serverURL}/api/growth`),
        axios.get(`${serverURL}/babies`)
      ]);
      setGrowthRecords(growthRes.data.data || []);
      setBabies(babiesRes.data || []);
    } catch (err) {
      toast.error('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (record = null) => {
    if (record) {
      setEditingId(record._id);
      setFormData({
        babyId: record.babyId ? record.babyId._id : '',
        date: new Date(record.date).toISOString().split('T')[0],
        height: record.height,
        weight: record.weight || '',
        headCircumference: record.headCircumference || '',
        age: record.age
      });
    } else {
      setEditingId(null);
      setFormData({
        babyId: '',
        date: new Date().toISOString().split('T')[0],
        height: '',
        weight: '',
        headCircumference: '',
        age: ''
      });
    }
    setIsDrawerOpen(true);
  };

  const calculateAgeMonths = (dob, targetDate) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const measureDate = new Date(targetDate);
    const years = measureDate.getFullYear() - birthDate.getFullYear();
    const months = measureDate.getMonth() - birthDate.getMonth();
    return years * 12 + months;
  };

  const handleBabySelect = (e) => {
    const selectedBabyId = e.target.value;
    const selectedBaby = babies.find(b => b._id === selectedBabyId);
    let updatedAge = formData.age;
    if (selectedBaby && formData.date) {
        updatedAge = calculateAgeMonths(selectedBaby.birthDate, formData.date);
    }
    setFormData({ ...formData, babyId: selectedBabyId, age: updatedAge });
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const selectedBaby = babies.find(b => b._id === formData.babyId);
    let updatedAge = formData.age;
    if (selectedBaby && selectedDate) {
        updatedAge = calculateAgeMonths(selectedBaby.birthDate, selectedDate);
    }
    setFormData({ ...formData, date: selectedDate, age: updatedAge });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.babyId || !formData.height) {
      toast.error('Baby and Height are required');
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${serverURL}/api/growth/${editingId}`, formData);
        toast.success('Measurement updated');
      } else {
        await axios.post(`${serverURL}/api/growth`, formData);
        toast.success('Measurement added');
      }
      setIsDrawerOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save measurement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this measurement?')) {
      try {
        await axios.delete(`${serverURL}/api/growth/${id}`);
        toast.success('Measurement deleted');
        fetchData();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  const formatAge = (months) => {
    if (months === null || months === undefined) return '-';
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    if (years === 0) return `${remMonths}m`;
    if (remMonths === 0) return `${years}y`;
    return `${years}y ${remMonths}m`;
  };

  const getStatus = (record) => {
    if (record.height < 45) return { label: 'Review', color: C.red, bg: C.redLight, icon: AlertCircle };
    if (record.weight && record.weight > 25) return { label: 'Attention', color: C.amber, bg: C.amberLight, icon: Info };
    return { label: 'Normal', color: C.green, bg: C.greenLight, icon: ShieldCheck };
  };

  // --- Filtering Logic ---
  const filteredRecords = useMemo(() => {
    let result = growthRecords;
    
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(r => r.babyId?.babyName?.toLowerCase().includes(lower));
    }

    if (filterStatus !== 'All') {
      result = result.filter(r => getStatus(r).label === filterStatus);
    }

    return result;
  }, [growthRecords, searchTerm, filterStatus]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    const attention = growthRecords.filter(r => getStatus(r).label !== 'Normal').length;
    const recentWeight = growthRecords.slice(0, 5).reduce((acc, r) => acc + (parseFloat(r.weight) || 0), 0) / 5;
    
    return [
      { label: 'Total Records', value: growthRecords.length, icon: ClipboardList, color: C.primary, bg: C.primaryLight },
      { label: 'Avg. Recent Weight', value: `${recentWeight.toFixed(1)} kg`, icon: Weight, color: C.blue, bg: C.blueLight },
      { label: 'Growth Flags', value: attention, icon: AlertCircle, color: C.red, bg: C.redLight },
      { label: 'Active Tracking', value: babies.length, icon: Baby, color: C.green, bg: C.greenLight },
    ];
  }, [growthRecords, babies]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 700, color: C.muted }}>Initializing Growth Analytics...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <AdminLayout user={{ fname: 'Admin' }}>
      <div style={{ background: C.bg, minHeight: '100vh', padding: '2rem 2.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* --- Header --- */}
        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-0.025em' }}>Growth Records Dashboard</h1>
              <p style={{ color: C.muted, marginTop: '0.4rem', fontSize: '1rem' }}>Monitor and analyze pediatric physical development metrics.</p>
            </div>
            <button 
              onClick={() => handleOpenDrawer()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: C.primary, border: 'none', borderRadius: '12px', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}
            >
              <Plus size={18} strokeWidth={3} /> Add Measurement
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

        {/* --- Filters --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', background: 'white', padding: '0.35rem', borderRadius: '12px', border: `1px solid ${C.border}` }}>
            {['All', 'Normal', 'Review', 'Attention'].map(t => (
              <button 
                key={t}
                onClick={() => { setFilterStatus(t); setCurrentPage(1); }}
                style={{ 
                  padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', 
                  background: filterStatus === t ? C.primaryLight : 'transparent',
                  color: filterStatus === t ? C.primary : C.muted,
                  fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '450px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search child name..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Child Profile</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Age Detail</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Height (cm)</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Weight (kg)</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Entry Date</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length > 0 ? paginatedRecords.map(record => {
                const status = getStatus(record);
                return (
                  <tr key={record._id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue }}>
                          <Baby size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, color: C.text, fontSize: '0.9rem' }}>{record.babyId?.babyName || 'Unknown'}</p>
                          <p style={{ fontSize: '0.7rem', color: C.muted }}>Reg: {new Date(record.babyId?.birthDate).getFullYear()}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ fontWeight: 700, color: C.secondary, fontSize: '0.9rem' }}>{formatAge(record.age)}</span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: C.text }}>
                        <Ruler size={14} color={C.muted} /> {record.height}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: C.text }}>
                        <Weight size={14} color={C.muted} /> {record.weight || '--'}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.muted, fontSize: '0.85rem', fontWeight: 600 }}>
                        <Calendar size={14} /> {new Date(record.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', background: status.bg, color: status.color, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                        <status.icon size={12} /> {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleOpenDrawer(record)} style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', background: C.primaryLight, color: C.primary, cursor: 'pointer' }} title="Edit Record"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(record._id)} style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', background: C.redLight, color: C.red, cursor: 'pointer' }} title="Delete Record"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" style={{ padding: '5rem', textAlign: 'center' }}>
                    <p style={{ fontWeight: 800, color: C.text, fontSize: '1.1rem' }}>No growth measurements found</p>
                    <p style={{ color: C.muted, marginTop: '0.5rem' }}>Try adjusting your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div style={{ padding: '1.25rem 1.5rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600 }}>
              Showing {paginatedRecords.length} of {filteredRecords.length} entries
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

        {/* --- Form Drawer --- */}
        {isDrawerOpen && (
          <>
            <div onClick={() => setIsDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000 }} />
            <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', background: 'white', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', animation: 'slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              
              <div style={{ padding: '1.75rem 2rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: C.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: C.text }}>{editingId ? 'Edit Record' : 'New Entry'}</h2>
                    <p style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase' }}>Growth Metrics Registry</p>
                  </div>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: `1px solid ${C.border}`, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>&times;</button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                <form id="growth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  
                  <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${C.border}` }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Target Child Profile</label>
                        <select 
                            value={formData.babyId} 
                            onChange={handleBabySelect}
                            required
                            style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.9rem', fontWeight: 600, outline: 'none' }}
                        >
                            <option value="">Select child...</option>
                            {babies.map(baby => (
                            <option key={baby._id} value={baby._id}>{baby.babyName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Measurement Date</label>
                        <input 
                            type="date" 
                            value={formData.date} 
                            onChange={handleDateChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                            style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.9rem', fontWeight: 600, outline: 'none' }}
                        />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Height (cm)</label>
                        <div style={{ position: 'relative' }}>
                            <Ruler size={16} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input 
                                type="number" step="0.1" value={formData.height} 
                                onChange={(e) => setFormData({...formData, height: e.target.value})}
                                required placeholder="0.0"
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Weight (kg)</label>
                        <div style={{ position: 'relative' }}>
                            <Weight size={16} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input 
                                type="number" step="0.01" value={formData.weight} 
                                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                                placeholder="0.0"
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
                            />
                        </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: C.secondary, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Head Circumference (cm)</label>
                    <input 
                        type="number" step="0.1" value={formData.headCircumference} 
                        onChange={(e) => setFormData({...formData, headCircumference: e.target.value})}
                        placeholder="0.0"
                        style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
                    />
                  </div>

                  <div style={{ padding: '1rem', background: C.blueLight, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Activity size={20} color={C.blue} />
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: C.blue, textTransform: 'uppercase' }}>Auto-Calculation</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text }}>Age at Entry: {formatAge(formData.age)}</p>
                    </div>
                  </div>

                </form>
              </div>

              <div style={{ padding: '1.5rem 2rem', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, display: 'flex', gap: '1rem' }}>
                <button onClick={() => setIsDrawerOpen(false)} style={{ flex: 1, padding: '0.85rem', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '10px', fontWeight: 800, color: C.text, cursor: 'pointer' }}>Cancel</button>
                <button form="growth-form" type="submit" style={{ flex: 1, padding: '0.85rem', background: C.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)' }}>{editingId ? 'Update Record' : 'Save Measurement'}</button>
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
      `}</style>
    </AdminLayout>
  );
};

export default AdminGrowthPage;
