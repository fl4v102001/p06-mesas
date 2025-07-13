
// -----------------------------------------------------------------------------
// Arquivo: src/App.tsx (MODIFICADO)
// -----------------------------------------------------------------------------
import React, { useContext } from 'react';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { SettingsContext, SettingsProvider } from './contexts/SettingsContext';
import { LoginPage } from './pages/LoginPage';
import { MapPage } from './pages/MapPage';
import { SvgSpriteLoader } from './components/SvgSpriteLoader';
import { styles } from './styles/appStyles';

const AppContent: React.FC = () => {
    const auth = useContext(AuthContext);
    const settings = useContext(SettingsContext);

    if (settings?.isLoading) {
        return <p>Carregando configurações...</p>;
    }
    
    return auth?.token ? <MapPage /> : <LoginPage />;
}

const App: React.FC = () => {
    return (
        <AuthProvider>
            <SettingsProvider>
                <SvgSpriteLoader url="/mesa-svg.html" />
                <div style={styles.app}>
                    <AppContent />
                </div>
            </SettingsProvider>
        </AuthProvider>
    );
};

export default App;
