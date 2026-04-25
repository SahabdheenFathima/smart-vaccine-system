import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';

const stages = [
  { age: '6 Weeks - 3 Months', tasks: ['Raises head when lying down.', 'Follows moving objects with eyes.', 'Responds to loud noises.', 'Makes "aaa oo ee" sounds.', 'Social smile.'] },
  { age: '3 Months - 6 Months', tasks: ['Raising head and chest.', 'Interlacing fingers.', 'Grasping objects.', 'Turning head to sound.', 'Pronouncing "ba".'] },
  { age: '6 Months - 9 Months', tasks: ['Raising head on back.', 'Rolling from back to stomach.', 'Transferring objects between hands.', 'Making "Tata, Baba" sounds.'] },
  { age: '9 Months - 12 Months', tasks: ['Standing without assistance.', 'Standing up with help.', 'Repeating sounds.', 'Meaningful sounds.'] },
  { age: '12 Months - 18 Months', tasks: ['Walks with assistance.', 'Says 2-3 verbs.', 'Points to familiar objects.', 'Recognizes body parts.'] },
  { age: '18 Months - 2 Years', tasks: ['Walking alone.', 'Climbing stairs with help.', 'Eating by himself.', 'Saying 10+ words.'] },
  { age: '2 Years - 3 Years', tasks: ['Running without falling.', 'Going up and down stairs without falling.', 'Drawing circles/lines.', 'Sentences of 3+ words.'] },
  { age: '3 Years - 4 Years', tasks: ['Standing on one leg.', 'Wearing clothes/shoes.', 'Counting to 3.', 'Complex sentences.'] },
  { age: '4 Years - 5 Years', tasks: ['Hopping on one leg.', 'Self-dressing.', 'Drawing simple human figures.', 'Correct mention of name and age.'] },
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2.5rem' }}>
                    {stages.map((stage, sIdx) => (
                        <div key={sIdx} className="card-premium h-full">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <span className="badge-premium">STAGE {sIdx + 1}</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)' }}>{stage.age}</span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {stage.tasks.map((task, tIdx) => {
                                    const isChecked = !!checkedItems[`${sIdx}-${tIdx}`];
                                    return (
                                        <div 
                                            key={tIdx} 
                                            onClick={() => toggleCheck(sIdx, tIdx)}
                                            style={{ 
                                                display: 'flex', gap: '1rem', padding: '1.25rem', borderRadius: '1.25rem', 
                                                cursor: 'pointer', transition: 'all 0.3s', 
                                                background: isChecked ? 'var(--primary-glow)' : 'var(--bg-main)',
                                                border: '2px solid',
                                                borderColor: isChecked ? 'var(--primary)' : 'var(--border-color)',
                                                transform: isChecked ? 'scale(1.02)' : 'scale(1)'
                                            }}
                                        >
                                            <div style={{ 
                                                width: '24px', height: '24px', borderRadius: '6px', 
                                                border: '2px solid', borderColor: isChecked ? 'var(--primary)' : 'var(--text-secondary)',
                                                background: isChecked ? 'var(--primary)' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                {isChecked && <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <span style={{ 
                                                fontSize: '1rem', fontWeight: 700, 
                                                color: isChecked ? 'var(--primary)' : 'var(--text-secondary)',
                                                textDecoration: isChecked ? 'line-through' : 'none'
                                            }}>{task}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
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
            `}</style>
        </MainLayout>
    );
};

export default DevelopmentStagesPage;
