import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';
import axios from 'axios';

const BabyFormPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        babyName: '', birthDate: '', motherName: '', motherAge: '',
        address: '', weight: '', height: '', headCircumference: '',
        deliveryMethod: 'Normal', email: '', numberOfBabies: '1', additionalInfo: ''
    });
    const [status, setStatus] = useState({ loading: false, success: false, error: false });

    useEffect(() => {
        const token = window.localStorage.getItem('token');
        if (!token) { navigate('/sign-in'); return; }
        
        fetch('http://localhost:5001/userData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                setFormData(prev => ({ ...prev, email: data.data.email }));
            }
        });
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Final Validation Check
        if (!formData.babyName || !formData.birthDate || !formData.email) {
            setStatus({ 
                loading: false, 
                success: false, 
                error: "Please ensure Baby Name, Birth Date, and Contact Email are provided." 
            });
            return;
        }

        setStatus({ loading: true, success: false, error: false });
        console.log("📤 Submitting Registration Data:", formData);

        try {
            const res = await axios.post('http://localhost:5001/submit-form', formData);
            if (res.data.status === "ok") {
                setStatus({ loading: false, success: true, error: false });
            } else {
                setStatus({ loading: false, success: false, error: res.data.error || "Server failed to save record" });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || "Connection to health registry failed";
            setStatus({ loading: false, success: false, error: errorMsg });
            console.error("Critical Registration Error:", err);
        }
    };

    return (
        <MainLayout>
            <div className="container-full py-8 animate-slide">
                <header className="mb-big flex-center" style={{ gap: '1.5rem' }}>
                    <button className="btn-back" onClick={() => navigate('/dashbord')}>
                        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <h1 className="text-huge">New Registration</h1>
                        <p className="text-muted mt-1">Initialize a comprehensive health development record.</p>
                    </div>
                </header>

                <div className="card-premium">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {/* Personal Information */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <h3 className="text-title">Personal Information</h3>
                            <div className="grid-main">
                                <Input label="Baby's Full Name" name="babyName" placeholder="Enter baby's name" required value={formData.babyName} onChange={handleChange} />
                                <Input label="Date of Birth" name="birthDate" type="date" required value={formData.birthDate} onChange={handleChange} />
                                <Input label="Mother's Name" name="motherName" placeholder="Enter mother's name" value={formData.motherName} onChange={handleChange} />
                                <Input label="Mother's Age" name="motherAge" type="number" placeholder="Enter age" value={formData.motherAge} onChange={handleChange} />
                            </div>
                            <div style={{ width: '100%' }}>
                                <Input label="Residential Address" name="address" placeholder="Enter full address" value={formData.address} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={{ borderTop: '1.5px solid var(--border-color)' }}></div>

                        {/* Birth Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <h3 className="text-title">Health Metrics at Birth</h3>
                            <div className="grid-actions">
                                <Input label="Weight (g)" name="weight" type="number" placeholder="3200" value={formData.weight} onChange={handleChange} />
                                <Input label="Height (cm)" name="height" type="number" placeholder="50" value={formData.height} onChange={handleChange} />
                                <Input label="Head Circ. (cm)" name="headCircumference" type="number" placeholder="35" value={formData.headCircumference} onChange={handleChange} />
                                <Input label="Sibling Order" name="numberOfBabies" type="number" placeholder="1" value={formData.numberOfBabies} onChange={handleChange} />
                            </div>
                            <Input label="Contact Email" name="email" type="email" required value={formData.email} onChange={handleChange} />
                        </div>

                        {/* Delivery Method Selector */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Delivery Method</label>
                            <div className="grid-actions">
                                {['Normal', 'Cesarean', 'Forceps', 'Vacuum'].map(method => (
                                    <label 
                                        key={method} 
                                        style={{ 
                                            padding: '1.25rem', border: '2px solid', borderRadius: '1rem', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', 
                                            borderColor: formData.deliveryMethod === method ? 'var(--primary)' : 'var(--border-color)', 
                                            background: formData.deliveryMethod === method ? 'var(--primary-glow)' : 'transparent',
                                            color: formData.deliveryMethod === method ? 'var(--primary)' : 'var(--text-primary)',
                                            fontWeight: 700
                                        }}
                                    >
                                        <input type="radio" name="deliveryMethod" value={method} style={{ display: 'none' }} checked={formData.deliveryMethod === method} onChange={handleChange} />
                                        {method}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Additional Clinical Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Additional Clinical Info</label>
                            <textarea 
                                name="additionalInfo"
                                className="input-field"
                                style={{ minHeight: '120px', resize: 'vertical', paddingTop: '1rem' }}
                                placeholder="Any health observations or special notes..."
                                value={formData.additionalInfo}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Form Submission */}
                        <div className="flex-center" style={{ gap: '2rem', marginTop: '1rem' }}>
                            <Button variant="outline" type="button" onClick={() => navigate('/dashbord')} style={{ flex: 1, padding: '1.25rem' }}>Discard Changes</Button>
                            <Button type="submit" style={{ flex: 1, padding: '1.25rem' }} disabled={status.loading}>{status.loading ? 'Saving Record...' : 'Register Profile'}</Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Custom Success Modal */}
            {status.success && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div className="card-premium animate-slide" style={{ maxWidth: '450px', width: '90%', textAlign: 'center', padding: '3rem' }}>
                        <div style={{ width: '80px', height: '80px', background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                            <svg style={{ width: '40px', height: '40px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-huge" style={{ fontSize: '1.75rem' }}>Registration Success!</h2>
                        <p className="text-muted mt-4 mb-8">The health developmental record has been successfully initialized and securely stored.</p>
                        <Button onClick={() => navigate('/dashbord')} className="w-full">Continue to Dashboard</Button>
                    </div>
                </div>
            )}

            {/* Custom Error Message */}
            {status.error && (
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#ef4444', color: 'white', padding: '1rem 2rem', borderRadius: '1rem', fontWeight: 800, zIndex: 10000, boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.4)' }}>
                    {status.error}
                </div>
            )}
        </MainLayout>
    );
};

export default BabyFormPage;
