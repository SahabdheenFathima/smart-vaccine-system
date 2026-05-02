import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import toast from 'react-hot-toast';

const ParentClinicalNotesPage = () => {
  const [userData, setUserData] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
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
          // Fetch parent's babies using their email
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
    } catch (e) {
      console.error(e);
    }
  };

  const downloadPDF = (note) => {
    toast.success("Downloading PDF Summary...");
    // Mock PDF generation trigger
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (loading && !notes.length && !children.length) return (
    <div className="flex-center" style={{ height: '100vh', background: '#f8fafc' }}>
      <div className="badge-premium animate-pulse">Loading Clinical Records...</div>
    </div>
  );

  return (
    <MainLayout user={userData}>
      <div className="container-full py-12 animate-slide">
        <header className="flex-center-between mb-8">
          <div>
            <h1 className="text-huge">Clinical Notes</h1>
            <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>Review advice, prescriptions, and follow-ups from your consultant.</p>
          </div>
          
          {children.length > 1 && (
            <select className="input-premium" style={{ width: '250px' }} value={selectedChildId} onChange={e => setSelectedChildId(e.target.value)}>
              {children.map(child => (
                <option key={child._id} value={child._id}>{child.babyName}</option>
              ))}
            </select>
          )}
        </header>

        {children.length === 0 ? (
          <div className="card-premium flex-center flex-column py-12 text-center text-muted">
            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>👶</span>
            <h3 className="text-title mb-2">No Children Registered</h3>
            <p>You need to register a baby to view clinical notes.</p>
          </div>
        ) : loading ? (
          <div className="flex-center py-12"><div className="badge-premium animate-pulse">Fetching Notes...</div></div>
        ) : notes.length === 0 ? (
          <div className="card-premium flex-center flex-column py-12 text-center text-muted">
            <span style={{ fontSize: '4rem', opacity: 0.5, marginBottom: '1rem' }}>📂</span>
            <h3 className="text-title mb-2">No Clinical Notes Yet</h3>
            <p>When a consultant finalizes a consultation, their advice will appear here securely.</p>
          </div>
        ) : (
          <div className="grid" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {notes.map(note => {
              const isNew = !note.parentViewed;
              
              return (
                <div 
                  key={note._id} 
                  className="card-premium" 
                  style={{ position: 'relative', borderLeft: isNew ? '4px solid var(--primary)' : '1px solid #e2e8f0', transition: 'all 0.3s' }}
                  onClick={() => { if (isNew) markAsViewed(note._id); }}
                >
                  <div className="flex-center-between mb-6 border-bottom pb-4">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        🩺
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{note.assessment || 'Consultation Summary'}</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600 }}>
                          {new Date(note.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {isNew && <span className="badge-premium animate-pulse" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5' }}>New</span>}
                      <button onClick={(e) => { e.stopPropagation(); downloadPDF(note); }} className="btn-outline-premium" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📥 Download PDF
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>👨‍⚕️</span> Consultant
                      </h4>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Dr. {note.consultantId?.name || 'Unknown'}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{note.consultantId?.specialization || 'Pediatrician'}</p>
                    </div>

                    {note.visibility === 'shared_parent' && note.subjective && (
                      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>📝</span> Symptoms Reported
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{note.subjective}</p>
                      </div>
                    )}

                    {note.plan?.medicines && note.plan.medicines.length > 0 && (
                      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>💊</span> Medicines Prescribed
                        </h4>
                        <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          {note.plan.medicines.map((med, idx) => (
                            <li key={idx} style={{ marginBottom: '0.2rem', fontWeight: 600 }}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>💡</span> Treatment Plan & Advice
                    </h4>
                    <p style={{ fontSize: '0.95rem', color: '#1e3a8a', lineHeight: 1.6 }}>{note.plan?.advice || 'Follow general care instructions provided.'}</p>
                    
                    {note.plan?.followUpDate && (
                      <div style={{ marginTop: '1rem', display: 'inline-block', background: 'white', padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid #bfdbfe', fontSize: '0.85rem', fontWeight: 700, color: '#1d4ed8' }}>
                        📅 Follow-up Date: {new Date(note.plan.followUpDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.5rem' }}>Tags:</span>
                      {note.tags.map((tag, tIdx) => (
                        <span key={tIdx} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 800 }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ParentClinicalNotesPage;
