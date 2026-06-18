// -----------------------------------------------------------------------------
// Arquivo: src/components/TableGrid.tsx (MODIFICADO)
// -----------------------------------------------------------------------------
import React, { useContext, useMemo } from 'react';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { TableData } from '../types';
import { Table } from './Table';
import { styles } from '../styles/appStyles';
import { Aquecedor } from './Aquecedor';

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
//        const placeholderSet = new Set(placeholders.map(p => `${p.linha},${p.coluna}`));
//        const placeholderSet = new Set(["1,2","2,2","4,2","6,2","7,2","9,2","10,2","12,2","13,2","15,2","16,2","18,2","20,2","21,2","23,2","24,2","26,2","27,2","29,2","30,2"]);
        const placeholderSet = new Set(); // nao é utilizado nessa interface do app, apenas na interface do usuario final no App Consistem
        const tablesMap = new Map(wsContext.tables.map(t => [`${t.linha},${t.coluna}`, t]));
        const newGrid: (TableData | null)[][] = Array(mapRows+1).fill(null).map(() => Array(mapCols+1).fill(null));
        for (let i = 0; i <= mapRows; i++) {
            for (let j = 0; j <= mapCols; j++) {
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
                            const scaleFactor = 1 + (rowIndex * scaleIncrement);
                            const isCorridor = colIndex === 7;
                            
                            let cellContent;

                            if (table && table.tipo === 'aquecedor') {
                                cellContent = <Aquecedor 
                                    key={table._id} 
                                    tableData={table} 
                                    baseWidth={baseWidth}
                                    baseHeight={baseHeight}
                                    scaleIncrement={scaleIncrement}
                                    svgScale={svgScale}
                                    maxOffsetX={maxOffsetX}
                                    maxOffsetY={maxOffsetY}
                                />;
                            } else if (table && (table.tipo === 'mesa-4' || table.tipo === 'mesa-6')) {
                                cellContent = <Table 
                                    key={table._id} 
                                    tableData={table} 
                                    baseWidth={baseWidth}
                                    baseHeight={baseHeight}
                                    scaleIncrement={scaleIncrement}
                                    svgScale={svgScale}
                                    maxOffsetX={maxOffsetX}
                                    maxOffsetY={maxOffsetY}
                                />;
                            } else {
                                const placeholderStyle = { ...styles.tablePlaceholder, width: `${baseWidth * scaleFactor}px`, height: `${baseHeight * scaleFactor}px` };
                                cellContent = <div key={`${rowIndex}-${colIndex}`} style={placeholderStyle}></div>;
                            }

                            return (
                                <React.Fragment key={`${rowIndex}-${colIndex}-wrapper`}>
                                    {isCorridor && <div style={{ width: `${baseWidth * scaleFactor}px`, flexShrink: 0 }} />}
                                    {cellContent}
                                </React.Fragment>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

