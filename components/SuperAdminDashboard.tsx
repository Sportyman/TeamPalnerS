
import React, { useState } from 'react';
import { useAppStore, ROOT_ADMIN_EMAIL } from '../store';
import { Shield, Trash2, Plus, UserCheck, ArrowRight, Home, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SuperAdminDashboard: React.FC = () => {
  const { user, clubs, superAdmins, addClub, removeClub, addSuperAdmin, removeSuperAdmin } = useAppStore();
  const navigate = useNavigate();
  
  const [newEmail, setNewEmail] = useState('');
  const [newClubName, setNewClubName] = useState('');

  // Security Check
  if (!user || !user.isAdmin) {
    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-500">אין גישה</h1>
            <button onClick={() => navigate('/')} className="mt-4 text-brand-600 underline">חזור לדף הבית</button>
        </div>
    );
  }

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    addSuperAdmin(newEmail);
    setNewEmail('');
  };

  const handleAddClub = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newClubName) return;
      addClub(newClubName);
      setNewClubName('');
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
       <div className="flex items-center justify-between border-b border-slate-200 pb-6">
           <div className="flex items-center gap-4">
                <div className="bg-slate-800 p-3 rounded-full text-white">
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">ניהול על (Super Admin)</h1>
                    <p className="text-slate-500">ניהול חוגים ומנהלי מערכת</p>
                </div>
           </div>
           <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-brand-600">
               <Home size={20} />
               חזרה לדף הבית
           </button>
       </div>

       {/* CLUBS MANAGEMENT */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h2 className="font-bold text-xl mb-6 flex items-center gap-2 text-slate-800">
               <Waves size={24} className="text-brand-600" />
               ניהול חוגים
           </h2>
           
           <form onSubmit={handleAddClub} className="flex gap-4 mb-6">
               <input 
                 type="text" 
                 value={newClubName}
                 onChange={e => setNewClubName(e.target.value)}
                 className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                 placeholder="שם החוג החדש..."
               />
               <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-bold">
                   הוסף חוג
               </button>
           </form>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {clubs.map(club => (
                   <div key={club.id} className="p-4 border rounded-lg flex justify-between items-center bg-slate-50">
                       <span className="font-bold text-lg">{club.label}</span>
                       <button 
                         onClick={() => { if(confirm('למחוק את החוג הזה?')) removeClub(club.id); }}
                         className="text-slate-400 hover:text-red-500 p-2"
                         title="מחק חוג"
                       >
                           <Trash2 size={18} />
                       </button>
                   </div>
               ))}
           </div>
       </div>

       {/* ADMINS MANAGEMENT */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h2 className="font-bold text-xl mb-6 flex items-center gap-2 text-slate-800">
               <UserCheck size={24} className="text-brand-600" />
               מנהלי מערכת נוספים
           </h2>
           
           <form onSubmit={handleAddAdmin} className="flex gap-4 mb-6">
               <input 
                 type="email" 
                 value={newEmail}
                 onChange={e => setNewEmail(e.target.value)}
                 className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                 placeholder="כתובת אימייל..."
                 dir="ltr"
               />
               <button type="submit" className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-bold">
                   הוסף מנהל
               </button>
           </form>

           <div className="space-y-2">
               {superAdmins.map(email => (
                   <div key={email} className="p-3 border-b flex justify-between items-center last:border-0">
                       <span className="font-mono text-slate-700">{email}</span>
                       {email.toLowerCase() !== ROOT_ADMIN_EMAIL.toLowerCase() ? (
                           <button 
                                onClick={() => removeSuperAdmin(email)}
                                className="text-slate-400 hover:text-red-500"
                           >
                               <Trash2 size={16} />
                           </button>
                       ) : (
                           <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">ראשי</span>
                       )}
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
};
