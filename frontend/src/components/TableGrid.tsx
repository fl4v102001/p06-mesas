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

interface TableGridProps {
    isRotated: boolean;
}

export const TableGrid: React.FC<TableGridProps> = ({ isRotated }) => {
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
        const { mapRows, mapCols } = settingsContext.settings;
        const placeholderSet = new Set<string>();
        const tablesMap = new Map(wsContext.tables.map(t => [`${t.linha},${t.coluna}`, t]));
        const newGrid: (TableData | null)[][] = Array(mapRows + 1).fill(null).map(() => Array(mapCols + 1).fill(null));
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

    const displayGrid = useMemo(() => {
        if (!isRotated) {
            return grid;
        }
        if (grid.length === 0 || grid[0].length === 0) {
            return [];
        }
        const rows = grid.length;
        const cols = grid[0].length;
        // Transpose the grid (swap rows and columns)
        const transposedGrid = Array(cols).fill(null).map(() => Array(rows).fill(null));
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                transposedGrid[j][i] = grid[i][j];
            }
        }
        // Reverse the rows of the transposed grid to achieve a counter-clockwise rotation
        return transposedGrid.reverse();
    }, [grid, isRotated]);

    if (!wsContext?.isConnected || settingsContext?.isLoading) return <p>A ligar ao servidor e a carregar o mapa...</p>;

    const gridContentWrapperStyle: React.CSSProperties = {
        ...styles.gridContentWrapper,
        flexDirection: 'column',
        alignItems: 'center',
    };

    const gridRowStyle: React.CSSProperties = {
        ...styles.gridRow,
        flexDirection: 'row',
        justifyContent: 'center',
    };

    const renderCell = (table: TableData | null, scaleFactor: number, key: string) => {
        if (table && table.tipo === 'aquecedor') {
            return <Aquecedor
                key={table._id}
                tableData={table}
                baseWidth={baseWidth}
                baseHeight={baseHeight}
                scaleFactor={scaleFactor}
                svgScale={svgScale}
                maxOffsetX={maxOffsetX}
                maxOffsetY={maxOffsetY}
            />;
        } else if (table && (table.tipo === 'mesa-4' || table.tipo === 'mesa-6')) {
            return <Table
                key={table._id}
                tableData={table}
                baseWidth={baseWidth}
                baseHeight={baseHeight}
                scaleFactor={scaleFactor}
                svgScale={svgScale}
                maxOffsetX={maxOffsetX}
                maxOffsetY={maxOffsetY}
            />;
        } else {
            const placeholderStyle = { ...styles.tablePlaceholder, width: `${baseWidth * scaleFactor}px`, height: `${baseHeight * scaleFactor}px` };
            return <div key={key} style={placeholderStyle}></div>;
        }
    };

    return (
        <div style={styles.gridContainer}>
            <div style={gridContentWrapperStyle}>
                {displayGrid.map((row, rowIndex) => (
                    <div key={`row-${rowIndex}`} style={gridRowStyle}>
                        {row.map((table, colIndex) => {
                            const scaleFactor = 1 + (rowIndex * scaleIncrement);
                            // When rotated, the corridor that was vertical (col 7) becomes horizontal (row 7).
                            // The rendering logic is now unified, so we check the index based on rotation.
                            const isCorridor = isRotated ? rowIndex === 7 : colIndex === 7;
                            const cellContent = renderCell(table, scaleFactor, `${rowIndex}-${colIndex}`);
                            
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
