import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Form3.css'; // Premium pink glassmorphism styles

const HealthForm = () => {
  const navigate = useNavigate();

  // Load saved form data from Local Storage or initialize if not present
  const loadFormData = () => {
    try {
      const savedData = localStorage.getItem('healthFormData');
      return savedData ? JSON.parse(savedData) : {
        birthTo10: {
          date: '',
          skinColor: '',
          eye: '',
          Umbilicalcord: '',
          temperature: '',
          Exclusive_breastfeeding: '',
          Position_during_breastfeeding: '',
          Attachment_to_the_breast_during_breastfeeding: '',
          Color_of_stool_code: '',
          Other_identified_problem_conditions: ''
        },
        day14To21: {
          date: '',
          skinColor: '',
          eye: '',
          Umbilicalcord: '',
          temperature: '',
          Exclusive_breastfeeding: '',
          Position_during_breastfeeding: '',
          Attachment_to_the_breast_during_breastfeeding: '',
          Color_of_stool_code: '',
          Other_identified_problem_conditions: ''
        },
        day42: {
          date: '',
          skinColor: '',
          eye: '',
          Umbilicalcord: '',
          temperature: '',
          Exclusive_breastfeeding: '',
          Position_during_breastfeeding: '',
          Attachment_to_the_breast_during_breastfeeding: '',
          Color_of_stool_code: '',
          Other_identified_problem_conditions: ''
        },
        date: {
          Next_date_to_visit_the_clinic: '',
          Next_date_for_health_education: ''
        }
      };
    } catch (error) {
      console.error('Error loading form data:', error);
      return {};
    }
  };

  // Initialize state with loaded data
  const [formData, setFormData] = useState(loadFormData);

  // Load data on component mount to ensure it stays on "Back" navigation
  useEffect(() => {
    const savedData = loadFormData();
    setFormData(savedData);
  }, []);

  // Save form data to Local Storage whenever formData changes
  useEffect(() => {
    localStorage.setItem('healthFormData', JSON.stringify(formData));
  }, [formData]);

  // Handle input change
  const handleChange = (section, e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [section]: { ...prevFormData[section], [name]: value }
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('healthFormData', JSON.stringify(formData));
    alert('Form data saved successfully!');
  };

  // Navigate to the next page
  const handleNextPage = () => {
    navigate('/next5');
  };

  // Render each section of the form
  const renderSection = (section, title) => (
    <div className="form3-section">
      <h3 className="form3-section-title">{title}</h3>
      <div className="form3-grid">
        {Object.keys(formData[section]).map((key) => (
          <div key={key} className="form3-group">
            <label>
              {key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
            </label>
            <input
              type="text"
              name={key}
              value={formData[section][key]}
              onChange={(e) => handleChange(section, e)}
              placeholder="Enter details..."
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="form3-page">
      <div className="form3-container">
        <h2 className="form3-header">
          Family Health Officer Assessment
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#9d174d' }}>
          This section should be filled by the family health officer during the home visit after delivery.
        </p>
        <form onSubmit={handleSubmit}>
          {renderSection('birthTo10', 'From Birth to 10 Days')}
          {renderSection('day14To21', '14 to 21 Days')}
          {renderSection('day42', '42 Days')}
          {renderSection('date', 'Upcoming Dates')}

          <div className="form3-buttons">
            <button type="submit" className="btn-form3-primary">
              Save Assessment
            </button>
            <button type="button" onClick={handleNextPage} className="btn-form3-secondary">
              Next Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthForm;
