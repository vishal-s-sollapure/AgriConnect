import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Ban,
  Phone, 
  LogOut,
  User,
  Compass,
  ArrowRight,
  ExternalLink,
  IndianRupee,
  Sprout,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAgri } from '../../context/AgriContext';
import { useAuth } from '../../context/AuthContext';
import UserProfileModal from '../../components/common/UserProfileModal';
import applicationService from '../../services/applicationService';

export default function WorkerDashboard() {
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

  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Real backend metrics and recent applications
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await applicationService.getMyApplications({ limit: 4 });
      if (res.success) {
        setRecentApplications(res.data || res.applications || []);
        if (res.stats) {
          setStats(res.stats);
        } else {
          // Calculate from list if stats not aggregated
          const apps = res.data || res.applications || [];
          const calculated = {
            total: apps.length,
            pending: apps.filter(a => a.status === 'pending').length,
            accepted: apps.filter(a => a.status === 'accepted').length,
            rejected: apps.filter(a => a.status === 'rejected').length,
            withdrawn: apps.filter(a => a.status === 'withdrawn').length
          };
          setStats(calculated);
        }
      }
    } catch (err) {
      console.error('Fetch Worker Dashboard Error:', err);
      setError('Could not fetch real application statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'profile') {
      setProfileModalOpen(true);
    } else if (tabId === 'find') {
      navigate('/jobs');
    } else if (tabId === 'apps') {
      navigate('/worker/applications');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <CheckCircle2 size={13} />
            <span>Accepted</span>
          </span>
        );
      case 'rejected':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <XCircle size={13} />
            <span>Rejected</span>
          </span>
        );
      case 'withdrawn':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'rgba(148, 163, 184, 0.15)',
            color: '#94a3b8',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <Ban size={13} />
            <span>Withdrawn</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <Clock size={13} />
            <span>Pending</span>
          </span>
        );
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
          background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(132, 204, 22, 0.3)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#84cc16', fontWeight: 700, fontSize: '0.88rem' }}>
              <span>👷 AGRICULTURAL WORKER PORTAL</span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
              Welcome back, {user ? user.name : 'Worker'} 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.2rem' }}>
              Role: Worker • Location: {user ? user.location : 'Gujarat'} • Skills: {user?.skills || 'Paddy & Wheat Harvesting'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
            <Link
              to="/jobs"
              className="btn-primary"
              style={{
                padding: '0.75rem 1.4rem',
                background: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
                color: '#070a11',
                textDecoration: 'none'
              }}
            >
              <Compass size={18} />
              <span>Browse Jobs</span>
            </Link>

            <Link
              to="/worker/applications"
              className="btn-secondary"
              style={{
                padding: '0.75rem 1.2rem',
                textDecoration: 'none',
                borderColor: 'rgba(132, 204, 22, 0.3)'
              }}
            >
              <Briefcase size={16} />
              <span>My Applications</span>
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
              <span>Profile</span>
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

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '0.5rem'
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard Overview' },
            { id: 'find', label: 'Browse Open Jobs' },
            { id: 'apps', label: 'My Applications' },
            { id: 'profile', label: 'Worker Profile' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(132, 204, 22, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #84cc16' : '2px solid transparent',
                color: activeTab === tab.id ? '#a3e635' : '#94a3b8',
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

        {/* Live Backend Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Card 1: Total Applications */}
          <div className="glass-panel" style={{ padding: '1.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Total Applications</div>
              <Briefcase size={20} color="#34d399" />
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginTop: '0.4rem' }}>
              {loading ? '-' : stats.total}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              All submitted applications
            </div>
          </div>

          {/* Card 2: Pending Review */}
          <div className="glass-panel" style={{ padding: '1.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Pending Review</div>
              <Clock size={20} color="#fbbf24" />
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.4rem' }}>
              {loading ? '-' : stats.pending}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Awaiting farmer decision
            </div>
          </div>

          {/* Card 3: Accepted Jobs */}
          <div className="glass-panel" style={{ padding: '1.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Accepted Jobs</div>
              <CheckCircle2 size={20} color="#10b981" />
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#10b981', marginTop: '0.4rem' }}>
              {loading ? '-' : stats.accepted}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Confirmed farm work
            </div>
          </div>

          {/* Card 4: Quick Action */}
          <div className="glass-panel-accent" style={{
            padding: '1.6rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ color: '#84cc16', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Next Opportunity
              </div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.1rem', marginTop: '0.3rem' }}>
                Find Open Farm Work
              </div>
            </div>
            <Link
              to="/jobs"
              className="btn-primary"
              style={{
                marginTop: '1rem',
                padding: '0.6rem 1rem',
                fontSize: '0.88rem',
                textDecoration: 'none',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              <span>Explore All Jobs</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Recent Applications Section */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.4rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                Recent Applications
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                Your latest farm job submissions
              </p>
            </div>

            <Link
              to="/worker/applications"
              style={{
                color: '#34d399',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
              <p style={{ fontSize: '0.9rem' }}>Loading recent applications...</p>
            </div>
          ) : recentApplications.length === 0 ? (
            <div style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <Briefcase size={32} color="#64748b" style={{ margin: '0 auto 0.8rem auto' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.3rem' }}>
                No Applications Submitted Yet
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
                Browse verified farm jobs in your area and apply with a single tap.
              </p>
              <Link to="/jobs" className="btn-primary" style={{ textDecoration: 'none', padding: '0.65rem 1.4rem' }}>
                <span>Search Open Jobs</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {recentApplications.map((app) => (
                <div
                  key={app._id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    padding: '1.2rem 1.4rem',
                    borderRadius: '0.9rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: '1 1 260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                      {getStatusBadge(app.status)}
                      <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                        {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.05rem' }}>
                      {app.job?.title || 'Farm Labor Job'}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      {app.job?.crop && <span>🌾 {app.job.crop}</span>}
                      {app.job?.location && <span>📍 {app.job.location}</span>}
                      {app.job?.wageAmount && <span>₹{app.job.wageAmount} / {app.job.wageType}</span>}
                    </div>
                  </div>

                  {app.job && (
                    <Link
                      to={`/jobs/${app.job._id}`}
                      className="btn-secondary"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.82rem',
                        textDecoration: 'none'
                      }}
                    >
                      <span>Details</span>
                      <ExternalLink size={13} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Details Card Shell */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            Worker Profile Details
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.2rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
            <div><strong>Full Name:</strong> {user?.name}</div>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Phone:</strong> {user?.phone}</div>
            <div><strong>Location:</strong> {user?.location}</div>
            <div><strong>Skills:</strong> {user?.skills || 'Paddy Harvesting, Cotton Picking'}</div>
            <div><strong>Experience:</strong> {user?.experience || '3+ Years'}</div>
            <div><strong>Availability:</strong> {user?.availability || 'Full Time'}</div>
            <div><strong>Preferred Radius:</strong> {user?.preferredRadius || '10 km'}</div>
          </div>
          <button
            onClick={() => setProfileModalOpen(true)}
            style={{
              marginTop: '1.5rem',
              background: 'rgba(132, 204, 22, 0.15)',
              border: '1px solid #84cc16',
              color: '#a3e635',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.6rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Edit Worker Profile
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
