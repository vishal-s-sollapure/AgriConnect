import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Sprout, 
  ArrowLeft, 
  IndianRupee, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import jobService from '../../services/jobService';
import LocationPickerMap from '../../components/map/LocationPickerMap';

const CROP_OPTIONS = [
  'Wheat',
  'Cotton',
  'Paddy / Rice',
  'Sugarcane',
  'Vegetables',
  'Fruits',
  'Pulses',
  'Mustard',
  'Maize',
  'Other'
];

const WORK_TYPE_OPTIONS = [
  'Sowing',
  'Transplanting',
  'Harvesting',
  'Irrigation',
  'Weeding',
  'Fertilizing',
  'Spraying',
  'Sorting and packing',
  'General farm work',
  'Other'
];

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    crop: 'Wheat',
    workType: 'Harvesting',
    workersRequired: '',
    wageAmount: '',
    wageType: 'daily',
    startDate: todayStr,
    durationValue: '',
    durationUnit: 'days',
    location: '',
    village: '',
    district: '',
    state: '',
    latitude: null,
    longitude: null,
    locationSource: '',
    description: ''
  });

  const [jobStatus, setJobStatus] = useState('open');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch initial job details
  useEffect(() => {
    async function loadJob() {
      setLoading(true);
      try {
        const res = await jobService.getJobById(id);
        if (res.success && res.job) {
          const j = res.job;
          setJobStatus(j.status);
          
          let formattedDate = todayStr;
          if (j.startDate) {
            formattedDate = new Date(j.startDate).toISOString().split('T')[0];
          }

          setFormData({
            title: j.title || '',
            crop: j.crop || 'Wheat',
            workType: j.workType || 'Harvesting',
            workersRequired: j.workersRequired ? String(j.workersRequired) : '1',
            wageAmount: j.wageAmount ? String(j.wageAmount) : '',
            wageType: j.wageType || 'daily',
            startDate: formattedDate,
            durationValue: j.durationValue ? String(j.durationValue) : '1',
            durationUnit: j.durationUnit || 'days',
            location: j.location || '',
            village: j.village || '',
            district: j.district || '',
            state: j.state || '',
            latitude: j.latitude ?? null,
            longitude: j.longitude ?? null,
            locationSource: j.locationSource || '',
            description: j.description || ''
          });
        } else {
          setServerError(res.message || 'Job not found');
        }
      } catch (err) {
        console.error('Edit Job load error:', err);
        setServerError(err.message || 'Failed to load job for editing');
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id]);

  const handleLocationChange = (coords) => {
    setFormData(prev => ({
      ...prev,
      ...coords,
      ...(coords.village && !prev.village ? { village: coords.village } : {}),
      ...(coords.district && !prev.district ? { district: coords.district } : {}),
      ...(coords.state && !prev.state ? { state: coords.state } : {})
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Job title is required';
    if (!formData.crop) errs.crop = 'Crop type is required';
    if (!formData.workType) errs.workType = 'Work type is required';

    if (!formData.workersRequired || Number(formData.workersRequired) < 1) {
      errs.workersRequired = 'Number of workers must be at least 1';
    }

    if (!formData.wageAmount || Number(formData.wageAmount) <= 0) {
      errs.wageAmount = 'Wage amount must be greater than 0';
    }

    if (!formData.durationValue || Number(formData.durationValue) <= 0) {
      errs.durationValue = 'Duration must be greater than 0';
    }

    if (!formData.location.trim()) {
      errs.location = 'Location or village is required';
    }

    if (!formData.startDate) {
      errs.startDate = 'Start date is required';
    }

    if (!formData.description.trim()) {
      errs.description = 'Job description is required';
    } else if (formData.description.trim().length > 2000) {
      errs.description = 'Description cannot exceed 2000 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (jobStatus === 'completed') {
      setServerError('Completed jobs cannot be edited.');
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      const payload = {
        title: formData.title.trim(),
        crop: formData.crop,
        workType: formData.workType,
        workersRequired: Number(formData.workersRequired),
        wageAmount: Number(formData.wageAmount),
        wageType: formData.wageType,
        startDate: formData.startDate,
        durationValue: Number(formData.durationValue),
        durationUnit: formData.durationUnit,
        location: formData.location.trim(),
        village: formData.village.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        description: formData.description.trim()
      };

      const res = await jobService.updateJob(id, payload);
      if (res.success && res.job) {
        setSuccessMessage('Job updated successfully! Redirecting...');
        setTimeout(() => {
          navigate(`/farmer/jobs/${id}`);
        }, 1200);
      } else {
        setServerError(res.message || 'Failed to update job details');
      }
    } catch (err) {
      console.error('Update Job submit error:', err);
      setServerError(err.message || 'Failed to update job post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center', color: '#94a3b8' }}>
        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#10b981' }} />
        <p style={{ fontWeight: 600 }}>Loading job information...</p>
      </div>
    );
  }

  if (jobStatus === 'completed') {
    return (
      <div style={{ padding: '4rem 0 5rem 0' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', background: '#0f172a' }}>
            <CheckCircle2 size={44} color="#60a5fa" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Job Completed
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
              This job has been marked as completed and cannot be edited.
            </p>
            <Link to={`/farmer/jobs/${id}`} className="btn-primary" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={18} />
              <span>Back to Job Details</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem 0', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Navigation back */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link 
            to={`/farmer/jobs/${id}`} 
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
            <span>Back to Job Details</span>
          </Link>
        </div>

        {/* Main Form Card */}
        <div className="glass-panel" style={{ padding: '2.5rem', background: '#0f172a' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Sprout size={18} />
              <span>EDIT JOB POST</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem' }}>
              Edit Job Listing
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.3rem' }}>
              Update wage rates, worker numbers, duration or description.
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: 600
            }}>
              <CheckCircle2 size={22} color="#10b981" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Server Error Banner */}
          {serverError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.95rem'
            }}>
              <AlertCircle size={22} color="#ef4444" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Title */}
            <div>
              <label htmlFor="title" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                Job Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: errors.title ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '0.6rem',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              {errors.title && <span style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.title}</span>}
            </div>

            {/* Crop & Work Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label htmlFor="crop" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Crop Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="crop"
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                >
                  {CROP_OPTIONS.map(c => (
                    <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="workType" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Work Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="workType"
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                >
                  {WORK_TYPE_OPTIONS.map(wt => (
                    <option key={wt} value={wt} style={{ background: '#0f172a' }}>{wt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Wage & Wage Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label htmlFor="wageAmount" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Wage Amount (INR ₹) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontWeight: 700 }}>₹</span>
                  <input
                    id="wageAmount"
                    name="wageAmount"
                    type="number"
                    min="1"
                    required
                    value={formData.wageAmount}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem 0.85rem 2.4rem',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: errors.wageAmount ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.6rem',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>
                {errors.wageAmount && <span style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.wageAmount}</span>}
              </div>

              <div>
                <label htmlFor="wageType" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Wage Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="wageType"
                  name="wageType"
                  value={formData.wageType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                >
                  <option value="daily" style={{ background: '#0f172a' }}>Daily Wage</option>
                  <option value="hourly" style={{ background: '#0f172a' }}>Hourly Rate</option>
                  <option value="fixed" style={{ background: '#0f172a' }}>Fixed Lump Sum</option>
                </select>
              </div>
            </div>

            {/* Workers Required & Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label htmlFor="workersRequired" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Workers Required <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="workersRequired"
                  name="workersRequired"
                  type="number"
                  min="1"
                  required
                  value={formData.workersRequired}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: errors.workersRequired ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
                {errors.workersRequired && <span style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.workersRequired}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Duration <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    id="durationValue"
                    name="durationValue"
                    type="number"
                    min="1"
                    required
                    value={formData.durationValue}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: errors.durationValue ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.6rem',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                  <select
                    id="durationUnit"
                    name="durationUnit"
                    value={formData.durationUnit}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.85rem 0.75rem',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.6rem',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  >
                    <option value="days" style={{ background: '#0f172a' }}>Days</option>
                    <option value="hours" style={{ background: '#0f172a' }}>Hours</option>
                    <option value="weeks" style={{ background: '#0f172a' }}>Weeks</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Start Date & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label htmlFor="startDate" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Start Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: errors.startDate ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label htmlFor="location" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Farm Location / Village <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: errors.location ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
                {errors.location && <span style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.location}</span>}
              </div>
            </div>

            {/* Optional Location breakdown: Village, District, State */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label htmlFor="village" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
                  Village (Optional)
                </label>
                <input
                  id="village"
                  name="village"
                  type="text"
                  placeholder="e.g. Navli"
                  value={formData.village}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label htmlFor="district" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
                  District (Optional)
                </label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  placeholder="e.g. Anand"
                  value={formData.district}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label htmlFor="state" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
                  State (Optional)
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="e.g. Gujarat"
                  value={formData.state}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Phase 6: Interactive Map Pinning */}
            <LocationPickerMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={handleLocationChange}
              initialSearchQuery={[formData.village, formData.district, formData.state].filter(Boolean).join(', ') || formData.location}
            />

            {/* Description */}
            <div>
              <label htmlFor="description" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                Description & Perks <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: errors.description ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '0.6rem',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '0.95rem 1.5rem', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    <span>Save Job Changes</span>
                  </>
                )}
              </button>
              
              <Link
                to={`/farmer/jobs/${id}`}
                className="btn-secondary"
                style={{ textDecoration: 'none', padding: '0.95rem 1.5rem' }}
              >
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
