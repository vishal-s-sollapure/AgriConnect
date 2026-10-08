import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Phone, 
  LogOut,
  Send
} from 'lucide-react';
import { useAgri } from '../../context/AgriContext';

export default function WorkerDashboard() {
  const { currentUser, logout, jobs, applications, applyForJob } = useAgri();
  const [activeTab, setActiveTab] = useState('find'); // 'find' | 'my-apps'
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  // Filter jobs based on crop filter and search query
  const filteredJobs = jobs.filter(job => {
    const matchesCrop = selectedCrop === 'All' || job.crop.toLowerCase().includes(selectedCrop.toLowerCase());
    const matchesQuery = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrop && matchesQuery;
  });

  const myApplications = applications.filter(a => a.workerName === (currentUser?.name || 'Manish Verma') || true);

  const handleApply = (jobId) => {
    applyForJob(jobId);
    setAppliedJobIds(prev => [...prev, jobId]);
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem 0', minHeight: '85vh' }}>
      <div className="container">
        
        {/* Dashboard Header Bar */}
        <div className="glass-panel" style={{
          padding: '2rem 2.2rem',
          marginBottom: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(132, 204, 22, 0.3)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#84cc16', fontWeight: 700, fontSize: '0.88rem' }}>
              <span>👷 WORKER DASHBOARD</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
              Welcome, {currentUser ? currentUser.name : 'Manish Verma'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.2rem' }}>
              Location: {currentUser ? currentUser.location : 'Anand, Gujarat'} • Find local farm jobs & track application status
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={logout}
              className="btn-secondary"
              style={{ padding: '0.8rem 1.4rem', fontSize: '0.9rem' }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setActiveTab('find')}
            style={{
              padding: '0.8rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'find' ? '#84cc16' : '#94a3b8',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'find' ? '3px solid #84cc16' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Find Nearby Jobs ({filteredJobs.length})
          </button>

          <button
            onClick={() => setActiveTab('my-apps')}
            style={{
              padding: '0.8rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'my-apps' ? '#84cc16' : '#94a3b8',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'my-apps' ? '3px solid #84cc16' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            My Application Status ({myApplications.length})
          </button>
        </div>

        {/* Tab 1: Find Jobs */}
        {activeTab === 'find' && (
          <div>
            {/* Filter & Search Controls */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
                <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search by job title or village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.8rem',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '9999px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Crop Filter Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['All', 'Wheat', 'Cotton', 'Paddy', 'Sugarcane'].map(crop => (
                  <button
                    key={crop}
                    onClick={() => setSelectedCrop(crop)}
                    style={{
                      padding: '0.5rem 1.1rem',
                      borderRadius: '9999px',
                      border: selectedCrop === crop ? '1px solid #84cc16' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: selectedCrop === crop ? 'rgba(132, 204, 22, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                      color: selectedCrop === crop ? '#a3e635' : '#94a3b8',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Jobs Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredJobs.map(job => {
                const isApplied = appliedJobIds.includes(job.id) || applications.some(a => a.jobId === job.id);

                return (
                  <div key={job.id} className="glass-panel" style={{
                    padding: '1.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isApplied ? '1px solid rgba(132, 204, 22, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <span style={{
                          background: 'rgba(132, 204, 22, 0.12)',
                          color: '#a3e635',
                          border: '1px solid rgba(132, 204, 22, 0.3)',
                          padding: '0.3rem 0.8rem',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          🌾 {job.crop}
                        </span>
                        <span style={{ color: '#84cc16', fontWeight: 800, fontSize: '1.3rem' }}>
                          ₹{job.wage}<span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>/day</span>
                        </span>
                      </div>

                      <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                        {job.title}
                      </h3>
                      <p style={{ color: '#10b981', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.8rem' }}>
                        Farmer: {job.farmerName}
                      </p>

                      <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.2rem' }}>
                        {job.description}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={15} color="#84cc16" />
                          <span>{job.location} ({job.distance})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={15} color="#84cc16" />
                          <span>Starts: {job.startDate} ({job.duration})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Users size={15} color="#84cc16" />
                          <span>Needs {job.workersNeeded} Workers</span>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={isApplied}
                      onClick={() => handleApply(job.id)}
                      className={isApplied ? 'btn-secondary' : 'btn-primary'}
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        background: isApplied ? 'rgba(132, 204, 22, 0.15)' : undefined,
                        color: isApplied ? '#a3e635' : undefined,
                        borderColor: isApplied ? 'rgba(132, 204, 22, 0.3)' : undefined,
                        cursor: isApplied ? 'default' : 'pointer'
                      }}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 size={18} />
                          <span>Applied Already</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          <span>One-Tap Apply Now</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: My Applications */}
        {activeTab === 'my-apps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {myApplications.map(app => (
              <div key={app.id} className="glass-panel" style={{
                padding: '1.6rem 2rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700 }}>{app.jobTitle}</h3>
                    <span style={{
                      background: app.status === 'accepted' ? 'rgba(16, 185, 129, 0.15)' : app.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: app.status === 'accepted' ? '#34d399' : app.status === 'rejected' ? '#f87171' : '#fbbf24',
                      border: `1px solid ${app.status === 'accepted' ? '#10b981' : app.status === 'rejected' ? '#ef4444' : '#f59e0b'}`,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'capitalize'
                    }}>
                      {app.status === 'accepted' ? '✅ Accepted by Farmer' : app.status === 'rejected' ? '❌ Declined' : '⏳ Application Pending'}
                    </span>
                  </div>

                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    Applied on: {app.appliedAt} • Location: {app.location}
                  </p>
                </div>

                <div>
                  {app.status === 'accepted' ? (
                    <a
                      href={`tel:${app.workerPhone}`}
                      className="btn-primary"
                      style={{ padding: '0.75rem 1.4rem', textDecoration: 'none' }}
                    >
                      <Phone size={18} />
                      <span>Contact Farmer</span>
                    </a>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '0.88rem' }}>
                      Farmer reviewing details
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
