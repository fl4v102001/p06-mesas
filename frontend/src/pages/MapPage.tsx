// -----------------------------------------------------------------------------
// Arquivo: src/pages/MapPage.tsx (MODIFICADO)
// -----------------------------------------------------------------------------
import React, { useState, useContext, useEffect } from 'react';
import { WebSocketProvider, WebSocketContext } from '../contexts/WebSocketContext';
import { TableGrid } from '../components/TableGrid';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { LeftInfoPanel } from '../components/LeftInfoPanel';
import { RightInfoPanel } from '../components/RightInfoPanel';
import { SvgSpriteLoader } from '../components/SvgSpriteLoader';
import { AuthContext } from '../contexts/AuthContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { purchaseTables } from '../api/tableService';
import { styles } from '../styles/appStyles';

const MapPageContent: React.FC = () => {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [purchaseDetails, setPurchaseDetails] = useState({ count: 0, total: 0 });
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(window.innerWidth <= 1024);
    const [isRotated, setIsRotated] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const auth = useContext(AuthContext);
    const wsContext = useContext(WebSocketContext);
    const settingsContext = useContext(SettingsContext);

    useEffect(() => {
        const handleResize = () => setIsMobileOrTablet(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogoutRequest = async () => {
        if (!auth || !wsContext) return;

        const userSelectedTables = wsContext.tables.filter(
            table => table.ownerId === auth.idCasa && table.status === 'selecionada'
        );

        if (userSelectedTables.length === 0) {
            setIsLoggingOut(true);
            try {
                await auth.logout();
            } finally {
                setIsLoggingOut(false);
            }
        } else {
            setIsLogoutModalOpen(true);
        }
    };

    const handleConfirmLogout = async () => {
        setIsLogoutModalOpen(false);
        setIsLoggingOut(true);
        try {
            if (auth) await auth.logout();
        } finally {
            setIsLoggingOut(false);
        }
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
            if (table.tipo === 'mesa-4') return sum + priceS;
            if (table.tipo === 'mesa-6') return sum + priceD;
            return sum;
        }, 0);

        setPurchaseDetails({ count: userSelectedTables.length, total: totalCost });
        setIsPurchaseModalOpen(true);
    };

    const handleConfirmPurchase = async () => {
        if (!auth?.token || !settingsContext?.settings?.id) return;
        try {
            await purchaseTables(auth.token, settingsContext.settings.id);
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
            {isLoggingOut && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    fontFamily: 'sans-serif'
                }}>
                    <div style={{
                        border: '4px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '4px solid #fff',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '16px'
                    }} />
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                    <h2>Saindo...</h2>
                    <p>Por favor, aguarde.</p>
                </div>
            )}
            <SvgSpriteLoader url="/mesa-svg.html" />
            <div style={styles.mainContentContainer}>
                <LeftInfoPanel />
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <TableGrid isRotated={isRotated} />
                </div>
                <RightInfoPanel
                    onBuyClick={handleBuyClick}
                    onRotateClick={() => setIsRotated(!isRotated)}
                    onLogoutClick={handleLogoutRequest}
                />
            </div>
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

export const MapPage: React.FC = () => {
    return (
        <WebSocketProvider>
            <MapPageContent />
        </WebSocketProvider>
    );
};
