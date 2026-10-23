import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, ChevronDown, Loader2, Trash2, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import notificationService from '../../services/notificationService';

function formatRelativeTime(value, locale) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return '';
  const elapsedSeconds = Math.round((timestamp - Date.now()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60]
  ];
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, seconds] of units) {
    if (Math.abs(elapsedSeconds) >= seconds) {
      return formatter.format(Math.round(elapsedSeconds / seconds), unit);
    }
  }
  return formatter.format(elapsedSeconds, 'second');
}

export default function NotificationCenter({ user }) {
  const { language, t } = useLanguage();
  const translateRef = useRef(t);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const countPending = useRef(null);
  const listPending = useRef(null);
  const userId = String(user?._id || user?.id || '');
  const currentUserId = useRef(userId);
  currentUserId.current = userId;
  const isAuthenticated = Boolean(userId);

  useEffect(() => {
    translateRef.current = t;
  }, [t]);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated || countPending.current === userId) return;
    countPending.current = userId;
    try {
      const result = await notificationService.getUnreadCount();
      if (currentUserId.current === userId) setUnreadCount(result.count);
    } catch (requestError) {
      console.warn('Unread notifications could not be refreshed:', requestError.message);
    } finally {
      if (countPending.current === userId) countPending.current = null;
    }
  }, [isAuthenticated, userId]);

  const fetchNotifications = useCallback(async (page = 1, append = false) => {
    if (!isAuthenticated || listPending.current === userId) return;
    listPending.current = userId;
    setLoading(true);
    setError('');
    try {
      const result = await notificationService.getNotifications({ page, limit: 8 });
      if (currentUserId.current === userId) {
        setNotifications(current => append ? [...current, ...result.notifications] : result.notifications);
        setPagination(result.pagination);
      }
    } catch (requestError) {
      console.error('Notifications could not be loaded:', requestError.message);
      if (currentUserId.current === userId) {
        setError(translateRef.current('notification_load_error', 'Could not load notifications.'));
      }
    } finally {
      if (currentUserId.current === userId) setLoading(false);
      if (listPending.current === userId) listPending.current = null;
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    setNotifications([]);
    setUnreadCount(0);
    setPagination({ page: 1, totalPages: 1 });
    setError('');
  }, [userId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setNotifications([]);
      setOpen(false);
      return undefined;
    }
    refreshUnreadCount();
    const interval = window.setInterval(refreshUnreadCount, 60000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, refreshUnreadCount]);

  useEffect(() => {
    if (open) {
      fetchNotifications(1);
      refreshUnreadCount();
    }
  }, [open, fetchNotifications, refreshUnreadCount]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    panelRef.current?.querySelector('button:not(:disabled)')?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const markRead = async (notification) => {
    if (notification.readAt) return;
    const requestedUserId = userId;
    try {
      const result = await notificationService.markRead(notification._id);
      if (currentUserId.current !== requestedUserId) return;
      setNotifications(current => current.map(item => item._id === notification._id ? result.notification : item));
      setUnreadCount(count => Math.max(0, count - 1));
      setError('');
    } catch (requestError) {
      console.error('Notification could not be marked as read:', requestError.message);
      setError(t('notification_action_error', 'Could not update this notification. Try again.'));
    }
  };

  const openNotification = async (notification) => {
    const requestedUserId = userId;
    await markRead(notification);
    if (currentUserId.current !== requestedUserId) return;
    const jobId = notification.data?.jobId;
    if (jobId) {
      const farmerEvent = ['new_application', 'application_withdrawn'].includes(notification.type);
      navigate(farmerEvent ? `/farmer/jobs/${jobId}/applicants` : '/worker/applications');
    }
    setOpen(false);
  };

  const markAllRead = async () => {
    const requestedUserId = userId;
    try {
      await notificationService.markAllRead();
      if (currentUserId.current !== requestedUserId) return;
      setNotifications(current => current.map(item => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
      setUnreadCount(0);
      setError('');
    } catch (requestError) {
      console.error('Notifications could not be marked as read:', requestError.message);
      setError(t('notification_action_error', 'Could not update notifications. Try again.'));
    }
  };

  const deleteNotification = async (id) => {
    const requestedUserId = userId;
    const target = notifications.find(item => item._id === id);
    try {
      await notificationService.delete(id);
      if (currentUserId.current !== requestedUserId) return;
      setNotifications(current => current.filter(item => item._id !== id));
      if (target && !target.readAt) setUnreadCount(count => Math.max(0, count - 1));
      setError('');
    } catch (requestError) {
      console.error('Notification could not be deleted:', requestError.message);
      setError(t('notification_action_error', 'Could not delete this notification. Try again.'));
    }
  };

  const closePanel = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  if (!isAuthenticated) return null;

  const title = (notification) => t(notification.titleKey, t('notification_generic_title', 'Notification'));
  const message = (notification) => t(notification.messageKey, t('notification_generic_message', 'There is an update about your job.'), {
    jobTitle: notification.data?.jobTitle || t('notification_this_job', 'this job')
  });
  const locale = ({ en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN' })[language] || language;

  return (
    <div style={{ position: 'relative', zIndex: 70 }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-label={`${t('notification_center', 'Notifications')}${unreadCount ? `, ${unreadCount} ${t('notification_unread', 'unread')}` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? 'notification-panel' : undefined}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.75rem',
          height: '2.75rem',
          borderRadius: '50%',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#a7f3d0',
          cursor: 'pointer'
        }}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-0.2rem',
            right: '-0.3rem',
            minWidth: '1.2rem',
            height: '1.2rem',
            padding: '0 0.25rem',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '999px',
            background: '#ef4444',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: 800
          }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <section
          id="notification-panel"
          ref={panelRef}
          role="dialog"
          aria-label={t('notification_center', 'Notifications')}
          style={{
            position: 'absolute',
            right: 0,
            top: '3.25rem',
            width: 'min(24rem, calc(100vw - 2rem))',
            maxHeight: 'min(75vh, 38rem)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: '#0f172a',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '1rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}
        >
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <h2 style={{ fontSize: '1rem', color: '#fff' }}>{t('notification_center', 'Notifications')}</h2>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{t('notification_unread_count', '{{count}} unread', { count: unreadCount })}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button type="button" onClick={markAllRead} disabled={!unreadCount} aria-label={t('notification_mark_all_read', 'Mark all as read')} title={t('notification_mark_all_read', 'Mark all as read')} style={iconButtonStyle}>
                <CheckCheck size={17} />
              </button>
              <button type="button" onClick={closePanel} aria-label={t('p8_close', 'Close')} style={iconButtonStyle}>
                <X size={17} />
              </button>
            </div>
          </header>

          {error && (
            <div role="alert" style={{ padding: '0.75rem 1rem', color: '#fecaca', fontSize: '0.84rem' }}>
              {error}
              <button type="button" onClick={() => fetchNotifications(1)} style={{ ...textButtonStyle, display: 'block', marginTop: '0.4rem' }}>{t('notification_retry', 'Retry')}</button>
            </div>
          )}

          <div aria-live="polite" style={{ overflowY: 'auto', minHeight: '4rem' }}>
            {loading && notifications.length === 0 && <div style={statusStyle}><Loader2 className="animate-spin" size={20} /> {t('notification_loading', 'Loading notifications...')}</div>}
            {!loading && !error && notifications.length === 0 && <div style={statusStyle}>{t('notification_empty', 'You have no notifications yet.')}</div>}
            {notifications.map(notification => (
              <article key={notification._id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '0.5rem',
                padding: '0.85rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: notification.readAt ? 'transparent' : 'rgba(16,185,129,0.08)'
              }}>
                <button type="button" onClick={() => openNotification(notification)} style={{ ...textButtonStyle, textAlign: 'left' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 750, color: '#f8fafc', fontSize: '0.88rem' }}>
                    {!notification.readAt && <span role="img" aria-label={t('notification_unread', 'Unread')} style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />}
                    {title(notification)}
                  </span>
                  <span style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.4, marginTop: '0.3rem' }}>{message(notification)}</span>
                  <time dateTime={notification.createdAt} style={{ display: 'block', color: '#94a3b8', fontSize: '0.73rem', marginTop: '0.4rem' }}>
                    {formatRelativeTime(notification.createdAt, locale)}
                  </time>
                </button>
                {!notification.readAt && (
                  <button type="button" onClick={() => markRead(notification)} aria-label={t('notification_mark_read', 'Mark as read')} title={t('notification_mark_read', 'Mark as read')} style={{ ...iconButtonStyle, alignSelf: 'start' }}>
                    <Check size={15} />
                  </button>
                )}
                <button type="button" onClick={() => deleteNotification(notification._id)} aria-label={t('notification_delete', 'Delete notification')} title={t('notification_delete', 'Delete notification')} style={{ ...iconButtonStyle, alignSelf: 'start' }}>
                  <Trash2 size={15} />
                </button>
              </article>
            ))}
          </div>

          {pagination.page < pagination.totalPages && (
            <button
              type="button"
              disabled={loading}
              onClick={() => fetchNotifications(pagination.page + 1, true)}
              style={{ ...textButtonStyle, padding: '0.8rem', color: '#6ee7b7', borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              {loading ? t('notification_loading', 'Loading...') : t('notification_load_more', 'Load more')}
              <ChevronDown size={15} style={{ verticalAlign: 'middle', marginLeft: 5 }} />
            </button>
          )}
        </section>
      )}
    </div>
  );
}

const iconButtonStyle = {
  display: 'inline-grid',
  placeItems: 'center',
  width: '2.2rem',
  height: '2.2rem',
  background: 'transparent',
  color: '#cbd5e1',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '0.55rem',
  cursor: 'pointer'
};

const textButtonStyle = {
  background: 'transparent',
  border: 0,
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer'
};

const statusStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.55rem',
  minHeight: '5rem',
  padding: '1rem',
  color: '#cbd5e1',
  textAlign: 'center',
  fontSize: '0.86rem'
};
