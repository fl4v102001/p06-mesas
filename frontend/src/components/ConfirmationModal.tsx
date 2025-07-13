
// -----------------------------------------------------------------------------
// Arquivo: src/components/ConfirmationModal.tsx
// -----------------------------------------------------------------------------
import React from 'react';
import { styles } from '../styles/appStyles';

interface ConfirmationModalProps { isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmButtonColor?: string; }

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel, confirmButtonColor }) => {
    if (!isOpen) return null;
    const confirmStyle = { ...styles.modalButton, ...styles.modalConfirmButton };
    if (confirmButtonColor) {
        confirmStyle.backgroundColor = confirmButtonColor;
    }
    return (
        <div style={styles.modalOverlay} onClick={onCancel}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3 style={styles.modalTitle}>{title}</h3>
                <p style={styles.modalMessage}>{message}</p>
                <div style={styles.modalActions}>
                    <button style={{...styles.modalButton, ...styles.modalCancelButton}} onClick={onCancel}>Cancelar</button>
                    <button style={confirmStyle} onClick={onConfirm}>Confirmar</button>
                </div>
            </div>
        </div>
    );
};

