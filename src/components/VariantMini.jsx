import React, { memo } from 'react';

const VariantMini = ({ index, variant }) => {
    const label = variant?.name || `Variant ${index + 1}`;

    return (
        <div className="variant-mini" aria-hidden={false} aria-label={label}>
            <span className="variant-mini__dot" />
            <span className="variant-mini__label" title={label}>
                {label}
            </span>
        </div>
    );
};

export default memo(VariantMini);
