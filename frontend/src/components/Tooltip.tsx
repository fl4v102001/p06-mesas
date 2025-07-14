
// -----------------------------------------------------------------------------
// Arquivo: src/components/Tooltip.tsx (NOVO)
// -----------------------------------------------------------------------------
import React from 'react';
import { styles } from '../styles/appStyles';

interface TooltipProps {
    visible: boolean;
    position: { x: number; y: number };
    content: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ visible, position, content }) => {
    if (!visible) {
        return null;
    }

    const style = {
        ...styles.tooltipContainer,
        top: `${position.y}px`,
        left: `${position.x}px`,
    };

    return (
        <div style={style}>
            {content}
        </div>
    );
};
