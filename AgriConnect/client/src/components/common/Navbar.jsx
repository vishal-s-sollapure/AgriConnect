import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Menu, X, ArrowRight, LogOut, UserCheck, User, PlusCircle, Briefcase } from 'lucide-react';
import { useAgri } from '../../context/AgriContext';
import { useAuth } from '../../context/AuthContext';
import UserProfileModal from './UserProfileModal';

export default function Navbar({ onOpenAuth }) {
  const navigate = useNavigate();
  const { currentUser: agriUser, logout: agriLogout } = useAgri();
  const { currentUser: authUser, logout: authLogout } = useAuth();

  const currentUser = authUser || agriUser;

  const handleLogout = async () => {
    try {
      if (typeof authLogout === 'function') {
        await authLogout();
      }
    } catch (e) {
      console.warn('Auth logout error:', e);
    }

    try {
      if (typeof agriLogout === 'function') {
        agriLogout();
      }
    } catch (e) {
      console.warn('Agri logout error:', e);
    }

    localStorage.removeItem('agriconnect_user');
    localStorage.removeItem('agriconnect_token');
    localStorage.removeItem('agri_user');
    localStorage.removeItem('agri_token');

    window.dispatchEvent(new Event('agriconnect_logout'));
    navigate('/');
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(7, 10, 17, 0.85)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.5rem'
        }}>
          {/* Brand Logo */}
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.4rem',
            letterSpacing: '-0.02em'
          }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
            }}>
              <Sprout size={22} color="#070a11" strokeWidth={2.5} />
            </div>
            <span>Agri<span style={{ color: '#10b981' }}>Connect</span></span>
          </Link>

          {/* Desktop Navigation links */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.8rem'
          }} className="desktop-nav">
            <Link to="/" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 700, fontSize: '0.98rem' }}>Home</Link>
            <Link to="/jobs" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 600, fontSize: '0.98rem' }}>Find Jobs</Link>
            
            {currentUser && currentUser.role === 'farmer' && (
              <>
                <Link to="/farmer" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 600, fontSize: '0.98rem' }}>Dashboard</Link>
                <Link to="/farmer/jobs" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 600, fontSize: '0.98rem' }}>My Jobs</Link>
                <Link to="/farmer/jobs/new" style={{ color: '#34d399', textDecoration: 'none', fontWeight: 700, fontSize: '0.98rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <PlusCircle size={15} />
                  <span>Post Job</span>
                </Link>
              </>
            )}

            {currentUser && currentUser.role === 'worker' && (
              <>
                <Link to="/worker" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 600, fontSize: '0.98rem' }}>Dashboard</Link>
                <Link to="/worker/applications" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 600, fontSize: '0.98rem' }}>My Applications</Link>
              </>
            )}

            {!currentUser && (
              <>
                <a href="/#how-it-works" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 600, fontSize: '0.98rem' }}>How It Works</a>
                <a href="/#about" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 600, fontSize: '0.98rem' }}>About</a>
              </>
            )}
          </nav>

          {/* Action Buttons / User Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-nav">
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                
                {/* Profile Badge & Button */}
                <button
                  onClick={() => setProfileModalOpen(true)}
                  style={{
                    background: currentUser.role === 'farmer' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(132, 204, 22, 0.15)',
                    color: currentUser.role === 'farmer' ? '#34d399' : '#a3e635',
                    border: `1px solid ${currentUser.role === 'farmer' ? '#10b981' : '#84cc16'}`,
                    padding: '0.4rem 0.95rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="View and Edit Profile"
                >
                  <User size={15} />
                  <span>{currentUser.role === 'farmer' ? '👨‍🌾 Farmer' : '👷 Worker'} • {currentUser.name}</span>
                </button>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => onOpenAuth && onOpenAuth('login')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem'
                  }}
                >
                  Login
                </button>
                
                <button 
                  onClick={() => onOpenAuth && onOpenAuth('signup')}
                  className="btn-primary" 
                  style={{ padding: '0.65rem 1.4rem', fontSize: '0.95rem' }}
                >
                  <span>Get Started</span>
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.98)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem'
          }}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500 }}>Home</Link>
            <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500 }}>Find Jobs</Link>
            
            {currentUser && currentUser.role === 'farmer' && (
              <>
                <Link to="/farmer" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500 }}>Dashboard</Link>
                <Link to="/farmer/jobs" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500 }}>My Jobs</Link>
                <Link to="/farmer/jobs/new" onClick={() => setMobileMenuOpen(false)} style={{ color: '#34d399', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 700 }}>+ Post a Job</Link>
              </>
            )}

            {currentUser && currentUser.role === 'worker' && (
              <>
                <Link to="/worker" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500 }}>Dashboard</Link>
                <Link to="/worker/applications" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500 }}>My Applications</Link>
              </>
            )}

            <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            
            {currentUser ? (
              <>
                <button
                  onClick={() => { setMobileMenuOpen(false); setProfileModalOpen(true); }}
                  style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 600 }}
                >
                  My Profile ({currentUser.name})
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 600 }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth && onOpenAuth('login'); }}
                  style={{ background: 'transparent', border: '1px solid #10b981', color: '#10b981', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 600 }}
                >
                  Login
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth && onOpenAuth('signup'); }}
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
