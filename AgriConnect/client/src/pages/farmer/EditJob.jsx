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
import { useLanguage } from '../../context/LanguageContext';

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
  const { t } = useLanguage();

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
          setServerError(res.message || t('p8_job_not_found', 'Job not found'));
        }
      } catch (err) {
        console.error('Edit Job load error:', err);
        setServerError(err.message || t('p8_load_job_error', 'Failed to load job for editing'));
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
    if (!formData.title.trim()) errs.title = t('p8_error_title', 'Job title is required');
    if (!formData.crop) errs.crop = t('p8_error_crop', 'Crop type is required');
    if (!formData.workType) errs.workType = t('p8_error_work_type', 'Work type is required');

    if (!formData.workersRequired || Number(formData.workersRequired) < 1) {
      errs.workersRequired = t('p8_error_workers', 'Number of workers must be at least 1');
    }

    if (!formData.wageAmount || Number(formData.wageAmount) <= 0) {
      errs.wageAmount = t('p8_error_wage', 'Wage amount must be greater than 0');
    }

    if (!formData.durationValue || Number(formData.durationValue) <= 0) {
      errs.durationValue = t('p8_error_duration', 'Duration must be greater than 0');
    }

    if (!formData.location.trim()) {
      errs.location = t('p8_error_location', 'Location or village is required');
    }

    if (!formData.startDate) {
      errs.startDate = t('p8_error_start_date', 'Start date is required');
    }

    if (!formData.description.trim()) {
      errs.description = t('p8_error_description', 'Job description is required');
    } else if (formData.description.trim().length > 2000) {
      errs.description = t('p8_error_description_length', 'Description cannot exceed 2000 characters');
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
      setServerError(t('p8_completed_job_edit_error', 'Completed jobs cannot be edited.'));
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
        setSuccessMessage(t('p8_job_updated_redirect', 'Job updated successfully! Redirecting...'));
        setTimeout(() => {
          navigate(`/farmer/jobs/${id}`);
        }, 1200);
      } else {
        setServerError(res.message || t('p8_update_job_error', 'Failed to update job details'));
      }
    } catch (err) {
      console.error('Update Job submit error:', err);
      setServerError(err.message || t('p8_update_job_error', 'Failed to update job details'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center', color: '#94a3b8' }}>
        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#10b981' }} />
        <p style={{ fontWeight: 600 }}>{t('p8_loading_job_information', 'Loading job information...')}</p>
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
              {t('status_completed', 'Job completed')}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
              {t('p8_completed_job_edit_error', 'This job has been marked as completed and cannot be edited.')}
            </p>
            <Link to={`/farmer/jobs/${id}`} className="btn-primary" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={18} />
              <span>{t('p8_back_job_details', 'Back to job details')}</span>
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
            <span>{t('p8_back_job_details', 'Back to job details')}</span>
          </Link>
        </div>

        {/* Main Form Card */}
        <div className="glass-panel" style={{ padding: '2.5rem', background: '#0f172a' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Sprout size={18} />
              <span>{t('p8_edit_job_post', 'Edit job post')}</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem' }}>
              {t('p8_edit_job_listing', 'Edit job listing')}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.3rem' }}>
              {t('p8_edit_job_help', 'Update wage rates, worker numbers, duration or description.')}
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div role="status" aria-live="polite" style={{
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
            <div role="alert" aria-live="assertive" style={{
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
                {t('p8_job_title', 'Job title')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'title-error' : undefined}
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
              {errors.title && <span id="title-error" style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.title}</span>}
            </div>

            {/* Crop & Work Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label htmlFor="crop" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  {t('p8_crop_type', 'Crop type')} <span style={{ color: '#ef4444' }}>*</span>
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
                  {t('p8_work_type', 'Work type')} <span style={{ color: '#ef4444' }}>*</span>
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
                  {t('p8_wage_amount', 'Wage amount (INR)')} <span style={{ color: '#ef4444' }}>*</span>
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
                    aria-invalid={Boolean(errors.wageAmount)}
                    aria-describedby={errors.wageAmount ? 'wageAmount-error' : undefined}
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
                {errors.wageAmount && <span id="wageAmount-error" style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.wageAmount}</span>}
              </div>

              <div>
                <label htmlFor="wageType" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  {t('p8_wage_type', 'Wage type')} <span style={{ color: '#ef4444' }}>*</span>
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
                  <option value="daily" style={{ background: '#0f172a' }}>{t('daily_wage', 'Daily wage')}</option>
                  <option value="hourly" style={{ background: '#0f172a' }}>{t('p8_hourly_rate', 'Hourly rate')}</option>
                  <option value="fixed" style={{ background: '#0f172a' }}>{t('p8_fixed_lump_sum', 'Fixed lump sum')}</option>
                </select>
              </div>
            </div>

            {/* Workers Required & Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label htmlFor="workersRequired" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  {t('p8_workers', 'Workers required')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="workersRequired"
                  name="workersRequired"
                  type="number"
                  min="1"
                  required
                  value={formData.workersRequired}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.workersRequired)}
                  aria-describedby={errors.workersRequired ? 'workersRequired-error' : undefined}
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
                {errors.workersRequired && <span id="workersRequired-error" style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.workersRequired}</span>}
              </div>

              <div>
                <label htmlFor="durationValue" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  {t('p8_duration', 'Duration')} <span style={{ color: '#ef4444' }}>*</span>
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
                    aria-invalid={Boolean(errors.durationValue)}
                    aria-describedby={errors.durationValue ? 'durationValue-error' : undefined}
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
                  {errors.durationValue && <span id="durationValue-error" role="alert" style={{ gridColumn: '1 / -1', color: '#ef4444', fontSize: '0.82rem' }}>{errors.durationValue}</span>}
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
                    <option value="days" style={{ background: '#0f172a' }}>{t('p8_days', 'Days')}</option>
                    <option value="hours" style={{ background: '#0f172a' }}>{t('p8_hours', 'Hours')}</option>
                    <option value="weeks" style={{ background: '#0f172a' }}>{t('p8_weeks', 'Weeks')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Start Date & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label htmlFor="startDate" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  {t('p8_start_date', 'Start date')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.startDate)}
                  aria-describedby={errors.startDate ? 'startDate-error' : undefined}
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
                {errors.startDate && <span id="startDate-error" role="alert" style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.startDate}</span>}
              </div>

              <div>
                <label htmlFor="location" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  {t('p8_location', 'Farm location / village')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.location)}
                  aria-describedby={errors.location ? 'location-error' : undefined}
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
                {errors.location && <span id="location-error" role="alert" style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.location}</span>}
              </div>
            </div>

            {/* Optional Location breakdown: Village, District, State */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label htmlFor="village" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
                  {t('p8_village', 'Village')} ({t('p8_optional', 'Optional')})
                </label>
                <input
                  id="village"
                  name="village"
                  type="text"
                  placeholder={t('p8_example_village', 'e.g. Navli')}
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
                  {t('p8_district', 'District')} ({t('p8_optional', 'Optional')})
                </label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  placeholder={t('p8_example_district', 'e.g. Anand')}
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
                  {t('p8_state', 'State')} ({t('p8_optional', 'Optional')})
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder={t('p8_example_state', 'e.g. Gujarat')}
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
                {t('p8_description', 'Description & perks')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? 'description-error' : undefined}
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
              {errors.description && <span id="description-error" role="alert" style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.description}</span>}
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
                    <span>{t('p8_saving_changes', 'Saving changes...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    <span>{t('p8_save_job_changes', 'Save job changes')}</span>
                  </>
                )}
              </button>
              
              <Link
                to={`/farmer/jobs/${id}`}
                className="btn-secondary"
                style={{ textDecoration: 'none', padding: '0.95rem 1.5rem' }}
              >
                {t('p8_cancel', 'Cancel')}
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
