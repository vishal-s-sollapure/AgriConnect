import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  PlusCircle, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Calendar,
  LogOut,
  User,
  Info,
  Loader2,
  ArrowRight,
  Eye,
  Users
} from 'lucide-react';
import { useAgri } from '../../context/AgriContext';
import { useAuth } from '../../context/AuthContext';
import UserProfileModal from '../../components/common/UserProfileModal';
import jobService from '../../services/jobService';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { currentUser: agriUser, logout: agriLogout } = useAgri();
  const { currentUser: authUser, logout: authLogout } = useAuth();
  
  const user = authUser || agriUser;

  const handleLogout = async () => {
    try {
      if (typeof authLogout === 'function') await authLogout();
    } catch (e) {}
    try {
      if (typeof agriLogout === 'function') agriLogout();
    } catch (e) {}

    localStorage.removeItem('agriconnect_user');
    localStorage.removeItem('agriconnect_token');
    localStorage.removeItem('agri_user');
    localStorage.removeItem('agri_token');

    window.dispatchEvent(new Event('agriconnect_logout'));
    navigate('/');
  };

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  // Dashboard data states
  const [recentJobs, setRecentJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    completed: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedWorkers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await jobService.getMyJobs({ limit: 5 });
      if (res.success) {
        setRecentJobs(res.jobs || []);
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        setError(res.message || 'Failed to fetch dashboard statistics');
      }
    } catch (err) {
      console.error('Farmer Dashboard error:', err);
      // Fallback display if server is offline or unreachable
      setError('Could not connect to database server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            Open
          </span>
        );
      case 'closed':
        return (
          <span style={{
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            Closed
          </span>
        );
      case 'completed':
        return (
          <span style={{
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            Completed
          </span>
        );
      default:
        return null;
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
              Welcome back, {user ? user.name : 'Farmer'} 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.2rem' }}>
              Role: Farmer • Location: {user ? user.location : 'Gujarat'} • Farm: {user?.farmName || 'Patel Farms'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/farmer/jobs/new"
              className="btn-primary"
              style={{ padding: '0.75rem 1.4rem', textDecoration: 'none' }}
            >
              <PlusCircle size={18} />
              <span>+ Post a Job</span>
            </Link>

            <Link
              to="/farmer/jobs"
              className="btn-secondary"
              style={{ padding: '0.75rem 1.2rem', textDecoration: 'none' }}
            >
              <Briefcase size={16} />
              <span>My Jobs</span>
            </Link>

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
              onClick={handleLogout}
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

        {/* Real Job & Hiring Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#0f172a' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Total Posted Jobs</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.4rem' }}>
              {loading ? <Loader2 size={24} className="animate-spin" /> : stats.total}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem' }}>All created listings</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: '#0f172a', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ color: '#34d399', fontSize: '0.82rem', fontWeight: 600 }}>Open / Active Jobs</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34d399', marginTop: '0.4rem' }}>
              {loading ? <Loader2 size={24} className="animate-spin" /> : stats.open}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem' }}>Receiving worker discovery</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: '#0f172a', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div style={{ color: '#60a5fa', fontSize: '0.82rem', fontWeight: 600 }}>Total Applications</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.4rem' }}>
              {loading ? <Loader2 size={24} className="animate-spin" /> : (stats.totalApplications || 0)}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem' }}>Received across all jobs</div>
          </div>

          <div className="glass-panel" style={{
            padding: '1.5rem',
            background: '#0f172a',
            border: (stats.pendingApplications || 0) > 0 ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700 }}>Pending Review</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.4rem' }}>
              {loading ? <Loader2 size={24} className="animate-spin" /> : (stats.pendingApplications || 0)}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem' }}>Awaiting hiring decision</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: '#0f172a', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ color: '#34d399', fontSize: '0.82rem', fontWeight: 700 }}>Accepted Workers</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34d399', marginTop: '0.4rem' }}>
              {loading ? <Loader2 size={24} className="animate-spin" /> : (stats.acceptedWorkers || 0)}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem' }}>Hired for agricultural work</div>
          </div>
        </div>

        {/* Recent Jobs Section */}
        <div className="glass-panel" style={{ padding: '2rem', background: '#0f172a', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                Recent Job Listings
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                Quick view of your latest job opportunities and applicant progress.
              </p>
            </div>

            <Link
              to="/farmer/jobs"
              style={{
                color: '#34d399',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>View All Jobs</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading && (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: '#94a3b8' }}>
              <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 0.5rem auto', color: '#10b981' }} />
              <p style={{ fontSize: '0.9rem' }}>Fetching real jobs from server...</p>
            </div>
          )}

          {!loading && recentJobs.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '1rem',
              border: '1px dashed rgba(255, 255, 255, 0.15)'
            }}>
              <Sprout size={36} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700 }}>No Jobs Posted Yet</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.3rem', marginBottom: '1.5rem' }}>
                You have not posted any agricultural jobs. Create your first listing to find workers!
              </p>
              <Link to="/farmer/jobs/new" className="btn-primary" style={{ textDecoration: 'none', padding: '0.75rem 1.4rem' }}>
                <PlusCircle size={18} />
                <span>Post Your First Job</span>
              </Link>
            </div>
          )}

          {!loading && recentJobs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentJobs.map(job => (
                <div
                  key={job._id}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    padding: '1.2rem 1.5rem',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.85rem'
                  }}
                >
                  <div style={{ flex: '1 1 350px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                      {getStatusBadge(job.status)}
                      <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700 }}>{job.title}</h4>
                    </div>
                    <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span>🌾 {job.crop}</span>
                      <span>⚙️ {job.workType}</span>
                      <span>📍 {job.location}</span>
                      <span>📅 Start: {new Date(job.startDate).toLocaleDateString()}</span>
                    </div>

                    {/* Applicant Count Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        background: (job.applicantCounts?.pending || 0) > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                        color: (job.applicantCounts?.pending || 0) > 0 ? '#fbbf24' : '#cbd5e1',
                        border: (job.applicantCounts?.pending || 0) > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '0.4rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <Users size={12} />
                        <span>{job.applicantCounts?.total || 0} Applicants</span>
                      </span>

                      {(job.applicantCounts?.pending || 0) > 0 && (
                        <span style={{ color: '#fbbf24', fontSize: '0.78rem', fontWeight: 600 }}>
                          • {job.applicantCounts.pending} pending review
                        </span>
                      )}

                      <span style={{ color: '#34d399', fontSize: '0.78rem', fontWeight: 600 }}>
                        • {job.applicantCounts?.accepted || 0}/{job.workersRequired} hired
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>
                        ₹{job.wageAmount} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>/{job.wageType}</span>
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{job.workersRequired} workers needed</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <Link
                        to={`/farmer/jobs/${job._id}/applicants`}
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid #3b82f6',
                          color: '#60a5fa',
                          padding: '0.55rem 0.9rem',
                          borderRadius: '0.6rem',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Users size={14} />
                        <span>Manage Applicants</span>
                      </Link>

                      <Link
                        to={`/farmer/jobs/${job._id}`}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#ffffff',
                          padding: '0.55rem 0.9rem',
                          borderRadius: '0.6rem',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Eye size={14} />
                        <span>Details</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Details Card */}
        <div className="glass-panel" style={{ padding: '2rem', background: '#0f172a' }}>
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
