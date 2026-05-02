import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import toast from 'react-hot-toast';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

// -------------------------------------------------------------
// UI COMPONENTS
// -------------------------------------------------------------

const StatCard = ({ title, value, subtitle, color, alert }) => (
  <div className="card-premium" style={{ borderLeft: `6px solid ${color}`, position: 'relative' }}>
    {alert && <span style={{ position: 'absolute', top: 10, right: 10, width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />}
    <h3 className="text-muted font-bold text-sm uppercase tracking-wider">{title}</h3>
    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0' }}>{value}</div>
    <p className="text-muted text-sm">{subtitle}</p>
  </div>
);

// -------------------------------------------------------------
// MODULES
// -------------------------------------------------------------

const OverviewModule = ({ pendingAppointments, stats }) => (
  <div className="animate-slide">
    <div className="grid-main mb-8" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
      <StatCard title="Today's Appts" value={stats.total} subtitle="Scheduled for today" color="#3b82f6" />
      <StatCard title="Pending" value={stats.pending} subtitle="Waiting in queue" color="#f59e0b" />
      <StatCard title="Completed" value={stats.completed} subtitle="Finished today" color="#10b981" />
      <StatCard title="Urgent Cases" value={stats.urgent} subtitle="Needs immediate attention" color="#ef4444" alert />
    </div>

    <div className="grid-main" style={{ gridTemplateColumns: '2fr 1fr' }}>
      <div className="card-premium">
        <h3 className="text-title mb-4">Upcoming Schedule</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th className="p-3 text-left text-xs uppercase text-muted">Time</th>
              <th className="p-3 text-left text-xs uppercase text-muted">Patient</th>
              <th className="p-3 text-left text-xs uppercase text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {pendingAppointments.slice(0, 5).map(app => (
              <tr key={app._id} className="border-bottom">
                <td className="p-3 font-bold">{app.time_slot || 'N/A'}</td>
                <td className="p-3">{app.child_id?.babyName || 'Unknown'}</td>
                <td className="p-3"><span className={`badge-premium ${app.status?.toLowerCase()}`}>{app.status}</span></td>
              </tr>
            ))}
            {pendingAppointments.length === 0 && (
              <tr><td colSpan="3" className="p-6 text-center text-muted">No upcoming appointments</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card-premium" style={{ background: 'var(--primary)', color: 'white' }}>
        <h3 className="mb-2" style={{ fontWeight: 800 }}>Queue Summary</h3>
        <div className="flex-column gap-4 mt-6">
          <div className="flex-center-between">
            <span>Now Serving:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Token A34</span>
          </div>
          <div className="flex-center-between">
            <span>Waiting:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.pending}</span>
          </div>
          <button className="btn-premium mt-4" style={{ background: 'white', color: 'var(--primary)', width: '100%' }}>
            Call Next Patient
          </button>
        </div>
      </div>
    </div>
  </div>
);

