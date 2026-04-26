import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';
import API_BASE from '../config';

const RegistrationPage = () => {
    const [formData, setFormData] = useState({ fname: '', email: '', password: '', role: 'PARENT' });
    const [status, setStatus] = useState({ loading: false, success: false, error: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: '' });
        try {
            const res = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.status === "ok") {
                setStatus({ loading: false, success: true, error: '' });
                setTimeout(() => navigate("/sign-in"), 2000);
            } else {
                setStatus({ loading: false, success: false, error: data.error || "Registration failed" });
            }
        } catch (err) {
            setStatus({ loading: false, success: false, error: "Server connection failed" });
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            background: 'var(--bg-main)', 
            display: 'flex', 
            overflow: 'hidden'
        }}>
            {/* Left Side: Professional Branding & Image */}
            <div style={{ 
                flex: '1', 
                background: `linear-gradient(rgba(79, 70, 229, 0.8), rgba(79, 70, 229, 0.9)), url('/health_portal_login_bg_1776919142737.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '5rem',
                color: 'white',
                position: 'relative'
            }} className="md-visible">
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ 
                        width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', 
                        borderRadius: '16px', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem',
                        border: '1px solid rgba(255,255,255,0.3)'
                    }}>SS</div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
                        The journey of <br /> motherhood, simplified.
                    </h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '480px', lineHeight: 1.6 }}>
                        Join thousands of parents using Smart System to ensure their children hit every growth milestone on time.
                    </p>
                    
                    <div style={{ marginTop: '4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span style={{ fontWeight: 600 }}>Automated Vaccination Alerts</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span style={{ fontWeight: 600 }}>Interactive Growth Analytics</span>
                        </div>
                    </div>
                </div>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            </div>

            {/* Right Side: Registration Form */}
            <div style={{ 
                flex: '1', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '2rem',
                background: 'var(--bg-main)'
            }}>
                <div className="card-premium animate-slide" style={{ maxWidth: '440px', width: '100%', padding: '3rem', border: 'none', boxShadow: 'none', background: 'transparent' }}>
                    
                    {/* Success Message Banner */}
                    {status.success && (
                        <div style={{ 
                            background: '#10b981', color: 'white', padding: '1rem',
                            borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                            animation: 'slideDown 0.3s ease-out', marginBottom: '2rem', fontWeight: 700
                        }}>
                            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                            Account created!
                        </div>
                    )}

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h1 className="text-huge" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Create Account</h1>
                        <p className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Join our healthcare community today.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <Input 
                            label="Full Name" placeholder="John Doe" required
                            value={formData.fname} onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                            disabled={status.success}
                        />
                        <Input 
                            label="Email Address" type="email" placeholder="john@example.com" required
                            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={status.success}
                        />
                        <Input 
                            label="Password" type="password" placeholder="••••••••" required
                            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            disabled={status.success}
                        />

                        {/* Role selection removed for demo — defaults to PARENT */}

                        
                        {status.error && (
                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 800 }}>
                                {status.error}
                            </div>
                        )}

                        <Button type="submit" style={{ padding: '1.25rem', fontSize: '1rem', marginTop: '1rem' }} disabled={status.loading || status.success}>
                            {status.loading ? 'Creating account...' : 'Start Your Journey'}
                        </Button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                        <p className="text-muted" style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                            Already have an account? 
                            <Link to="/sign-in" style={{ marginLeft: '0.5rem', color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <style>{`
                @media (max-width: 992px) { .md-visible { display: none !important; } }
                @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default RegistrationPage;
