import React, { useState } from 'react';
import { Sprout, Menu, X, ArrowRight, LogOut, UserCheck } from 'lucide-react';
import { useAgri } from '../../context/AgriContext';

export default function Navbar({ onOpenAuth }) {
  const { currentUser, logout } = useAgri();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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
        <a href="#home" style={{
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
        </a>

        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2.2rem'
        }} className="desktop-nav">
          <a href="#home" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 700, fontSize: '0.98rem' }}>Home</a>
          <a href="#how-it-works" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 600, fontSize: '0.98rem' }}>How It Works</a>
          <a href="#about" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 600, fontSize: '0.98rem' }}>About</a>
        </nav>

        {/* Action Buttons / User Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-nav">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                background: currentUser.role === 'farmer' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(132, 204, 22, 0.15)',
                color: currentUser.role === 'farmer' ? '#34d399' : '#a3e635',
                border: `1px solid ${currentUser.role === 'farmer' ? '#10b981' : '#84cc16'}`,
                padding: '0.35rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <span>{currentUser.role === 'farmer' ? '👨‍🌾 Farmer' : '👷 Worker'}</span>
                <span>• {currentUser.name}</span>
              </span>

              <button 
                onClick={logout}
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
          <a href="#home" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500 }}>Home</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500 }}>How It Works</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500 }}>About</a>
          <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          {currentUser ? (
            <button 
              onClick={() => { setMobileMenuOpen(false); logout(); }}
              style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 600 }}
            >
              Logout
            </button>
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
  );
}
