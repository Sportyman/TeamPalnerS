import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore, SUPER_ADMIN_EMAIL } from '../store';
import { ShieldCheck, Mail, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { ClubLabel } from '../types';

export const Login: React.FC = () => {
  const { login, user, activeClub } = useAppStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const isAdminLogin = searchParams.get('admin') === 'true';

  // Watch for changes in user state and redirect
  useEffect(() => {
    if (user) {
      if (user.email === SUPER_ADMIN_EMAIL && isAdminLogin) {
          navigate('/super-admin');
      } else {
          navigate('/app');
      }
    }
  }, [user, navigate, isAdminLogin]);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const success = login(emailInput.trim());
      
      if (success) {
          // Success handled by useEffect
      } else {
          setErrorMsg(isAdminLogin 
            ? 'אימייל זה אינו מורשה כמנהל על.'
            : `אימייל זה אינו מורשה לניהול ${activeClub ? ClubLabel[activeClub] : 'חוג זה'}. פנה למנהל המערכת.`);
      }
  };

  // Allow Super Admin shortcut for demo
  const handleDevLogin = () => {
    if (isAdminLogin) {
        login(SUPER_ADMIN_EMAIL);
    } else {
        // Mock a regular manager with permission (Assuming we added one for demo, or super admin works everywhere)
        login(SUPER_ADMIN_EMAIL); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center relative">
          <button 
             onClick={() => navigate('/')} 
             className="absolute right-0 top-0 text-slate-400 hover:text-slate-600"
             title="חזרה לדף הראשי"
          >
              <ArrowRight size={20} />
          </button>
          
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-800">
              {isAdminLogin ? 'ניהול מערכת (Super Admin)' : `כניסה ל${activeClub ? ClubLabel[activeClub] : 'מערכת'}`}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
              הזן את כתובת האימייל המורשית שלך
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
                <div className="relative">
                    <Mail className="absolute right-3 top-3 text-slate-400" size={20} />
                    <input 
                        type="email" 
                        required
                        className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="your@email.com"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        dir="ltr"
                    />
                </div>
            </div>

            {errorMsg && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                    <AlertTriangle size={16} />
                    {errorMsg}
                </div>
            )}

            <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
                התחבר
            </button>
        </form>

        {/* Dev Mode Shortcut */}
        <div className="relative pt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-400">אפשרויות פיתוח</span>
            </div>
        </div>

        <button
            onClick={handleDevLogin}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium py-3 px-4 rounded-lg transition-colors"
        >
            <Zap size={16} className="text-yellow-400" />
            כניסה מהירה כמנהל על (Dev)
        </button>

      </div>
    </div>
  );
};