import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/templates/MainLayout';

const API = 'http://localhost:5001';

const STATUS_CFG = {
  Completed: { bg:'#D1FAE5', color:'#065F46', border:'#6EE7B7', icon:'✓', label:'Completed' },
  Pending:   { bg:'#FEF3C7', color:'#92400E', border:'#FCD34D', icon:'⏳', label:'Pending' },
  Missed:    { bg:'#FEE2E2', color:'#991B1B', border:'#FCA5A5', icon:'✕', label:'Missed' },
};

const deriveStatus = (v) => {
  if (v.got || v.status === 'Completed') return 'Completed';
  if (v.status === 'Missed') return 'Missed';
  const today = new Date(); today.setHours(0,0,0,0);
  if (new Date(v.scheduleDate) < today) return 'Missed';
  return 'Pending';
};

const VaccineSchedulePage = () => {
  const navigate = useNavigate();
  const [babies, setBabies] = useState([]);
  const [selectedBabyId, setSelectedBabyId] = useState('');
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchVaccines = useCallback(async (babyId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/vaccines/baby/${babyId}`);
      if (res.data.status === 'ok') {
        setVaccines(res.data.data.map(v => ({ ...v, ds: deriveStatus(v) })));
      }
    } catch { console.error('Failed to fetch vaccines'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = window.localStorage.getItem('token');
      if (!token) { navigate('/sign-in'); return; }
      try {
        const ur = await axios.post(`${API}/userData`, { token });
        if (ur.data.status === 'ok') {
          const br = await axios.get(`${API}/api/user-babies/${ur.data.data.email}`);
          if (br.data.status === 'ok' && br.data.data.length > 0) {
            setBabies(br.data.data);
            setSelectedBabyId(br.data.data[0]._id);
            fetchVaccines(br.data.data[0]._id);
          } else setLoading(false);
        } else navigate('/sign-in');
      } catch { navigate('/sign-in'); }
    };
    init();
  }, [navigate, fetchVaccines]);

  const handleBabyChange = (e) => {
    const id = e.target.value;
    setSelectedBabyId(id);
    fetchVaccines(id);
  };

  const filtered = useMemo(() =>
    vaccines.filter(v => filterStatus === 'All' || v.ds === filterStatus)
  , [vaccines, filterStatus]);

  const stats = useMemo(() => ({
    total: vaccines.length,
    completed: vaccines.filter(v => v.ds === 'Completed').length,
    pending: vaccines.filter(v => v.ds === 'Pending').length,
    missed: vaccines.filter(v => v.ds === 'Missed').length,
    rate: vaccines.length ? Math.round((vaccines.filter(v => v.ds === 'Completed').length / vaccines.length) * 100) : 0,
  }), [vaccines]);

  return (
    <MainLayout>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'2rem 1.5rem', fontFamily:'Inter,system-ui,sans-serif' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <button onClick={()=>navigate('/dashbord')} style={{ width:'40px',height:'40px',borderRadius:'10px',border:'1.5px solid #E2E8F0',background:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <svg style={{ width:'18px',height:'18px',color:'#64748B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </button>
            <div>
              <h1 style={{ fontSize:'1.65rem',fontWeight:900,color:'#0F172A',letterSpacing:'-0.02em' }}>Vaccination Record</h1>
              <p style={{ color:'#64748B',marginTop:'0.2rem',fontSize:'0.95rem' }}>Your child's immunization history — read only</p>
            </div>
          </div>
          {babies.length > 0 && (
            <select value={selectedBabyId} onChange={handleBabyChange}
              style={{ padding:'0.6rem 1rem',border:'1.5px solid #2563EB',borderRadius:'10px',fontWeight:700,fontSize:'0.9rem',color:'#1E40AF',background:'#EFF6FF',cursor:'pointer',outline:'none' }}>
              {babies.map(b=><option key={b._id} value={b._id}>{b.babyName}</option>)}
            </select>
          )}
        </div>

        {/* Progress Banner */}
        {!loading && vaccines.length > 0 && (
          <div style={{ background:'linear-gradient(135deg,#1E40AF,#2563EB)', borderRadius:'16px', padding:'1.5rem 2rem', marginBottom:'2rem', color:'white', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1.5rem' }}>
            <div>
              <p style={{ fontWeight:700, opacity:0.85, fontSize:'0.875rem', marginBottom:'0.35rem' }}>Immunization Progress</p>
              <p style={{ fontSize:'2rem',fontWeight:900 }}>{stats.rate}% Complete</p>
              <p style={{ opacity:0.75, fontSize:'0.85rem', marginTop:'0.25rem' }}>{stats.completed} of {stats.total} vaccines administered</p>
            </div>
            <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
              {[{ label:'Completed', val:stats.completed, c:'#6EE7B7' },{ label:'Pending', val:stats.pending, c:'#FCD34D' },{ label:'Missed', val:stats.missed, c:'#FCA5A5' }].map(s=>(
                <div key={s.label} style={{ textAlign:'center' }}>
                  <p style={{ fontSize:'1.75rem',fontWeight:900,color:s.c }}>{s.val}</p>
                  <p style={{ fontSize:'0.75rem',fontWeight:700,opacity:0.8 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ width:'100%' }}>
              <div style={{ height:'6px',background:'rgba(255,255,255,0.2)',borderRadius:'10px',overflow:'hidden' }}>
                <div style={{ height:'100%',width:`${stats.rate}%`,background:'#6EE7B7',borderRadius:'10px',transition:'width 0.5s ease' }}/>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && vaccines.length > 0 && (
          <div style={{ display:'flex',gap:'0.5rem',marginBottom:'1.5rem',flexWrap:'wrap' }}>
            {['All','Pending','Completed','Missed'].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)} style={{
                padding:'0.5rem 1.25rem',borderRadius:'20px',border:'1.5px solid',
                borderColor: filterStatus===s ? '#2563EB' : '#E2E8F0',
                background: filterStatus===s ? '#2563EB' : 'white',
                color: filterStatus===s ? 'white' : '#64748B',
                fontWeight:700,fontSize:'0.875rem',cursor:'pointer',transition:'all 0.15s'
              }}>
                {s} {s!=='All'&&<span style={{ opacity:0.7,fontSize:'0.8rem' }}>({vaccines.filter(v=>v.ds===s).length})</span>}
              </button>
            ))}
          </div>
        )}

        {/* Cards Grid */}
        {loading ? (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'40vh' }}>
            <div style={{ padding:'1rem 2rem',background:'white',borderRadius:'20px',border:'1px solid #E2E8F0',fontWeight:700,color:'#2563EB',fontSize:'1rem',boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }}>
              Loading vaccination records...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center',padding:'4rem 2rem',background:'white',borderRadius:'20px',border:'1px dashed #E2E8F0' }}>
            <div style={{ fontSize:'3rem',marginBottom:'1rem' }}>💉</div>
            <p style={{ fontWeight:700,color:'#64748B',fontSize:'1.1rem' }}>
              {vaccines.length===0 ? 'No vaccine records found. Please register a baby first.' : `No ${filterStatus} vaccines found.`}
            </p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.25rem' }}>
            {filtered.map(v=>{
              const sc = STATUS_CFG[v.ds]||STATUS_CFG.Pending;
              const isPast = new Date(v.scheduleDate) < new Date();
              return (
                <div key={v._id} style={{
                  background:'white', borderRadius:'16px', border:`1px solid ${sc.border}`,
                  padding:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
                  transition:'transform 0.2s,box-shadow 0.2s', display:'flex', flexDirection:'column', gap:'0.85rem'
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 20px rgba(0,0,0,0.09)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'; }}>

                  {/* Card Header */}
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                    <div>
                      <h3 style={{ fontWeight:800,color:'#0F172A',fontSize:'1rem',lineHeight:1.3,marginBottom:'0.3rem' }}>{v.vaccineName}</h3>
                      {v.ageLabel&&(
                        <span style={{ padding:'0.15rem 0.6rem',background:'#EFF6FF',color:'#1D4ED8',borderRadius:'20px',fontSize:'0.72rem',fontWeight:700,display:'inline-block' }}>
                          {v.ageLabel}
                        </span>
                      )}
                    </div>
                    <span style={{ padding:'0.3rem 0.75rem',borderRadius:'20px',fontSize:'0.75rem',fontWeight:800,background:sc.bg,color:sc.color,flexShrink:0,display:'flex',alignItems:'center',gap:'0.3rem' }}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>

                  {/* Description */}
                  {v.description&&(
                    <p style={{ fontSize:'0.85rem',color:'#64748B',lineHeight:1.6,borderTop:'1px solid #F1F5F9',paddingTop:'0.85rem',margin:0 }}>
                      {v.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid #F1F5F9',paddingTop:'0.85rem',marginTop:'auto' }}>
                    <div>
                      <p style={{ fontSize:'0.7rem',fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'0.04em' }}>
                        {isPast ? 'Scheduled On' : 'Due Date'}
                      </p>
                      <p style={{ fontWeight:700,color:'#374151',fontSize:'0.9rem',marginTop:'0.2rem' }}>
                        {new Date(v.scheduleDate).toLocaleDateString('en-US',{ month:'short',day:'numeric',year:'numeric' })}
                      </p>
                    </div>
                    {v.ds==='Completed'&&(
                      <div style={{ display:'flex',alignItems:'center',gap:'0.4rem',color:'#059669',fontSize:'0.8rem',fontWeight:700 }}>
                        <div style={{ width:'22px',height:'22px',borderRadius:'50%',background:'#ECFDF5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem' }}>✓</div>
                        Administered
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* RBAC notice */}
        <p style={{ textAlign:'center',color:'#CBD5E1',fontSize:'0.78rem',fontWeight:500,marginTop:'2.5rem' }}>
          🔒 This is a read-only view. Contact your healthcare provider to update vaccination records.
        </p>
      </div>
    </MainLayout>
  );
};

export default VaccineSchedulePage;
