// src/hooks/useIntersectionObserver.js
import { useState, useEffect, useRef } from 'react';

export const useIntersectionObserver = (options = {}) => {
  const {
    root = null,
    rootMargin = '100px',
    threshold = 0,
    once = true,            // new default: observe once then stop
    debounce = 80           // ms; prevents instant flicker
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);
  const ref = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard
    const el = ref.current;
    if (!el) return;

    let observer = null;
    observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      // debounce small rapid toggles
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (!hasRendered) setHasRendered(true);
          if (once && observer) {
            observer.unobserve(el);
          }
        } else {
          // if once=true we don't need to update to false after first render
          if (!once) setIsIntersecting(false);
        }
      }, debounce);
    }, { root, rootMargin, threshold });

    observer.observe(el);

    return () => {
      clearTimeout(timeoutRef.current);
      if (observer && el) observer.unobserve(el);
      if (observer) observer.disconnect();
    };
    // we intentionally do not include hasRendered in dependency list to avoid reattaching observers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, rootMargin, threshold, once, debounce]);

  return [ref, isIntersecting, hasRendered];
};


// import { useState, useEffect, useRef } from 'react';

// export const useIntersectionObserver = (options = {}) => {
//     const [isIntersecting, setIsIntersecting] = useState(false);
//     const [hasRendered, setHasRendered] = useState(false);
//     const ref = useRef(null);

//     useEffect(() => {
//         const element = ref.current;
//         if (!element) return;

//         const observer = new IntersectionObserver(([entry]) => {
//             const nowIntersecting = entry.isIntersecting;
//             setIsIntersecting(nowIntersecting);
            
//             if (nowIntersecting && !hasRendered) {
//                 setHasRendered(true);
//             }
//         }, {
//             root: null,
//             rootMargin: '100px',
//             threshold: 0.1,
//             ...options
//         });

//         observer.observe(element);

//         return () => {
//             observer.unobserve(element);
//         };
//     }, [options, hasRendered]);

//     return [ref, isIntersecting, hasRendered];
// };

// export const useHover = () => {
//     const [isHovered, setIsHovered] = useState(false);
//     const ref = useRef(null);

//     useEffect(() => {
//         const node = ref.current;
//         if (!node) return;

//         const handleMouseEnter = () => setIsHovered(true);
//         const handleMouseLeave = () => setIsHovered(false);

//         node.addEventListener('mouseenter', handleMouseEnter);
//         node.addEventListener('mouseleave', handleMouseLeave);

//         return () => {
//             node.removeEventListener('mouseenter', handleMouseEnter);
//             node.removeEventListener('mouseleave', handleMouseLeave);
//         };
//     }, []);

//     return [ref, isHovered];
// };