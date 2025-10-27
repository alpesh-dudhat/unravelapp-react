import React from 'react';
import OptimizedVideo from './OptimizedVideo';
import ProgressiveImage from './ProgressiveImage';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { getMediaForVariant } from '../utils/mediaUtils';

const VariantCard = ({ variant, room, onSelect }) => {
    const [containerRef, isIntersecting] = useIntersectionObserver({ threshold: 0.25, once: true,  rootMargin: '120px',debounce: 60 });

    const media = variant.media ?? getMediaForVariant(variant, room);

    const bedProp = variant.displayProperties?.find(p => p.name === 'bed_type')?.value ?? room?.bedType ?? '';
    const occupancyProp = variant.displayProperties?.find(p => p.name === 'adult_occupancy')?.value ?? (room?.capacity ? `Up to ${room.capacity.max_occupancy} adults` : '');

    const price = variant.price ?? '';
    const currency = variant.currency ?? room?.currency ?? '';

    return (
        <div ref={containerRef} className="variant-card">
            {isIntersecting && media && media.type === 'video' && (
                <div className="variant-card__media">
                    <OptimizedVideo src={media.src} className="variant-card__video" muted loop playsInline />
                </div>
            )}

            {isIntersecting && media && media.type === 'image' && (
                <div className="variant-card__media">
                    <ProgressiveImage src={media.src} alt={`${variant.name} media`} className="variant-card__image" />
                </div>
            )}


            <div className="variant-card__body">
                <div className="variant-card__row">
                    <h4 className="variant-card__name">{variant.name}</h4>
                    {variant.offer_title && (
                        <span className="variant-card__promo">{variant.offer_title}</span>
                    )}
                </div>

                <div className="variant-card__props">
                    {bedProp && <div className="variant-card__prop">🛏️ {bedProp}</div>}
                    {occupancyProp && <div className="variant-card__prop">👥 {occupancyProp}</div>}
                </div>

                <div className="variant-card__price">
                    <div className="variant-card__price-info">{variant.priceInfo}</div>

                    <div className="variant-card__prices">
                        {variant.offer_total_price != null && variant.offer_discounted_total_price != null ? (
                            <>
                                <div className="variant-card__old-price">
                                    {currency} {Number(variant.offer_total_price).toLocaleString()}
                                </div>
                                <div className="variant-card__discounted">
                                    {currency} {Number(variant.offer_discounted_total_price).toLocaleString()}
                                </div>
                            </>
                        ) : (
                            <div className="variant-card__discounted">
                                {currency} {Number(price).toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="variant-card__cancellation">
                    {variant.cancellationInfo?.free_cancellation ? (
                        <button
                            type="button"
                            className="variant-card__cancellation-btn"
                            onClick={() => {
                                alert(variant.cancellationInfo.free_cancellation_info || 'Cancellation information');
                            }}
                        >
                            Cancellation policy
                        </button>
                    ) : null}
                </div>

                <div className="variant-card__actions">
                    <button
                        className="room-card__select-btn"
                        disabled={!variant.isBookable}
                        onClick={() => onSelect?.(variant)}
                    >
                        {variant.isBookable ? 'Select' : 'Not available'}
                    </button>
                </div>
                {/* <button
                    className="room-card__select-btn"
                    disabled={!room.isBookable}
                >
                    {room.isBookable ? 'Select Room' : 'Not Available'}
                </button> */}
            </div>
        </div>
    );
};

export default React.memo(VariantCard);
