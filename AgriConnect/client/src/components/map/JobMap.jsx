import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  ExternalLink,
  IndianRupee,
  Calendar,
  Layers,
  Crosshair,
  Info,
  Maximize2
} from 'lucide-react';

/**
 * Creates custom SVG DivIcons for Leaflet to eliminate bundler 404 asset bugs
 */
function createJobIcon(crop = 'Farm Work', isSelected = false) {
  const bg = isSelected ? '#059669' : '#10b981';
  const border = isSelected ? '#ffffff' : '#064e3b';
  const scale = isSelected ? 1.2 : 1.0;

  const html = `
    <div style="
      position: relative;
      width: 36px;
      height: 44px;
      transform: scale(${scale});
      transition: all 0.2s ease;
      cursor: pointer;
    ">
      <svg viewBox="0 0 36 44" width="36" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 43C18 43 34 27.5 34 17C34 7.6 26.8 0 18 0C9.2 0 2 7.6 2 17C2 27.5 18 43 18 43Z" fill="${bg}" stroke="${border}" stroke-width="2"/>
        <circle cx="18" cy="17" r="9" fill="#070a11"/>
        <path d="M15 21C15 17 19 14 21 13C21 16 18 20 15 21Z" fill="#34d399"/>
        <path d="M18 19C18 16 16 14 14 13.5C14 15.5 16 18 18 19Z" fill="#84cc16"/>
      </svg>
      ${isSelected ? `<div style="
        position: absolute;
        top: -6px;
        right: -6px;
        width: 12px;
        height: 12px;
        background: #38bdf8;
        border: 2px solid #ffffff;
        border-radius: 50%;
      "></div>` : ''}
    </div>
  `;

  return L.divIcon({
    className: 'custom-map-pin' + (isSelected ? ' active' : ''),
    html,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -42]
  });
}

function createWorkerIcon() {
  const html = `
    <div style="position: relative; width: 24px; height: 24px;">
      <div class="worker-pulse-marker"></div>
    </div>
  `;
  return L.divIcon({
    className: 'worker-location-pin',
    html,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

export default function JobMap({
  jobs = [],
  selectedJobId = null,
  onSelectJob = () => {},
  workerLocation = null,
  radiusKm = null,
  height = '500px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const circleLayerRef = useRef(null);

  const [activePopupJob, setActivePopupJob] = useState(null);

  // Filter only jobs that have valid coordinates
  const mappedJobs = jobs.filter(
    j =>
      j.latitude !== null &&
      j.latitude !== undefined &&
      !isNaN(j.latitude) &&
      j.longitude !== null &&
      j.longitude !== undefined &&
      !isNaN(j.longitude) &&
      j.latitude >= -90 &&
      j.latitude <= 90 &&
      j.longitude >= -180 &&
      j.longitude <= 180
  );

  const unmappedCount = jobs.length - mappedJobs.length;

  // Initialize Leaflet Map (Safe against React StrictMode double-mounting)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: India (approx. 20.5937, 78.9629)
      const defaultCenter = [22.2587, 71.1924]; // Gujarat center
      const defaultZoom = 7;

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: true,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      circleLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers and Radius Circle when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !circleLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    circleLayerRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    // 1. Plot worker location if active
    if (
      workerLocation &&
      typeof workerLocation.lat === 'number' &&
      typeof workerLocation.lng === 'number'
    ) {
      const workerMarker = L.marker([workerLocation.lat, workerLocation.lng], {
        icon: createWorkerIcon(),
        zIndexOffset: 1000
      }).bindPopup(
        `<div style="font-weight:700; color:#3b82f6; font-size:0.85rem;">📍 Your Location</div>`
      );
      markersLayerRef.current.addLayer(workerMarker);
      bounds.extend([workerLocation.lat, workerLocation.lng]);

      // Radius circle
      if (radiusKm && !isNaN(Number(radiusKm))) {
        const circle = L.circle([workerLocation.lat, workerLocation.lng], {
          radius: Number(radiusKm) * 1000,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4, 6'
        });
        circleLayerRef.current.addLayer(circle);
      }
    }

    // 2. Plot Job Markers
    mappedJobs.forEach(job => {
      const isSelected = selectedJobId && String(job._id) === String(selectedJobId);
      const icon = createJobIcon(job.crop, isSelected);

      const marker = L.marker([job.latitude, job.longitude], {
        icon,
        title: job.title
      });

      // Marker click handler
      marker.on('click', () => {
        onSelectJob(job);
        setActivePopupJob(job);
      });

      // Popup Content
      const popupHtml = `
        <div style="min-width: 220px; max-width: 280px; font-family: inherit;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
            <span style="font-size: 0.72rem; font-weight:700; background:rgba(16,185,129,0.2); color:#34d399; padding:2px 8px; border-radius:99px; text-transform:uppercase;">
              ${job.crop || 'Agriculture'}
            </span>
            ${job.distance ? `
              <span style="font-size: 0.72rem; font-weight:600; color:#38bdf8; background:rgba(56,189,248,0.15); padding:2px 6px; border-radius:99px;">
                ${job.distance}
              </span>
            ` : ''}
          </div>
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin-bottom: 6px; line-height: 1.3;">
            ${job.title}
          </h4>
          <div style="font-size: 0.82rem; color: #cbd5e1; margin-bottom: 4px; display:flex; align-items:center; gap:4px;">
            <span>📍 ${[job.village, job.district, job.state].filter(Boolean).join(', ') || job.location}</span>
          </div>
          <div style="font-size: 0.9rem; font-weight: 700; color: #10b981; margin-bottom: 10px;">
            ₹${job.wageAmount} <span style="font-size:0.75rem; font-weight:normal; color:#94a3b8;">/ ${job.wageType}</span>
          </div>
          <a href="/jobs/${job._id}" style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            width: 100%;
            background: #10b981;
            color: #070a11;
            font-size: 0.8rem;
            font-weight: 700;
            padding: 7px 12px;
            border-radius: 8px;
            text-decoration: none;
          ">
            View Job Details &rarr;
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayerRef.current.addLayer(marker);
      bounds.extend([job.latitude, job.longitude]);
    });

    // Fit map bounds if markers are present
    if (bounds.isValid() && (mappedJobs.length > 0 || workerLocation)) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    // Invalidate size to ensure clean rendering after mounting or resizing
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
  }, [mappedJobs, selectedJobId, workerLocation, radiusKm]);

  // Button to fit bounds to visible markers
  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds = L.latLngBounds([]);

    if (workerLocation && typeof workerLocation.lat === 'number') {
      bounds.extend([workerLocation.lat, workerLocation.lng]);
    }
    mappedJobs.forEach(j => bounds.extend([j.latitude, j.longitude]));

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      {/* Map DOM Element */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '1.25rem',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(0,0,0,0.45)'
        }}
      />

      {/* Floating Control: Fit Bounds */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 400,
          display: 'flex',
          gap: '8px'
        }}
      >
        <button
          onClick={handleFitBounds}
          title="Fit map to visible jobs"
          className="glass-panel"
          style={{
            padding: '7px 12px',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'var(--text-main)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Maximize2 size={14} />
          Fit Jobs
        </button>
      </div>

      {/* Informative Map Badge Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 400,
          maxWidth: '85%'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(10px)',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
          <span>
            <strong>{mappedJobs.length}</strong> jobs on map
            {unmappedCount > 0 && ` (${unmappedCount} text-only jobs in list view)`}
          </span>
        </div>
      </div>

      {/* Empty State Overlay if no jobs have coordinates */}
      {mappedJobs.length === 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 350,
            background: 'rgba(7, 10, 17, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '1.25rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: 'var(--primary)'
            }}
          >
            <MapPin size={26} />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            No Geocoded Jobs in Current Filter
          </h4>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', maxWidth: '380px', lineHeight: 1.5 }}>
            None of the jobs matching your search currently have GPS coordinates. Check the list view below to see all text-located farm openings.
          </p>
        </div>
      )}
    </div>
  );
}
