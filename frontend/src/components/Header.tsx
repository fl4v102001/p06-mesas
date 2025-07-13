
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
    onBuyClick: () => void; // Nova prop para o botão de comprar
}

export const Header: React.FC<HeaderProps> = ({ onLogoutClick, onBuyClick }) => {
    const auth = useContext(AuthContext);
    const wsContext = useContext(WebSocketContext);
    const settingsContext = useContext(SettingsContext);

    return (
        <header style={styles.header}>
            <h1>{settingsContext?.settings?.eventName || 'Mapa de Mesas'}</h1>
            <div style={styles.userInfo}>
                <span>ID-Casa: <strong>{auth?.idCasa}</strong></span>
                <span>Créditos: <strong>{wsContext?.userCredits ?? '...'}</strong></span>
                <button onClick={onBuyClick} style={styles.buyButton}>Comprar</button>
                <button onClick={onLogoutClick} style={styles.logoutButton}>Logout</button>
            </div>
        </header>
    );
};

