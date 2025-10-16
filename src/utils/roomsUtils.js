export function normalizeRooms(data) {
    if (!data) return [];

    const roomGroups = data.rooms_by_serial_no || [];
    const rooms = [];
    
    roomGroups.forEach(group => {
        (group.rooms || []).forEach(room => {
            const roomVideo = room.properties?.video_url?.med;
            const roomImages = room.properties?.room_images?.[0]?.image_urls || [];

            let media;
            if (roomVideo) {
                media = { type: 'video', src: roomVideo };
            } else if (roomImages.length > 0) {
                media = { type: 'image', src: roomImages[0] }; // Use first image
            } else {
                media = null; // No media available
            }

            const variants = (room.variants || []).map(variant => ({
                id: variant.variant_id || variant.variant_code,
                name: variant.name,
                price: variant.total_price?.discounted_price_rounded,

                currency: variant.total_price?.currency,
                priceInfo: variant.price_info,
                isBookable: variant.is_bookable,
                displayProperties: variant.display_properties || [],
                cancellationInfo: variant.cancellation_info
            }));

            const cheapestVariant = variants
                .filter(v => v.price && v.isBookable)
                .sort((a, b) => a.price - b.price)[0];

            rooms.push({
                id: room.room_type_code || room.name, 
                name: room.name,
                media,
                roomImages, 
                roomVideo, 
                variants,
                price: cheapestVariant?.price,
                currency: cheapestVariant?.currency,
                priceInfo: cheapestVariant?.priceInfo,
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