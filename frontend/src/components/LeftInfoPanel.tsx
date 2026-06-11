// -----------------------------------------------------------------------------
// Arquivo: src/components/LeftInfoPanel.tsx (NOVO)
// -----------------------------------------------------------------------------
import React from 'react';
import { styles } from '../styles/appStyles';

export const LeftInfoPanel: React.FC = () => {
    return (
        <div style={styles.sideColumn}>
            <h2>Painel Esquerdo</h2>
            <p>Este é o painel lateral esquerdo. Você pode adicionar componentes e informações aqui.</p>
        </div>
    );
};
