import { AppDataSource } from '../config/data-source';

export interface EventStatus {
  id_event: number;
  total_mesas: number;
  total_comprado: number;
  total_disponivel: number;
  percentual_comprado: number;
  percentual_disponivel: number;
}

export interface EventSeatsReportItem {
  owner_codigo_lote: string;
  qtd: number;
  seat_name: string[];
}

export interface EventSeatsReport {
  event_name: string;
  items: EventSeatsReportItem[];
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

export const getEventSeatsReport = async (id_event: number): Promise<EventSeatsReport[]> => {
  const sql = `
    SELECT COALESCE(json_agg(
      json_build_object(
        'event_name', event_name,
        'items', items
      )
      ORDER BY event_name
    ), '[]'::json) AS result
    FROM (
      SELECT
        event_name,
        json_agg(
          json_build_object(
            'owner_codigo_lote', owner_codigo_lote,
            'qtd', qtd,
            'seat_name', seat_names
          )
          ORDER BY owner_codigo_lote::int
        ) AS items
      FROM (
        SELECT
          e.name AS event_name,
          s.owner_codigo_lote,
          count(*) AS qtd,
          array_agg(s.seat_name ORDER BY s.seat_name) AS seat_names
        FROM events e
        JOIN seats s ON e.id = s.id_event
        WHERE s.owner_codigo_lote IS NOT NULL
          AND e.id = $1
        GROUP BY e.name, s.owner_codigo_lote
      ) g
      GROUP BY event_name
    ) t;
  `;

  const result = await AppDataSource.manager.query(sql, [id_event]);

  if (!result || result.length === 0) {
    return [];
  }

  return result[0].result || [];
};
