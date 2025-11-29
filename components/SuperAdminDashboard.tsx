import React, { useState } from 'react';
import { useAppStore, SUPER_ADMIN_EMAIL } from '../store';
import { ClubID, ClubLabel } from '../types';
import { Shield, Trash2, Plus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SuperAdminDashboard: React.FC = () => {
  const { user, permissions, addPermission, removePermission } = useAppStore();
  const navigate = useNavigate();
  
  const [newEmail, setNewEmail] = useState('');
  const [selectedClub, setSelectedClub] = useState<ClubID>(ClubID.KAYAK);

  // Security Check
  if (!user || user.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-500">אין גישה</h1>
            <p>עמוד זה מיועד למנהל העל בלבד.</p>
            <button onClick={() => navigate('/')} className="mt-4 text-brand-600 underline">חזור לדף הבית</button>
        </div>
    );
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    addPermission(newEmail.toLowerCase().trim(), selectedClub);
    setNewEmail('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
       <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
           <div className="bg-slate-800 p-3 rounded-full text-white">
               <Shield size={32} />
           </div>
           <div>
               <h1 className="text-3xl font-bold text-slate-800">ניהול הרשאות מערכת</h1>
               <p className="text-slate-500">הגדרת מנהלים לחוגים השונים</p>
           </div>
       </div>

       {/* Add Permission Form */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
               <Plus size={20} className="text-brand-600" />
               הוספת מנהל חדש
           </h2>
           <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
               <div className="flex-1 w-full">
                   <label className="block text-sm font-medium text-slate-600 mb-1">כתובת אימייל (חשבון גוגל)</label>
                   <input 
                     type="email" 
                     value={newEmail}
                     onChange={e => setNewEmail(e.target.value)}
                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                     placeholder="manager@gmail.com"
                     dir="ltr"
                     required
                   />
               </div>
               <div className="w-full md:w-64">
                   <label className="block text-sm font-medium text-slate-600 mb-1">חוג מורשה</label>
                   <select 
                     value={selectedClub} 
                     onChange={e => setSelectedClub(e.target.value as ClubID)}
                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                   >
                       {Object.entries(ClubLabel).map(([key, label]) => (
                           <option key={key} value={key}>{label}</option>
                       ))}
                   </select>
               </div>
               <button type="submit" className="w-full md:w-auto bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-bold">
                   הוסף הרשאה
               </button>
           </form>
       </div>

       {/* Permissions List */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <table className="w-full text-right">
               <thead className="bg-slate-50 text-slate-600 text-sm uppercase">
                   <tr>
                       <th className="px-6 py-3">אימייל</th>
                       <th className="px-6 py-3">חוגים מורשים</th>
                       <th className="px-6 py-3 text-left">פעולות</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                   {/* Super Admin Row (Immutable) */}
                   <tr className="bg-amber-50/50">
                       <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                           <Shield size={16} className="text-amber-500" />
                           {SUPER_ADMIN_EMAIL}
                       </td>
                       <td className="px-6 py-4 text-sm text-slate-500">גישה מלאה (Super Admin)</td>
                       <td className="px-6 py-4"></td>
                   </tr>

                   {permissions.map((perm) => (
                       <tr key={perm.email} className="hover:bg-slate-50">
                           <td className="px-6 py-4 font-medium" dir="ltr">{perm.email}</td>
                           <td className="px-6 py-4">
                               <div className="flex gap-2">
                                   {perm.allowedClubs.map(club => (
                                       <span key={club} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs border border-slate-200">
                                           {ClubLabel[club]}
                                           <button 
                                             onClick={() => removePermission(perm.email, club)}
                                             className="hover:text-red-500 ml-1"
                                             title="הסר הרשאה זו"
                                           >
                                               <Trash2 size={12} />
                                           </button>
                                       </span>
                                   ))}
                               </div>
                           </td>
                           <td className="px-6 py-4 text-left">
                               <div className="text-xs text-slate-400">
                                   משתמש רגיל
                               </div>
                           </td>
                       </tr>
                   ))}
                   {permissions.length === 0 && (
                       <tr>
                           <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                               לא הוגדרו מנהלים נוספים.
                           </td>
                       </tr>
                   )}
               </tbody>
           </table>
       </div>
    </div>
  );
};