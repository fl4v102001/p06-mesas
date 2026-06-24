import { AppDataSource } from '../config/data-source';

export interface EventStatus {
  id_event: number;
  total_mesas: number;
  total_comprado: number;
  total_disponivel: number;
  percentual_comprado: number;
  percentual_disponivel: number;
}

export const getEventStatus = async (id_event: number): Promise<EventStatus> => {
  const sql = `
    SELECT
      m.id_event,
      m.total_mesas,
      COALESCE(c.total_comprado, 0) AS total_comprado,
      (m.total_mesas - COALESCE(c.total_comprado, 0)) AS total_disponivel,
      CASE
        WHEN m.total_mesas = 0 THEN 0
        ELSE ROUND((COALESCE(c.total_comprado, 0)::numeric / m.total_mesas) * 100)::int
      END AS percentual_comprado,
      CASE
        WHEN m.total_mesas = 0 THEN 0
        ELSE (100 - ROUND((COALESCE(c.total_comprado, 0)::numeric / m.total_mesas) * 100)::int)
      END AS percentual_disponivel
    FROM (
      SELECT
        $1::int8 AS id_event,
        COUNT(s.id) AS total_mesas
      FROM seats s
      WHERE s.seat_type IN ('mesa-4', 'mesa-6')
        AND s.id_event = $1
    ) AS m
    LEFT JOIN (
      SELECT
        $1::int8 AS id_event,
        COUNT(s.id) AS total_comprado
      FROM seats s
      WHERE s.seat_type IN ('mesa-4', 'mesa-6')
        AND s.status = 'comprada'
        AND s.id_event = $1
    ) AS c
    ON c.id_event = m.id_event;
  `;

  const result = await AppDataSource.manager.query(sql, [id_event]);

  if (!result || result.length === 0) {
    return {
      id_event,
      total_mesas: 0,
      total_comprado: 0,
      total_disponivel: 0,
      percentual_comprado: 0,
      percentual_disponivel: 0
    };
  }

  const row = result[0];

  return {
    id_event: Number(row.id_event),
    total_mesas: Number(row.total_mesas),
    total_comprado: Number(row.total_comprado),
    total_disponivel: Number(row.total_disponivel),
    percentual_comprado: Number(row.percentual_comprado),
    percentual_disponivel: Number(row.percentual_disponivel)
  };
};
