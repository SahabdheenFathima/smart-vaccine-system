import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "react-hot-toast";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler } from "chart.js";
import MainLayout from '../components/templates/MainLayout';
import API_BASE from '../config';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const [babies, setBabies] = useState([]);
    const [selectedBabyId, setSelectedBabyId] = useState("");
    const [data, setData] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(document.documentElement.getAttribute('data-theme') === 'dark');

    const fetchGrowthData = useCallback(async (email, babyId) => {
        try {
            const url = babyId ? `${API_BASE}/api/growth/baby/${babyId}` : `${API_BASE}/api/growth/${email}`;
            const res = await axios.get(url);
            if (res.data.status === "ok") {
                setData(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching growth data:", err);
            setData([]);
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
                    setUser(userData);
                    
                    const babiesRes = await axios.get(`${API_BASE}/api/user-babies/${userData.email}`);
                    if (babiesRes.data.status === "ok" && babiesRes.data.data.length > 0) {
                        setBabies(babiesRes.data.data);
                        const firstBabyId = babiesRes.data.data[0]._id;
                        setSelectedBabyId(firstBabyId);
                        fetchGrowthData(userData.email, firstBabyId);
                    } else {
                        setLoading(false);
                    }
                } else { navigate("/sign-in"); }
            } catch (err) { navigate("/sign-in"); }
        };
        initData();

        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, [navigate, fetchGrowthData]);

    const handleBabyChange = (e) => {
        const id = e.target.value;
        setSelectedBabyId(id);
        setLoading(true);
        fetchGrowthData(user.email, id);
    };

    const referenceData = [
        { age: 0, height: 49.9 }, { age: 1, height: 54.7 }, { age: 2, height: 58.4 },
        { age: 3, height: 61.4 }, { age: 4, height: 63.9 }, { age: 6, height: 67.6 },
        { age: 8, height: 70.6 }, { age: 10, height: 73.3 }, { age: 12, height: 75.7 },
        { age: 15, height: 79.1 }, { age: 18, height: 82.3 }, { age: 24, height: 87.8 },
        { age: 30, height: 91.9 }, { age: 36, height: 96.1 },
    ];

    const getGrowthStatus = () => {
        if (data.length === 0) return null;
        const lastEntry = data[data.length - 1];
        const ref = referenceData.reduce((prev, curr) => {
            return (Math.abs(curr.age - lastEntry.age) < Math.abs(prev.age - lastEntry.age) ? curr : prev);
        });
        const diff = ((lastEntry.height - ref.height) / ref.height) * 100;
        if (Math.abs(diff) <= 3) return { text: "On Track", color: "#10b981", bg: "#ecfdf5", description: "Healthy Progress" };
        if (Math.abs(diff) <= 7) return { text: "Healthy", color: "#6366f1", bg: "#eef2ff", description: "Within expected range" };
        if (diff > 7) return { text: "Above Average", color: "#8b5cf6", bg: "#f5f3ff", description: "Growing fast" };
        return { text: "Monitor", color: "#f59e0b", bg: "#fffbeb", description: "Slightly below average" };
    };

    const status = getGrowthStatus();
    const latestData = data.length > 0 ? data[data.length - 1] : null;
    const selectedBaby = babies.find(b => b._id === selectedBabyId);

    const formatAge = (months) => {
        if (months === null || months === undefined) return '-';
        const years = Math.floor(months / 12);
        const remMonths = months % 12;
        if (years === 0) return `${remMonths} Months`;
        if (remMonths === 0) return `${years} Years`;
        return `${years} Years ${remMonths} Months`;
    };

    const chartData = {
        datasets: [
            {
                label: "Actual Growth",
                data: data.map((item) => ({ x: item.age, y: item.height })),
                borderColor: "#4F46E5",
                backgroundColor: "rgba(79, 70, 229, 0.15)",
                fill: true,
                tension: 0.45,
                pointRadius: 6,
                pointHoverRadius: 9,
                pointBackgroundColor: "#4F46E5",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                borderWidth: 4,
                zIndex: 10,
            },
            {
                label: "WHO Standard",
                data: referenceData.map((item) => ({ x: item.age, y: item.height })),
                borderColor: isDark ? "#334155" : "#cbd5e1",
                borderDash: [6, 6],
                backgroundColor: "transparent",
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
                zIndex: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { 
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: { size: 12, weight: '600', family: "'Outfit', sans-serif" },
                    color: isDark ? '#94a3b8' : '#64748b'
                }
            },
            tooltip: {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#f8fafc' : '#0f172a',
                bodyColor: isDark ? '#94a3b8' : '#64748b',
                titleFont: { size: 13, weight: '700', family: "'Outfit', sans-serif" },
                bodyFont: { size: 12, family: "'Outfit', sans-serif" },
                padding: 16,
                cornerRadius: 16,
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                displayColors: true,
            }
        },
        scales: {
            x: { 
                type: 'linear',
                min: 0,
                max: Math.max(24, ...data.map(d => d.age)),
                grid: { display: false }, 
                ticks: { stepSize: 3, color: isDark ? '#94a3b8' : '#64748b', font: { weight: '500' }, callback: (v) => `${v}m` },
                title: { display: true, text: 'Age (months)', color: isDark ? '#475569' : '#94a3b8', font: { size: 11, weight: '700' } }
            },
            y: { 
                grid: { color: isDark ? '#1e293b' : '#f1f5f9', borderDash: [4, 4] }, 
                ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { weight: '500' } },
                title: { display: true, text: 'Height (cm)', color: isDark ? '#475569' : '#94a3b8', font: { size: 11, weight: '700' } }
            },
        },
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex-center justify-center" style={{ height: '80vh' }}>
                    <div className="badge-premium animate-pulse">Loading Growth Data...</div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container-full py-10 animate-slide">
                <header className="mb-8 flex-center-between">
                    <div>
                        <h1 className="text-huge" style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>Development Tracking</h1>
                        <p className="text-muted mt-1" style={{ color: '#6b7280' }}>Read-only view of your child's growth and measurements.</p>
                    </div>
                    {babies.length > 0 && (
                        <div style={{ position: 'relative' }}>
                            <select 
                                value={selectedBabyId} 
                                onChange={handleBabyChange}
                                className="input-field"
                                style={{ 
                                    minWidth: '200px', padding: '0.75rem 2.5rem 0.75rem 1.25rem', 
                                    fontSize: '1rem', fontWeight: 700, borderRadius: '0.75rem',
                                    background: '#F3F4F6', border: '1px solid #E5E7EB', color: '#111827', cursor: 'pointer', outline: 'none'
                                }}
                            >
                                {babies.map(b => (
                                    <option key={b._id} value={b._id}>{b.babyName}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </header>

                {/* Summary Cards */}
                {latestData ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem' }}>1. Height</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827' }}>{latestData.height} cm</div>
                        </div>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem' }}>2. Weight</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827' }}>{latestData.weight ? `${latestData.weight} kg` : '--'}</div>
                        </div>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem' }}>3. Age</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{formatAge(latestData.age)}</div>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Born {new Date(selectedBaby?.birthDate).toLocaleDateString()}</div>
                        </div>
                        <div style={{ background: status.bg, padding: '1.5rem', borderRadius: '12px', border: `1px solid ${status.color}30` }}>
                            <div style={{ fontSize: '0.875rem', color: status.color, fontWeight: 600, marginBottom: '0.5rem' }}>4. Growth Status</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: status.color }}>{status.text}</div>
                            <div style={{ fontSize: '0.85rem', color: status.color, marginTop: '0.25rem', opacity: 0.8 }}>{status.description}</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '12px', textAlign: 'center', marginBottom: '2rem', color: '#6b7280', border: '1px dashed #d1d5db' }}>
                        No measurement data available for this child yet.
                    </div>
                )}

                {/* Growth Chart */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '2.5rem' }}>
                    <div className="mb-6">
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Height Progress</h3>
                        <p className="text-sm text-muted" style={{ color: '#6b7280' }}>Tracking actual growth against WHO Standard References.</p>
                    </div>
                    <div style={{ minHeight: '400px', position: 'relative' }}>
                        <Line data={chartData} options={options} />
                    </div>
                </div>

                {/* Measurement Timeline */}
                {data.length > 0 && (
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>Growth Milestone Timeline</h3>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {[...data].reverse().map((item, index, arr) => (
                                <div key={item._id} style={{ display: 'flex', gap: '1.5rem', position: 'relative', paddingBottom: index !== arr.length - 1 ? '1.5rem' : '0' }}>
                                    {/* Vertical Line */}
                                    {index !== arr.length - 1 && (
                                        <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: 0, width: '2px', background: '#e5e7eb' }}></div>
                                    )}
                                    {/* Timeline Node */}
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F3F4F6', border: '2px solid #D1D5DB', flexShrink: 0, zIndex: 1, marginTop: '16px' }}></div>
                                    
                                    {/* Content Card */}
                                    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '130px' }}>
                                                <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                <span style={{ fontWeight: 600, color: '#4b5563', fontSize: '0.875rem' }}>
                                                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div style={{ height: '20px', width: '1px', background: '#d1d5db' }}></div>
                                            <span style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{item.height} cm</span>
                                            
                                            {item.weight && (
                                                <>
                                                    <div style={{ height: '20px', width: '1px', background: '#d1d5db' }}></div>
                                                    <span style={{ color: '#4b5563', fontWeight: 500, fontSize: '0.9rem' }}>{item.weight} kg</span>
                                                </>
                                            )}
                                            {item.headCircumference && (
                                                <>
                                                    <div style={{ height: '20px', width: '1px', background: '#d1d5db' }}></div>
                                                    <span style={{ color: '#4b5563', fontWeight: 500, fontSize: '0.9rem' }}>HC: {item.headCircumference} cm</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default AnalyticsPage;
