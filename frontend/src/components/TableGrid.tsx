// -----------------------------------------------------------------------------
// Arquivo: src/components/TableGrid.tsx (MODIFICADO)
// -----------------------------------------------------------------------------
import React, { useContext, useMemo } from 'react';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { TableData } from '../types';
import { Table } from './Table';
import { styles } from '../styles/appStyles';

export const TableGrid: React.FC = () => {
    const wsContext = useContext(WebSocketContext);
    const settingsContext = useContext(SettingsContext);

    const { 
        baseWidth = 55, 
        baseHeight = 60, 
        scaleIncrement = 0.03, 
        svgScale = 0.9, 
        maxOffsetX = 10, 
        maxOffsetY = 10 
    } = settingsContext?.settings || {};

    const grid = useMemo(() => {
        if (!settingsContext?.settings || !wsContext?.tables) return [];
        const { mapRows, mapCols, placeholders } = settingsContext.settings;
        const placeholderSet = new Set(placeholders.map(p => `${p.linha},${p.coluna}`));
        const tablesMap = new Map(wsContext.tables.map(t => [`${t.linha},${t.coluna}`, t]));
        const newGrid: (TableData | null)[][] = Array(mapRows).fill(null).map(() => Array(mapCols).fill(null));
        for (let i = 0; i < mapRows; i++) {
            for (let j = 0; j < mapCols; j++) {
                const key = `${i},${j}`;
                if (!placeholderSet.has(key)) {
                    newGrid[i][j] = tablesMap.get(key) || { _id: key, linha: i, coluna: j, status: 'livre', tipo: null, ownerId: null };
                }
            }
        }
        return newGrid;
    }, [wsContext?.tables, settingsContext?.settings]);

    if (!wsContext?.isConnected || settingsContext?.isLoading) return <p>A ligar ao servidor e a carregar o mapa...</p>;

    return (
        <div style={styles.gridContainer}>
            <div style={styles.gridContentWrapper}>
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} style={styles.gridRow}>
                        {row.map((table, colIndex) => {
                            if (table) {
                                return <Table 
                                    key={table._id} 
                                    tableData={table} 
                                    baseWidth={baseWidth}
                                    baseHeight={baseHeight}
                                    scaleIncrement={scaleIncrement}
                                    svgScale={svgScale}
                                    maxOffsetX={maxOffsetX}
                                    maxOffsetY={maxOffsetY}
                                />;
                            }
                            
                            const scaleFactor = 1 + (rowIndex * scaleIncrement);
                            const placeholderStyle = { ...styles.tablePlaceholder, width: `${baseWidth * scaleFactor}px`, height: `${baseHeight * scaleFactor}px` };
                            return <div key={`${rowIndex}-${colIndex}`} style={placeholderStyle}></div>;
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

