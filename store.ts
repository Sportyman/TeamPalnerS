import { create } from 'zustand';
import { Person, Role, SessionState, Team, BoatInventory } from './types';
import { generateSmartPairings } from './services/pairingLogic';

// Mock Initial Data - Cleaned names for privacy
const MOCK_PEOPLE: Person[] = [
  { id: '1', name: 'שרה כהן', role: Role.VOLUNTEER, rank: 5, notes: 'חותרת חזקה' },
  { id: '2', name: 'מייק לוי', role: Role.VOLUNTEER, rank: 2 },
  { id: '3', name: 'ג\'סיקה אלמוג', role: Role.MEMBER, rank: 1, notes: 'צריכה עזרה, תמיכה בגב' },
  { id: '4', name: 'תום ירושלמי', role: Role.MEMBER, rank: 4 },
  { id: '5', name: 'אלכס גורן', role: Role.VOLUNTEER, rank: 3 },
  { id: '6', name: 'אמילי צור', role: Role.MEMBER, rank: 2 },
  { id: '7', name: 'דוד המלך', role: Role.VOLUNTEER, rank: 5 },
  { id: '8', name: 'כריס פראט', role: Role.MEMBER, rank: 2 },
];

const DEFAULT_INVENTORY: BoatInventory = {
  doubles: 4,
  singles: 2,
  privates: 0
};

interface AppState {
  user: { email: string; isAdmin: boolean } | null;
  people: Person[];
  session: SessionState;
  defaultInventory: BoatInventory;
  
  // Actions
  login: (email: string, isAdmin: boolean) => void;
  logout: () => void;
  addPerson: (person: Person) => void;
  updatePerson: (person: Person) => void;
  removePerson: (id: string) => void;
  toggleAttendance: (id: string) => void;
  setBulkAttendance: (ids: string[]) => void;
  updateInventory: (inventory: BoatInventory) => void;
  updateDefaultInventory: (inventory: BoatInventory) => void;
  runPairing: () => void;
  resetSession: () => void;
  moveMemberToTeam: (personId: string, targetTeamId: string) => void;
  reorderSessionMembers: (sourceTeamId: string, sourceIndex: number, destTeamId: string, destIndex: number) => void;
  swapMembers: (teamAId: string, indexA: number, teamBId: string, indexB: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  people: MOCK_PEOPLE,
  defaultInventory: DEFAULT_INVENTORY,
  session: {
    inventory: DEFAULT_INVENTORY,
    presentPersonIds: [],
    teams: [],
  },

  login: (email, isAdmin) => set({ user: { email, isAdmin } }),
  logout: () => set({ user: null }),

  addPerson: (person) => set((state) => ({ people: [...state.people, person] })),
  
  updatePerson: (updatedPerson) => set((state) => ({
    people: state.people.map(p => p.id === updatedPerson.id ? updatedPerson : p)
  })),

  removePerson: (id) => set((state) => ({ 
    people: state.people.filter(p => p.id !== id) 
  })),

  toggleAttendance: (id) => set((state) => {
    const isPresent = state.session.presentPersonIds.includes(id);
    const newPresent = isPresent
      ? state.session.presentPersonIds.filter(pid => pid !== id)
      : [...state.session.presentPersonIds, id];
    return { session: { ...state.session, presentPersonIds: newPresent } };
  }),

  setBulkAttendance: (ids) => set((state) => ({
    session: { ...state.session, presentPersonIds: ids }
  })),

  updateInventory: (inventory) => set((state) => ({
    session: { ...state.session, inventory }
  })),

  updateDefaultInventory: (inventory) => set(() => ({
    defaultInventory: inventory
  })),

  runPairing: () => {
    const { people, session } = get();
    const presentPeople = people.filter(p => session.presentPersonIds.includes(p.id));
    const teams = generateSmartPairings(presentPeople, session.inventory);
    set((state) => ({
      session: { ...state.session, teams }
    }));
  },

  resetSession: () => {
    const { defaultInventory } = get();
    set((state) => ({
      session: {
        inventory: defaultInventory,
        presentPersonIds: [],
        teams: []
      }
    }));
  },

  moveMemberToTeam: (personId, targetTeamId) => {
    const { session, people } = get();
    const person = people.find(p => p.id === personId);
    if (!person) return;

    let newTeams = [...session.teams];

    // Remove from source
    newTeams = newTeams.map(t => ({
      ...t,
      members: t.members.filter(m => m.id !== personId)
    }));

    // Add to target
    newTeams = newTeams.map(t => {
      if (t.id === targetTeamId) {
        return { ...t, members: [...t.members, person] };
      }
      return t;
    });

    set((state) => ({
      session: { ...state.session, teams: newTeams }
    }));
  },

  reorderSessionMembers: (sourceTeamId, sourceIndex, destTeamId, destIndex) => {
    const { session } = get();
    const newTeams = JSON.parse(JSON.stringify(session.teams)); // Deep copy for safety

    const sourceTeam = newTeams.find((t: Team) => t.id === sourceTeamId);
    const destTeam = newTeams.find((t: Team) => t.id === destTeamId);

    if (!sourceTeam || !destTeam) return;

    // Remove from source
    const [movedMember] = sourceTeam.members.splice(sourceIndex, 1);

    // Add to destination
    destTeam.members.splice(destIndex, 0, movedMember);

    set((state) => ({
      session: { ...state.session, teams: newTeams }
    }));
  },

  swapMembers: (teamAId, indexA, teamBId, indexB) => {
    const { session } = get();
    const newTeams = JSON.parse(JSON.stringify(session.teams));

    const teamA = newTeams.find((t: Team) => t.id === teamAId);
    const teamB = newTeams.find((t: Team) => t.id === teamBId);

    if (!teamA || !teamB) return;

    const memberA = teamA.members[indexA];
    const memberB = teamB.members[indexB];

    // Swap
    teamA.members[indexA] = memberB;
    teamB.members[indexB] = memberA;

    set((state) => ({
      session: { ...state.session, teams: newTeams }
    }));
  }
}));