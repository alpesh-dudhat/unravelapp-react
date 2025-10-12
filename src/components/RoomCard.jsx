import React, { useEffect, useRef, useState } from 'react'

const RoomCard = ({ room }) => {

    // console.log('card',room)

    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.3
            }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [])


    const variant = room.variants?.[0];
    const roomtype = variant?.name || '';
     const displayProperties = variant?.display_properties || [];
    const bedTypeDisplay = displayProperties.find(p => p.name === 'bed_type')?.value || "";
    const capacityDisplay = displayProperties.find(p => p.name === 'adult_occupancy')?.value || "";

    const priceInfo = variant?.price_info || "";
    const totalPrice = variant?.total_price;
    const promo = totalPrice?.promo_list?.[0];
    const offerType = promo?.offer_title || "";

    const originalPrice = totalPrice?.total_price_rounded ?? totalPrice?.total_price ?? 0;
    const discountedPrice = totalPrice?.discounted_price_rounded ?? totalPrice?.discounted_price ?? 0;

    const currency = variant?.total_price?.currency || "MYR";
    const cancellation = variant?.cancellation_info || "";

    return (
        // <></>
        <div className="room-card" ref={ref}>
            <div className="room-card__images">
                <div className="room-card__image-slider">
                    <img src="room1.jpg" alt="Room Image 1" />
                    <img src="room2.jpg" alt="Room Image 2" />
                </div>
                <div className="room-card__slider-controls">
                    <button aria-label="Previous">&#8592;</button>
                    <button aria-label="Next">&#8594;</button>
                </div>
            </div>
            <div className="room-card__content">

                <div className="room-card__row" >
                    <div>
                        <span className="room-card__icon">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                        </span>
                        <span className="room-card__label">{roomtype}</span>
                    </div>
                    <div>
                        <span className="room-card__icon" aria-label={`Room type: ${bedTypeDisplay}`}>
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                        </span>
                        <span className="room-card__label">{bedTypeDisplay}</span>
                    </div>
                    <div>
                        <span className="room-card__icon" aria-label={`Room type: ${capacityDisplay}`}>
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                        </span>
                        <span className="room-card__label">{capacityDisplay}</span>
                    </div>

                </div>
                <div className="room-card__price-section">
                    <span>{priceInfo}</span>
                    <span>Includes Taxes & Fees</span>
                    {originalPrice > discountedPrice && (
                        <span className="room-card__strikethrough">
                            {currency} {originalPrice?.toLocaleString()}
                        </span>
                    )}
                    <span className="room-card__price">
                        {currency} {discountedPrice?.toLocaleString()}
                    </span>
                     {offerType && (
                        <span className="room-card__discount-badge">
                            <svg viewBox="0 0 16 16" width="12" height="12">
                                <rect width="16" height="16" fill="currentColor" />
                            </svg>
                            {offerType}
                        </span>
                    )}
                </div>
                {/* <div className="room-card__includes">Breakfast included</div> */}
                {/* {cancellation && (
                    <div className="room-card__cancellation">{cancellation}</div>
                )} */}
                {/* <div className="room-card__special-request">Special request: High floor</div> */}
                <button className="room-card__select-btn">Select Room</button>
            </div>
        </div>

    )
}

export default RoomCard