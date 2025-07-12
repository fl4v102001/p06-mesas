// -----------------------------------------------------------------------------
// Arquivo: src/components/Header.tsx (MODIFICADO)
// -----------------------------------------------------------------------------
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { styles } from '../styles/appStyles';

interface HeaderProps {
    onLogoutClick: () => void; // Nova prop para lidar com o clique
}

export const Header: React.FC<HeaderProps> = ({ onLogoutClick }) => {
    const auth = useContext(AuthContext);
    const wsContext = useContext(WebSocketContext);

    return (
        <header style={styles.header}>
            <h1>Mapa de Mesas</h1>
            <div style={styles.userInfo}>
                <span>ID-Casa: <strong>{auth?.idCasa}</strong></span>
                <span>Créditos: <strong>{wsContext?.userCredits ?? '...'}</strong></span>
                <button style={styles.buyButton}>Comprar</button>
                <button onClick={onLogoutClick} style={styles.logoutButton}>Logout</button>
            </div>
        </header>
    );
};
