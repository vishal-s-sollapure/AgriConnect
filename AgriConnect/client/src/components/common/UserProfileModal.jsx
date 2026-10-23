import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Briefcase, Award, FileText, CheckCircle } from 'lucide-react';
import { useAgri } from '../../context/AgriContext';
import { useLanguage } from '../../context/LanguageContext';

export default function UserProfileModal({ isOpen, onClose }) {
  const { currentUser, updateProfile } = useAgri();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    skills: '',
    experience: '',
    farmDetails: '',
    farmSize: '',
    bio: ''
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        skills: currentUser.skills || 'Harvesting, Field Labor',
        experience: currentUser.experience || '3+ Years',
        farmDetails: currentUser.farmDetails || 'Multi-crop Farm',
        farmSize: currentUser.farmSize || '10 Acres',
        bio: currentUser.bio || 'Dedicated to agricultural productivity.'
      });
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfile(formData);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setSaving(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setSaving(false);
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
          aria-label={t('p8_close', 'Close')}
          type="button"
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

        {/* Profile Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            background: currentUser.role === 'farmer' 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
              : 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.8rem auto',
            fontSize: '1.8rem',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
          }}>
            {currentUser.role === 'farmer' ? '👨‍🌾' : '👷'}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
            {currentUser.name}
          </h2>
          <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: '0.4rem',
            background: currentUser.role === 'farmer' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(132, 204, 22, 0.15)',
            color: currentUser.role === 'farmer' ? '#34d399' : '#a3e635',
            border: `1px solid ${currentUser.role === 'farmer' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(132, 204, 22, 0.3)'}`
          }}>
            {t('p8_verified', 'Verified')} {currentUser.role === 'farmer' ? t('role_farmer', 'Farmer') : t('role_worker', 'Agricultural Worker')}
          </span>
        </div>

        {savedSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle size={54} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700 }}>{t('p8_profile_saved', 'Profile updated successfully!')}</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>{t('p8_auth_name', 'Full name')}</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.92rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>{t('p8_auth_phone', 'Phone number')}</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.92rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>{t('p8_location', 'Location / Region')}</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.92rem'
                  }}
                />
              </div>
            </div>

            {currentUser.role === 'worker' ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Skills & Expertise</label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                      placeholder="e.g. Wheat Harvesting, Cotton Picking"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.6rem',
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.6rem',
                        color: '#ffffff',
                        fontSize: '0.92rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Work Experience</label>
                  <div style={{ position: 'relative' }}>
                    <Award size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      placeholder="e.g. 5 Years in Agriculture"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.6rem',
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.6rem',
                        color: '#ffffff',
                        fontSize: '0.92rem'
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Farm Details & Main Crops</label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={formData.farmDetails}
                      onChange={(e) => setFormData({...formData, farmDetails: e.target.value})}
                      placeholder="e.g. Wheat, Cotton & Rice Farm"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.6rem',
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.6rem',
                        color: '#ffffff',
                        fontSize: '0.92rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Farm Size</label>
                  <div style={{ position: 'relative' }}>
                    <Award size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={formData.farmSize}
                      onChange={(e) => setFormData({...formData, farmSize: e.target.value})}
                      placeholder="e.g. 15 Acres"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.6rem',
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.6rem',
                        color: '#ffffff',
                        fontSize: '0.92rem'
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>{t('p8_profile_bio', 'Profile bio')}</label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '0.9rem' }} />
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder={t('p8_profile_bio_placeholder', 'Share a short bio...')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    resize: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
            >
              <span>{saving ? t('p8_saving_profile', 'Saving profile...') : t('p8_save_profile', 'Save profile')}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
