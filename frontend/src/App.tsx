// -----------------------------------------------------------------------------
// Arquivo: src/App.tsx (O NOVO ARQUIVO PRINCIPAL)
// -----------------------------------------------------------------------------
import React, { useContext } from 'react';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { MapPage } from './pages/MapPage';
import { SvgSpriteLoader } from './components/SvgSpriteLoader';
import { styles } from './styles/appStyles';

const AppContent: React.FC = () => {
    const auth = useContext(AuthContext);
    return auth?.token ? <MapPage /> : <LoginPage />;
}

const App: React.FC = () => {
    return (
        <AuthProvider>
            <SvgSpriteLoader url="/mesa-svg.html" />
            <div style={styles.app}>
                <AppContent />
            </div>
        </AuthProvider>
    );
};

export default App;
