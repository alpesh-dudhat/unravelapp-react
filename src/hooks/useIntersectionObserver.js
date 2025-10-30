import { useState, useEffect, useRef } from 'react';

export const useIntersectionObserver = (options = {}) => {
  const {
    root = null,
    rootMargin = '100px',
    threshold = 0,
    once = true,            
    debounce = 80         
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);
  const ref = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return; 
    const el = ref.current;
    if (!el) return;

    let observer = null;
    observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (!hasRendered) setHasRendered(true);
          if (once && observer) {
            observer.unobserve(el);
          }
        } else {
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
  }, [root, rootMargin, threshold, once, debounce]);

  return [ref, isIntersecting, hasRendered];
};
