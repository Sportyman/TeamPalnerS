
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
      if (currentInventory[boatTypeId] > 0) {
          currentInventory[boatTypeId] -= 1;
          return true;
      }
      return false;
  };
  
  const newId = () => Math.random().toString(36).substr(2, 9);

  // Helper: Sort boats
  const multiSeatBoats = boatDefinitions.filter(b => b.capacity > 1);
  const singleSeatBoats = boatDefinitions.filter(b => b.capacity === 1);

  // Sort multi-seat by capacity descending (fill big boats first)
  multiSeatBoats.sort((a, b) => b.capacity - a.capacity);

  // Helper to check constraints
  const isCompatible = (person: Person, currentTeam: Person[]): boolean => {
      // 1. Check Hard Blacklist (Cannot Pair With)
      if (person.cannotPairWith) {
          for (const teammate of currentTeam) {
              if (person.cannotPairWith.includes(teammate.id)) return false;
          }
      }
      // Check reciprocity of blacklist
      for (const teammate of currentTeam) {
          if (teammate.cannotPairWith && teammate.cannotPairWith.includes(person.id)) return false;
      }
      
      // 2. Gender Constraints (Simplified for now - only hard blocks if we implemented Strict Mode)
      // For now, we allow the match but rely on UI warnings, unless it's a "Must"
      // Implementing strict logic would require more complex backtracking.
      
      return true;
  };

  // Helper to handle "Must Pair With" groups (Clusters)
  // This function tries to find people who MUST be together and moves them to the front of the queue
  // Note: This is a basic implementation. Complex chains (A->B->C) might need graph traversal.
  const pullMustPairPartners = (primary: Person, sourceList: Person[]): Person[] => {
      if (!primary.mustPairWith || primary.mustPairWith.length === 0) return [];
      
      const partners: Person[] = [];
      primary.mustPairWith.forEach(partnerId => {
          const idx = sourceList.findIndex(p => p.id === partnerId);
          if (idx !== -1) {
              partners.push(sourceList[idx]);
              sourceList.splice(idx, 1); // Remove from pool
          }
      });
      return partners;
  };

  // --- PASS 1: Fill Multi-Seat Boats (STRICT: Must have a Member) ---
  for (const boatDef of multiSeatBoats) {
      let count = currentInventory[boatDef.id] || 0;
      
      while (count > 0 && (availableVols.length > 0 || availableMems.length > 0)) {
          
          if (availableMems.length === 0) {
              break; 
          }

          const teamMembers: Person[] = [];
          
          // 1. Assign Captain (Volunteer)
          if (availableVols.length > 0) {
              const vol = availableVols.shift()!;
              teamMembers.push(vol);
              
              // Check if vol has any attached partners (rare but possible)
              const volPartners = pullMustPairPartners(vol, availableVols); // Look in vol list
              teamMembers.push(...volPartners);
              // Also check mem list? usually vol pairs with vol or specific member
          }

          // 2. Fill remaining spots with Members
          // Try to fill up to capacity
          while (teamMembers.length < boatDef.capacity) {
               if (availableMems.length > 0) {
                   // Try to find a compatible member
                   // Preference logic: Try to find someone who prefers current team members
                   let candidateIdx = -1;
                   
                   // Priority 1: Someone who is preferred by current team or prefers current team
                   candidateIdx = availableMems.findIndex(m => {
                       if (!isCompatible(m, teamMembers)) return false;
                       // Check Preference Match
                       const prefersTeam = m.preferPairWith?.some(id => teamMembers.find(tm => tm.id === id));
                       const teamPrefers = teamMembers.some(tm => tm.preferPairWith?.includes(m.id));
                       return prefersTeam || teamPrefers;
                   });

                   // Priority 2: Anyone compatible
                   if (candidateIdx === -1) {
                       candidateIdx = availableMems.findIndex(m => isCompatible(m, teamMembers));
                   }

                   // If absolutely no one compatible found (rare), just take next (and let UI show warning) 
                   // or skip boat? Let's take next for now to ensure everyone gets a boat.
                   if (candidateIdx === -1) candidateIdx = 0;

                   const mem = availableMems.splice(candidateIdx, 1)[0];
                   teamMembers.push(mem);

                   // Pull attached partners (Must Pair)
                   const partners = pullMustPairPartners(mem, availableMems);
                   teamMembers.push(...partners);
               } else if (availableVols.length > 0 && teamMembers.length < boatDef.capacity) {
                   // Fill with extra volunteers
                   teamMembers.push(availableVols.shift()!);
               } else {
                   break; // No one left
               }
          }

          // Validation: Did we actually create a valid team?
          // We want at least one person.
          if (teamMembers.length > 0) {
             const warnings: string[] = [];
             const hasVol = teamMembers.some(m => m.role === Role.VOLUNTEER);
             const boatCapacity = boatDef.capacity;
             
             // STRICT WARNING: Multi-seat boat with members but no volunteer
             // Logic: If capacity > 1 AND has members AND NO volunteer -> Warn
             if (boatCapacity > 1 && !hasVol && teamMembers.length > 0) {
                 warnings.push('צוות ללא מתנדב');
             }
             
             // Commit the team
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
              break; 
          }
      }
  }

  // --- PASS 2: Fill Single Boats ---
  for (const boatDef of singleSeatBoats) {
      let count = currentInventory[boatDef.id] || 0;
      
      while (count > 0 && (availableVols.length > 0 || availableMems.length > 0)) {
          let person: Person | null = null;
          let warning: string | undefined = undefined;

          // Priority: High rank members -> Volunteers -> Low rank members (with warning)
          const competentMemberIdx = availableMems.findIndex(m => m.rank >= 4);
          
          if (competentMemberIdx !== -1) {
              person = availableMems.splice(competentMemberIdx, 1)[0];
          } else if (availableVols.length > 0) {
              person = availableVols.shift()!;
          } else if (availableMems.length > 0) {
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

  // --- PASS 3: Overflow (Leftover Volunteers to Remaining Multi-Seat) ---
  // If we still have volunteers and multi-seat boats, put them there (even alone or pairs)
  if (availableVols.length > 0) {
      for (const boatDef of multiSeatBoats) {
          let count = currentInventory[boatDef.id] || 0;
          while (count > 0 && availableVols.length > 0) {
              const teamMembers: Person[] = [];
              // Fill boat with volunteers up to capacity
              for(let i=0; i<boatDef.capacity; i++) {
                  if(availableVols.length > 0) teamMembers.push(availableVols.shift()!);
              }

              teams.push({
                  id: newId(),
                  members: teamMembers,
                  boatType: boatDef.id,
                  boatCount: 1,
                  warnings: teamMembers.length < boatDef.capacity && boatDef.capacity > 2 ? ['צוות חסר'] : undefined
              });
              useBoat(boatDef.id);
              count--;
          }
      }
  }

  // --- PASS 4: Leftovers (No Boat) ---
  const allLeftovers = [...availableVols, ...availableMems];
  if (allLeftovers.length > 0) {
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
