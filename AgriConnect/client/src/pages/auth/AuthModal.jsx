import React, { useState } from 'react';
import { X, Sprout, User, Lock, Mail, Phone, MapPin, ArrowRight, Briefcase, Award } from 'lucide-react';
import { useAgri } from '../../context/AgriContext';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', initialRole = 'farmer' }) {
  const { login: agriLogin, register: agriRegister } = useAgri();
  const { login: authLogin, register: authRegister } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: '',
    skills: 'Harvesting, General Agriculture',
    experience: '3+ Years',
    farmDetails: 'Multi-crop Farm',
    farmSize: '10 Acres'
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        // Handle Login
        const loginPayload = {
          email: formData.email,
          password: formData.password,
          role,
          name: formData.name,
          phone: formData.phone,
          location: formData.location
        };

        await agriLogin(loginPayload);
        if (typeof authLogin === 'function') {
          try {
            await authLogin(loginPayload);
          } catch (e) {
            // Already authenticated via agriLogin
          }
        }
      } else {
        // Handle Register
        const regPayload = {
          name: formData.name || 'Vishal Sollapure',
          email: formData.email.includes('@')
            ? formData.email
            : (role === 'farmer' ? 'vishalssollapure@gmail.com' : 'vishalssollapure1748@gmail.com'),
          phone: formData.phone || '7795511748',
          password: formData.password || (role === 'farmer' ? 'Vishal@123' : 'Vishal@987'),
          role,
          location: formData.location || 'Maharashtra, India',
          skills: role === 'worker' ? formData.skills : undefined,
          experience: role === 'worker' ? formData.experience : undefined,
          farmDetails: role === 'farmer' ? formData.farmDetails : undefined,
          farmSize: role === 'farmer' ? formData.farmSize : undefined
        };

        await agriRegister(regPayload);
        if (typeof authRegister === 'function') {
          try {
            await authRegister(regPayload);
          } catch (e) {
            // Already registered via agriRegister
          }
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsSubmitting(false);
        onClose();
      }, 900);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(7, 10, 17, 0.85)',
      backdropFilter: 'blur(12px)',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2.2rem',
        position: 'relative',
        background: '#0f172a',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8)'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: '#94a3b8',
            width: '2.2rem',
            height: '2.2rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '0.85rem',
            background: 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <Sprout size={24} color="#070a11" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            {isLogin ? 'Log in to access your AgriConnect profile' : 'Join India\'s premier agricultural labor platform'}
          </p>
        </div>

        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.75rem 1rem',
            borderRadius: '0.6rem',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 700 }}>
              {isLogin ? 'Logged in successfully!' : 'Profile created successfully!'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Opening your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            
            {/* Role Switcher */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '0.3rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <button
                type="button"
                onClick={() => setRole('farmer')}
                style={{
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: role === 'farmer' ? '#10b981' : 'transparent',
                  color: role === 'farmer' ? '#070a11' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                👨‍🌾 Farmer
              </button>
              <button
                type="button"
                onClick={() => setRole('worker')}
                style={{
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: role === 'worker' ? '#84cc16' : 'transparent',
                  color: role === 'worker' ? '#070a11' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                👷 Worker
              </button>
            </div>

            {/* Quick-fill registered test credentials */}
            {isLogin && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px dashed rgba(16, 185, 129, 0.3)',
                borderRadius: '0.6rem',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.6rem',
                fontSize: '0.82rem'
              }}>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: '#cbd5e1', fontWeight: 600 }}>
                    {role === 'farmer' ? 'Registered Farmer:' : 'Registered Worker:'}
                  </div>
                  <div style={{ color: '#34d399', fontSize: '0.8rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {role === 'farmer' ? 'vishalssollapure@gmail.com' : 'vishalssollapure1748@gmail.com'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (role === 'farmer') {
                      setFormData(prev => ({
                        ...prev,
                        email: 'vishalssollapure@gmail.com',
                        password: 'Vishal@123',
                        phone: '7795511748'
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        email: 'vishalssollapure1748@gmail.com',
                        password: 'Vishal@987',
                        phone: '7795511748'
                      }));
                    }
                  }}
                  style={{
                    background: 'rgba(16, 185, 129, 0.25)',
                    border: '1px solid rgba(16, 185, 129, 0.5)',
                    color: '#34d399',
                    borderRadius: '0.45rem',
                    padding: '0.35rem 0.7rem',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Quick Fill
                </button>
              </div>
            )}

            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vishal Sollapure"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.6rem',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.6rem',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder={role === 'farmer' ? 'vishalssollapure@gmail.com' : 'vishalssollapure1748@gmail.com'}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Mobile Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. 7795511748"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Location / District</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand, Gujarat"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.6rem',
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.6rem',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {role === 'worker' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Agricultural Skills</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        placeholder="e.g. Harvesting, Cotton Picking, Paddy Sowing"
                        value={formData.skills}
                        onChange={(e) => setFormData({...formData, skills: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.6rem',
                          background: 'rgba(30, 41, 59, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.6rem',
                          color: '#ffffff',
                          fontSize: '0.92rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Farm Details / Main Crops</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        placeholder="e.g. 15 Acres Wheat & Rice Farm"
                        value={formData.farmDetails}
                        onChange={(e) => setFormData({...formData, farmDetails: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.6rem',
                          background: 'rgba(30, 41, 59, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.6rem',
                          color: '#ffffff',
                          fontSize: '0.92rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center', opacity: isSubmitting ? 0.7 : 1 }}
            >
              <span>
                {isSubmitting
                  ? 'Processing...'
                  : isLogin
                  ? `Log In as ${role === 'farmer' ? 'Farmer' : 'Worker'}`
                  : `Register as ${role === 'farmer' ? 'Farmer' : 'Worker'}`}
              </span>
              <ArrowRight size={18} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.8rem', fontSize: '0.88rem', color: '#94a3b8' }}>
              {isLogin ? "Don't have an account? " : "Already registered? "}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setIsLogin(!isLogin);
                }}
                style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 700, cursor: 'pointer' }}
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
