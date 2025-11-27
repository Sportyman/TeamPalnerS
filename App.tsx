import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from './store';
import { Dashboard } from './components/Dashboard';
import { SessionManager } from './components/SessionManager';
import { Login } from './components/Login';
import { PublicPairingView } from './components/PublicPairingView';
import { Waves, LayoutDashboard, Calendar, LogOut, Menu, X } from 'lucide-react';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAppStore((state) => state.user);
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const NavLink: React.FC<{ to: string; icon: React.ReactNode; text: string; onClick?: () => void }> = ({ to, icon, text, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
        isActive 
          ? 'text-brand-600 bg-brand-50' 
          : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
      }`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2 md:gap-8">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <Link to="/" className="flex items-center gap-2 text-brand-600 font-bold text-xl">
                <Waves size={28} />
                <span className="hidden xs:inline">PaddleMate</span>
              </Link>
              
              {/* Desktop Nav */}
              <div className="hidden md:flex space-x-4 space-x-reverse">
                <NavLink to="/" icon={<Calendar size={18} />} text="אימון חדש" />
                <NavLink to="/manage" icon={<LayoutDashboard size={18} />} text="משתתפים" />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs md:text-sm text-slate-500 hidden sm:block">
                {user?.email}
              </span>
              <button onClick={logout} className="text-slate-400 hover:text-red-500 p-2">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink 
                to="/" 
                icon={<Calendar size={18} />} 
                text="אימון חדש" 
                onClick={() => setIsMenuOpen(false)}
              />
              <NavLink 
                to="/manage" 
                icon={<LayoutDashboard size={18} />} 
                text="ניהול משתתפים" 
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="pt-2 border-t border-slate-100 mt-2">
                 <div className="px-3 py-2 text-xs text-slate-400">
                    מחובר כ: {user?.email}
                 </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Public Share Route (No Login Required) */}
        <Route path="/share" element={<PublicPairingView />} />

        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <SessionManager />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/manage" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;