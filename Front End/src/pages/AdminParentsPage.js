import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/templates/AdminLayout';
import toast from 'react-hot-toast';

const AdminParentsPage = () => {
  const [userData, setUserData] = useState(null);
  const [parents, setParents] = useState([]);
  const [filteredParents, setFilteredParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParent, setSelectedParent] = useState(null);
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
          fetchParents();
        } else {
          navigate("/");
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [navigate]);

  const fetchParents = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/parents");
      const data = await res.json();
      if (data.status === "ok") {
        setParents(data.data);
        setFilteredParents(data.data);
      } else {
        toast.error("Failed to fetch parents");
      }
    } catch (err) {
      toast.error("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredParents(parents);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredParents(parents.filter(p => 
        p.fname.toLowerCase().includes(lower) || 
        p.email.toLowerCase().includes(lower)
      ));
    }
  }, [searchTerm, parents]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="badge-premium animate-pulse">Loading Parent Registry...</div>
    </div>
  );

  return (
    <AdminLayout user={userData}>
      <div className="container-full py-12 animate-slide">
        <header className="flex-center-between mb-big">
          <div>
            <h1 className="text-huge">Parent Management</h1>
            <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>View and manage registered guardians and their linked child profiles.</p>
          </div>
          <div style={{ position: 'relative', width: '300px' }}>
            <input 
              type="text" 
              placeholder="Search name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium w-full"
              style={{ paddingLeft: '2.5rem' }}
            />
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          </div>
        </header>

        <div className="card-premium" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Linked Children</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.length > 0 ? filteredParents.map(parent => (
                <tr key={parent._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover:bg-gray-50">
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                        {parent.fname.charAt(0).toUpperCase()}
                      </div>
                      {parent.fname}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{parent.email}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span className="badge-premium" style={{ background: parent.childrenCount > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)', color: parent.childrenCount > 0 ? '#10b981' : '#6b7280' }}>
                      {parent.childrenCount} Profile{parent.childrenCount !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span> Active
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <button 
                      onClick={() => setSelectedParent(parent)}
                      className="btn-outline-premium" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No parents found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Parent Details Drawer/Modal */}
        {selectedParent && (
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', background: 'var(--bg-card)', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease-out' }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 className="text-title" style={{ fontSize: '1.5rem' }}>Parent Profile</h2>
                <p className="text-muted mt-1">{selectedParent.email}</p>
              </div>
              <button onClick={() => setSelectedParent(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
            </div>
            
            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800 }}>
                  {selectedParent.fname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedParent.fname}</h3>
                  <span className="badge-premium" style={{ marginTop: '0.25rem' }}>Standard User</span>
                </div>
              </div>

              <h4 className="text-sm font-bold uppercase text-muted mb-4">Linked Children ({selectedParent.childrenCount})</h4>
              
              {selectedParent.children && selectedParent.children.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedParent.children.map(child => (
                    <div key={child._id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-main)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h5 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{child.babyName}</h5>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {new Date(child.birthDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Weight: {child.weight} | Height: {child.height}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                  <p className="text-muted">No children registered to this account yet.</p>
                </div>
              )}

              <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                <h4 className="text-sm font-bold uppercase text-muted mb-4">Admin Actions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button className="btn-outline-premium w-full" style={{ justifyContent: 'flex-start' }}>✉️ Send Password Reset Link</button>
                  <button className="btn-outline-premium w-full" style={{ justifyContent: 'flex-start', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>🚫 Deactivate Account</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Dim background when drawer is open */}
        {selectedParent && (
          <div onClick={() => setSelectedParent(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 999, backdropFilter: 'blur(2px)' }}></div>
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

export default AdminParentsPage;
