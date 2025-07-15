// -----------------------------------------------------------------------------
// Arquivo: src/components/Header.tsx (MODIFICADO)
// -----------------------------------------------------------------------------
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { styles } from '../styles/appStyles';

interface HeaderProps {
    onLogoutClick: () => void;
    onBuyClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogoutClick, onBuyClick }) => {
    const auth = useContext(AuthContext);
    const wsContext = useContext(WebSocketContext);
    const settingsContext = useContext(SettingsContext);

    return (
        <header style={styles.header}>
            <h1 style={styles.headerTitle}>{settingsContext?.settings?.eventName || 'Mapa de Mesas'}</h1>
            <div style={styles.userInfoBar}>
                <div style={styles.userInfo}>
                    <span>ID-Casa: <strong>{auth?.idCasa}</strong></span>
                    <span>Créditos: <strong>{wsContext?.userCredits ?? '...'}</strong></span>
                </div>
                <div style={styles.userActions}>
                    <button style={styles.configButton} hidden={true}>Config</button>
                    <button onClick={onBuyClick} style={styles.buyButton}>Comprar</button>
                    <button onClick={onLogoutClick} style={styles.logoutButton}>Logout</button>
                </div>
            </div>
        </header>
    );
};
