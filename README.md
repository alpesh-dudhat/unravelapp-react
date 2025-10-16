# Unravel — Rooms Listing (README)

> Lightweight React + Vite project showcasing optimized media loading, client-side pagination, and clean component architecture.

---

## Table of contents

1. [Overview](#overview)
2. [Getting started](#getting-started)
3. [Project structure & architecture](#project-structure--architecture)
4. [Key components and hooks](#key-components-and-hooks)
5. [State management](#state-management)
6. [Performance optimizations applied](#performance-optimizations-applied)
7. [Build & deployment notes](#build--deployment-notes)
8. [Troubleshooting & common issues](#troubleshooting--common-issues)
9. [Future improvements](#future-improvements)

---

# Overview

This project is a small React application bootstrapped with **Vite**. It renders a list of hotel rooms with media (images/videos), implements client-side pagination using a normalized sample dataset, and focuses on performance-friendly patterns for media-heavy UI.

The sample data (`src/assets/sample.json`) is normalized and paginated on the client to mimic server-backed listings.


# Getting started

**Prerequisites**
- Node.js (recommended 16+)
- npm

**Install & run (development)**

```bash
npm install
npm run dev
```

Open `http://localhost:5173` (default Vite port) in your browser.

**Build for production**

```bash
npm run build
npm run preview    # preview production build locally
```


# Project structure & architecture

```
src/
├─ app/
│  └─ store.js            # Redux store setup (RTK)
├─ assets/
│  └─ sample.json         # sample data + static assets (images)
├─ components/
│  ├─ RoomList.jsx        # infinite-scroll list and skeletons
│  ├─ RoomCard.jsx        # card that shows images or video
│  ├─ RoomCardSkeleton.jsx
│  ├─ ProgressiveImage.jsx
│  └─ OptimizedVideo.jsx
├─ features/
│  └─ roomSlice.js        # redux slice: loadRooms, loadMoreRooms
├─ hooks/
│  ├─ useIntersectionObserver.js
│  ├─ useInfiniteScroll.js
│  ├─ useHover.js
│  ├─ useDebounce.js
│  ├─ useThrottle.js
│  └─ useWindowDimensions.js
├─ utils/
│  └─ roomsUtils.js       # normalizeRooms
├─ App.jsx
└─ main.jsx
```

**Architecture notes**
- Single-page React app built with Vite for fast dev server and optimized builds.
- Global state via **Redux Toolkit** (small slice `rooms` keeps UI state + pagination state).
- Components are function components with hooks and memoization where appropriate.
- Media handling is delegated to `ProgressiveImage` and `OptimizedVideo` components to keep `RoomCard` simple.


# Key components and hooks

## `RoomList`
- Orchestrates loading initial rooms and loading more via an infinite scroll.
- Renders skeletons while loading.
- Uses `useInfiniteScroll` hook for intersection-observer based pagination trigger.

## `RoomCard`
- Decides whether to render a video (`OptimizedVideo`) or image carousel (`ProgressiveImage`).
- Uses `useMemo` and `useCallback` to avoid unnecessary recalculation and re-renders.

## `ProgressiveImage`
- Lazy-loads images only when they enter the viewport (via `useIntersectionObserver`).
- Optionally shows a low-quality blurred placeholder (`lowQualitySrc`) while the high-quality image loads.
- Builds a `srcSet` dynamically (with width query params) when not provided.
- Handles error fallback to a placeholder image.
- Uses `loading="lazy"` and a JS preloader to set state when the image is ready.

## `OptimizedVideo`
- Waits until the component is intersecting the viewport before setting `shouldLoadVideo`.
- Tracks `currentTime` and `isHovered` (via `useHover`) to play/pause video when hovered.
- Uses `onCanPlay` to mark `isLoaded` and apply fade-in via CSS.
- Cleans up video source on unmount to release memory.

## Hooks
- `useIntersectionObserver` — wrapper around `IntersectionObserver` with `hasRendered` helper.
- `useInfiniteScroll` — attaches an observer to the last list item and calls `loadMore` when needed.
- `useHover` — simple hover detector with `mouseenter`/`mouseleave` listeners.
- `useDebounce` / `useThrottle` — utility hooks for rate-limiting frequent events.
- `useWindowDimensions` — throttled window resize listener.


# State management

We use **Redux Toolkit** and a single `rooms` slice (`features/roomSlice.js`) with the following responsibilities:

- Normalize `sample.json` into a flat array of room objects (`normalizeRooms`).
- Provide `loadRooms` reducer to populate `allRooms` and the first page into `rooms`.
- Provide `loadMoreRooms` reducer to append the next page into `rooms` and maintain pagination flags.
- Provide `resetRooms` / `setRoomsPagination` for UI control.

The store is configured in `app/store.js` and disables immutable/serializable checks in middleware to avoid warnings for certain non-serializable values (only do this intentionally and with caution).


# Performance optimizations applied

This project focuses on fast initial load and reduced runtime work. Key strategies used:

### 1. Lazy-loading & Intersection Observer
- Images and videos are only loaded when they enter the viewport (`useIntersectionObserver`). This reduces initial network traffic and memory usage.

### 2. Low-quality placeholders (LQIP)
- `ProgressiveImage` can accept a `lowQualitySrc` which is shown blurred while full-res image loads — perceived performance improvement.

### 3. Memoization & stable callbacks
- Heavy computations (finding cheapest variant, display properties) are wrapped in `useMemo`.
- Event handlers and navigation functions are stable via `useCallback`.
- Presentational components are wrapped in `React.memo` to prevent re-renders when props are unchanged.

### 4. Throttling / Debouncing
- `useThrottle` and `useDebounce` are available for window resize, search, or other frequent updates.

### 5. Skeletons for perceived performance
- Loading skeletons are rendered immediately to reduce layout shift and give faster perceived response.

### 6. Small-bundle-friendly setup
- Vite + ESM produces small dev/production bundles and fast HMR.
- Components are small and focused which helps tree-shaking.

### 7. Media cleanup
- `OptimizedVideo` removes `src` and calls `load()` on cleanup to free memory and avoid continuing network usage.

