
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BoatTypeLabel, RoleLabel, Role, TEAM_COLORS, BoatType } from '../types';
import { Ship, Calendar, AlertCircle, Printer } from 'lucide-react';

interface PublicMember {
  name: string;
  role: Role;
}

interface PublicTeam {
  id: string;
  boatType: string;
  members: PublicMember[];
}

export const PublicPairingView: React.FC = () => {
  const location = useLocation();
  const [teams, setTeams] = useState<PublicTeam[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState('');
  const [customLabels, setCustomLabels] = useState<Record<string, string>>({ ...BoatTypeLabel });

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const data = params.get('data');
      
      if (!data) {
        setError('לא נמצאו נתוני שיבוץ בקישור.');
        return;
      }

      // Decode Base64
      const jsonString = decodeURIComponent(escape(atob(data)));
      const parsedData = JSON.parse(jsonString);
      
      setTeams(parsedData.teams);
      setDateStr(parsedData.date || new Date().toLocaleDateString('he-IL'));
      if (parsedData.labels) {
          setCustomLabels(parsedData.labels);
      }
      
    } catch (err) {
      console.error(err);
      setError('הקישור אינו תקין או פג תוקף.');
    }
  }, [location]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">שגיאה בטעינת הנתונים</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 py-8 px-4 w-full max-w-3xl mx-auto space-y-8">
        
        {/* Action Bar - Visible only on screen */}
        <div className="flex justify-between items-center print:hidden">
            <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
                <Printer size={18} /> הדפסה
            </button>
        </div>

        {/* Header */}
        <div className="text-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:shadow-none print:border-none">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 text-brand-600 rounded-full mb-4 print:hidden">
            <Ship size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">שיבוצי אימון</h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-slate-500">
            <Calendar size={16} />
            <span>{dateStr}</span>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {teams.map((team, idx) => {
            const colorClass = TEAM_COLORS[idx % TEAM_COLORS.length];
            const label = customLabels[team.boatType] || BoatTypeLabel[team.boatType as BoatType] || team.boatType;

            return (
              <div key={team.id || idx} className={`rounded-xl shadow-sm border-2 overflow-hidden break-inside-avoid print:shadow-none print:border-slate-300 ${colorClass}`}>
                <div className="bg-white/30 px-4 py-3 border-b border-slate-100/50 flex justify-between items-center print:bg-white print:border-slate-300">
                  <span className="font-bold text-slate-800 text-lg">סירה {idx + 1}</span>
                  <span className="text-xs bg-white/60 border border-slate-200/50 px-2 py-1 rounded text-slate-700 font-medium print:border-slate-400">
                    {label}
                  </span>
                </div>
                
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {team.members.map((member, mIdx) => (
                      <div key={mIdx} className="flex-1 flex items-center gap-3 p-3 rounded-lg bg-white/60 border border-white/50 print:bg-white print:border-slate-200 shadow-sm">
                        <div className={`w-3 h-3 rounded-full print:print-color-adjust-exact ${
                          member.role === Role.VOLUNTEER ? 'bg-orange-400' : 
                          member.role === Role.GUEST ? 'bg-emerald-400' : 'bg-sky-400'
                        }`} />
                        <span className="font-bold text-slate-900 text-xl">
                          {member.name}
                        </span>
                        <span className="text-xs text-slate-500 mr-auto font-medium">
                          {RoleLabel[member.role]}
                        </span>
                      </div>
                    ))}
                    {team.members.length === 0 && (
                       <div className="text-slate-400 text-sm italic p-2">סירה ריקה</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-xs text-slate-400 print:hidden mt-auto bg-slate-50" dir="ltr">
        Built by Shay Kalimi - @Shay.A.i
      </div>
    </div>
  );
};
