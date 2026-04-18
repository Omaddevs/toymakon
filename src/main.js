const renderSidebar = () => `
  <aside class="sidebar desktop-only">
    <div class="logo">
      <i class="ph ph-rings"></i> ToyMakon
    </div>
    <nav class="nav-vertical">
      <a href="/index.html" class="nav-item ${location.pathname==='/' || location.pathname==='/index.html' ? 'active':''}"><i class="ph ph-house"></i> Bosh sahifa</a>
      <a href="/category.html" class="nav-item ${location.pathname==='/category.html' ? 'active':''}"><i class="ph ph-list-magnifying-glass"></i> Katalog</a>
      <a href="/favorites.html" class="nav-item ${location.pathname==='/favorites.html' ? 'active':''}"><i class="ph ph-heart"></i> Sevimlilar</a>
      <a href="/profile.html" class="nav-item ${location.pathname==='/profile.html' ? 'active':''}"><i class="ph ph-user"></i> Profil</a>
    </nav>
  </aside>
`;

const renderBottomNav = () => `
  <nav class="bottom-nav mobile-only">
    <a href="/index.html" class="nav-item ${location.pathname==='/' || location.pathname==='/index.html' ? 'active':''}"><i class="ph ph-house"></i><span>Bosh sahifa</span></a>
    <a href="/search.html" class="nav-item ${location.pathname==='/search.html' ? 'active':''}"><i class="ph ph-map-pin"></i><span>Karta</span></a>
    <a href="/category.html" class="nav-item ${location.pathname==='/category.html' ? 'active':''}"><i class="ph ph-squares-four"></i><span>Katalog</span></a>
    <a href="/favorites.html" class="nav-item ${location.pathname==='/favorites.html' ? 'active':''}"><i class="ph ph-heart"></i><span>Sevimlilar</span></a>
    <a href="/profile.html" class="nav-item ${location.pathname==='/profile.html' ? 'active':''}"><i class="ph ph-user"></i><span>Profil</span></a>
  </nav>
`;

document.addEventListener('DOMContentLoaded', () => {
  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) sidebarContainer.innerHTML = renderSidebar();
  
  const bottomNavContainer = document.getElementById('bottom-nav-container');
  if (bottomNavContainer) bottomNavContainer.innerHTML = renderBottomNav();
});
