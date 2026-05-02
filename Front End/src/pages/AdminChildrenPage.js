import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';

const AdminChildrenPage = () => {
  const [userData, setUserData] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
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
          fetchChildren();
        } else {
          navigate("/");
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [navigate]);

  const fetchChildren = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/children");
      const data = await res.json();
      if (data.status === "ok") {
        setChildrenData(data.data);
      } else {
        toast.error("Failed to fetch child records");
      }
    } catch (err) {
      toast.error("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const filteredChildren = useMemo(() => {
    if (searchTerm.trim() === '') return childrenData;
    const lower = searchTerm.toLowerCase();
    return childrenData.filter(c => 
      c.babyName?.toLowerCase().includes(lower) || 
      c.email?.toLowerCase().includes(lower) // Parent email
    );
  }, [searchTerm, childrenData]);

  // Helper to calculate age in months
  const calculateAgeMonths = (birthDate) => {
      const dob = new Date(birthDate);
      const today = new Date();
      let months = (today.getFullYear() - dob.getFullYear()) * 12;
      months -= dob.getMonth();
      months += today.getMonth();
      return months <= 0 ? 0 : months;
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="badge-premium animate-pulse">Loading Universal Patient Database...</div>
    </div>
  );

  return (
    <AdminLayout user={userData}>
      <div className="container-full py-12 animate-slide">
        <header className="flex-center-between mb-big">
          <div>
            <h1 className="text-huge">Child Profiles Database</h1>
            <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>Manage all pediatric health records and growth timelines.</p>
          </div>
          <div style={{ position: 'relative', width: '350px' }}>
            <input 
              type="text" 
              placeholder="Search by child name or parent email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium w-full"
              style={{ paddingLeft: '2.5rem' }}
            />
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          </div>
        </header>

        <div className="grid-main" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {filteredChildren.length > 0 ? filteredChildren.map(child => {
                const ageMonths = calculateAgeMonths(child.birthDate);
                // Mock risk calculation based on weight (just for UI demonstration)
                const isUnderweight = child.weight && parseFloat(child.weight) < 3.0 && ageMonths > 6;
                
                return (
                <div key={child._id} className="card-premium" style={{ display: 'flex', flexDirection: 'column', borderTop: isUnderweight ? '4px solid #ef4444' : '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{child.babyName}</h3>
                            <p className="text-muted text-sm">{new Date(child.birthDate).toLocaleDateString()}</p>
                        </div>
                        <div style={{ background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '8px', fontSize: '1.25rem' }}>
                            👶
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                            <div className="text-muted text-xs font-bold uppercase">Age</div>
                            <div style={{ fontWeight: 700 }}>{ageMonths} months</div>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                            <div className="text-muted text-xs font-bold uppercase">Weight</div>
                            <div style={{ fontWeight: 700, color: isUnderweight ? '#ef4444' : 'inherit' }}>
                                {child.weight || '--'} kg
                            </div>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '8px', gridColumn: 'span 2' }}>
                            <div className="text-muted text-xs font-bold uppercase">Parent Email</div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{child.email}</div>
                        </div>
                    </div>

                    {isUnderweight && (
                        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ⚠️ Flagged: Low Weight Profile
                        </div>
                    )}

                    <button 
                        onClick={() => setSelectedChild(child)}
                        className="btn-outline-premium mt-auto" style={{ width: '100%', padding: '0.6rem' }}
                    >
                        View Full Medical Record
                    </button>
                </div>
            )}) : (
                <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No child profiles found.</p>
                </div>
            )}
        </div>

        {/* Profile Detail Drawer */}
        {selectedChild && (
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '500px', background: 'var(--bg-card)', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease-out' }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="text-title" style={{ fontSize: '1.5rem' }}>Patient Medical Record</h2>
              <button onClick={() => setSelectedChild(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
            </div>
            
            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'var(--bg-main)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                  👶
                </div>
                <div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 900 }}>{selectedChild.babyName}</h3>
                  <p className="text-muted font-bold mt-1">Reg ID: {selectedChild._id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                  <h4 className="text-sm font-bold uppercase text-muted mb-3">Demographics & Origin</h4>
                  <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted font-semibold">Date of Birth:</span>
                          <span className="font-bold">{new Date(selectedChild.birthDate).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted font-semibold">Delivery Method:</span>
                          <span className="font-bold">{selectedChild.deliveryMethod || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted font-semibold">Mother's Name:</span>
                          <span className="font-bold">{selectedChild.motherName || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted font-semibold">Parent Contact:</span>
                          <span className="font-bold">{selectedChild.email}</span>
                      </div>
                  </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                  <h4 className="text-sm font-bold uppercase text-muted mb-3">Vitals Check (Registration)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                          <span className="text-muted text-xs font-bold uppercase">Weight</span>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedChild.weight || '--'} kg</div>
                      </div>
                      <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                          <span className="text-muted text-xs font-bold uppercase">Height</span>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedChild.height || '--'} cm</div>
                      </div>
                      <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #8b5cf6', gridColumn: 'span 2' }}>
                          <span className="text-muted text-xs font-bold uppercase">Head Circumference</span>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedChild.headCircumference || '--'} cm</div>
                      </div>
                  </div>
              </div>

              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                <h4 className="text-sm font-bold uppercase text-muted mb-4">Admin Data Operations</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-premium" style={{ flex: 1, background: '#f59e0b', color: 'white' }}>✏️ Edit Record</button>
                  <button className="btn-outline-premium" style={{ flex: 1, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>🚫 Flag Invalid</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Dim background when drawer is open */}
        {selectedChild && (
          <div onClick={() => setSelectedChild(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 999, backdropFilter: 'blur(2px)' }}></div>
        )}

      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminChildrenPage;
