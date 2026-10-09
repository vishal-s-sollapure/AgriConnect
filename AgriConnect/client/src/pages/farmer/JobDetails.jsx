import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Sprout, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  IndianRupee, 
  Edit, 
  XCircle, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  AlertTriangle, 
  Loader2,
  Building2,
  FileText
} from 'lucide-react';
import jobService from '../../services/jobService';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null, // 'delete' | 'complete' | 'close' | 'reopen'
    loading: false
  });

  const fetchJobDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await jobService.getJobById(id);
      if (res.success && res.job) {
        setJob(res.job);
      } else {
        setError(res.message || 'Job not found or inaccessible');
      }
    } catch (err) {
      console.error('Fetch job details error:', err);
      if (err.status === 404) {
        setError('Job record not found or you do not have permission to view it.');
      } else {
        setError(err.message || 'Failed to fetch job details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setConfirmModal(prev => ({ ...prev, loading: true }));
      const res = await jobService.updateJobStatus(id, newStatus);
      if (res.success && res.job) {
        setJob(res.job);
        setConfirmModal({ isOpen: false, action: null, loading: false });
      } else {
        alert(res.message || 'Failed to update job status');
        setConfirmModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Update job status error:', err);
      alert(err.message || 'Failed to update status');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async () => {
    try {
      setConfirmModal(prev => ({ ...prev, loading: true }));
      const res = await jobService.deleteJob(id);
      if (res.success) {
        navigate('/farmer/jobs');
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }}></span>
            Active / Open Listing
          </span>
        );
      case 'closed':
        return (
          <span style={{
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }}></span>
            Closed Listing
          </span>
        );
      case 'completed':
        return (
          <span style={{
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <CheckCircle2 size={14} />
            Work Completed
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center', color: '#94a3b8' }}>
        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#10b981' }} />
        <p style={{ fontWeight: 600 }}>Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ padding: '3rem 0 5rem 0' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', background: '#0f172a' }}>
            <AlertTriangle size={40} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Job Not Found
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
              {error || 'The requested job post is unavailable or you do not have permission to view it.'}
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
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Navigation bar */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link 
            to="/farmer/jobs" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#34d399', 
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            <ArrowLeft size={18} />
            <span>Back to My Jobs</span>
          </Link>

          {getStatusBadge(job.status)}
        </div>

        {/* Main Details Panel */}
        <div className="glass-panel" style={{ padding: '2.5rem', background: '#0f172a', marginBottom: '2rem' }}>
          
          {/* Header Info */}
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
                🌾 Crop: {job.crop}
              </span>
              <span style={{ background: 'rgba(132, 204, 22, 0.15)', color: '#a3e635', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
                ⚙️ Work: {job.workType}
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', lineHeight: '1.2' }}>
              {job.title}
            </h1>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Last updated {new Date(job.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem'
          }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.25rem', borderRadius: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Daily Wage Rate</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                ₹{job.wageAmount.toLocaleString('en-IN')}
              </div>
              <span style={{ color: '#cbd5e1', fontSize: '0.8rem', textTransform: 'capitalize' }}>Per worker / {job.wageType}</span>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.25rem', borderRadius: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Workers Required</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={22} color="#10b981" />
                <span>{job.workersRequired}</span>
              </div>
              <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Agricultural farm hands</span>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.25rem', borderRadius: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Start Date</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={18} color="#94a3b8" />
                <span>{new Date(job.startDate).toLocaleDateString()}</span>
              </div>
              <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Expected work onset</span>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.25rem', borderRadius: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Work Duration</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={18} color="#94a3b8" />
                <span>{job.durationValue} {job.durationUnit}</span>
              </div>
              <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Estimated schedule</span>
            </div>
          </div>

          {/* Location Breakdown */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="#10b981" />
              <span>Location Details</span>
            </h3>
            <p style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 600 }}>{job.location}</p>
            {(job.village || job.district || job.state) && (
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                {job.village && <span>Village: <strong style={{ color: '#cbd5e1' }}>{job.village}</strong></span>}
                {job.district && <span>District: <strong style={{ color: '#cbd5e1' }}>{job.district}</strong></span>}
                {job.state && <span>State: <strong style={{ color: '#cbd5e1' }}>{job.state}</strong></span>}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="#10b981" />
              <span>Full Description & Worker Facilities</span>
            </h3>
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              color: '#e2e8f0',
              fontSize: '0.98rem',
              lineHeight: '1.7',
              whiteSpace: 'pre-wrap'
            }}>
              {job.description}
            </div>
          </div>

          {/* Farmer Info Box */}
          {job.farmer && (
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} color="#10b981" />
                <span>Owner Farmer Profile</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', color: '#cbd5e1', fontSize: '0.92rem' }}>
                <div><strong>Farmer Name:</strong> {job.farmer.name}</div>
                <div><strong>Contact Phone:</strong> {job.farmer.phone}</div>
                <div><strong>Email:</strong> {job.farmer.email}</div>
                <div><strong>Farm Name:</strong> {job.farmer.farmName || 'Patel Farms'}</div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1.5rem'
          }}>
            {job.status !== 'completed' && (
              <Link
                to={`/farmer/jobs/${job._id}/edit`}
                className="btn-primary"
                style={{ padding: '0.8rem 1.5rem', textDecoration: 'none' }}
              >
                <Edit size={18} />
                <span>Edit Job Details</span>
              </Link>
            )}

            {job.status === 'open' && (
              <button
                onClick={() => setConfirmModal({ isOpen: true, action: 'close', loading: false })}
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #f59e0b',
                  color: '#fbbf24',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <XCircle size={18} />
                <span>Close Listing</span>
              </button>
            )}

            {job.status === 'closed' && (
              <button
                onClick={() => setConfirmModal({ isOpen: true, action: 'reopen', loading: false })}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  color: '#34d399',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <RotateCcw size={18} />
                <span>Reopen Listing</span>
              </button>
            )}

            {job.status !== 'completed' && (
              <button
                onClick={() => setConfirmModal({ isOpen: true, action: 'complete', loading: false })}
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid #3b82f6',
                  color: '#60a5fa',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <CheckCircle2 size={18} />
                <span>Mark Completed</span>
              </button>
            )}

            <button
              onClick={() => setConfirmModal({ isOpen: true, action: 'delete', loading: false })}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '0.8rem 1.5rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginLeft: 'auto'
              }}
            >
              <Trash2 size={18} />
              <span>Delete Job</span>
            </button>
          </div>

        </div>

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
            border: confirmModal.action === 'delete' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)'
          }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              {confirmModal.action === 'delete' && 'Delete Job Post?'}
              {confirmModal.action === 'complete' && 'Mark Job as Completed?'}
              {confirmModal.action === 'close' && 'Close Job Post?'}
              {confirmModal.action === 'reopen' && 'Reopen Job Post?'}
            </h3>

            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              {confirmModal.action === 'delete' && 'Are you sure you want to permanently delete this job posting?'}
              {confirmModal.action === 'complete' && 'Marking this job as completed will lock edits.'}
              {confirmModal.action === 'close' && 'Closing this job will temporarily hide it from new applications.'}
              {confirmModal.action === 'reopen' && 'Reopening will activate the job posting again.'}
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                disabled={confirmModal.loading}
                onClick={() => {
                  if (confirmModal.action === 'delete') handleDelete();
                  else if (confirmModal.action === 'complete') handleStatusChange('completed');
                  else if (confirmModal.action === 'close') handleStatusChange('closed');
                  else if (confirmModal.action === 'reopen') handleStatusChange('open');
                }}
                style={{
                  flex: 1,
                  background: confirmModal.action === 'delete' ? '#ef4444' : '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.6rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {confirmModal.loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm'}
              </button>

              <button
                disabled={confirmModal.loading}
                onClick={() => setConfirmModal({ isOpen: false, action: null, loading: false })}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '0.75rem',
                  borderRadius: '0.6rem',
                  fontWeight: 600,
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
