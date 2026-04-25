import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Form2.css'; // Premium lavender glassmorphism styles

const GrowthChart = () => {
  const [growthData, setGrowthData] = useState([]);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedData = localStorage.getItem('growthData');
    if (savedData) {
      setGrowthData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('growthData', JSON.stringify(growthData));
  }, [growthData]);

  const handleAddData = () => {
    if (age && weight) {
      const newData = { age: parseInt(age), weight: parseFloat(weight) };
      setGrowthData((prevData) => [...prevData, newData]);
      setAge('');
      setWeight('');
    }
  };

  const handleDelete = (index) => {
    const newData = growthData.filter((_, i) => i !== index);
    setGrowthData(newData);
  };

  const handleNextPage = () => {
    navigate('/next2');
  };

  return (
    <div className="form2-page">
      <div className="form2-container">
        <h2 className="form2-header">Age vs Weight chart</h2>

        <div className="form2-input-group">
          <div className="form2-field">
            <label>Age (Months):</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age in months"
            />
          </div>

          <div className="form2-field">
            <label>Weight (kg):</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight in kg"
            />
          </div>

          <button className="btn-form2 btn-form2-add" onClick={handleAddData}>
            Add Data
          </button>
        </div>

        <div className="form2-chart-wrapper">
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={growthData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(216, 180, 254, 0.4)" />
              <XAxis dataKey="age" label={{ value: "Age (Months)", position: "insideBottomRight", offset: -5 }} stroke="#7e22ce" />
              <YAxis label={{ value: "Weight (kg)", angle: -90, position: "insideLeft" }} stroke="#7e22ce" />
              <Tooltip cursor={{ stroke: 'rgba(168, 85, 247, 0.3)', strokeWidth: 2 }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={3} dot={{ r: 5, fill: '#7e22ce', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#db2777' }} name="Weight" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {growthData.length > 0 && (
          <ul className="form2-data-list">
            {growthData.map((item, index) => (
              <li key={index}>
                Age: {item.age}m | Wt: {item.weight}kg
                <button className="btn-form2-delete" onClick={() => handleDelete(index)} aria-label="Delete entry">
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <button className="btn-form2 btn-form2-next" onClick={handleNextPage}>
          Next Page
        </button>
      </div>
    </div>
  );
};

export default GrowthChart;
