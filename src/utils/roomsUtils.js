export function normalizeRooms(data) {
    if (!data) return [];

    const roomGroups = data.rooms_by_serial_no || [];
    const rooms = [];
    
    roomGroups.forEach(group => {
        (group.rooms || []).forEach(room => {
            const roomVideo = room.properties?.video_url?.med;
            const rawRoomImages = room.properties?.room_images?.[0]?.image_urls || [];
            const roomImages = Array.isArray(rawRoomImages) ? rawRoomImages : [];
            // const roomImages = room.properties?.room_images?.[0]?.image_urls || [];
            

            // let media;
            // if (roomVideo) {
            //     media = { type: 'video', src: roomVideo };
            // } else if (roomImages.length > 0) {
            //     media = { type: 'image', src: roomImages[0] }; // Use first image
            // } else {
            //     media = null; // No media available
            // }

            // const variants = (room.variants || []).map(variant => ({
            //     id: variant.variant_id || variant.variant_code,
            //     name: variant.name,
            //     price: variant.total_price?.discounted_price_rounded,

            //     currency: variant.total_price?.currency,
            //     priceInfo: variant.price_info,
            //     isBookable: variant.is_bookable,
            //     displayProperties: variant.display_properties || [],
            //     cancellationInfo: variant.cancellation_info
            // }));

            // const cheapestVariant = variants
            //     .filter(v => v.price && v.isBookable)
            //     .sort((a, b) => a.price - b.price)[0];

            // rooms.push({
            //     id: room.room_type_code || room.name, 
            //     name: room.name,
            //     media,
            //     roomImages, 
            //     roomVideo, 
            //     variants,
            //     price: cheapestVariant?.price,
            //     currency: cheapestVariant?.currency,
            //     priceInfo: cheapestVariant?.priceInfo,
            //     capacity: room.properties?.room_capacity,
            //     bedType: room.properties?.bed_type,
            //     isBookable: variants.some(v => v.isBookable)
            // });

            const variants = (room.variants || []).map(variant => {
                // promo extraction
                const promoList = variant.total_price?.promo_list || [];
                const firstPromo = promoList[0] || variant.total_price?.promo || null;

                // currency & price
                const discountedPriceRounded = variant.total_price?.discounted_price_rounded ?? variant.total_price?.discounted_price;
                const currency = variant.total_price?.currency || (room.currency || 'MYR');

                // cancellation info
                const cancellationInfo = variant.cancellation_info || variant.cancellation_timeline || null;

                // media resolution helper (variant-level video/images, then room)
                const variantVideo = variant.properties?.video_url?.med || null;
                const variantImages = variant.properties?.variant_images || [];

                let media = null;
                if (variantVideo) {
                    media = { type: 'video', src: variantVideo };
                } else if (roomVideo) {
                    media = { type: 'video', src: roomVideo };
                } else if (Array.isArray(variantImages) && variantImages.length > 0) {
                    media = { type: 'image', src: variantImages[0] };
                } else if (roomImages.length > 0) {
                    media = { type: 'image', src: roomImages[0] };
                } else {
                    media = null;
                }

                return {
                    id: variant.variant_id || variant.variant_code,
                    code: variant.variant_code,
                    name: variant.name,
                    price: discountedPriceRounded,
                    currency,
                    priceInfo: variant.price_info,
                    isBookable: !!variant.is_bookable,
                    displayProperties: variant.display_properties || [],
                    cancellationInfo,
                    promo: firstPromo,
                    offer_title: firstPromo?.offer_title ?? null,
                    offer_total_price: firstPromo?.offer_total_price ?? null,
                    offer_discounted_total_price: firstPromo?.offer_discounted_total_price ?? null,
                    media, // {type, src} or null
                    raw: variant // keep original in case you need more details
                };
            });

            const cheapestVariant = variants
                .filter(v => v.price && v.isBookable)
                .sort((a, b) => a.price - b.price)[0] || variants[0];

            rooms.push({
                id: room.room_type_code || room.name,
                name: room.name,
                media: roomVideo ? { type: 'video', src: roomVideo } : (roomImages[0] ? { type: 'image', src: roomImages[0] } : null),
                roomImages,
                roomVideo,
                variants,
                price: cheapestVariant?.price ?? null,
                currency: cheapestVariant?.currency ?? null,
                priceInfo: cheapestVariant?.priceInfo ?? null,
                capacity: room.properties?.room_capacity,
                bedType: room.properties?.bed_type,
                isBookable: variants.some(v => v.isBookable)
            });
        });
    });

    return rooms;
}


// {
//   id: "126675265", // room_type_code
//   name: "Premier room",
//   media: { type: 'video', src: 'https://...' }, // Primary media for card
//   roomImages: ['url1', 'url2', ...], // All images for carousel
//   roomVideo: 'https://...', // Video URL if exists
//   price: 1517, // Cheapest price
//   currency: "MYR",
//   variants: [...], // All booking options
//   capacity: { max_occupancy: 2, ... },
//   bedType: "DOUBLE",
//   isBookable: true
// }