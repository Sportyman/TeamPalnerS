import { Person, Role, BoatInventory, Team, BoatType } from '../types';

/**
 * The Smart Pairing Algorithm
 * 
 * Goals:
 * 1. Prioritize Vol + Member pairs.
 * 2. Balance skill levels (Strong Vol + Low Rank Member).
 * 3. Assign appropriate equipment (Double Kayaks for stability).
 */
export const generateSmartPairings = (
  people: Person[], 
  inventory: BoatInventory
): Team[] => {
  const teams: Team[] = [];
  
  // 1. Separate by Role
  const volunteers = people.filter(p => p.role === Role.VOLUNTEER);
  // Treat Guests as Members for safety matching
  const members = people.filter(p => p.role === Role.MEMBER || p.role === Role.GUEST);

  // 2. Sort Lists for Safety Optimization
  // Sort Volunteers: Strongest first (Rank 5 -> 1)
  volunteers.sort((a, b) => b.rank - a.rank);
  // Sort Members: Lowest rank (Highest Need) first (Rank 1 -> 5)
  // This ensures best volunteers get the members who need the most help.
  members.sort((a, b) => a.rank - b.rank);

  // Mutable copies to track assignment
  let availableVols = [...volunteers];
  let availableMems = [...members];
  let availableDoubles = inventory.doubles;
  let availableSingles = inventory.singles;
  
  // Helper to create a team ID
  const newId = () => Math.random().toString(36).substr(2, 9);

  // 3. Primary Pass: Create Volunteer + Member Pairs
  while (availableVols.length > 0 && availableMems.length > 0) {
    const vol = availableVols.shift()!;
    const mem = availableMems.shift()!;

    // Determine Boat
    // High need members (Rank 1-2) should get Double Kayaks if available
    let boatType: BoatType = BoatType.DOUBLE;
    let boatCount = 1;

    if (mem.rank <= 2) {
      if (availableDoubles > 0) {
        availableDoubles--;
      } else if (availableSingles >= 2 && mem.rank > 1) { // Only if not critical
        boatType = BoatType.SINGLE;
        boatCount = 2;
        availableSingles -= 2;
      } else {
        // Fallback or Error state: shortage of stable boats
        boatType = BoatType.DOUBLE; // Force allocation, mark as shortage later if needed
      }
    } else {
      // Higher rank members can potentially take singles if doubles run out
      if (availableDoubles > 0) {
        availableDoubles--;
      } else {
        boatType = BoatType.SINGLE;
        boatCount = 2;
        availableSingles -= 2; // Roughly
      }
    }

    teams.push({
      id: newId(),
      members: [vol, mem],
      boatType,
      boatCount
    });
  }

  // 4. Handle Leftover Volunteers (Pair together)
  while (availableVols.length >= 2) {
    const v1 = availableVols.shift()!;
    const v2 = availableVols.shift()!;
    
    // Vols usually prefer singles, or double if they want to chat
    let boatType = BoatType.SINGLE;
    let boatCount = 2;

    if (availableSingles >= 2) {
      availableSingles -= 2;
    } else if (availableDoubles > 0) {
      boatType = BoatType.DOUBLE;
      boatCount = 1;
      availableDoubles--;
    }

    teams.push({
      id: newId(),
      members: [v1, v2],
      boatType,
      boatCount
    });
  }

  // If 1 Vol remains
  if (availableVols.length === 1) {
    const v = availableVols.shift()!;
    teams.push({
      id: newId(),
      members: [v],
      boatType: BoatType.SINGLE,
      boatCount: 1,
      warnings: ['מתנדב ללא בן זוג']
    });
  }

  // 5. Handle Leftover Members (Critical Safety Check)
  while (availableMems.length > 0) {
    const m = availableMems.shift()!;
    
    // Can this member kayak solo?
    if (m.rank >= 4) {
       teams.push({
        id: newId(),
        members: [m],
        boatType: BoatType.SINGLE,
        boatCount: 1,
        warnings: ['חבר ללא בן זוג (רמה מאושרת)']
      });
    } else {
      // Problem: Member needs support but no volunteers left.
      // Group them into a "Waiting List" team or simplified error team
      teams.push({
        id: newId(),
        members: [m],
        boatType: BoatType.SINGLE,
        boatCount: 0,
        warnings: ['דורש בן זוג - אין מתנדב פנוי']
      });
    }
  }

  return teams;
};