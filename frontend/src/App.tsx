import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';

// --- CONFIGURAÇÃO ---
const API_URL = 'http://localhost:8080';
const WEBSOCKET_URL = 'ws://localhost:8080';

// --- DEFINIÇÃO DE TIPOS ---
interface TableData {
    _id: string;
    linha: number;
    coluna: number;
    status: 'livre' | 'selecionada' | 'comprada';
    tipo: 'S' | 'D' | null;
    ownerId: string | null;
}

interface MapUpdatePayload {
    tables: TableData[];
    usersCredits: Record<string, number>;
}

interface AuthContextType {
    token: string | null;
    idCasa: string | null;
    login: (token: string, idCasa: string) => void;
    logout: () => void;
}

interface WebSocketContextType {
    tables: TableData[];
    userCredits: number;
    sendMessage: (message: object) => void;
}

// --- CONTEXTOS REACT ---
const AuthContext = createContext<AuthContextType | null>(null);
const WebSocketContext = createContext<WebSocketContextType | null>(null);

// --- NOVO COMPONENTE: SvgSpriteLoader ---
// Este componente carrega o arquivo SVG do template e o injeta no DOM.
const SvgSpriteLoader: React.FC<{ url: string }> = ({ url }) => {
    const [svgContent, setSvgContent] = useState<string>('');

    useEffect(() => {
        const fetchSvg = async () => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const text = await response.text();
                    setSvgContent(text);
                }
            } catch (error) {
                console.error("Não foi possível carregar o template SVG:", error);
            }
        };

        fetchSvg();
    }, [url]);

    // Usa dangerouslySetInnerHTML para renderizar o conteúdo SVG.
    // Isso é seguro aqui porque estamos a carregar um arquivo local do nosso próprio projeto.
    return <div dangerouslySetInnerHTML={{ __html: svgContent }} style={{ display: 'none' }} />;
};


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
            {/* Carrega o template SVG para que possa ser usado em toda a aplicação */}
            <SvgSpriteLoader url="/mesa-svg.html" />
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

    const baseWidth = 50;
    const baseHeight = 60;

    return (
        <div style={styles.gridContainer}>
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} 
                    style={{ ...styles.gridRow, marginTop: `${-18 + rowIndex/2}px`, // CÁLCULO INLINE COM A NOVA FÓRMULA
                    }}>
                    {row.map((table, colIndex) => {
                        if (table) {
                            return <Table key={table._id} tableData={table} />;
                        } else {
                            // --- CÁLCULO DINÂMICO PARA O PLACEHOLDER ---
                            const scaleFactor = 1 + (rowIndex * 0.03);
                            const placeholderStyle = {
                                ...styles.tablePlaceholder,
                                width: `${baseWidth * scaleFactor}px`,
                                height: `${baseHeight * scaleFactor}px`,
                            };
                            return <div key={`${rowIndex}-${colIndex}`} style={placeholderStyle}></div>;
                        }
                    })}
                </div>
            ))}
        </div>
    );
};


// --- COMPONENTE DE MESA INDIVIDUAL (MODIFICADO PARA USAR SVG) ---
const Table: React.FC<{ tableData: TableData }> = ({ tableData }) => {
    const auth = useContext(AuthContext);
    const wsContext = useContext(WebSocketContext);

    const handleClick = () => {
        const { status, ownerId } = tableData;
        const isClickable = status === 'livre' || ownerId === auth?.idCasa;
        if (isClickable) {
            wsContext?.sendMessage({
                type: 'cliqueMesa',
                payload: {
                    linha: tableData.linha,
                    coluna: tableData.coluna,
                },
            });
        }
    };

    const getTableColor = (): string => {
        const { status, tipo, ownerId } = tableData;
        const currentUserIdCasa = auth?.idCasa;
        
        if (status === 'selecionada') {
            if (ownerId === currentUserIdCasa) {
                return tipo === 'S' ? '#ADD8E6' : '#00008B'; // Azul Claro / Azul Escuro
            } else {
                return tipo === 'S' ? '#FFFFE0' : '#FFD700'; // Amarelo Claro / Amarelo Escuro
            }
        }
        if (status === 'comprada') {
            if (ownerId === currentUserIdCasa) {
                return tipo === 'S' ? '#90EE90' : '#006400'; // Verde Claro / Verde Escuro
            } else {
                return tipo === 'S' ? '#D3D3D3' : '#A9A9A9'; // Cinza Claro / Cinza Escuro
            }
        }
        return '#FFFFFF'; // Branco (livre)
    };

    const { status, ownerId } = tableData;
    const isClickable = status === 'livre' || ownerId === auth?.idCasa;
    const tableColor = getTableColor();

    // --- CÁLCULO DINÂMICO DO TAMANHO DA MESA ---
    const baseWidth = 50; // Largura inicial em pixels
    const baseHeight = 60; // Altura inicial em pixels
    const scaleFactor = 1 + (tableData.linha * 0.03); // Fator de incremento de 3% por linha

    const dynamicTableStyle = {
        ...styles.tableContainer,
        width: `${baseWidth * scaleFactor}px`,
        height: `${baseHeight * scaleFactor}px`,
        cursor: isClickable ? 'pointer' : 'not-allowed',
    };

    return (
        <div style={dynamicTableStyle} onClick={handleClick}>
            <svg style={styles.tableSvg} fill={tableColor} preserveAspectRatio="none">
                {/* O ID '#mesa-forma' deve corresponder ao ID do symbol no seu template-mesa.html */}
                <use href="#mesa-forma" />
            </svg>
            {tableData.tipo && <span style={styles.tableText}>{tableData.ownerId}</span>} {/* Exibe o ID do dono da mesa */}
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
        justifyContent: 'flex-start', // Alterado de 'center' para 'flex-start' para alinhar a grelha ao topo
        padding: '20px',
        flexGrow: 1,
        backgroundColor: '#e9ecef',
        overflow: 'auto',
    },
    gridRow: {
        display: 'flex',
        alignItems: 'flex-end', // Garante que as mesas se alinhem pela base
    },
    // Estilos para o novo componente Table com SVG
    tableContainer: {
        position: 'relative',
        margin: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
    },
    tableSvg: {
        width: '100%',
        height: '100%',
        stroke: '#333', // Cor da borda do SVG
        strokeWidth: '1px',
    },
    tableText: {
        position: 'absolute',
        top: '40%',    // acerta o texto verticalmente
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '14px',
        fontWeight: 'bold',
        color: 'black',
        pointerEvents: 'none', // Garante que o texto não interfere no clique
    },
    tablePlaceholder: {
        margin: '4px',
        visibility: 'hidden',
    }
};

export default App;
