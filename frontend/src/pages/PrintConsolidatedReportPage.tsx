import React, { useEffect, useState } from 'react';
import { getConsolidatedSeatsReport } from '../api/eventService';
import { ConsolidatedSeatsReport } from '../types';

interface GroupedReportItem {
    owner_codigo_lote: string;
    seat_names: string[];
}

export const PrintConsolidatedReportPage: React.FC = () => {
    const [reportData, setReportData] = useState<GroupedReportItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        document.title = "Relatório Consolidado";
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
                const data = await getConsolidatedSeatsReport(token);
                
                // Agrupa os dados por owner_codigo_lote
                const groupedData: Record<string, string[]> = {};
                
                data.forEach((item: ConsolidatedSeatsReport) => {
                    if (item.owner_codigo_lote) {
                        if (!groupedData[item.owner_codigo_lote]) {
                            groupedData[item.owner_codigo_lote] = [];
                        }
                        if (item.seat_name) {
                            groupedData[item.owner_codigo_lote].push(item.seat_name);
                        }
                    }
                });

                const formattedData: GroupedReportItem[] = Object.keys(groupedData).map(key => ({
                    owner_codigo_lote: key,
                    seat_names: groupedData[key]
                }));

                // Ordena por owner_codigo_lote
                formattedData.sort((a, b) => {
                    const aNum = parseInt(a.owner_codigo_lote, 10);
                    const bNum = parseInt(b.owner_codigo_lote, 10);
                    if (!isNaN(aNum) && !isNaN(bNum)) {
                        return aNum - bNum;
                    }
                    return a.owner_codigo_lote.localeCompare(b.owner_codigo_lote);
                });

                setReportData(formattedData);
            } catch (err: any) {
                setError(err?.message || 'Erro ao carregar o relatório para impressão.');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, []);

    // // Dispara a impressão após o carregamento e renderização com sucesso
    // useEffect(() => {
    //     if (!loading && reportData.length > 0 && !error) {
    //         const timer = setTimeout(() => {
    //             window.print();
    //         }, 500);
    //         return () => clearTimeout(timer);
    //     }
    // }, [loading, reportData, error]);

    if (loading) {
        return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Carregando relatório para impressão...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'red' }}>Erro: {error}</div>;
    }

    if (!reportData || reportData.length === 0) {
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
                Relatório Consolidado
            </h1>
            <div className="no-print" style={{ textAlign: 'center', marginBottom: '40px' }}>
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
                    Imprimir
                </button>
            </div>
            <div className="card-container">
                {reportData.map((item, index) => (
                    <div className="print-card" key={index}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span className="label-small">Casa</span>
                            <span className="label-large">{item.owner_codigo_lote}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span className="label-small margin-bottom-small">Mesas</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="label-medium">
                                {item.seat_names && item.seat_names.map((seat, sIdx) => {
                                    return <div key={sIdx}>{seat}</div>;
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
                    Imprimir
                </button>
            </div>
        </div>
    );
};
