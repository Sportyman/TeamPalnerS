# TeamPlaner - Development Log & Documentation

## Overview
**TeamPlaner** is a Progressive Web App (PWA) designed for managing water sports clubs for people with disabilities (e.g., Kayaking, Sailing).
It allows managers to track attendance, manage inventory, and automatically generate pairings between volunteers/instructors and members based on rank, boat capacity, and complex social constraints.

**Developer Credit:** Shay Kalimi - @Shay.A.i

## Tech Stack
*   **Framework:** React 18+ (Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:** Zustand (with Persist middleware for localStorage)
*   **Drag & Drop:** `@hello-pangea/dnd` (Fork of React Beautiful DnD)
*   **Routing:** React Router DOM (HashRouter)
*   **Icons:** Lucide React

## Key Features
1.  **Multi-Tenant Architecture:** Supports multiple clubs (Kayak, Sailing) with separate databases, settings, and inventories.
2.  **Role-Based Logic:** Distinguishes between Instructors, Volunteers, Members, and Guests.
3.  **Smart Pairing Algorithm:** "Cluster & Fill" approach. Groups people with mandatory pairing constraints, then prioritizes filling multi-seat boats with captains (Instructors/Volunteers).
4.  **Constraint Management:**
    *   **Must Pair:** Hard constraint (Green Shield).
    *   **Prefer Pair:** Soft constraint (Yellow Heart).
    *   **Cannot Pair:** Blacklist (Red Ban).
    *   **Gender Preference:** Strict or soft gender matching.
5.  **Mobile-First Design:** Optimized for touch interactions, including complex drag-and-drop on mobile.

## Development History & Challenges

### 1. The Pairing Algorithm Saga
*   **Initial Approach:** Simple random pairing of Volunteer + Member.
*   **Issue:** Didn't account for different boat sizes (Single vs Double vs Sonar).
*   **Evolution:** Added logic for "Stable" vs "Fast" boats.
*   **Major Refactor (Cluster & Fill):** The final algorithm (current) first groups people who *must* be together into "Clusters". It then fills boats based on capacity strictness.
    *   *Step 1:* Find Captain Clusters (contain a Volunteer/Instructor).
    *   *Step 2:* Fill large boats with Captains + Passenger Clusters until capacity is reached.
    *   *Step 3:* Fill single boats with remaining individuals.
    *   *Step 4:* Overflow handling (put remainders in whatever boat is left).

### 2. The Mobile Drag-and-Drop Saga (Critical)
*   **The Problem:** On mobile devices, dragging a card caused the page to scroll (rubber-banding) or the card to "jump" to the top of the screen.
*   **Root Cause 1:** Conflict between CSS Transforms (used for page animations like Fade-In) and the `fixed` positioning strategy of the DnD library. This broke the coordinate system.
*   **Root Cause 2:** Touch events on the card were interpreted as both "Scroll Page" and "Drag Item".
*   **The Solution (Current Implementation):**
    1.  **Removed Global Animations:** Removed `animate-in fade-in` from `App.tsx` to ensure a stable stacking context.
    2.  **Isolated Drag Handle:** The drag listener (`dragHandleProps`) is applied *only* to the Grip Icon (`⋮⋮`), not the whole card.
    3.  **Touch Action:** Added `touch-action: none` inline style to the drag handle to tell the browser "Do not scroll when touching this area".
    4.  **Visual Separation:** The Draggable component is a wrapper div (for positioning), and the inner div handles the Visuals (Tilt/Rotation). This prevents the "jumping" effect when applying transforms.

### 3. State Management & Data Structure
*   **Refactoring:** Moved static data (`INITIAL_PEOPLE`, `DEFINITIONS`) out of `store.ts` into `mockData.ts` to keep the logic clean.
*   **Persistence:** Uses `localStorage`. Changing data structure requires bumping the `version` number in the `persist` middleware configuration in `store.ts`.

## Current Status (v2.9.3)
*   **Stability:** High. Mobile drag-and-drop is stable.
*   **Data:** Mock data is separated.
*   **UI:** Polished with Gender-aware labels (מתנדב/ת, מדריך/ה).
*   **Constraints:** Fully functional UI for managing relationships.

## How to Continue Development
1.  **Adding New Roles:** Update `Role` enum in `types.ts` and `getRoleLabel`.
2.  **Changing Algorithm:** Modify `services/pairingLogic.ts`. Always respect the `Cluster` structure.
3.  **Updating Data:** Edit `mockData.ts` and bump version in `store.ts` to force client migration.
4.  **Deploying:** The app is built for Vercel. Ensure `vercel.json` rewrite rules are present for SPA routing.

## Known Limitations
*   **Offline only:** Data is stored in the browser. No cloud sync between devices (yet).
*   **Performance:** Large lists (>200 people) might need virtualization, though current usage is smaller.

---
*Last Updated: 2023-10-27*
