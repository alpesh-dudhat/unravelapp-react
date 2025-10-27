import { useCallback, useEffect, useRef } from 'react';

export const useInfiniteScroll = (loadMore, hasMore, isLoading, options = {}) => {
    const {
        root = null,
        rootMargin = '500px',
        threshold = 0
    } = options;

    const observerRef = useRef(null);
    const isLoadingRef = useRef(isLoading);
    const hasMoreRef = useRef(hasMore);
    

    useEffect(() => {
        isLoadingRef.current = isLoading;
        hasMoreRef.current = hasMore;
    }, [isLoading, hasMore]);

    const lastElementRef = useCallback(
        (node) => {
            if (isLoadingRef.current) return;
            
            if (observerRef.current) {
                observerRef.current.disconnect();
            }

            observerRef.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
                        loadMore();
                    }
                },
                { root, rootMargin, threshold }
            );

            if (node) {
                observerRef.current.observe(node);
            }
        },
        [loadMore, root, rootMargin, threshold]
    );

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return lastElementRef;
};