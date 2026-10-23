import React, { useState } from 'react';
import { X, PlusCircle, Sprout, Calendar, MapPin, IndianRupee, Users, FileText, CheckCircle2 } from 'lucide-react';
import { useAgri } from '../../context/AgriContext';

export default function PostJobModal({ isOpen, onClose }) {
  const { postJob } = useAgri();
  
  const [formData, setFormData] = useState({
    title: '',
    crop: 'Wheat',
    wage: '',
    workersNeeded: '',
    duration: '1 Day',
    startDate: new Date().toISOString().split('T')[0],
    location: '',
    description: ''
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    postJob({
      title: formData.title,
      crop: formData.crop,
      wage: Number(formData.wage),
      workersNeeded: Number(formData.workersNeeded),
      duration: formData.duration,
      startDate: formData.startDate,
      location: formData.location,
      description: formData.description
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
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
        maxWidth: '520px',
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
        <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#10b981', fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sprout size={18} />
            <span>Farmer Portal</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
            Post Agricultural Job
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '0.3rem' }}>
            Find nearby skilled workers for your farm within minutes.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem auto'
            }}>
              <CheckCircle2 size={40} />
            </div>
            <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700 }}>Job Opportunity Posted!</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Nearby workers will be notified instantly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            
            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Job Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Wheat Harvesting & Bundling"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.6rem',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Crop & Wage */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Crop Type</label>
                <select
                  value={formData.crop}
                  onChange={(e) => setFormData({...formData, crop: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                >
                  <option value="Wheat" style={{ background: '#0f172a' }}>Wheat</option>
                  <option value="Cotton" style={{ background: '#0f172a' }}>Cotton</option>
                  <option value="Paddy / Rice" style={{ background: '#0f172a' }}>Paddy / Rice</option>
                  <option value="Sugarcane" style={{ background: '#0f172a' }}>Sugarcane</option>
                  <option value="Vegetables" style={{ background: '#0f172a' }}>Vegetables</option>
                  <option value="Fruits" style={{ background: '#0f172a' }}>Fruits</option>
                  <option value="Other" style={{ background: '#0f172a' }}>Other Field Work</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Daily Wage (₹)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontWeight: 700 }}>₹</span>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="650"
                    value={formData.wage}
                    onChange={(e) => setFormData({...formData, wage: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.2rem',
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
            </div>

            {/* Workers Needed & Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Workers Needed</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="5"
                  value={formData.workersNeeded}
                  onChange={(e) => setFormData({...formData, workersNeeded: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Work Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 3 Days"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
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

            {/* Location & Start Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Farm Village / Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand, Gujarat"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
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

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Job Details / Perks</label>
              <textarea
                rows="3"
                placeholder="Details on food, tea, working hours, tools provided, etc."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.6rem',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
            >
              <PlusCircle size={18} />
              <span>Publish Job Opportunity</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
