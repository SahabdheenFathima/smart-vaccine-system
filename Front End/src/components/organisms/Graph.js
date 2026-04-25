import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { useNavigate } from "react-router-dom";
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const ChartPage = () => {
    const [length, setLength] = useState("");
    const [weight1, setWeight1] = useState("");
    const [height, setHeight] = useState("");
    const [weight2, setWeight2] = useState("");
    const [lengthData, setLengthData] = useState([]);
    const [heightData, setHeightData] = useState([]);
    let navigate = useNavigate();
    // Load stored data
    useEffect(() => {
        const storedLengthData = JSON.parse(localStorage.getItem("lengthWeightData")) || [];
        const storedHeightData = JSON.parse(localStorage.getItem("heightWeightData")) || [];
        setLengthData(storedLengthData);
        setHeightData(storedHeightData);
    }, []);

    const handleDeleteLength = (index) => {
        const updatedData = lengthData.filter((_, i) => i !== index);
        setLengthData(updatedData);
        localStorage.setItem("lengthWeightData", JSON.stringify(updatedData));
    };

    const handleDeleteHeight = (index) => {
        const updatedData = heightData.filter((_, i) => i !== index);
        setHeightData(updatedData);
        localStorage.setItem("heightWeightData", JSON.stringify(updatedData));
    };

    const handleNextPage = () => {
        navigate("/next4");
    };
    // Handle Length vs Weight submission
    const handleLengthSubmit = (e) => {
        e.preventDefault();
        if (length && weight1) {
            const newLengthData = [...lengthData, { length: parseFloat(length), weight: parseFloat(weight1) }];
            setLengthData(newLengthData);
            localStorage.setItem("lengthWeightData", JSON.stringify(newLengthData));
            setLength("");
            setWeight1("");
        }
    };

    // Handle Height vs Weight submission
    const handleHeightSubmit = (e) => {
        e.preventDefault();
        if (height && weight2) {
            const newHeightData = [...heightData, { height: parseFloat(height), weight: parseFloat(weight2) }];
            setHeightData(newHeightData);
            localStorage.setItem("heightWeightData", JSON.stringify(newHeightData));
            setHeight("");
            setWeight2("");
        }
    };
    
    // Length vs Weight Chart Data
    const lengthWeightChartData = {
        labels: lengthData.map((item, index) => `Data ${index + 1}`),
        datasets: [
            {
                label: "Length (cm)",
                data: lengthData.map((item) => item.length),
                borderColor: "blue",
                fill: false,
                tension: 0.3,
            },
            {
                label: "Weight (kg)",
                data: lengthData.map((item) => item.weight),
                borderColor: "green",
                fill: false,
                tension: 0.3,
            },
        ],
    };

    // Height vs Weight Chart Data
    const heightWeightChartData = {
        labels: heightData.map((item, index) => `Data ${index + 1}`),
        datasets: [
            {
                label: "Height (cm)",
                data: heightData.map((item) => item.height),
                borderColor: "orange",
                fill: false,
                tension: 0.3,
            },
            {
                label: "Weight (kg)",
                data: heightData.map((item) => item.weight),
                borderColor: "purple",
                fill: false,
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
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
                    text: "Data Points",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Measurement",
                },
            },
        },
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Weight-for-length/height chart of the child</h2>

            {/* Length vs Weight Input */}
            <form onSubmit={handleLengthSubmit} style={{ marginBottom: "20px" }}>
                <h3>Length (cm) vs. Weight (kg) - From Birth to 2 Years</h3>
                <div>
                    <label>Length (cm): </label>
                    <input
                        type="number"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        placeholder="Enter length"
                        required
                    />
                </div>
                <div>
                    <label>Weight (kg): </label>
                    <input
                        type="number"
                        value={weight1}
                        onChange={(e) => setWeight1(e.target.value)}
                        placeholder="Enter weight"
                        required
                    />
                </div>
                <button type="submit" style={{ marginTop: "10px" }}>Add Data</button>
            </form>
            <ul>
                {heightData.map((item, index) => (
                    <li key={index}>{`Height: ${item.height}, Weight: ${item.weight}`} <button onClick={() => handleDeleteHeight(index)} style={{ marginLeft: '5px', padding: '2px 2px', fontSize: '10px', width: '20px' }}>x</button></li>
                ))}
            </ul>
            {/* Length vs Weight Chart */}
            <div style={{ marginBottom: "30px" }}>
                <Line data={lengthWeightChartData} options={options} />
            </div>

            {/* Height vs Weight Input */}
            <form onSubmit={handleHeightSubmit} style={{ marginBottom: "20px" }}>
                <h3>Height (cm) vs. Weight (kg) - From 2 to 5 Years</h3>
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
                <div>
                    <label>Weight (kg): </label>
                    <input
                        type="number"
                        value={weight2}
                        onChange={(e) => setWeight2(e.target.value)}
                        placeholder="Enter weight"
                        required
                    />
                </div>
                <button type="submit" style={{ marginTop: "10px" }}>Add Data</button>
            </form>
             <ul>
                {heightData.map((item, index) => (
                    <li key={index}>{`Height: ${item.height}, Weight: ${item.weight}`} <button onClick={() => handleDeleteHeight(index)} style={{ marginLeft: '5px', padding: '2px 2px', fontSize: '10px', width: '20px' }}>x</button></li>
                ))}
            </ul>
            {/* Height vs Weight Chart */}
            <div style={{ marginBottom: "30px" }}>
                <Line data={heightWeightChartData} options={options} />
            </div>
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
