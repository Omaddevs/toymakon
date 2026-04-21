import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import NotificationSheet from '../components/NotificationSheet';
import { useAuth } from './AuthContext';
import { fetchUnreadNotificationCount } from '../utils/notificationsApi';

const NotificationInboxContext = createContext(null);

const POLL_MS = 20000;

export function NotificationInboxProvider({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const showMobileFab = Boolean(user && location.pathname !== '/');
  const [unreadCount, setUnreadCount] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [arrivalToast, setArrivalToast] = useState(false);
  const [highlightNew, setHighlightNew] = useState(false);
  const prevCountRef = useRef(-1);
  const toastTimerRef = useRef(null);
  const pulseTimerRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (pulseTimerRef.current) {
      window.clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = null;
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const n = await fetchUnreadNotificationCount();
    const prev = prevCountRef.current;
    if (prev >= 0 && n > prev) {
      setArrivalToast(true);
      setHighlightNew(true);
      clearTimers();
      toastTimerRef.current = window.setTimeout(() => setArrivalToast(false), 6500);
      pulseTimerRef.current = window.setTimeout(() => setHighlightNew(false), 4000);
    }
    prevCountRef.current = n;
    setUnreadCount(n);
  }, [user, clearTimers]);

  useEffect(() => {
    if (!user) {
      setSheetOpen(false);
      setUnreadCount(0);
      setArrivalToast(false);
      setHighlightNew(false);
      prevCountRef.current = -1;
      clearTimers();
      return;
    }

    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      await refreshUnreadCount();
    };

    tick();
    const id = window.setInterval(tick, POLL_MS);
    const onEvt = () => tick();
    window.addEventListener('toymakon-notifications', onEvt);
    const onVis = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onEvt);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener('toymakon-notifications', onEvt);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onEvt);
    };
  }, [user, refreshUnreadCount]);

  const openInbox = useCallback(() => setSheetOpen(true), []);

  const dismissToast = useCallback(() => {
    setArrivalToast(false);
    clearTimers();
  }, [clearTimers]);

  const openInboxFromToast = useCallback(() => {
    dismissToast();
    setSheetOpen(true);
  }, [dismissToast]);

  const handleSheetClose = useCallback(() => {
    setSheetOpen(false);
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const value = useMemo(
    () => ({
      unreadCount,
      openInbox,
      refreshUnreadCount,
      highlightNew,
    }),
    [unreadCount, openInbox, refreshUnreadCount, highlightNew]
  );

  return (
    <NotificationInboxContext.Provider value={value}>
      {children}

      {showMobileFab ? (
        <button
          type="button"
          className={`notification-fab mobile-only ${highlightNew ? 'is-pulse' : ''} ${
            unreadCount > 0 ? 'has-unread' : ''
          }`}
          onClick={openInbox}
          aria-label={
            unreadCount > 0
              ? `Bildirishnomalar, ${unreadCount} ta o‘qilmagan`
              : 'Bildirishnomalar'
          }
        >
          <i className="ph ph-bell" aria-hidden />
          {unreadCount > 0 ? (
            <span className="notification-fab-badge" aria-hidden>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </button>
      ) : null}

      {arrivalToast && user ? (
        <div className="notification-arrival-toast" role="status" aria-live="polite">
          <div className="notification-arrival-toast-inner">
            <div className="notification-arrival-icon" aria-hidden>
              <i className="ph ph-bell" />
            </div>
            <div className="notification-arrival-text">
              <strong>Yangi bildirishnoma</strong>
              <span>Sizda yangi xabar bor.</span>
            </div>
            <button type="button" className="notification-arrival-btn" onClick={openInboxFromToast}>
              Ko‘rish
            </button>
            <button
              type="button"
              className="notification-arrival-dismiss"
              aria-label="Yopish"
              onClick={dismissToast}
            >
              <i className="ph ph-x" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      <NotificationSheet open={sheetOpen} onClose={handleSheetClose} />
    </NotificationInboxContext.Provider>
  );
}

export function useNotificationInbox() {
  const ctx = useContext(NotificationInboxContext);
  if (!ctx) {
    throw new Error('useNotificationInbox must be used within NotificationInboxProvider');
  }
  return ctx;
}
