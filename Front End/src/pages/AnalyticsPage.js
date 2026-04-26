import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "react-hot-toast";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler } from "chart.js";
import MainLayout from '../components/templates/MainLayout';
import Card from '../components/atoms/Card';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const [babies, setBabies] = useState([]);
    const [selectedBabyId, setSelectedBabyId] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [manualMonth, setManualMonth] = useState("");
    const [data, setData] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(document.documentElement.getAttribute('data-theme') === 'dark');

    const API_BASE = "http://localhost:5001";

    const fetchGrowthData = useCallback(async (email, babyId) => {
        try {
            // Fetch by babyId if selected, otherwise fallback to email (legacy)
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
                    
                    // Fetch all babies for this user
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

    const calculateAgeInMonths = (birthDate) => {
        if (!birthDate) return 0;
        const today = new Date();
        const birth = new Date(birthDate);
        let months = (today.getFullYear() - birth.getFullYear()) * 12;
        months -= birth.getMonth();
        months += today.getMonth();
        return months <= 0 ? 0 : months;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const baby = babies.find(b => b._id === selectedBabyId);

        if (height && user && selectedBabyId && baby) {
            try {
                const calculatedAge = calculateAgeInMonths(baby.birthDate);
                const res = await axios.post(`${API_BASE}/api/growth`, {
                    email: user.email,
                    babyId: selectedBabyId,
                    age: calculatedAge,
                    month: manualMonth || calculatedAge,
                    height,
                    weight
                });
                if (res.data.status === "ok") {
                    setData(prev => [...prev, res.data.data].sort((a, b) => a.age - b.age));
                    setHeight("");
                    setWeight("");
                    setManualMonth("");
                    toast.success("Measurement saved successfully");
                }
            } catch (err) {
                toast.error("Failed to save measurement");
            }
        } else if (!selectedBabyId) {
            toast.error("Please register or select a baby first.");
        }
    };

    const handleDelete = async (id, index) => {
        try {
            const res = await axios.delete(`${API_BASE}/api/growth/${id}`);
            if (res.data.status === "ok") {
                setData(data.filter((_, i) => i !== index));
                toast.success("Record deleted");
            }
        } catch (err) {
            toast.error("Failed to delete record");
        }
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
        if (Math.abs(diff) <= 3) return { text: "Optimal", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", description: "Your baby's height is perfectly aligned with global standards." };
        if (Math.abs(diff) <= 7) return { text: "Healthy", color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)", description: "Healthy growth pattern within the expected range." };
        if (diff > 7) return { text: "Above Average", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)", description: "Baby is growing faster than average. Generally healthy." };
        return { text: "Below Average", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", description: "Height is slightly below average. Consider checking with your pediatrician." };
    };

    const status = getGrowthStatus();

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
                    boxWidth: 8,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
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
                boxPadding: 8,
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                displayColors: true,
                callbacks: { label: (context) => ` ${context.dataset.label}: ${context.parsed.y} cm` }
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
                    <div className="badge-premium animate-pulse">Synchronizing Data...</div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container-full py-10 animate-slide">
                <header className="mb-10 flex-center-between">
                    <div className="flex-center" style={{ gap: '2rem' }}>
                        <button className="btn-back" onClick={() => navigate('/dashbord')}>
                            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <div>
                            <span className="badge-premium mb-2">Growth Analytics</span>
                            <div className="flex-center" style={{ gap: '1.5rem' }}>
                                <h1 className="text-huge">Development Tracking</h1>
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
                            <p className="text-muted mt-1">AI-powered analysis of {babies.find(b => b._id === selectedBabyId)?.babyName || "your child"}'s growth patterns.</p>
                        </div>
                    </div>
                    {status && (
                        <div className="card-premium p-4 flex items-center gap-4" style={{ padding: '1rem 1.5rem', background: isDark ? 'rgba(79, 70, 229, 0.05)' : 'rgba(79, 70, 229, 0.02)' }}>
                            <div className="w-12 h-12 rounded-2xl flex-center justify-center" style={{ background: status.bg, color: status.color }}>
                                <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Health Status</p>
                                <h4 className="text-lg font-bold" style={{ color: status.color }}>{status.text}</h4>
                            </div>
                        </div>
                    )}
                </header>

                <div className="grid-main">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="card-premium">
                            <div className="mb-8">
                                <h3 className="text-title">Record Measurement</h3>
                                <p className="text-muted text-sm mt-1">Update your child's latest height data</p>
                            </div>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Month (Optional Override)</label>
                                    <Input type="number" value={manualMonth} onChange={(e) => setManualMonth(e.target.value)} placeholder="e.g. 12" className="input-field" />
                                    <small className="text-xs text-slate-400 ml-1">Leave empty to auto-calculate based on birth date ({babies.find(b => b._id === selectedBabyId) ? calculateAgeInMonths(babies.find(b => b._id === selectedBabyId).birthDate) : '0'}m)</small>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Height (CM)</label>
                                        <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 75.5" required className="input-field" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Weight (KG)</label>
                                        <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 9.2" className="input-field" />
                                    </div>
                                </div>
                                <Button type="submit" className="btn-premium w-full mt-2">
                                    <span>Sync to Database</span>
                                    <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                </Button>
                            </form>
                        </div>
                        {status && (
                            <div className="card-premium" style={{ borderLeft: `4px solid ${status.color}`, background: isDark ? '#1a2236' : '#fff' }}>
                                <h4 className="text-sm font-bold mb-2">Analysis Report</h4>
                                <p className="text-sm text-muted leading-relaxed">{status.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="card-premium" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="flex-center-between mb-8">
                            <div>
                                <h3 className="text-title">Growth Progress</h3>
                                <p className="text-sm text-muted">Comparative Height Analysis</p>
                            </div>
                            <div className="badge-premium animate-pulse">Live Cloud Sync</div>
                        </div>
                        <div style={{ flex: 1, minHeight: '350px', position: 'relative' }}>
                            <Line data={chartData} options={options} />
                        </div>
                    </div>
                </div>

                {data.length > 0 && (
                    <div className="mt-12">
                        <div className="mb-6 flex-center-between px-2">
                            <h3 className="text-title">Measurement History</h3>
                            <span className="text-sm text-muted">{data.length} total entries</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                            {data.map((item, index) => (
                                <div key={item._id || index} className="card-premium p-6 flex-center-between group hover:border-indigo-500 transition-all cursor-default" style={{ padding: '1.25rem 1.5rem' }}>
                                    <div className="flex-center">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex-center justify-center text-indigo-500">
                                            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase block">{item.age} Months</span>
                                            <div className="flex-center" style={{ gap: '0.75rem' }}>
                                                <span className="text-lg font-bold">{item.height} <small className="text-xs font-normal text-muted">cm</small></span>
                                                {item.weight && (
                                                    <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                                                        {item.weight} <small className="text-xs font-normal text-muted">kg</small>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(item._id, index)} className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-50 text-red-500 flex-center justify-center transition-all hover:bg-red-500 hover:text-white">
                                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
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

