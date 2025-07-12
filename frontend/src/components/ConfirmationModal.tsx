// -----------------------------------------------------------------------------
// Arquivo: src/components/ConfirmationModal.tsx (NOVO ARQUIVO)
// -----------------------------------------------------------------------------
import React from 'react';
import { styles } from '../styles/appStyles';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div style={styles.modalOverlay} onClick={onCancel}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3 style={styles.modalTitle}>{title}</h3>
                <p style={styles.modalMessage}>{message}</p>
                <div style={styles.modalActions}>
                    <button style={{...styles.modalButton, ...styles.modalCancelButton}} onClick={onCancel}>
                        Cancelar
                    </button>
                    <button style={{...styles.modalButton, ...styles.modalConfirmButton}} onClick={onConfirm}>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};
