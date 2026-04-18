import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar desktop-only">
      <div className="logo">
        <i className="ph ph-rings"></i> ToyMakon
      </div>
      <nav className="nav-vertical">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <i className="ph ph-house"></i> Bosh sahifa
        </NavLink>
        <NavLink to="/category" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <i className="ph ph-list-magnifying-glass"></i> Katalog
        </NavLink>
        <NavLink to="/favorites" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <i className="ph ph-heart"></i> Sevimlilar
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <i className="ph ph-user"></i> Profil
        </NavLink>
      </nav>
    </aside>
  );
}
