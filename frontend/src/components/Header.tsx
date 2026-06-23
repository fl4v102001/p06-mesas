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
    onRotateClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogoutClick, onBuyClick, onRotateClick }) => {
    const auth = useContext(AuthContext);
    const wsContext = useContext(WebSocketContext);
    const settingsContext = useContext(SettingsContext);

    return (
        <header style={styles.header}>
            {/* <h1 style={styles.headerTitle}>Mapa de Mesas</h1> */}
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

                {settingsContext?.events && settingsContext.events.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        {settingsContext.events.map(event => (
                            <button
                                key={event.id}
                                onClick={() => settingsContext.setActiveEventId(event.id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    border: settingsContext.settings?.id === event.id ? '2px solid #007bff' : '1px solid #ccc',
                                    backgroundColor: settingsContext.settings?.id === event.id ? '#007bff' : '#fff',
                                    color: settingsContext.settings?.id === event.id ? '#fff' : '#333',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    fontWeight: settingsContext.settings?.id === event.id ? 'bold' : 'normal'
                                }}
                            >
                                {event.eventName}
                            </button>
                        ))}
                    </div>
                )}
                <div style={styles.userActions}>
                    <button style={styles.configButton} hidden={true}>Config</button>
                    {!auth?.isReadOnly && (
                        <>
                            <button onClick={onBuyClick} style={styles.buyButton}>Comprar</button>
                            <button onClick={onRotateClick} style={styles.button}>Rotacionar</button>
                        </>
                    )}
                    <button onClick={onLogoutClick} style={styles.logoutButton}>Logout</button>
                </div>
            </div>
        </header>
    );
};
