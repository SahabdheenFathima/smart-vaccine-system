import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import MainLayout from '../components/templates/MainLayout';
import API_BASE from '../config';

const stages = [
  { title: 'Newborn', age: '6 Weeks - 3 Months', image: '/milestones/stage_1.png', tasks: ['Raises head when lying down.', 'Follows moving objects with eyes.', 'Responds to loud noises.', 'Makes "aaa oo ee" sounds.', 'Social smile.'] },
  { title: 'Infant', age: '3 Months - 6 Months', image: '/milestones/stage_2.png', tasks: ['Raising head and chest.', 'Interlacing fingers.', 'Grasping objects.', 'Turning head to sound.', 'Pronouncing "ba".'] },
  { title: 'Sitter', age: '6 Months - 9 Months', image: '/milestones/stage_3.png', tasks: ['Raising head on back.', 'Rolling from back to stomach.', 'Transferring objects between hands.', 'Making "Tata, Baba" sounds.'] },
  { title: 'Crawler', age: '9 Months - 12 Months', image: '/milestones/stage_4.png', tasks: ['Standing without assistance.', 'Standing up with help.', 'Repeating sounds.', 'Meaningful sounds.'] },
  { title: 'Walker', age: '12 Months - 18 Months', image: '/milestones/stage_5.png', tasks: ['Walks with assistance.', 'Says 2-3 verbs.', 'Points to familiar objects.', 'Recognizes body parts.'] },
  { title: 'Explorer', age: '18 Months - 2 Years', image: '/milestones/stage_6.png', tasks: ['Walking alone.', 'Climbing stairs with help.', 'Eating by himself.', 'Saying 10+ words.'] },
  { title: 'Toddler', age: '2 Years - 3 Years', image: '/milestones/stage_6.png', tasks: ['Running without falling.', 'Going up and down stairs without falling.', 'Drawing circles/lines.', 'Sentences of 3+ words.'] },
  { title: 'Preschooler', age: '3 Years - 4 Years', image: '/milestones/stage_6.png', tasks: ['Standing on one leg.', 'Wearing clothes/shoes.', 'Counting to 3.', 'Complex sentences.'] },
  { title: 'Pre-K', age: '4 Years - 5 Years', image: '/milestones/stage_6.png', tasks: ['Hopping on one leg.', 'Self-dressing.', 'Drawing simple human figures.', 'Correct mention of name and age.'] },
];

const DevelopmentStagesPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [babies, setBabies] = useState([]);
    const [selectedBabyId, setSelectedBabyId] = useState("");
    const [responses, setResponses] = useState({}); // Key: "stageIdx-taskIdx", Value: "YES" | "NO"
    const [loading, setLoading] = useState(true);

    const fetchMilestones = useCallback(async (babyId) => {
        try {
            const res = await axios.get(`${API_BASE}/api/milestones/baby/${babyId}`);
            if (res.data.status === "ok") {
                const fetchedResponses = {};
                res.data.data.forEach(m => {
                    fetchedResponses[`${m.stageIndex}-${m.taskIndex}`] = m.response;
                });
                setResponses(fetchedResponses);
            }
        } catch (err) {
            console.error("Error fetching milestones:", err);
            toast.error("Could not load milestones.");
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
                        fetchMilestones(firstBabyId);
                    } else {
                        setLoading(false);
                    }
                } else { navigate("/sign-in"); }
            } catch (err) { navigate("/sign-in"); }
        };
        initData();
    }, [navigate, fetchMilestones]);

    const handleBabyChange = (e) => {
        const id = e.target.value;
        setSelectedBabyId(id);
        setLoading(true);
        setResponses({});
        fetchMilestones(id);
    };

    const handleResponse = async (stageIdx, taskIdx, responseType) => {
        if (!selectedBabyId) return toast.error("Please select a child first.");

        // Optimistic UI Update
        const key = `${stageIdx}-${taskIdx}`;
        setResponses(prev => ({ ...prev, [key]: responseType }));

        try {
            await axios.post(`${API_BASE}/api/milestones`, {
                babyId: selectedBabyId,
                stageIndex: stageIdx,
                taskIndex: taskIdx,
                response: responseType
            });
            toast.success("Milestone updated successfully", { id: 'milestone-toast', duration: 1500 });
        } catch (err) {
            toast.error("Failed to save. Please try again.");
            // Revert state on failure (optional, keeping it simple for now)
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex-center justify-center" style={{ height: '80vh' }}>
                    <div className="badge-premium animate-pulse">Loading Milestones...</div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container-full py-12 animate-slide">
                <header className="mb-8 flex-center-between">
                    <div className="flex-center" style={{ gap: '1.5rem' }}>
                        <button className="btn-back" onClick={() => navigate('/dashbord')}>
                            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <div>
                            <h1 className="text-huge">Milestone Tracker</h1>
                            <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>Track developmental milestones from birth to 5 years.</p>
                        </div>
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

                {!selectedBabyId ? (
                    <div style={{ padding: '3rem', background: '#f9fafb', borderRadius: '12px', textAlign: 'center', color: '#6b7280', border: '1px dashed #d1d5db' }}>
                        Please register a child to start tracking milestones.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2.5rem' }}>
                        {stages.map((stage, sIdx) => {
                            const totalTasks = stage.tasks.length;
                            const completedTasks = stage.tasks.filter((_, tIdx) => responses[`${sIdx}-${tIdx}`] === 'YES').length;
                            const progress = Math.round((completedTasks / totalTasks) * 100);

                            // Determine status color based on progress
                            let statusColor = '#2563EB'; // Blue
                            let statusBg = '#EFF6FF';
                            if (progress >= 80) { statusColor = '#10B981'; statusBg = '#D1FAE5'; } // Green
                            else if (progress > 0 && progress < 50) { statusColor = '#F59E0B'; statusBg = '#FEF3C7'; } // Amber

                            return (
                                <div key={sIdx} className="flip-card">
                                    <div className="flip-card-inner">
                                        {/* FRONT */}
                                        <div className="flip-card-front">
                                            <div className="milestone-badge">STAGE {sIdx + 1}</div>
                                            <div style={{ height: '220px', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {/* Fallback pattern if image is missing */}
                                                <img 
                                                    src={stage.image} 
                                                    alt={stage.title} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2rem' }} 
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                            <div style={{ padding: '1.5rem', background: 'white', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>{stage.title}</h3>
                                                <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '1rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>{stage.age}</p>
                                                
                                                {/* Circular/Linear Progress Indicator */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    {/* Fake Circle Progress via CSS conic-gradient */}
                                                    <div style={{ 
                                                        width: '60px', height: '60px', borderRadius: '50%', 
                                                        background: `conic-gradient(${statusColor} ${progress}%, #E5E7EB 0)`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <span style={{ fontSize: '1rem', fontWeight: 800, color: statusColor }}>{progress}%</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827' }}>{completedTasks} Complete</div>
                                                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{completedTasks}/{totalTasks} Achieved</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* BACK */}
                                        <div className="flip-card-back">
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px' }}>STAGE {sIdx + 1}: {stage.title}</span>
                                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2563EB' }}>{stage.age}</span>
                                                </div>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>Milestone Checklist</h3>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }} className="custom-scrollbar">
                                                {stage.tasks.map((task, tIdx) => {
                                                    const res = responses[`${sIdx}-${tIdx}`];
                                                    const isYes = res === 'YES';
                                                    const isNo = res === 'NO';

                                                    return (
                                                        <div key={tIdx} style={{ 
                                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', borderRadius: '0.75rem', 
                                                            background: isYes ? '#F0FDF4' : (isNo ? '#FEF2F2' : '#F9FAFB'),
                                                            border: '1px solid',
                                                            borderColor: isYes ? '#86EFAC' : (isNo ? '#FECACA' : '#E5E7EB'),
                                                            transition: 'all 0.2s'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, paddingRight: '1rem' }}>
                                                                <div style={{ color: isYes ? '#10B981' : (isNo ? '#EF4444' : '#9CA3AF') }}>
                                                                    {isYes ? (
                                                                        <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                                    ) : (isNo ? (
                                                                        <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                    ) : (
                                                                        <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                    ))}
                                                                </div>
                                                                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', lineHeight: 1.3 }}>{task}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleResponse(sIdx, tIdx, 'YES'); }}
                                                                    style={{ 
                                                                        padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: 'none',
                                                                        background: isYes ? '#10B981' : '#E5E7EB', color: isYes ? 'white' : '#4B5563',
                                                                        boxShadow: isYes ? '0 2px 4px rgba(16,185,129,0.3)' : 'none', transition: 'all 0.2s'
                                                                    }}
                                                                >Yes</button>
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleResponse(sIdx, tIdx, 'NO'); }}
                                                                    style={{ 
                                                                        padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: 'none',
                                                                        background: isNo ? '#EF4444' : '#E5E7EB', color: isNo ? 'white' : '#4B5563',
                                                                        boxShadow: isNo ? '0 2px 4px rgba(239,68,68,0.3)' : 'none', transition: 'all 0.2s'
                                                                    }}
                                                                >No</button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <style>{`
                .flip-card {
                    background-color: transparent;
                    perspective: 1000px;
                    height: 480px;
                }
                .flip-card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-style: preserve-3d;
                }
                .flip-card:hover .flip-card-inner {
                    transform: rotateY(180deg);
                }
                .flip-card-front, .flip-card-back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
                    border: 1px solid #E5E7EB;
                }
                .flip-card-front {
                    background-color: white;
                    display: flex;
                    flex-direction: column;
                }
                .flip-card-back {
                    background-color: white;
                    transform: rotateY(180deg);
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                }
                .milestone-badge {
                    position: absolute;
                    top: 1rem;
                    left: 1rem;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    font-weight: 800;
                    font-size: 0.75rem;
                    color: #2563EB;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #D1D5DB;
                    border-radius: 10px;
                }
            `}</style>
        </MainLayout>
    );
};

export default DevelopmentStagesPage;
