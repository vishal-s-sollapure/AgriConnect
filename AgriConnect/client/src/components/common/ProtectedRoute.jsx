import React from 'react';
import { useAgri } from '../../context/AgriContext';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ProtectedRoute({ children, allowedRoles = [], onOpenAuth }) {
  const { t } = useLanguage();
  const { currentUser: agriUser } = useAgri();
  const { currentUser: authUser, loading } = useAuth();

  const user = authUser || agriUser;

  if (loading) {
    return (
      <div style={{
        padding: '5rem 1rem',
        textAlign: 'center',
        color: '#94a3b8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh'
      }}>
        <div style={{
          width: '2.5rem',
          height: '2.5rem',
          border: '3px solid rgba(16, 185, 129, 0.2)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <p style={{ fontWeight: 600 }}>{t('p8_verifying_session', 'Verifying session...')}</p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{
          maxWidth: '480px',
          margin: '0 auto',
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            {t('p8_auth_welcome', 'Authentication required')}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
            {t('p8_auth_login_hint', 'Log in or create an AgriConnect account to access this dashboard.')}
          </p>
          <button
            onClick={() => onOpenAuth && onOpenAuth('login')}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {t('p8_auth_login', 'Log in')} / {t('p8_auth_create', 'Create an account')}
          </button>
        </div>
      </div>
    );
  }

  // Check Role restrictions if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'rgba(15, 23, 42, 0.95)'
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
            margin: '0 auto 1.5rem auto'
          }}>
            <AlertTriangle size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            403 — {t('p8_unauthorized', 'Unauthorized access')}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            {t('p8_role_registered_as', 'Your account is registered as')} <strong style={{ color: '#ffffff' }}>{t(user.role === 'farmer' ? 'role_farmer' : 'role_worker', user.role)}</strong>. {t('p8_no_portal_permission', 'You do not have permission to access this portal.')}
          </p>
        </div>
      </div>
    );
  }

  return children;
}
