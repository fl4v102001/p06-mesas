import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';

// npm start para iniciar o servidor React
// Certifique-se de que o backend está a ser executado antes de iniciar o frontend.


// --- CONFIGURAÇÃO ---
// Altere estes valores se o seu backend estiver a ser executado num endereço ou porta diferente.
const API_URL = 'http://localhost:8080';
const WEBSOCKET_URL = 'ws://localhost:8080';

// --- DEFINIÇÃO DE TIPOS ---
// Estes tipos devem corresponder às interfaces definidas no backend.

// Tipo para os dados de uma única mesa
interface TableData {
    _id: string;
    linha: number;
    coluna: number;
    status: 'livre' | 'selecionada' | 'comprada';
    tipo: 'S' | 'D' | null;
    ownerId: string | null;
}

// Tipo para o payload da mensagem de atualização do mapa
interface MapUpdatePayload {
    tables: TableData[];
    usersCredits: Record<string, number>;
}

// Tipo para o contexto de autenticação
interface AuthContextType {
    token: string | null;
    idCasa: string | null;
    login: (token: string, idCasa: string) => void;
    logout: () => void;
}

// Tipo para o contexto do WebSocket
interface WebSocketContextType {
    tables: TableData[];
    userCredits: number;
    sendMessage: (message: object) => void;
}

// --- CONTEXTOS REACT ---

// Contexto para gerir a autenticação do utilizador
const AuthContext = createContext<AuthContextType | null>(null);

// Contexto para gerir os dados recebidos via WebSocket
const WebSocketContext = createContext<WebSocketContextType | null>(null);

// --- COMPONENTE PRINCIPAL: App ---
const App: React.FC = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [idCasa, setIdCasa] = useState<string | null>(localStorage.getItem('idCasa'));

    const login = (newToken: string, newIdCasa: string) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('idCasa', newIdCasa);
        setToken(newToken);
        setIdCasa(newIdCasa);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('idCasa');
        setToken(null);
        setIdCasa(null);
    };

    const authContextValue = { token, idCasa, login, logout };

    return (
        <AuthContext.Provider value={authContextValue}>
            <div style={styles.app}>
                {token && idCasa ? <MapPage /> : <LoginPage />}
            </div>
        </AuthContext.Provider>
    );
};

// --- PÁGINA DE LOGIN E REGISTO ---
const LoginPage: React.FC = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        nomeCompleto: '',
        idCasa: '',
        email: '',
        senha: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const auth = useContext(AuthContext);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
        const body = isRegistering
            ? JSON.stringify(formData)
            : JSON.stringify({ idCasa: formData.idCasa, senha: formData.senha });

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ocorreu um erro.');
            }

            if (isRegistering) {
                setSuccess('Registo efetuado com sucesso! Por favor, faça o login.');
                setIsRegistering(false);
            } else {
                auth?.login(data.token, data.idCasa);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div style={styles.loginContainer}>
            <h2>{isRegistering ? 'Registar Nova Conta' : 'Login no Sistema de Reservas'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                {isRegistering && (
                    <>
                        <input type="text" name="nomeCompleto" placeholder="Nome Completo" onChange={handleChange} style={styles.input} required />
                        <input type="email" name="email" placeholder="Email" onChange={handleChange} style={styles.input} required />
                    </>
                )}
                <input type="text" name="idCasa" placeholder="ID-Casa" onChange={handleChange} style={styles.input} required />
                <input type="password" name="senha" placeholder="Senha" onChange={handleChange} style={styles.input} required />
                <button type="submit" style={styles.button}>
                    {isRegistering ? 'Registar' : 'Login'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <button onClick={() => setIsRegistering(!isRegistering)} style={styles.toggleButton}>
                {isRegistering ? 'Já tem uma conta? Faça o login' : 'Não tem uma conta? Registe-se'}
            </button>
        </div>
    );
};

// --- PÁGINA PRINCIPAL DO MAPA DE MESAS ---
const MapPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const [tables, setTables] = useState<TableData[]>([]);
    const [usersCredits, setUsersCredits] = useState<Record<string, number>>({});
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        if (!auth?.token) return;

        const socket = new WebSocket(`${WEBSOCKET_URL}?token=${auth.token}`);
        setWs(socket);

        socket.onopen = () => console.log('WebSocket Conectado');
        socket.onclose = () => console.log('WebSocket Desconectado');

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'map-update') {
                const payload: MapUpdatePayload = data.payload;
                setTables(payload.tables);
                setUsersCredits(payload.usersCredits);
            }
        };

        return () => {
            socket.close();
        };
    }, [auth?.token]);

    const sendMessage = (message: object) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    };

    // CORREÇÃO: Lógica mais robusta para garantir que userCredits seja sempre um número.
    const idCasa = auth?.idCasa;
    const userCredits = idCasa ? (usersCredits[idCasa] ?? 0) : 0;

    const webSocketContextValue = { tables, userCredits, sendMessage };

    return (
        <WebSocketContext.Provider value={webSocketContextValue}>
            <div style={styles.mapPage}>
                <Header />
                <TableGrid />
            </div>
        </WebSocketContext.Provider>
    );
};

