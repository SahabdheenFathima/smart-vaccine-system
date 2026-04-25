import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/templates/MainLayout';
import Card from '../components/atoms/Card';
import Button from '../components/atoms/Button';

const BabyHistoryPage = () => {
    const [babies, setBabies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const API_BASE = "http://localhost:5001";

    useEffect(() => {
        const fetchUserAndBabies = async () => {
            const token = window.localStorage.getItem("token");
            if (!token) { navigate("/sign-in"); return; }
            try {
                const userRes = await axios.post(`${API_BASE}/userData`, { token });
                if (userRes.data.status === "ok") {
                    const userData = userRes.data.data;
                    setUser(userData);
                    const babiesRes = await axios.get(`${API_BASE}/api/user-babies/${userData.email}`);
                    if (babiesRes.data.status === "ok") setBabies(babiesRes.data.data);
                } else { navigate("/sign-in"); }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchUserAndBabies();
    }, [navigate]);

    const [deleteModal, setDeleteModal] = useState({ show: false, id: '', name: '' });

    const handleDeleteClick = (id, name) => {
        setDeleteModal({ show: true, id, name });
    };

    const confirmDelete = async () => {
        const { id } = deleteModal;
        try {
            const res = await axios.delete(`${API_BASE}/api/baby/${id}`);
            if (res.data.status === "ok") {
                setBabies(babies.filter(b => b._id !== id));
                setDeleteModal({ show: false, id: '', name: '' });
            }
        } catch (err) {
            alert("Failed to delete record. Please try again.");
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex-center justify-center" style={{ height: '80vh' }}>
                    <div className="badge-premium animate-pulse">Syncing Medical Records...</div>
                </div>
            </MainLayout>
        );
    }

    const DetailItem = ({ label, value, unit = '', icon }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {icon && <span style={{ opacity: 0.7 }}>{icon}</span>}
                <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {value ? `${value.toString().replace(unit, '').trim()} ${unit}` : 'Not Specified'}
                </span>
            </div>
        </div>
    );

    return (
        <MainLayout user={user}>
            <div className="container-full py-10 animate-slide">
                <header className="mb-12 flex-center-between">
                    <div className="flex-center" style={{ gap: '2rem' }}>
                        <button className="btn-back" onClick={() => navigate('/dashbord')}>
                            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <div>
                            <span className="badge-premium mb-2">Electronic Health Records</span>
                            <h1 className="text-huge">Clinical Profile History</h1>
                            <p className="text-muted mt-1">Detailed repository of registered pediatric profiles.</p>
                        </div>
                    </div>
                    <Button onClick={() => navigate('/add-baby')} className="btn-premium">
                        <span>Register New Profile</span>
                    </Button>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {babies.length === 0 ? (
                        <Card className="p-20 text-center card-premium">
                            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📁</div>
                            <h3 className="text-title text-2xl">Archive Empty</h3>
                            <p className="text-muted mt-2 mb-8">No pediatric profiles associated with this account.</p>
                            <Button onClick={() => navigate('/add-baby')} style={{ width: '240px', margin: '0 auto' }}>Initialize First Record</Button>
                        </Card>
                    ) : (
                        babies.map((baby) => (
                            <div key={baby._id} className="card-premium p-0 overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                                {/* Profile Hero Bar */}
                                <div className="flex-center-between" style={{ 
                                    padding: '2rem 3rem', 
                                    background: 'linear-gradient(90deg, var(--primary), #6366f1)', 
                                    color: 'white'
                                }}>
                                    <div className="flex-center" style={{ gap: '2rem' }}>
                                        <div style={{ 
                                            width: '72px', height: '72px', borderRadius: '22px', 
                                            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '2.25rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.3)'
                                        }}>
                                            {baby.babyName.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="hide-mobile" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{baby.babyName}</h2>
                                            <h2 className="show-mobile" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{baby.babyName}</h2>
                                            <div className="flex-center" style={{ gap: '1rem', opacity: 0.9 }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{new Date(baby.birthDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'white' }} className="hide-mobile"></div>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 700 }} className="hide-mobile">REF: {baby._id.slice(-8).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-center" style={{ gap: '1rem' }}>
                                        <button onClick={() => navigate('/analytics')} className="btn-premium" style={{ background: 'rgba(255,255,255,0.2)', boxShadow: 'none', padding: '0.75rem 1.25rem' }}>
                                            <span style={{ fontSize: '0.8125rem' }}>Growth</span>
                                        </button>
                                        <button onClick={() => navigate('/vaccine-table')} className="btn-premium" style={{ background: 'white', color: 'var(--primary)', boxShadow: 'none', padding: '0.75rem 1.25rem' }}>
                                            <span style={{ fontSize: '0.8125rem' }}>Vaccines</span>
                                        </button>
                                        <button onClick={() => handleDeleteClick(baby._id, baby.babyName)} className="btn-premium" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fee2e2', boxShadow: 'none', padding: '0.75rem 0.75rem', borderRadius: '12px' }}>
                                            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Structured Data Grid */}
                                <div className="grid-3" style={{ padding: '2.5rem' }}>
                                    {/* Section 1: Demographics */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                        <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '-0.5rem' }}>Guardian & Identity</h4>
                                        <DetailItem label="Mother's Full Name" value={baby.motherName} icon="👩‍👦" />
                                        <DetailItem label="Maternal Age" value={baby.motherAge} unit="yrs" icon="📅" />
                                        <DetailItem label="Registered Email" value={baby.email} icon="📧" />
                                    </div>

                                    {/* Section 2: Physical Metrics */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                        <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '-0.5rem' }}>Birth Metrics</h4>
                                        <DetailItem label="Birth Weight" value={baby.weight} unit="kg" icon="⚖️" />
                                        <DetailItem label="Birth Height" value={baby.height} unit="cm" icon="📏" />
                                        <DetailItem label="Head Circumference" value={baby.headCircumference} unit="cm" icon="🧠" />
                                    </div>

                                    {/* Section 3: Clinical Meta */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                        <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '-0.5rem' }}>Clinical Data</h4>
                                        <DetailItem label="Delivery Method" value={baby.deliveryMethod} icon="🏥" />
                                        <DetailItem label="Sibling Order" value={baby.numberOfBabies} icon="👶" />
                                        <div style={{ marginTop: 'auto', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '1rem', border: '1.5px dashed var(--border-color)' }}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                                                "Record synchronized with the central database. Verified on registry."
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Premium Deletion Modal */}
            {deleteModal.show && (
                <div style={{ 
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
                    backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', zIndex: 10000 
                }} onClick={() => setDeleteModal({ show: false, id: '', name: '' })}>
                    <div className="card-premium animate-slide" style={{ maxWidth: '500px', width: '90%', textAlign: 'center', padding: '3.5rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ 
                            width: '100px', height: '100px', background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444', borderRadius: '30px', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem',
                            fontSize: '3.5rem'
                        }}>
                            🗑️
                        </div>
                        <h2 className="text-huge" style={{ fontSize: '2rem' }}>Confirm Deletion</h2>
                        <p className="text-muted mt-4 mb-10" style={{ fontSize: '1.0625rem', lineHeight: '1.6' }}>
                            Are you sure you want to permanently delete the clinical profile for <strong>{deleteModal.name}</strong>? This action cannot be undone and will remove all associated health data.
                        </p>
                        <div className="flex-center" style={{ gap: '1.5rem' }}>
                            <Button onClick={() => setDeleteModal({ show: false, id: '', name: '' })} variant="outline" style={{ flex: 1, padding: '1.25rem' }}>Cancel</Button>
                            <Button onClick={confirmDelete} style={{ flex: 1, padding: '1.25rem', background: '#ef4444', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)' }}>Delete Record</Button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default BabyHistoryPage;
