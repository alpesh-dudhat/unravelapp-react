import { useState, useEffect } from 'react';

export const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // Throttle resize events
        let timeoutId = null;
        const throttledResize = () => {
            if (timeoutId) return;
            timeoutId = setTimeout(() => {
                handleResize();
                timeoutId = null;
            }, 150);
        };

        window.addEventListener('resize', throttledResize);
        return () => {
            window.removeEventListener('resize', throttledResize);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    return windowDimensions;
};