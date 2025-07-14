
// -----------------------------------------------------------------------------
// Arquivo: src/components/Table.tsx (MODIFICADO)
// -----------------------------------------------------------------------------
import React, { useContext, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { TableData } from '../types';
import { styles } from '../styles/appStyles';
import { Tooltip } from './Tooltip';

interface TableProps { 
    tableData: TableData;
    baseWidth: number;
    baseHeight: number;
    scaleIncrement: number;
    svgScale: number;
    maxOffsetX: number;
    maxOffsetY: number;
}

export const Table: React.FC<TableProps> = ({ tableData, baseWidth, baseHeight, scaleIncrement, svgScale, maxOffsetX, maxOffsetY }) => {
    const auth = useContext(AuthContext);
    const wsContext = useContext(WebSocketContext);
    
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const randomOffset = useMemo(() => ({ x: Math.random() * maxOffsetX, y: Math.random() * maxOffsetY }), [maxOffsetX, maxOffsetY]);
    const scaleFactor = 1 + (tableData.linha * scaleIncrement);
    const cellWidth = baseWidth * scaleFactor;
    const cellHeight = baseHeight * scaleFactor;
    const svgWidth = cellWidth * svgScale;
    const svgHeight = cellHeight * svgScale;

    const handleMouseMove = (e: React.MouseEvent) => {
        setTooltipPosition({ x: e.clientX + 15, y: e.clientY + 15 });
    };

    const handleClick = () => { if (isClickable) wsContext?.sendMessage({ type: 'cliqueMesa', payload: { linha: tableData.linha, coluna: tableData.coluna } }); };
    const getTableColor = (): string => {
        const { status, tipo, ownerId } = tableData;
        if (status === 'selecionada') return ownerId === auth?.idCasa ? (tipo === 'S' ? '#ADD8E6' : '#00008B') : (tipo === 'S' ? '#fafa8bff' : '#FFD700');
        if (status === 'comprada') return ownerId === auth?.idCasa ? (tipo === 'S' ? '#8cfe8cff' : '#006400') : (tipo === 'S' ? '#c1c1c1ff' : '#A9A9A9');
        return '#FFFFFF';
    };
    const isClickable = tableData.status === 'livre' || tableData.ownerId === auth?.idCasa;
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
                <svg style={svgStyle} preserveAspectRatio="none"><use href="#mesa-forma" /></svg>
                {tableData.tipo && <span style={textStyle}>{tableData.ownerId}</span>}
            </div>
            <Tooltip
                visible={tooltipVisible}
                position={tooltipPosition}
                content={
                    <div>
                        <p style={styles.tooltipTitle}>Mesa</p>
                        <strong style={styles.tooltipContent}>{tableData.nome || ''}</strong>
                    </div>
                }
            />
        </>
    );
};

