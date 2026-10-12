import React, { useState, useEffect, useTransition, useCallback } from 'react';
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
  Sparkles
} from 'lucide-react';
import jobService from '../../services/jobService';

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

export default function JobDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-driven query states
  const initialSearch = searchParams.get('search') || '';
  const initialCrop = searchParams.get('crop') || '';
  const initialWorkType = searchParams.get('workType') || '';
  const initialLocation = searchParams.get('location') || '';
  const initialWageType = searchParams.get('wageType') || '';
  const initialMinWage = searchParams.get('minWage') || '';
  const initialMaxWage = searchParams.get('maxWage') || '';
  const initialStartDate = searchParams.get('startDate') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [crop, setCrop] = useState(initialCrop);
  const [workType, setWorkType] = useState(initialWorkType);
  const [location, setLocation] = useState(initialLocation);
  const [wageType, setWageType] = useState(initialWageType);
  const [minWage, setMinWage] = useState(initialMinWage);
  const [maxWage, setMaxWage] = useState(initialMaxWage);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [page, setPage] = useState(initialPage);

  // Mobile / Collapsible filters drawer
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    if (wageType) params.wageType = wageType;
    if (minWage) params.minWage = minWage;
    if (maxWage) params.maxWage = maxWage;
    if (startDate) params.startDate = startDate;
    if (page > 1) params.page = String(page);

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, crop, workType, location, wageType, minWage, maxWage, startDate, page, setSearchParams]);

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
      if (wageType.trim()) params.wageType = wageType.trim();
      if (minWage && !isNaN(Number(minWage))) params.minWage = Number(minWage);
      if (maxWage && !isNaN(Number(maxWage))) params.maxWage = Number(maxWage);
      if (startDate.trim()) params.startDate = startDate.trim();

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
  }, [debouncedSearch, crop, workType, location, wageType, minWage, maxWage, startDate, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

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
    setWageType('');
    setMinWage('');
    setMaxWage('');
    setStartDate('');
    setPage(1);
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = Boolean(
    searchTerm || crop || workType || location || wageType || minWage || maxWage || startDate
  );

  return (
    <div style={{ padding: '2.5rem 0 5rem 0', minHeight: '85vh' }}>
      <div className="container">
        {/* Page Hero Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }} className="feature-badge">
            <Sparkles size={16} />
            <span>AGRICULTURAL JOB MARKETPLACE</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Discover Open <span className="gradient-text">Farm Jobs</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '650px', marginTop: '0.4rem', lineHeight: 1.6 }}>
            Connect directly with verified farmers. Search harvest, sowing, and cultivation opportunities with fair, transparent daily wages.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          {/* Top Row: Search Input + Filter Toggle */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{
              flex: '1 1 320px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                placeholder="Search by job title, crop, farm location, or keywords..."
                aria-label="Search open jobs"
                style={{
                  width: '100%',
                  padding: '0.85rem 2.8rem 0.85rem 2.8rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '0.85rem',
                  color: '#ffffff',
                  fontSize: '0.96rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
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
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Location quick filter */}
            <div style={{
              flex: '1 1 200px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <MapPin
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={location}
                onChange={(e) => handleFilterChange(setLocation, e.target.value)}
                placeholder="Village / District / State"
                aria-label="Filter by location"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.8rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '0.85rem',
                  color: '#ffffff',
                  fontSize: '0.96rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Toggle advanced filters */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="btn-secondary"
              style={{
                padding: '0.85rem 1.4rem',
                fontSize: '0.92rem',
                borderColor: hasActiveFilters ? 'var(--primary)' : 'rgba(255, 255, 255, 0.18)'
              }}
            >
              <SlidersHorizontal size={16} />
              <span>{filtersOpen ? 'Hide Filters' : 'Filters'}</span>
              {hasActiveFilters && (
                <span style={{
                  background: 'var(--primary)',
                  color: '#070a11',
                  borderRadius: '9999px',
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  marginLeft: '0.2rem'
                }}>Active</span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f87171',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.5rem 0.8rem'
                }}
              >
                <RotateCcw size={14} />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* Expandable Filters Section */}
          {filtersOpen && (
            <div style={{
              marginTop: '1.4rem',
              paddingTop: '1.4rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem'
            }}>
              {/* Crop Filter */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Crop Type
                </label>
                <select
                  value={crop}
                  onChange={(e) => handleFilterChange(setCrop, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.7rem',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="">All Crops</option>
                  {COMMON_CROPS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Work Type Filter */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Work Type
                </label>
                <select
                  value={workType}
                  onChange={(e) => handleFilterChange(setWorkType, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.7rem',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="">All Work Types</option>
                  {WORK_TYPES.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              {/* Wage Type */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Wage Type
                </label>
                <select
                  value={wageType}
                  onChange={(e) => handleFilterChange(setWageType, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.7rem',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="">Any Wage Type</option>
                  <option value="daily">Daily Wage</option>
                  <option value="hourly">Hourly Wage</option>
                  <option value="fixed">Fixed Contract</option>
                </select>
              </div>

              {/* Min Wage */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
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
                    padding: '0.75rem 0.9rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.7rem',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Max Wage */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
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
                    padding: '0.75rem 0.9rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.7rem',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Start Date */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Available From
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '0.7rem',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Info Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          color: '#94a3b8',
          fontSize: '0.92rem'
        }}>
          <div>
            Showing <strong style={{ color: '#ffffff' }}>{jobs.length}</strong> of{' '}
            <strong style={{ color: '#ffffff' }}>{pagination.total}</strong> open jobs
          </div>
          {pagination.totalPages > 1 && (
            <div>Page {pagination.page} of {pagination.totalPages}</div>
          )}
        </div>

        {/* Loading State / Skeletons */}
        {loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '1.6rem'
          }}>
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '1.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  minHeight: '260px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: '40%', height: '1.2rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '0.4rem' }}></div>
                  <div style={{ width: '25%', height: '1.2rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '0.4rem' }}></div>
                </div>
                <div style={{ width: '85%', height: '1.6rem', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '0.4rem' }}></div>
                <div style={{ width: '60%', height: '1rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '0.4rem' }}></div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '45%', height: '1.8rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.4rem' }}></div>
                  <div style={{ width: '35%', height: '2.2rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '9999px' }}></div>
                </div>
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
          <div className="glass-panel" style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '560px',
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
              <Briefcase size={34} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              No Open Jobs Found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              {hasActiveFilters
                ? 'No farm jobs match your selected search criteria. Try removing or adjusting filters to see more results.'
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

        {/* Jobs Grid */}
        {!loading && !error && jobs.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.6rem',
            marginBottom: '3rem'
          }}>
            {jobs.map((job) => (
              <div
                key={job._id}
                className="glass-panel"
                style={{
                  padding: '1.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Top Badges */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      <Sprout size={13} />
                      <span>{job.crop}</span>
                    </span>

                    <span style={{
                      background: 'rgba(148, 163, 184, 0.12)',
                      color: '#cbd5e1',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      {job.workType}
                    </span>
                  </div>

                  {/* Job Title */}
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '0.75rem',
                    lineHeight: 1.35
                  }}>
                    {job.title}
                  </h3>

                  {/* Location & Farmer Profile */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    color: '#94a3b8',
                    fontSize: '0.88rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <MapPin size={15} color="#10b981" />
                      <span>
                        {job.village ? `${job.village}, ` : ''}
                        {job.district ? `${job.district}, ` : ''}
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
                  </div>

                  {/* Highlights Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '0.9rem',
                    borderRadius: '0.85rem',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                      <Users size={15} color="#84cc16" />
                      <span><strong>{job.workersRequired}</strong> workers</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                      <Clock size={15} color="#84cc16" />
                      <span>{job.durationValue} {job.durationUnit}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', gridColumn: 'span 2' }}>
                      <Calendar size={15} color="#84cc16" />
                      <span>
                        Starts {new Date(job.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: Wage & View Details Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.2rem',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '1.35rem'
                    }}>
                      <IndianRupee size={18} strokeWidth={2.8} color="#10b981" />
                      <span>{job.wageAmount}</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'capitalize' }}>
                      per {job.wageType === 'hourly' ? 'hour' : job.wageType === 'fixed' ? 'contract' : 'day'}
                    </div>
                  </div>

                  <Link
                    to={`/jobs/${job._id}`}
                    className="btn-primary"
                    style={{
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.9rem',
                      textDecoration: 'none'
                    }}
                  >
                    <span>View Details</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.6rem',
            marginTop: '2rem'
          }}>
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
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.6rem',
                        background: page === p ? 'var(--primary)' : 'rgba(15, 23, 42, 0.8)',
                        color: page === p ? '#070a11' : '#ffffff',
                        border: `1px solid ${page === p ? 'var(--primary)' : 'rgba(255, 255, 255, 0.12)'}`,
                        fontWeight: 700,
                        fontSize: '0.9rem',
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
