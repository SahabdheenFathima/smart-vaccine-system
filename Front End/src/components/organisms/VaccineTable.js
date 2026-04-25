import React, { useState, useEffect } from 'react';
import '../../assets/styles/VaccineTable.css';

const VaccineTable = () => {
    // Version identifier for vaccine data
    const dataVersion = 'v1.2';

    // Initial vaccine data
    const initialVaccines = [
        { age: 'At Birth', type: 'B.C.G', reason: 'Tuberculosis prevention', date: 'At Birth', got: false },
        { age: '2 months completed', type: 'Pentavalent-1', reason: 'Cough', date: '2nd month', got: false },
        { age: '2 months completed', type: 'OPV-1', reason: 'Polio', date: '2nd month', got: false },
        { age: '2 months completed', type: 'flPV-1', reason: 'Hepatitis B prevention', date: '2nd month', got: false },
        { age: '4 months completed', type: 'Pentavalent-2', reason: 'Inflammatory pain', date: '4th month', got: false },
        { age: '4 months completed', type: 'OPV-2', reason: 'Throat infection', date: '4th month', got: false },
        { age: '4 months completed', type: 'flPV-2', reason: 'Hepatitis B prevention', date: '4th month', got: false },
        { age: '6 months completed', type: 'Pentavalent-3', reason: 'Inflammatory pain', date: '6th month', got: false },
        { age: '6 months completed', type: 'OPV-3', reason: 'Throat infection', date: '6th month', got: false },
        { age: '9 months completed', type: 'MMR-1', reason: 'Measles, Mumps, Rubella', date: '9th month', got: false },
        { age: '12 months completed', type: 'Live JE', reason: 'Japanese Encephalitis', date: '12th month', got: false },
        { age: '18 months completed', type: 'DPT', reason: 'Diphtheria, Pertussis, Tetanus', date: '18th month', got: false },
        { age: '18 months completed', type: 'OPV-4', reason: 'Polio', date: '18th month', got: false },
        { age: '3 years completed', type: 'MMR-2', reason: 'Measles, Mumps, Rubella', date: '3rd year', got: false },
        { age: '5 years completed', type: 'D.T', reason: 'Diphtheria, Tetanus', date: '5th year', got: false },
        { age: '5 years completed', type: 'OPV-5', reason: 'Polio', date: '5th year', got: false },
        { age: '10 years completed (for females)', type: 'HPV-1', reason: 'Cervical cancer prevention', date: '10th year', got: false },
        { age: '10 years completed (for females)', type: 'HPV-2', reason: 'Cervical cancer prevention', date: '10th year (6 months after 1st dose)', got: false },
        { age: '11 years completed', type: 'Adult Tetanus & Diphtheria', reason: 'Boost immunity', date: '11th year', got: false },
    ];

    // Load vaccine data from Local Storage
    const loadVaccines = () => {
        try {
            const savedData = localStorage.getItem('vaccineData');
            const savedVersion = localStorage.getItem('vaccineDataVersion');

            // Check version and load data accordingly
            if (savedData && savedVersion === dataVersion) {
                return JSON.parse(savedData);
            } else {
                // Update the version in local storage
                localStorage.setItem('vaccineDataVersion', dataVersion);
                return initialVaccines;
            }
        } catch (error) {
            console.error('Error loading vaccine data:', error);
            return initialVaccines;
        }
    };

    // State to manage vaccine data
    const [vaccines, setVaccines] = useState(loadVaccines);

    // Save data to Local Storage whenever vaccines state changes
    useEffect(() => {
        localStorage.setItem('vaccineData', JSON.stringify(vaccines));
    }, [vaccines]);

    // Handle date change for vaccine
    const handleDateChange = (index, newDate) => {
        const updatedVaccines = [...vaccines];
        updatedVaccines[index].date = newDate;
        setVaccines(updatedVaccines);
    };

    // Toggle checkbox status and update state
    const handleCheckboxChange = (index) => {
        const updatedVaccines = [...vaccines];
        updatedVaccines[index].got = !updatedVaccines[index].got;
        setVaccines(updatedVaccines);
    };

    return (
        <div className="card-premium animate-slide" style={{ padding: '2rem' }}>
            <div className="flex-center-between mb-8">
                <div>
                    <h2 className="text-huge" style={{ fontSize: '1.75rem' }}>Immunization Record</h2>
                    <p className="text-muted">Certified vaccination schedule and dose tracking.</p>
                </div>
                <div className="badge-premium">Official Schedule v1.2</div>
            </div>
            
            <div className="table-responsive">
                <table className="vaccine-table">
                    <thead>
                        <tr>
                            <th>Age Milestone</th>
                            <th>Vaccine Type</th>
                            <th>Clinical Reason</th>
                            <th>Scheduled Date</th>
                            <th style={{ textAlign: 'center' }}>Administered</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vaccines.map((vaccine, index) => (
                            <tr key={index}>
                                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{vaccine.age}</td>
                                <td>
                                    <span className="badge-premium" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', textTransform: 'none' }}>
                                        {vaccine.type}
                                    </span>
                                </td>
                                <td className="text-muted" style={{ fontSize: '0.875rem' }}>{vaccine.reason}</td>
                                <td>
                                    <input
                                        className="input-field"
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: 'auto' }}
                                        type="date"
                                        value={vaccine.date}
                                        onChange={(e) => handleDateChange(index, e.target.value)}
                                    />
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        checked={vaccine.got}
                                        onChange={() => handleCheckboxChange(index)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VaccineTable;
