import React, { useState } from 'react';
import { 
  Sprout, 
  PlusCircle, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Calendar,
  LogOut,
  User,
  Info
} from 'lucide-react';
import { useAgri } from '../../context/AgriContext';
import { useAuth } from '../../context/AuthContext';
import UserProfileModal from '../../components/common/UserProfileModal';

export default function FarmerDashboard() {
  const { currentUser: agriUser, logout: agriLogout } = useAgri();
  const { currentUser: authUser, logout: authLogout } = useAuth();
  
  const user = authUser || agriUser;
  const logout = authLogout || agriLogout;

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'profile' | 'jobs' | 'applications'
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [phaseNotice, setPhaseNotice] = useState('');

  const handlePostJobClick = () => {
    setPhaseNotice('Job posting will be available in the next phase.');
    setTimeout(() => setPhaseNotice(''), 4000);
  };

  const handleTabNotice = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'jobs' || tabName === 'applications') {
      setPhaseNotice(`${tabName === 'jobs' ? 'Job management' : 'Application review'} will be expanded in upcoming phases.`);
      setTimeout(() => setPhaseNotice(''), 4000);
    } else if (tabName === 'profile') {
      setProfileModalOpen(true);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem 0', minHeight: '85vh' }}>
      <div className="container">
        
        {/* Dashboard Header Bar */}
        <div className="glass-panel" style={{
          padding: '2rem 2.2rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#10b981', fontWeight: 700, fontSize: '0.88rem' }}>
              <span>👨‍🌾 FARMER PORTAL</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
              Good morning, {user ? user.name : 'Farmer'} 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.2rem' }}>
              Role: Farmer • Location: {user ? user.location : 'Gujarat'} • Farm: {user?.farmName || 'Patel Farms'} ({user?.farmType || 'Multi-crop'})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handlePostJobClick}
              className="btn-primary"
              style={{ padding: '0.75rem 1.4rem' }}
            >
              <PlusCircle size={18} />
              <span>+ Post a Job</span>
            </button>
            <button
              onClick={() => setProfileModalOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '0.75rem 1.2rem',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <User size={16} />
              <span>My Profile</span>
            </button>
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                padding: '0.75rem 1.2rem',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Phase Notice Banner */}
        {phaseNotice && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#60a5fa',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            fontSize: '0.95rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Info size={20} color="#60a5fa" />
            <span>{phaseNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '0.5rem'
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'profile', label: 'My Profile' },
            { id: 'jobs', label: 'My Jobs' },
            { id: 'applications', label: 'Applications' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabNotice(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #10b981' : '2px solid transparent',
                color: activeTab === tab.id ? '#10b981' : '#94a3b8',
                padding: '0.6rem 1.2rem',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                borderRadius: '0.5rem 0.5rem 0 0'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Row Placeholders */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Active Jobs</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.4rem' }}>0</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>Phase 3 Placeholder</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Applications</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.4rem' }}>0</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>Phase 4 Placeholder</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Workers Hired</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.4rem' }}>0</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>Phase 4 Placeholder</div>
          </div>
        </div>

        {/* Profile Details Card Shell */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            Your Farmer Profile
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.2rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
            <div><strong>Full Name:</strong> {user?.name}</div>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Phone:</strong> {user?.phone}</div>
            <div><strong>Location:</strong> {user?.location}</div>
            <div><strong>Farm Name:</strong> {user?.farmName || 'Patel Farms'}</div>
            <div><strong>Farm Type:</strong> {user?.farmType || 'Multi-crop Agriculture'}</div>
            <div><strong>Profile Completion:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>100% Complete</span></div>
          </div>
          <button
            onClick={() => setProfileModalOpen(true)}
            style={{
              marginTop: '1.5rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.6rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Edit Farmer Profile
          </button>
        </div>

      </div>

      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}
