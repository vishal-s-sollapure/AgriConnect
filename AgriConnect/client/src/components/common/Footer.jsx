import React from 'react';
import { Sprout, Heart, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#05070d',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      paddingTop: '4rem',
      paddingBottom: '2.5rem',
      marginTop: '5rem'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.2rem' }}>
              <div style={{
                width: '2.4rem',
                height: '2.4rem',
                borderRadius: '0.7rem',
                background: 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}>
                <Sprout size={18} color="#070a11" strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.35rem', color: '#ffffff' }}>
                Agri<span style={{ color: '#34d399' }}>Connect</span>
              </span>
            </div>
            <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', fontWeight: 400 }}>
              Empowering agriculture through direct labor connections, smart job matching, and localized opportunities.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.2rem' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><a href="#how-it-works" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.2s' }}>How It Works</a></li>
              <li><a href="#features" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.2s' }}>Features</a></li>
              <li><a href="#farmers" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.2s' }}>For Farmers</a></li>
              <li><a href="#workers" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.2s' }}>For Workers</a></li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.2rem' }}>Solutions</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><a href="#matching" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.2s' }}>Smart Job Matching</a></li>
              <li><a href="#geo" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.2s' }}>Nearby Location Search</a></li>
              <li><a href="#multilingual" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.2s' }}>Multilingual Support</a></li>
              <li><a href="#payments" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.2s' }}>Fair Direct Wage Tracking</a></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.2rem' }}>Community & Legal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><a href="#privacy" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.2s' }}>Privacy Policy</a></li>
              <li><a href="#terms" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.2s' }}>Terms of Service</a></li>
              <li><a href="#help" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.2s' }}>Help Center & Support</a></li>
            </ul>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          color: '#cbd5e1',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          <div>
            &copy; {new Date().getFullYear()} AgriConnect. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e2e8f0' }}>
            Built with <Heart size={14} color="#34d399" fill="#34d399" /> for the farming community.
          </div>
        </div>
      </div>
    </footer>
  );
}
