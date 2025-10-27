import React, { useState, useMemo, useCallback, memo } from 'react';
import ProgressiveImage from './ProgressiveImage';
import OptimizedVideo from './OptimizedVideo';
import VariantMini from './VariantMini';

const RoomCard = ({ room, onExpand }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const visibleVariants = useMemo(() => (room.variants || []).slice(0, 2), [room.variants]);
    const showSeeMore = (room.variants?.length || 0) >= 2;

    const cheapestVariant = useMemo(() =>
        room.variants
            ?.filter(v => v.isBookable)
            ?.sort((a, b) => a.price - b.price)[0] || room.variants?.[0]
        , [room.variants]);

    // const displayProperties = useMemo(() =>
    //     cheapestVariant?.displayProperties || []
    //     , [cheapestVariant]);

    // const bedTypeDisplay = useMemo(() =>
    //     displayProperties.find(p => p.name === 'bed_type')?.value || room.bedType || ""
    //     , [displayProperties, room.bedType]);

    // const capacityDisplay = useMemo(() =>
    //     displayProperties.find(p => p.name === 'adult_occupancy')?.value ||
    //     (room.capacity ? `Up to ${room.capacity.max_occupancy} guests` : "")
    //     , [displayProperties, room.capacity]);

    const { hasMedia, mediaType, mediaSrc, roomImages } = useMemo(() => {
        const hasMedia = room.media || (room.roomImages && room.roomImages.length > 0);
        const mediaType = room.media?.type;
        const mediaSrc = room.media?.src;
        const roomImages = room.roomImages || [];

        return { hasMedia, mediaType, mediaSrc, roomImages };
    }, [room]);

    const nextImage = useCallback(() => {
        if (roomImages.length > 1) {
            setCurrentImageIndex(prev => (prev + 1) % roomImages.length);
        }
    }, [roomImages.length]);

    const prevImage = useCallback(() => {
        if (roomImages.length > 1) {
            setCurrentImageIndex(prev => (prev - 1 + roomImages.length) % roomImages.length);
        }
    }, [roomImages.length]);

    const currentImage = roomImages[currentImageIndex];
    const lowQualitySrc = useMemo(() => {
        if (!currentImage) return '';
        return `${currentImage}?w=20&q=10`;
    }, [currentImage]);

    return (
        <>
            {hasMedia ? (
                <>
                    {mediaType === 'video' ? (
                        <OptimizedVideo
                            src={mediaSrc}
                            className="room-card__video"
                            muted={true}
                            loop={true}
                            playsInline={true}
                        />
                    ) : (
                        <div className="room-card__image-slider">
                            <ProgressiveImage
                                src={currentImage}
                                lowQualitySrc={lowQualitySrc}
                                alt={`${room.name} - Image ${currentImageIndex + 1}`}
                                className="room-card__image"
                            />

                            {roomImages.length > 1 && (
                                <div className="room-card__slider-controls">
                                    <button onClick={prevImage} aria-label="Previous image">
                                        &#8592;
                                    </button>
                                    <span className="room-card__image-counter">
                                        {currentImageIndex + 1} / {roomImages.length}
                                    </span>
                                    <button onClick={nextImage} aria-label="Next image">
                                        &#8594;
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="room-card__image-placeholder">
                    <div className="media-skeleton"></div>
                    <span>No media available</span>
                </div>
            )}

            <div className="room-card__content">
                <div className="room-card__variants-collapsed">
                    <h3 className="room-card__title">{room.name}</h3>
                    <div className="room-card__price-section">
                        <span className="room-card__price-info">{cheapestVariant?.priceInfo}</span>

                        <span className="room-card__price">
                            {room.currency} {room.price.toLocaleString()}
                        </span>
                    </div>

                    <span className="room-card__variants_title">Variants</span>
                    <div className="room-card__variants">

                        {visibleVariants.map((v, i) => (
                            <VariantMini key={v.id || i} index={i} variant={v} />
                        ))}
                    </div>
                    {showSeeMore && (
                        <button className="room-card__select-btn" onClick={() => onExpand?.(room.id)}>
                            See more
                        </button>
                    )}
                </div>
            </div>

            {/* <div className="room-card__content">
                <h3 className="room-card__title">{room.name}</h3>

                <div className="room-card__row">
                    {bedTypeDisplay && (
                        <>
                            <span className="room-card__label">🛏️ {bedTypeDisplay}</span>
                        </>
                    )}
                    {capacityDisplay && (
                        <>
                            <span className="room-card__label">👥 {capacityDisplay}</span>
                        </>
                    )}
                </div>

                <div className="room-card__price-section">
                    <span className="room-card__price-info">{cheapestVariant?.priceInfo}</span>
                    <span className="room-card__taxes">Includes Taxes & Fees</span>

                    {room.originalPrice > room.price && (
                        <span className="room-card__strikethrough">
                            {room.currency} {room.originalPrice.toLocaleString()}
                        </span>
                    )}

                    <span className="room-card__price">
                        {room.currency} {room.price.toLocaleString()}
                    </span>

                    {cheapestVariant?.promo?.offer_title && (
                        <span className="room-card__discount-badge">
                            🏷️ {cheapestVariant.promo.offer_title}
                        </span>
                    )}
                </div>

                <button
                    className="room-card__select-btn"
                    disabled={!room.isBookable}
                >
                    {room.isBookable ? 'Select Room' : 'Not Available'}
                </button>
            </div> */}
        </>
    );
};

export default memo(RoomCard);