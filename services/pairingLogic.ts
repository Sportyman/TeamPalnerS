
import { Person, Role, BoatInventory, Team, BoatDefinition } from '../types';

/**
 * The Smart Pairing Algorithm - Dynamic Capacity Edition
 */
export const generateSmartPairings = (
  people: Person[], 
  inventory: BoatInventory,
  boatDefinitions: BoatDefinition[]
): Team[] => {
  const teams: Team[] = [];
  
  // 1. Separate by Role
  const volunteers = people.filter(p => p.role === Role.VOLUNTEER);
  // Treat Guests as Members for matching logic
  const members = people.filter(p => p.role === Role.MEMBER || p.role === Role.GUEST);

  // 2. Sort Lists
  // Strongest volunteers first
  volunteers.sort((a, b) => b.rank - a.rank);
  // Lowest rank members first (Highest Need)
  members.sort((a, b) => a.rank - b.rank);

  // Mutable copies
  let availableVols = [...volunteers];
  let availableMems = [...members];
  let currentInventory = { ...inventory };

  const useBoat = (boatTypeId: string) => {
      if (currentInventory[boatTypeId]) {
          currentInventory[boatTypeId] -= 1;
      }
  };
  
  const newId = () => Math.random().toString(36).substr(2, 9);

  // Helper: Get available boats sorted by some logic? 
  // Let's prioritize larger boats for members who need support.
  // Or just iterate definitions.
  // We'll create a flat list of available boat slots to fill.
  // Actually, iterating by boat type is easier.
  
  // Strategy:
  // 1. Prioritize Multi-seat boats (Capacity > 1) to mix Vols and Members.
  // 2. Then Single boats.

  const multiSeatBoats = boatDefinitions.filter(b => b.capacity > 1);
  const singleSeatBoats = boatDefinitions.filter(b => b.capacity === 1);

  // Sort multi-seat by capacity descending (fill big boats first)
  multiSeatBoats.sort((a, b) => b.capacity - a.capacity);

  // --- PASS 1: Fill Multi-Seat Boats (Vol + Members) ---
  for (const boatDef of multiSeatBoats) {
      let count = currentInventory[boatDef.id] || 0;
      
      while (count > 0 && (availableVols.length > 0 || availableMems.length > 0)) {
          // We need at least some people to fill a boat.
          // If capacity is large (e.g. 6), we try to put 1 Vol + 5 Members.
          
          const teamMembers: Person[] = [];
          
          // 1. Assign Captain (Volunteer)
          if (availableVols.length > 0) {
              teamMembers.push(availableVols.shift()!);
          } else {
              // No volunteers left. Can a high-rank member captain?
              // For now, let's assume if no vol, we check if members allow.
              // If we have only members left, and they are low rank, maybe we shouldn't launch this boat?
              // Let's try to fill with members anyway, and add warning.
          }

          // 2. Fill remaining spots with Members
          const spotsLeft = boatDef.capacity - teamMembers.length;
          
          for (let i = 0; i < spotsLeft; i++) {
              if (availableMems.length > 0) {
                  teamMembers.push(availableMems.shift()!);
              } else if (availableVols.length > 0) {
                  // If no members, fill with extra volunteers
                  teamMembers.push(availableVols.shift()!);
              }
          }

          if (teamMembers.length > 0) {
            // Check warnings
            const warnings: string[] = [];
            const hasVol = teamMembers.some(m => m.role === Role.VOLUNTEER);
            const lowRankMembers = teamMembers.filter(m => m.role !== Role.VOLUNTEER && m.rank <= 2);
            
            if (!hasVol && lowRankMembers.length > 0) {
                warnings.push('חברים ברמה נמוכה ללא מתנדב');
            }
            if (teamMembers.length < Math.ceil(boatDef.capacity / 2) && boatDef.capacity > 2) {
                 warnings.push('צוות מצומצם לסירה גדולה');
            }

            teams.push({
                id: newId(),
                members: teamMembers,
                boatType: boatDef.id,
                boatCount: 1,
                warnings: warnings.length > 0 ? warnings : undefined
            });
            
            useBoat(boatDef.id);
            count--;
          } else {
              break; // No people left
          }
      }
  }

  // --- PASS 2: Fill Single Boats ---
  for (const boatDef of singleSeatBoats) {
      let count = currentInventory[boatDef.id] || 0;
      
      while (count > 0 && (availableVols.length > 0 || availableMems.length > 0)) {
          let person: Person | null = null;
          let warning: string | undefined = undefined;

          // Priority: High rank members who want singles, then Vols.
          // Check for high rank members (4-5)
          const competentMemberIdx = availableMems.findIndex(m => m.rank >= 4);
          
          if (competentMemberIdx !== -1) {
              person = availableMems.splice(competentMemberIdx, 1)[0];
          } else if (availableVols.length > 0) {
              person = availableVols.shift()!;
          } else if (availableMems.length > 0) {
              // Only low rank members left?
              person = availableMems.shift()!;
              warning = 'חבר ברמה נמוכה בקיאק יחיד!';
          }

          if (person) {
              teams.push({
                  id: newId(),
                  members: [person],
                  boatType: boatDef.id,
                  boatCount: 1,
                  warnings: warning ? [warning] : undefined
              });
              useBoat(boatDef.id);
              count--;
          } else {
              break;
          }
      }
  }

  // --- PASS 3: Leftovers ---
  // If people remain but no boats, or no suitable boats.
  // Group them into a "No Boat" team or individual warnings.
  const allLeftovers = [...availableVols, ...availableMems];
  if (allLeftovers.length > 0) {
       // Create a dummy entry or multiple?
       // Let's create one "Waiting List" team or per person.
       // The original UI expects teams.
       allLeftovers.forEach(p => {
           teams.push({
               id: newId(),
               members: [p],
               boatType: 'UNKNOWN',
               boatCount: 0,
               warnings: ['אין סירה פנויה']
           });
       });
  }

  return teams;
};
