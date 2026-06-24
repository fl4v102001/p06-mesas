import React from 'react';
import { styles } from '../styles/appStyles';

interface JsonReportModalProps {
    isOpen: boolean;
    title: string;
    jsonData: unknown;
    error?: string | null;
    onClose: () => void;
}

interface SeatName {
    [key: string]: number;
}

interface ReportItem {
    owner_codigo_lote: string;
    qtd: number;
    total: number;
    seat_name: SeatName[];
}

interface ReportEvent {
    event_name: string;
    items: ReportItem[];
}

export const JsonReportModal: React.FC<JsonReportModalProps> = ({ isOpen, title, jsonData, error, onClose }) => {
    if (!isOpen) return null;

    // A simple heuristic to check if it matches our data structure
    const isReportData = Array.isArray(jsonData) && jsonData.length > 0 && typeof jsonData[0] === 'object' && jsonData[0] !== null && 'event_name' in jsonData[0];

    let content;

    if (error) {
        content = <p style={{ color: '#c00' }}>{error}</p>;
    } else if (isReportData) {
        const reportEvents = jsonData as ReportEvent[];
        const event = reportEvents[0]; // Assuming one event as in the mock
        
        content = (
            <div style={{ padding: '10px' }}>
                <h2 style={{ textAlign: 'center', color: '#1a56b6', marginBottom: '20px' }}>{event.event_name || 'Evento'}</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '15px'
                }}>
                    {event.items.map((item, index) => (
                        <div key={index} style={{
                            border: '2px solid #1a56b6',
                            borderRadius: '12px',
                            backgroundColor: '#fff',
                            padding: '15px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: '#1a56b6'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Casa</span>
                                <span style={{ fontSize: '42px', lineHeight: '1.2' }}>{item.owner_codigo_lote}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Mesas</span>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '18px' }}>
                                    {item.seat_name && item.seat_name.map((seat, sIdx) => {
                                        const seatKey = Object.keys(seat)[0];
                                        return <div key={sIdx}>{seatKey}</div>;
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    } else {
        content = (
            <div>
                <h3 style={styles.modalTitle}>{title}</h3>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '0.85rem' }}>
                    {JSON.stringify(jsonData, null, 2)}
                </pre>
            </div>
        );
    }

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={{...styles.modalContent, maxWidth: '900px', width: '90%'}} onClick={(e) => e.stopPropagation()}>
                <div style={{ maxHeight: '75vh', overflowY: 'auto', textAlign: 'left' }}>
                    {content}
                </div>
                <div style={{...styles.modalActions, marginTop: '20px'}}>
                    <button style={{ ...styles.modalButton, ...styles.modalCancelButton }} onClick={onClose}>Fechar</button>
                </div>
            </div>
        </div>
    );
};
