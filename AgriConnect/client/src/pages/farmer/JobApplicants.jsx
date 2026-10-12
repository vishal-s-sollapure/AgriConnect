import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  ArrowLeft,
  MapPin,
  Calendar,
  AlertTriangle,
  Loader2,
  Eye,
  Check,
  X,
  Phone,
  ShieldCheck,
  Sprout,
  Filter,
  Lock,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { useAgri } from '../../context/AgriContext';

export default function JobApplicants() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { currentUser: authUser } = useAuth();
  const { currentUser: agriUser } = useAgri();
  const user = authUser || agriUser;

  // Data states
  const [job, setJob] = useState(null);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0,
    workersRequired: 1,
    remainingVacancies: 1,
    isFullyStaffed: false
  });
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Decision Modal State
  const [decisionModal, setDecisionModal] = useState({
    isOpen: false,
    action: null, // 'accepted' or 'rejected'
    application: null,
    submitting: false,
    error: ''
  });

  // Worker Profile Modal State
  const [profileModal, setProfileModal] = useState({
    isOpen: false,
    loading: false,
    worker: null,
    application: null,
    error: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 10
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const res = await jobService.getJobApplications(jobId, params);
      if (res.success) {
        setJob(res.job);
        if (res.summary) {
          setSummary(res.summary);
        }
        setApplications(res.applications || res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setError(res.message || 'Failed to fetch applicants');
      }
    } catch (err) {
      console.error('Fetch Job Applications Error:', err);
      setError(err.message || 'Could not load applicants for this job');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobId, page, statusFilter]);

  // Open Decision Confirmation Modal
  const openDecisionModal = (app, action) => {
    setDecisionModal({
      isOpen: true,
      action,
      application: app,
      submitting: false,
      error: ''
    });
  };

  const closeDecisionModal = () => {
    setDecisionModal({
      isOpen: false,
      action: null,
      application: null,
      submitting: false,
      error: ''
    });
  };

  // Submit Decision (Accept or Reject)
  const handleConfirmDecision = async () => {
    if (!decisionModal.application || !decisionModal.action) return;

    setDecisionModal(prev => ({ ...prev, submitting: true, error: '' }));
    try {
      const res = await applicationService.updateApplicationStatus(
        decisionModal.application._id,
        decisionModal.action
      );

      if (res.success) {
        closeDecisionModal();
        // If the profile modal is open for this application, close it or update it
        if (profileModal.isOpen && profileModal.application?._id === decisionModal.application._id) {
          setProfileModal(prev => ({ ...prev, isOpen: false }));
        }
        // Refresh applicant list and summary counts
        await fetchData();
      } else {
        setDecisionModal(prev => ({
          ...prev,
          submitting: false,
          error: res.message || 'Failed to update application status'
        }));
      }
    } catch (err) {
      console.error('Update Application Status Error:', err);
      setDecisionModal(prev => ({
        ...prev,
        submitting: false,
        error: err.message || 'Error occurred while saving decision'
      }));
    }
  };

  // View Worker Profile Details Modal
  const handleViewProfile = async (app) => {
    const workerId = app.worker?._id || app.worker?.id;
    if (!workerId) return;

    setProfileModal({
      isOpen: true,
      loading: true,
      worker: null,
      application: app,
      error: ''
    });

    try {
      const res = await applicationService.getWorkerProfile(workerId);
      if (res.success) {
        setProfileModal(prev => ({
          ...prev,
          loading: false,
          worker: res.worker
        }));
      } else {
        setProfileModal(prev => ({
          ...prev,
          loading: false,
          error: res.message || 'Failed to load worker profile'
        }));
      }
    } catch (err) {
      console.error('Worker Profile Error:', err);
      setProfileModal(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Could not retrieve worker profile details'
      }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            <CheckCircle2 size={13} />
            <span>Accepted / Hired</span>
          </span>
        );
      case 'rejected':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
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
            gap: '0.35rem',
            background: 'rgba(148, 163, 184, 0.15)',
            color: '#94a3b8',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
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
            gap: '0.35rem',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            <Clock size={13} />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  const hiringPercentage = summary.workersRequired > 0
    ? Math.min(100, Math.round((summary.accepted / summary.workersRequired) * 100))
    : 0;

  if (loading && !job) {
    return (
      <div style={{ padding: '6rem 0', textAlign: 'center', color: '#94a3b8' }}>
        <Loader2 size={44} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#10b981' }} />
        <p style={{ fontWeight: 600, fontSize: '1rem' }}>Loading applicant management portal...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div style={{ padding: '4rem 0 6rem 0' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', background: '#0f172a' }}>
            <AlertTriangle size={44} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Applicants Inaccessible
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
              {error || 'This job post does not exist or you do not have permission to manage its applicants.'}
            </p>
            <Link to="/farmer/jobs" className="btn-primary" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={18} />
              <span>Back to My Jobs</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem 0', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>

        {/* Top Back & Header Bar */}
        <div style={{ marginBottom: '1.75rem' }}>
          <Link
            to={`/farmer/jobs/${jobId}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#34d399',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              marginBottom: '1rem'
            }}
          >
            <ArrowLeft size={17} />
            <span>Back to Job Details</span>
          </Link>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  🌾 {job?.crop || 'Agriculture'}
                </span>
                <span style={{
                  background: 'rgba(132, 204, 22, 0.15)',
                  color: '#a3e635',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  ⚙️ {job?.workType || 'Field Labor'}
                </span>
                <span style={{
                  background: job?.status === 'open' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: job?.status === 'open' ? '#34d399' : '#fbbf24',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  Job Status: {job?.status?.toUpperCase()}
                </span>
              </div>

              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
                {job?.title} — Applicant Management
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.3rem' }}>
                Review applications, evaluate worker experience, and accept or reject candidates for this posting.
              </p>
            </div>

            <Link
              to="/farmer/jobs"
              className="btn-secondary"
              style={{ textDecoration: 'none', padding: '0.65rem 1.2rem', fontSize: '0.88rem' }}
            >
              <span>All My Jobs</span>
            </Link>
          </div>
        </div>

        {/* Hiring Summary & Capacity Progress Card */}
        <div className="glass-panel" style={{
          padding: '1.75rem',
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
          marginBottom: '2rem',
          border: summary.isFullyStaffed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {summary.isFullyStaffed && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.6rem',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: '#34d399',
              fontWeight: 700,
              fontSize: '0.92rem'
            }}>
              <CheckCircle2 size={18} />
              <span>Position Fully Staffed! All {summary.workersRequired} required positions have been filled.</span>
            </div>
          )}

          {/* Progress bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                Hiring Progress: {summary.accepted} of {summary.workersRequired} Workers Hired
              </span>
              <span style={{ color: summary.isFullyStaffed ? '#34d399' : '#fbbf24', fontWeight: 800, fontSize: '0.95rem' }}>
                {hiringPercentage}% Filled
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${hiringPercentage}%`,
                height: '100%',
                background: summary.isFullyStaffed ? '#10b981' : 'linear-gradient(90deg, #10b981, #3b82f6)',
                borderRadius: '9999px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* Stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL APPLIED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                {summary.total}
              </div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700 }}>PENDING REVIEW</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem' }}>
                {summary.pending}
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>ACCEPTED / HIRED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                {summary.accepted}
              </div>
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700 }}>REMAINING VACANCIES</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.2rem' }}>
                {summary.remainingVacancies}
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 600 }}>REJECTED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>
                {summary.rejected}
              </div>
            </div>

            <div style={{ background: 'rgba(148, 163, 184, 0.08)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>WITHDRAWN</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#94a3b8', marginTop: '0.2rem' }}>
                {summary.withdrawn}
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '0.75rem'
        }}>
          {[
            { key: 'all', label: `All (${summary.total})` },
            { key: 'pending', label: `Pending (${summary.pending})` },
            { key: 'accepted', label: `Accepted (${summary.accepted})` },
            { key: 'rejected', label: `Rejected (${summary.rejected})` },
            { key: 'withdrawn', label: `Withdrawn (${summary.withdrawn})` }
          ].map(tab => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                style={{
                  background: active ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                  color: active ? '#ffffff' : '#94a3b8',
                  border: active ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading Spinner for Applications List */}
        {loading && (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: '#94a3b8' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: '#10b981' }} />
            <p style={{ fontSize: '0.9rem' }}>Refreshing applicant listings...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && applications.length === 0 && (
          <div className="glass-panel" style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            background: '#0f172a',
            borderRadius: '1rem',
            border: '1px dashed rgba(255, 255, 255, 0.15)'
          }}>
            <Users size={40} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700 }}>
              {statusFilter === 'all'
                ? 'No Applicants Yet'
                : `No Applications in '${statusFilter}' Status`}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.4rem', maxWidth: '480px', margin: '0.4rem auto 1.5rem auto' }}>
              {statusFilter === 'all'
                ? 'Agricultural workers searching for nearby jobs will see your posting. Once they apply, their profiles and applications will show up here.'
                : `There are currently no candidates matching the '${statusFilter}' filter.`}
            </p>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="btn-secondary"
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.88rem' }}
              >
                Show All Applicants
              </button>
            )}
          </div>
        )}

        {/* Applicants List */}
        {!loading && applications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {applications.map(app => {
              const worker = app.worker;
              const isPending = app.status === 'pending';
              const isAccepted = app.status === 'accepted';
              const isCapacityFull = summary.isFullyStaffed;
              const isJobClosedOrCompleted = job?.status === 'completed';

              return (
                <div
                  key={app._id}
                  className="glass-panel"
                  style={{
                    padding: '1.75rem',
                    background: 'rgba(30, 41, 59, 0.65)',
                    borderLeft: `4px solid ${
                      app.status === 'accepted' ? '#10b981' :
                      app.status === 'rejected' ? '#ef4444' :
                      app.status === 'withdrawn' ? '#64748b' : '#f59e0b'
                    }`,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem'
                  }}
                >
                  {/* Left Column: Worker info & Application details */}
                  <div style={{ flex: '1 1 400px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                      {getStatusBadge(app.status)}
                      <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                        Applied on {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '0.75rem' }}>
                      {/* Avatar */}
                      <div style={{
                        width: '3.2rem',
                        height: '3.2rem',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        border: '2px solid rgba(255, 255, 255, 0.15)',
                        flexShrink: 0
                      }}>
                        {worker?.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                          {worker?.name || 'Registered Farm Worker'}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                          <MapPin size={13} color="#10b981" />
                          <span>{worker?.location || 'Location Not Specified'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Worker Profile Badges */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <span style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#cbd5e1', padding: '0.25rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
                        🌾 Skills: {worker?.skills || 'General Agriculture'}
                      </span>
                      <span style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#cbd5e1', padding: '0.25rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
                        ⭐ Experience: {worker?.experience || '1-3 Years'}
                      </span>
                      <span style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#cbd5e1', padding: '0.25rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
                        ⏱️ Availability: {worker?.availability || 'Full Time'}
                      </span>
                    </div>

                    {/* Contact Phone (Revealed only if accepted) */}
                    {isAccepted && worker?.phone && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '0.5rem',
                        padding: '0.35rem 0.75rem',
                        color: '#34d399',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '0.6rem'
                      }}>
                        <Phone size={14} />
                        <span>Worker Contact: {worker.phone}</span>
                      </div>
                    )}

                    {!isAccepted && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: '#64748b',
                        fontSize: '0.78rem',
                        marginBottom: '0.6rem'
                      }}>
                        <Lock size={12} />
                        <span>Contact phone revealed upon acceptance</span>
                      </div>
                    )}

                    {/* Optional Applicant Message */}
                    {app.message && (
                      <div style={{
                        marginTop: '0.4rem',
                        padding: '0.7rem 1rem',
                        background: 'rgba(15, 23, 42, 0.7)',
                        borderRadius: '0.6rem',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        color: '#cbd5e1',
                        fontSize: '0.86rem',
                        fontStyle: 'italic'
                      }}>
                        "{app.message}"
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '180px' }}>
                    
                    {/* View Profile Button */}
                    <button
                      onClick={() => handleViewProfile(app)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        padding: '0.6rem 1.1rem',
                        borderRadius: '0.6rem',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Eye size={15} />
                      <span>View Profile</span>
                    </button>

                    {/* Pending Decision Buttons */}
                    {isPending && (
                      <>
                        <button
                          onClick={() => openDecisionModal(app, 'accepted')}
                          disabled={isCapacityFull || isJobClosedOrCompleted}
                          style={{
                            background: isCapacityFull ? 'rgba(16, 185, 129, 0.2)' : '#10b981',
                            border: 'none',
                            color: isCapacityFull ? '#94a3b8' : '#ffffff',
                            padding: '0.65rem 1.1rem',
                            borderRadius: '0.6rem',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: (isCapacityFull || isJobClosedOrCompleted) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            opacity: (isCapacityFull || isJobClosedOrCompleted) ? 0.6 : 1,
                            transition: 'all 0.2s ease'
                          }}
                          title={isCapacityFull ? 'Capacity is full' : 'Accept worker'}
                        >
                          <Check size={16} />
                          <span>Accept Worker</span>
                        </button>

                        <button
                          onClick={() => openDecisionModal(app, 'rejected')}
                          disabled={isJobClosedOrCompleted}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#f87171',
                            padding: '0.6rem 1.1rem',
                            borderRadius: '0.6rem',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: isJobClosedOrCompleted ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <X size={15} />
                          <span>Reject Application</span>
                        </button>

                        {isCapacityFull && (
                          <div style={{ color: '#fbbf24', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.2rem' }}>
                            Job capacity filled
                          </div>
                        )}
                      </>
                    )}

                    {/* Non-pending status helpers */}
                    {isAccepted && (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        color: '#34d399',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        Confirmed for Job
                      </div>
                    )}

                    {app.status === 'rejected' && (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        color: '#f87171',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        Application Declined
                      </div>
                    )}

                    {app.status === 'withdrawn' && (
                      <div style={{
                        background: 'rgba(148, 163, 184, 0.1)',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        Withdrawn by Worker
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page <= 1}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: page <= 1 ? '#64748b' : '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem'
              }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
              Page <strong style={{ color: '#ffffff' }}>{page}</strong> of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={page >= pagination.totalPages}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: page >= pagination.totalPages ? '#64748b' : '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem'
              }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>

      {/* Confirmation Modal for Accept / Reject */}
      {decisionModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            background: '#0f172a',
            border: decisionModal.action === 'accepted' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              {decisionModal.action === 'accepted' ? (
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <CheckCircle2 size={32} />
                </div>
              ) : (
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <XCircle size={32} />
                </div>
              )}

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                {decisionModal.action === 'accepted' ? 'Accept Worker Application?' : 'Reject Worker Application?'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                {decisionModal.action === 'accepted' ? (
                  <>
                    You are accepting <strong>{decisionModal.application?.worker?.name || 'this worker'}</strong> for <strong>{job?.title}</strong>.
                    Upon acceptance, their direct phone contact will be revealed to coordinate field work.
                  </>
                ) : (
                  <>
                    Are you sure you want to reject the application submitted by <strong>{decisionModal.application?.worker?.name || 'this worker'}</strong>?
                  </>
                )}
              </p>
            </div>

            {decisionModal.action === 'accepted' && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '0.6rem',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                color: '#cbd5e1'
              }}>
                <div>Current Hired: <strong>{summary.accepted} / {summary.workersRequired}</strong></div>
                <div>Remaining Vacancies after accepting: <strong>{Math.max(0, summary.remainingVacancies - 1)}</strong></div>
              </div>
            )}

            {decisionModal.error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '0.6rem',
                padding: '0.75rem',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                textAlign: 'center'
              }}>
                {decisionModal.error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={closeDecisionModal}
                disabled={decisionModal.submitting}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDecision}
                disabled={decisionModal.submitting}
                style={{
                  flex: 1,
                  background: decisionModal.action === 'accepted' ? '#10b981' : '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: decisionModal.submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem'
                }}
              >
                {decisionModal.submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>
                    {decisionModal.action === 'accepted' ? 'Confirm Accept' : 'Confirm Reject'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Worker Profile Modal */}
      {profileModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            position: 'relative'
          }}>
            {/* Close button */}
            <button
              onClick={() => setProfileModal(prev => ({ ...prev, isOpen: false }))}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#94a3b8',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            {profileModal.loading && (
              <div style={{ padding: '3rem 0', textAlign: 'center', color: '#94a3b8' }}>
                <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#10b981' }} />
                <p>Loading worker profile...</p>
              </div>
            )}

            {profileModal.error && (
              <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.1rem' }}>Profile Inaccessible</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem' }}>{profileModal.error}</p>
              </div>
            )}

            {!profileModal.loading && profileModal.worker && (
              <div>
                {/* Header with Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    flexShrink: 0
                  }}>
                    {profileModal.worker.name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>
                      <ShieldCheck size={14} />
                      <span>REGISTERED AGRICULTURAL WORKER</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                      {profileModal.worker.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      <MapPin size={13} color="#10b981" />
                      <span>{profileModal.worker.location || 'Location Not Specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Profile Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  padding: '1.25rem',
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '0.85rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.88rem'
                }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Skills & Work Types</div>
                    <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '0.15rem' }}>
                      {profileModal.worker.skills || 'General Agriculture'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Agricultural Experience</div>
                    <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '0.15rem' }}>
                      {profileModal.worker.experience || '1-3 Years'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Availability</div>
                    <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '0.15rem' }}>
                      {profileModal.worker.availability || 'Full Time'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Preferred Work Radius</div>
                    <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '0.15rem' }}>
                      {profileModal.worker.preferredRadius || '10 km'}
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Platform Registration</div>
                    <div style={{ color: '#cbd5e1', marginTop: '0.15rem' }}>
                      Member since {new Date(profileModal.worker.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Privacy Protected Contact Section */}
                <div style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  background: profileModal.worker.contactRevealed
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: profileModal.worker.contactRevealed
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '1.5rem'
                }}>
                  {profileModal.worker.contactRevealed && profileModal.worker.phone ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>
                        <Phone size={15} />
                        <span>Worker Phone Number (Revealed for Hired Candidate):</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem' }}>
                        {profileModal.worker.phone}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                      <Lock size={16} color="#fbbf24" />
                      <span>
                        Worker phone number is confidential and will be revealed immediately upon accepting their application.
                      </span>
                    </div>
                  )}
                </div>

                {/* Application History under this farmer */}
                {profileModal.worker.applications && profileModal.worker.applications.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                      Applications to Your Postings ({profileModal.worker.applications.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {profileModal.worker.applications.map(item => (
                        <div
                          key={item._id}
                          style={{
                            background: 'rgba(15, 23, 42, 0.5)',
                            padding: '0.6rem 0.8rem',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.82rem'
                          }}
                        >
                          <div>
                            <span style={{ color: '#ffffff', fontWeight: 600 }}>{item.jobTitle}</span>
                            <span style={{ color: '#64748b', marginLeft: '0.4rem' }}>({item.crop})</span>
                          </div>
                          <div>{getStatusBadge(item.status)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    onClick={() => setProfileModal(prev => ({ ...prev, isOpen: false }))}
                    className="btn-secondary"
                    style={{ padding: '0.65rem 1.25rem' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
