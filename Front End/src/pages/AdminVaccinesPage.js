import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/templates/AdminLayout';
import serverURL from '../config';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const SC = {
  Completed: { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  Pending:   { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  Missed:    { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
};

const AdminVaccinesPage = () => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchVaccines(); }, []);

  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/api/vaccines`);
      if (res.data.status === 'ok') {
        const today = new Date(); today.setHours(0,0,0,0);
        const processed = res.data.data.map(v => {
          let ds = v.status || 'Pending';
          if (!v.got && ds === 'Pending' && new Date(v.scheduleDate) < today) ds = 'Missed';
          if (v.got) ds = 'Completed';
          return { ...v, ds };
        });
        setVaccines(processed);
      }
    } catch { toast.error('Failed to fetch records'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async () => {
    if (!confirmModal) return;
    setUpdatingId(confirmModal.id);
    try {
      await axios.put(`${serverURL}/api/vaccines/${confirmModal.id}/status`, { status: confirmModal.newStatus });
      toast.success(`Marked as ${confirmModal.newStatus}`);
      fetchVaccines();
    } catch { toast.error('Update failed'); }
    finally { setUpdatingId(null); setConfirmModal(null); }
  };

  const filtered = useMemo(() =>
    vaccines.filter(v =>
      (filterStatus === 'All' || v.ds === filterStatus) &&
      ((v.babyName||'').toLowerCase().includes(search.toLowerCase()) ||
       (v.vaccineName||'').toLowerCase().includes(search.toLowerCase()))
    ), [vaccines, filterStatus, search]);

  const paginated = useMemo(() => filtered.slice((page-1)*rowsPerPage, page*rowsPerPage), [filtered, page, rowsPerPage]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const stats = useMemo(() => ({
    total: vaccines.length,
    completed: vaccines.filter(v=>v.ds==='Completed').length,
    pending: vaccines.filter(v=>v.ds==='Pending').length,
    missed: vaccines.filter(v=>v.ds==='Missed').length,
  }), [vaccines]);

  const S = { minHeight:'100vh', background:'#F8FAFC', padding:'2rem 2.5rem', fontFamily:'Inter,system-ui,sans-serif' };

  return (
    <AdminLayout>
      <div style={S}>
        <div style={{ marginBottom:'2rem' }}>
          <h1 style={{ fontSize:'1.75rem', fontWeight:900, color:'#0F172A', letterSpacing:'-0.02em' }}>Vaccination Registry</h1>
          <p style={{ color:'#64748B', marginTop:'0.35rem' }}>Centralized status control center for all child vaccination records.</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.25rem', marginBottom:'2rem' }}>
          {[
            { label:'Total', value:stats.total, c:'#2563EB', bg:'#EFF6FF' },
            { label:'Completed', value:stats.completed, c:'#059669', bg:'#ECFDF5' },
            { label:'Pending', value:stats.pending, c:'#D97706', bg:'#FFFBEB' },
            { label:'Missed', value:stats.missed, c:'#DC2626', bg:'#FEF2F2' },
          ].map(s=>(
            <div key={s.label} style={{ background:'white', borderRadius:'12px', border:'1px solid #E2E8F0', padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize:'0.72rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</p>
              <p style={{ fontSize:'2.25rem', fontWeight:900, color:s.c, marginTop:'0.35rem', lineHeight:1 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div style={{ background:'white', borderRadius:'16px', border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
            <h3 style={{ fontWeight:800, fontSize:'1.05rem', color:'#0F172A' }}>Child Vaccination Records</h3>
            <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ display:'flex', gap:'0.4rem', background:'#F8FAFC', padding:'0.3rem', borderRadius:'10px', border:'1px solid #E2E8F0' }}>
                {['All','Pending','Completed','Missed'].map(s=>(
                  <button key={s} onClick={()=>{ setFilterStatus(s); setPage(1); }} style={{
                    padding:'0.4rem 0.9rem', borderRadius:'7px', border:'none', cursor:'pointer', fontWeight:700, fontSize:'0.82rem',
                    background: filterStatus===s ? '#2563EB' : 'transparent',
                    color: filterStatus===s ? 'white' : '#64748B', transition:'all 0.15s'
                  }}>{s}</button>
                ))}
              </div>
              <div style={{ position:'relative' }}>
                <svg style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', width:'15px', height:'15px', color:'#94A3B8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input type="text" placeholder="Search child or vaccine..." value={search}
                  onChange={e=>{ setSearch(e.target.value); setPage(1); }}
                  style={{ paddingLeft:'2.25rem', paddingRight:'1rem', paddingTop:'0.55rem', paddingBottom:'0.55rem', border:'1.5px solid #E2E8F0', borderRadius:'9px', fontSize:'0.875rem', fontWeight:500, color:'#0F172A', outline:'none', width:'220px', background:'#F8FAFC' }}
                />
              </div>
              <select value={rowsPerPage} onChange={e=>{ setRowsPerPage(Number(e.target.value)); setPage(1); }}
                style={{ padding:'0.55rem 0.75rem', border:'1.5px solid #E2E8F0', borderRadius:'9px', fontSize:'0.875rem', fontWeight:600, color:'#374151', background:'#F8FAFC', cursor:'pointer' }}>
                {[10,20,50].map(n=><option key={n} value={n}>{n} rows</option>)}
              </select>
            </div>
          </div>

          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
              <thead>
                <tr style={{ background:'#F8FAFC', borderBottom:'1px solid #E2E8F0' }}>
                  {['#','Child','Vaccine','Age Label','Description','Date','Status','Actions'].map(h=>(
                    <th key={h} style={{ padding:'0.9rem 1rem', fontSize:'0.72rem', fontWeight:800, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ padding:'4rem', textAlign:'center', color:'#94A3B8' }}>Loading records...</td></tr>
                ) : paginated.length===0 ? (
                  <tr><td colSpan="8" style={{ padding:'4rem', textAlign:'center', color:'#94A3B8', fontWeight:600 }}>No records found.</td></tr>
                ) : paginated.map((v,i)=>{
                  const sc = SC[v.ds]||SC.Pending;
                  return (
                    <tr key={v._id} style={{ borderBottom:'1px solid #F1F5F9' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'}
                      onMouseLeave={e=>e.currentTarget.style.background='white'}>
                      <td style={{ padding:'1rem', color:'#94A3B8', fontSize:'0.85rem', fontWeight:600 }}>{(page-1)*rowsPerPage+i+1}</td>
                      <td style={{ padding:'1rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#EFF6FF', color:'#2563EB', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.9rem', flexShrink:0 }}>
                            {(v.babyName||'?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight:700, color:'#0F172A', fontSize:'0.875rem' }}>{v.babyName||'Unknown'}</p>
                            <p style={{ fontSize:'0.72rem', color:'#94A3B8' }}>{v.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'1rem', fontWeight:700, color:'#1E40AF', fontSize:'0.875rem' }}>{v.vaccineName}</td>
                      <td style={{ padding:'1rem' }}>
                        {v.ageLabel
                          ? <span style={{ padding:'0.2rem 0.65rem', background:'#EFF6FF', color:'#1D4ED8', borderRadius:'20px', fontSize:'0.72rem', fontWeight:700 }}>{v.ageLabel}</span>
                          : <span style={{ color:'#CBD5E1' }}>—</span>}
                      </td>
                      <td style={{ padding:'1rem', maxWidth:'180px' }}>
                        <p style={{ fontSize:'0.8rem', color:'#64748B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={v.description}>
                          {v.description||<span style={{ color:'#CBD5E1' }}>—</span>}
                        </p>
                      </td>
                      <td style={{ padding:'1rem', fontWeight:600, fontSize:'0.875rem', color:'#374151', whiteSpace:'nowrap' }}>
                        {new Date(v.scheduleDate).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' })}
                      </td>
                      <td style={{ padding:'1rem' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.3rem 0.75rem', borderRadius:'20px', fontSize:'0.75rem', fontWeight:800, background:sc.bg, color:sc.color }}>
                          <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:sc.dot, display:'inline-block' }}></span>
                          {v.ds}
                        </span>
                      </td>
                      <td style={{ padding:'1rem' }}>
                        <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap' }}>
                          {['Pending','Completed','Missed'].filter(s=>s!==v.ds).map(ns=>(
                            <button key={ns}
                              disabled={updatingId===v._id}
                              onClick={()=>setConfirmModal({ id:v._id, newStatus:ns, vaccineName:v.vaccineName, childName:v.babyName })}
                              style={{
                                padding:'0.3rem 0.65rem', borderRadius:'7px', border:'none', cursor:'pointer', fontSize:'0.72rem', fontWeight:700,
                                background: ns==='Completed'?'#ECFDF5':ns==='Missed'?'#FEF2F2':'#F8FAFC',
                                color: ns==='Completed'?'#065F46':ns==='Missed'?'#991B1B':'#374151',
                                opacity:updatingId===v._id?0.5:1
                              }}>
                              {ns==='Completed'?'✓':ns==='Missed'?'✕':'↺'} {ns}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ fontSize:'0.85rem', color:'#64748B' }}>Showing {Math.min((page-1)*rowsPerPage+1,filtered.length)}–{Math.min(page*rowsPerPage,filtered.length)} of {filtered.length}</p>
            <div style={{ display:'flex', gap:'0.35rem', alignItems:'center' }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                style={{ padding:'0.45rem 0.7rem', border:'1px solid #E2E8F0', borderRadius:'7px', background:'white', cursor:page===1?'not-allowed':'pointer', color:page===1?'#CBD5E1':'#374151', fontWeight:700 }}>‹</button>
              {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1).map((p,idx,arr)=>(
                <React.Fragment key={p}>
                  {idx>0&&arr[idx-1]!==p-1&&<span style={{ color:'#94A3B8',padding:'0 0.25rem' }}>…</span>}
                  <button onClick={()=>setPage(p)} style={{ width:'32px',height:'32px',borderRadius:'7px',border:'1px solid',borderColor:page===p?'#2563EB':'#E2E8F0',background:page===p?'#2563EB':'white',color:page===p?'white':'#374151',fontWeight:700,fontSize:'0.875rem',cursor:'pointer' }}>{p}</button>
                </React.Fragment>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                style={{ padding:'0.45rem 0.7rem', border:'1px solid #E2E8F0', borderRadius:'7px', background:'white', cursor:page===totalPages?'not-allowed':'pointer', color:page===totalPages?'#CBD5E1':'#374151', fontWeight:700 }}>›</button>
            </div>
          </div>
        </div>
      </div>

      {confirmModal&&(
        <>
          <div onClick={()=>setConfirmModal(null)} style={{ position:'fixed',inset:0,background:'rgba(15,23,42,0.4)',zIndex:999,backdropFilter:'blur(4px)' }}/>
          <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'white',borderRadius:'20px',padding:'2rem',width:'min(440px,95vw)',zIndex:1000,boxShadow:'0 25px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ width:'52px',height:'52px',borderRadius:'14px',background:confirmModal.newStatus==='Completed'?'#ECFDF5':confirmModal.newStatus==='Missed'?'#FEF2F2':'#F8FAFC',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.25rem',fontSize:'1.5rem' }}>
              {confirmModal.newStatus==='Completed'?'✅':confirmModal.newStatus==='Missed'?'🚫':'🔄'}
            </div>
            <h3 style={{ fontSize:'1.2rem',fontWeight:800,color:'#0F172A',marginBottom:'0.5rem' }}>Confirm Status Update</h3>
            <p style={{ color:'#64748B',fontSize:'0.95rem',lineHeight:1.6,marginBottom:'1.5rem' }}>
              Update <strong>{confirmModal.vaccineName}</strong> for <strong>{confirmModal.childName}</strong> to{' '}
              <strong style={{ color:SC[confirmModal.newStatus].color }}>{confirmModal.newStatus}</strong>?
            </p>
            <div style={{ display:'flex',gap:'0.75rem' }}>
              <button onClick={()=>setConfirmModal(null)} style={{ flex:1,padding:'0.8rem',background:'#F8FAFC',border:'1.5px solid #E2E8F0',borderRadius:'10px',fontWeight:700,cursor:'pointer',color:'#374151' }}>Cancel</button>
              <button onClick={handleStatusUpdate} style={{ flex:2,padding:'0.8rem',border:'none',borderRadius:'10px',fontWeight:800,cursor:'pointer',color:'white',background:confirmModal.newStatus==='Completed'?'#059669':confirmModal.newStatus==='Missed'?'#DC2626':'#2563EB' }}>
                Mark as {confirmModal.newStatus}
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminVaccinesPage;
