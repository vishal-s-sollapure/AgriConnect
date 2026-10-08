import React, { useState } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Users, 
  Zap, 
  Globe, 
  Tractor, 
  HardHat, 
  ArrowDown, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Search,
  Briefcase
} from 'lucide-react';

export default function LandingPage({ onSelectRole, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('farmer');

  const features = [
    { icon: MapPin, text: 'Nearby Jobs', desc: 'GPS-based matching to connect with nearby farms or workers instantly.' },
    { icon: Zap, text: 'Direct Connection', desc: 'No middlemen. Direct contact between farmers and agricultural workers.' },
    { icon: Sparkles, text: 'Smart Matching', desc: 'Skill and seasonal crop requirement based matching algorithms.' },
    { icon: Globe, text: 'Multilingual', desc: 'Supports regional languages for easy voice and text accessibility.' }
  ];

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Decorative Glow Blobs */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '700px',
        height: '400px',
        background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.18) 0%, rgba(132, 204, 22, 0.05) 50%, transparent 80%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Hero Section */}
      <section id="home" style={{ paddingTop: '4.5rem', paddingBottom: '4rem', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          
          {/* Top Pill / Badge - Refined for clear value prop & no redundancy with Floating Voice Widget */}
          <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <div className="feature-badge">
              <Sparkles size={16} color="#34d399" />
              <span style={{ color: '#34d399', fontWeight: 700 }}>Direct Farmer & Labour Proximity Platform</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
            margin: '0 auto 1.5rem auto',
            color: '#ffffff'
          }}>
            Connecting Farmers <br className="desktop-only" />
            <span className="gradient-text">With the Right Workers</span>
          </h1>

          {/* Subtitle - Elevated contrast */}
          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: '#e2e8f0',
            maxWidth: '680px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            Instantly discover verified agricultural labor nearby or find high-paying farm work in your local area with zero middleman commissions.
          </p>

          {/* Targeted Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
            marginBottom: '4rem'
          }}>
            <button 
              onClick={() => onSelectRole ? onSelectRole('farmer') : (onOpenAuth && onOpenAuth('signup', 'farmer'))}
              className="btn-primary"
              style={{ padding: '1rem 2.2rem', fontSize: '1.05rem' }}
            >
              <span style={{ fontSize: '1.3rem', marginRight: '0.2rem' }}>👨‍🌾</span>
              <span>I'm a Farmer</span>
            </button>

            <button 
              onClick={() => onSelectRole ? onSelectRole('worker') : (onOpenAuth && onOpenAuth('signup', 'worker'))}
              className="btn-secondary"
              style={{ padding: '1rem 2.2rem', fontSize: '1.05rem' }}
            >
              <span style={{ fontSize: '1.3rem', marginRight: '0.2rem' }}>👷</span>
              <span>I'm a Worker</span>
            </button>
          </div>

          {/* Process Flow Card - De-boxified with glass-panel-accent & responsive flow classes */}
          <div style={{ maxWidth: '680px', margin: '0 auto 4rem auto' }}>
            <div className="glass-panel-accent flow-card-container animate-pulse-glow" style={{
              padding: '2.5rem 2rem',
              position: 'relative',
              borderRadius: '1.75rem'
            }}>
              <div style={{
                position: 'absolute',
                top: '-13px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)',
                color: '#070a11',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '0.35rem 1.2rem',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                whiteSpace: 'nowrap'
              }}>
                Seamless Connection Flow
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem' }}>
                
                {/* Step 1: Farmer */}
                <div className="flow-step-item" style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '1.1rem',
                  padding: '1.1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      fontSize: '2rem',
                      width: '3.4rem',
                      height: '3.4rem',
                      borderRadius: '0.85rem',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      👨‍🌾
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.15rem' }}>Farmer</h4>
                      <p style={{ color: '#34d399', fontSize: '0.92rem', fontWeight: 600 }}>Post job requirements with wage & location</p>
                    </div>
                  </div>
                  <span className="flow-step-badge" style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    padding: '0.35rem 0.9rem',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap'
                  }}>Step 1</span>
                </div>

                {/* Arrow Connector 1 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                  background: 'rgba(16, 185, 129, 0.15)',
                  borderRadius: '50%',
                  width: '2.5rem',
                  height: '2.5rem',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
                }}>
                  <ArrowDown size={18} strokeWidth={2.8} />
                </div>

                {/* Step 2: AgriConnect Platform Engine */}
                <div className="flow-step-item" style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(132, 204, 22, 0.15) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.45)',
                  borderRadius: '1.1rem',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      fontSize: '1.8rem',
                      width: '3.4rem',
                      height: '3.4rem',
                      borderRadius: '0.85rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                      flexShrink: 0
                    }}>
                      🌾
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.2rem' }}>AgriConnect Platform</h4>
                      <p style={{ color: '#e2e8f0', fontSize: '0.92rem', fontWeight: 500 }}>GPS Proximity & Skill Matching Engine</p>
                    </div>
                  </div>
                  <span className="flow-step-badge" style={{
                    background: '#10b981',
                    color: '#070a11',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    padding: '0.35rem 0.9rem',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap'
                  }}>System Engine</span>
                </div>

                {/* Arrow Connector 2 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a3e635',
                  background: 'rgba(132, 204, 22, 0.15)',
                  borderRadius: '50%',
                  width: '2.5rem',
                  height: '2.5rem',
                  border: '1px solid rgba(132, 204, 22, 0.4)',
                  boxShadow: '0 0 15px rgba(132, 204, 22, 0.2)'
                }}>
                  <ArrowDown size={18} strokeWidth={2.8} />
                </div>

                {/* Step 3: Nearby Worker */}
                <div className="flow-step-item" style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
                  border: '1px solid rgba(132, 204, 22, 0.3)',
                  borderRadius: '1.1rem',
                  padding: '1.1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      fontSize: '2rem',
                      width: '3.4rem',
                      height: '3.4rem',
                      borderRadius: '0.85rem',
                      background: 'rgba(132, 204, 22, 0.2)',
                      border: '1px solid rgba(132, 204, 22, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      👷
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.15rem' }}>Nearby Worker</h4>
                      <p style={{ color: '#a3e635', fontSize: '0.92rem', fontWeight: 600 }}>Get matched & accept work directly</p>
                    </div>
                  </div>
                  <span className="flow-step-badge" style={{
                    background: 'rgba(132, 204, 22, 0.15)',
                    color: '#a3e635',
                    border: '1px solid rgba(132, 204, 22, 0.3)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    padding: '0.35rem 0.9rem',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap'
                  }}>Step 2</span>
                </div>

              </div>
            </div>
          </div>

          {/* Key Feature Highlights Grid */}
          <div id="features" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            maxWidth: '1050px',
            margin: '0 auto'
          }}>
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div key={idx} className="glass-panel" style={{
                  padding: '1.6rem',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  borderTop: '2px solid rgba(16, 185, 129, 0.4)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.18)',
                      color: '#34d399',
                      width: '2.6rem',
                      height: '2.6rem',
                      borderRadius: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      flexShrink: 0
                    }}>
                      <CheckCircle2 size={20} strokeWidth={2.5} />
                    </div>
                    <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 800 }}>{feat.text}</h3>
                  </div>
                  <p style={{ color: '#e2e8f0', fontSize: '0.92rem', lineHeight: '1.55', fontWeight: 400 }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* How It Works Detailed Section */}
      <section id="how-it-works" style={{
        padding: '5rem 0',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
              How <span className="gradient-text">AgriConnect</span> Works
            </h2>
            <p style={{ color: '#e2e8f0', fontSize: '1.1rem', maxWidth: '620px', margin: '0 auto', fontWeight: 500 }}>
              Designed for extreme simplicity and high efficiency for both farm owners and skilled agricultural workers.
            </p>

            {/* Toggle Tabs */}
            <div style={{
              display: 'inline-flex',
              background: 'rgba(30, 41, 59, 0.8)',
              padding: '0.35rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              marginTop: '2rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}>
              <button
                onClick={() => setActiveTab('farmer')}
                style={{
                  padding: '0.65rem 2rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: activeTab === 'farmer' ? '#10b981' : 'transparent',
                  color: activeTab === 'farmer' ? '#070a11' : '#e2e8f0',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s'
                }}
              >
                👨‍🌾 For Farmers
              </button>
              <button
                onClick={() => setActiveTab('worker')}
                style={{
                  padding: '0.65rem 2rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: activeTab === 'worker' ? '#84cc16' : 'transparent',
                  color: activeTab === 'worker' ? '#070a11' : '#e2e8f0',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s'
                }}
              >
                👷 For Workers
              </button>
            </div>
          </div>

          {/* Cards for Farmer */}
          {activeTab === 'farmer' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}>
              <div className="glass-panel" style={{ padding: '2.2rem', borderTop: '3px solid #10b981' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>📝</div>
                <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>1. Post Job Requirements</h3>
                <p style={{ color: '#e2e8f0', fontSize: '0.98rem', lineHeight: '1.6', fontWeight: 400 }}>
                  Specify crop type, task details (harvesting, sowing, irrigation), daily wage, and location in seconds.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '2.2rem', borderTop: '3px solid #34d399' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>🎯</div>
                <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>2. Receive Direct Applications</h3>
                <p style={{ color: '#e2e8f0', fontSize: '0.98rem', lineHeight: '1.6', fontWeight: 400 }}>
                  Get instant applications from verified local workers living within your immediate village radius.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '2.2rem', borderTop: '3px solid #84cc16' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>🤝</div>
                <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>3. Hire & Complete Work</h3>
                <p style={{ color: '#e2e8f0', fontSize: '0.98rem', lineHeight: '1.6', fontWeight: 400 }}>
                  Connect directly with workers without commission fees and manage your seasonal workforce effortlessly.
                </p>
              </div>
            </div>
          )}

          {/* Cards for Worker */}
          {activeTab === 'worker' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}>
              <div className="glass-panel" style={{ padding: '2.2rem', borderTop: '3px solid #84cc16' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>📍</div>
                <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>1. Find Nearby Farm Work</h3>
                <p style={{ color: '#e2e8f0', fontSize: '0.98rem', lineHeight: '1.6', fontWeight: 400 }}>
                  Browse active agricultural job listings near your village tailored to your skills and preferred daily wages.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '2.2rem', borderTop: '3px solid #a3e635' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>⚡</div>
                <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>2. One-Tap Application</h3>
                <p style={{ color: '#e2e8f0', fontSize: '0.98rem', lineHeight: '1.6', fontWeight: 400 }}>
                  Apply directly with simple tap actions or voice input in your local language without complex paperwork.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '2.2rem', borderTop: '3px solid #10b981' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>💰</div>
                <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>3. Fair & Direct Wages</h3>
                <p style={{ color: '#e2e8f0', fontSize: '0.98rem', lineHeight: '1.6', fontWeight: 400 }}>
                  Receive 100% of your agreed daily wage directly from farmers with zero contractor or agent deductions.
                </p>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* About / Impact Section */}
      <section id="about" style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="glass-panel-accent" style={{
            padding: '3.5rem 2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <div className="feature-badge" style={{ marginBottom: '1rem' }}>
                <ShieldCheck size={16} color="#34d399" />
                <span style={{ color: '#34d399', fontWeight: 700 }}>Empowering Rural Agriculture</span>
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#ffffff', marginBottom: '1.2rem', lineHeight: 1.25 }}>
                Transforming Seasonal Farm Labour Access
              </h2>
              <p style={{ color: '#e2e8f0', fontSize: '1.02rem', lineHeight: 1.7, marginBottom: '1.8rem', fontWeight: 400 }}>
                AgriConnect bridges the critical gap between landowners facing labor shortages and skilled agricultural workers seeking steady employment. By leveraging real-time proximity and local language accessibility, we ensure agricultural productivity thrives across every harvest.
              </p>
              
              <button 
                onClick={() => onOpenAuth && onOpenAuth('signup')}
                className="btn-primary"
              >
                <span>Join AgriConnect Today</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem'
            }}>
              <div style={{
                background: 'rgba(30, 41, 59, 0.85)',
                padding: '1.6rem',
                borderRadius: '1.1rem',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#34d399' }}>100%</div>
                <div style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 700, marginTop: '0.3rem' }}>Direct Connections</div>
              </div>

              <div style={{
                background: 'rgba(30, 41, 59, 0.85)',
                padding: '1.6rem',
                borderRadius: '1.1rem',
                border: '1px solid rgba(132, 204, 22, 0.25)',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#a3e635' }}>Zero</div>
                <div style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 700, marginTop: '0.3rem' }}>Brokerage Fees</div>
              </div>

              <div style={{
                background: 'rgba(30, 41, 59, 0.85)',
                padding: '1.6rem',
                borderRadius: '1.1rem',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#38bdf8' }}>GPS</div>
                <div style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 700, marginTop: '0.3rem' }}>Local Proximity</div>
              </div>

              <div style={{
                background: 'rgba(30, 41, 59, 0.85)',
                padding: '1.6rem',
                borderRadius: '1.1rem',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#fbbf24' }}>Fast</div>
                <div style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 700, marginTop: '0.3rem' }}>Seasonal Hiring</div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

