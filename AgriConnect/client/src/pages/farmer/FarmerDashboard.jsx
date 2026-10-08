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
  ChevronRight
} from 'lucide-react';
import { useAgri } from '../../context/AgriContext';
import PostJobModal from '../../components/farmer/PostJobModal';

export default function FarmerDashboard() {
  const { currentUser, logout, jobs, applications, updateApplicationStatus } = useAgri();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'applications'
  const [postJobOpen, setPostJobOpen] = useState(false);

  // Filter jobs for farmer (or all active jobs for demo)
  const farmerJobs = jobs;
  const pendingApplications = applications.filter(a => a.status === 'pending');
  const acceptedApplications = applications.filter(a => a.status === 'accepted');

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
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#10b981', fontWeight: 700, fontSize: '0.88rem' }}>
              <span>👨‍🌾 FARMER DASHBOARD</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
              Welcome, {currentUser ? currentUser.name : 'Ramesh Patel'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.2rem' }}>
              Location: {currentUser ? currentUser.location : 'Anand, Gujarat'} • Manage farm listings & worker applications
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setPostJobOpen(true)}
              className="btn-primary"
              style={{ padding: '0.8rem 1.6rem', fontSize: '0.95rem' }}
            >
              <PlusCircle size={18} />
              <span>Post New Job</span>
            </button>

            <button
              onClick={logout}
              className="btn-secondary"
              style={{ padding: '0.8rem 1.2rem', fontSize: '0.9rem' }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{farmerJobs.length}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Active Job Listings</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.8rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{applications.length}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Applications Received</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.8rem', background: 'rgba(132, 204, 22, 0.15)', color: '#84cc16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{acceptedApplications.length}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Workers Hired</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setActiveTab('jobs')}
            style={{
              padding: '0.8rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'jobs' ? '#10b981' : '#94a3b8',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'jobs' ? '3px solid #10b981' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Posted Jobs ({farmerJobs.length})
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            style={{
              padding: '0.8rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'applications' ? '#10b981' : '#94a3b8',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'applications' ? '3px solid #10b981' : '3px solid transparent',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Worker Applications ({applications.length})</span>
            {pendingApplications.length > 0 && (
              <span style={{
                background: '#f59e0b',
                color: '#070a11',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px'
              }}>
                {pendingApplications.length} New
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Posted Jobs */}
        {activeTab === 'jobs' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {farmerJobs.map(job => (
              <div key={job.id} className="glass-panel" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      🌾 {job.crop}
                    </span>
                    <span style={{ color: '#10b981', fontWeight: 800, fontSize: '1.25rem' }}>
                      ₹{job.wage}<span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>/day</span>
                    </span>
                  </div>

                  <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                    {job.title}
                  </h3>

                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.2rem' }}>
                    {job.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={15} color="#10b981" />
                      <span>{job.location} ({job.distance})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={15} color="#10b981" />
                      <span>Starts: {job.startDate} ({job.duration})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={15} color="#10b981" />
                      <span>{job.workersHired} of {job.workersNeeded} Workers Hired</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('applications')}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.88rem', padding: '0.65rem' }}
                >
                  <span>View Applicants</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Worker Applications */}
        {activeTab === 'applications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {applications.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                No applications received yet.
              </div>
            ) : (
              applications.map(app => (
                <div key={app.id} className="glass-panel" style={{
                  padding: '1.6rem 2rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <div style={{
                      fontSize: '2rem',
                      width: '3.5rem',
                      height: '3.5rem',
                      borderRadius: '50%',
                      background: 'rgba(132, 204, 22, 0.15)',
                      border: '1px solid rgba(132, 204, 22, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      👷
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                        <h3 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 700 }}>{app.workerName}</h3>
                        <span style={{
                          background: app.status === 'accepted' ? 'rgba(16, 185, 129, 0.15)' : app.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: app.status === 'accepted' ? '#34d399' : app.status === 'rejected' ? '#f87171' : '#fbbf24',
                          border: `1px solid ${app.status === 'accepted' ? '#10b981' : app.status === 'rejected' ? '#ef4444' : '#f59e0b'}`,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'capitalize'
                        }}>
                          {app.status}
                        </span>
                      </div>

                      <p style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                        Applied for: {app.jobTitle}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                        <span>📍 {app.location}</span>
                        <span>🛠️ Skills: {app.workerSkills}</span>
                        <span>⭐ Exp: {app.workerExperience}</span>
                        <span>📞 {app.workerPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Accept / Reject */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'accepted')}
                          className="btn-primary"
                          style={{ padding: '0.6rem 1.2rem', fontSize: '0.88rem' }}
                        >
                          <CheckCircle2 size={16} />
                          <span>Accept Worker</span>
                        </button>

                        <button
                          onClick={() => updateApplicationStatus(app.id, 'rejected')}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '0.6rem 1rem',
                            borderRadius: '9999px',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            cursor: 'pointer'
                          }}
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {app.status === 'accepted' && (
                      <a
                        href={`tel:${app.workerPhone}`}
                        className="btn-secondary"
                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.88rem', textDecoration: 'none' }}
                      >
                        <Phone size={16} color="#10b981" />
                        <span>Call {app.workerName}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* Post Job Modal */}
      <PostJobModal 
        isOpen={postJobOpen} 
        onClose={() => setPostJobOpen(false)} 
      />
    </div>
  );
}
