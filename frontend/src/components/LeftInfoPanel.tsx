// -----------------------------------------------------------------------------
// Arquivo: src/components/LeftInfoPanel.tsx (NOVO)
// -----------------------------------------------------------------------------
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { styles } from '../styles/appStyles';

export const LeftInfoPanel: React.FC = () => {
    const auth = useContext(AuthContext);
    const wsContext = useContext(WebSocketContext);
    const settingsContext = useContext(SettingsContext);

    return (
        <div style={styles.sideColumn}>
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginTop: 0 }}>Usuário</h3>
                <span>ID-Casa: <strong>{auth?.idCasa}</strong></span>
                <br />
                {!auth?.isReadOnly && (
                    <span>Créditos: <strong>{wsContext?.userCredits ?? '...'}</strong></span>
                )}
                {auth?.isReadOnly && (
                    <span style={{ color: 'orange' }}><strong>(Somente Leitura)</strong></span>
                )}
            </div>

            {settingsContext?.events && settingsContext.events.length > 0 && (
                <div>
                    <h3>Eventos</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {settingsContext.events.map(event => (
                            <button
                                key={event.id}
                                onClick={() => settingsContext.setActiveEventId(event.id)}
                                style={{
                                    ...styles.button,
                                    border: settingsContext.settings?.id === event.id ? '2px solid #007bff' : '1px solid #ccc',
                                    backgroundColor: settingsContext.settings?.id === event.id ? '#007bff' : '#fff',
                                    color: settingsContext.settings?.id === event.id ? '#fff' : '#333',
                                    fontWeight: settingsContext.settings?.id === event.id ? 'bold' : 'normal'
                                }}
                            >
                                {event.eventName}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

