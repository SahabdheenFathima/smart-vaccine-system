import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/templates/MainLayout';
import Card from '../components/atoms/Card';
import Button from '../components/atoms/Button';

const VaccineSchedulePage = () => {
    const navigate = useNavigate();
    const [babies, setBabies] = useState([]);
    const [selectedBabyId, setSelectedBabyId] = useState("");
    const [vaccines, setVaccines] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_BASE = "http://localhost:5001";

    const fetchVaccines = useCallback(async (babyId) => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/api/vaccines/baby/${babyId}`);
            if (res.data.status === "ok") {
                setVaccines(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching vaccines:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initData = async () => {
            const token = window.localStorage.getItem("token");
            if (!token) { navigate("/sign-in"); return; }
            try {
                const userRes = await axios.post(`${API_BASE}/userData`, { token });
                if (userRes.data.status === "ok") {
                    const userData = userRes.data.data;
                    const babiesRes = await axios.get(`${API_BASE}/api/user-babies/${userData.email}`);
                    if (babiesRes.data.status === "ok" && babiesRes.data.data.length > 0) {
                        setBabies(babiesRes.data.data);
                        const firstBabyId = babiesRes.data.data[0]._id;
                        setSelectedBabyId(firstBabyId);
                        fetchVaccines(firstBabyId);
                    } else {
                        setLoading(false);
                    }
                } else { navigate("/sign-in"); }
            } catch (err) { navigate("/sign-in"); }
        };
        initData();
    }, [navigate, fetchVaccines]);

    const handleBabyChange = (e) => {
        const id = e.target.value;
        setSelectedBabyId(id);
        fetchVaccines(id);
    };

    const handleCheckboxChange = async (index, vaccineId, currentStatus) => {
        // Optimistic UI update
        const updated = [...vaccines];
        updated[index].got = !currentStatus;
        setVaccines(updated);

        try {
            await axios.put(`${API_BASE}/api/vaccines/${vaccineId}`, { got: !currentStatus });
        } catch (err) {
            console.error("Error updating vaccine status:", err);
            // Revert on failure
            const reverted = [...vaccines];
            reverted[index].got = currentStatus;
            setVaccines(reverted);
            alert("Failed to update vaccine status.");
        }
    };

    return (
        <MainLayout>
            <div className="container-full py-8 animate-slide">
                <header className="mb-big flex-center-between items-end">
                    <div className="flex-center" style={{ gap: '1.5rem' }}>
                        <button className="btn-back" onClick={() => navigate('/dashbord')}>
                            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <div>
                            <div className="flex-center" style={{ gap: '1.5rem' }}>
                                <h1 className="text-huge">Vaccination Registry</h1>
                                {babies.length > 0 && (
                                    <div style={{ position: 'relative' }}>
                                        <select 
                                            value={selectedBabyId} 
                                            onChange={handleBabyChange}
                                            className="input-field"
                                            style={{ 
                                                width: 'auto', minWidth: '180px', padding: '0.5rem 2.5rem 0.5rem 1rem', 
                                                fontSize: '0.875rem', fontWeight: 700, borderRadius: '0.75rem',
                                                background: 'var(--primary-glow)', borderColor: 'var(--primary)',
                                                color: 'var(--primary)', cursor: 'pointer'
                                            }}
                                        >
                                            {babies.map(b => (
                                                <option key={b._id} value={b._id}>{b.babyName}</option>
                                            ))}
                                        </select>
                                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-muted mt-1">Personalized immunization tracker for your child.</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => window.print()} className="!px-6">
                      Print Record
                    </Button>
                </header>

                {loading ? (
                    <div className="flex-center justify-center" style={{ height: '40vh' }}>
                        <div className="badge-premium animate-pulse">Loading Schedule...</div>
                    </div>
                ) : vaccines.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-muted mb-4">No vaccine records found. Please register a baby first.</p>
                        <Button onClick={() => navigate('/add-baby')}>Register Baby</Button>
                    </Card>
                ) : (

                <Card className="p-0 overflow-hidden" style={{ borderRadius: '1.5rem' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'var(--primary-glow)', borderBottom: '1.5px solid var(--border-color)' }}>
                                    <th style={{ padding: '1.5rem', fontSize: '0.875rem', fontWeight: '800', color: 'var(--primary)' }}>SCHEDULED DATE</th>
                                    <th style={{ padding: '1.5rem', fontSize: '0.875rem', fontWeight: '800', color: 'var(--primary)' }}>VACCINE TYPE</th>
                                    <th style={{ padding: '1.5rem', fontSize: '0.875rem', fontWeight: '800', color: 'var(--primary)', textAlign: 'center' }}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vaccines.map((v, i) => (
                                    <tr key={v._id} style={{ borderBottom: '1px solid var(--border-color)', opacity: v.got ? 0.5 : 1, transition: 'all 0.2s' }}>
                                        <td style={{ padding: '1.5rem', fontSize: '1rem', fontWeight: '700' }}>
                                            {new Date(v.scheduleDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <span className="badge-premium">{v.vaccineName}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                                            <input 
                                                type="checkbox" 
                                                style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
                                                checked={v.got || false}
                                                onChange={() => handleCheckboxChange(i, v._id, v.got || false)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
                )}
            </div>
        </MainLayout>
    );
};

export default VaccineSchedulePage;
