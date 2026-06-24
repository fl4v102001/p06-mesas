// -----------------------------------------------------------------------------
// Arquivo: src/components/TableGrid.tsx (MODIFICADO)
// -----------------------------------------------------------------------------
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { AuthContext } from '../contexts/AuthContext';
import { TableData, EventStatus } from '../types';
import { getEventStatus } from '../api/eventService';
import { Table } from './Table';
import { styles } from '../styles/appStyles';
import { Aquecedor } from './Aquecedor';

interface TableGridProps {
    isRotated: boolean;
}

export const TableGrid: React.FC<TableGridProps> = ({ isRotated }) => {
    const wsContext = useContext(WebSocketContext);
    const settingsContext = useContext(SettingsContext);
    const auth = useContext(AuthContext);

    // The corridor is placed *after* the column with this index.
    const CORRIDOR_AFTER_COLUMN_INDEX = 7;

    const { 
        baseWidth = 55, 
        baseHeight = 60, 
        scaleIncrement = 0.03, 
        svgScale = 0.9, 
        maxOffsetX = 10, 
        maxOffsetY = 10 
    } = settingsContext?.settings || {};

    const [eventStatus, setEventStatus] = useState<EventStatus | null>(null);
    const [eventStatusLoading, setEventStatusLoading] = useState(false);
    const [eventStatusError, setEventStatusError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEventStatus = async () => {
            if (!auth?.token || !settingsContext?.settings?.id) {
                setEventStatus(null);
                setEventStatusError(null);
                return;
            }

            setEventStatusLoading(true);
            setEventStatusError(null);

            try {
                const status = await getEventStatus(auth.token, settingsContext.settings.id);
                setEventStatus(status);
            } catch (error: any) {
                console.error('Erro ao buscar status do evento:', error);
                setEventStatus(null);
                setEventStatusError(error?.message || 'Erro ao carregar status do evento.');
            } finally {
                setEventStatusLoading(false);
            }
        };

        fetchEventStatus();
    }, [auth?.token, settingsContext?.settings?.id]);

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
    
    // Calculate the correct corridor index for the rotated view.
    // The number of columns in the original grid determines the number of rows in the transposed grid.
    const numOriginalCols = grid[0]?.length || 0;
    // After transposing and reversing, the original column's new row index is calculated.
    const rotatedCorridorIndex = numOriginalCols > 0 ? (numOriginalCols - 1) - CORRIDOR_AFTER_COLUMN_INDEX : -1;

    const eventStatusBoxStyle: React.CSSProperties = {
        position: 'absolute',
        top: 12,
        left: 12,
        padding: '10px 12px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 3px 12px rgba(0,0,0,0.16)',
        width: 'auto',
        minWidth: 0,
        zIndex: 20,
        textAlign: 'left',
        whiteSpace: 'nowrap',
    };


    const eventStatusLabelStyle: React.CSSProperties = { margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#333' };
    const eventStatusValueStyle: React.CSSProperties = { margin: '4px 0', color: '#444' };

    return (
        <div style={{ ...styles.gridContainer, position: 'relative' }}>
            <div style={gridContentWrapperStyle}>
                <div style={eventStatusBoxStyle}>
                    <p style={eventStatusLabelStyle}>Status do evento</p>
                    {eventStatusLoading && <p style={eventStatusValueStyle}>A carregar status...</p>}
                    {eventStatusError && <p style={{ ...eventStatusValueStyle, color: '#c00' }}>{eventStatusError}</p>}
                    {!eventStatusLoading && !eventStatusError && eventStatus && (
                        <>
                            <p style={eventStatusValueStyle}><strong>Total mesas:</strong> {eventStatus.total_mesas}</p>
                            <p style={eventStatusValueStyle}><strong>Total comprado:</strong> {eventStatus.total_comprado}</p>
                            <p style={eventStatusValueStyle}><strong>Total disponível:</strong> {eventStatus.total_disponivel}</p>
                            <p style={eventStatusValueStyle}><strong>% comprado:</strong> {eventStatus.percentual_comprado}%</p>
                            <p style={eventStatusValueStyle}><strong>% disponível:</strong> {eventStatus.percentual_disponivel}%</p>
                        </>
                    )}
                    {!eventStatusLoading && !eventStatusError && !eventStatus && (
                        <p style={eventStatusValueStyle}>Status não disponível.</p>
                    )}
                </div>
                {displayGrid.map((row, rowIndex) => {
                    const scaleFactor = 1 + (rowIndex * scaleIncrement);
                    const isRotatedCorridorRow = isRotated && rowIndex === rotatedCorridorIndex;

                    const rowContent = (
                        <div key={`row-${rowIndex}`} style={gridRowStyle}>
                            {row.map((table, colIndex) => {
                                // For the normal view, the corridor is a vertical spacer between cells.
                                const isVerticalCorridor = !isRotated && colIndex === CORRIDOR_AFTER_COLUMN_INDEX - 1;
                                const cellContent = renderCell(table, scaleFactor, `${rowIndex}-${colIndex}`);
                                
                                return (
                                    <React.Fragment key={`${rowIndex}-${colIndex}-wrapper`}>
                                        {cellContent}
                                        {isVerticalCorridor && <div style={{ width: `${baseWidth * scaleFactor}px`, flexShrink: 0 }} />}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    );

                    if (isRotatedCorridorRow) {
                        // For the rotated view, add a horizontal spacer after the row content.
                        return (
                            <React.Fragment key={`rotated-corridor-wrapper-${rowIndex}`}>
                                {rowContent}
                                <div style={{ height: `${baseHeight * scaleFactor}px`, width: '100%' }} />
                            </React.Fragment>
                        );
                    }

                    return rowContent;
                })}
            </div>
        </div>
    );
};
