import { useRef, useCallback } from 'react';

export const useThrottle = (callback, delay) => {
    const lastRan = useRef(Date.now());
    const timeoutRef = useRef(null);

    return useCallback(
        (...args) => {
            const handler = () => {
                if (Date.now() - lastRan.current >= delay) {
                    callback(...args);
                    lastRan.current = Date.now();
                } else {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = setTimeout(() => {
                        callback(...args);
                        lastRan.current = Date.now();
                    }, delay - (Date.now() - lastRan.current));
                }
            };

            handler();
        },
        [callback, delay]
    );
};