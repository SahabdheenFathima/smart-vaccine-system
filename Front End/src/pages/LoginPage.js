import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';
import API_BASE from '../config';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [status, setStatus] = useState({ loading: false, success: false, error: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: '' });
        try {
            const res = await fetch(`${API_BASE}/login-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.status === "ok") {
                window.localStorage.setItem("token", data.data);
                window.localStorage.setItem("loggedIn", "true");
                setStatus({ loading: false, success: true, error: '' });
                setTimeout(() => navigate("/dashbord"), 1500);
            } else {
                setStatus({ loading: false, success: false, error: data.error || "Invalid credentials provided." });
            }
        } catch (err) {
            setStatus({ loading: false, success: false, error: "System connection failure. Please try again." });
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            width: '100vw',
            background: '#F8FAFC', 
            display: 'flex', 
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Left Side: Premium Brand Visuals */}
            <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ 
                    flex: '1.2', 
                    background: `linear-gradient(rgba(79, 70, 229, 0.75), rgba(49, 46, 129, 0.9)), url('/pediatric_login_bg_1777808240653.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '6rem',
                    color: 'white',
                    position: 'relative'
                }} 
                className="md-visible"
            >
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        style={{ 
                            width: '72px', height: '72px', background: 'rgba(255,255,255,0.15)', 
                            borderRadius: '20px', backdropFilter: 'blur(12px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.75rem', fontWeight: 900, marginBottom: '2.5rem',
                            border: '1px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                        }}
                    >
                        SC
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1.05, marginBottom: '2rem', letterSpacing: '-0.03em' }}
                    >
                        SmartCare <br />
                        <span style={{ color: '#A5B4FC' }}>Pediatric Portal.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        style={{ fontSize: '1.35rem', opacity: 0.9, maxWidth: '520px', lineHeight: 1.6, fontWeight: 500 }}
                    >
                        Advanced immunization tracking and growth analytics for the next generation of healthcare.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        style={{ marginTop: '5rem', display: 'flex', gap: '4rem' }}
                    >
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>99.9%</div>
                            <div style={{ opacity: 0.7, fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uptime Reliability</div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>AES-256</div>
                            <div style={{ opacity: 0.7, fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enterprise Security</div>
                        </div>
                    </motion.div>
                </div>
                
                {/* Subtle animated particles overlay */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </motion.div>

            {/* Right Side: Professional Authentication Suite */}
            <div style={{ 
                flex: '1', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '3rem',
                background: '#F8FAFC',
                position: 'relative'
            }}>
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ maxWidth: '460px', width: '100%', padding: '4rem', background: 'white', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}
                >
                    <div style={{ marginBottom: '3rem' }}>
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{ display: 'inline-flex', padding: '0.5rem 1rem', background: '#EEF2FF', color: '#4F46E5', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        >
                            Secure Access
                        </motion.div>
                        <h1 style={{ fontSize: '2.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Welcome Back</h1>
                        <p style={{ fontSize: '1.05rem', color: '#64748B', fontWeight: 500 }}>Enter your clinical or parent credentials to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '3.1rem', color: '#94A3B8', zIndex: 1 }} />
                                <Input 
                                    label="Medical ID / Email" type="email" placeholder="dr.smith@hospital.gov" required
                                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={status.success}
                                    style={{ paddingLeft: '3rem' }}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1.25rem', top: '3.1rem', color: '#94A3B8', zIndex: 1 }} />
                                <Input 
                                    label="Security Password" type="password" placeholder="••••••••••••" required
                                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={status.success}
                                    style={{ paddingLeft: '3rem' }}
                                />
                            </div>
                        </motion.div>

                        <AnimatePresence>
                            {status.error && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ padding: '1rem', background: '#FEF2F2', color: '#EF4444', borderRadius: '16px', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #FEE2E2' }}
                                >
                                    <AlertCircle size={18} />
                                    {status.error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Button 
                                type="submit" 
                                style={{ 
                                    padding: '1.25rem', fontSize: '1.1rem', marginTop: '1rem', width: '100%',
                                    background: status.success ? '#10B981' : '#4F46E5',
                                    boxShadow: status.success ? '0 10px 20px rgba(16,185,129,0.2)' : '0 10px 20px rgba(79,70,229,0.2)'
                                }} 
                                disabled={status.loading || status.success}
                            >
                                {status.loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                        <Loader2 className="animate-spin" size={20} /> Validating...
                                    </span>
                                ) : status.success ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                        <CheckCircle2 size={20} /> Identity Verified
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                        Sign In to Portal <ArrowRight size={20} />
                                    </span>
                                )}
                            </Button>
                        </motion.div>
                    </form>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        style={{ textAlign: 'center', marginTop: '3.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '2.5rem' }}
                    >
                        <p style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 600 }}>
                            Unauthorized Access Prohibited. <br />
                            <Link to="/sign-up" style={{ color: '#4F46E5', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem' }}>
                                Request Staff Credentials <ShieldCheck size={16} />
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
            
            <style>{`
                @media (max-width: 1100px) { .md-visible { display: none !important; } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default LoginPage;
