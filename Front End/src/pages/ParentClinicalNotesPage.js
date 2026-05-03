import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Stethoscope, 
  Calendar, 
  Download, 
  Baby, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Pill, 
  ClipboardList, 
  Info, 
  Search,
  RefreshCcw,
  Tag,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown
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

const ParentClinicalNotesPage = () => {
  const [userData, setUserData] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
        if (data.status === "ok") {
          setUserData(data.data);
          const babyRes = await fetch(`http://localhost:5001/api/user-babies/${encodeURIComponent(data.data.email)}`);
          const babyData = await babyRes.json();
          if (babyData.status === "ok" && babyData.data.length > 0) {
            setChildren(babyData.data);
            setSelectedChildId(babyData.data[0]._id);
          } else {
            setLoading(false);
          }
        }
      } catch (err) { console.error(err); setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (selectedChildId) {
      const fetchNotes = async () => {
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:5001/api/clinical-notes/parent/${selectedChildId}`);
          const data = await res.json();
          if (data.status === 'ok') {
            setNotes(data.data);
          }
        } catch (error) {
          console.error("Error fetching notes", error);
        } finally {
          setLoading(false);
        }
      };
      fetchNotes();
    }
  }, [selectedChildId]);

  const markAsViewed = async (noteId) => {
    try {
      await fetch(`http://localhost:5001/api/clinical-notes/${noteId}/viewed`, { method: 'PUT' });
      setNotes(notes.map(n => n._id === noteId ? { ...n, parentViewed: true } : n));
    } catch (e) { console.error(e); }
  };

  const downloadPDF = (note) => {
    toast.success("Downloading Clinical Summary...");
    setTimeout(() => { window.print(); }, 500);
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(n => (n.assessment || '').toLowerCase().includes(search.toLowerCase()) || (n.consultantId?.name || '').toLowerCase().includes(search.toLowerCase()));
  }, [notes, search]);

  const stats = useMemo(() => {
    const medsCount = notes.reduce((acc, n) => acc + (n.plan?.medicines?.length || 0), 0);
    const followUps = notes.filter(n => n.plan?.followUpDate).length;
    const newAdvice = notes.filter(n => !n.parentViewed).length;
    return [
      { label: 'Total Visits', value: notes.length, icon: ClipboardList, color: C.primary, bg: C.primaryLight },
      { label: 'Unread Advice', value: newAdvice, icon: AlertCircle, color: C.red, bg: C.redLight },
      { label: 'Prescriptions', value: medsCount, icon: Pill, color: C.green, bg: C.greenLight },
      { label: 'Follow-ups', value: followUps, icon: Calendar, color: C.blue, bg: C.blueLight },
    ];
  }, [notes]);

  if (loading && !notes.length && !children.length) return (
    <MainLayout user={userData}>
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 700, color: C.muted }}>Accessing Clinical Archive...</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </MainLayout>
  );

  return (
    <MainLayout user={userData}>
      <div style={{ background: C.bg, minHeight: '100vh', padding: '2.5rem 2.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* --- Header --- */}
        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-0.025em' }}>Clinical Notes</h1>
              <p style={{ color: C.muted, marginTop: '0.4rem', fontSize: '1rem' }}>Review clinical advice, prescriptions, and follow-up protocols.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {children.length > 0 && (
                <div style={{ position: 'relative' }}>
                  <Baby size={18} color={C.primary} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <select 
                    value={selectedChildId} onChange={e => setSelectedChildId(e.target.value)}
                    style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', border: `1.5px solid ${C.border}`, borderRadius: '12px', fontWeight: 750, fontSize: '0.9rem', color: C.text, background: 'white', cursor: 'pointer', outline: 'none', appearance: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                  >
                    {children.map(c => <option key={c._id} value={c._id}>{c.babyName}</option>)}
                  </select>
                  <ChevronDown size={14} color={C.muted} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {stats.map((s, idx) => (
              <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={22} color={s.color} strokeWidth={2.5} />
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: C.text, marginTop: '0.1rem', lineHeight: 1 }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </header>

        {children.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: C.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: C.muted }}>
              <Baby size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.text }}>No Clinical Profiles Detected</h2>
            <p style={{ color: C.muted, marginTop: '0.75rem', fontSize: '1.1rem' }}>Please register a baby to begin tracking clinical history and consultant advice.</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${C.border}`, padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: C.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: C.muted }}>
              <ClipboardList size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.text }}>No Clinical Notes Found</h2>
            <p style={{ color: C.muted, marginTop: '0.75rem', fontSize: '1.1rem' }}>Once a consultant finalizes your visit, their clinical advice will appear here securely.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: C.text }}>Consultation History</h2>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={18} color={C.muted} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" placeholder="Search by doctor or assessment..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.75rem', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: 'white', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            {filteredNotes.map((note, idx) => {
              const isNew = !note.parentViewed;
              return (
                <div 
                  key={note._id} 
                  className="clinical-note-card"
                  onClick={() => { if (isNew) markAsViewed(note._id); }}
                  style={{ 
                    background: 'white', borderRadius: '24px', border: `1px solid ${isNew ? C.primary : C.border}`, padding: '2rem', transition: 'all 0.3s ease', animation: `fadeIn 0.4s ease ${idx * 0.05}s both`, position: 'relative',
                    boxShadow: isNew ? `0 8px 30px ${C.primary}15` : '0 4px 12px rgba(0,0,0,0.02)'
                  }}
                >
                  {isNew && <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: C.red, color: 'white', fontSize: '0.65rem', fontWeight: 900, padding: '0.2rem 0.6rem', borderRadius: '20px', letterSpacing: '0.05em', animation: 'pulse 2s infinite' }}>NEW ADVICE</div>}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${C.bg}` }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: C.primaryLight, color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Stethoscope size={28} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: C.text }}>{note.assessment || 'General Consultation'}</h3>
                        <p style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <Calendar size={14} /> {new Date(note.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); downloadPDF(note); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: C.bg, border: 'none', borderRadius: '10px', color: C.secondary, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <Download size={16} /> PDF Summary
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ background: C.bg, padding: '1.25rem', borderRadius: '16px', border: `1px solid ${C.border}` }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: C.primary, textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} /> Clinical Staff</p>
                      <p style={{ fontSize: '1rem', fontWeight: 800, color: C.text }}>Dr. {note.consultantId?.name || 'Unknown'}</p>
                      <p style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600 }}>{note.consultantId?.specialization || 'Pediatrician'}</p>
                    </div>
                    <div style={{ background: C.bg, padding: '1.25rem', borderRadius: '16px', border: `1px solid ${C.border}` }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: C.primary, textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileText size={14} /> Reported Symptoms</p>
                      <p style={{ fontSize: '0.9rem', color: C.secondary, lineHeight: 1.5 }}>{note.subjective || 'Routine clinical assessment.'}</p>
                    </div>
                    <div style={{ background: C.bg, padding: '1.25rem', borderRadius: '16px', border: `1px solid ${C.border}` }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: C.green, textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Pill size={14} /> Prescriptions</p>
                      {note.plan?.medicines?.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {note.plan.medicines.map((m, i) => (
                            <span key={i} style={{ padding: '0.2rem 0.5rem', background: C.greenLight, color: C.green, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>{m}</span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 500 }}>No specific medication prescribed.</p>
                      )}
                    </div>
                  </div>

                  <div style={{ background: C.primaryLight, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${C.primary}22` }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 900, color: C.primary, textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={16} /> Clinical Plan & Advice</p>
                    <p style={{ fontSize: '1rem', color: '#1E3A8A', lineHeight: 1.6, fontWeight: 500 }}>{note.plan?.advice || 'Please follow standard post-vaccination care instructions.'}</p>
                    
                    {note.plan?.followUpDate && (
                      <div style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '12px', border: `1px solid ${C.primary}33`, fontSize: '0.85rem', fontWeight: 800, color: C.primary }}>
                        <Calendar size={16} /> Scheduled Follow-up: {new Date(note.plan.followUpDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {note.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                      {note.tags.map((tag, tIdx) => (
                        <span key={tIdx} style={{ background: C.bg, color: C.secondary, fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '8px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Tag size={10} /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footnote */}
        <div style={{ marginTop: '4rem', padding: '1.5rem', borderRadius: '16px', border: `1px dashed ${C.border}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
            <Info size={18} />
          </div>
          <p style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 500 }}>
            <strong style={{ color: C.text }}>Confidentiality Notice:</strong> These notes contain sensitive medical data. They are synchronized directly from the consultant's workstation and are for guardian review only. 
            For medical emergencies, please contact the hospital triage line immediately.
          </p>
        </div>

      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
        .clinical-note-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.06) !important; border-color: ${C.primary}66 !important; cursor: pointer; }
        .clinical-note-card:hover button { background: ${C.primary}; color: white; }
      `}</style>
    </MainLayout>
  );
};

export default ParentClinicalNotesPage;
