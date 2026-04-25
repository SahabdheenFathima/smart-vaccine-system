import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';

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
    const [checkedItems, setCheckedItems] = useState(() => JSON.parse(localStorage.getItem('checkedItems')) || {});
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        localStorage.setItem('checkedItems', JSON.stringify(checkedItems));
    }, [checkedItems]);

    const toggleCheck = (stageIdx, taskIdx) => {
        const key = `${stageIdx}-${taskIdx}`;
        const isChecking = !checkedItems[key];
        setCheckedItems(prev => ({ ...prev, [key]: isChecking }));
        if (isChecking) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }
    };

    return (
        <MainLayout>
            <div className="container-full py-12 animate-slide">
                <header className="mb-big flex-center" style={{ gap: '1.5rem' }}>
                    <button className="btn-back" onClick={() => navigate('/dashbord')}>
                        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <h1 className="text-huge">Milestone Tracker</h1>
                        <p className="text-muted mt-2" style={{ fontSize: '1.125rem' }}>Track developmental milestones from birth to 5 years.</p>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
                    {stages.map((stage, sIdx) => {
                        const totalTasks = stage.tasks.length;
                        const completedTasks = stage.tasks.filter((_, tIdx) => checkedItems[`${sIdx}-${tIdx}`]).length;
                        const progress = Math.round((completedTasks / totalTasks) * 100);

                        return (
                            <div key={sIdx} className="flip-card">
                                <div className="flip-card-inner">
                                    {/* FRONT */}
                                    <div className="flip-card-front">
                                        <div className="milestone-badge">STAGE {sIdx + 1}</div>
                                        <img src={stage.image} alt={stage.title} className="milestone-img" />
                                        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stage.title}</h3>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                                                <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>{stage.age}</p>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: progress === 100 ? '#10b981' : 'var(--primary)', background: progress === 100 ? '#d1fae5' : 'var(--primary-glow)', padding: '0.25rem 0.5rem', borderRadius: '12px' }}>
                                                    {progress}% Completed
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* BACK */}
                                    <div className="flip-card-back">
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                            <span className="badge-premium">STAGE {sIdx + 1}</span>
                                            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)' }}>{stage.age}</span>
                                        </div>
                                        
                                        <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{stage.title} Details</h3>
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700 }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Overall Progress</span>
                                                <span style={{ color: progress === 100 ? '#10b981' : 'var(--primary)' }}>{progress}%</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar-fill" style={{ width: `${progress}%`, background: progress === 100 ? '#10b981' : 'var(--primary)' }}></div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }} className="custom-scrollbar">
                                            {stage.tasks.map((task, tIdx) => {
                                                const isChecked = !!checkedItems[`${sIdx}-${tIdx}`];
                                                return (
                                                    <div 
                                                        key={tIdx} 
                                                        onClick={() => toggleCheck(sIdx, tIdx)}
                                                        style={{ 
                                                            display: 'flex', gap: '0.75rem', padding: '0.875rem', borderRadius: '1rem', 
                                                            cursor: 'pointer', transition: 'all 0.2s', 
                                                            background: isChecked ? 'var(--primary-glow)' : 'var(--bg-main)',
                                                            border: '1.5px solid',
                                                            borderColor: isChecked ? 'var(--primary)' : 'var(--border-color)',
                                                        }}
                                                    >
                                                        <div style={{ 
                                                            width: '20px', height: '20px', borderRadius: '5px', 
                                                            border: '2px solid', borderColor: isChecked ? 'var(--primary)' : 'var(--text-secondary)',
                                                            background: isChecked ? 'var(--primary)' : 'transparent',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            flexShrink: 0, marginTop: '2px'
                                                        }}>
                                                            {isChecked && <svg style={{ width: '14px', height: '14px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        <span style={{ 
                                                            fontSize: '0.875rem', fontWeight: 600, 
                                                            color: isChecked ? 'var(--primary)' : 'var(--text-secondary)',
                                                            textDecoration: isChecked ? 'line-through' : 'none',
                                                            lineHeight: 1.4
                                                        }}>{task}</span>
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

                {/* Custom Success Notification */}
                {showSuccess && (
                    <div style={{ 
                        position: 'fixed', bottom: '40px', right: '40px', 
                        background: 'var(--primary)', color: 'white', 
                        padding: '1.25rem 2.5rem', borderRadius: '1.5rem', 
                        boxShadow: '0 20px 40px -10px var(--primary-glow)',
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        fontWeight: 800, zIndex: 9999, animation: 'slideRight 0.3s ease-out'
                    }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        Milestone Completed Successfully!
                    </div>
                )}
            </div>
            <style>{`
                @keyframes slideRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                
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
                    border-radius: 1.5rem;
                    overflow: hidden;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                }
                .flip-card-front {
                    background-color: var(--bg-card);
                    display: flex;
                    flex-direction: column;
                }
                .flip-card-back {
                    background-color: var(--bg-card);
                    transform: rotateY(180deg);
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid var(--border-color);
                }
                .milestone-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    flex: 1;
                    min-height: 0;
                }
                .milestone-badge {
                    position: absolute;
                    top: 1.5rem;
                    left: 1.5rem;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-weight: 800;
                    font-size: 0.8125rem;
                    color: var(--primary);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .progress-bar-container {
                    width: 100%;
                    height: 8px;
                    background: var(--bg-secondary);
                    border-radius: 4px;
                    margin-top: 0.5rem;
                    overflow: hidden;
                }
                .progress-bar-fill {
                    height: 100%;
                    transition: width 0.3s ease;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: var(--border-color);
                    border-radius: 10px;
                }
            `}</style>
        </MainLayout>
    );
};

export default DevelopmentStagesPage;
