import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  IndianRupee,
  Sprout,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Building2,
  Lock,
  Send,
  Loader2,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { useAgri } from '../../context/AgriContext';

export default function JobPublicDetails({ onOpenAuth }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentUser: authUser } = useAuth();
  const { currentUser: agriUser } = useAgri();
  const user = authUser || agriUser;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClosed, setIsClosed] = useState(false);

  // Application states
  const [hasApplied, setHasApplied] = useState(false);
  const [application, setApplication] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchJobDetails = async () => {
    setLoading(true);
    setError('');
    setIsClosed(false);
    try {
      const res = await jobService.getJobDetails(id);
      if (res.success && res.job) {
        setJob(res.job);
        if (res.hasApplied) {
          setHasApplied(true);
          setApplication(res.application);
        }
      } else {
        setError(res.message || 'Job not found');
      }
    } catch (err) {
      console.error('Fetch Job Details Error:', err);
      if (err.status === 404) {
        if (err.message && err.message.toLowerCase().includes('closed')) {
          setIsClosed(true);
        } else {
          setError('This job post does not exist or has been removed.');
        }
      } else {
        setError(err.message || 'Failed to fetch job details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const handleApplyClick = () => {
    if (!user) {
      // Unauthenticated visitor -> trigger AuthModal with worker role & login
      if (onOpenAuth) {
        onOpenAuth('login', 'worker');
      } else {
        navigate('/');
      }
      return;
    }

    if (user.role === 'farmer') {
      return; // Farmers cannot apply
    }

    // Worker can apply
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await applicationService.applyForJob(id, {
        message: message.trim()
      });

      if (res.success) {
        setHasApplied(true);
        setApplication(res.application);
        setSubmitSuccess(true);
        setShowApplyModal(false);
      } else {
        setSubmitError(res.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Apply Error:', err);
      setSubmitError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem 1rem', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '3px solid rgba(16, 185, 129, 0.2)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1.5rem auto'
        }}></div>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', fontWeight: 600 }}>Loading job details...</p>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', minHeight: '70vh' }}>
        <div className="glass-panel" style={{
          maxWidth: '560px',
          margin: '0 auto',
          padding: '3rem 2rem',
          textAlign: 'center',
          borderColor: 'rgba(245, 158, 11, 0.4)'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem' }}>
            Job Is Closed
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.96rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            This agricultural job has fulfilled its worker requirements or is no longer accepting new applications.
          </p>
          <Link to="/jobs" className="btn-primary" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            <span>Discover Other Open Jobs</span>
          </Link>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', minHeight: '70vh' }}>
        <div className="glass-panel" style={{
          maxWidth: '560px',
          margin: '0 auto',
          padding: '3rem 2rem',
          textAlign: 'center',
          borderColor: 'rgba(239, 68, 68, 0.4)'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem' }}>
            Job Not Found
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.96rem', marginBottom: '2rem' }}>
            {error || 'The job details could not be found or have been removed.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={fetchJobDetails} className="btn-secondary">
              Try Again
            </button>
            <Link to="/jobs" className="btn-primary" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={16} />
              <span>Back to Job Search</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFarmerUser = user && user.role === 'farmer';

  return (
    <div style={{ padding: '2.5rem 0 5rem 0', minHeight: '85vh' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/jobs"
            style={{
              color: '#34d399',
              textDecoration: 'none',
              fontSize: '0.92rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Open Jobs</span>
          </Link>
        </div>

        {/* Success Alert Banner after submitting */}
        {submitSuccess && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            color: '#34d399',
            padding: '1.2rem 1.6rem',
            borderRadius: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <CheckCircle2 size={24} color="#10b981" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>
                Application Submitted Successfully!
              </div>
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                The farmer has received your application. You can track its status anytime under{' '}
                <Link to="/worker/applications" style={{ color: '#34d399', fontWeight: 700 }}>
                  My Applications
                </Link>.
              </div>
            </div>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Main Job Information Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            {/* Header Hero Card */}
            <div className="glass-panel" style={{ padding: '2.2rem' }}>
              <div style={{
                display: 'flex',
                gap: '0.6rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <Sprout size={14} />
                  <span>{job.crop}</span>
                </span>

                <span style={{
                  background: 'rgba(148, 163, 184, 0.12)',
                  color: '#e2e8f0',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  {job.workType}
                </span>

                <span style={{
                  background: 'rgba(132, 204, 22, 0.15)',
                  color: '#a3e635',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: '1px solid rgba(132, 204, 22, 0.3)'
                }}>
                  Accepting Applications
                </span>
              </div>

              <h1 style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.25,
                marginBottom: '1rem'
              }}>
                {job.title}
              </h1>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.2rem',
                color: '#94a3b8',
                fontSize: '0.95rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MapPin size={17} color="#10b981" />
                  <span>
                    {job.village ? `${job.village}, ` : ''}
                    {job.district ? `${job.district}, ` : ''}
                    {job.state ? `${job.state} • ` : ''}
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.4rem' }}>
                Job Specifications
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.2rem'
              }}>
                <div style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  padding: '1.2rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Wage Amount</div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.2rem',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    marginTop: '0.3rem'
                  }}>
                    <IndianRupee size={20} color="#10b981" strokeWidth={2.5} />
                    <span>{job.wageAmount}</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'capitalize', marginTop: '0.1rem' }}>
                    per {job.wageType}
                  </div>
                </div>

                <div style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  padding: '1.2rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Start Date</div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.25rem', marginTop: '0.3rem' }}>
                    {new Date(job.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.1rem' }}>
                    Arrival morning expected
                  </div>
                </div>

                <div style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  padding: '1.2rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Duration</div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.25rem', marginTop: '0.3rem' }}>
                    {job.durationValue} {job.durationUnit}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.1rem' }}>
                    Estimated farm labor
                  </div>
                </div>

                <div style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  padding: '1.2rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Workers Required</div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.25rem', marginTop: '0.3rem' }}>
                    {job.workersRequired} Laborers
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.1rem' }}>
                    Team / Individual allowed
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.2rem' }}>
                Job Description & Scope
              </h2>
              <div style={{
                color: '#cbd5e1',
                fontSize: '1rem',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap'
              }}>
                {job.description}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Farmer Profile & Application Action Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            {/* Application Action Card */}
            <div className="glass-panel" style={{
              padding: '2rem',
              border: hasApplied
                ? '1px solid rgba(16, 185, 129, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Application Status
              </h2>

              {/* State A: Worker Already Applied */}
              {hasApplied ? (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    padding: '1.2rem',
                    borderRadius: '0.9rem',
                    marginBottom: '1.2rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 700 }}>
                      <CheckCircle2 size={18} />
                      <span>Application Submitted</span>
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.88rem', marginTop: '0.4rem' }}>
                      Status: <strong style={{ textTransform: 'capitalize', color: '#ffffff' }}>{application?.status || 'Pending'}</strong>
                    </div>
                    {application?.createdAt && (
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        Applied on {new Date(application.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>

                  <Link
                    to="/worker/applications"
                    className="btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    Manage in My Applications
                  </Link>
                </div>
              ) : isFarmerUser ? (
                /* State B: Signed in as Farmer */
                <div style={{ marginTop: '1rem' }}>
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    padding: '1.2rem',
                    borderRadius: '0.9rem',
                    color: '#f59e0b',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    marginBottom: '1.2rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      <Info size={18} />
                      <span>Farmer Account Active</span>
                    </div>
                    You are logged in as a Farmer. Only registered Agricultural Worker accounts can apply for job postings.
                  </div>

                  <button
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#64748b',
                      fontWeight: 600,
                      cursor: 'not-allowed'
                    }}
                  >
                    Worker Application Only
                  </button>
                </div>
              ) : (
                /* State C: Ready to apply (Worker or Unauthenticated Visitor) */
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Interested in this job? Submit your application directly to the farmer to lock in your daily wage and start date.
                  </p>

                  <button
                    onClick={handleApplyClick}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>{user ? 'Apply for This Job' : 'Login & Apply'}</span>
                    <Send size={16} />
                  </button>

                  {!user && (
                    <p style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.8rem' }}>
                      Sign in or create a free worker account in seconds.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Farmer Profile Card (Safe Public Projections) */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.2rem' }}>
                Farmer Profile
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                <div style={{
                  width: '3.2rem',
                  height: '3.2rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  👨‍🌾
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.1rem' }}>
                    {job.farmer?.name || 'Verified Farmer'}
                  </div>
                  <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                    {job.farmer?.farmName || 'AgriConnect Farmer'}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '1rem',
                fontSize: '0.9rem',
                color: '#cbd5e1'
              }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Location: </span>
                  <strong>{job.farmer?.location || job.location}</strong>
                </div>

                {job.farmer?.farmType && (
                  <div>
                    <span style={{ color: '#94a3b8' }}>Farm Specialization: </span>
                    <strong>{job.farmer.farmType}</strong>
                  </div>
                )}

                <div style={{
                  marginTop: '0.5rem',
                  background: 'rgba(16, 185, 129, 0.08)',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '0.6rem',
                  fontSize: '0.82rem',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}>
                  <CheckCircle2 size={15} />
                  <span>Verified Agricultural Employer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Drawer / Modal */}
      {showApplyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 10, 17, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 100
        }}>
          <div className="glass-panel" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '2.2rem',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(16, 185, 129, 0.4)'
          }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.3rem' }}>
              Apply for {job.title}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              Applying as <strong>{user?.name}</strong> • Wage: <strong>₹{job.wageAmount} / {job.wageType}</strong>
            </p>

            {submitError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '0.75rem 1rem',
                borderRadius: '0.6rem',
                fontSize: '0.9rem',
                marginBottom: '1.2rem'
              }}>
                {submitError}
              </div>
            )}

            <form onSubmit={handleApplySubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>
                    Message to Farmer (Optional)
                  </label>
                  <span style={{ color: message.length > 450 ? '#f59e0b' : '#64748b', fontSize: '0.8rem' }}>
                    {message.length} / 500
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Introduce yourself, mention your agricultural experience, team availability, or any questions..."
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    background: 'rgba(7, 10, 17, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '0.75rem',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  disabled={isSubmitting}
                  className="btn-secondary"
                  style={{ padding: '0.75rem 1.4rem' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ padding: '0.75rem 1.6rem' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Apply</span>
                      <Send size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
