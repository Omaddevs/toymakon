import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  return (
    <nav className="bottom-nav mobile-only">
      <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
        <i className="ph ph-house"></i><span>Bosh sahifa</span>
      </NavLink>
      <NavLink to="/search" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
        <i className="ph ph-map-pin"></i><span>Karta</span>
      </NavLink>
      <NavLink to="/category" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
        <i className="ph ph-squares-four"></i><span>Katalog</span>
      </NavLink>
      <NavLink to="/favorites" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
        <i className="ph ph-heart"></i><span>Sevimlilar</span>
      </NavLink>
      <NavLink to="/profile" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
        <i className="ph ph-user"></i><span>Profil</span>
      </NavLink>
    </nav>
  );
}
