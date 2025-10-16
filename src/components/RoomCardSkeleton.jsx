import React from 'react';

const RoomCardSkeleton = () => {
    return (
        <div className="room-card-skeleton">
            <div className="room-card-skeleton__image">
                <div className="skeleton-media"></div>
            </div>
            <div className="room-card-skeleton__content">
                <div className="skeleton-line skeleton-line--title"></div>
                <div className="skeleton-line skeleton-line--medium"></div>
                <div className="skeleton-line skeleton-line--short"></div>
                <div className="skeleton-line skeleton-line--price"></div>
                <div className="skeleton-button"></div>
            </div>
        </div>
    );
};

export default RoomCardSkeleton;