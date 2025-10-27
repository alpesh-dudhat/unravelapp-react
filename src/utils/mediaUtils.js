// src/utils/mediaUtils.js
export function getMediaForVariant(variant, room) {
    // Variant already normalized may contain variant.media, but add safety checks
    if (!variant && !room) return null;

    // prefer variant.media if present (normalized)
    if (variant?.media) return variant.media;

    // otherwise check raw nested fields defensively
    const variantVideo = variant?.raw?.properties?.video_url?.med ?? null;
    const roomVideo = room?.roomVideo ?? room?.properties?.video_url?.med ?? null;

    if (variantVideo) return { type: 'video', src: variantVideo };
    if (roomVideo) return { type: 'video', src: roomVideo };

    const variantImages = variant?.raw?.properties?.variant_images ?? [];
    if (Array.isArray(variantImages) && variantImages.length > 0) {
        return { type: 'image', src: variantImages[0] };
    }

    const roomImages = room?.roomImages ?? [];
    if (Array.isArray(roomImages) && roomImages.length > 0) {
        return { type: 'image', src: roomImages[0] };
    }

    return null;
}
