import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  ArrowRight,
  ExternalLink,
  MapPin,
  Calendar,
  IndianRupee,
  RotateCcw,
  AlertCircle,
  Loader2,
  Sprout,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { useAgri } from '../../context/AgriContext';

export default function MyApplications() {
  const { currentUser: authUser } = useAuth();
  const { currentUser: agriUser } = useAgri();
  const user = authUser || agriUser;

  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Withdraw Confirmation Modal State
  const [withdrawModal, setWithdrawModal] = useState({
    isOpen: false,
    appId: null,
    jobTitle: '',
    loading: false
  });

  const fetchApplications = async () => {
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

      const res = await applicationService.getMyApplications(params);
      if (res.success) {
        setApplications(res.data || res.applications || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setError(res.message || 'Failed to load your applications');
      }
    } catch (err) {
      console.error('Fetch My Applications Error:', err);
      setError(err.message || 'Server error while retrieving your applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  const handleWithdrawClick = (app) => {
    setWithdrawModal({
      isOpen: true,
      appId: app._id,
      jobTitle: app.job?.title || 'this farm job',
      loading: false
    });
  };

  const confirmWithdraw = async () => {
    setWithdrawModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await applicationService.withdrawApplication(withdrawModal.appId);
      if (res.success) {
        // Update local state instantly
        setApplications(prev =>
          prev.map(app =>
            app._id === withdrawModal.appId ? { ...app, status: 'withdrawn' } : app
          )
        );
        setWithdrawModal({ isOpen: false, appId: null, jobTitle: '', loading: false });
      } else {
        alert(res.message || 'Failed to withdraw application');
        setWithdrawModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Withdraw Error:', err);
      alert(err.message || 'Could not withdraw application');
      setWithdrawModal(prev => ({ ...prev, loading: false }));
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
            <CheckCircle2 size={14} />
            <span>Accepted: Selected for Job</span>
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
            <XCircle size={14} />
            <span>Rejected: Not Selected</span>
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
            <Ban size={14} />
            <span>Withdrawn by Worker</span>
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
            <Clock size={14} />
            <span>Pending: Awaiting Farmer Decision</span>
          </span>
        );
    }
  };

  const getJobStatusBadge = (jobStatus) => {
    switch (jobStatus) {
      case 'closed':
        return <span style={{ color: '#f87171', fontSize: '0.78rem', fontWeight: 600 }}>• Job Closed</span>;
      case 'completed':
        return <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>• Job Completed</span>;
      case 'open':
      default:
        return <span style={{ color: '#34d399', fontSize: '0.78rem', fontWeight: 600 }}>• Job Active</span>;
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem 0', minHeight: '85vh' }}>
      <div className="container">
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }} className="feature-badge">
              <Briefcase size={15} />
              <span>WORKER APPLICATION TRACKER</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
              My Job Applications
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.96rem', marginTop: '0.2rem' }}>
              Track review status, start dates, and wages for jobs you have applied to.
            </p>
          </div>

          <Link
            to="/jobs"
            className="btn-primary"
            style={{ textDecoration: 'none', padding: '0.75rem 1.4rem' }}
          >
            <span>Browse More Jobs</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: '1.8rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {[
            { id: 'all', label: 'All Applications' },
            { id: 'pending', label: 'Pending' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'withdrawn', label: 'Withdrawn' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(1); }}
              style={{
                background: statusFilter === tab.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: statusFilter === tab.id ? '2px solid #10b981' : '2px solid transparent',
                color: statusFilter === tab.id ? '#34d399' : '#94a3b8',
                padding: '0.65rem 1.2rem',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                borderRadius: '0.5rem 0.5rem 0 0',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="glass-panel"
                style={{
                  padding: '1.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem',
                  minHeight: '140px'
                }}
              >
                <div style={{ width: '40%', height: '1.4rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '0.4rem' }}></div>
                <div style={{ width: '60%', height: '1rem', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '0.4rem' }}></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="glass-panel" style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            borderColor: 'rgba(239, 68, 68, 0.4)',
            maxWidth: '560px',
            margin: '2rem auto'
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
              margin: '0 auto 1.2rem auto'
            }}>
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Error Loading Applications
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>{error}</p>
            <button onClick={fetchApplications} className="btn-primary">
              <RotateCcw size={16} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && applications.length === 0 && (
          <div className="glass-panel" style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '540px',
            margin: '2rem auto'
          }}>
            <div style={{
              width: '4.5rem',
              height: '4.5rem',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <Briefcase size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              No Applications Found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.8rem', lineHeight: 1.6 }}>
              {statusFilter !== 'all'
                ? `You have no applications currently marked as '${statusFilter}'.`
                : "You haven't submitted any job applications yet. Browse open agricultural postings and apply directly."}
            </p>
            <Link to="/jobs" className="btn-primary" style={{ textDecoration: 'none' }}>
              <span>Find Agricultural Jobs</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Applications List */}
        {!loading && !error && applications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2.5rem' }}>
            {applications.map((app) => {
              const job = app.job;
              const isPending = app.status === 'pending';

              return (
                <div
                  key={app._id}
                  className="glass-panel"
                  style={{
                    padding: '1.8rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    borderLeft: `4px solid ${
                      app.status === 'accepted' ? '#10b981' :
                      app.status === 'rejected' ? '#ef4444' :
                      app.status === 'withdrawn' ? '#64748b' : '#f59e0b'
                    }`
                  }}
                >
                  {/* Left Column: Job & Application Details */}
                  <div style={{ flex: '1 1 360px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                      {getStatusBadge(app.status)}
                      {job && getJobStatusBadge(job.status)}
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        Applied on {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                      {job?.title || 'Farm Job Position'}
                    </h3>

                    {/* Metadata tags */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1.2rem',
                      color: '#94a3b8',
                      fontSize: '0.88rem'
                    }}>
                      {job?.crop && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Sprout size={14} color="#10b981" />
                          <span>{job.crop}</span>
                        </div>
                      )}

                      {job?.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={14} color="#10b981" />
                          <span>{job.village ? `${job.village}, ` : ''}{job.district ? `${job.district}, ` : ''}{job.location}</span>
                        </div>
                      )}

                      {job?.wageAmount && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#ffffff', fontWeight: 700 }}>
                          <IndianRupee size={14} color="#10b981" />
                          <span>{job.wageAmount}</span>
                          <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.8rem' }}>/{job.wageType}</span>
                        </div>
                      )}

                      {job?.startDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={14} color="#84cc16" />
                          <span>Start: {new Date(job.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>

                    {app.message && (
                      <div style={{
                        marginTop: '0.8rem',
                        padding: '0.6rem 0.9rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: '0.6rem',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        color: '#cbd5e1',
                        fontSize: '0.85rem',
                        fontStyle: 'italic'
                      }}>
                        "{app.message}"
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                    {job && (
                      <Link
                        to={`/jobs/${job._id}`}
                        className="btn-secondary"
                        style={{
                          padding: '0.6rem 1.1rem',
                          fontSize: '0.88rem',
                          textDecoration: 'none'
                        }}
                      >
                        <span>View Job</span>
                        <ExternalLink size={14} />
                      </Link>
                    )}

                    {isPending && (
                      <button
                        onClick={() => handleWithdrawClick(app)}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#f87171',
                          padding: '0.6rem 1.1rem',
                          borderRadius: '9999px',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Ban size={14} />
                        <span>Withdraw</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', alignItems: 'center' }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.9rem', opacity: page <= 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page >= pagination.totalPages}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.9rem', opacity: page >= pagination.totalPages ? 0.4 : 1 }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Withdraw Confirmation Modal */}
      {withdrawModal.isOpen && (
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
            maxWidth: '460px',
            width: '100%',
            padding: '2rem',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem auto'
            }}>
              <Ban size={28} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Withdraw Application?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '1.8rem', lineHeight: 1.5 }}>
              Are you sure you want to withdraw your application for <strong>{withdrawModal.jobTitle}</strong>? The farmer will be notified and your submission will be canceled.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setWithdrawModal({ isOpen: false, appId: null, jobTitle: '', loading: false })}
                disabled={withdrawModal.loading}
                className="btn-secondary"
              >
                Keep Application
              </button>
              <button
                onClick={confirmWithdraw}
                disabled={withdrawModal.loading}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {withdrawModal.loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Withdrawing...</span>
                  </>
                ) : (
                  <span>Yes, Withdraw</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
