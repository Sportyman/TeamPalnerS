import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ClubID } from '../types';
import { Waves, Ship, Settings } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveClub } = useAppStore();

  const handleClubSelect = (clubId: ClubID) => {
    setActiveClub(clubId);
    navigate('/login');
  };

  const handleSuperAdmin = () => {
    navigate('/login?admin=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 md:space-y-12">
        
        {/* Header / Logo */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
             <div className="bg-brand-600 text-white p-4 rounded-2xl shadow-lg">
                <Waves size={48} />
             </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
            עמותת אתגרים
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-light">מערכת שיבוץ וניהול פעילות ימית</p>
        </div>

        {/* Club Selection Cards - Side by Side always (grid-cols-2) */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <button
            onClick={() => handleClubSelect(ClubID.KAYAK)}
            className="group relative bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm hover:shadow-xl border-2 border-transparent hover:border-brand-500 transition-all duration-300 flex flex-col items-center gap-4 md:gap-6"
          >
            <div className="w-16 h-16 md:w-24 md:h-24 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Waves className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1 md:mb-2">קיאקים</h2>
              <p className="text-slate-500 text-xs md:text-sm hidden md:block">ניהול מתנדבים וציוד</p>
            </div>
          </button>

          <button
            onClick={() => handleClubSelect(ClubID.SAILING)}
            className="group relative bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm hover:shadow-xl border-2 border-transparent hover:border-sky-500 transition-all duration-300 flex flex-col items-center gap-4 md:gap-6"
          >
            <div className="w-16 h-16 md:w-24 md:h-24 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Ship className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1 md:mb-2">שיט</h2>
              <p className="text-slate-500 text-xs md:text-sm hidden md:block">ניהול הפלגות וצוותים</p>
            </div>
          </button>
        </div>

        {/* Footer Admin Link */}
        <div className="text-center pt-4 md:pt-8">
           <button 
             onClick={handleSuperAdmin}
             className="text-slate-400 hover:text-slate-600 text-xs md:text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
           >
             <Settings size={14} />
             כניסה למנהל מערכת ראשי
           </button>
        </div>

      </div>
    </div>
  );
};