import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import toast from 'react-hot-toast';

const AdminConsultantsPage = () => {
  const [userData, setUserData] = useState(null);
  const [consultants, setConsultants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal states
  const [isConsultantModalOpen, setIsConsultantModalOpen] = useState(false);
  const [currentConsultant, setCurrentConsultant] = useState(null);

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
          fetchBookings();
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

  const fetchBookings = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/bookings");
      const data = await res.json();
      if (data.status === "ok") setBookings(data.data);
    } catch (err) { toast.error("Failed to fetch bookings"); }
  };

  const handleSaveConsultant = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const consultantData = {
      name: formData.get('name'),
      registration_no: formData.get('registration_no'),
      specialization: formData.get('specialization'),
      qualification: formData.get('qualification'),
      experience: parseInt(formData.get('experience')),
      hospital_name: formData.get('hospital_name'),
      department: formData.get('department'),
      available_days: formData.get('available_days').split(',').map(d => d.trim()),
      available_slots: formData.get('available_slots').split(',').map(s => s.trim()),
      status: formData.get('status')
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
        toast.success(currentConsultant ? "Consultant updated" : "Consultant created");
        setIsConsultantModalOpen(false);
        fetchConsultants();
      } else {
        toast.error(data.error || "Failed to save consultant");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const updateBookingStatus = async (id, status, reason = "") => {
    try {
      const res = await fetch(`http://localhost:5001/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejection_reason: reason }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        toast.success(`Booking ${status.toLowerCase()}`);
        fetchBookings();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="badge-premium animate-pulse">Loading Admin Dashboard...</div>
    </div>
  );

  return (
    <MainLayout user={userData}>
      <div className="container-full py-12 animate-slide">
        <header className="flex-center-between mb-big">
          <div>
            <h1 className="text-huge">Admin Dashboard</h1>
            <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>Manage consultants and appointments across departments.</p>
          </div>
          <button onClick={() => { setCurrentConsultant(null); setIsConsultantModalOpen(true); }} className="btn-premium">
            + Add Consultant
          </button>
        </header>

        {/* Dashboard Analytics Widgets */}
        <div className="grid-main mb-big" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="card-premium" style={{ padding: '1.5rem' }}>
                <h4 className="text-muted text-sm font-bold uppercase">Total Consultants</h4>
                <p className="text-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--primary)' }}>{consultants.length}</p>
            </div>
            <div className="card-premium" style={{ padding: '1.5rem' }}>
                <h4 className="text-muted text-sm font-bold uppercase">Today's Bookings</h4>
                <p className="text-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--primary)' }}>
                    {bookings.filter(b => new Date(b.created_at).toDateString() === new Date().toDateString()).length}
                </p>
            </div>
            <div className="card-premium" style={{ padding: '1.5rem' }}>
                <h4 className="text-muted text-sm font-bold uppercase">Pending Approvals</h4>
                <p className="text-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: '#f59e0b' }}>
                    {bookings.filter(b => b.status === 'Pending').length}
                </p>
            </div>
            <div className="card-premium" style={{ padding: '1.5rem' }}>
                <h4 className="text-muted text-sm font-bold uppercase">Priority Cases</h4>
                <p className="text-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: '#ef4444' }}>
                    {bookings.filter(b => b.priority_level === 'Urgent').length}
                </p>
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
                  onClick={() => { setCurrentConsultant(c); setIsConsultantModalOpen(true); }}
                  className="btn-outline-premium mt-auto" style={{ padding: '0.5rem' }}>
                  Edit Profile
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Appointments Section */}
        <section>
          <h2 className="text-title mb-6">Recent Appointments & Queue</h2>
          <div className="card-premium" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Token</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Patient</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Consultant</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date & Time</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Priority</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{b.token_no}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{b.child_id?.babyName || 'Unknown'}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>Dr. {b.consultant_id?.name}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                        {new Date(b.booking_date).toLocaleDateString()} at {b.booking_time}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                            background: b.priority_level === 'Urgent' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                            color: b.priority_level === 'Urgent' ? '#ef4444' : '#6b7280'
                        }}>
                            {b.priority_level}
                        </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                            background: b.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                        b.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: b.status === 'Approved' ? '#10b981' : 
                                   b.status === 'Pending' ? '#f59e0b' : '#ef4444'
                        }}>
                            {b.status}
                        </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                        {b.status === 'Pending' && (
                            <>
                                <button onClick={() => updateBookingStatus(b._id, 'Approved')} style={{ padding: '0.25rem 0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Approve</button>
                                <button onClick={() => {
                                    const reason = window.prompt("Rejection Reason:");
                                    if(reason) updateBookingStatus(b._id, 'Rejected', reason);
                                }} style={{ padding: '0.25rem 0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Reject</button>
                            </>
                        )}
                        {b.status === 'Approved' && (
                            <button onClick={() => updateBookingStatus(b._id, 'Completed')} style={{ padding: '0.25rem 0.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Mark Done</button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Consultant Modal */}
        {isConsultantModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card-premium" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 className="text-title mb-6">{currentConsultant ? 'Edit Consultant' : 'Add New Consultant'}</h2>
              <form onSubmit={handleSaveConsultant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label className="text-sm font-bold mb-2 block">Full Name</label>
                        <input name="name" defaultValue={currentConsultant?.name} required className="input-premium w-full" placeholder="e.g. Jane Doe" />
                    </div>
                    <div>
                        <label className="text-sm font-bold mb-2 block">Registration No</label>
                        <input name="registration_no" defaultValue={currentConsultant?.registration_no} required className="input-premium w-full" />
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label className="text-sm font-bold mb-2 block">Specialization</label>
                        <select name="specialization" defaultValue={currentConsultant?.specialization || "Pediatrician"} className="input-premium w-full">
                            <option>Pediatrician</option>
                            <option>Vaccination Officer</option>
                            <option>Child Nutritionist</option>
                            <option>Development Specialist</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold mb-2 block">Department</label>
                        <select name="department" defaultValue={currentConsultant?.department || "Child Clinic"} className="input-premium w-full">
                            <option>Child Clinic</option>
                            <option>Vaccination Unit</option>
                            <option>Nutrition Clinic</option>
                            <option>Development Clinic</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label className="text-sm font-bold mb-2 block">Qualification</label>
                        <input name="qualification" defaultValue={currentConsultant?.qualification} required className="input-premium w-full" placeholder="e.g. MBBS, MD" />
                    </div>
                    <div>
                        <label className="text-sm font-bold mb-2 block">Years of Experience</label>
                        <input name="experience" type="number" defaultValue={currentConsultant?.experience} required className="input-premium w-full" />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-bold mb-2 block">Hospital Name</label>
                    <input name="hospital_name" defaultValue={currentConsultant?.hospital_name || "Central Government Hospital"} required className="input-premium w-full" />
                </div>

                <div>
                    <label className="text-sm font-bold mb-2 block">Available Days (Comma separated)</label>
                    <input name="available_days" defaultValue={currentConsultant?.available_days?.join(', ') || "Monday, Wednesday, Friday"} required className="input-premium w-full" />
                </div>

                <div>
                    <label className="text-sm font-bold mb-2 block">Available Slots (Comma separated)</label>
                    <input name="available_slots" defaultValue={currentConsultant?.available_slots?.join(', ') || "09:00 AM, 10:00 AM, 11:00 AM"} required className="input-premium w-full" />
                </div>

                <div>
                    <label className="text-sm font-bold mb-2 block">Status</label>
                    <select name="status" defaultValue={currentConsultant?.status || "Active"} className="input-premium w-full">
                        <option>Active</option>
                        <option>On Leave</option>
                        <option>Inactive</option>
                    </select>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => setIsConsultantModalOpen(false)} className="btn-outline-premium">Cancel</button>
                  <button type="submit" className="btn-premium">Save Consultant</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminConsultantsPage;
