// -----------------------------------------------------------------------------
// Arquivo: src/components/TableGrid.tsx
// -----------------------------------------------------------------------------
import React, { useContext, useMemo } from 'react';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { TableData } from '../types';
import { Table } from './Table';
import { styles } from '../styles/appStyles';

export const TableGrid: React.FC = () => {
    const wsContext = useContext(WebSocketContext);

    const grid = useMemo(() => {
        if (!wsContext?.tables || wsContext.tables.length === 0) return [];
        const maxLinha = Math.max(...wsContext.tables.map(t => t.linha));
        const maxColuna = Math.max(...wsContext.tables.map(t => t.coluna));
        const newGrid: (TableData | null)[][] = Array(maxLinha + 1).fill(null).map(() => Array(maxColuna + 1).fill(null));
        wsContext.tables.forEach(table => {
            if (table.linha <= maxLinha && table.coluna <= maxColuna) {
                newGrid[table.linha][table.coluna] = table;
            }
        });
        return newGrid;
    }, [wsContext?.tables]);

    if (!wsContext || !wsContext.isConnected) return <p>A ligar ao servidor e a carregar o mapa...</p>;

    return (
        <div style={styles.gridContainer}>
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} style={{ ...styles.gridRow, marginTop: `${-30 + rowIndex / 2}px` }}>
                    {row.map((table, colIndex) => {
                        if (table) return <Table key={table._id} tableData={table} />;
                        
                        const baseWidth = 55, baseHeight = 60;
                        const scaleFactor = 1 + (rowIndex * 0.03);
                        const placeholderStyle = { ...styles.tablePlaceholder, width: `${baseWidth * scaleFactor}px`, height: `${baseHeight * scaleFactor}px` };
                        return <div key={`${rowIndex}-${colIndex}`} style={placeholderStyle}></div>;
                    })}
                </div>
            ))}
        </div>
    );
};
