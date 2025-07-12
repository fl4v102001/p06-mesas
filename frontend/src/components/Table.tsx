// -----------------------------------------------------------------------------
// Arquivo: src/components/Table.tsx
// -----------------------------------------------------------------------------
import React, { useContext, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { TableData } from '../types';
import { styles } from '../styles/appStyles';

interface TableProps {
    tableData: TableData;
}

export const Table: React.FC<TableProps> = ({ tableData }) => {
    const auth = useContext(AuthContext);
    const wsContext = useContext(WebSocketContext);

    const baseWidth = 55, baseHeight = 60, scaleIncrement = 0.03, svgScale = 0.9;
    const maxOffsetX = 10, maxOffsetY = 10;

    const randomOffset = useMemo(() => ({
        x: Math.random() * maxOffsetX, y: Math.random() * maxOffsetY
    }), []);

    const scaleFactor = 1 + (tableData.linha * scaleIncrement);
    const cellWidth = baseWidth * scaleFactor;
    const cellHeight = baseHeight * scaleFactor;
    const svgWidth = cellWidth * svgScale;
    const svgHeight = cellHeight * svgScale;

    const handleClick = () => {
        if (isClickable) {
            wsContext?.sendMessage({
                type: 'cliqueMesa',
                payload: { linha: tableData.linha, coluna: tableData.coluna },
            });
        }
    };

    const getTableColor = (): string => {
        const { status, tipo, ownerId } = tableData;
        if (status === 'selecionada') {
            return ownerId === auth?.idCasa
                ? (tipo === 'S' ? '#ADD8E6' : '#00008B') // Azul
                : (tipo === 'S' ? '#fafa8bff' : '#FFD700'); // Amarelo
        }
        if (status === 'comprada') {
            return ownerId === auth?.idCasa
                ? (tipo === 'S' ? '#8cfe8cff' : '#006400') // Verde
                : (tipo === 'S' ? '#c1c1c1ff' : '#A9A9A9'); // Cinza
        }
        return '#FFFFFF'; // Livre
    };

    const isClickable = tableData.status === 'livre' || tableData.ownerId === auth?.idCasa;
    const tableColor = getTableColor();

    const cellStyle = { ...styles.tableContainer, width: `${cellWidth}px`, height: `${cellHeight}px`, cursor: isClickable ? 'pointer' : 'not-allowed' };
    const svgStyle = { ...styles.tableSvg, width: `${svgWidth}px`, height: `${svgHeight}px`, position: 'absolute' as 'absolute', top: `${randomOffset.y}px`, left: `${randomOffset.x}px`, fill: tableColor };

    
    // Estilo dinâmico para o texto, aplicando o mesmo deslocamento do SVG.
    const textStyle = {
        ...styles.tableText,
        top: `calc(35% + ${randomOffset.y}px)`,
        left: `calc(44% + ${randomOffset.x}px)`,
    };

    return (
        <div style={cellStyle} onClick={handleClick}>
            <svg style={svgStyle} preserveAspectRatio="none"><use href="#mesa-forma" /></svg>
            {tableData.tipo && <span style={textStyle}>{tableData.ownerId}</span>}
        </div>
    );
};

