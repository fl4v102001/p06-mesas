
// -----------------------------------------------------------------------------
// Arquivo: src/pages/MapPage.tsx (MODIFICADO)
// -----------------------------------------------------------------------------
import React, { useState, useContext, useEffect } from 'react';
import { WebSocketProvider, WebSocketContext } from '../contexts/WebSocketContext';
import { Header } from '../components/Header';
import { TableGrid } from '../components/TableGrid';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { AuthContext } from '../contexts/AuthContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { purchaseTables } from '../api/tableService';
import { styles } from '../styles/appStyles';

// O conteúdo da página do mapa foi movido para este novo componente
const MapPageContent: React.FC = () => {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [purchaseDetails, setPurchaseDetails] = useState({ count: 0, total: 0 });
    
    const auth = useContext(AuthContext);
    const wsContext = useContext(WebSocketContext);
    const settingsContext = useContext(SettingsContext);

    const handleLogoutRequest = () => {
        if (!auth || !wsContext) return;

        const userSelectedTables = wsContext.tables.filter(
            table => table.ownerId === auth.idCasa && table.status === 'selecionada'
        );

        if (userSelectedTables.length === 0) {
            auth.logout();
        } else {
            setIsLogoutModalOpen(true);
        }
    };

    const handleConfirmLogout = async () => {
        if (auth) await auth.logout();
        setIsLogoutModalOpen(false);
    };

    const handleBuyClick = () => {
        if (!wsContext || !settingsContext?.settings || !auth?.idCasa) return;

        const { priceS, priceD } = settingsContext.settings;

        const userSelectedTables = wsContext.tables.filter(
            table => table.ownerId === auth.idCasa && table.status === 'selecionada'
        );

        if (userSelectedTables.length === 0) {
            alert("Você não tem nenhuma mesa selecionada para comprar.");
            return;
        }

        const totalCost = userSelectedTables.reduce((sum, table) => {
            if (table.tipo === 'S') return sum + priceS;
            if (table.tipo === 'D') return sum + priceD;
            return sum;
        }, 0);

        setPurchaseDetails({ count: userSelectedTables.length, total: totalCost });
        setIsPurchaseModalOpen(true);
    };

    const handleConfirmPurchase = async () => {
        if (!auth?.token) return;
        try {
            await purchaseTables(auth.token);
        } catch (error) {
            console.error("Erro ao comprar mesas:", error);
            let errorMessage = "Ocorreu um erro desconhecido.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            alert(`Erro ao comprar mesas: ${errorMessage}`);
        } finally {
            setIsPurchaseModalOpen(false);
        }
    };

    return (
        <div style={styles.mapPage}>
            <Header onLogoutClick={handleLogoutRequest} onBuyClick={handleBuyClick} />
            <TableGrid />
            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                title="Confirmar Logout"
                message="Tem a certeza que deseja sair? Todas as suas mesas selecionadas serão liberadas."
                onConfirm={handleConfirmLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
                confirmButtonColor="#dc3545"
            />
            <ConfirmationModal
                isOpen={isPurchaseModalOpen}
                title="Confirmar Compra"
                message={`Confirme a compra de ${purchaseDetails.count} mesa(s), total de R$ ${purchaseDetails.total.toFixed(2)}.`}
                onConfirm={handleConfirmPurchase}
                onCancel={() => setIsPurchaseModalOpen(false)}
                confirmButtonColor="#28a745"
            />
        </div>
    );
}

// O componente MapPage agora serve como o provedor de contexto
export const MapPage: React.FC = () => {
    return (
        <WebSocketProvider>
            <MapPageContent />
        </WebSocketProvider>
    );
};
