
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Role, RoleLabel, Person, BoatType, BoatTypeLabel, ClubLabel, Gender, GenderLabel, BoatInventory } from '../types';
import { Trash2, UserPlus, Star, Edit, X, Save, ChevronDown, ChevronUp, Plus, Phone, Database, Settings, User } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
      people, 
      activeClub, 
      addPerson, 
      updatePerson, 
      removePerson, 
      restoreDemoData,
      defaultInventories,
      updateDefaultInventory
    } = useAppStore();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'people' | 'settings'>('people');

  // Add Person State
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<Gender>(Gender.MALE);
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<Role>(Role.VOLUNTEER);
  const [newRank, setNewRank] = useState(3);
  const [newNotes, setNewNotes] = useState('');
  const [newPreferredBoat, setNewPreferredBoat] = useState<BoatType | ''>('');
  const [newPreferredPartners, setNewPreferredPartners] = useState<string[]>([]);

  // Inventory Edit State
  const currentDefaults = activeClub ? defaultInventories[activeClub] : { doubles: 0, singles: 0, privates: 0 };
  const [tempInventory, setTempInventory] = useState<BoatInventory>(currentDefaults);

  // Edit Modal State
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  // Filter People by Active Club
  const clubPeople = people.filter(p => p.clubId === activeClub);

  // Sync temp inventory when club changes
  React.useEffect(() => {
    if (activeClub) {
        setTempInventory(defaultInventories[activeClub]);
    }
  }, [activeClub, defaultInventories]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    
    // Note: addPerson inside store will inject the activeClubId
    addPerson({
      id: Date.now().toString(),
      name: newName,
      gender: newGender,
      phone: newPhone,
      role: newRole,
      rank: newRank,
      notes: newNotes,
      constraints: newPreferredBoat ? { preferredBoat: newPreferredBoat } : undefined,
      preferredPartners: newPreferredPartners.length > 0 ? newPreferredPartners : undefined
    });
    
    // Reset form
    setNewName('');
    setNewGender(Gender.MALE);
    setNewPhone('');
    setNewNotes('');
    setNewPreferredBoat('');
    setNewPreferredPartners([]);
    setNewRole(Role.VOLUNTEER);
    setNewRank(3);
    setIsAddFormOpen(false); 
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPerson) {
      updatePerson(editingPerson);
      setEditingPerson(null);
    }
  };

  const saveInventory = () => {
    updateDefaultInventory(tempInventory);
    alert('הגדרות הציוד נשמרו בהצלחה!');
  };

  // Toggle helpers for Edit Mode
  const togglePartnerSelectionEdit = (partnerId: string) => {
    if (!editingPerson) return;
    const currentPartners = editingPerson.preferredPartners || [];
    const isSelected = currentPartners.includes(partnerId);
    
    let newPartners;
    if (isSelected) {
      newPartners = currentPartners.filter(id => id !== partnerId);
    } else {
      newPartners = [...currentPartners, partnerId];
    }
    
    setEditingPerson({ ...editingPerson, preferredPartners: newPartners });
  };

  // Toggle helpers for Add Mode
  const togglePartnerSelectionAdd = (partnerId: string) => {
    const isSelected = newPreferredPartners.includes(partnerId);
    if (isSelected) {
      setNewPreferredPartners(newPreferredPartners.filter(id => id !== partnerId));
    } else {
      setNewPreferredPartners([...newPreferredPartners, partnerId]);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 2) return 'text-red-500';
    if (rank === 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRoleBadgeStyle = (role: Role) => {
    switch (role) {
      case Role.VOLUNTEER: return 'bg-orange-100 text-orange-700';
      case Role.MEMBER: return 'bg-sky-100 text-sky-700';
      case Role.GUEST: return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getMobileCardColor = (role: Role) => {
    switch (role) {
      case Role.VOLUNTEER: return 'bg-orange-50 border-orange-200';
      case Role.MEMBER: return 'bg-sky-50 border-sky-200';
      case Role.GUEST: return 'bg-emerald-50 border-emerald-200';
      default: return 'bg-white border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
                ניהול חוג: {activeClub ? ClubLabel[activeClub] : ''}
            </h2>
            <div className="flex items-center gap-2 mt-1">
                 {clubPeople.length === 0 && (
                    <button 
                        onClick={() => { if(confirm('האם לשחזר נתוני דמו? זה ימחק שינויים מקומיים.')) restoreDemoData(); }}
                        className="text-xs bg-brand-50 text-brand-600 hover:bg-brand-100 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                    >
                        <Database size={12} /> טען נתוני דמו
                    </button>
                )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('people')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'people' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <div className="flex items-center gap-2"><User size={16}/> משתתפים</div>
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'settings' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <div className="flex items-center gap-2"><Settings size={16}/> הגדרות וציוד</div>
              </button>
          </div>
      </div>

      {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in max-w-2xl">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">מלאי ציוד ברירת מחדל</h3>
              <p className="text-sm text-slate-500 mb-6">
                  כאן ניתן להגדיר את כמויות הציוד הקבועות של המועדון. כמויות אלו יטענו אוטומטית בכל אימון חדש.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">קיאק זוגי (2 מושבים)</span>
                    <span className="text-brand-600 font-bold text-xl">{tempInventory.doubles}</span>
                  </label>
                  <input 
                    type="range" min="0" max="20" 
                    value={tempInventory.doubles}
                    onChange={(e) => setTempInventory({ ...tempInventory, doubles: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">קיאק יחיד (מושב 1)</span>
                    <span className="text-brand-600 font-bold text-xl">{tempInventory.singles}</span>
                  </label>
                  <input 
                    type="range" min="0" max="20" 
                    value={tempInventory.singles}
                    onChange={(e) => setTempInventory({ ...tempInventory, singles: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">סירות פרטיות (בעלים)</span>
                    <span className="text-brand-600 font-bold text-xl">{tempInventory.privates}</span>
                  </label>
                  <input 
                    type="range" min="0" max="10" 
                    value={tempInventory.privates}
                    onChange={(e) => setTempInventory({ ...tempInventory, privates: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                </div>
              </div>

              <div className="mt-8 pt-4 border-t flex justify-end">
                  <button 
                    onClick={saveInventory}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                  >
                      <Save size={18} /> שמור הגדרות
                  </button>
              </div>
          </div>
      )}

      {activeTab === 'people' && (
      <>
      {/* Edit Modal */}
      {editingPerson && (
        <div className="fixed inset-0 z-50 flex md:items-center md:justify-center md:bg-black/50 bg-white md:bg-transparent">
          <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:w-full md:max-w-lg md:rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 safe-area-top safe-area-bottom">
            {/* Header */}
            <div className="bg-brand-50 p-4 border-b border-brand-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-brand-800">עריכת משתתף</h3>
              <button onClick={() => setEditingPerson(null)} className="text-slate-500 hover:text-slate-800 p-2" title="סגור חלון">
                <X size={24} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <form onSubmit={handleUpdate} className="p-4 space-y-4 overflow-y-auto flex-1 bg-white">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">שם מלא</label>
                  <input
                    type="text"
                    value={editingPerson.name}
                    onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
                    className="w-full px-3 py-3 md:py-2 border rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-base"
                    required
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">מין</label>
                   <select
                        value={editingPerson.gender}
                        onChange={(e) => setEditingPerson({ ...editingPerson, gender: e.target.value as Gender })}
                        className="w-full px-3 py-3 md:py-2 border rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-base bg-white"
                   >
                       <option value={Gender.MALE}>{GenderLabel[Gender.MALE]}</option>
                       <option value={Gender.FEMALE}>{GenderLabel[Gender.FEMALE]}</option>
                   </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">טלפון</label>
                  <input
                    type="tel"
                    value={editingPerson.phone || ''}
                    onChange={(e) => setEditingPerson({ ...editingPerson, phone: e.target.value })}
                    className="w-full px-3 py-3 md:py-2 border rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-base"
                    placeholder="05X-XXXXXXX"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">תפקיד</label>
                  <select
                    value={editingPerson.role}
                    onChange={(e) => setEditingPerson({ ...editingPerson, role: e.target.value as Role })}
                    className="w-full px-3 py-3 md:py-2 border rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-base bg-white"
                  >
                    <option value={Role.VOLUNTEER}>{RoleLabel[Role.VOLUNTEER]}</option>
                    <option value={Role.MEMBER}>{RoleLabel[Role.MEMBER]}</option>
                    <option value={Role.GUEST}>{RoleLabel[Role.GUEST]}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">דירוג (1-5)</label>
                  <select
                    value={editingPerson.rank}
                    onChange={(e) => setEditingPerson({ ...editingPerson, rank: Number(e.target.value) })}
                    className="w-full px-3 py-3 md:py-2 border rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-base bg-white"
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">הערות</label>
                <textarea
                  value={editingPerson.notes || ''}
                  onChange={(e) => setEditingPerson({ ...editingPerson, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-base"
                  rows={2}
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-semibold text-sm text-slate-900 mb-3">אילוצים והעדפות</h4>
                
                <div className="space-y-4">
                   <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">סירה מועדפת</label>
                    <select
                      value={editingPerson.constraints?.preferredBoat || ''}
                      onChange={(e) => setEditingPerson({ 
                        ...editingPerson, 
                        constraints: { 
                          ...editingPerson.constraints, 
                          preferredBoat: e.target.value ? e.target.value as BoatType : undefined 
                        } 
                      })}
                      className="w-full px-3 py-3 md:py-2 border rounded-md text-base bg-white"
                    >
                      <option value="">ללא העדפה</option>
                      {Object.entries(BoatTypeLabel).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                   <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-medium text-slate-500">
                        שותפים מועדפים ({editingPerson.preferredPartners?.length || 0})
                      </label>
                      {(editingPerson.preferredPartners?.length || 0) > 0 && (
                        <button 
                          type="button"
                          onClick={() => setEditingPerson({ ...editingPerson, preferredPartners: [] })}
                          className="text-xs text-red-500 font-medium hover:bg-red-50 px-2 py-1 rounded"
                        >
                          נקה הכל
                        </button>
                      )}
                    </div>
                    
                    {/* Filter people by same club for partners */}
                    <div className="border rounded-md max-h-48 overflow-y-auto bg-slate-50 divide-y divide-slate-100">
                      {clubPeople.filter(p => p.id !== editingPerson.id).map(p => {
                        const isSelected = editingPerson.preferredPartners?.includes(p.id);
                        return (
                          <label 
                            key={p.id} 
                            className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${isSelected ? 'bg-brand-50' : 'bg-white hover:bg-slate-50'}`}
                          >
                            <span className={`text-sm ${isSelected ? 'font-medium text-brand-700' : 'text-slate-700'}`}>
                              {p.name} <span className="text-xs text-slate-400">({RoleLabel[p.role]})</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={isSelected || false}
                              onChange={() => togglePartnerSelectionEdit(p.id)}
                              className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 shrink-0 flex gap-3 bg-slate-50">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm text-lg md:text-base"
              >
                <Save size={20} /> שמירה
              </button>
              <button
                type="button"
                onClick={() => setEditingPerson(null)}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-medium text-lg md:text-base"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accordion: Add Person Form */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
        <button 
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <div className="bg-brand-100 text-brand-600 p-1 rounded-full"><Plus size={16} /></div>
            הוספת משתתף חדש
          </div>
          {isAddFormOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </button>

        {isAddFormOpen && (
          <div className="p-6 border-t border-slate-100 animate-in slide-in-from-top-2">
            <form onSubmit={handleAdd} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-600 mb-1">שם מלא</label>
                        <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                        required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">מין</label>
                        <select
                            value={newGender}
                            onChange={(e) => setNewGender(e.target.value as Gender)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                        >
                            <option value={Gender.MALE}>{GenderLabel[Gender.MALE]}</option>
                            <option value={Gender.FEMALE}>{GenderLabel[Gender.FEMALE]}</option>
                        </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">טלפון</label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="05X-XXXXXXX"
                      dir="ltr"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">תפקיד</label>
                        <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as Role)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                        >
                        <option value={Role.VOLUNTEER}>{RoleLabel[Role.VOLUNTEER]}</option>
                        <option value={Role.MEMBER}>{RoleLabel[Role.MEMBER]}</option>
                        <option value={Role.GUEST}>{RoleLabel[Role.GUEST]}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">דירוג</label>
                        <select
                        value={newRank}
                        onChange={(e) => setNewRank(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                        >
                        {[1, 2, 3, 4, 5].map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                        </select>
                    </div>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">הערות</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                  rows={1}
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="font-semibold text-sm text-slate-700 mb-3">הגדרות מתקדמות (אופציונלי)</h4>
                  <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">סירה מועדפת</label>
                        <select
                        value={newPreferredBoat}
                        onChange={(e) => setNewPreferredBoat(e.target.value as BoatType | '')}
                        className="w-full md:w-1/2 px-3 py-2 border rounded-md bg-white text-sm"
                        >
                        <option value="">ללא העדפה</option>
                        {Object.entries(BoatTypeLabel).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                        </select>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                             <label className="block text-xs font-medium text-slate-500">שותפים מועדפים ({newPreferredPartners.length})</label>
                             {newPreferredPartners.length > 0 && (
                                 <button type="button" onClick={() => setNewPreferredPartners([])} className="text-xs text-red-500">נקה הכל</button>
                             )}
                        </div>
                        <div className="border rounded-md max-h-32 overflow-y-auto bg-white divide-y divide-slate-100">
                            {clubPeople.map(p => (
                                <label key={p.id} className="flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer">
                                    <span className="text-sm text-slate-700">
                                      {p.name} <span className="text-xs text-slate-400">({RoleLabel[p.role]})</span>
                                    </span>
                                    <input 
                                        type="checkbox" 
                                        checked={newPreferredPartners.includes(p.id)}
                                        onChange={() => togglePartnerSelectionAdd(p.id)}
                                        className="w-4 h-4 text-brand-600 rounded"
                                    />
                                </label>
                            ))}
                            {clubPeople.length === 0 && <div className="p-2 text-xs text-slate-400">אין משתתפים אחרים</div>}
                        </div>
                    </div>
                  </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-500 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-bold shadow-sm"
              >
                <UserPlus size={20} /> הוסף משתתף
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-2">
        {clubPeople.map((person) => (
          <div key={person.id} className={`rounded-lg shadow-sm border p-3 ${getMobileCardColor(person.role)}`}>
             <div className="flex justify-between items-center mb-1">
               <div className="flex items-center gap-2">
                 <h3 className="font-bold text-slate-800 text-base">{person.name}</h3>
                 <span className="text-xs text-slate-500">({RoleLabel[person.role]})</span>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => setEditingPerson(person)} className="text-slate-400 hover:text-brand-600 p-1">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => removePerson(person.id)} className="text-slate-400 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
               </div>
             </div>

             <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                 <span className="bg-white/50 px-1.5 rounded">{GenderLabel[person.gender || Gender.MALE]}</span>
                <div className="flex items-center gap-0.5">
                   {Array.from({ length: person.rank }).map((_, i) => (
                      <Star key={i} size={12} className={`fill-current ${getRankColor(person.rank)}`} />
                    ))}
                </div>
                {person.phone && (
                  <div className="flex items-center gap-1">
                    <Phone size={12} />
                    <span dir="ltr">{person.phone}</span>
                  </div>
                )}
             </div>
             
             {person.notes && (
                <div className="mt-2 text-xs bg-white/50 p-1.5 rounded text-slate-600 truncate">
                  {person.notes}
                </div>
             )}
          </div>
        ))}
        {clubPeople.length === 0 && (
           <div className="text-center py-10 text-slate-400">
             לא נמצאו משתתפים.
             <button onClick={() => restoreDemoData()} className="block mx-auto mt-2 text-brand-600 underline">טען נתונים לדוגמה</button>
           </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">שם</th>
              <th className="px-6 py-3">מין</th>
              <th className="px-6 py-3">תפקיד</th>
              <th className="px-6 py-3">טלפון</th>
              <th className="px-6 py-3">דירוג</th>
              <th className="px-6 py-3">אילוצים</th>
              <th className="px-6 py-3 text-left">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clubPeople.map((person) => (
              <tr key={person.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">
                  {person.name}
                  {person.notes && <div className="text-xs text-slate-400 mt-1">{person.notes}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                    {GenderLabel[person.gender || Gender.MALE]}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeStyle(person.role)}`}>
                    {RoleLabel[person.role]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600" dir="ltr">
                  {person.phone || '-'}
                </td>
                <td className="px-6 py-4 flex items-center gap-1">
                  {Array.from({ length: person.rank }).map((_, i) => (
                    <Star key={i} size={14} className={`fill-current ${getRankColor(person.rank)}`} />
                  ))}
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {person.constraints?.preferredBoat && (
                     <div className="mb-1">סירה: {BoatTypeLabel[person.constraints.preferredBoat]}</div>
                  )}
                  {person.preferredPartners && person.preferredPartners.length > 0 && (
                     <div>שותפים: {person.preferredPartners.length}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-left">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingPerson(person)}
                      className="text-slate-400 hover:text-brand-500 transition-colors p-2 hover:bg-slate-100 rounded-full"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => removePerson(person.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-slate-100 rounded-full"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clubPeople.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  לא נמצאו משתתפים בחוג זה.
                  <button onClick={() => restoreDemoData()} className="block mx-auto mt-2 text-brand-600 underline">טען נתונים לדוגמה</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  );
};
