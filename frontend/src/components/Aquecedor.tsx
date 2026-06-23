
// -----------------------------------------------------------------------------
// Arquivo: src/components/Table.tsx (MODIFICADO)
// -----------------------------------------------------------------------------
import React, { useMemo, useState } from 'react';
import { TableData } from '../types';
import { styles } from '../styles/appStyles';
import { Tooltip } from './Tooltip';

interface AquecedorProps {
    tableData: TableData;
    baseWidth: number;
    baseHeight: number;
    scaleFactor: number;
    svgScale: number;
    maxOffsetX: number;
    maxOffsetY: number;
}

export const Aquecedor: React.FC<AquecedorProps> = ({ tableData, baseWidth, baseHeight, scaleFactor, svgScale, maxOffsetX, maxOffsetY }) => {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const randomOffset = useMemo(() => ({ x: Math.random() * maxOffsetX, y: Math.random() * maxOffsetY }), [maxOffsetX, maxOffsetY]);
    
    const cellWidth = baseWidth * scaleFactor;
    const cellHeight = baseHeight * scaleFactor;
    const svgWidth = cellWidth * svgScale;
    const svgHeight = cellHeight * svgScale;

    const handleMouseMove = (e: React.MouseEvent) => {
        setTooltipPosition({ x: e.clientX + 15, y: e.clientY + 15 });
    };

    const handleClick = () => { };
    const getTableColor = (): string => { return '#ff0000ff'; };
    const isClickable = false;
    const tableColor = getTableColor();
    const cellStyle = { ...styles.tableContainer, width: `${cellWidth}px`, height: `${cellHeight}px`, cursor: isClickable ? 'pointer' : 'not-allowed' };
    const svgStyle = { ...styles.tableSvg, width: `${svgWidth}px`, height: `${svgHeight}px`, position: 'absolute' as 'absolute', top: `${randomOffset.y}px`, left: `${randomOffset.x}px`, fill: tableColor };
    const textStyle = { ...styles.tableText, top: `calc(40% + ${randomOffset.y}px)`, left: `calc(50% + ${randomOffset.x}px)` };
    
    return (
        <>
            <div 
                style={cellStyle} 
                onClick={handleClick}
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
                onMouseMove={handleMouseMove}
            >
                <svg style={svgStyle} preserveAspectRatio="none"><use href="#aquecedor2" /></svg>
            </div>
            <Tooltip
                visible={tooltipVisible}
                position={tooltipPosition}
                content={
                    <div>
                        <p style={styles.tooltipTitle}>Aquecedor</p>
                    </div>
                }
            />
        </>
    );
};

