import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  MapPin,
  Calendar,
  Users,
  Clock,
  IndianRupee,
  Briefcase,
  Sprout,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  Navigation,
  LocateFixed,
  Map,
  List,
  Columns,
  Info,
  Check
} from 'lucide-react';
import jobService from '../../services/jobService';
import JobMap from '../../components/map/JobMap';

const COMMON_CROPS = [
  'Wheat',
  'Paddy / Rice',
  'Cotton',
  'Sugarcane',
  'Mustard',
  'Maize',
  'Soybean',
  'Vegetables',
  'Groundnut',
  'Pulses',
  'Fruits'
];

const WORK_TYPES = [
  'Harvesting',
  'Sowing',
  'Tilling',
  'Weeding',
  'Spraying',
  'Irrigation',
  'Packaging',
  'Transplanting',
  'Pruning',
  'General Labor'
];

const RADIUS_OPTIONS = [
  { label: '5 km', value: '5' },
  { label: '10 km', value: '10' },
  { label: '25 km', value: '25' },
  { label: '50 km (Default)', value: '50' },
  { label: '100 km (Max)', value: '100' }
];

export default function JobDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-driven query states
  const initialSearch = searchParams.get('search') || '';
  const initialCrop = searchParams.get('crop') || '';
  const initialWorkType = searchParams.get('workType') || '';
  const initialLocation = searchParams.get('location') || '';
  const initialVillage = searchParams.get('village') || '';
  const initialDistrict = searchParams.get('district') || '';
  const initialState = searchParams.get('state') || '';
  const initialWageType = searchParams.get('wageType') || '';
  const initialMinWage = searchParams.get('minWage') || '';
  const initialMaxWage = searchParams.get('maxWage') || '';
  const initialStartDate = searchParams.get('startDate') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialRadius = searchParams.get('radiusKm') || '50';
  const initialLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')) : null;
  const initialLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')) : null;
  const initialSortByDistance = searchParams.get('sortByDistance') === 'true';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [crop, setCrop] = useState(initialCrop);
  const [workType, setWorkType] = useState(initialWorkType);
  const [location, setLocation] = useState(initialLocation);
  const [village, setVillage] = useState(initialVillage);
  const [district, setDistrict] = useState(initialDistrict);
  const [state, setState] = useState(initialState);
  const [wageType, setWageType] = useState(initialWageType);
  const [minWage, setMinWage] = useState(initialMinWage);
  const [maxWage, setMaxWage] = useState(initialMaxWage);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [page, setPage] = useState(initialPage);

  // Phase 6 Geo States
  const [workerLat, setWorkerLat] = useState(initialLat);
  const [workerLng, setWorkerLng] = useState(initialLng);
  const [radiusKm, setRadiusKm] = useState(initialRadius);
  const [sortByDistance, setSortByDistance] = useState(initialSortByDistance);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);

  // View mode: 'split' | 'list' | 'map'
  const [viewMode, setViewMode] = useState('split');

  // Drawers & collapsible sections
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [locationFiltersOpen, setLocationFiltersOpen] = useState(Boolean(initialVillage || initialDistrict || initialState || initialLat));

  // Data states
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounced search handling to avoid excessive network requests
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 380);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Sync state into URL query parameters
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (crop) params.crop = crop;
    if (workType) params.workType = workType;
    if (location) params.location = location;
    if (village) params.village = village;
    if (district) params.district = district;
    if (state) params.state = state;
    if (wageType) params.wageType = wageType;
    if (minWage) params.minWage = minWage;
    if (maxWage) params.maxWage = maxWage;
    if (startDate) params.startDate = startDate;
    if (workerLat !== null && workerLng !== null) {
      params.lat = String(workerLat);
      params.lng = String(workerLng);
      params.radiusKm = String(radiusKm);
      if (sortByDistance) params.sortByDistance = 'true';
    }
    if (page > 1) params.page = String(page);

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    crop,
    workType,
    location,
    village,
    district,
    state,
    wageType,
    minWage,
    maxWage,
    startDate,
    workerLat,
    workerLng,
    radiusKm,
    sortByDistance,
    page,
    setSearchParams
  ]);

  // Fetch jobs from backend API
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 9
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (crop.trim()) params.crop = crop.trim();
      if (workType.trim()) params.workType = workType.trim();
      if (location.trim()) params.location = location.trim();
      if (village.trim()) params.village = village.trim();
      if (district.trim()) params.district = district.trim();
      if (state.trim()) params.state = state.trim();
      if (wageType.trim()) params.wageType = wageType.trim();
      if (minWage && !isNaN(Number(minWage))) params.minWage = Number(minWage);
      if (maxWage && !isNaN(Number(maxWage))) params.maxWage = Number(maxWage);
      if (startDate.trim()) params.startDate = startDate.trim();

      // Coordinates params for distance calculations
      if (workerLat !== null && workerLng !== null && !isNaN(workerLat) && !isNaN(workerLng)) {
        params.lat = workerLat;
        params.lng = workerLng;
        if (radiusKm && !isNaN(Number(radiusKm))) {
          params.radiusKm = Number(radiusKm);
        }
        if (sortByDistance) {
          params.sortByDistance = 'true';
        }
      }

      const res = await jobService.getOpenJobs(params);
      if (res.success) {
        setJobs(res.data || res.jobs || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setError(res.message || 'Failed to retrieve available jobs');
      }
    } catch (err) {
      console.error('Fetch Jobs Error:', err);
      setError(err.message || 'Unable to connect to server. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    crop,
    workType,
    location,
    village,
    district,
    state,
    wageType,
    minWage,
    maxWage,
    startDate,
    workerLat,
    workerLng,
    radiusKm,
    sortByDistance,
    page
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Browser GPS trigger: User explicit action only
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your current browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setWorkerLat(lat);
        setWorkerLng(lng);
        setSortByDistance(true);
        setPage(1);
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setGpsError('Location permission denied. You can still search by village, district, or state manually.');
        } else if (err.code === 2) {
          setGpsError('Position unavailable. Please type your locality or village name manually.');
        } else if (err.code === 3) {
          setGpsError('Location request timed out. Please retry or enter your location manually.');
        } else {
          setGpsError('Unable to retrieve device coordinates.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const handleClearLocation = () => {
    setWorkerLat(null);
    setWorkerLng(null);
    setVillage('');
    setDistrict('');
    setState('');
    setSortByDistance(false);
    setGpsError('');
    setPage(1);
  };

  // Reset page to 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setCrop('');
    setWorkType('');
    setLocation('');
    setVillage('');
    setDistrict('');
    setState('');
    setWageType('');
    setMinWage('');
    setMaxWage('');
    setStartDate('');
    setWorkerLat(null);
    setWorkerLng(null);
    setSortByDistance(false);
    setGpsError('');
    setPage(1);
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
    crop ||
    workType ||
    location ||
    village ||
    district ||
    state ||
    wageType ||
    minWage ||
    maxWage ||
    startDate ||
    workerLat !== null
  );

  const mappedJobsCount = jobs.filter(
    (j) => j.latitude !== null && j.latitude !== undefined && j.longitude !== null && j.longitude !== undefined
  ).length;

  return (
    <div style={{ padding: '2rem 0 5rem 0', minHeight: '85vh' }}>
      <div className="container">
        {/* Page Hero Header */}
        <div style={{ marginBottom: '1.8rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }} className="feature-badge">
            <Sparkles size={16} />
            <span>AGRICULTURAL JOB MARKETPLACE</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Discover Open <span className="gradient-text">Farm Jobs</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.02rem', maxWidth: '680px', marginTop: '0.3rem', lineHeight: 1.6 }}>
            Connect directly with verified farmers. Search harvest, sowing, and cultivation opportunities near your village with transparent wages and real-time interactive mapping.
          </p>
        </div>

        {/* Search & Location Control Panel */}
        <div
          className="glass-panel"
          style={{
            padding: '1.4rem',
            marginBottom: '1.8rem',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          {/* Top Row: Search Input + Location Input + Actions */}
          <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Keyword Search */}
            <div
              style={{
                flex: '1 1 280px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Search
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                placeholder="Search by job title, crop, or keywords..."
                aria-label="Search open jobs"
                style={{
                  width: '100%',
                  padding: '0.8rem 2.6rem 0.8rem 2.7rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '0.8rem',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => handleFilterChange(setSearchTerm, '')}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem'
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Quick Location Filter */}
            <div
              style={{
                flex: '1 1 220px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <MapPin
                size={18}
                color="#10b981"
                style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={location}
                onChange={(e) => handleFilterChange(setLocation, e.target.value)}
                placeholder="Location / Village / District"
                aria-label="Filter by location"
                style={{
                  width: '100%',
                  padding: '0.8rem 2.6rem 0.8rem 2.7rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '0.8rem',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
              {location && (
                <button
                  onClick={() => handleFilterChange(setLocation, '')}
                  aria-label="Clear location filter"
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem'
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* "Use My Location" GPS Button */}
            <button
              onClick={handleUseMyLocation}
              disabled={gpsLoading}
              className="btn-secondary"
              title="Find jobs near your current location using device GPS (requires permission)"
              style={{
                padding: '0.8rem 1.1rem',
                fontSize: '0.88rem',
                gap: '0.45rem',
                background: workerLat !== null ? 'rgba(16, 185, 129, 0.15)' : undefined,
                borderColor: workerLat !== null ? '#10b981' : undefined,
                color: workerLat !== null ? '#34d399' : undefined
              }}
            >
              <LocateFixed size={16} className={gpsLoading ? 'spin' : ''} />
              <span>{gpsLoading ? 'Locating...' : workerLat !== null ? 'GPS Active' : 'Use My Location'}</span>
            </button>

            {/* Location Fields Drawer Toggle */}
            <button
              onClick={() => setLocationFiltersOpen(!locationFiltersOpen)}
              className="btn-secondary"
              style={{
                padding: '0.8rem 1.1rem',
                fontSize: '0.88rem',
                borderColor: village || district || state || workerLat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.18)'
              }}
            >
              <MapPin size={15} />
              <span>Nearby Radius</span>
            </button>

            {/* General Filters Drawer Toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="btn-secondary"
              style={{
                padding: '0.8rem 1.1rem',
                fontSize: '0.88rem',
                borderColor: crop || workType || wageType || minWage || maxWage || startDate ? 'var(--primary)' : 'rgba(255, 255, 255, 0.18)'
              }}
            >
              <SlidersHorizontal size={15} />
              <span>Filters</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f87171',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.5rem 0.6rem'
                }}
              >
                <RotateCcw size={14} />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* GPS Error Message */}
          {gpsError && (
            <div
              style={{
                marginTop: '0.9rem',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.65rem 0.9rem',
                borderRadius: '0.6rem',
                color: '#fca5a5',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={15} color="#ef4444" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Location & Radius Details Drawer */}
          {locationFiltersOpen && (
            <div
              style={{
                marginTop: '1.2rem',
                paddingTop: '1.2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.9rem',
                alignItems: 'end'
              }}
            >
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Village / Locality
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => handleFilterChange(setVillage, e.target.value)}
                  placeholder="e.g. Rampur"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.65rem',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => handleFilterChange(setDistrict, e.target.value)}
                  placeholder="e.g. Pune"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.65rem',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => handleFilterChange(setState, e.target.value)}
                  placeholder="e.g. Maharashtra"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.65rem',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Search Radius (km)
                </label>
                <select
                  value={radiusKm}
                  onChange={(e) => handleFilterChange(setRadiusKm, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.65rem',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                >
                  {RADIUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={sortByDistance}
                    onChange={(e) => handleFilterChange(setSortByDistance, e.target.checked)}
                    disabled={workerLat === null || workerLng === null}
                    style={{ accentColor: 'var(--primary)', width: '15px', height: '15px' }}
                  />
                  <span>Sort by nearest distance</span>
                </label>
                {workerLat !== null && (
                  <button
                    onClick={handleClearLocation}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      borderRadius: '0.5rem',
                      padding: '0.35rem 0.7rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <X size={13} />
                    <span>Clear GPS ({workerLat.toFixed(2)}, {workerLng.toFixed(2)})</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* General Filters Drawer */}
          {filtersOpen && (
            <div
              style={{
                marginTop: '1.2rem',
                paddingTop: '1.2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.9rem'
              }}
            >
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Crop Type
                </label>
                <select
                  value={crop}
                  onChange={(e) => handleFilterChange(setCrop, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.65rem',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="">All Crops</option>
                  {COMMON_CROPS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Work Type
                </label>
                <select
                  value={workType}
                  onChange={(e) => handleFilterChange(setWorkType, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.65rem',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="">All Work Types</option>
                  {WORK_TYPES.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Wage Type
                </label>
                <select
                  value={wageType}
                  onChange={(e) => handleFilterChange(setWageType, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.65rem',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="">Any Wage Type</option>
                  <option value="daily">Daily Wage</option>
                  <option value="hourly">Hourly Wage</option>
                  <option value="fixed">Fixed Contract</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Min Wage (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={minWage}
                  onChange={(e) => handleFilterChange(setMinWage, e.target.value)}
                  placeholder="e.g. 400"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.65rem',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Max Wage (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={maxWage}
                  onChange={(e) => handleFilterChange(setMaxWage, e.target.value)}
                  placeholder="e.g. 1000"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.65rem',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Available From
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.65rem',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Bar + View Mode Toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.2rem',
            flexWrap: 'wrap',
            gap: '0.8rem'
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Showing <strong style={{ color: '#ffffff' }}>{jobs.length}</strong> of{' '}
            <strong style={{ color: '#ffffff' }}>{pagination.total}</strong> open jobs
            {mappedJobsCount > 0 && (
              <span style={{ marginLeft: '0.5rem', color: '#34d399' }}>
                ({mappedJobsCount} plotted on map)
              </span>
            )}
          </div>

          {/* View Mode Buttons: Split / List / Map */}
          <div
            className="view-mode-toggle"
            style={{
              display: 'inline-flex',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '0.25rem',
              borderRadius: '0.65rem',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <button
              onClick={() => setViewMode('split')}
              className={viewMode === 'split' ? 'active' : ''}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                background: viewMode === 'split' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'split' ? '#070a11' : '#cbd5e1',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Columns size={14} />
              <span>Split View</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'active' : ''}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'list' ? '#070a11' : '#cbd5e1',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <List size={14} />
              <span>List Only</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={viewMode === 'map' ? 'active' : ''}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                background: viewMode === 'map' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'map' ? '#070a11' : '#cbd5e1',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Map size={14} />
              <span>Map Only</span>
            </button>
          </div>
        </div>

        {/* Loading State / Skeletons */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.4rem'
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '1.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  minHeight: '240px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: '40%', height: '1.2rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '0.4rem' }}></div>
                  <div style={{ width: '25%', height: '1.2rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '0.4rem' }}></div>
                </div>
                <div style={{ width: '85%', height: '1.6rem', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '0.4rem' }}></div>
                <div style={{ width: '60%', height: '1rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '0.4rem' }}></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            className="glass-panel"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              maxWidth: '560px',
              margin: '2rem auto'
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.2rem auto'
              }}
            >
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Failed to Load Jobs
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {error}
            </p>
            <button
              onClick={fetchJobs}
              className="btn-primary"
              style={{ padding: '0.75rem 1.6rem' }}
            >
              <RotateCcw size={16} />
              <span>Retry Fetching Jobs</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && jobs.length === 0 && (
          <div
            className="glass-panel"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              maxWidth: '560px',
              margin: '2rem auto'
            }}
          >
            <div
              style={{
                width: '4.5rem',
                height: '4.5rem',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}
            >
              <Briefcase size={34} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              No Open Jobs Found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              {hasActiveFilters
                ? 'No farm jobs match your selected location and search criteria. Try widening your radius or clearing filters.'
                : 'There are currently no open jobs posted in your area. Please check back later.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="btn-primary"
                style={{ padding: '0.75rem 1.6rem' }}
              >
                <RotateCcw size={16} />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        )}

        {/* Main Content Layout based on View Mode */}
        {!loading && !error && jobs.length > 0 && (
          <div>
            {/* Informative Note when some jobs do not have coordinates */}
            {jobs.some((j) => j.latitude === null || j.latitude === undefined) && (
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '0.75rem',
                  padding: '0.65rem 1rem',
                  marginBottom: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  color: '#94a3b8',
                  fontSize: '0.84rem'
                }}
              >
                <Info size={15} color="#38bdf8" />
                <span>
                  Jobs with farmer-verified coordinates are plotted on the interactive map. Jobs with text-only locations remain available in the list view.
                </span>
              </div>
            )}

            {/* View Mode: Map Only */}
            {viewMode === 'map' && (
              <div style={{ marginBottom: '2.5rem' }}>
                <JobMap
                  jobs={jobs}
                  selectedJobId={selectedJobId}
                  onSelectJob={(id) => setSelectedJobId(id)}
                  workerLocation={workerLat !== null && workerLng !== null ? { lat: workerLat, lng: workerLng } : null}
                  radiusKm={radiusKm ? Number(radiusKm) : null}
                  height="620px"
                />
              </div>
            )}

            {/* View Mode: Split (Side-by-side on wide screens) */}
            {viewMode === 'split' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.4fr)',
                  gap: '1.5rem',
                  alignItems: 'start',
                  marginBottom: '2.5rem'
                }}
                className="split-discovery-view"
              >
                {/* Left Column: Interactive Map */}
                <div style={{ position: 'sticky', top: '1.5rem' }}>
                  <JobMap
                    jobs={jobs}
                    selectedJobId={selectedJobId}
                    onSelectJob={(id) => setSelectedJobId(id)}
                    workerLocation={workerLat !== null && workerLng !== null ? { lat: workerLat, lng: workerLng } : null}
                    radiusKm={radiusKm ? Number(radiusKm) : null}
                    height="580px"
                  />
                </div>

                {/* Right Column: Job Cards Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {jobs.map((job) => renderJobCard(job, selectedJobId, setSelectedJobId))}
                </div>
              </div>
            )}

            {/* View Mode: List Only */}
            {viewMode === 'list' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2.5rem'
                }}
              >
                {jobs.map((job) => renderJobCard(job, selectedJobId, setSelectedJobId))}
              </div>
            )}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && pagination.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.6rem',
              marginTop: '2rem'
            }}
          >
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="btn-secondary"
              style={{
                padding: '0.6rem 1rem',
                opacity: page <= 1 ? 0.4 : 1,
                cursor: page <= 1 ? 'not-allowed' : 'pointer'
              }}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
              .map((p, index, array) => {
                const prev = array[index - 1];
                const showEllipsis = prev && p - prev > 1;

                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span style={{ color: '#64748b' }}>...</span>}
                    <button
                      onClick={() => setPage(p)}
                      style={{
                        width: '2.4rem',
                        height: '2.4rem',
                        borderRadius: '0.6rem',
                        background: page === p ? 'var(--primary)' : 'rgba(15, 23, 42, 0.8)',
                        color: page === p ? '#070a11' : '#ffffff',
                        border: `1px solid ${page === p ? 'var(--primary)' : 'rgba(255, 255, 255, 0.12)'}`,
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer'
                      }}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page >= pagination.totalPages}
              className="btn-secondary"
              style={{
                padding: '0.6rem 1rem',
                opacity: page >= pagination.totalPages ? 0.4 : 1,
                cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer'
              }}
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Reusable Job Card with Distance Badge & Location Status
 */
function renderJobCard(job, selectedJobId, onSelectJob) {
  const isSelected = selectedJobId === job._id;
  const hasCoordinates =
    job.latitude !== null &&
    job.latitude !== undefined &&
    job.longitude !== null &&
    job.longitude !== undefined;

  return (
    <div
      key={job._id}
      className="glass-panel"
      onClick={() => onSelectJob(job._id)}
      style={{
        padding: '1.6rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        border: isSelected
          ? '2px solid #10b981'
          : '1px solid rgba(255, 255, 255, 0.1)',
        background: isSelected
          ? 'rgba(16, 185, 129, 0.08)'
          : 'rgba(15, 23, 42, 0.75)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <div>
        {/* Top Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.85rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <Sprout size={12} />
              <span>{job.crop}</span>
            </span>

            <span
              style={{
                background: 'rgba(148, 163, 184, 0.12)',
                color: '#cbd5e1',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              {job.workType}
            </span>
          </div>

          {/* Distance Badge (when coordinates match search or worker location) */}
          {(job.distance || (job.distanceKm !== null && job.distanceKm !== undefined)) && (
            <span
              title="Straight-line distance from search / current location"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid rgba(56, 189, 248, 0.35)'
              }}
            >
              <Navigation size={11} />
              <span>{job.distance || `${job.distanceKm} km away`}</span>
            </span>
          )}
        </div>

        {/* Job Title */}
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '0.65rem',
            lineHeight: 1.35
          }}
        >
          {job.title}
        </h3>

        {/* Location & Farmer Profile */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            color: '#94a3b8',
            fontSize: '0.86rem',
            marginBottom: '1.1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <MapPin size={15} color="#10b981" />
            <span>
              {job.village ? `${job.village}, ` : ''}
              {job.district ? `${job.district}, ` : ''}
              {job.state ? `${job.state} • ` : ''}
              {job.location || 'Local Farm'}
            </span>
          </div>

          {job.farmer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#cbd5e1' }}>
              <span style={{ fontSize: '0.85rem' }}>👨‍🌾</span>
              <span>
                {job.farmer.name} {job.farmer.farmName ? `• ${job.farmer.farmName}` : ''}
              </span>
            </div>
          )}

          {!hasCoordinates && (
            <div style={{ color: '#64748b', fontSize: '0.78rem', fontStyle: 'italic' }}>
              Text address only • No map coordinates provided
            </div>
          )}
        </div>

        {/* Highlights Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.65rem',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '0.8rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '1.1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94a3b8', fontSize: '0.82rem' }}>
            <Users size={14} color="#84cc16" />
            <span><strong>{job.workersRequired}</strong> workers</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94a3b8', fontSize: '0.82rem' }}>
            <Clock size={14} color="#84cc16" />
            <span>{job.durationValue} {job.durationUnit}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94a3b8', fontSize: '0.82rem', gridColumn: 'span 2' }}>
            <Calendar size={14} color="#84cc16" />
            <span>
              Starts {new Date(job.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Wage & View Details Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.9rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.2rem',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem'
            }}
          >
            <IndianRupee size={17} strokeWidth={2.8} color="#10b981" />
            <span>{job.wageAmount}</span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'capitalize' }}>
            per {job.wageType === 'hourly' ? 'hour' : job.wageType === 'fixed' ? 'contract' : 'day'}
          </div>
        </div>

        <Link
          to={`/jobs/${job._id}`}
          className="btn-primary"
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: '0.6rem 1.15rem',
            fontSize: '0.88rem',
            textDecoration: 'none'
          }}
        >
          <span>View Details</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
