import { useCallback, useEffect, useState } from 'react';
import {
  deleteNotification,
  fetchNotifications,
  markNotificationRead,
} from '../utils/notificationsApi';

function formatWhen(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function notifyGlobalRefresh() {
  window.dispatchEvent(new CustomEvent('toymakon-notifications'));
}

export default function NotificationSheet({ open, onClose }) {
  const [tab, setTab] = useState('unread');
  const [unread, setUnread] = useState([]);
  const [read, setRead] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  /** Shu sessiyada ochib ko‘rilgan o‘qilmagan id lar — faqat «Yopish» bosilganda serverga yuboriladi */
  const [pendingReadIds, setPendingReadIds] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [applyReadLoading, setApplyReadLoading] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        fetchNotifications('unread'),
        fetchNotifications('read'),
      ]);
      setUnread(Array.isArray(u) ? u : []);
      setRead(Array.isArray(r) ? r : []);
    } catch {
      setError('Yuklab bo‘lmadi. Qayta urinib ko‘ring.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    load();
    setExpandedId(null);
    setDeleteId(null);
    setPendingReadIds([]);
  }, [open, load]);

  /** Fon / X: yopish, o‘qilgan deb belgilamaydi */
  const dismissWithoutMarking = () => {
    setExpandedId(null);
    setDeleteId(null);
    setPendingReadIds([]);
    onClose?.();
  };

  /** Pastdagi «Yopish»: ochilgan o‘qilmaganlar uchun mark-read, keyin yopish */
  const closeWithMarkRead = async () => {
    if (pendingReadIds.length === 0) {
      dismissWithoutMarking();
      return;
    }
    setApplyReadLoading(true);
    setError('');
    try {
      const results = await Promise.all(pendingReadIds.map((id) => markNotificationRead(id)));
      const ids = new Set(pendingReadIds);
      setUnread((list) => list.filter((x) => !ids.has(x.id)));
      setRead((list) => {
        const rest = list.filter((x) => !ids.has(x.id));
        const added = results.filter(Boolean);
        return [...added, ...rest];
      });
      notifyGlobalRefresh();
      setPendingReadIds([]);
      setExpandedId(null);
      onClose?.();
    } catch {
      setError('O‘qilgan deb saqlab bo‘lmadi.');
    } finally {
      setApplyReadLoading(false);
    }
  };

  const toggleExpand = (item) => {
    const id = item.id;
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

    if (tab === 'unread' && !item.is_read) {
      setPendingReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    try {
      await deleteNotification(deleteId);
      setRead((list) => list.filter((x) => x.id !== deleteId));
      setDeleteId(null);
      notifyGlobalRefresh();
    } catch (e) {
      setError(e?.message === 'delete_failed' ? 'O‘chirib bo‘lmadi.' : 'O‘chirib bo‘lmadi.');
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  const list = tab === 'unread' ? unread : read;

  return (
    <>
      <div className="share-backdrop" onClick={dismissWithoutMarking} role="presentation" aria-hidden />

      <div
        className="auth-gate-sheet notification-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-sheet-title"
      >
        <div className="share-sheet-handle" aria-hidden />

        <div className="notification-sheet-head">
          <h2 id="notification-sheet-title" className="notification-sheet-title">
            Bildirishnomalar
          </h2>
          <button
            type="button"
            className="notification-sheet-close"
            aria-label="Yopish (o‘qilganlar saqlanmaydi)"
            onClick={dismissWithoutMarking}
          >
            <i className="ph ph-x" aria-hidden />
          </button>
        </div>

        <div className="notification-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'unread'}
            className={`notification-tab ${tab === 'unread' ? 'is-active' : ''}`}
            onClick={() => {
              setTab('unread');
              setExpandedId(null);
            }}
          >
            O‘qilmagan
            {unread.length > 0 ? (
              <span className="notification-tab-badge">{unread.length > 99 ? '99+' : unread.length}</span>
            ) : null}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'read'}
            className={`notification-tab ${tab === 'read' ? 'is-active' : ''}`}
            onClick={() => {
              setTab('read');
              setExpandedId(null);
            }}
          >
            O‘qilgan
          </button>
        </div>

        {error ? (
          <div className="notification-inline-error" role="alert">
            <i className="ph ph-warning-circle" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="notification-list-wrap">
          {loading ? (
            <p className="notification-empty">Yuklanmoqda…</p>
          ) : list.length === 0 ? (
            <div className="notification-empty-state">
              <div className="notification-empty-icon" aria-hidden>
                <i className="ph ph-bell-slash" />
              </div>
              <p className="notification-empty-title">
                {tab === 'unread' ? 'Yangi bildirishnoma yo‘q' : 'O‘qilgan xabarlar yo‘q'}
              </p>
              <p className="notification-empty-sub">
                {tab === 'unread'
                  ? 'Admin yuborgan xabarlar shu yerda chiqadi.'
                  : 'O‘qilgan xabarlarni bu yerda boshqarasiz.'}
              </p>
            </div>
          ) : (
            <ul className="notification-list">
              {list.map((item) => {
                const isOpen = expandedId === item.id;
                return (
                  <li key={item.id} className={`notification-item ${isOpen ? 'is-open' : ''}`}>
                    <div className="notification-item-top">
                      <button
                        type="button"
                        className="notification-item-main"
                        onClick={() => toggleExpand(item)}
                        disabled={applyReadLoading}
                      >
                        <span
                          className={`notification-dot ${tab === 'unread' && !item.is_read ? 'is-unread' : ''}`}
                          aria-hidden
                        />
                        <span className="notification-item-text">
                          <span className="notification-item-title">{item.title}</span>
                          <span className="notification-item-when">{formatWhen(item.created_at)}</span>
                        </span>
                        <i
                          className={`ph notification-chevron ${isOpen ? 'ph-caret-up' : 'ph-caret-down'}`}
                          aria-hidden
                        />
                      </button>
                      {tab === 'read' ? (
                        <button
                          type="button"
                          className="notification-delete-btn"
                          aria-label="O‘chirish"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(item.id);
                          }}
                        >
                          <i className="ph ph-trash" aria-hidden />
                        </button>
                      ) : null}
                    </div>
                    {isOpen ? (
                      <div className="notification-item-body">
                        <p className="notification-body-text">{item.body}</p>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <button
          type="button"
          className="share-sheet-cancel"
          disabled={applyReadLoading}
          onClick={closeWithMarkRead}
        >
          {applyReadLoading ? 'Saqlanmoqda…' : 'Yopish'}
        </button>
      </div>

      {deleteId != null ? (
        <>
          <div
            className="notification-confirm-backdrop"
            onClick={() => !deleting && setDeleteId(null)}
            role="presentation"
            aria-hidden
          />
          <div className="notification-confirm-dialog" role="alertdialog" aria-labelledby="notif-del-title">
            <div className="notification-confirm-icon" aria-hidden>
              <i className="ph ph-trash" />
            </div>
            <h3 id="notif-del-title" className="notification-confirm-title">
              Xabarni o‘chirasizmi?
            </h3>
            <p className="notification-confirm-text">Bu bildirishnoma ro‘yxatingizdan olib tashlanadi.</p>
            <div className="notification-confirm-actions">
              <button
                type="button"
                className="notification-confirm-btn notification-confirm-btn--ghost"
                disabled={deleting}
                onClick={() => setDeleteId(null)}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                className="notification-confirm-btn notification-confirm-btn--danger"
                disabled={deleting}
                onClick={confirmDelete}
              >
                {deleting ? 'O‘chirilmoqda…' : 'O‘chirish'}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
