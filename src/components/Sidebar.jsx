import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotificationInbox } from '../context/NotificationInboxContext';

export default function Sidebar() {
  const { user } = useAuth();
  const { unreadCount, openInbox, highlightNew } = useNotificationInbox();

  return (
    <aside className="sidebar desktop-only">
      <div className="logo logo--with-wordmark" aria-label="ToyMakon">
        <img src="/logo-rings.png" alt="" className="sidebar-logo sidebar-logo--rings" />
        <span className="sidebar-wordmark">ToyMakon</span>
      </div>
      {user ? (
        <div className="sidebar-notif-row">
          <button
            type="button"
            className={`sidebar-bell-btn ${unreadCount > 0 ? 'has-unread' : ''} ${highlightNew ? 'is-pulse' : ''}`}
            onClick={openInbox}
            aria-label={
              unreadCount > 0
                ? `Bildirishnomalar, ${unreadCount} ta o‘qilmagan`
                : 'Bildirishnomalar'
            }
          >
            <i className="ph ph-bell" aria-hidden />
            <span>Bildirishnomalar</span>
            {unreadCount > 0 ? (
              <span className="sidebar-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            ) : null}
          </button>
        </div>
      ) : null}
      <nav className="nav-vertical">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <i className="ph ph-house"></i> Bosh sahifa
        </NavLink>
        <NavLink to="/category" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <i className="ph ph-list-magnifying-glass"></i> Katalog
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <i className="ph ph-heart"></i> Sevimlilar
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <i className="ph ph-user"></i> Profil
        </NavLink>
      </nav>
    </aside>
  );
}
