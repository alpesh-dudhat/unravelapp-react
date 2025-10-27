# Unravel — Rooms Listing

> Lightweight React + Vite app demonstrating an optimized, performant hotel room listing with progressive media loading, client-side pagination, and clean component architecture.

---

## Table of contents

1. [Overview](#overview)  
2. [Quick start](#quick-start)  
3. [Project structure](#project-structure)  
4. [Architecture & responsibilities](#architecture--responsibilities)  
5. [Key components & hooks](#key-components--hooks)  
6. [Data normalization & media priority](#data-normalization--media-priority)  
7. [Performance optimizations applied](#performance-optimizations-applied)  
8. [Accessibility & UX considerations](#accessibility--ux-considerations)  


---

## Overview

This project is a small React application built with **Vite** that renders a paginated list of hotel rooms. Each room card shows primary media (video or image). An expanded variants panel lists all booking variants for a room (each variant shows detailed info and media). The app focuses on avoiding unnecessary work — lazy-loading media, keeping DOM small, and using memoization to prevent wasted renders.

The sample data (`src/assets/sample.json`) is normalized and paginated on the client to mimic server-backed listings.

---

## Quick start

**Prerequisites**

- Node.js 16+ (recommended)
- npm (or yarn)

**Install & run (development)**

```bash
npm install
npm run dev
# open http://localhost:5173
```

**Build & preview**

```bash
npm run build
npm run preview
```

---

## Project structure

```
src/
├─ app/
│  └─ store.js                    # Redux Toolkit store setup
├─ assets/
│  └─ sample.json                 # sample dataset (normalized in client)
├─ components/
│  ├─ App.jsx
│  ├─ RoomList.jsx
│  ├─ RoomCard.jsx
│  ├─ RoomCardSkeleton.jsx
│  ├─ VariantCard.jsx
│  ├─ VariantMini.jsx
│  ├─ ExpandedVariantsPanel.jsx
│  ├─ ProgressiveImage.jsx
│  └─ OptimizedVideo.jsx
├─ features/
│  └─ roomSlice.js                # redux slice: loadRooms, loadMoreRooms
├─ hooks/
│  ├─ useIntersectionObserver.js
│  ├─ useInfiniteScroll.js
│  ├─ useHover.js
│  ├─ useDebounce.js
│  ├─ useThrottle.js
│  └─ useWindowDimensions.js
├─ styles/
│  └─ expanded-panel.scss
├─ utils/
│  ├─ roomsUtils.js               # normalizeRooms
│  └─ mediaUtils.js               # getMediaForVariant
└─ main.jsx
```

---

## Architecture & responsibilities

- **Presentation**: small focused components; heavy work delegated to `ProgressiveImage` and `OptimizedVideo`.
- **State**: Redux Toolkit (`rooms` slice) holds normalized data and client-side pagination state. UI-specific state (expanded panel id, hovered state) is local.
- **Normalization**: `normalizeRooms` maps the raw API/sample payload to a consistent shape with variant-level `media`, `promo`, and `cancellationInfo`.
- **Separation of concerns**:
  - `RoomList` — orchestration, infinite scroll, skeletons, expanded panel state.
  - `RoomCard` — collapsed card showing room-level media + first two `VariantMini`s and "See more".
  - `ExpandedVariantsPanel` — accessible slide-in panel that lists `VariantCard`s.
  - `VariantCard` — full variant details (media, display properties, promo, price, cancellation, select CTA).

---

## Key components & hooks

**RoomList**
- Loads initial rooms and triggers pagination with `useInfiniteScroll`.
- Renders skeletons while loading and manages `expandedRoomId` state for the variants panel.

**RoomCard**
- Shows room-level media and two variant names via `VariantMini`.
- Offers a "See more" button to expand full variants.

**VariantMini**
- Lightweight pill showing `variant.name` for the first two variants in collapsed view.

**ExpandedVariantsPanel**
- Slide-in panel (desktop) / full-screen modal (mobile) listing `VariantCard`s.
- Handles focus trap and close actions (Esc and click outside).

**VariantCard**
- Shows media (video preferred), name, bed type, occupancy, price info, promo totals, cancellation policy, and `Select` CTA.
- Uses `useIntersectionObserver` to lazy-mount media.

**ProgressiveImage**
- LQIP + `srcSet` generation + intersection-based lazy-load + fallback placeholder.

**OptimizedVideo**
- Lazy-loads video only when visible and cleans up on unmount.
- Stores high-frequency `timeupdate` data in refs to avoid re-renders.

**Hooks**
- `useIntersectionObserver` — per-element visibility hook (`[ref, isIntersecting, hasRendered]`).
- `useInfiniteScroll` — observes the list’s last element and triggers `loadMore()`; includes re-entrancy guards (`isLoadingRef`, `hasMoreRef`, `pendingRef`).
- `useHover`, `useDebounce`, `useThrottle`, `useWindowDimensions` — utility hooks used across components.

---

## Data normalization & media priority

`normalizeRooms` maps raw payload into this stable variant shape:

```js
{
  id,
  name,
  price,
  currency,
  priceInfo,
  isBookable,
  displayProperties,
  cancellationInfo,
  promo: { offer_title, offer_total_price, offer_discounted_total_price },
  media: { type: 'video'|'image', src } || null,
  raw: { ...originalVariant }
}
```

**Media priority (variant-level rule)**:
1. Variant-level video (`variant.properties?.video_url?.med`) — use as variant media.
2. Room-level video (`room.properties?.video_url?.med`) — fallback.
3. Variant-level images (if present).
4. Room-level images (`room.properties.room_images`).
5. If none → do not render media container.

`getMediaForVariant` implements this logic and is used by `VariantCard` and `normalizeRooms`.

---

## Performance optimizations applied

1. **Lazy-loading (IntersectionObserver)**
   - Images/videos load only when they enter the viewport. `useIntersectionObserver` supports `once: true` and `hasRendered` to avoid repeated toggles.

2. **Client-side pagination + infinite scroll**
   - `rooms` slice normalizes all sample rooms into `allRooms` and serves pages into `rooms`.
   - `useInfiniteScroll` watches the last element and triggers `loadMoreRooms()` with guards to prevent duplicates.

3. **Low-quality image placeholders (LQIP)**
   - `ProgressiveImage` supports `lowQualitySrc` blurred placeholders for perceived speed.

4. **Memoization & stable callbacks**
   - Heavy calculations use `useMemo`; event handlers use `useCallback`.
   - UI components are `React.memo` wrapped.

5. **Throttling & debouncing**
   - `useThrottle` and `useDebounce` used for high-frequency events (resize, rapid intersections).
   - Intersection hook uses a small debounce to reduce flicker.

6. **Reserve layout & avoid reflow**
   - Media containers use `aspect-ratio` to prevent layout shift when media mounts.

7. **Video cleanup & reduced re-renders**
   - `OptimizedVideo` removes `src` and calls `load()` on unmount; high-frequency events (timeupdate) use refs.

8. **Skeletons with delayed show**
   - Skeletons are shown immediately but only appear after a small delay (e.g., 120ms) to avoid flicker for fast-loading media.

9. **Virtualization (recommended for large lists)**
   - For 100s+ rooms consider `react-window` / `react-virtualized`. For ~100–200 rooms with lazy media, current approach is fine.

---

## Accessibility & UX considerations

- `ExpandedVariantsPanel` uses `role="dialog"` and traps focus on open (restores focus on close).
- `aria-expanded` is applied to See More buttons.
- Panel can be closed with `Esc` and by clicking outside.
- `VariantMini` uses `aria-label` and `title` for screen readers and hover previews.
- When panel opens, media in the panel should mount immediately (force-load for keyboard users).

---

