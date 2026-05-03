import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import toast from 'react-hot-toast';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Baby, 
  User, 
  Building2, 
  Info, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  Activity,
  UserCheck,
  MapPin,
  Search,
  Timer,
  Hash
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
  const selectedBabyObj = babies.find(b => b._id === selectedChild);

  if (loading) return (
    <MainLayout user={userData}>
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 700, color: C.muted }}>Initializing Portal...</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </MainLayout>
  );

  return (
    <MainLayout user={userData}>
      <div style={{ background: C.bg, minHeight: '100vh', padding: '2.5rem 2.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* --- Header Hero --- */}
        <header style={{ marginBottom: '2.5rem', background: `linear-gradient(135deg, ${C.primary}, #6366F1)`, borderRadius: '24px', padding: '3rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.025em' }}>Consultation Portal</h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6 }}>Securely book pediatric consultations with specialist clinical departments. Our intelligent token system ensures minimal waiting times and priority care.</p>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} /> <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Government Certified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} /> <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>End-to-End Encrypted</span>
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', top: '50%', right: '5%', transform: 'translateY(-50%)', opacity: 0.2 }}>
            <Stethoscope size={240} />
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* --- LEFT: Booking Wizard --- */}
          <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>
                <Calendar size={22} strokeWidth={2.5} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: C.text }}>New Appointment Wizard</h2>
            </div>

            {/* Clinical Step Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '2px', background: C.border, zIndex: 0 }}></div>
              <div style={{ position: 'absolute', top: '16px', left: '10%', width: `${(step-1)*27}%`, height: '2px', background: C.primary, zIndex: 0, transition: 'width 0.4s ease' }}></div>
              
              {['Patient', 'Doctor', 'Schedule', 'Confirm'].map((s, i) => {
                const isActive = step === i + 1;
                const isDone = step > i + 1;
                return (
                  <div key={s} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '80px' }}>
                    <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900,
                        background: isDone ? C.primary : isActive ? 'white' : C.bg,
                        color: isDone ? 'white' : isActive ? C.primary : C.muted,
                        border: `2.5px solid ${isDone || isActive ? C.primary : C.border}`,
                        transition: 'all 0.3s'
                    }}>
                      {isDone ? <CheckCircle2 size={16} strokeWidth={3} /> : i + 1}
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isActive ? C.primary : C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ minHeight: '350px' }}>
              {/* STEP 1: CHILD SELECTION */}
              {step === 1 && (
                <div style={{ animation: 'slideIn 0.3s ease-out' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: C.text, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Baby size={20} color={C.primary} /> Select Clinical Profile
                  </h3>
                  {babies.length === 0 ? (
                    <div style={{ padding: '2rem', background: C.redLight, borderRadius: '16px', textAlign: 'center', border: `1px solid ${C.red}33` }}>
                        <p style={{ color: C.red, fontWeight: 700 }}>No child profiles found. Please register a baby first.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
                      {babies.map(baby => (
                        <div 
                          key={baby._id} 
                          onClick={() => setSelectedChild(baby._id)}
                          style={{ 
                            padding: '1.5rem', border: `2px solid ${selectedChild === baby._id ? C.primary : C.border}`, 
                            borderRadius: '20px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                            background: selectedChild === baby._id ? C.primaryLight : 'white',
                            boxShadow: selectedChild === baby._id ? `0 4px 15px ${C.primary}15` : 'none'
                          }}
                        >
                          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 1rem' }}>👶</div>
                          <h4 style={{ fontWeight: 800, color: C.text }}>{baby.babyName}</h4>
                          <p style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600, marginTop: '0.25rem' }}>{baby.gender} · {new Date(baby.birthDate).getFullYear()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                    <button disabled={!selectedChild} onClick={() => setStep(2)} style={{ padding: '0.85rem 2.5rem', background: C.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: selectedChild ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                      Next Step <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DOCTOR SELECTION */}
              {step === 2 && (
                <div style={{ animation: 'slideIn 0.3s ease-out' }}>
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: C.text, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={20} color={C.primary} /> Hospital Department
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                      {['Child Clinic', 'Vaccination Unit', 'Nutrition Clinic', 'Development Clinic'].map(dept => (
                        <div 
                            key={dept} onClick={() => { setSelectedDepartment(dept); setSelectedConsultant(''); }}
                            style={{ 
                                padding: '1rem', border: `2px solid ${selectedDepartment === dept ? C.primary : C.border}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                                background: selectedDepartment === dept ? C.primaryLight : 'white', fontWeight: 800, fontSize: '0.85rem', color: selectedDepartment === dept ? C.primary : C.secondary
                            }}
                        >
                            {dept}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedDepartment && (
                    <div style={{ animation: 'fadeIn 0.3s' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: C.text, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserCheck size={20} color={C.primary} /> Specialist Consultant
                      </h3>
                      {filteredConsultants.length === 0 ? (
                        <p style={{ color: C.muted, fontStyle: 'italic' }}>No specialists currently listed for this department.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                          {filteredConsultants.map(c => (
                            <div 
                              key={c._id} 
                              onClick={() => setSelectedConsultant(c._id)}
                              style={{ 
                                padding: '1.5rem', border: `2px solid ${selectedConsultant === c._id ? C.primary : C.border}`, 
                                borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s',
                                background: selectedConsultant === c._id ? C.primaryLight : 'white'
                              }}
                            >
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}><User size={24} /></div>
                                <div>
                                    <h4 style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>Dr. {c.name}</h4>
                                    <p style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 600 }}>{c.specialization}</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.bg, padding: '0.6rem 0.85rem', borderRadius: '10px' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: C.muted }}>Experience: {c.experience} Years</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: C.green }}>Active</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                    <button onClick={() => setStep(1)} style={{ padding: '0.85rem 2rem', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '12px', fontWeight: 800, cursor: 'pointer', color: C.secondary, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <ArrowLeft size={18} /> Back
                    </button>
                    <button disabled={!selectedConsultant} onClick={() => setStep(3)} style={{ padding: '0.85rem 2.5rem', background: C.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: selectedConsultant ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                      Next Step <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SCHEDULE */}
              {step === 3 && (
                <div style={{ animation: 'slideIn 0.3s ease-out' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: C.text, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} color={C.primary} /> Visit Date</h3>
                      <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: `2px solid ${C.border}`, background: C.bg, fontSize: '0.95rem', fontWeight: 700, outline: 'none' }}
                      />
                      {selectedConsultantObj && (
                        <p style={{ fontSize: '0.75rem', color: C.primary, fontWeight: 700, marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Info size={14} /> Weekly Availability: {selectedConsultantObj.available_days.join(', ')}
                        </p>
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: C.text, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={18} color={C.primary} /> Time Slot</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {selectedConsultantObj?.available_slots.map(s => (
                          <div 
                            key={s} onClick={() => setSelectedTime(s)}
                            style={{ 
                                padding: '0.75rem', border: `2px solid ${selectedTime === s ? C.primary : C.border}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                                background: selectedTime === s ? C.primaryLight : 'white', fontWeight: 800, fontSize: '0.8rem', color: selectedTime === s ? C.primary : C.secondary
                            }}
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: C.text, marginBottom: '1rem' }}>Reason & Priority</h3>
                    <textarea 
                        value={reason} onChange={(e) => setReason(e.target.value)}
                        placeholder="Please describe symptoms or reason for clinical review..."
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: `2px solid ${C.border}`, background: C.bg, fontSize: '0.9rem', fontWeight: 600, outline: 'none', minHeight: '100px', marginBottom: '1.5rem' }}
                    />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {['Normal', 'Urgent'].map(p => (
                            <div 
                                key={p} onClick={() => setPriority(p)}
                                style={{ 
                                    flex: 1, padding: '1rem', border: `2px solid ${priority === p ? (p === 'Urgent' ? C.red : C.primary) : C.border}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    background: priority === p ? (p === 'Urgent' ? C.redLight : C.primaryLight) : 'white'
                                }}
                            >
                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${priority === p ? (p === 'Urgent' ? C.red : C.primary) : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {priority === p && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p === 'Urgent' ? C.red : C.primary }}></div>}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 900, color: priority === p ? (p === 'Urgent' ? C.red : C.primary) : C.text, fontSize: '0.9rem' }}>{p} Case</p>
                                    <p style={{ fontSize: '0.7rem', color: C.muted, fontWeight: 600 }}>{p === 'Urgent' ? 'Immediate clinical review required' : 'Standard clinical queue'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                    <button onClick={() => setStep(2)} style={{ padding: '0.85rem 2rem', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '12px', fontWeight: 800, cursor: 'pointer', color: C.secondary, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <ArrowLeft size={18} /> Back
                    </button>
                    <button disabled={!selectedDate || !selectedTime || !reason} onClick={() => setStep(4)} style={{ padding: '0.85rem 2.5rem', background: C.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: (selectedDate && selectedTime && reason) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                      Review Details <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: CONFIRMATION */}
              {step === 4 && (
                <div style={{ animation: 'slideIn 0.3s ease-out' }}>
                  <div style={{ background: C.bg, borderRadius: '24px', padding: '2rem', border: `1px solid ${C.border}`, marginBottom: '2.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Patient Record</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👶</div>
                                <div>
                                    <p style={{ fontWeight: 900, color: C.text }}>{selectedBabyObj?.babyName}</p>
                                    <p style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600 }}>File Ref: #{selectedChild.slice(-6).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Clinical Specialist</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}><Stethoscope size={20} /></div>
                                <div>
                                    <p style={{ fontWeight: 900, color: C.text }}>Dr. {selectedConsultantObj?.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600 }}>{selectedDepartment}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Hospital Entity</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.secondary }}><Building2 size={20} /></div>
                                <p style={{ fontWeight: 800, color: C.text, fontSize: '0.9rem' }}>{selectedConsultantObj?.hospital_name}</p>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Visit Protocol</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue }}><Clock size={20} /></div>
                                <div>
                                    <p style={{ fontWeight: 900, color: C.text }}>{selectedDate}</p>
                                    <p style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 700 }}>Slot: {selectedTime}</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ gridColumn: '1 / -1', paddingTop: '1.5rem', borderTop: `1px dashed ${C.border}` }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Clinical Justification</p>
                            <p style={{ fontSize: '0.95rem', color: C.text, fontWeight: 600, lineHeight: 1.6 }}>{reason}</p>
                        </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                    <button onClick={() => setStep(3)} style={{ padding: '0.85rem 2rem', background: 'white', border: `1.5px solid ${C.border}`, borderRadius: '12px', fontWeight: 800, cursor: 'pointer', color: C.secondary }}>
                      Edit Details
                    </button>
                    <button onClick={handleBook} style={{ padding: '0.85rem 3rem', background: C.green, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: `0 4px 15px ${C.green}44` }}>
                      Confirm Consultation <ShieldCheck size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT: Appointment Ledger --- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <Activity size={20} color={C.primary} strokeWidth={2.5} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: C.text }}>Appointment Ledger</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {myBookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <Timer size={40} color={C.muted} style={{ opacity: 0.3 }} />
                    <p style={{ marginTop: '1rem', fontWeight: 700, color: C.muted, fontSize: '0.9rem' }}>No active bookings found</p>
                  </div>
                ) : (
                  myBookings.map(b => (
                    <div key={b._id} style={{ 
                      padding: '1.5rem', border: `1.5px solid ${C.border}`, borderRadius: '20px', position: 'relative', overflow: 'hidden',
                      borderLeft: `5px solid ${
                        b.status === 'Approved' ? C.green : 
                        b.status === 'Pending' ? C.amber : 
                        b.status === 'Completed' ? C.primary : C.red
                      }`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.65rem', fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Token Entry</p>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 950, color: C.primary, marginTop: '0.1rem' }}>#{b.token_no}</h4>
                        </div>
                        <span style={{ 
                            padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase',
                            background: b.status === 'Approved' ? C.greenLight : 
                                        b.status === 'Pending' ? C.amberLight : 
                                        b.status === 'Completed' ? C.primaryLight : C.redLight,
                            color: b.status === 'Approved' ? C.green : 
                                   b.status === 'Pending' ? C.amber : 
                                   b.status === 'Completed' ? C.primary : C.red
                        }}>{b.status}</span>
                      </div>

                      <div style={{ marginBottom: '1.25rem' }}>
                        <p style={{ fontWeight: 800, color: C.text, fontSize: '0.95rem' }}>Dr. {b.consultant_id?.name}</p>
                        <p style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 600 }}>{b.consultant_id?.department}</p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: `1px solid ${C.bg}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: C.secondary }}>
                          <Calendar size={14} /> {new Date(b.booking_date).toLocaleDateString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: C.secondary }}>
                          <Clock size={14} /> {b.booking_time}
                        </div>
                      </div>

                      {b.status === 'Rejected' && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: C.redLight, color: C.red, fontSize: '0.75rem', borderRadius: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <AlertCircle size={14} /> Rejection: {b.rejection_reason || 'Department capacity reached.'}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Support Badge */}
            <div style={{ padding: '1.5rem', background: C.primaryLight, borderRadius: '20px', border: `1px solid ${C.primary}33`, display: 'flex', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>
                    <Hash size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: C.primary }}>Smart Queue Active</p>
                    <p style={{ fontSize: '0.75rem', color: '#1E3A8A', opacity: 0.8, fontWeight: 500, marginTop: '0.2rem' }}>Your token status updates in real-time. Please arrive 15 minutes before your slot.</p>
                </div>
            </div>
          </div>
        </div>

      </div>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </MainLayout>
  );
};

export default BookConsultationPage;
