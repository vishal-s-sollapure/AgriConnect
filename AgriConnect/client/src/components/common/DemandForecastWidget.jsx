import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sparkles,
  BarChart3,
  Calendar,
  IndianRupee,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calculator,
  ArrowUpRight
} from 'lucide-react';
import aiService from '../../services/aiService';
import { useLanguage } from '../../context/LanguageContext';

export default function DemandForecastWidget({ defaultRegion = 'Karnataka, India' }) {
  const { t } = useLanguage();
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecastError, setForecastError] = useState('');

  // Wage Calculator state
  const [calcCrop, setCalcCrop] = useState('Wheat');
  const [calcWork, setCalcWork] = useState('Harvesting');
  const [prediction, setPrediction] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState('');

  useEffect(() => {
    async function fetchForecast() {
      try {
        const res = await aiService.getDemandForecast(defaultRegion);
        if (res.success && res.data) {
          setForecast(res.data);
        }
      } catch (err) {
        setForecastError(err.message || 'Could not load the seasonal estimate.');
      } finally {
        setLoading(false);
      }
    }
    fetchForecast();
  }, [defaultRegion]);

  useEffect(() => {
    async function calculateWage() {
      setCalcLoading(true);
      setCalcError('');
      try {
        const res = await aiService.getWagePrediction({
          crop: calcCrop,
          workType: calcWork,
          location: defaultRegion
        });
        if (res.success && res.data) {
          setPrediction(res.data);
        }
      } catch (err) {
        setCalcError(err.message || 'Could not load the wage estimate.');
      } finally {
        setCalcLoading(false);
      }
    }
    calculateWage();
  }, [calcCrop, calcWork, defaultRegion]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.2rem',
        marginTop: '1.2rem',
        marginBottom: '1.8rem'
      }}
    >
      {/* 1. Seasonal Demand Forecast Card */}
      <div
        className="glass-panel"
        style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '1.1rem',
          padding: '1.4rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '2.4rem',
                height: '2.4rem',
                borderRadius: '0.65rem',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}
            >
              <TrendingUp size={18} />
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.98rem', fontWeight: 800 }}>
                {t('demand_forecast_title', 'Seasonal Labor Demand Forecast')}
              </h4>
              <span style={{ color: '#94a3b8', fontSize: '0.76rem' }}>
                {forecast ? `${forecast.currentSeason} • ${forecast.currentMonth}` : 'Seasonal estimate'} • {defaultRegion}
              </span>
            </div>
          </div>

          <span
            style={{
              background: 'rgba(132, 204, 22, 0.2)',
              color: '#a3e635',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              border: '1px solid rgba(132, 204, 22, 0.3)'
            }}
          >
            {forecast ? `Calendar index ${forecast.laborDemandIndex}` : 'Calendar estimate'}
          </span>
        </div>

        {/* Demand Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(forecast?.peakDemandCrops || []).map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '0.75rem',
                padding: '0.75rem 0.9rem',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem' }}>
                  🌾 {item.crop}
                </span>
                <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.82rem' }}>
                  {item.typicalWage}
                </span>
              </div>

              {/* Progress bar representing Demand Index */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '9999px',
                  marginTop: '0.5rem',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${item.demandIndex || 85}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981 0%, #84cc16 100%)',
                    borderRadius: '9999px'
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.4rem',
                  fontSize: '0.72rem',
                  color: '#94a3b8'
                }}
              >
                <span>Peak: {item.peakWindow}</span>
                <span style={{ color: '#a3e635', fontWeight: 700 }}>{item.demandIndex}% Demand Index</span>
              </div>
            </div>
          ))}
          {loading && <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Loading seasonal calendar estimate…</p>}
          {!loading && forecastError && <p role="alert" style={{ color: '#fca5a5', fontSize: '0.82rem' }}>{forecastError}</p>}
          {!loading && !forecastError && !forecast && <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Seasonal estimate unavailable.</p>}
        </div>
        {forecast?.forecastNotes && (
          <p style={{ color: '#94a3b8', fontSize: '0.74rem', lineHeight: 1.4, marginTop: '0.8rem' }}>
            {forecast.forecastNotes}
          </p>
        )}
      </div>

      {/* 2. Interactive AI Wage Calculator & Benchmark Card */}
      <div
        className="glass-panel"
        style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(132, 204, 22, 0.25)',
          borderRadius: '1.1rem',
          padding: '1.4rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: '2.4rem',
              height: '2.4rem',
              borderRadius: '0.65rem',
              background: 'rgba(132, 204, 22, 0.15)',
              border: '1px solid rgba(132, 204, 22, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a3e635'
            }}
          >
            <Calculator size={18} />
          </div>
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.98rem', fontWeight: 800 }}>
              {t('wage_calculator_title', 'AI Wage Benchmark Calculator')}
            </h4>
            <span style={{ color: '#94a3b8', fontSize: '0.76rem' }}>
              Real-time fair pricing based on crop labor intensity
            </span>
          </div>
        </div>

        {/* Input Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.9rem' }}>
          <div>
            <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
              Select Crop
            </label>
            <select
              value={calcCrop}
              onChange={(e) => setCalcCrop(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                padding: '0.45rem 0.6rem',
                borderRadius: '0.55rem',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            >
              <option value="Wheat">🌾 Wheat</option>
              <option value="Paddy">🍚 Paddy / Rice</option>
              <option value="Cotton">🌱 Cotton</option>
              <option value="Sugarcane">🎋 Sugarcane</option>
              <option value="Vegetables">🥦 Vegetables</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
              Work Type
            </label>
            <select
              value={calcWork}
              onChange={(e) => setCalcWork(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                padding: '0.45rem 0.6rem',
                borderRadius: '0.55rem',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            >
              <option value="Harvesting">Harvesting</option>
              <option value="Sowing">Sowing</option>
              <option value="Tilling">Tilling</option>
              <option value="Weeding">Weeding</option>
              <option value="Spraying">Spraying</option>
            </select>
          </div>
        </div>

        {/* Prediction Results Display */}
        {calcLoading && <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Calculating wage range…</p>}
        {calcError && <p role="alert" style={{ color: '#fca5a5', fontSize: '0.82rem' }}>{calcError}</p>}
        {prediction && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '0.85rem',
              padding: '0.9rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t('recommended_wage', 'Recommended Daily Wage')}
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399', display: 'flex', alignItems: 'center' }}>
                  ₹{prediction.recommendedWage}
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginLeft: '0.3rem' }}>
                    / estimated day
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Market Range</span>
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 700 }}>
                  ₹{prediction.minWage} - ₹{prediction.maxWage}
                </div>
              </div>
            </div>

            <p style={{ color: '#a7f3d0', fontSize: '0.78rem', marginTop: '0.55rem', lineHeight: '1.4' }}>
              💡 {prediction.advice}
            </p>
          </div>
        )}
        <p style={{ color: '#94a3b8', fontSize: '0.72rem', lineHeight: 1.4, marginTop: '0.7rem' }}>
          Wage values are planning estimates, not guaranteed rates. Confirm locally before posting a job.
        </p>
      </div>
    </div>
  );
}
