// -----------------------------------------------------------------------------
// Arquivo: src/styles/appStyles.ts (MODIFICADO)
// -----------------------------------------------------------------------------
import React from 'react';
export const styles: { [key: string]: React.CSSProperties } = {
    app: { fontFamily: 'Arial, sans-serif', textAlign: 'center', color: '#333' },
    loginContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px', width: '300px', padding: '20px', borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
    input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' },
    button: { padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white', fontSize: '16px', cursor: 'pointer' },
    toggleButton: { marginTop: '15px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' },
    mapPage: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f0f2f5' },
    
    header: {
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 20px',
        backgroundColor: '#333',
        color: 'white',
        flexShrink: 0,
    },
    headerTitle: {
        textAlign: 'center',
        width: '100%',
        marginBottom: '10px',
        fontSize: '1.25rem',
    },
    userInfoBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    userActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    buyButton: { padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    logoutButton: { padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    mainContentContainer: { // Novo container para o layout de 3 colunas
        display: 'flex',
        flexGrow: 1,
        overflow: 'hidden', // Previne que o container principal tenha scroll
    },
    sideColumn: { // Estilo para as colunas laterais
        width: '10%',
        padding: '20px',
        borderLeft: '1px solid #ccc',
        borderRight: '1px solid #ccc',
        backgroundColor: 'white',
        overflowY: 'auto', // Permite scroll vertical se o conteúdo for grande
        flexShrink: 0, // Impede que as colunas encolham
    },
    gridContainer: {
        display: 'flex',
        justifyContent: 'flex-start',
        flexGrow: 1,
        backgroundColor: '#e9ecef',
        overflow: 'auto',
    },
    gridContentWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: 'auto',
        padding: '20px 0',
    },
    gridRow: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
    tableContainer: { position: 'relative', margin: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' },
    tableSvg: { stroke: '#333', strokeWidth: '1px' },
    tableText: { position: 'absolute', transform: 'translate(-50%, -50%)', fontSize: '14px', fontWeight: 'bold', color: 'black', pointerEvents: 'none' },
    tablePlaceholder: { margin: '2px', visibility: 'hidden' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', width: '90%', maxWidth: '400px', textAlign: 'left' },
    modalTitle: { marginTop: 0, marginBottom: '10px', fontSize: '1.25rem' },
    modalMessage: { marginBottom: '20px', fontSize: '1rem', color: '#555' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    modalButton: { padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },

    modalConfirmButton: { backgroundColor: '#28a745', color: 'white' },

    modalCancelButton: { backgroundColor: '#f0f0f0', color: '#333' },
    
    
    tooltipContainer: {
        position: 'fixed',
        padding: '8px 12px',
        backgroundColor: 'white',
        color: '#333',
        borderRadius: '6px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 1100,
        pointerEvents: 'none',
        textAlign: 'center',
    },
    tooltipTitle: {
        margin: 0,
        padding: 0,
        fontSize: '0.75rem',
        color: '#666',
        textTransform: 'uppercase',
    },
    tooltipContent: {
        margin: 0,
        padding: 0,
        fontSize: '1rem',
        fontWeight: 'bold',
    },
};

