import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from './store';
import { Dashboard } from './components/Dashboard';
import { SessionManager } from './components/SessionManager';
import { Login } from './components/Login';
import { PublicPairingView } from './components/PublicPairingView';
import { Waves, LayoutDashboard, Calendar, LogOut, Menu, X, Info } from 'lucide-react';
import { APP_VERSION } from './types';

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
          <div className="relative flex justify-between h-16 items-center">
            
            {/* Right Side (Start in RTL): Mobile Menu & Desktop Links */}
            <div className="flex items-center gap-2 md:gap-8">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              {/* Desktop Nav */}
              <div className="hidden md:flex space-x-4 space-x-reverse">
                <NavLink to="/" icon={<Calendar size={18} />} text="אימון חדש" />
                <NavLink to="/manage" icon={<LayoutDashboard size={18} />} text="משתתפים" />
              </div>
            </div>

            {/* Center: Logo (Absolute Positioned) */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
               <Link to="/" className="flex items-center gap-2 text-brand-600 font-bold text-xl">
                <Waves size={28} />
                <span className="hidden xs:inline">PaddleMate</span>
              </Link>
            </div>
            
            {/* Left Side (End in RTL): User & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs md:text-sm text-slate-500">
                    {user?.email}
                  </span>
                  <span className="text-[10px] text-slate-300">v{APP_VERSION}</span>
              </div>
              <button onClick={logout} className="text-slate-400 hover:text-red-500 p-2" title="התנתק">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 animate-in slide-in-from-top-5">
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
              <div className="pt-2 border-t border-slate-100 mt-2 flex justify-between items-center px-3 py-2">
                 <div className="text-xs text-slate-400">
                    מחובר כ: {user?.email}
                 </div>
                 <div className="text-xs text-slate-300 font-mono">
                    Ver: {APP_VERSION}
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