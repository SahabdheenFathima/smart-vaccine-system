// Comprehensive Child Health Development Form (React Version)

import React, { useState, useEffect } from 'react';
import '../../assets/styles/HomePage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function HealthForm() {
  const [formData, setFormData] = useState({
    bhtNumber: '',
    bTime: '',
    admissionDate: '',
    admissionWard: '',
    babyName: '',
    birthDate: '',
    birthWeight: '',
    birthHeight: '',
    headCircumference: '',
    deliveryMethod: '',
    tshLevel: '',
    tshResult: '',
    vitaminK: '',
    feedWithinOneHour: '',
    motherMagazineAttachment: '',
    breastfeedingPosition: '',
    thyroidTest: '',
    hospital: '',
    doctor: '',
    numberOfBabies: '',
    motherAge: '',
    email: '',
    additionalNotes: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is authenticated and fetch their data
    const fetchUserData = async () => {
      const token = window.localStorage.getItem('token');
      if (token) {
        try {
          // First get the user details (especially email)
          const userResponse = await fetch('http://localhost:5001/userData', {
            method: 'POST',
            crossDomain: true,
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ token }),
          });

          const userData = await userResponse.json();
          if (userData.status === 'ok' && userData.data.email) {
            const userEmail = userData.data.email;

            // Now fetch any previously submitted baby forms for this email
            try {
              const babyResponse = await axios.get(`http://localhost:5001/api/baby-details/${userEmail}`);
              if (babyResponse.data) {
                // Formatting date inputs (YYYY-MM-DD from full ISO format)
                const formatDate = (isoString) => isoString ? isoString.split('T')[0] : '';

                // Safely update the form state with the retrieved data
                setFormData((prev) => ({
                  ...prev,
                  ...babyResponse.data,
                  birthDate: babyResponse.data.birthDate ? formatDate(babyResponse.data.birthDate) : prev.birthDate,
                  admissionDate: babyResponse.data.admissionDate ? formatDate(babyResponse.data.admissionDate) : prev.admissionDate,
                  email: userEmail,
                }));
              }
            } catch (babyErr) {
              console.log('No previous baby data found or error fetching:', babyErr.response?.data?.message || babyErr.message);
              // Still set email so they don't have to type it
              setFormData((prev) => ({ ...prev, email: userEmail }));
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create a copy of formData and remove MongoDB specific fields 
      // so it doesn't trigger a Duplicate Key error on re-submission
      const payload = { ...formData };
      delete payload._id;
      delete payload.__v;

      const response = await axios.post('http://localhost:5001/submit-form', payload);
      alert('Form submitted successfully!');
      console.log('Server response:', response.data);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Submission failed. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <h2>📝 Comprehensive Child Health Development Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {[{
            label: "B.H.T. Number", name: 'bhtNumber', type: 'text'
          },
          { label: "B. Time", name: 'bTime', type: 'time' },
          { label: 'Admission Date', name: 'admissionDate', type: 'date' },
          { label: 'Admission Ward', name: 'admissionWard', type: 'text' },
          { label: "babyName", name: 'babyName', type: 'text' },
          { label: 'Date of Birth', name: 'birthDate', type: 'date' },
          { label: 'Birth Weight (g)', name: 'birthWeight', type: 'number' },
          { label: 'Birth Height (cm)', name: 'birthHeight', type: 'number' },
          { label: 'Head Circumference (cm)', name: 'headCircumference', type: 'number' },
          { label: 'Delivery Method', name: 'deliveryMethod', type: 'select', options: ['--Select--', 'Normal', 'Cesarean', 'Forceps', 'Vacuum'] },
          { label: 'Number of Babies', name: 'numberOfBabies', type: 'number' },
          { label: 'Mother Age', name: 'motherAge', type: 'number' },
          { label: 'TSH Level', name: 'tshLevel', type: 'text' },
          { label: 'TSH Result', name: 'tshResult', type: 'text' },
          { label: 'Vitamin K Given', name: 'vitaminK', type: 'select', options: ['--Select--', 'Yes', 'No'] },
          { label: 'Feed Within One Hour', name: 'feedWithinOneHour', type: 'select', options: ['--Select--', 'Yes', 'No'] },
          { label: 'Mother Magazine Attachment', name: 'motherMagazineAttachment', type: 'select', options: ['--Select--', 'Correct', 'Incorrect'] },
          { label: 'Breastfeeding Position', name: 'breastfeedingPosition', type: 'select', options: ['--Select--', 'Correct', 'Incorrect'] },
          { label: 'Have you been subjected to a thyroid test?', name: 'thyroidTest', type: 'select', options: ['--Select--', 'Yes', 'No'] },
          { label: 'Hospital', name: 'hospital', type: 'text' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Doctor', name: 'doctor', type: 'text' },
          { label: 'Additional Notes', name: 'additionalNotes', type: 'textarea' },
          ].map(({ label, name, type, options }) => (
            <div className={`form-group ${type === 'textarea' ? 'full-width' : ''}`} key={name}>
              <label htmlFor={name}>{label}</label>
              {type === 'textarea' ? (
                <textarea id={name} name={name} value={formData[name]} onChange={handleChange} rows="3" />
              ) : type === 'select' ? (
                <select id={name} name={name} value={formData[name]} onChange={handleChange} required>
                  {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input type={type} id={name} name={name} value={formData[name]} onChange={handleChange} required />
              )}
            </div>
          ))}
          <div className="button-container">
            <button type="submit">Submit Details</button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/success')}>Next Step</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default HealthForm;
