import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotificationInboxProvider } from './context/NotificationInboxContext.jsx';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Category from './pages/Category';
import CategoryDetail from './pages/CategoryDetail';
import Vendor from './pages/Vendor';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Search from './pages/Search';

function App() {
  return (
    <BrowserRouter>
      <NotificationInboxProvider>
        <div id="app">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category" element={<Category />} />
              <Route path="/category/:slug" element={<CategoryDetail />} />
              <Route path="/vendor/:id" element={<Vendor />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<Search />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </NotificationInboxProvider>
    </BrowserRouter>
  );
}

export default App;
