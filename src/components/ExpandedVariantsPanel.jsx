import React, { useEffect, useRef } from 'react';
import VariantCard from './VariantCard';

const ExpandedVariantsPanel = ({ room, onClose, onSelectVariant }) => {
    const panelRef = useRef(null);

    useEffect(() => {
        const prevActive = document.activeElement;
        if (panelRef.current) panelRef.current.focus();

        const handleKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('keydown', handleKey);
            if (prevActive && prevActive.focus) prevActive.focus();
        };
    }, [onClose]);

    if (!room) return null;

    return (
        <div className="expanded-panel-overlay" role="dialog" aria-modal="true" onClick={(e) => { if (e.target.classList.contains('expanded-panel-overlay')) onClose(); }}>
            <aside className="expanded-panel" ref={panelRef} tabIndex={-1}>
                <div className="expanded-panel__header">
                    <h3>{room.name}</h3>
                    <button className="expanded-panel__close" onClick={onClose} aria-label="Close">✕</button>
                </div>

                <div className="expanded-panel__list">
                    {room.variants.map((variant) => (
                        <VariantCard
                            key={variant.id}
                            variant={variant}
                            room={room}
                            onSelect={(v) => onSelectVariant?.(v, room)}
                        />
                    ))}
                </div>

                <div className="expanded-panel__footer">
                    <button onClick={onClose} className="expanded-panel__see-less">Click to see less</button>
                </div>
            </aside>
        </div>
    );
};

export default ExpandedVariantsPanel;