// --- CABEÇALHO DA PÁGINA DO MAPA ---
const Header: React.FC = () => {
    const auth = useContext(AuthContext);
    const wsContext = useContext(WebSocketContext);

    return (
        <header style={styles.header}>
            <h1>Mapa de Mesas</h1>
            <div style={styles.userInfo}>
                <span>ID-Casa: <strong>{auth?.idCasa}</strong></span>
                <span>Créditos: <strong>{wsContext?.userCredits}</strong></span>
                <button onClick={auth?.logout} style={styles.logoutButton}>Logout</button>
            </div>
        </header>
    );
};

// --- GRELHA DE MESAS ---
const TableGrid: React.FC = () => {
    const wsContext = useContext(WebSocketContext);

    // Organiza as mesas numa matriz para facilitar a renderização
    const grid = useMemo(() => {
        if (!wsContext?.tables || wsContext.tables.length === 0) return [];
        
        const maxLinha = Math.max(...wsContext.tables.map(t => t.linha));
        const maxColuna = Math.max(...wsContext.tables.map(t => t.coluna));

        const newGrid: (TableData | null)[][] = Array(maxLinha + 1).fill(null).map(() => Array(maxColuna + 1).fill(null));
        
        wsContext.tables.forEach(table => {
            if (table.linha <= maxLinha && table.coluna <= maxColuna) {
                newGrid[table.linha][table.coluna] = table;
            }
        });
        return newGrid;
    }, [wsContext?.tables]);


    if (!wsContext) return <p>A carregar mapa...</p>;

    return (
        <div style={styles.gridContainer}>
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} style={styles.gridRow}>
                    {row.map((table, colIndex) =>
                        table ? <Table key={table._id} tableData={table} /> : <div key={`${rowIndex}-${colIndex}`} style={styles.tablePlaceholder}></div>
                    )}
                </div>
            ))}
        </div>
    );
};


// --- COMPONENTE DE MESA INDIVIDUAL ---
const Table: React.FC<{ tableData: TableData }> = ({ tableData }) => {
    const auth = useContext(AuthContext);
    const wsContext = useContext(WebSocketContext);

    const handleClick = () => {
        wsContext?.sendMessage({
            type: 'cliqueMesa',
            payload: {
                linha: tableData.linha,
                coluna: tableData.coluna,
            },
        });
    };

    const getTableStyle = (): React.CSSProperties => {
        const { status, tipo, ownerId } = tableData;
        const currentUserIdCasa = auth?.idCasa;
        let backgroundColor = '#FFFFFF'; // Branco (livre)

        if (status === 'selecionada') {
            if (ownerId === currentUserIdCasa) {
                backgroundColor = tipo === 'S' ? '#9EAEFF' : '#3936E2'; // Azul Claro / Azul Escuro
            } else {
                backgroundColor = tipo === 'S' ? '#FFFF80' : '#FFD700'; // Amarelo Claro / Amarelo Escuro (Dourado)
            }
        } else if (status === 'comprada') {
            if (ownerId === currentUserIdCasa) {
                backgroundColor = tipo === 'S' ? '#80FF80' : '#006400'; // Verde Claro / Verde Escuro
            } else {
                backgroundColor = tipo === 'S' ? '#808080' : '#6E6E6E'; // Cinza Claro / Cinza Escuro
            }
        }
        
        const isClickable = status === 'livre' || ownerId === currentUserIdCasa;

        return {
            ...styles.table,
            backgroundColor,
            cursor: isClickable ? 'pointer' : 'not-allowed',
        };
    };

    return (
        <div style={getTableStyle()} onClick={handleClick}>
            {tableData.tipo}
        </div>
    );
};

// --- ESTILOS (CSS-in-JS) ---
const styles: { [key: string]: React.CSSProperties } = {
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
        justifyContent: 'center',
        padding: '20px',
        flexGrow: 1,
        backgroundColor: '#e9ecef',
        overflow: 'auto',
    },
    gridRow: {
        display: 'flex',
    },
    table: {
        width: '40px',
        height: '40px',
        border: '1px solid #999',
        margin: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'black',
        borderRadius: '4px',
        userSelect: 'none',
    },
    tablePlaceholder: {
        width: '40px',
        height: '40px',
        margin: '2px',
        visibility: 'hidden',
    }
};

export default App;
