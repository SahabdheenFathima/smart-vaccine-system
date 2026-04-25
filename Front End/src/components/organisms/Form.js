import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Form = () => {
  const navigate = useNavigate();
  // Load saved data from local storage on component mount
  const initialData = JSON.parse(localStorage.getItem('formData')) || {
    date: '',
    maturityWeeks: '',
    bloodGroup: '',
    sga: false,
    aga: false,
    lga: false,
    peripheries: '',
    hydration: '',
    responseHandling: '',
    capillaryRefill: '',
    pulseRate: '',
    heartMurmurs: '',
    femoralPulse: '',
    respiratoryRate: '',
    grunting: '',
    intercostalRecession: '',
    tone: '',
    ofc: '',
    eyes: '',
    scalp: '',
    mouth: '',
    palate: '',
    ears: '',
    abdomen: '',
    umbilicus: '',
    genitalia: '',
    anus: '',
    hips: '',
    spine: '',
    limbs: '',
    dysmorphicFeatures: '',
    skinInfection: '',
    birthInjuries: '',
    spO2: '',
    dischargeDate: '',
    actionTaken: '',
    specialCare: false,
    discharged: false,
    diagnosis: '',
    screeningDone: false,
    contact1: '',
    contact2: '',
  };

  const [formData, setFormData] = useState(initialData);

  // Update state when form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Save data to local storage on form submission
  const handleSave = () => {
    localStorage.setItem('formData', JSON.stringify(formData));
    alert('Form data saved!');
  };
  const handleNext = () => {
    navigate('/next');
  };

  // Render checkbox components
  const renderComponent = (label, name) => (
    <div className="form-section" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label style={{ minWidth: '150px' }}>{label}:</label>
      <input
        type="radio"
        name={name}
        checked={formData[name] === 'Normal'}
        value="Normal"
        onChange={handleChange}
      />
      <label>Normal</label>
      <input
        type="radio"
        name={name}
        checked={formData[name] === 'Abnormal'}
        value="Abnormal"
        onChange={handleChange}
      />
      <label>Abnormal</label>
    </div>
  );

  return (
    <div className="form-container">
      <h1>Neonatal Examination</h1>
      <h2>To be filled by the medical officer performing neonatal examination</h2>
      <div className="form-section">
        <label>Date:</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} />
      </div>
      <div className="form-section">
        <label>Maturity of baby (weeks):</label>
        <input
          type="text"
          name="maturityWeeks"
          value={formData.maturityWeeks}
          onChange={handleChange}
        />
      </div>
      <div className="form-section">
        <label>Baby's Growth:</label>
        <input type="checkbox" name="sga" checked={formData.sga} onChange={handleChange} /> SGA
        <input type="checkbox" name="aga" checked={formData.aga} onChange={handleChange} /> AGA
        <input type="checkbox" name="lga" checked={formData.lga} onChange={handleChange} /> LGA
      </div>
      <div className="form-section">
        <label>Baby's Blood Group:</label>
        <input
          type="text"
          name="bloodGroup"
          value={formData.bloodGroup}
          onChange={handleChange}
        />
      </div>
      {[
        'Peripheries', 'Hydration', 'Response Handling', 'Capillary Refill', 'Pulse Rate', 
        'Heart Murmurs', 'Femoral Pulse', 'Respiratory Rate', 'Grunting', 
        'Intercostal Recession', 'Tone', 'OFC', 'Eyes', 'Scalp', 'Mouth', 
        'Palate', 'Ears', 'Abdomen', 'Umbilicus', 'Genitalia', 'Anus', 
        'Hips', 'Spine', 'Limbs', 'Dysmorphic Features', 
        'Superficial Infection Skin', 'Birth Injuries'
      ].map((component) => renderComponent(component, component.toLowerCase().replace(/ /g, '')))}
      <div className="form-section">
        <label>Diagnosis at discharge:</label>
        <input
          type="text"
          name="diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
        />
      </div>
      <button className="submit-btn" onClick={handleSave}>
        Save
      </button>
      <button className="next-btn" onClick={handleNext} style={{ marginLeft: '10px' }}>
        Next
      </button>
    </div>
  );
};

export default Form;
