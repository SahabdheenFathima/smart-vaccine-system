import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = {
  Critical: { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
  High:     { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
  Medium:   { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6' },
  Low:      { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
};

const EMPTY_FORM = {
  vaccineName: '',
  vaccineCode: '',
  doseOrder: 1,
  recommendedAgeLabel: '',
  priorityLevel: 'Medium',
  status: 'Active',
  notes: '',
  scheduleType: 'days',
  scheduleValue: '',
};

const AdminVaccineSchedulePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth guard
  useEffect(() => {
    const init = async () => {
      const token = window.localStorage.getItem('token');
      if (!token) { navigate('/sign-in'); return; }
      try {
        const r = await fetch('http://localhost:5001/userData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const d = await r.json();
        if (d.status === 'ok' && d.data.role === 'ADMIN') {
          setUserData(d.data);
          fetchRules();
        } else navigate('/');
      } catch (e) { console.error(e); }
    };
    init();
  }, [navigate]);

  const fetchRules = async () => {
    try {
      const r = await fetch('http://localhost:5001/api/vaccine-schedules?status=all');
      const d = await r.json();
      if (d.status === 'ok') setRules(d.data);
    } catch (e) {
      toast.error('Failed to load schedule rules');
    } finally {
      setLoading(false);
    }
  };

  // Derived payload — converts scheduleType + scheduleValue to proper fields
  const buildPayload = () => {
    const payload = {
      vaccineName:          form.vaccineName,
      vaccineCode:          form.vaccineCode,
      doseOrder:            Number(form.doseOrder),
      recommendedAgeLabel:  form.recommendedAgeLabel,
      priorityLevel:        form.priorityLevel,
      status:               form.status,
      notes:                form.notes,
      daysAfterBirth:   null,
      weeksAfterBirth:  null,
      monthsAfterBirth: null,
      yearsAfterBirth:  null,
    };
    const val = Number(form.scheduleValue);
    if (form.scheduleType === 'days')   payload.daysAfterBirth   = val;
    if (form.scheduleType === 'weeks')  payload.weeksAfterBirth  = val;
    if (form.scheduleType === 'months') payload.monthsAfterBirth = val;
    if (form.scheduleType === 'years')  payload.yearsAfterBirth  = val;
    return payload;
  };

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    let scheduleType = 'days';
    let scheduleValue = 0;
    if (rule.daysAfterBirth   != null) { scheduleType = 'days';   scheduleValue = rule.daysAfterBirth; }
    else if (rule.weeksAfterBirth  != null) { scheduleType = 'weeks';  scheduleValue = rule.weeksAfterBirth; }
    else if (rule.monthsAfterBirth != null) { scheduleType = 'months'; scheduleValue = rule.monthsAfterBirth; }
    else if (rule.yearsAfterBirth  != null) { scheduleType = 'years';  scheduleValue = rule.yearsAfterBirth; }

    setForm({
      vaccineName:         rule.vaccineName,
      vaccineCode:         rule.vaccineCode,
      doseOrder:           rule.doseOrder,
      recommendedAgeLabel: rule.recommendedAgeLabel,
      priorityLevel:       rule.priorityLevel,
      status:              rule.status,
      notes:               rule.notes || '',
      scheduleType,
      scheduleValue,
    });
    setIsEditing(true);
    setEditId(rule._id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url    = isEditing ? `http://localhost:5001/api/vaccine-schedules/${editId}` : 'http://localhost:5001/api/vaccine-schedules';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const d = await r.json();
      if (d.status === 'ok') {
        toast.success(isEditing ? 'Schedule rule updated!' : 'New schedule rule added!');
        setIsModalOpen(false);
        fetchRules();
      } else {
        toast.error(d.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (rule) => {
    try {
      const r = await fetch(`http://localhost:5001/api/vaccine-schedules/${rule._id}/toggle-status`, { method: 'POST' });
      const d = await r.json();
      if (d.status === 'ok') {
        toast.success(`"${rule.vaccineName}" is now ${d.data.status}`);
        fetchRules();
      }
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (rule) => {
    if (!window.confirm(`⚠️ Permanently delete "${rule.vaccineName}"?\n\nThis cannot be undone. Prefer Deactivating over deleting if this vaccine has been used in child records.`)) return;
    try {
      const r = await fetch(`http://localhost:5001/api/vaccine-schedules/${rule._id}`, { method: 'DELETE' });
      const d = await r.json();
      if (d.status === 'ok') {
        toast.success('Rule permanently deleted');
        fetchRules();
      }
    } catch { toast.error('Failed to delete rule'); }
  };

  const displayRules = useMemo(() => {
    return rules.filter(r => {
      const matchSearch = r.vaccineName.toLowerCase().includes(search.toLowerCase()) ||
                          r.vaccineCode.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' ? true : r.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [rules, search, filterStatus]);

  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '0.4rem' };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="badge-premium animate-pulse">Loading Schedule Engine...</div>
    </div>
  );

  return (
    <AdminLayout user={userData}>
      <div className="container-full py-12 animate-slide">

        {/* ── Header ── */}
        <header className="flex-center-between mb-8">
          <div>
            <h1 className="text-huge">Vaccine Schedule Management</h1>
            <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>
              Database-driven immunization rules. All changes apply instantly — no redeployment required.
            </p>
          </div>
          <button className="btn-premium" style={{ padding: '0.9rem 2rem' }} onClick={handleOpenCreate}>
            + Add Vaccine Schedule
          </button>
        </header>

        {/* ── Stats Row ── */}
        <div className="grid-main mb-8" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { label: 'Total Rules',    value: rules.length,                                        border: 'var(--primary)' },
            { label: 'Active',         value: rules.filter(r => r.status === 'Active').length,     border: '#10b981' },
            { label: 'Inactive',       value: rules.filter(r => r.status === 'Inactive').length,   border: '#6b7280' },
            { label: 'Critical',       value: rules.filter(r => r.priorityLevel === 'Critical').length, border: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="card-premium" style={{ borderLeft: `4px solid ${s.border}`, padding: '1.25rem' }}>
              <div className="text-muted text-xs font-bold uppercase">{s.label}</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, marginTop: '0.25rem' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex-center-between mb-6">
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            {['all', 'Active', 'Inactive'].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)} style={{
                padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
                background: filterStatus === f ? 'var(--primary)' : 'transparent',
                color: filterStatus === f ? 'white' : 'var(--text-secondary)',
                fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', width: '300px' }}>
            <input type="text" placeholder="Search vaccine or code..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-premium w-full"
              style={{ paddingLeft: '2.5rem' }} />
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          </div>
        </div>

        {/* ── Main Table ── */}
        <div className="card-premium" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                {['Vaccine Name', 'Code', 'Dose Order', 'Schedule Rule', 'Age Label', 'Priority', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '1.1rem 1.25rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRules.length > 0 ? displayRules.map(rule => {
                const pc = PRIORITY_COLORS[rule.priorityLevel] || PRIORITY_COLORS.Medium;
                const isActive = rule.status === 'Active';

                // Human-readable schedule rule
                let scheduleDisplay = '—';
                if (rule.daysAfterBirth   != null) scheduleDisplay = `${rule.daysAfterBirth} days`;
                else if (rule.weeksAfterBirth  != null) scheduleDisplay = `${rule.weeksAfterBirth} weeks`;
                else if (rule.monthsAfterBirth != null) scheduleDisplay = `${rule.monthsAfterBirth} months`;
                else if (rule.yearsAfterBirth  != null) scheduleDisplay = `${rule.yearsAfterBirth} years`;

                return (
                  <tr key={rule._id} style={{ borderBottom: '1px solid var(--border-color)', opacity: isActive ? 1 : 0.55 }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 800 }}>{rule.vaccineName}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <code style={{ background: 'var(--bg-main)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                        {rule.vaccineCode}
                      </code>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Dose {rule.doseOrder}</td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{scheduleDisplay}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{rule.recommendedAgeLabel || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, background: pc.bg, color: pc.color }}>
                        {rule.priorityLevel}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800,
                        background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                        color: isActive ? '#10b981' : '#6b7280',
                      }}>
                        {rule.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleOpenEdit(rule)} style={{ padding: '0.35rem 0.75rem', background: 'rgba(79,70,229,0.1)', color: 'var(--primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleToggleStatus(rule)} style={{ padding: '0.35rem 0.75rem', background: isActive ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: isActive ? '#f59e0b' : '#10b981', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                          {isActive ? '⏸ Disable' : '▶ Enable'}
                        </button>
                        <button onClick={() => handleDelete(rule)} style={{ padding: '0.35rem 0.75rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💉</div>
                    <p style={{ fontWeight: 600 }}>No schedule rules found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      {isModalOpen && (
        <>
          <div onClick={() => setIsModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: 'var(--bg-card)', borderRadius: '24px', padding: '2.5rem',
            width: 'min(700px, 95vw)', maxHeight: '90vh', overflowY: 'auto',
            zIndex: 1000, boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                {isEditing ? '✏️ Edit Schedule Rule' : '+ New Schedule Rule'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Vaccine Name *</label>
                  <input required className="input-premium w-full" value={form.vaccineName}
                    onChange={e => setForm({...form, vaccineName: e.target.value})}
                    placeholder="e.g. BCG" />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Vaccine Code *</label>
                  <input required className="input-premium w-full" value={form.vaccineCode}
                    onChange={e => setForm({...form, vaccineCode: e.target.value.toUpperCase()})}
                    placeholder="e.g. BCG" />
                </div>
              </div>

              {/* Scheduling Rule */}
              <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: '12px' }}>
                <label style={{ ...labelStyle, display: 'block', marginBottom: '0.75rem' }}>⏱ Scheduling Rule *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Unit</label>
                    <select className="input-premium w-full" value={form.scheduleType}
                      onChange={e => setForm({...form, scheduleType: e.target.value})}>
                      <option value="days">Days After Birth</option>
                      <option value="weeks">Weeks After Birth</option>
                      <option value="months">Months After Birth</option>
                      <option value="years">Years After Birth</option>
                    </select>
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Value *</label>
                    <input required type="number" min="0" className="input-premium w-full"
                      value={form.scheduleValue}
                      onChange={e => setForm({...form, scheduleValue: e.target.value})}
                      placeholder="e.g. 60" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Dose Order</label>
                  <input type="number" min="1" className="input-premium w-full" value={form.doseOrder}
                    onChange={e => setForm({...form, doseOrder: e.target.value})} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Age Label</label>
                  <input className="input-premium w-full" value={form.recommendedAgeLabel}
                    onChange={e => setForm({...form, recommendedAgeLabel: e.target.value})}
                    placeholder="e.g. 2 Months" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Priority Level</label>
                  <select className="input-premium w-full" value={form.priorityLevel}
                    onChange={e => setForm({...form, priorityLevel: e.target.value})}>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Status</label>
                  <select className="input-premium w-full" value={form.status}
                    onChange={e => setForm({...form, status: e.target.value})}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Notes (optional)</label>
                <textarea className="input-premium w-full" style={{ minHeight: '80px', resize: 'vertical' }}
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="Any clinical notes for this schedule rule..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline-premium" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-premium" style={{ flex: 2 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (isEditing ? 'Update Rule' : 'Create Schedule Rule')}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <style>{`
        .animate-slide { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
      `}</style>
    </AdminLayout>
  );
};

export default AdminVaccineSchedulePage;
