export const Q_ENGAGEMENT = `
SELECT
  topic,
  COUNT(DISTINCT user_id) AS users_started,
  COUNT(DISTINCT CASE WHEN event_type='finish_lesson' THEN user_id END) AS users_finished
FROM htn.app.events
GROUP BY topic
ORDER BY users_finished DESC
`;

export const Q_WEAK_NODES = `
SELECT
  topic,
  node_id,
  AVG(items_correct * 1.0 / items_total) AS avg_accuracy,
  COUNT(*) AS attempts
FROM htn.app.quiz_results
GROUP BY topic, node_id
HAVING attempts >= 5
ORDER BY avg_accuracy ASC
LIMIT 10
`;

export const Q_ROUTING = `
SELECT
  model_used,
  COUNT(*) AS calls,
  ROUND(AVG(latency_ms)) AS avg_latency_ms,
  ROUND(100 * AVG(CASE WHEN valid_json THEN 1 ELSE 0 END), 1) AS json_validity_pct
FROM htn.app.routing_logs
GROUP BY model_used
ORDER BY calls DESC
`;
