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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={styles.headerTitle}>Mapa de Mesas</h1>
                {settingsContext?.events && settingsContext.events.length > 0 && (
                    <select
                        value={settingsContext.settings?.id || ''}
                        onChange={(e) => settingsContext.setActiveEventId(e.target.value)}
                        style={{
                            padding: '5px 10px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            backgroundColor: '#fff',
                            fontSize: '16px',
                            color: '#333',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {settingsContext.events.map(event => (
                            <option key={event.id} value={event.id}>
                                {event.eventName}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            <div style={styles.userInfoBar}>
                <div style={styles.userInfo}>
                    <span>ID-Casa: <strong>{auth?.idCasa}</strong></span>
                    {!auth?.isReadOnly && (
                        <span>Créditos: <strong>{wsContext?.userCredits ?? '...'}</strong></span>
                    )}
                    {auth?.isReadOnly && (
                        <span style={{ color: 'orange', marginLeft: '10px' }}><strong>(Somente Leitura)</strong></span>
                    )}
                </div>
                <div style={styles.userActions}>
                    <button style={styles.configButton} hidden={true}>Config</button>
                    {!auth?.isReadOnly && (
                        <button onClick={onBuyClick} style={styles.buyButton}>Comprar</button>
                    )}
                    <button onClick={onLogoutClick} style={styles.logoutButton}>Logout</button>
                </div>
            </div>
        </header>
    );
};
