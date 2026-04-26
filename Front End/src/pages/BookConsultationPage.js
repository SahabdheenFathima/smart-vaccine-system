import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import toast from 'react-hot-toast';

const BookConsultationPage = () => {
  const [userData, setUserData] = useState(null);
  const [babies, setBabies] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Booking Form State
  const [step, setStep] = useState(1);
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState('Normal');

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
          fetchBabies(data.data.email);
          fetchConsultants();
          fetchMyBookings(data.data._id);
        } else {
          navigate("/sign-in");
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  const fetchBabies = async (email) => {
    try {
      const res = await fetch(`http://localhost:5001/api/user-babies/${email}`);
      const data = await res.json();
      if (data.status === "ok") setBabies(data.data);
    } catch (err) { toast.error("Failed to fetch profiles"); }
  };

  const fetchConsultants = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/consultants");
      const data = await res.json();
      if (data.status === "ok") setConsultants(data.data.filter(c => c.status === 'Active'));
    } catch (err) { toast.error("Failed to fetch consultants"); }
  };

  const fetchMyBookings = async (userId) => {
      try {
          const res = await fetch(`http://localhost:5001/api/bookings/parent/${userId}`);
          const data = await res.json();
          if (data.status === "ok") setMyBookings(data.data);
      } catch (err) { console.error("Error fetching bookings", err); }
  };

  const handleBook = async () => {
      if(!selectedChild || !selectedConsultant || !selectedDate || !selectedTime || !reason) {
          toast.error("Please fill all required fields");
          return;
      }

      try {
          const res = await fetch("http://localhost:5001/api/bookings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  parent_id: userData._id,
                  child_id: selectedChild,
                  consultant_id: selectedConsultant,
                  booking_date: selectedDate,
                  booking_time: selectedTime,
                  reason,
                  priority_level: priority
              })
          });
          const data = await res.json();
          if(data.status === "ok") {
              toast.success("Consultation Booked Successfully!");
              setStep(1);
              setSelectedChild('');
              setSelectedDepartment('');
              setSelectedConsultant('');
              setSelectedDate('');
              setSelectedTime('');
              setReason('');
              setPriority('Normal');
              fetchMyBookings(userData._id);
          } else {
              toast.error(data.error || "Failed to book");
          }
      } catch(err) {
          toast.error("An error occurred");
      }
  }

  const filteredConsultants = consultants.filter(c => c.department === selectedDepartment);
  const selectedConsultantObj = consultants.find(c => c._id === selectedConsultant);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="badge-premium animate-pulse">Loading Consultation Portal...</div>
    </div>
  );

  return (
    <MainLayout user={userData}>
      <div className="container-full py-12 animate-slide">
        <header className="mb-big" style={{ display: 'flex', gap: '2rem', alignItems: 'center', background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ flex: 1 }}>
            <h1 className="text-huge" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Child Health Consultation</h1>
            <p className="text-muted" style={{ fontSize: '1.125rem', lineHeight: '1.6' }}>Book appointments with specialist doctors at government healthcare centers. Fast, easy, and secure token generation for specialized childcare departments.</p>
          </div>
          <div style={{ width: '300px', height: '180px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
            <img src="/consultation_banner_1777188119532.png" alt="Consultation Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </header>

        <div className="grid-main" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* Booking Wizard */}
            <div className="card-premium">
                <h2 className="text-title mb-6">Book an Appointment</h2>
                
                {/* Step Indicators */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
                    {['Child', 'Department & Doctor', 'Schedule', 'Confirm'].map((s, i) => (
                        <div key={s} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)' }}>
                            <div style={{ 
                                width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                                background: step > i + 1 ? 'var(--primary)' : step === i + 1 ? 'var(--primary)' : 'var(--bg-main)',
                                color: step >= i + 1 ? 'white' : 'var(--text-secondary)',
                                border: `2px solid ${step >= i + 1 ? 'var(--primary)' : 'var(--border-color)'}`
                            }}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: step >= i + 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s}</span>
                        </div>
                    ))}
                </div>

                <div style={{ minHeight: '300px' }}>
                    {step === 1 && (
                        <div className="animate-slide">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Select Child Profile</h3>
                            {babies.length === 0 ? (
                                <div className="p-6 bg-red-50 text-red-600 rounded-xl">No child profiles found. Please register a baby first.</div>
                            ) : (
                                <div className="grid-main" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                                    {babies.map(baby => (
                                        <div 
                                            key={baby._id} 
                                            onClick={() => setSelectedChild(baby._id)}
                                            style={{ 
                                                padding: '1.5rem', border: `2px solid ${selectedChild === baby._id ? 'var(--primary)' : 'var(--border-color)'}`, 
                                                borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                                background: selectedChild === baby._id ? 'rgba(79, 70, 229, 0.05)' : 'transparent'
                                            }}
                                        >
                                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👶</div>
                                            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{baby.babyName}</h4>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-end mt-8">
                                <button disabled={!selectedChild} onClick={() => setStep(2)} className="btn-premium">Next Step</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-slide">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Select Department</h3>
                            <select 
                                className="input-premium w-full mb-6" 
                                value={selectedDepartment} 
                                onChange={(e) => { setSelectedDepartment(e.target.value); setSelectedConsultant(''); }}
                            >
                                <option value="">-- Choose Department --</option>
                                <option value="Child Clinic">Child Clinic</option>
                                <option value="Vaccination Unit">Vaccination Unit</option>
                                <option value="Nutrition Clinic">Nutrition Clinic</option>
                                <option value="Development Clinic">Development Clinic</option>
                            </select>

                            {selectedDepartment && (
                                <>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Select Consultant</h3>
                                    {filteredConsultants.length === 0 ? (
                                        <p className="text-muted">No consultants currently available in this department.</p>
                                    ) : (
                                        <div className="grid-main" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                                            {filteredConsultants.map(c => (
                                                <div 
                                                    key={c._id} 
                                                    onClick={() => setSelectedConsultant(c._id)}
                                                    style={{ 
                                                        padding: '1.5rem', border: `2px solid ${selectedConsultant === c._id ? 'var(--primary)' : 'var(--border-color)'}`, 
                                                        borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                                        background: selectedConsultant === c._id ? 'rgba(79, 70, 229, 0.05)' : 'transparent'
                                                    }}
                                                >
                                                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Dr. {c.name}</h4>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{c.specialization}</p>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}><strong>Exp:</strong> {c.experience} yrs</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="flex justify-between mt-8">
                                <button onClick={() => setStep(1)} className="btn-outline-premium">Back</button>
                                <button disabled={!selectedConsultant} onClick={() => setStep(3)} className="btn-premium">Next Step</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-slide">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label className="text-sm font-bold mb-2 block">Available Date</label>
                                    <input 
                                        type="date" 
                                        className="input-premium w-full" 
                                        value={selectedDate} 
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {selectedConsultantObj && (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.5rem' }}>
                                            Dr. {selectedConsultantObj.name} is available on: {selectedConsultantObj.available_days.join(', ')}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-bold mb-2 block">Preferred Time</label>
                                    <select className="input-premium w-full" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                                        <option value="">-- Choose Slot --</option>
                                        {selectedConsultantObj?.available_slots.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="text-sm font-bold mb-2 block">Reason for Visit</label>
                                <textarea 
                                    className="input-premium w-full" 
                                    rows="3" 
                                    placeholder="e.g. Missed vaccination advice, fever after vaccine..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="mb-6">
                                <label className="text-sm font-bold mb-2 block">Priority Level</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['Normal', 'Urgent'].map(p => (
                                        <label key={p} style={{ 
                                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px',
                                            cursor: 'pointer', background: priority === p ? (p === 'Urgent' ? 'rgba(239,68,68,0.1)' : 'rgba(79,70,229,0.1)') : 'transparent',
                                            borderColor: priority === p ? (p === 'Urgent' ? '#ef4444' : 'var(--primary)') : 'var(--border-color)'
                                        }}>
                                            <input type="radio" name="priority" value={p} checked={priority === p} onChange={() => setPriority(p)} />
                                            <span style={{ fontWeight: 600, color: p === 'Urgent' ? '#ef4444' : 'var(--text-primary)' }}>{p}</span>
                                        </label>
                                    ))}
                                </div>
                                {priority === 'Urgent' && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>Note: Urgent cases require valid medical justification upon arrival.</p>}
                            </div>

                            <div className="flex justify-between mt-8">
                                <button onClick={() => setStep(2)} className="btn-outline-premium">Back</button>
                                <button disabled={!selectedDate || !selectedTime || !reason} onClick={() => setStep(4)} className="btn-premium">Review Booking</button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-slide">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Booking Summary</h3>
                            <div style={{ background: 'var(--bg-main)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <span className="text-muted text-sm block mb-1">Patient Name</span>
                                        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{babies.find(b => b._id === selectedChild)?.babyName}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted text-sm block mb-1">Hospital / Department</span>
                                        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedConsultantObj?.hospital_name}</p>
                                        <p style={{ color: 'var(--text-secondary)' }}>{selectedDepartment}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted text-sm block mb-1">Consultant</span>
                                        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Dr. {selectedConsultantObj?.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted text-sm block mb-1">Date & Time</span>
                                        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedDate}</p>
                                        <p style={{ color: 'var(--text-secondary)' }}>{selectedTime}</p>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <span className="text-muted text-sm block mb-1">Reason</span>
                                        <p style={{ fontWeight: 600 }}>{reason}</p>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <span className="text-muted text-sm block mb-1">Priority</span>
                                        <span style={{ 
                                            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700,
                                            background: priority === 'Urgent' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                                            color: priority === 'Urgent' ? '#ef4444' : '#6b7280'
                                        }}>{priority}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-8">
                                <button onClick={() => setStep(3)} className="btn-outline-premium">Edit Details</button>
                                <button onClick={handleBook} className="btn-premium" style={{ background: '#10b981', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>Confirm Appointment</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* My Appointments Side Panel */}
            <div className="card-premium">
                <h2 className="text-title mb-6">My Appointments</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {myBookings.length === 0 ? (
                        <p className="text-muted text-center py-4">No appointments found.</p>
                    ) : (
                        myBookings.map(b => (
                            <div key={b._id} style={{ 
                                padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px',
                                borderLeft: `4px solid ${
                                    b.status === 'Approved' ? '#10b981' : 
                                    b.status === 'Pending' ? '#f59e0b' : 
                                    b.status === 'Completed' ? 'var(--primary)' : '#ef4444'
                                }`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{b.token_no}</span>
                                    <span style={{ 
                                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                                        background: b.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                                    b.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 
                                                    b.status === 'Completed' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: b.status === 'Approved' ? '#10b981' : 
                                               b.status === 'Pending' ? '#f59e0b' : 
                                               b.status === 'Completed' ? 'var(--primary)' : '#ef4444'
                                    }}>{b.status}</span>
                                </div>
                                <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Dr. {b.consultant_id?.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{b.consultant_id?.department}</p>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                    <span>📅 {new Date(b.booking_date).toLocaleDateString()}</span>
                                    <span>⏰ {b.booking_time}</span>
                                </div>
                                {b.rejection_reason && b.status === 'Rejected' && (
                                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.8rem', borderRadius: '4px' }}>
                                        Reason: {b.rejection_reason}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookConsultationPage;
