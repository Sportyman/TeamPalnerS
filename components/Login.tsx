import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ShieldCheck, Mail, Zap } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, user } = useAppStore();
  const navigate = useNavigate();

  // Watch for changes in user state and redirect if logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleDevLogin = () => {
    login('admin@paddle.local', true);
  };

  const handleGoogleLogin = () => {
    alert("Google Auth would trigger here. Using mock for demo.");
    login('shaykashay@gmail.com', true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">PaddleMate</h1>
          <p className="text-slate-500 mt-2">פורטל ניהול</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <Mail size={20} />
            התחברות עם גוגל
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-400">מצב פיתוח</span>
            </div>
          </div>

          <button
            onClick={handleDevLogin}
            className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <Zap size={20} className="text-yellow-400" />
            כניסה ללא סיסמה (Dev Mode)
          </button>
        </div>
      </div>
    </div>
  );
};