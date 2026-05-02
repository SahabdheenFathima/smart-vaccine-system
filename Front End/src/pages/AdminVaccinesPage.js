import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';

const AdminVaccinesPage = () => {
  const [userData, setUserData] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All', 'Completed', 'Pending', 'Overdue'
  const [searchTerm, setSearchTerm] = useState('');
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
        if (data.status === "ok" && data.data.role === 'ADMIN') {
          setUserData(data.data);
          fetchVaccines();
        } else {
          navigate("/");
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [navigate]);

  const fetchVaccines = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/vaccines");
      const data = await res.json();
      // The API returns the array directly, not wrapped in { status: "ok", data: [...] } for the root route based on backend code
      if (Array.isArray(data)) {
          setVaccines(data);
      } else if (data.data) {
          setVaccines(data.data);
      } else {
          toast.error("Unexpected data format");
      }
    } catch (err) {
      toast.error("Failed to fetch vaccine records");
    } finally {
      setLoading(false);
    }
  };

  const markAsGiven = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/vaccines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ got: true }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        toast.success("Vaccination marked as complete");
        fetchVaccines();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const processedVaccines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return vaccines.map(v => {
        const scheduleDate = new Date(v.scheduleDate);
        let calculatedStatus = 'Pending';
        if (v.got) {
            calculatedStatus = 'Completed';
        } else if (scheduleDate < today) {
            calculatedStatus = 'Overdue';
        }

        return { ...v, calculatedStatus };
    });
  }, [vaccines]);

  const filteredVaccines = useMemo(() => {
      return processedVaccines.filter(v => {
          const matchesFilter = filter === 'All' || v.calculatedStatus === filter;
          const matchesSearch = v.babyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                v.vaccineName?.toLowerCase().includes(searchTerm.toLowerCase());
          return matchesFilter && matchesSearch;
      }).sort((a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate));
  }, [processedVaccines, filter, searchTerm]);

  // Analytics
  const stats = useMemo(() => {
      const total = processedVaccines.length;
      const completed = processedVaccines.filter(v => v.calculatedStatus === 'Completed').length;
      const overdue = processedVaccines.filter(v => v.calculatedStatus === 'Overdue').length;
      const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

      return { total, completed, overdue, completionRate };
  }, [processedVaccines]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="badge-premium animate-pulse">Loading Vaccine Registry...</div>
    </div>
  );

  return (
    <AdminLayout user={userData}>
      <div className="container-full py-12 animate-slide">
        <header className="mb-big">
          <h1 className="text-huge">Vaccine Registry & Tracking</h1>
          <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>Monitor national immunization compliance and overdue records.</p>
        </header>

        {/* Analytics KPIs */}
        <div className="grid-main mb-big" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="card-premium" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                <h4 className="text-muted text-sm font-bold uppercase">Total Tracked</h4>
                <p className="text-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--text-primary)' }}>{stats.total}</p>
            </div>
            <div className="card-premium" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                <h4 className="text-muted text-sm font-bold uppercase">Completed</h4>
                <p className="text-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: '#10b981' }}>{stats.completed}</p>
            </div>
            <div className="card-premium" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
                <h4 className="text-muted text-sm font-bold uppercase">Overdue Alert</h4>
                <p className="text-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: '#ef4444' }}>{stats.overdue}</p>
            </div>
            <div className="card-premium" style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6', display: 'flex', flexDirection: 'column' }}>
                <h4 className="text-muted text-sm font-bold uppercase">Compliance Rate</h4>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginTop: 'auto' }}>
                    <p className="text-title" style={{ fontSize: '2.5rem', color: '#8b5cf6' }}>{stats.completionRate}%</p>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '4px', marginBottom: '0.8rem', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${stats.completionRate}%`, background: '#8b5cf6', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Data Controls */}
        <div className="flex-center-between mb-6">
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                {['All', 'Pending', 'Completed', 'Overdue'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{ 
                            padding: '0.5rem 1.25rem', 
                            borderRadius: '8px', 
                            border: 'none',
                            background: filter === f ? 'var(--primary)' : 'transparent',
                            color: filter === f ? 'white' : 'var(--text-secondary)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>
            <div style={{ position: 'relative', width: '300px' }}>
                <input 
                type="text" 
                placeholder="Search child or vaccine..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-premium w-full"
                style={{ paddingLeft: '2.5rem' }}
                />
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            </div>
        </div>

        {/* Master Registry Table */}
        <div className="card-premium" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Vaccine Name</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Patient Profile</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Scheduled Date</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Compliance Status</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVaccines.length > 0 ? filteredVaccines.map(v => (
                <tr key={v._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover:bg-gray-50">
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                    {v.vaccineName}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{v.babyName || 'Unknown'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{v.email}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {new Date(v.scheduleDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                        padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800,
                        background: v.calculatedStatus === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 
                                    v.calculatedStatus === 'Overdue' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: v.calculatedStatus === 'Completed' ? '#10b981' : 
                               v.calculatedStatus === 'Overdue' ? '#ef4444' : '#f59e0b',
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', 
                            background: v.calculatedStatus === 'Completed' ? '#10b981' : 
                                        v.calculatedStatus === 'Overdue' ? '#ef4444' : '#f59e0b'
                        }}></span>
                        {v.calculatedStatus}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {v.calculatedStatus !== 'Completed' ? (
                        <button 
                            onClick={() => {
                                if(window.confirm("Verify: Mark this vaccine as officially administered?")) {
                                    markAsGiven(v._id);
                                }
                            }}
                            style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-main)', color: 'var(--primary)', border: '2px solid var(--primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
                        >
                            Verify Dose
                        </button>
                    ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Recorded ✓</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💉</div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No vaccine records found for this filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVaccinesPage;
