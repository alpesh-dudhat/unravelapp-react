import { useState, useEffect, useRef } from 'react';

export const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasRendered, setHasRendered] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            const nowIntersecting = entry.isIntersecting;
            setIsIntersecting(nowIntersecting);
            
            if (nowIntersecting && !hasRendered) {
                setHasRendered(true);
            }
        }, {
            root: null,
            rootMargin: '100px',
            threshold: 0.1,
            ...options
        });

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [options, hasRendered]);

    return [ref, isIntersecting, hasRendered];
};

export const useHover = () => {
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => setIsHovered(false);

        node.addEventListener('mouseenter', handleMouseEnter);
        node.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            node.removeEventListener('mouseenter', handleMouseEnter);
            node.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return [ref, isHovered];
};