import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const ProgressiveImage = ({
    src,
    srcSet,
    alt,
    className = '',
    width,
    height,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    placeholder = '/placeholder-image.jpg',
    lowQualitySrc,
    onError,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(placeholder);
    const imageRef = useRef(null);

    const [containerRef, isIntersecting] = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '50px'
    });
     // Only load images when they are visible
    const shouldLoad = isIntersecting;

    const [showSkeleton, setShowSkeleton] = useState(false);
    useEffect(() => {
        let t = null;
        if (shouldLoad && !isLoaded) {
            t = setTimeout(() => setShowSkeleton(true), 120); // show skeleton only after 120ms
        } else {
            setShowSkeleton(false);
        }
        return () => clearTimeout(t);
    }, [shouldLoad, isLoaded]);
    
   

    // Generate optimized srcSet
    const optimizedSrcSet = useMemo(() => {
        if (srcSet) return srcSet;

        if (src) {
            const widths = [320, 640, 768, 1024, 1280, 1920];
            return widths
                .map(width => `${src}?w=${width}&q=80 ${width}w`)
                .join(', ');
        }
        return '';
    }, [src, srcSet]);

    // Load image only when it becomes visible
    useEffect(() => {
        if (!shouldLoad || !src) return;

        const img = new Image();
        let isCancelled = false;

        const handleLoad = () => {
            if (!isCancelled) {
                setCurrentSrc(src);
                setIsLoaded(true);
            }
        };

        const handleError = (e) => {
            if (!isCancelled) {
                setHasError(true);
                setIsLoaded(true);
                setCurrentSrc(placeholder);
                onError?.(e);
            }
        };

        img.onload = handleLoad;
        img.onerror = handleError;
        img.src = src;

        return () => {
            isCancelled = true;
            img.onload = null;
            img.onerror = null;
        };
    }, [shouldLoad, src, placeholder, onError]);

    const handleError = useCallback((e) => {
        setHasError(true);
        setIsLoaded(true);
        setCurrentSrc(placeholder);
        onError?.(e);
    }, [placeholder, onError]);

    return (
        <div ref={containerRef} className={`progressive-image-container ${className}`}>
            {shouldLoad && lowQualitySrc && !isLoaded && !hasError && (
                <div className="progressive-image__blur-container">
                    <img
                        src={lowQualitySrc}
                        alt={`${alt} - Loading...`}
                        className="progressive-image__blur"
                        style={{
                            filter: 'blur(20px)',
                            transform: 'scale(1.1)',
                        }}
                    />
                </div>
            )}

            {shouldLoad && !hasError && (
                <img
                    ref={imageRef}
                    src={currentSrc}
                    srcSet={optimizedSrcSet}
                    sizes={sizes}
                    alt={alt}
                    width={width}
                    height={height}
                    onError={handleError}
                    className={`progressive-image ${isLoaded && currentSrc === src
                            ? 'progressive-image--loaded'
                            : 'progressive-image--loading'
                        } ${currentSrc !== src
                            ? 'progressive-image--low-quality'
                            : 'progressive-image--high-quality'
                        }`}
                    loading="lazy"
                    {...props}
                />
            )}

            {(!shouldLoad || !isLoaded) && !hasError && showSkeleton && (
                <div className="progressive-image__skeleton">
                    <div className="image-skeleton"></div>
                </div>
            )}

            {hasError && (
                <img
                    src={placeholder}
                    alt={`${alt} - Placeholder`}
                    className="progressive-image--error"
                />
            )}
        </div>
    );
};

export default React.memo(ProgressiveImage);