import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import Card from '../components/atoms/Card';

const stages = [
  { age: '6 Weeks - 3 Months', description: '1. Raises head when lying down.\n2. Follows moving objects with eyes.\n3. Responds to loud noises.\n4. Makes "aaa oo ee" sounds.\n5. Social smile.' },
  { age: '3 Months - 6 Months', description: '1. Raising head and chest.\n2. Interlacing fingers.\n3. Grasping objects.\n4. Turning head to sound.\n5. Pronouncing "ba".' },
  { age: '6 Months - 9 Months', description: '1. Raising head on back.\n2. Rolling from back to stomach.\n3. Transferring objects between hands.\n4. Making "Tata, Baba" sounds.' },
  { age: '9 Months - 12 Months', description: '1. Standing without assistance.\n2. Standing up with help.\n3. Repeating sounds.\n4. Meaningful sounds.' },
  { age: '12 Months - 18 Months', description: '1. Walks with assistance.\n2. Says 2-3 verbs.\n3. Points to familiar objects.\n4. Recognizes body parts.' },
  { age: '18 Months - 2 Years', description: '1. Walking alone.\n2. Climbing stairs with help.\n3. Eating by himself.\n4. Saying 10+ words.' },
  { age: '2 Years - 3 Years', description: '1. Running without falling.\n2. Going up and down stairs without falling.\n3. Drawing circles/lines.\n4. Sentences of 3+ words.' },
  { age: '3 Years - 4 Years', description: '1. Standing on one leg.\n2. Wearing clothes/shoes.\n3. Counting to 3.\n4. Complex sentences.' },
  { age: '4 Years - 5 Years', description: '1. Hopping on one leg.\n2. Self-dressing.\n3. Drawing simple human figures.\n4. Correct mention of name and age.' },
];

const DevelopmentStagesPage = () => {
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState(() => {
    const stored = localStorage.getItem('checkedItems');
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem('checkedItems', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleCheck = (stageIdx, itemIdx) => {
    const key = `${stageIdx}-${itemIdx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <MainLayout>
      <div className="container-full py-8 animate-slide">
        <header className="mb-big flex-center" style={{ gap: '1.5rem' }}>
            <button className="btn-back" onClick={() => navigate('/dashbord')}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
                <h1 className="text-huge">Milestone Tracker</h1>
                <p className="text-muted mt-1">Universal developmental stages from birth to 5 years.</p>
            </div>
        </header>

        <div className="grid-main" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {stages.map((stage, sIdx) => (
            <Card key={sIdx} className="p-8 h-full">
              <div className="mb-6">
                <span className="badge-premium">Stage {sIdx + 1}</span>
                <h3 className="text-title mt-4">{stage.age}</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stage.description.split('\n').map((item, iIdx) => {
                  const isChecked = !!checkedItems[`${sIdx}-${iIdx}`];
                  return (
                    <label key={iIdx} style={{ 
                        display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '1rem', 
                        cursor: 'pointer', transition: 'all 0.2s', border: '1.5px solid',
                        borderColor: isChecked ? 'var(--primary)' : 'transparent',
                        background: isChecked ? 'var(--primary-glow)' : 'var(--bg-main)'
                    }}>
                      <input 
                        type="checkbox" 
                        style={{ width: '1.25rem', height: '1.25rem', marginTop: '0.125rem', accentColor: 'var(--primary)' }}
                        checked={isChecked}
                        onChange={() => toggleCheck(sIdx, iIdx)}
                      />
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: isChecked ? 'var(--primary)' : 'var(--text-secondary)' }}>{item}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default DevelopmentStagesPage;
