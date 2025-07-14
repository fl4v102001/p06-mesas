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
    
    const svgUrl = settings?.settings?.svgUrl ?? '/mesa-svg.html'; // default URL if not set

    return (
        <>
            <SvgSpriteLoader url={svgUrl} />
            <div style={styles.app}>
                {auth?.token ? <MapPage /> : <LoginPage />}
            </div>
        </>
    );
}

const App: React.FC = () => {
    return (
        <AuthProvider>
            <SettingsProvider>
                <AppContent />
            </SettingsProvider>
        </AuthProvider>
    );
};

export default App;
