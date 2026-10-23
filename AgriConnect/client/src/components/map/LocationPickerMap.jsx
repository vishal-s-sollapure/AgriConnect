import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Search,
  Crosshair,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Navigation,
  HelpCircle
} from 'lucide-react';
import jobService from '../../services/jobService';
import { useLanguage } from '../../context/LanguageContext';

function createDraggableFarmerIcon() {
  const html = `
    <div style="position: relative; width: 38px; height: 46px; cursor: grab;">
      <svg viewBox="0 0 38 46" width="38" height="46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 45C19 45 36 29 36 18C36 8 28.4 0 19 0C9.6 0 2 8 2 18C2 29 19 45 19 45Z" fill="#10b981" stroke="#ffffff" stroke-width="2.5"/>
        <circle cx="19" cy="18" r="9" fill="#070a11"/>
        <path d="M16 22C16 18 20 15 22 14C22 17 19 21 16 22Z" fill="#34d399"/>
        <path d="M19 20C19 17 17 15 15 14.5C15 16.5 17 19 19 20Z" fill="#84cc16"/>
      </svg>
      <div style="
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 14px;
        height: 4px;
        background: rgba(0,0,0,0.4);
        border-radius: 50%;
        filter: blur(1px);
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-farmer-pin',
    html,
    iconSize: [38, 46],
    iconAnchor: [19, 45]
  });
}

export default function LocationPickerMap({
  latitude = null,
  longitude = null,
  onChange = () => {},
  initialSearchQuery = ''
}) {
  const { t } = useLanguage();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [geocoding, setGeocoding] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [geoError, setGeoError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('');

  // Default coordinate: Gujarat center [22.2587, 71.1924]
  const currentLat = latitude !== null && !isNaN(Number(latitude)) ? Number(latitude) : null;
  const currentLng = longitude !== null && !isNaN(Number(longitude)) ? Number(longitude) : null;
  const hasCoords = currentLat !== null && currentLng !== null;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const center = hasCoords ? [currentLat, currentLng] : [22.2587, 71.1924];
      const zoom = hasCoords ? 13 : 7;

      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Handle map click to place/move marker
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const roundedLat = Math.round(lat * 1000000) / 1000000;
        const roundedLng = Math.round(lng * 1000000) / 1000000;
        onChange({
          latitude: roundedLat,
          longitude: roundedLng,
          locationSource: 'map'
        });
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when latitude or longitude changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (hasCoords) {
      if (markerRef.current) {
        markerRef.current.setLatLng([currentLat, currentLng]);
      } else {
        const marker = L.marker([currentLat, currentLng], {
          icon: createDraggableFarmerIcon(),
          draggable: true
        });

        // Drag end updates coordinates
        marker.on('dragend', () => {
          const latlng = marker.getLatLng();
          const rLat = Math.round(latlng.lat * 1000000) / 1000000;
          const rLng = Math.round(latlng.lng * 1000000) / 1000000;
          onChange({
            latitude: rLat,
            longitude: rLng,
            locationSource: 'map'
          });
        });

        marker.addTo(map);
        markerRef.current = marker;
      }

      // Pan to new coordinate
      map.panTo([currentLat, currentLng]);
    } else {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    }
  }, [currentLat, currentLng, hasCoords, onChange]);

  // Geocode Search Execution (explicit user button click)
  const handleGeocodeSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setGeocoding(true);
    setGeoError('');
    setSearchResults([]);

    try {
      const res = await jobService.geocodeLocation(searchQuery.trim());
      if (res && res.success && Array.isArray(res.results) && res.results.length > 0) {
        setSearchResults(res.results);
      } else {
        setGeoError('No location matches found. You can click on the map to set your farm location manually.');
      }
    } catch (err) {
      console.warn('Geocoding error:', err);
      setGeoError('Location search unavailable. You can click anywhere on the map to place the pin directly.');
    } finally {
      setGeocoding(false);
    }
  };

  // User selects candidate from search results
  const handleSelectSearchResult = (candidate) => {
    const rLat = Math.round(candidate.lat * 1000000) / 1000000;
    const rLng = Math.round(candidate.lng * 1000000) / 1000000;

    onChange({
      latitude: rLat,
      longitude: rLng,
      locationSource: 'geocoded',
      village: candidate.village || '',
      district: candidate.district || '',
      state: candidate.state || ''
    });

    setSearchResults([]);
    setSearchQuery(candidate.displayName);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([rLat, rLng], 14);
    }
  };

  // Farmer requests device location (GPS - explicit user click only)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const rLat = Math.round(pos.coords.latitude * 1000000) / 1000000;
        const rLng = Math.round(pos.coords.longitude * 1000000) / 1000000;

        onChange({
          latitude: rLat,
          longitude: rLng,
          locationSource: 'gps'
        });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([rLat, rLng], 14);
        }
        setGpsMessage('Location detected from your device!');
        setTimeout(() => setGpsMessage(''), 4000);
      },
      (err) => {
        setGpsLoading(false);
        let msg = 'Could not acquire location.';
        if (err.code === 1) msg = 'Location permission was denied. You can click the map to place the pin manually.';
        else if (err.code === 2) msg = 'Location unavailable. Please select on the map.';
        else if (err.code === 3) msg = 'Location request timed out. Please select on the map.';
        setGpsMessage(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Clear coordinates
  const handleClear = () => {
    onChange({
      latitude: null,
      longitude: null,
      locationSource: ''
    });
    setSearchResults([]);
    setGpsMessage('');
    setGeoError('');
  };

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={16} color="var(--primary)" />
          Pin Farm Location on Map <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'normal' }}>(Optional)</span>
        </label>
        {hasCoords && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f87171',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={12} />
            Clear Pin
          </button>
        )}
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '0.8rem', lineHeight: 1.4 }}>
        Setting GPS coordinates lets nearby agricultural workers see the approximate distance to your farm. Drag the pin or click on the map to place your farm.
      </p>

      {/* Location Search Bar & GPS button */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleGeocodeSearch(e); }}
            placeholder={t('p8_filter_location', 'Search village, district, or landmark...')}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.2rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          />
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        </div>

        <button
          type="button"
          onClick={handleGeocodeSearch}
          disabled={geocoding || !searchQuery.trim()}
          style={{
            padding: '0.55rem 1rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: searchQuery.trim() ? 'pointer' : 'default',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {geocoding ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          {t('p8_find_location', 'Find')}
        </button>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={gpsLoading}
          title={t('p8_use_location', 'Use current device location')}
          style={{
            padding: '0.55rem 1rem',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {gpsLoading ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
          {t('p8_use_gps', 'Use my GPS')}
        </button>
      </div>

      {/* Geocode Error / Feedback */}
      {geoError && (
        <div style={{ padding: '0.5rem 0.8rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', color: '#fca5a5', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
          {geoError}
        </div>
      )}

      {/* GPS Message */}
      {gpsMessage && (
        <div style={{ padding: '0.5rem 0.8rem', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '6px', color: '#7dd3fc', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
          {gpsMessage}
        </div>
      )}

      {/* Candidate Dropdown List */}
      {searchResults.length > 0 && (
        <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px', marginBottom: '0.8rem', maxHeight: '180px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', padding: '4px 8px', fontWeight: 600 }}>{t('p8_select_location', 'Select a matching location:')}</div>
          {searchResults.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSearchResult(item)}
              aria-label={`${t('p8_select_location', 'Select location')}: ${item.displayName}`}
              style={{
                padding: '6px 8px',
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                border: 0,
                font: 'inherit',
                fontSize: '0.82rem',
                color: 'var(--text-main)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <MapPin size={14} color="#10b981" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.displayName}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '280px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}
      />

      {/* Selected Coordinates Status Bar */}
      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '0.8rem' }}>
        {hasCoords ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 600 }}>
            <CheckCircle2 size={14} />
            <span>Pinned: {currentLat.toFixed(5)}, {currentLng.toFixed(5)}</span>
          </div>
        ) : (
          <div style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
            No GPS pin selected (job will be listed by village/text location only)
          </div>
        )}

        <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
          Tip: Click map or drag marker to reposition
        </div>
      </div>
    </div>
  );
}
