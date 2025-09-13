USE default;

-- Topics
CREATE OR REPLACE TEMP VIEW topics AS
SELECT topic FROM VALUES
  ('System Design'), ('CPU'), ('Databases'), ('Networking'), ('OS') AS t(topic);

-- Nodes: topic-1 .. topic-4
CREATE OR REPLACE TEMP VIEW nodes AS
SELECT t.topic,
       concat_ws('-', t.topic, cast(r.n AS string)) AS node_id
FROM topics t
CROSS JOIN RANGE(1,5) AS r(n);

-- Users: u001..u025
CREATE OR REPLACE TEMP VIEW users AS
SELECT concat('u', lpad(cast(id AS string), 3, '0')) AS user_id
FROM RANGE(1,26);

-- Events (last 24h)
INSERT INTO workspace.default.events
SELECT
  date_add(
    HOUR,
    - cast(rand()*24 AS int),
    current_timestamp()
  ) AS event_time,
  u.user_id,
  n.topic,
  n.node_id,
  element_at(
    array('start_lesson','finish_lesson','start_quiz','submit_quiz'),
    cast(rand()*4 AS int)+1
  ) AS event_type,
  map_from_arrays(
    array('client','session'),
    array('web','demo')
  ) AS meta
FROM users u
CROSS JOIN nodes n
WHERE rand() < 0.35;

-- Quiz results
INSERT INTO quiz_results
SELECT
  date_add(
    HOUR,
    - cast(rand()*24 AS int),
    current_timestamp()
  ) AS submitted_at,
  u.user_id, n.topic, n.node_id,
  6 AS items_total,
  greatest(
    0,
    least(
      6,
      cast(6*rand() - CASE WHEN rand()<0.2 THEN 2 ELSE 0 END AS int)
    )
  ) AS items_correct,
  cast(30 + rand()*120 AS int) AS duration_sec
FROM users u
CROSS JOIN nodes n
WHERE rand() < 0.28;

-- Routing logs
INSERT INTO routing_logs
SELECT
  date_add(
    HOUR,
    - cast(rand()*24 AS int),
    current_timestamp()
  ) AS ts,
  element_at(
    array('topic_map','chunk_classify','quiz_generate','overview_summarize'),
    cast(rand()*4 AS int)+1
  ) AS task,
  element_at(
    array('google/gemini-2.5-flash','cohere/command-r-08-2024','meta-llama/llama-3.3-70b-versatile'),
    cast(rand()*3 AS int)+1
  ) AS model_used,
  cast(800 + rand()*2200 AS int) AS latency_ms,
  (rand() > 0.08) AS valid_json
FROM RANGE(1,600);