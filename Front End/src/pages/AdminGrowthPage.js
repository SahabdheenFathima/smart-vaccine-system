import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../components/templates/AdminLayout';
import serverURL from '../config';

const AdminGrowthPage = () => {
  const [growthRecords, setGrowthRecords] = useState([]);
  const [babies, setBabies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    babyId: '',
    date: new Date().toISOString().split('T')[0],
    height: '',
    weight: '',
    headCircumference: '',
    age: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

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
    if (record.height < 50) return { label: 'Review', color: '#ef4444', bg: '#fef2f2' };
    if (record.weight && record.weight > 20) return { label: 'Attention', color: '#f59e0b', bg: '#fffbeb' };
    return { label: 'Healthy', color: '#10b981', bg: '#ecfdf5' };
  };

  const filteredRecords = growthRecords.filter(record => 
    record.babyId?.babyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout user={{ fname: 'Admin' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Growth Records</h1>
            <p style={{ color: '#6b7280' }}>Manage child measurement data and growth tracking.</p>
          </div>
          <button 
            onClick={() => handleOpenDrawer()}
            style={{ 
              background: '#2563EB', color: 'white', border: 'none', padding: '0.75rem 1.5rem', 
              borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
            }}
          >
            + Add Measurement
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Search by child name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', width: '300px' }}
            />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600, fontSize: '0.875rem' }}>Child Name</th>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600, fontSize: '0.875rem' }}>Age</th>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600, fontSize: '0.875rem' }}>Height (cm)</th>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600, fontSize: '0.875rem' }}>Weight (kg)</th>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600, fontSize: '0.875rem' }}>Date</th>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No growth records found.</td></tr>
              ) : (
                filteredRecords.map((record) => {
                  const status = getStatus(record);
                  return (
                    <tr key={record._id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s', ':hover': { background: '#f9fafb' } }}>
                      <td style={{ padding: '1rem', fontWeight: 500, color: '#111827' }}>{record.babyId?.babyName || 'Unknown'}</td>
                      <td style={{ padding: '1rem', color: '#4b5563' }}>{formatAge(record.age)}</td>
                      <td style={{ padding: '1rem', color: '#4b5563' }}>{record.height}</td>
                      <td style={{ padding: '1rem', color: '#4b5563' }}>{record.weight || '-'}</td>
                      <td style={{ padding: '1rem', color: '#4b5563' }}>{new Date(record.date).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          background: status.bg, color: status.color, padding: '0.25rem 0.75rem', 
                          borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 
                        }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button onClick={() => handleOpenDrawer(record)} style={{ background: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', marginRight: '1rem', fontWeight: 600 }}>Edit</button>
                        <button onClick={() => handleDelete(record._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s' }}>
          <div style={{ width: '400px', background: 'white', height: '100%', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>{editingId ? 'Edit Measurement' : 'New Growth Entry'}</h2>
              <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>
            
            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
              <form id="growth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Child *</label>
                  <select 
                    value={formData.babyId} 
                    onChange={handleBabySelect}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="">Select a child...</option>
                    {babies.map(baby => (
                      <option key={baby._id} value={baby._id}>{baby.babyName} ({baby.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Measurement Date *</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={handleDateChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Height (cm) *</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="0"
                      value={formData.height} 
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      required
                      placeholder="e.g. 101.2"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Weight (kg)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={formData.weight} 
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="e.g. 16.1"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Head Circumference (cm)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    value={formData.headCircumference} 
                    onChange={(e) => setFormData({...formData, headCircumference: e.target.value})}
                    placeholder="e.g. 50.1"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Age at Measurement (Months)</label>
                  <input 
                    type="number" 
                    value={formData.age} 
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb', outline: 'none' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Auto-calculated from date of birth.</p>
                </div>

              </form>
            </div>
            
            <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '1rem', background: '#f9fafb' }}>
              <button onClick={() => setIsDrawerOpen(false)} style={{ flex: 1, padding: '0.75rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button form="growth-form" type="submit" style={{ flex: 1, padding: '0.75rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px rgba(37,99,235,0.2)' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminGrowthPage;
