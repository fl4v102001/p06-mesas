// -----------------------------------------------------------------------------
// Arquivo: src/components/RightInfoPanel.tsx (NOVO)
// -----------------------------------------------------------------------------
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { getEventSeatsReport } from '../api/eventService';
import { JsonReportModal } from './JsonReportModal';
import { styles } from '../styles/appStyles';

interface RightInfoPanelProps {
    onBuyClick: () => void;
    onRotateClick: () => void;
    onLogoutClick: () => void;
}

export const RightInfoPanel: React.FC<RightInfoPanelProps> = ({ onBuyClick, onRotateClick, onLogoutClick }) => {
    const auth = useContext(AuthContext);
    const settingsContext = useContext(SettingsContext);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [reportError, setReportError] = useState<string | null>(null);
    const [reportLoading, setReportLoading] = useState(false);

    const handleReportClick = async () => {
        if (!auth?.token || !settingsContext?.settings?.id) return;

        setReportLoading(true);
        setReportError(null);

        try {
            const report = await getEventSeatsReport(auth.token, settingsContext.settings.id);
            setReportData(report);
            setIsReportOpen(true);
        } catch (error: any) {
            setReportData(null);
            setReportError(error?.message || 'Erro ao carregar relatório de mesas.');
            setIsReportOpen(true);
        } finally {
            setReportLoading(false);
        }
    };

    const closeReportModal = () => {
        setIsReportOpen(false);
    };

    const handlePrintClick = () => {
        if (!settingsContext?.settings?.id) return;
        window.open('/print-report/' + settingsContext.settings.id, '_blank');
    };

    return (
        <div style={styles.sideColumn}>
            <h3 style={{ marginTop: 0 }}>Ações</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {!auth?.isReadOnly && (
                    <button onClick={onBuyClick} style={styles.buyButton}>Comprar</button>
                )}
                <button onClick={onRotateClick} style={styles.button}>Rotacionar</button>
                <button
                    onClick={handleReportClick}
                    style={styles.button}
                    disabled={!auth?.token || !settingsContext?.settings?.id || reportLoading}
                >
                    {reportLoading ? 'Carregando...' : 'Relatório de Mesas'}
                </button>
                <button onClick={onLogoutClick} style={styles.logoutButton}>Trocar Casa</button>
            </div>

            <JsonReportModal
                isOpen={isReportOpen}
                title="Relatório de Mesas"
                jsonData={reportData}
                error={reportError}
                onClose={closeReportModal}
                onPrint={handlePrintClick}
            />
        </div>
    );
};

