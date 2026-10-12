import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  PlusCircle, 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  IndianRupee, 
  Eye, 
  Edit, 
  XCircle, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import jobService from '../../services/jobService';

export default function MyJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0, completed: 0 });

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'delete' | 'complete' | 'close' | 'reopen'
    jobId: null,
    jobTitle: '',
    loading: false
  });

  const fetchMyJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 8
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await jobService.getMyJobs(params);
      if (res.success) {
        setJobs(res.jobs || []);
        setTotalPages(res.pages || 1);
        if (res.stats) setStats(res.stats);
      } else {
        setError(res.message || 'Failed to load jobs');
      }
    } catch (err) {
      console.error('Fetch My Jobs error:', err);
      setError(err.message || 'Error fetching your jobs. Please verify your session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMyJobs();
  };

  // Status Change Actions
  const handleStatusChange = async (jobId, newStatus) => {
    try {
      setConfirmModal(prev => ({ ...prev, loading: true }));
      const res = await jobService.updateJobStatus(jobId, newStatus);
      if (res.success) {
        setConfirmModal({ isOpen: false, type: null, jobId: null, jobTitle: '', loading: false });
        fetchMyJobs();
      } else {
        alert(res.message || 'Failed to update job status');
        setConfirmModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert(err.message || 'Failed to update job status');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Delete Action
  const handleDeleteJob = async (jobId) => {
    try {
      setConfirmModal(prev => ({ ...prev, loading: true }));
      const res = await jobService.deleteJob(jobId);
      if (res.success) {
        setConfirmModal({ isOpen: false, type: null, jobId: null, jobTitle: '', loading: false });
        fetchMyJobs();
      } else {
        alert(res.message || 'Failed to delete job');
        setConfirmModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Delete job error:', err);
      alert(err.message || 'Failed to delete job');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const openConfirmation = (type, job) => {
    setConfirmModal({
      isOpen: true,
      type,
      jobId: job._id,
      jobTitle: job.title,
      loading: false
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }}></span>
            Active / Open
          </span>
        );
      case 'closed':
        return (
          <span style={{
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24' }}></span>
            Closed
          </span>
        );
      case 'completed':
        return (
          <span style={{
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <CheckCircle2 size={12} />
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
        
        {/* Header section */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.88rem' }}>
              <span>👨‍🌾 FARMER MANAGEMENT</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
              My Posted Jobs
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              Manage active listings, edit requirements, update statuses, or create new listings.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/farmer/jobs/new" className="btn-primary" style={{ padding: '0.75rem 1.4rem', textDecoration: 'none' }}>
              <PlusCircle size={18} />
              <span>Post New Job</span>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', background: '#0f172a' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            
            {/* Status Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: `All Jobs (${stats.total || 0})` },
                { key: 'open', label: `Open (${stats.open || 0})` },
                { key: 'closed', label: `Closed (${stats.closed || 0})` },
                { key: 'completed', label: `Completed (${stats.completed || 0})` }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => { setStatusFilter(item.key); setPage(1); }}
                  style={{
                    background: statusFilter === item.key ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: statusFilter === item.key ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: statusFilter === item.key ? '#34d399' : '#94a3b8',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '360px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by title, crop or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem 0.55rem 2.4rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10b981',
                  color: '#34d399',
                  padding: '0.55rem 1rem',
                  borderRadius: '0.6rem',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Filter
              </button>
            </form>

          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#10b981' }} />
            <p style={{ fontWeight: 600 }}>Loading your job postings...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700 }}>Unable to load jobs</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem', marginBottom: '1.2rem' }}>{error}</p>
            <button onClick={fetchMyJobs} className="btn-primary" style={{ padding: '0.6rem 1.2rem' }}>
              Retry Loading
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && jobs.length === 0 && (
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', background: '#0f172a' }}>
            <div style={{
              width: '4.5rem',
              height: '4.5rem',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <Briefcase size={36} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              No Job Posts Found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '450px', margin: '0 auto 2rem auto' }}>
              {statusFilter !== 'all' || searchQuery
                ? 'No jobs match your current search or status filter. Try clearing filters.'
                : 'You have not created any agricultural job listings yet. Post your first job to find nearby workers.'}
            </p>
            <Link to="/farmer/jobs/new" className="btn-primary" style={{ textDecoration: 'none' }}>
              <PlusCircle size={18} />
              <span>Post Your First Job</span>
            </Link>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && !error && jobs.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem'
          }}>
            {jobs.map(job => (
              <div 
                key={job._id} 
                className="glass-panel"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
                  border: job.status === 'open' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Header info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    {getStatusBadge(job.status)}
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: '1.3' }}>
                    {job.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      🌾 {job.crop}
                    </span>
                    <span style={{ background: 'rgba(132, 204, 22, 0.1)', color: '#a3e635', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      ⚙️ {job.workType}
                    </span>
                  </div>
                </div>

                {/* Job Specs */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '0.75rem',
                  fontSize: '0.88rem',
                  color: '#cbd5e1'
                }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Daily Wage</div>
                    <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.05rem', marginTop: '0.1rem' }}>
                      ₹{job.wageAmount} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>/{job.wageType}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Workers Needed</div>
                    <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Users size={14} color="#10b981" />
                      <span>{job.workersRequired} Workers</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Start Date</div>
                    <div style={{ color: '#ffffff', fontWeight: 600, marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} color="#94a3b8" />
                      <span>{new Date(job.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Duration</div>
                    <div style={{ color: '#ffffff', fontWeight: 600, marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} color="#94a3b8" />
                      <span>{job.durationValue} {job.durationUnit}</span>
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                    <MapPin size={13} color="#10b981" />
                    <span>{job.location}</span>
                  </div>
                </div>

                {/* Applicant Summary Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.9rem',
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '0.6rem',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8' }}>
                    <Users size={14} color="#60a5fa" />
                    <span><strong style={{ color: '#ffffff' }}>{job.applicantCounts?.total || 0}</strong> Applicants</span>
                    {(job.applicantCounts?.pending || 0) > 0 && (
                      <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                        ({job.applicantCounts.pending} pending)
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#34d399', fontWeight: 700 }}>
                    {job.applicantCounts?.accepted || 0}/{job.workersRequired} Hired
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  
                  {/* Primary Row: Applicants, View & Edit */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                      to={`/farmer/jobs/${job._id}/applicants`}
                      style={{
                        flex: 1.2,
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid #3b82f6',
                        color: '#60a5fa',
                        padding: '0.55rem 0.7rem',
                        borderRadius: '0.6rem',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Users size={14} />
                      <span>Applicants ({job.applicantCounts?.total || 0})</span>
                    </Link>

                    <Link
                      to={`/farmer/jobs/${job._id}`}
                      style={{
                        flex: 0.9,
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid #10b981',
                        color: '#34d399',
                        padding: '0.55rem 0.7rem',
                        borderRadius: '0.6rem',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </Link>

                    {job.status !== 'completed' && (
                      <Link
                        to={`/farmer/jobs/${job._id}/edit`}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#ffffff',
                          padding: '0.55rem 0.8rem',
                          borderRadius: '0.6rem',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Edit size={15} />
                        <span>Edit</span>
                      </Link>
                    )}
                  </div>

                  {/* Secondary Status & Delete Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    
                    {/* Toggle Open / Close */}
                    {job.status === 'open' && (
                      <button
                        onClick={() => openConfirmation('close', job)}
                        style={{
                          flex: 1,
                          background: 'rgba(245, 158, 11, 0.15)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#fbbf24',
                          padding: '0.45rem 0.6rem',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <XCircle size={14} />
                        <span>Close</span>
                      </button>
                    )}

                    {job.status === 'closed' && (
                      <button
                        onClick={() => openConfirmation('reopen', job)}
                        style={{
                          flex: 1,
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#34d399',
                          padding: '0.45rem 0.6rem',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <RotateCcw size={14} />
                        <span>Reopen</span>
                      </button>
                    )}

                    {/* Mark Completed */}
                    {job.status !== 'completed' && (
                      <button
                        onClick={() => openConfirmation('complete', job)}
                        style={{
                          flex: 1,
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          padding: '0.45rem 0.6rem',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Complete</span>
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => openConfirmation('delete', job)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '0.45rem 0.7rem',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem'
                      }}
                      title="Delete Job"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>

                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

        {/* Pagination bar */}
        {!loading && totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '3rem'
          }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.9rem'
              }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                opacity: page === totalPages ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.9rem'
              }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(7, 10, 17, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '440px',
            width: '100%',
            padding: '2rem',
            background: '#0f172a',
            border: confirmModal.type === 'delete' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
          }}>
            <div style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: confirmModal.type === 'delete' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: confirmModal.type === 'delete' ? '#ef4444' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              {confirmModal.type === 'delete' ? <Trash2 size={28} /> : <CheckCircle2 size={28} />}
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              {confirmModal.type === 'delete' && 'Delete Job Listing?'}
              {confirmModal.type === 'complete' && 'Mark Job as Completed?'}
              {confirmModal.type === 'close' && 'Close Job Listing?'}
              {confirmModal.type === 'reopen' && 'Reopen Job Listing?'}
            </h3>

            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {confirmModal.type === 'delete' && (
                <>Are you sure you want to permanently delete <strong style={{ color: '#ffffff' }}>"{confirmModal.jobTitle}"</strong>? This action cannot be undone.</>
              )}
              {confirmModal.type === 'complete' && (
                <>Are you sure work is finished for <strong style={{ color: '#ffffff' }}>"{confirmModal.jobTitle}"</strong>? Marking as completed locks further edits.</>
              )}
              {confirmModal.type === 'close' && (
                <>Closing <strong style={{ color: '#ffffff' }}>"{confirmModal.jobTitle}"</strong> will temporarily hide it from active worker discovery. You can reopen it anytime.</>
              )}
              {confirmModal.type === 'reopen' && (
                <>Reopening <strong style={{ color: '#ffffff' }}>"{confirmModal.jobTitle}"</strong> will make it active again.</>
              )}
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                disabled={confirmModal.loading}
                onClick={() => {
                  if (confirmModal.type === 'delete') {
                    handleDeleteJob(confirmModal.jobId);
                  } else if (confirmModal.type === 'complete') {
                    handleStatusChange(confirmModal.jobId, 'completed');
                  } else if (confirmModal.type === 'close') {
                    handleStatusChange(confirmModal.jobId, 'closed');
                  } else if (confirmModal.type === 'reopen') {
                    handleStatusChange(confirmModal.jobId, 'open');
                  }
                }}
                style={{
                  flex: 1,
                  background: confirmModal.type === 'delete' ? '#ef4444' : '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.6rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {confirmModal.loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm'}
              </button>
              
              <button
                disabled={confirmModal.loading}
                onClick={() => setConfirmModal({ isOpen: false, type: null, jobId: null, jobTitle: '', loading: false })}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '0.75rem',
                  borderRadius: '0.6rem',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
