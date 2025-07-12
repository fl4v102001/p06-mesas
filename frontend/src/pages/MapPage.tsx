// -----------------------------------------------------------------------------
// Arquivo: src/pages/MapPage.tsx (MODIFICADO)
// -----------------------------------------------------------------------------
import React, { useState, useContext } from 'react';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { Header } from '../components/Header';
import { TableGrid } from '../components/TableGrid';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { AuthContext } from '../contexts/AuthContext';
import { styles } from '../styles/appStyles';

export const MapPage: React.FC = () => {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const auth = useContext(AuthContext);

    const handleConfirmLogout = async () => {
        if (auth) {
            await auth.logout();
        }
        setIsLogoutModalOpen(false);
    };

    return (
        <WebSocketProvider>
            <div style={styles.mapPage}>
                <Header onLogoutClick={() => setIsLogoutModalOpen(true)} />
                <TableGrid />
                <ConfirmationModal
                    isOpen={isLogoutModalOpen}
                    title="Confirmar Logout"
                    message="Tem a certeza que deseja sair? Todas as suas mesas selecionadas serão liberadas."
                    onConfirm={handleConfirmLogout}
                    onCancel={() => setIsLogoutModalOpen(false)}
                />
            </div>
        </WebSocketProvider>
    );
};
