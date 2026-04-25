import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { useNavigate } from 'react-router-dom';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const ChartPage = () => {
    const [age, setAge] = useState("");
    const [height, setHeight] = useState("");
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem("ageHeightData")) || [];
        setData(storedData);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (age && height) {
            const newData = [...data, { age: parseInt(age), height: parseFloat(height) }];
            setData(newData);
            localStorage.setItem("ageHeightData", JSON.stringify(newData));
            setAge("");
            setHeight("");
        }
    };

    const handleDelete = (index) => {
        const newData = data.filter((_, i) => i !== index);
        setData(newData);
        localStorage.setItem("ageHeightData", JSON.stringify(newData));
    };

    const handleNextPage = () => {
        navigate('/next3');
    };

    const chartData = {
        labels: data.map((item) => `${item.age} months`),
        datasets: [
            {
                label: "Height (cm)",
                data: data.map((item) => item.height),
                borderColor: "blue",
                fill: false,
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top",
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Age (Months)",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Height (cm)",
                },
            },
        },
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Age (Months) vs. Height (cm) Chart</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
                <div>
                    <label>Age (months): </label>
                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Enter age in months"
                        required
                    />
                </div>
                <div>
                    <label>Height (cm): </label>
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="Enter height"
                        required
                    />
                </div>
                <button type="submit" style={{ margin: '10px 0' }}>Add Data</button>
            </form>

            <div style={{ height: '300px', maxWidth: '600px', margin: '0 auto' }}>
                <Line data={chartData} options={options} />
            </div>

            <ul>
                {data.map((item, index) => (
                    <li key={index}>
                        Age: {item.age} months, Height: {item.height} cm
                        <button onClick={() => handleDelete(index)} style={{ marginLeft: '5px', padding: '2px 2px', fontSize: '10px', width: '20px' }}>x</button>
                    </li>
                ))}
            </ul>

            <button
                onClick={handleNextPage}
                style={{ padding: '8px 20px', marginTop: '20px', display: 'block' }}
            >
                Next
            </button>
        </div>
    );
};

export default ChartPage;
