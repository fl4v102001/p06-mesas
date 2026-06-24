import React from 'react';
import { styles } from '../styles/appStyles';

interface JsonReportModalProps {
    isOpen: boolean;
    title: string;
    jsonData: unknown;
    error?: string | null;
    onClose: () => void;
}

export const JsonReportModal: React.FC<JsonReportModalProps> = ({ isOpen, title, jsonData, error, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3 style={styles.modalTitle}>{title}</h3>
                <div style={{ maxHeight: '60vh', overflowY: 'auto', textAlign: 'left' }}>
                    {error ? (
                        <p style={{ color: '#c00' }}>{error}</p>
                    ) : (
                        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '0.85rem' }}>
                            {JSON.stringify(jsonData, null, 2)}
                        </pre>
                    )}
                </div>
                <div style={styles.modalActions}>
                    <button style={{ ...styles.modalButton, ...styles.modalCancelButton }} onClick={onClose}>Fechar</button>
                </div>
            </div>
        </div>
    );
};
