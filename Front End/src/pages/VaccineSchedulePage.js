import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import Card from '../components/atoms/Card';
import Button from '../components/atoms/Button';

const VaccineSchedulePage = () => {
    const navigate = useNavigate();
    const dataVersion = 'v1.2';
    const initialVaccines = [
        { age: 'At Birth', type: 'B.C.G', reason: 'Tuberculosis prevention', date: 'At Birth', got: false },
        { age: '2 months', type: 'Pentavalent-1', reason: 'Diphtheria, Tetanus, Pertussis, Hep B, Hib', date: '2nd month', got: false },
        { age: '2 months', type: 'OPV-1', reason: 'Polio', date: '2nd month', got: false },
        { age: '2 months', type: 'flPV-1', reason: 'TB prevention', date: '2nd month', got: false },
        { age: '4 months', type: 'Pentavalent-2', reason: 'Multiple infections', date: '4th month', got: false },
        { age: '4 months', type: 'OPV-2', reason: 'Polio', date: '4th month', got: false },
        { age: '4 months', type: 'flPV-2', reason: 'TB prevention', date: '4th month', got: false },
        { age: '6 months', type: 'Pentavalent-3', reason: 'Multiple infections', date: '6th month', got: false },
        { age: '6 months', type: 'OPV-3', reason: 'Polio', date: '6th month', got: false },
        { age: '9 months', type: 'MMR-1', reason: 'Measles, Mumps, Rubella', date: '9th month', got: false },
    ];

    const [vaccines, setVaccines] = useState(() => {
        const savedData = localStorage.getItem('vaccineData');
        const savedVersion = localStorage.getItem('vaccineDataVersion');
        if (savedData && savedVersion === dataVersion) {
            return JSON.parse(savedData);
        }
        return initialVaccines;
    });

    useEffect(() => {
        localStorage.setItem('vaccineData', JSON.stringify(vaccines));
        localStorage.setItem('vaccineDataVersion', dataVersion);
    }, [vaccines]);

    const handleCheckboxChange = (index) => {
        const updated = [...vaccines];
        updated[index].got = !updated[index].got;
        setVaccines(updated);
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
                            <h1 className="text-huge">Vaccination Registry</h1>
                            <p className="text-muted mt-1">Personalized immunization tracker for your child.</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => window.print()} className="!px-6">
                      Print Record
                    </Button>
                </header>

                <Card className="p-0 overflow-hidden" style={{ borderRadius: '1.5rem' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'var(--primary-glow)', borderBottom: '1.5px solid var(--border-color)' }}>
                                    <th style={{ padding: '1.5rem', fontSize: '0.875rem', fontWeight: '800', color: 'var(--primary)' }}>AGE</th>
                                    <th style={{ padding: '1.5rem', fontSize: '0.875rem', fontWeight: '800', color: 'var(--primary)' }}>VACCINE TYPE</th>
                                    <th style={{ padding: '1.5rem', fontSize: '0.875rem', fontWeight: '800', color: 'var(--primary)' }}>PURPOSE</th>
                                    <th style={{ padding: '1.5rem', fontSize: '0.875rem', fontWeight: '800', color: 'var(--primary)', textAlign: 'center' }}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vaccines.map((v, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', opacity: v.got ? 0.5 : 1, transition: 'all 0.2s' }}>
                                        <td style={{ padding: '1.5rem', fontSize: '1rem', fontWeight: '700' }}>{v.age}</td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <span className="badge-premium">{v.type}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem', fontSize: '0.9375rem', color: 'var(--text-muted)' }}>{v.reason}</td>
                                        <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                                            <input 
                                                type="checkbox" 
                                                style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
                                                checked={v.got}
                                                onChange={() => handleCheckboxChange(i)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};

export default VaccineSchedulePage;
