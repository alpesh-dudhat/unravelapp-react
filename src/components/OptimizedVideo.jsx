import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useHover } from '../hooks/useHover';

const OptimizedVideo = ({
    src,
    className = '',
    muted = true,
    loop = true,
    playsInline = true,
    preload = 'metadata',
    onError,
    ...props
}) => {
    const videoRef = useRef(null);
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isSafari, setIsSafari] = useState(false);

    useEffect(() => {
        const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        setIsSafari(isSafariBrowser);
    }, []);

    const [containerRef, isIntersecting, hasRendered] = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '100px'
    });

    const [hoverRef, isHovered] = useHover();

    const setRefs = useCallback((node) => {
        containerRef.current = node;
        hoverRef.current = node;
    }, [containerRef, hoverRef]);

    useEffect(() => {
        if (isIntersecting && hasRendered && !shouldLoadVideo) {
            setShouldLoadVideo(true);
        }
    }, [isIntersecting, hasRendered, shouldLoadVideo]);

    // Track video time
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, []);

    const handleCanPlay = useCallback(() => {
        console.log('Video can play');
        setIsLoaded(true);
    }, []);

    const handleLoadedData = useCallback(() => {
        console.log('Video loaded data');
        setIsLoaded(true);
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        console.log('Video loaded metadata');
        if (isSafari) {
            setIsLoaded(true);
        }
    }, [isSafari]);

    const handleError = useCallback((e) => {
        console.error('Video error:', e);
        setHasError(true);
        setIsLoaded(true);
        onError?.(e);
    }, [onError]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !shouldLoadVideo || !isLoaded) return;

        const controlVideo = async () => {
            try {
                if (isHovered) {
                    if (video.currentTime !== currentTime) {
                        video.currentTime = currentTime;
                    }
                    await video.play();
                    console.log('Video playing from time:', currentTime);
                } else {
                    video.pause();
                    console.log('Video paused, showing current frame as thumbnail');
                }
            } catch (error) {
                console.warn('Video play failed:', error);
                if (error.name === 'NotAllowedError') {
                    video.muted = true;
                    try {
                        await video.play();
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        };

        controlVideo();
    }, [isHovered, shouldLoadVideo, isLoaded, currentTime]);

    useEffect(() => {
        if (!shouldLoadVideo || !src || isLoaded) return;

        const safariFallbackTimer = setTimeout(() => {
            if (isSafari && !isLoaded) {
                console.log('Safari fallback: forcing loaded state');
                setIsLoaded(true);
            }
        }, 3000);

        return () => clearTimeout(safariFallbackTimer);
    }, [shouldLoadVideo, src, isLoaded, isSafari]);

    useEffect(() => {
        if (!shouldLoadVideo) {
            return;
        }

        const videoElement = videoRef.current;

        return () => {
            if (videoElement) {
                videoElement.pause();
                videoElement.removeAttribute('src');
                videoElement.load();
            }
        };
    }, [shouldLoadVideo, src]);

    return (
        <div ref={setRefs} className={`optimized-video-container ${className}`}>
            {shouldLoadVideo && src && !hasError && (
                <video
                    ref={videoRef}
                    src={src}
                    muted={muted}
                    loop={loop}
                    playsInline={playsInline}
                    preload={preload}
                    onCanPlay={handleCanPlay}
                    onLoadedData={handleLoadedData}
                    onLoadedMetadata={handleLoadedMetadata}
                    onError={handleError}
                    className={`optimized-video ${isLoaded ? 'optimized-video--loaded' : 'optimized-video--loading'
                        }`}
                    style={{ opacity: isLoaded ? 1 : 0 }}
                    {...props}
                />
            )}

            {shouldLoadVideo && !isLoaded && !hasError && (
                <div className="optimized-video__loading">
                    <div className="video-skeleton"></div>
                </div>
            )}

            {hasError && (
                <div className="optimized-video__error">
                    <span>Video failed to load</span>
                </div>
            )}

            {isLoaded && !isHovered && (
                <div className="optimized-video__hover-indicator">
                    <div className="hover-play-icon">▶</div>
                    <span>Hover to play</span>
                </div>
            )}
        </div>
    );
};

export default React.memo(OptimizedVideo);