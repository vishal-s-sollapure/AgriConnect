import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Loader2,
  Lock,
  LocateFixed
} from 'lucide-react';
import jobService from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import { useAgri } from '../../context/AgriContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatNumber } from '../../i18n/formatters';
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

export default function CreateJob({ onOpenAuth }) {
  const navigate = useNavigate();
  const { currentUser: authUser } = useAuth();
  const { currentUser: agriUser } = useAgri();
  const { t, language } = useLanguage();
  const currentUser = authUser || agriUser;

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    crop: 'Wheat',
    workType: 'Harvesting',
    workersRequired: '5',
    wageAmount: '650',
    wageType: 'daily',
    startDate: todayStr,
    durationValue: '3',
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

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isAuthError, setIsAuthError] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [locating, setLocating] = useState(false);

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
    } else {
      const selected = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);
      if (selected < today) {
        errs.startDate = t('p8_error_start_date_past', 'Start date cannot be in the past');
      }
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
    if (!isAuthError) {
      setServerError('');
    }
  };

  const handleLocationChange = (coords) => {
    setFormData(prev => ({
      ...prev,
      ...coords,
      ...(coords.village && !prev.village ? { village: coords.village } : {}),
      ...(coords.district && !prev.district ? { district: coords.district } : {}),
      ...(coords.state && !prev.state ? { state: coords.state } : {})
    }));
  };

  const captureFarmLocation = () => {
    if (!window.confirm('Attach this farm’s GPS coordinates to the public job listing? Workers will be able to see the pin on the map.')) {
      return;
    }
    if (!navigator.geolocation) {
      setLocationMessage('This browser does not support GPS location.');
      return;
    }

    setLocating(true);
    setLocationMessage('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFormData((previous) => ({
          ...previous,
          latitude: coords.latitude,
          longitude: coords.longitude,
          locationSource: 'gps'
        }));
        setLocationMessage('GPS coordinates attached to this job listing.');
        setLocating(false);
      },
      (error) => {
        setLocationMessage(error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. You can still publish using the text location.'
          : 'Could not determine your location. You can still publish using the text location.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!validate()) return;

    setSubmitting(true);
    setServerError('');
    setIsAuthError(false);

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
        latitude: formData.latitude,
        longitude: formData.longitude,
        description: formData.description.trim()
      };

      const res = await jobService.createJob(payload);
      if (res.success && res.job) {
        setSuccessMessage('Job created successfully! Redirecting to job details...');
        setTimeout(() => {
          navigate(`/farmer/jobs/${res.job._id}`);
        }, 1200);
      } else {
        setServerError(res.message || 'Failed to create job posting');
      }
    } catch (err) {
      console.error('Create Job error:', err);
      if (err.status === 401 || (err.message && err.message.includes('authorized'))) {
        const expiredEmail = currentUser?.email || '';
        setIsAuthError(true);
        setRecoveryEmail(expiredEmail);
        setServerError(err.message || 'Not authorized: No authentication token provided.');
      } else {
        setServerError(err.message || 'Failed to submit job. Please check your network and input data.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem 0', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Navigation back */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link 
            to="/farmer" 
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
            <span>{t('p8_back_dashboard', 'Back to Farmer Dashboard')}</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="glass-panel" style={{ padding: '2.5rem', background: '#0f172a' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Sprout size={18} />
              <span>{t('nav_farmer_dashboard', 'FARMER PORTAL')}</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem' }}>
              {t('p8_create_job', 'Post a New Agricultural Job')}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.3rem' }}>
              {t('p8_create_job_help', 'Fill in the job specifications to connect directly with skilled workers.')}
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

          {/* Auth Re-authenticator Notice */}
          {isAuthError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 700, color: '#f87171' }}>
                <Lock size={20} color="#ef4444" />
                <span>Session Authorization Error: {serverError}</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
                  Your saved session is no longer valid. Sign in with your account credentials, then submit the job again. If your account is missing from this local database, create it again using the same email address.
              </p>
                {onOpenAuth && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => onOpenAuth('login', 'farmer', recoveryEmail)}
                      style={{
                        alignSelf: 'flex-start',
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.55rem 1.2rem',
                        borderRadius: '0.5rem',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Lock size={16} />
                      <span>Sign in again</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenAuth('signup', 'farmer', recoveryEmail)}
                      style={{
                        alignSelf: 'flex-start',
                        background: 'transparent',
                        color: '#cbd5e1',
                        border: '1px solid rgba(203, 213, 225, 0.5)',
                        padding: '0.55rem 1.2rem',
                        borderRadius: '0.5rem',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer'
                      }}
                    >
                      Create account
                    </button>
                  </div>
                )}
              </div>
          )}

          {/* Standard Server Error Banner */}
          {serverError && !isAuthError && (
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
                {t('p8_job_title', 'Job Title')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder={t('p8_job_title_placeholder', 'e.g. Wheat Harvesting & Bundling')}
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
                  {t('p8_crop_type', 'Crop Type')} <span style={{ color: '#ef4444' }}>*</span>
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
                    border: errors.crop ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
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
                {errors.crop && <span style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.crop}</span>}
              </div>

              <div>
                <label htmlFor="workType" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  {t('p8_work_type', 'Work Type')} <span style={{ color: '#ef4444' }}>*</span>
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
                    border: errors.workType ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
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
                {errors.workType && <span style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.workType}</span>}
              </div>
            </div>

            {/* Wage & Wage Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label htmlFor="wageAmount" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  {t('p8_wage_amount', 'Wage Amount (INR ₹)')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontWeight: 700 }}>₹</span>
                  <input
                    id="wageAmount"
                    name="wageAmount"
                    type="number"
                    min="1"
                    required
                    placeholder="650"
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
                  {t('p8_wage_type', 'Wage Type')} <span style={{ color: '#ef4444' }}>*</span>
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
                  <option value="daily" style={{ background: '#0f172a' }}>{t('p8_per_day', 'Daily Wage')}</option>
                  <option value="hourly" style={{ background: '#0f172a' }}>{t('p8_per_hour', 'Hourly Rate')}</option>
                  <option value="fixed" style={{ background: '#0f172a' }}>{t('p8_per_contract', 'Fixed Lump Sum')}</option>
                </select>
              </div>
            </div>

            {/* Workers Required & Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label htmlFor="workersRequired" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  {t('p8_workers', 'Workers Required')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="workersRequired"
                  name="workersRequired"
                  type="number"
                  min="1"
                  required
                  placeholder="5"
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
                  {t('p8_duration', 'Duration')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    id="durationValue"
                    name="durationValue"
                    type="number"
                    min="1"
                    required
                    placeholder="3"
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
                {errors.durationValue && <span style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.durationValue}</span>}
              </div>
            </div>

            {/* Start Date & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label htmlFor="startDate" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  {t('p8_start_date', 'Start Date')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  min={todayStr}
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
                {errors.startDate && <span style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }}>{errors.startDate}</span>}
              </div>

              <div>
                <label htmlFor="location" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  {t('p8_location', 'Farm Location / Village')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  placeholder="e.g. Anand, Gujarat"
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
              <button
                type="button"
                onClick={captureFarmLocation}
                disabled={locating}
                className="btn-secondary"
                style={{ padding: '0.6rem 0.9rem' }}
              >
                {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                <span>{locating ? 'Getting GPS…' : formData.latitude != null ? 'Update GPS pin' : 'Add GPS pin (optional)'}</span>
              </button>
              <span role="status" style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                {locationMessage || (formData.latitude != null ? 'Precise location will be visible to workers.' : 'A GPS pin enables accurate nearby search; text location remains public.')}
              </span>
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
                  {t('p8_district', 'District')} ({t('p8_optional', 'Optional')})
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
                  {t('p8_state', 'State')} ({t('p8_optional', 'Optional')})
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
                {t('p8_description', 'Job Description & Perks')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                required
                placeholder="Specify work details, timing, tea/food facilities, transportation, required tools, etc."
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span>{errors.description && <strong style={{ color: '#ef4444' }}>{errors.description}</strong>}</span>
                <span>{formData.description.length} / 2000 chars</span>
              </div>
            </div>

            {/* Live Wage Summary Box */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Estimated Total Wage Offering</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                  ₹{formatNumber(formData.wageAmount || 0, language)} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>/ {formData.wageType} per worker</span>
                </div>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
                Targeting <strong style={{ color: '#ffffff' }}>{formData.workersRequired || 0} workers</strong> for <strong style={{ color: '#ffffff' }}>{formData.durationValue || 0} {formData.durationUnit}</strong>
              </div>
            </div>

            {/* Form Action Buttons */}
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
                    <span>{t('p8_publishing', 'Publishing job...')}</span>
                  </>
                ) : (
                  <>
                    <Sprout size={20} />
                    <span>{t('p8_publish_job', 'Publish job opportunity')}</span>
                  </>
                )}
              </button>
              <Link
                to="/farmer"
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
