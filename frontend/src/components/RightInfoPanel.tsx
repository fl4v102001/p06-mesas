// -----------------------------------------------------------------------------
// Arquivo: src/components/RightInfoPanel.tsx (NOVO)
// -----------------------------------------------------------------------------
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { styles } from '../styles/appStyles';

interface RightInfoPanelProps {
    onBuyClick: () => void;
    onRotateClick: () => void;
    onLogoutClick: () => void;
}

export const RightInfoPanel: React.FC<RightInfoPanelProps> = ({ onBuyClick, onRotateClick, onLogoutClick }) => {
    const auth = useContext(AuthContext);

    return (
        <div style={styles.sideColumn}>
            <h3 style={{ marginTop: 0 }}>Ações</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {!auth?.isReadOnly && (
                    <>
                        <button onClick={onBuyClick} style={styles.buyButton}>Comprar</button>
                    </>
                )}
                <button onClick={onRotateClick} style={styles.button}>Rotacionar</button>
                <button onClick={onLogoutClick} style={styles.logoutButton}>Trocar Casa</button>
            </div>
        </div>
    );
};

