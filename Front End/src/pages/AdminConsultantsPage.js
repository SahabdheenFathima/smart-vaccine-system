import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';

const AdminConsultantsPage = () => {
  const [userData, setUserData] = useState(null);
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal states
  const [isConsultantModalOpen, setIsConsultantModalOpen] = useState(false);
  const [currentConsultant, setCurrentConsultant] = useState(null);
  
  // Smart Availability State
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  
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
        if (data.status === "ok") {
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

  const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (!currentConsultant) {
          toast.success(`✅ Consultant created! Login credentials sent to ${consultantData.email}`);
        } else {
          toast.success('Consultant profile updated');
        }
        setIsConsultantModalOpen(false);
        fetchConsultants();
      } else {
        toast.error(data.error || "Failed to save consultant");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (consultant) => {
    if (!window.confirm(`Permanently delete Dr. ${consultant.name}'s profile and system account?`)) return;
    try {
      const res = await fetch(`http://localhost:5001/api/consultants/${consultant._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'ok') {
        toast.success('Consultant and system account deleted');
        fetchConsultants();
      } else {
        toast.error(data.error || 'Deletion failed');
      }
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="badge-premium animate-pulse">Loading Admin Dashboard...</div>
    </div>
  );

  return (
    <AdminLayout user={userData}>
      <div className="container-full py-12 animate-slide">
        <header className="flex-center-between mb-big">
          <div>
            <h1 className="text-huge">Admin Dashboard</h1>
            <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>Manage consultants and appointments across departments.</p>
          </div>
          <button onClick={() => { 
            setCurrentConsultant(null); 
            setSelectedDays(['Monday', 'Wednesday', 'Friday']);
            setSelectedSlots(['09:00 AM', '10:00 AM', '11:00 AM']);
            setIsConsultantModalOpen(true); 
          }} className="btn-premium">
            + Add Consultant
          </button>
        </header>

        {/* Dashboard Analytics Widgets */}
        <div className="grid-main mb-big" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
            <div className="card-premium" style={{ padding: '1.5rem' }}>
                <h4 className="text-muted text-sm font-bold uppercase">Total Consultants</h4>
                <p className="text-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--primary)' }}>{consultants.length}</p>
            </div>
        </div>

        {/* Consultants Section */}
        <section className="mb-big">
          <h2 className="text-title mb-6">Consultant Management</h2>
          <div className="grid-main" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {consultants.map(c => (
              <div key={c._id} className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Dr. {c.name}</h3>
                    <p className="text-muted text-sm">{c.specialization}</p>
                  </div>
                  <span className={`badge-premium ${c.status === 'Active' ? '' : 'badge-disabled'}`} style={{ 
                      background: c.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: c.status === 'Active' ? '#10b981' : '#ef4444'
                  }}>
                    {c.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <p><strong>Dept:</strong> {c.department}</p>
                  <p><strong>Exp:</strong> {c.experience} years</p>
                  <p><strong>Days:</strong> {c.available_days.join(', ')}</p>
                </div>
                <button 
                  onClick={() => { 
                    setCurrentConsultant(c); 
                    setSelectedDays(c.available_days || []);
                    setSelectedSlots(c.available_slots || []);
                    setIsConsultantModalOpen(true); 
                  }}
                  className="btn-outline-premium mt-auto" style={{ padding: '0.5rem' }}>
                  Edit Profile
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                  🗑 Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Consultant Modal - Redesigned Clean Tech Layout */}
        {isConsultantModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '2rem' }}>
            <div className="animate-slide" style={{ 
              background: 'var(--bg-card)', 
              width: '100%', 
              maxWidth: '800px', 
              maxHeight: '92vh', 
              overflowY: 'auto', 
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              padding: '2.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 className="text-huge" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{currentConsultant ? 'Update Profile' : 'Onboard New Consultant'}</h2>
                    <p className="text-muted" style={{ fontWeight: 500 }}>{currentConsultant ? 'Modify existing system credentials and availability.' : 'Initialize credentials and configure clinical availability.'}</p>
                </div>
                <button onClick={() => setIsConsultantModalOpen(false)} style={{ background: 'var(--bg-main)', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSaveConsultant} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                
                {/* 1. Basic Information */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <h3 className="text-title" style={{ fontSize: '1.1rem' }}>Basic Information</h3>
                    </div>
                    
                    <div className="grid-main" style={{ gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem' }}>FULL NAME</label>
                            <input name="name" defaultValue={currentConsultant?.name} required className="input-field" placeholder="Dr. Jane Smith" style={{ borderRadius: '12px' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem' }}>REGISTRATION NO</label>
                            <input name="registration_no" defaultValue={currentConsultant?.registration_no} required className="input-field" placeholder="SLMC-XXXXX" style={{ borderRadius: '12px' }} />
                        </div>
                    </div>

                    {!currentConsultant && (
                        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(79, 70, 229, 0.04)', borderRadius: '16px', border: '1.5px dashed rgba(79, 70, 229, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <svg width="16" height="16" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.02em' }}>SYSTEM CREDENTIAL EMAIL</label>
                            </div>
                            <input name="email" type="email" required className="input-field" placeholder="consultant@hospital.gov.lk" style={{ background: 'white', borderColor: 'rgba(79, 70, 229, 0.15)' }} />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem', fontWeight: 500 }}>Account activation details will be sent immediately upon creation.</p>
                        </div>
                    )}
                </section>

                <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

                {/* 2. Professional Details */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-title" style={{ fontSize: '1.1rem' }}>Professional Details</h3>
                    </div>

                    <div className="grid-main" style={{ gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem' }}>SPECIALIZATION</label>
                            <select name="specialization" defaultValue={currentConsultant?.specialization || "Pediatrician"} className="input-field" style={{ height: '52px' }}>
                                <option>Pediatrician</option>
                                <option>Vaccination Officer</option>
                                <option>Child Nutritionist</option>
                                <option>Development Specialist</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem' }}>DEPARTMENT</label>
                            <select name="department" defaultValue={currentConsultant?.department || "Child Clinic"} className="input-field" style={{ height: '52px' }}>
                                <option>Child Clinic</option>
                                <option>Vaccination Unit</option>
                                <option>Nutrition Clinic</option>
                                <option>Development Clinic</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem' }}>QUALIFICATION</label>
                            <input name="qualification" defaultValue={currentConsultant?.qualification} required className="input-field" placeholder="MBBS, MD (Pediatrics)" />
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem' }}>YEARS OF EXPERIENCE</label>
                            <input name="experience" type="number" defaultValue={currentConsultant?.experience} required className="input-field" placeholder="10" />
                        </div>
                    </div>
                </section>

                <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

                {/* 3. Availability Component */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-title" style={{ fontSize: '1.1rem' }}>Clinical Availability</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '1rem' }}>ACTIVE DAYS</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {daysOfWeek.map(day => (
                                    <button 
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        style={{ 
                                            padding: '0.6rem 1.25rem', borderRadius: '12px', border: '2px solid', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
                                            borderColor: selectedDays.includes(day) ? 'var(--primary)' : 'var(--border-color)',
                                            background: selectedDays.includes(day) ? 'var(--primary-glow)' : 'transparent',
                                            color: selectedDays.includes(day) ? 'var(--primary)' : 'var(--text-secondary)'
                                        }}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '1rem' }}>CONSULTATION SLOTS</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                                {commonSlots.map(slot => (
                                    <button 
                                        key={slot}
                                        type="button"
                                        onClick={() => toggleSlot(slot)}
                                        style={{ 
                                            padding: '0.6rem', borderRadius: '10px', border: '1.5px solid', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.2s',
                                            borderColor: selectedSlots.includes(slot) ? 'var(--primary)' : 'var(--border-color)',
                                            background: selectedSlots.includes(slot) ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                                            color: selectedSlots.includes(slot) ? 'var(--primary)' : 'var(--text-secondary)'
                                        }}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

                {/* 4. Operations */}
                <section>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem' }}>HOSPITAL AFFILIATION</label>
                            <input name="hospital_name" defaultValue={currentConsultant?.hospital_name || "Central Government Hospital"} required className="input-field" />
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem' }}>ACCOUNT STATUS</label>
                            <select name="status" defaultValue={currentConsultant?.status || "Active"} className="input-field">
                                <option>Active</option>
                                <option>On Leave</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end gap-4 mt-8 pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsConsultantModalOpen(false)} 
                    style={{ padding: '1rem 2rem', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'transparent', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-premium" 
                    disabled={isSubmitting}
                    style={{ 
                        padding: '1rem 2.5rem', 
                        borderRadius: '14px', 
                        background: 'linear-gradient(135deg, #4F46E5, #6366f1)',
                        boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)',
                        fontSize: '1rem'
                    }}
                  >
                    {isSubmitting ? (currentConsultant ? 'Saving...' : 'Deploying Credentials...') : (currentConsultant ? 'Update Profile' : 'Create & Send Credentials')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminConsultantsPage;
