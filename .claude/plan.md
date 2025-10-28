# Profile Buttons & Trays Redesign Plan - PHASE 1 (MVP)

## Overview
Redesign the profile buttons in the Timeline header and the ProfileTray component to be more interactive and delightful. Focus on layout improvements, presence indicators, and basic visual feedback. Phase 1 keeps scope tight with essential features only.

**Estimated Time:** 2-3 hours
**Complexity:** Medium
**Scope:** Layout redesign + basic animations, no complex micro-interactions yet

---

## Part 1: Profile Buttons Redesign

**Location:** `src/screens/timeline/TimelineScreen.tsx` (lines 562-621)

### Current State
- Two small avatars (32px) with colored rings (cyan for user, pink for partner)
- Status dots showing online status
- Minimal interaction feedback
- Connection line between avatars

### Phase 1 Changes

#### 1. Visual Enhancements
- **Avatar ring:** Increase border width from 2 to 3 (slightly more prominent)
- **Status dots:** Increase from 14px to 18px (more visible)
- **Partner presence pulse:** Add subtle breathing animation to partner status dot (1 → 1.15, 2s cycle)

#### 2. Simple Press Feedback
- **Glow effect:** When button pressed, add brief glow (scale 0 → 1.2 → 0, 300ms fade)
- User button: Cyan glow (#4ECDC4)
- Partner button: Pink glow (#FF6B9D)
- No complex spring physics in Phase 1

#### 3. Styling Changes
- Enhanced avatar ring: border width 2 → 3, increased shadow slightly
- Status dots: 14px → 18px, better visibility
- Simple glow animation on press (opacity fade, no scale transforms)

---

## Part 2: ProfileTray Redesign - Phase 1 Focus

**Location:** `src/components/ProfileTray.tsx`

### Current State
- Avatar 72px
- Status/action options in 2-column grid with pills
- Basic styling, minimal spacing
- Functional but not premium feeling

### Phase 1 Changes

#### 1. Layout & Spacing Restructuring

**Profile Section:**
- Increase padding: 24px → 32px (spacious feel)
- Add subtle divider line below avatar section (rgba border)
- More breathing room overall

**Avatar:**
- Increase from 72px to 100px (better visual hierarchy)
- Enhanced shadow for elevation feel
- Keep breathing animation same (1.02 scale, 2s cycle)

#### 2. For User Tray (Status Setting)

**Status Display:**
- Current status badge larger text: 14px → 16px, bold
- Color-coded background matching status type
- More padding around status badge

**Status Options Cards:**
- Change from 2-column wrap to full-width layout
- Each status option becomes a full-width card (100%)
- Emoji size larger: 18px → 28px
- More spacing: gap 12 → 16
- Color-coded borders matching status color
- Simple padding increase for breathing room

**Custom Status Input:**
- Keep existing functionality
- Slightly larger input field
- Keep character count messaging as-is

**Celebration:**
- Simple toast on submit: "Status updated! 🎉"
- No confetti or complex animations in Phase 1

#### 3. For Partner Tray (Send Love)

**Partner Status Display (NEW):**
- Add section at top showing partner's current status
- Format: "Alex is crushing it 💪"
- Simple badge with color matching their status
- Adds presence feeling without complexity

**Action Cards:**
- Change from 2-column grid to full-width layout
- Larger action cards (min height 80px)
- Emoji size larger: 18px → 32px in colored circle background
- Add flavor text below action label (randomized text)
- Color-coded borders matching action color
- Simple hover/press scale (0.98 → 1) on interaction

**Action Flavor Text System:**
- Randomized text for each action type
- Examples:
  - Nudge: "Hey, I'm thinking of you" / "Missing you!" / "You there?"
  - High-Five: "You're doing amazing!" / "Crushing it!" / "You rock!"
  - Heart: "I love you" / "You mean the world to me" / "Always thinking of you"
  - Encouragement: "You've got this!" / "Keep pushing!" / "You're unstoppable!"

**Press Feedback:**
- Simple scale animation on press: scale 0.98 → 1
- Toast confirmation: "You sent a ❤️ to Alex"
- Close tray smoothly (fade out 300ms)

#### 4. Simple Close Animation
- Tray fades and slides down smoothly
- No complex momentum or physics in Phase 1
- 300ms duration, ease-out easing

---

## Animation Details (Phase 1 - Minimal)

### Shared Values to Add

**TimelineScreen:**
- `partnerPresencePulse` - Partner status dot breathing
- `userGlow` - User button glow (opacity fade)
- `partnerGlow` - Partner button glow (opacity fade)

**ProfileTray:**
- `actionPressScale` - Simple press scale on action cards

### Animation Timing (Keep Simple)

- **Glow effects:** 200-300ms fade in/out (opacity only)
- **Status dot pulse:** 1500-2000ms breathing cycle
- **Press feedback:** 100ms scale (0.98 → 1 → 0.98)
- **Close animation:** 300ms ease-out fade

---

## File Modifications Summary

| File | Changes | Scope |
|------|---------|-------|
| `src/screens/timeline/TimelineScreen.tsx` | Button styling, glow setup, presence pulse | ~80 lines |
| `src/components/ProfileTray.tsx` | Layout redesign, larger cards, flavor text | ~120 lines |

---

## Implementation Order (8 Steps, 2-3 hours)

1. **Enhance profile button styling** (avatar ring, status dots, sizing)
2. **Add presence pulse animation** to partner status dot
3. **Add glow animation values** and styling to buttons
4. **Redesign ProfileTray layout** (padding, spacing, avatar size 100px)
5. **Convert status pills to full-width cards** with larger emoji
6. **Convert action pills to full-width cards** with flavor text system
7. **Add simple press scale animation** to action cards
8. **Test on real device** (60 FPS, no jank)

---

## Design Principles Applied (Phase 1)

✅ **Benji:**
- Purposeful styling (every visual change has intent)
- Flawless execution (clean, polished layout)
- Trust signals (clear visual hierarchy)

✅ **Honkish:**
- Presence tangibility (status indicator visible, flavor text adds personality)
- Playfulness (randomized flavor text creates discovery)
- Micro-details (larger emoji, color coding, breathing space)

---

## Success Criteria (Phase 1)

- ✅ Profile buttons feel more inviting (larger elements)
- ✅ Presence indicator clearly shows partner is online (breathing pulse)
- ✅ ProfileTray layout feels spacious and premium
- ✅ Status/action cards are larger and easier to tap
- ✅ Flavor text adds personality and micro-delight
- ✅ All animations smooth 60 FPS (no jank)
- ✅ Simple press feedback feels responsive
- ✅ Glow effects subtle but visible

---

## What's NOT in Phase 1 (Save for Phase 2)

- ❌ Text morphing on status change
- ❌ Spring physics animations
- ❌ Confetti or particle effects
- ❌ Haptic feedback
- ❌ Complex directional animations
- ❌ ActionCard reusable component
- ❌ Connection line glow animation
- ❌ Easter eggs

---

## Phase 2 (Future - 1-2 hours)

When you want more polish:
- Add text morphing to status changes (Benji signature technique)
- Add spring physics to press animations
- Add confetti/particles on celebration
- Extract ActionCard reusable component
- Add Easter eggs and flavor text variations
- Enhance connection line animation

---

**Status:** Ready for execution
**Files to modify:** 2
**Time estimate:** 2-3 hours
**Complexity:** Medium-Low (mostly layout + simple animations)
