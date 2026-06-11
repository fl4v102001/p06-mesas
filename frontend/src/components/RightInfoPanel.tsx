// -----------------------------------------------------------------------------
// Arquivo: src/components/RightInfoPanel.tsx (NOVO)
// -----------------------------------------------------------------------------
import React from 'react';
import { styles } from '../styles/appStyles';

export const RightInfoPanel: React.FC = () => {
    return (
        <div style={styles.sideColumn}>
            <h2>Painel Direito</h2>
            <p>Este é o painel lateral direito. Ideal para detalhes, filtros ou outras informações contextuais.</p>
        </div>
    );
};

