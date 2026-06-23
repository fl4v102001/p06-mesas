
// -----------------------------------------------------------------------------
// Arquivo: src/components/Table.tsx (MODIFICADO)
// -----------------------------------------------------------------------------
import React, { useContext, useMemo, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { TableData } from '../types';
import { styles } from '../styles/appStyles';
import { Tooltip } from './Tooltip';

interface TableProps { 
    tableData: TableData;
    baseWidth: number;
    baseHeight: number;
    scaleFactor: number;
    svgScale: number;
    maxOffsetX: number;
    maxOffsetY: number;
}

export const Table: React.FC<TableProps> = ({ tableData, baseWidth, baseHeight, scaleFactor, svgScale, maxOffsetX, maxOffsetY }) => {
    const auth = useContext(AuthContext);
    const wsContext = useContext(WebSocketContext);
    const settingsContext = useContext(SettingsContext);
    
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [isProcessing, setIsProcessing] = useState(false);
    const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const randomOffset = useMemo(() => ({ x: (Math.random() - 0.5) * maxOffsetX, y: (Math.random() - 0.5) * maxOffsetY }), [maxOffsetX, maxOffsetY]);
    
    const cellWidth = baseWidth * scaleFactor;
    const cellHeight = baseHeight * scaleFactor;
    const svgWidth = cellWidth * svgScale;
    const svgHeight = cellHeight * svgScale;

    const handleMouseMove = (e: React.MouseEvent) => {
        setTooltipPosition({ x: e.clientX + 15, y: e.clientY + 15 });
    };

    const handleClick = () => { 
        if (isClickable && !isProcessing) {
            const eventId = settingsContext?.settings?.id;
            if (eventId) {
                setIsProcessing(true);
                wsContext?.sendMessage({ type: 'cliqueMesa', payload: { linha: tableData.linha, coluna: tableData.coluna, eventId } }); 
                
                if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
                processingTimeoutRef.current = setTimeout(() => {
                    setIsProcessing(false);
                }, 5000);
            }
        }
    };

    useEffect(() => {
        if (isProcessing) {
            setIsProcessing(false);
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableData.status, tableData.ownerId]);
    const getTableColor = (): string => {
        const { status, tipo, ownerId } = tableData;
        if (status === 'selecionada') return ownerId === auth?.idCasa ? (tipo === 'mesa-4' ? '#ADD8E6' : '#ADD8E6') : (tipo === 'mesa-6' ? '#fafa8bff' : '#FFD700');
        if (status === 'comprada') return ownerId === auth?.idCasa ? (tipo === 'mesa-4' ? '#8cfe8cff' : '#8cfe8cff') : (tipo === 'mesa-6' ? '#c1c1c1ff' : '#A9A9A9');
        return '#FFFFFF';
    };
    const isClickable = !auth?.isReadOnly && (tableData.status === 'livre' || tableData.ownerId === auth?.idCasa);
    const tableColor = getTableColor();
    const cellStyle = { ...styles.tableContainer, width: `${cellWidth}px`, height: `${cellHeight}px`, cursor: isClickable ? 'pointer' : 'not-allowed' };
    const svgStyle = { ...styles.tableSvg, width: `${svgWidth}px`, height: `${svgHeight}px`, position: 'absolute' as 'absolute', top: `${randomOffset.y}px`, left: `${randomOffset.x}px`, fill: tableColor };
    const textStyle = { ...styles.tableText, top: `calc(40% + ${randomOffset.y}px)`, left: `calc(50% + ${randomOffset.x}px)` };
    const svgMesa = tableData.tipo === 'mesa-4' ? '#mesa-forma' : '#mesa-acessivel';
    // Se for acessivel, troca a cor para azul
    
    return (
        <>
            <div 
                style={cellStyle} 
                onClick={handleClick}
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
                onMouseMove={handleMouseMove}
            >
                <svg className={isProcessing ? 'pulse-animation' : ''} style={svgStyle} preserveAspectRatio="none"><use href={svgMesa} /></svg>
                {tableData.tipo === 'mesa-6' && (
                    <img 
                        src="/wheelchair-svgrepo-com.svg" 
                        alt="Acessível"
                        style={{
                            position: 'absolute',
                            width: `${cellWidth * 0.40}px`,
                            height: `${cellHeight * 0.40}px`,
                            top: `calc(-10% + ${randomOffset.y}px)`,
                            left: `calc(-00% + ${randomOffset.x}px)`,
                            pointerEvents: 'none'
                        }} 
                    />
                )}
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

