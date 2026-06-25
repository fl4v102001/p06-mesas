import React, { useEffect, useState } from 'react';
import { getEventSeatsReport } from '../api/eventService';

interface SeatName {
    [key: string]: number;
}

interface ReportItem {
    owner_codigo_lote: string;
    qtd: number;
    total: number;
    seat_name: SeatName[];
}

interface ReportEvent {
    event_name: string;
    items: ReportItem[];
}

interface PrintReportPageProps {
    eventId: string;
}

export const PrintReportPage: React.FC<PrintReportPageProps> = ({ eventId }) => {
    const [reportData, setReportData] = useState<ReportEvent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        document.title = "Relatório";
    }, []);

    useEffect(() => {
        const fetchReport = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Usuário não autenticado.');
                setLoading(false);
                return;
            }

            try {
                const data = await getEventSeatsReport(token, eventId);
                // Valida o formato dos dados
                const isReportData = Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null && 'event_name' in data[0];
                
                if (isReportData) {
                    setReportData(data[0] as unknown as ReportEvent);
                } else {
                    setError('Formato de dados inválido.');
                }
            } catch (err: any) {
                setError(err?.message || 'Erro ao carregar o relatório para impressão.');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [eventId]);

    // Dispara a impressão após o carregamento e renderização com sucesso
    useEffect(() => {
        if (!loading && reportData && !error) {
            // Um pequeno delay garante que o DOM terminou de desenhar as imagens/fontes
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [loading, reportData, error]);

    if (loading) {
        return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Carregando relatório para impressão...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'red' }}>Erro: {error}</div>;
    }

    if (!reportData) {
        return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Nenhum dado encontrado.</div>;
    }

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <style>
                {`
                .card-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 20px;
                }
                .print-card {
                    border: 2px solid #616161ff;
                    border-radius: 12px;
                    background-color: #fff;
                    padding: 15px;
                    display: flex;
                    justify-content: space-between;
                    color: #000000ff;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .label-small { font-size: 14px; font-weight: bold; }
                .label-large { font-size: 46px; line-height: 1.2; }
                .label-medium { font-size: 18px; }
                .margin-bottom-small { margin-bottom: 5px; }

                @media print {
                    @page { 
                        margin: 10mm; 
                    }
                    body { 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                        margin: 0;
                        background-color: white;
                    }
                    .print-card { 
                        break-inside: avoid; 
                        page-break-inside: avoid; 
                        /* Reduz tamanho em 50% */
                        padding: 7px;
                        border-width: 1px;
                        border-radius: 6px;
                        box-shadow: none;
                    }
                    .card-container {
                        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
                        gap: 10px;
                    }
                    .label-small { font-size: 7px; }
                    .label-large { font-size: 23px; }
                    .label-medium { font-size: 9px; }
                    .margin-bottom-small { margin-bottom: 2px; }

                    .no-print { 
                        display: none !important; 
                    }
                }
                `}
            </style>
            
            <h1 style={{ textAlign: 'center', color: '#000000ff', marginBottom: '30px' }}>
                {reportData.event_name || 'Evento'}
            </h1>
            
            <div className="card-container">
                {reportData.items.map((item, index) => (
                    <div className="print-card" key={index}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span className="label-small">Casa</span>
                            <span className="label-large">{item.owner_codigo_lote}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span className="label-small margin-bottom-small">Mesas</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="label-medium">
                                {item.seat_name && item.seat_name.map((seat, sIdx) => {
                                    const seatKey = Object.keys(seat)[0];
                                    return <div key={sIdx}>{seatKey}</div>;
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="no-print" style={{ textAlign: 'center', marginTop: '40px' }}>
                <button 
                    onClick={() => window.print()}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#1a56b6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Imprimir Novamente
                </button>
            </div>
        </div>
    );
};