const AppointmentsModule = ({ pendingAppointments, onExamine, updateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredAppointments = pendingAppointments.filter(app => {
    // Search filter
    const searchMatch = 
      app.child_id?.babyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.token_no?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!searchMatch) return false;

    // Tab filter
    if (activeFilter === 'Pending') return app.status === 'Pending';
    if (activeFilter === 'Approved') return app.status === 'Approved';
    if (activeFilter === 'Completed') return app.status === 'Completed';
    // 'Today' and 'Tomorrow' can be mocked or checked against booking_date
    if (activeFilter === 'Today') {
      const today = new Date().toISOString().split('T')[0];
      return app.booking_date?.startsWith(today);
    }
    if (activeFilter === 'Tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return app.booking_date?.startsWith(tomorrow.toISOString().split('T')[0]);
    }

    return true;
  });

  return (
    <div className="card-premium animate-slide" style={{ padding: '2rem' }}>
      <div className="flex-center-between mb-6">
        <h3 className="text-title" style={{ fontSize: '1.5rem' }}>My Appointments</h3>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            🔍
          </span>
          <input 
            type="text" 
            placeholder="Search by name or token..." 
            className="input-premium" 
            style={{ width: '100%', paddingLeft: '2.5rem', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['All', 'Today', 'Tomorrow', 'Pending', 'Approved', 'Completed'].map(f => (
          <button 
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              border: `1px solid ${activeFilter === f ? 'var(--primary)' : '#e2e8f0'}`,
              background: activeFilter === f ? 'var(--primary-glow)' : 'white',
              color: activeFilter === f ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th className="p-4 text-muted font-bold text-xs uppercase" style={{ letterSpacing: '0.5px' }}>Token</th>
              <th className="p-4 text-muted font-bold text-xs uppercase" style={{ letterSpacing: '0.5px' }}>Patient Info</th>
              <th className="p-4 text-muted font-bold text-xs uppercase" style={{ letterSpacing: '0.5px' }}>Time Slot</th>
              <th className="p-4 text-muted font-bold text-xs uppercase" style={{ letterSpacing: '0.5px' }}>Status</th>
              <th className="p-4 text-right text-muted font-bold text-xs uppercase" style={{ letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? filteredAppointments.map((app, idx) => {
              const bgClass = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
              
              let badgeColor = { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
              if (app.status === 'Approved') badgeColor = { bg: '#eff6ff', text: '#3b82f6', border: '#bfdbfe' };
              if (app.status === 'Pending') badgeColor = { bg: '#fffbeb', text: '#f59e0b', border: '#fde68a' };
              if (app.status === 'Completed') badgeColor = { bg: '#ecfdf5', text: '#10b981', border: '#a7f3d0' };

              const timeDisplay = app.time_slot && app.time_slot !== 'N/A' ? app.time_slot : '10:30 AM - 10:45 AM';

              return (
                <tr key={app._id} className={`${bgClass} border-bottom`} style={{ transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                  <td className="p-5 font-bold" style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{app.token_no || 'TBD'}</td>
                  <td className="p-5">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {app.child_id?.babyName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{app.child_id?.babyName || 'Unknown Patient'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {app.child_id?._id?.slice(-8).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{timeDisplay}</td>
                  <td className="p-5">
                    <span style={{ background: badgeColor.bg, color: badgeColor.text, border: `1px solid ${badgeColor.border}`, padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button 
                        onClick={() => onExamine(app)}
                        style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary-glow)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        Examine
                      </button>
                      
                      {app.status === 'Pending' && (
                        <button 
                          onClick={() => updateStatus(app._id, 'Approved')}
                          style={{ background: 'transparent', color: '#10b981', border: '1px solid #10b981', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          Approve
                        </button>
                      )}

                      {(app.status === 'Approved' || app.status === 'Pending') && (
                        <button 
                          onClick={() => {
                            if (window.confirm("Are you sure you want to cancel this appointment?")) updateStatus(app._id, 'Cancelled');
                          }}
                          style={{ background: 'transparent', color: '#ef4444', border: '1px solid #fca5a5', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          Cancel
                        </button>
                      )}
                      
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', fontSize: '1.2rem' }} title="More Options">
                        ⋮
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="5" className="p-12 text-center">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '4rem', opacity: 0.5 }}>📭</div>
                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No appointments found</h4>
                    <p style={{ fontSize: '0.9rem' }}>Try adjusting your filters or search term.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};



const ClinicalNoteDrawer = ({ isOpen, onClose, appointmentData, onSave }) => {
  const [template, setTemplate] = useState('');
  
  const child = appointmentData?.child_id || {};
  
  const [noteData, setNoteData] = useState({
    subjective: '',
    objective: {
      weight: child.weight || '',
      height: child.height || '',
      temperature: '',
      pulse: '',
      oxygenSaturation: '',
      additionalNotes: ''
    },
    assessment: '',
    plan: {
      medicines: '',
      labTests: '',
      advice: '',
      followUpDate: ''
    },
    tags: '',
    visibility: 'summary_parent'
  });

  const [saving, setSaving] = useState(false);

  // Auto-fill macro
  const applyTemplate = (tmpl) => {
    setTemplate(tmpl);
    if (tmpl === 'Fever / Viral Infection') {
      setNoteData(prev => ({
        ...prev,
        subjective: 'Parent reports fever for the last 2 days. Associated with mild cough. No vomiting.',
        assessment: 'Viral Fever',
        plan: { ...prev.plan, advice: 'Plenty of oral fluids. Paracetamol SOS for fever > 100°F.' },
        tags: 'Fever, Viral'
      }));
    } else if (tmpl === 'Routine Vaccination Review') {
      setNoteData(prev => ({
        ...prev,
        subjective: 'Well baby visit. No active complaints. Feeding well.',
        assessment: 'Healthy infant. Due for routine immunizations.',
        plan: { ...prev.plan, advice: 'Administer scheduled vaccines. Continue exclusive breastfeeding.' },
        tags: 'Routine, Vaccination'
      }));
    }
  };

  const handleSave = async (status) => {
    setSaving(true);
    try {
      const payload = {
        childId: appointmentData.child_id?._id,
        appointmentId: appointmentData._id,
        consultantId: appointmentData.consultant_id?._id,
        subjective: noteData.subjective,
        objective: noteData.objective,
        assessment: noteData.assessment,
        plan: {
          medicines: noteData.plan.medicines.split(',').map(s=>s.trim()).filter(Boolean),
          labTests: noteData.plan.labTests.split(',').map(s=>s.trim()).filter(Boolean),
          advice: noteData.plan.advice,
          followUpDate: noteData.plan.followUpDate || null
        },
        tags: noteData.tags.split(',').map(s=>s.trim()).filter(Boolean),
        visibility: noteData.visibility,
        status: status
      };

      const res = await fetch('http://localhost:5001/api/clinical-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'ok') {
        toast.success(`Note ${status === 'Final' ? 'Finalized' : 'Saved as Draft'}`);
        if (status === 'Final') {
          onSave(appointmentData._id, 'Completed');
        }
        if (status === 'Final') onClose();
      } else {
        toast.error("Failed to save note");
      }
    } catch (e) {
      toast.error("Error saving note");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 998 }} onClick={onClose}></div>
      <div className="animate-slide" style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '600px', height: '100vh', background: 'white', zIndex: 999, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Add Clinical Note</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Patient: {child?.babyName} | {new Date(appointmentData?.booking_date || Date.now()).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Quick Template</label>
          <select className="input-premium" style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem' }} value={template} onChange={e => applyTemplate(e.target.value)}>
            <option value="">-- Select Template --</option>
            <option value="Routine Vaccination Review">Routine Vaccination Review</option>
            <option value="Fever / Viral Infection">Fever / Viral Infection</option>
            <option value="Growth Delay Concern">Growth Delay Concern</option>
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>Subjective</h4>
            <textarea className="input-premium" rows="3" style={{ width: '100%' }} placeholder="Parent-reported symptoms..." value={noteData.subjective} onChange={e => setNoteData({...noteData, subjective: e.target.value})}></textarea>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>Objective (Vitals)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={{fontSize:'0.75rem'}}>Weight (kg)</label><input type="text" className="input-premium" style={{ width: '100%' }} value={noteData.objective.weight} onChange={e => setNoteData({...noteData, objective: {...noteData.objective, weight: e.target.value}})} /></div>
              <div><label style={{fontSize:'0.75rem'}}>Height (cm)</label><input type="text" className="input-premium" style={{ width: '100%' }} value={noteData.objective.height} onChange={e => setNoteData({...noteData, objective: {...noteData.objective, height: e.target.value}})} /></div>
              <div><label style={{fontSize:'0.75rem'}}>Temp (°F)</label><input type="text" className="input-premium" style={{ width: '100%' }} value={noteData.objective.temperature} onChange={e => setNoteData({...noteData, objective: {...noteData.objective, temperature: e.target.value}})} /></div>
              <div><label style={{fontSize:'0.75rem'}}>Pulse</label><input type="text" className="input-premium" style={{ width: '100%' }} value={noteData.objective.pulse} onChange={e => setNoteData({...noteData, objective: {...noteData.objective, pulse: e.target.value}})} /></div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>Assessment</h4>
            <input type="text" className="input-premium" style={{ width: '100%' }} placeholder="Doctor diagnosis..." value={noteData.assessment} onChange={e => setNoteData({...noteData, assessment: e.target.value})} />
            
            <div style={{ marginTop: '1rem' }}>
              <label style={{fontSize:'0.75rem', fontWeight: 700}}>Tags (comma separated)</label>
              <input type="text" className="input-premium" style={{ width: '100%' }} placeholder="E.g., Fever, Asthma" value={noteData.tags} onChange={e => setNoteData({...noteData, tags: e.target.value})} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>Plan</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="text" className="input-premium" style={{ width: '100%' }} placeholder="Medicines (comma separated)" value={noteData.plan.medicines} onChange={e => setNoteData({...noteData, plan: {...noteData.plan, medicines: e.target.value}})} />
              <input type="text" className="input-premium" style={{ width: '100%' }} placeholder="Lab Tests (comma separated)" value={noteData.plan.labTests} onChange={e => setNoteData({...noteData, plan: {...noteData.plan, labTests: e.target.value}})} />
              <textarea className="input-premium" rows="2" style={{ width: '100%' }} placeholder="Nutrition / Advice" value={noteData.plan.advice} onChange={e => setNoteData({...noteData, plan: {...noteData.plan, advice: e.target.value}})}></textarea>
            </div>
          </div>

          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔒 Note Visibility:
              <select className="input-premium" style={{ marginLeft: 'auto', padding: '0.3rem', width: '250px' }} value={noteData.visibility} onChange={e => setNoteData({...noteData, visibility: e.target.value})}>
                <option value="summary_parent">Share Summary Only (Default)</option>
                <option value="shared_parent">Share Full Note</option>
                <option value="internal">Internal Only</option>
              </select>
            </label>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginLeft: '1.2rem' }}>
              {noteData.visibility === 'summary_parent' && "Only diagnosis, plan, and follow-up are visible to parents."}
              {noteData.visibility === 'shared_parent' && "Full SOAP note is visible to parents."}
              {noteData.visibility === 'internal' && "Note is completely hidden from parents."}
            </p>
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem', background: 'white' }}>
          <button className="btn-outline-premium" style={{ flex: 1 }} onClick={() => handleSave('Draft')} disabled={saving}>{saving ? 'Saving...' : 'Save Draft'}</button>
          <button className="btn-premium" style={{ flex: 2, background: 'var(--primary)', color: 'white' }} onClick={() => handleSave('Final')} disabled={saving}>✅ Finalize Clinical Note</button>
        </div>
      </div>
    </>
  );
};

const ClinicalProfileModule = ({ appointmentData, updateAppointmentStatus }) => {
  const childData = appointmentData?.child_id;
  const [growthData, setGrowthData] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch data, including notes, whenever the child changes or drawer closes (to refresh notes)
  useEffect(() => {
    if (childData?._id) {
      setLoading(true);
      const fetchData = async () => {
        try {
          const [growthRes, vacRes, noteRes] = await Promise.all([
            fetch(`http://localhost:5001/api/growth/baby/${childData._id}`),
            fetch(`http://localhost:5001/api/vaccines/baby/${childData._id}`),
            fetch(`http://localhost:5001/api/clinical-notes/${childData._id}`)
          ]);
          const gData = await growthRes.json();
          const vData = await vacRes.json();
          const nData = await noteRes.json();
          
          if (gData.status === 'ok') setGrowthData(gData.data);
          if (vData.status === 'ok') setVaccines(vData.data);
          if (nData.status === 'ok') setNotes(nData.data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [childData]);

  if (!childData) {
    return (
      <div className="card-premium animate-slide flex-column flex-center p-12 text-center text-muted">
        <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🩺</span>
        <h3 className="text-title mb-2">No Patient Selected</h3>
        <p>Please select "Examine" from your Appointments list to view a clinical profile.</p>
      </div>
    );
  }

  const age = childData.birthDate ? new Date().getFullYear() - new Date(childData.birthDate).getFullYear() : 'N/A';

  const referenceData = [
    { age: 0, height: 49.9 }, { age: 1, height: 54.7 }, { age: 2, height: 58.4 },
    { age: 3, height: 61.4 }, { age: 4, height: 63.9 }, { age: 6, height: 67.6 },
    { age: 8, height: 70.6 }, { age: 10, height: 73.3 }, { age: 12, height: 75.7 },
    { age: 15, height: 79.1 }, { age: 18, height: 82.3 }, { age: 24, height: 87.8 },
    { age: 30, height: 91.9 }, { age: 36, height: 96.1 },
  ];

  const chartDataConfig = {
    datasets: [
      {
        label: "Actual Growth",
        data: growthData.map((item) => ({ x: item.age, y: item.height })),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.15)",
        fill: true,
        tension: 0.45,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBackgroundColor: "#4F46E5",
        pointBorderColor: "#fff",
        borderWidth: 4,
      },
      {
        label: "WHO Standard",
        data: referenceData.map((item) => ({ x: item.age, y: item.height })),
        borderColor: "#cbd5e1",
        borderDash: [6, 6],
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, font: { family: "'Inter', sans-serif", weight: '600' } } },
      tooltip: { titleFont: { family: "'Inter', sans-serif" }, bodyFont: { family: "'Inter', sans-serif" } }
    },
    scales: {
      x: { 
        type: 'linear', min: 0, max: Math.max(24, ...growthData.map(d => d.age)),
        grid: { display: false },
        ticks: { stepSize: 3, callback: (v) => `${v}m`, font: { family: "'Inter', sans-serif" } },
        title: { display: true, text: 'Age (months)', font: { family: "'Inter', sans-serif", weight: '600' } }
      },
      y: { 
        grid: { color: '#f1f5f9', borderDash: [4, 4] },
        ticks: { font: { family: "'Inter', sans-serif" } },
        title: { display: true, text: 'Height (cm)', font: { family: "'Inter', sans-serif", weight: '600' } }
      },
    },
  };

  return (
    <div className="animate-slide" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex-center-between mb-8 border-bottom pb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800 }}>
            {childData.babyName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, fontFamily: "'Inter', sans-serif", margin: 0 }}>{childData.babyName}</h2>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', background: 'white', border: '1px solid #e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>Age: {age}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', background: 'white', border: '1px solid #e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>ID: {childData._id?.slice(-8).toUpperCase() || 'UNKNOWN'}</span>
            </div>
          </div>
        </div>
        <button className="btn-premium" onClick={() => setIsDrawerOpen(true)} style={{ background: 'var(--primary)', color: 'white', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>+</span> Add Clinical Note
        </button>
      </div>
      
      <div className="grid-main mb-8" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="p-6" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div className="flex-center-between mb-6">
            <h4 className="font-bold text-lg" style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>Vitals & Demographics</h4>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', background: '#eff6ff', padding: '0.35rem 0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }}></span> Data Synced
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>⚖️</div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Birth Weight</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{childData.weight || '--'} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>kg</span></div>
              </div>
            </div>
            
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📏</div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Birth Height</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{childData.height || '--'} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>cm</span></div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🧠</div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Head Circ.</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{childData.headCircumference || '--'} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>cm</span></div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>👩‍👦</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mother's Name</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{childData.motherName || 'Unknown'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', maxHeight: '350px', display: 'flex', flexDirection: 'column' }}>
          <div className="flex-center-between mb-4">
            <h4 className="font-bold text-lg" style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>Immunization Timeline</h4>
            <div className="badge-premium" style={{ background: '#f8fafc', color: 'var(--text-secondary)', border: '1px solid #e2e8f0' }}>{vaccines.length} Doses</div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
            {loading ? (
               <div className="flex-center justify-center" style={{ height: '100%' }}><div className="badge-premium animate-pulse">Fetching Records...</div></div>
            ) : vaccines.length === 0 ? (
               <p className="text-sm text-muted text-center mt-8 font-bold">No vaccine records found.</p>
            ) : (
               <div style={{ position: 'relative', paddingLeft: '1.25rem', borderLeft: '2px solid #e2e8f0', marginLeft: '0.5rem' }}>
                 {vaccines.map((v, i) => {
                   const isPast = new Date(v.scheduleDate) < new Date();
                   let dotColor = v.got ? '#10b981' : (isPast ? '#f59e0b' : '#cbd5e1');
                   let badgeStyle = v.got 
                    ? { bg: '#ecfdf5', color: '#10b981', text: 'Completed' }
                    : (isPast ? { bg: '#fffbeb', color: '#f59e0b', text: 'Upcoming' } : { bg: '#f8fafc', color: '#64748b', text: 'Scheduled' });

                   return (
                   <div key={v._id} style={{ position: 'relative', paddingBottom: i === vaccines.length - 1 ? '0' : '1.5rem', paddingLeft: '1.25rem' }}>
                     <div style={{ position: 'absolute', left: '-1.6rem', top: '0.5rem', width: '12px', height: '12px', borderRadius: '50%', background: dotColor, border: '2px solid white', boxShadow: `0 0 0 1px ${dotColor}` }}></div>
                     
                     <div className="flex-center-between" style={{ background: v.got ? 'white' : '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: `1px solid ${v.got ? '#e2e8f0' : 'transparent'}` }}>
                       <div>
                         <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{v.vaccineName}</div>
                         <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.1rem' }}>{new Date(v.scheduleDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                       </div>
                       <span style={{ background: badgeStyle.bg, color: badgeStyle.color, padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                         {badgeStyle.text}
                       </span>
                     </div>
                   </div>
                 )})}
               </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div className="flex-center-between mb-6">
          <h3 className="text-title" style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.2rem' }}>Growth Trajectory (WHO Standard)</h3>
          <div className="flex-center gap-2">
            <button style={{ background: 'var(--bg-main)', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Download Chart">
              <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
            <button style={{ background: 'var(--bg-main)', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Full Screen">
              <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </button>
          </div>
        </div>
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', minHeight: '350px', position: 'relative', width: '100%', display: 'block', border: '1px solid #f1f5f9' }}>
          {loading ? (
            <div className="flex-center justify-center" style={{ height: '300px' }}><div className="badge-premium animate-pulse">Loading Growth Data...</div></div>
          ) : (
            <div style={{ height: '320px', width: '100%' }}>
              <Line data={chartDataConfig} options={chartOptions} />
            </div>
          )}
        </div>
      </div>

      <div className="p-6 mt-8" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div className="flex-center-between mb-6">
          <h3 className="text-title" style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.2rem' }}>Clinical History Timeline</h3>
          <div className="badge-premium" style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}>{notes.length} Records</div>
        </div>
        
        {loading ? (
          <div className="flex-center justify-center" style={{ padding: '2rem' }}><div className="badge-premium animate-pulse">Loading History...</div></div>
        ) : notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', opacity: 0.5 }}>📂</span>
            <p style={{ marginTop: '1rem', fontWeight: 600 }}>No clinical history found.</p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #e2e8f0', marginLeft: '1rem' }}>
            {notes.map((note, i) => (
              <div key={note._id} style={{ position: 'relative', paddingBottom: i === notes.length - 1 ? '0' : '2.5rem', paddingLeft: '1.5rem' }}>
                <div style={{ position: 'absolute', left: '-1.85rem', top: '0.2rem', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary)', border: '3px solid white', boxShadow: '0 0 0 1px #e2e8f0' }}></div>
                
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{note.assessment || 'No Diagnosis Recorded'}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>
                        {new Date(note.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })} • Dr. {note.consultantId?.name || 'Unknown'}
                        {note.visibility !== 'internal' && note.status === 'Final' && (
                          <span style={{ marginLeft: '0.5rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: note.parentViewed ? '#dcfce7' : '#e0e7ff', color: note.parentViewed ? '#166534' : '#3730a3', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                            {note.parentViewed ? '👀 Parent Viewed' : '✉️ Parent Unread'}
                          </span>
                        )}
                      </div>
                    </div>
                    {note.status === 'Draft' ? (
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>Draft</span>
                    ) : (
                      <span style={{ background: '#ecfdf5', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>Final</span>
                    )}
                  </div>
                  
                  {note.tags && note.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {note.tags.map((tag, tIdx) => (
                        <span key={tIdx} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#475569', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 700 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div>
                      <h5 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Subjective</h5>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{note.subjective || 'N/A'}</p>
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Plan / Advice</h5>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{note.plan?.advice || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ClinicalNoteDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        appointmentData={appointmentData}
        onSave={(appId, status) => {
          updateAppointmentStatus(appId, status);
          setIsDrawerOpen(false); // Close drawer on save
        }}
      />
    </div>
  );
};

// -------------------------------------------------------------
// MAIN DASHBOARD COMPONENT
// -------------------------------------------------------------

const ConsultantDashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const navigate = useNavigate();

  const handleExamine = (childData) => {
    setSelectedProfile(childData);
    setActiveTab('profile');
  };

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      navigate("/sign-in");
      return;
    }

    const fetchConsultantData = async () => {
      try {
        const response = await fetch("http://localhost:5001/userData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();

        if (data.status === "ok" && data.data.role === 'CONSULTANT') {
          setUserData(data.data);
          fetchAppointments(data.data.email);
        } else {
          toast.error("Unauthorized access");
          navigate("/");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultantData();
  }, [navigate]);

  const fetchAppointments = async (consultantEmail) => {
    try {
      const response = await fetch(`http://localhost:5001/api/bookings`);
      const data = await response.json();
      if (data.status === "ok") {
        const filtered = data.data.filter(app => {
          return app.consultant_id?.email?.toLowerCase() === consultantEmail?.toLowerCase();
        });
        setPendingAppointments(filtered);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
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
        toast.success(`Booking marked as ${status}`);
        if (userData?.email) fetchAppointments(userData.email);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return (
    <div className="flex-center" style={{ height: '100vh', background: '#f8fafc' }}>
      <div className="badge-premium animate-pulse">Initializing Consultant Workspace...</div>
    </div>
  );

  const stats = {
    total: pendingAppointments.length,
    pending: pendingAppointments.filter(a => a.status === 'Approved' || a.status === 'Pending').length,
    completed: pendingAppointments.filter(a => a.status === 'Completed').length,
    urgent: pendingAppointments.filter(a => a.priority === 'Urgent').length || 0, // Mock data for urgent
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
    { id: 'appointments', label: 'My Appointments', icon: '📅' },
    { id: 'profile', label: 'Clinical Profile', icon: '🩺' },
  ];

  return (
    <MainLayout user={userData}>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', background: '#f8fafc' }}>
        
        {/* SIDEBAR NAVIGATION */}
        <aside style={{ width: '280px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '2rem 1rem' }}>
          <div className="mb-8 px-4">
            <h3 className="text-title" style={{ fontSize: '1.1rem' }}>Dr. {userData?.name}</h3>
            <p className="text-muted text-sm">Pediatric Consultant</p>
          </div>
          
          <nav className="flex-column gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
                  borderRadius: '12px', border: 'none', cursor: 'pointer',
                  background: activeTab === tab.id ? '#eff6ff' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.id ? 800 : 600,
                  transition: 'all 0.2s', textAlign: 'left', fontSize: '1rem'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
          <header className="mb-8 flex-center-between">
            <h1 className="text-huge">{tabs.find(t => t.id === activeTab)?.label}</h1>
            <div className="flex-center gap-4">
              <span className="badge-premium" style={{ background: '#ecfdf5', color: '#10b981', border: '1px solid #10b981' }}>
                ● Clinic Active
              </span>
            </div>
          </header>

          <div className="content-area">
            {activeTab === 'overview' && <OverviewModule pendingAppointments={pendingAppointments} stats={stats} />}
            {activeTab === 'appointments' && <AppointmentsModule pendingAppointments={pendingAppointments} onExamine={handleExamine} updateStatus={updateBookingStatus} />}
            {activeTab === 'profile' && <ClinicalProfileModule appointmentData={selectedProfile} updateAppointmentStatus={updateBookingStatus} />}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default ConsultantDashboardPage;

