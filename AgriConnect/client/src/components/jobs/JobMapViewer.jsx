import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { resolveJobCoordinates } from '../../utils/geolocation';

function createPopupContent(job) {
  const container = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = job.title || `${job.crop || 'Farm'} job`;
  const location = document.createElement('p');
  location.textContent = [job.village, job.district, job.state, job.location].filter(Boolean).join(', ');
  const wage = document.createElement('p');
  wage.textContent = `₹${job.wageAmount || job.wage || '—'} / ${job.wageType || 'day'}`;
  const link = document.createElement('a');
  link.href = `/jobs/${job._id || job.id}`;
  link.textContent = 'View job details';
  container.append(title, location, wage, link);
  return container;
}

export default function JobMapViewer({ jobs = [], userCoords = null, onSelectJob, selectedRadius = 50 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef(null);
  const onSelectJobRef = useRef(onSelectJob);

  useEffect(() => {
    onSelectJobRef.current = onSelectJob;
  }, [onSelectJob]);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const map = L.map(containerRef.current).setView(
      userCoords ? [userCoords.lat, userCoords.lng] : [22.5937, 78.9629],
      userCoords ? 9 : 5
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    const layers = L.layerGroup().addTo(map);
    mapRef.current = map;
    layersRef.current = layers;

    return () => {
      map.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;

    layers.clearLayers();
    const bounds = [];
    let mappedJobCount = 0;

    jobs.forEach((job) => {
      const coords = resolveJobCoordinates(job);
      if (!coords) return;
      const latLng = [coords.lat, coords.lng];
      bounds.push(latLng);
      mappedJobCount += 1;

      const marker = L.marker(latLng, {
        icon: L.divIcon({
          className: 'agriconnect-job-marker',
          html: '<span aria-hidden="true">🌾</span>',
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        })
      }).bindPopup(createPopupContent(job));
      marker.on('click', () => onSelectJobRef.current?.(job));
      marker.addTo(layers);
    });

    if (userCoords) {
      const userLatLng = [userCoords.lat, userCoords.lng];
      bounds.push(userLatLng);
      L.circleMarker(userLatLng, {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#0284c7',
        fillOpacity: 1
      }).bindTooltip('Your location').addTo(layers);
      L.circle(userLatLng, {
        radius: selectedRadius * 1000,
        color: '#10b981',
        weight: 1,
        fillColor: '#10b981',
        fillOpacity: 0.08
      }).addTo(layers);
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 12 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], userCoords ? 10 : 8);
    } else {
      map.setView([22.5937, 78.9629], 5);
    }

    containerRef.current?.setAttribute('aria-label', `Map showing ${mappedJobCount} jobs with known locations`);
  }, [jobs, userCoords, selectedRadius]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '560px',
        width: '100%',
        borderRadius: '1.2rem',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        overflow: 'hidden',
        background: '#e2e8f0'
      }}
    />
  );
}
