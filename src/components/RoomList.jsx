import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadRooms, loadMoreRooms } from '../features/roomSlice';
import RoomCard from './RoomCard';
import RoomCardSkeleton from './RoomCardSkeleton';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import ExpandedVariantsPanel from './ExpandedVariantsPanel';

const RoomList = () => {
    const dispatch = useDispatch();

    const [expandedRoomId, setExpandedRoomId] = useState(null);
    const htmlEl = document.documentElement;

    const handleExpand = useCallback((roomId) => {
        setExpandedRoomId(roomId);
        if (htmlEl) {
            htmlEl.style.overflow = 'hidden';
        }
    }, []);

    const handleClosePanel = useCallback(() => {
        setExpandedRoomId(null);
        if (htmlEl) {
            htmlEl.style.overflow = 'auto';
        }
    }, []);

    const handleSelectVariant = useCallback((variant, room) => {
        console.log('Selected variant', variant, 'from room', room);
    }, []);


    const {
        rooms,
        status,
        error,
        pagination
    } = useSelector((state) => state.rooms);

    const { hasMore, isLoadingMore, currentPage } = useMemo(() => ({
        hasMore: pagination.hasMore,
        isLoadingMore: pagination.isLoadingMore,
        currentPage: pagination.currentPage
    }), [pagination.hasMore, pagination.isLoadingMore, pagination.currentPage]);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(loadRooms());
        }
    }, [status, dispatch]);

    const handleLoadMore = useCallback(() => {
        if (hasMore && !isLoadingMore) {
            dispatch(loadMoreRooms());
        }
    }, [hasMore, isLoadingMore, dispatch]);

    const lastRoomElementRef = useInfiniteScroll(
        handleLoadMore,
        hasMore,
        isLoadingMore,
        { rootMargin: '350px' , threshold: 0} // Start loading earlier for smoother experience
    );

    const initialSkeletons = useMemo(() =>
        Array.from({ length: 6 }, (_, index) => (
            <RoomCardSkeleton key={`skeleton-${index}`} />
        ))
        , []);

    const loadingMoreSkeletons = useMemo(() =>
        Array.from({ length: 3 }, (_, index) => (
            <RoomCardSkeleton key={`loading-more-${currentPage}-${index}`} />
        ))
        , [currentPage]);

    if (status === 'failed') {
        return (
            <div className="room-list-error">
                <div className="error-message">
                    <h3>Unable to load rooms</h3>
                    <p>{error}</p>
                    <button
                        onClick={() => dispatch(loadRooms())}
                        className="retry-button"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="room-list-container">
            <div className="panel">
                {rooms.length > 0 && (
                    <span className="room-count">
                        Total Showing {rooms.length} Rooms
                        {hasMore && ''}
                    </span>
                )}
                {rooms.length > 8 && (
                    <p
                        className="totop"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        aria-label="Scroll to top"
                    >
                        Back to top ↑
                    </p>
                )}
            </div>

            <div className="room-list">
                {status === 'loading' ? (
                    <div className="room-list-initial-loading">
                        {initialSkeletons}
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="room-list-empty">
                        <p>No rooms available at the moment.</p>
                    </div>
                ) : (
                    <>
                        {rooms.map((room, index) => {
                            const uniqueKey = room.id ? `${room.id}-${index}` : `room-${index}`;

                            const isLastElement = index === rooms.length - 1;

                            return (
                                <div
                                    key={uniqueKey}
                                    ref={isLastElement ? lastRoomElementRef : null}
                                    className="room-card"
                                >
                                    <RoomCard room={room} onExpand={handleExpand} />
                                </div>
                            );
                        })}

                        {isLoadingMore && (
                            <div className="room-list-loading-more">
                                {loadingMoreSkeletons}
                            </div>
                        )}
                    </>
                )}
            </div>
            {expandedRoomId && (
                <ExpandedVariantsPanel
                    room={rooms.find(r => r.id === expandedRoomId)}
                    onClose={handleClosePanel}
                    onSelectVariant={handleSelectVariant}
                />
            )}
            {!hasMore && rooms.length > 0 && (
                <div className="room-list-end">
                    <p>You've seen all available rooms!</p>
                </div>
            )}


        </div>
    );
};

export default React.memo(RoomList);