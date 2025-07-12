// -----------------------------------------------------------------------------
// Arquivo: src/styles/appStyles.ts
// -----------------------------------------------------------------------------
import React from 'react';

export const styles: { [key: string]: React.CSSProperties } = {
    app: {
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        color: '#333',
    },
    loginContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '300px',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: 'white',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    input: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '16px',
    },
    button: {
        padding: '10px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        fontSize: '16px',
        cursor: 'pointer',
    },
    toggleButton: {
        marginTop: '15px',
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
    },
    mapPage: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#333',
        color: 'white',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    buyButton: {
        padding: '8px 12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    logoutButton: {
        padding: '8px 12px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    gridContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '20px',
        flexGrow: 1,
        backgroundColor: '#e9ecef',
        overflow: 'auto',
    },
    gridRow: {
        display: 'flex',
        alignItems: 'flex-end',
    },
    tableContainer: {
        position: 'relative',
        margin: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
    },
    tableSvg: {
        stroke: '#333',
        strokeWidth: '1px',
    },
    tableText: {
        position: 'absolute',
//        top: '40%',
//        left: '50%',
        // top e left serão calculados dinamicamente
        transform: 'translate(-50%, -50%)',
        fontSize: '14px',
        fontWeight: 'bold',
        color: 'black',
        pointerEvents: 'none',
    },
    tablePlaceholder: {
        margin: '4px',
        visibility: 'hidden',
    }
};

