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
            // console.log('Loading video because it became visible');
            setShouldLoadVideo(true);
        }
    }, [isIntersecting, hasRendered, shouldLoadVideo]);

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

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !shouldLoadVideo || !isLoaded) return;

        const playVideo = async () => {
            try {
                if (isHovered) {
                    if (video.currentTime !== currentTime) {
                        video.currentTime = currentTime;
                    }
                    await video.play();
                    // console.log('Video playing from time:', currentTime);
                } else {
                    video.pause();
                    // console.log('Video paused at time:', currentTime);
                }
            } catch (error) {
                // console.warn('Video play failed:', error);
                if (error.name === 'NotAllowedError') {
                    video.muted = true;
                    try {
                        await video.play();
                    } catch (e) {
                        console.warn('Muted video play also failed:', e);
                    }
                }
            }
        };

        playVideo();
    }, [isHovered, shouldLoadVideo, isLoaded, currentTime]);

    const handleCanPlay = useCallback(() => {
        setIsLoaded(true);
        // console.log('Video can play');
    }, []);

    const handleError = useCallback((e) => {
        // console.error('Video error:', e);
        setHasError(true);
        setIsLoaded(true);
        onError?.(e);
    }, [onError]);

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
                    onError={handleError}
                    className={`optimized-video ${
                        isLoaded ? 'optimized-video--loaded' : 'optimized-video--loading'
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
                </div>
            )}

        
        </div>
    );
};

export default React.memo(OptimizedVideo);