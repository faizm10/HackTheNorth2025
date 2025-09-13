USE htn.app;

-- Seed 25 users x 5 topics x ~4 nodes/topic x events/quiz + routing logs

-- Topics + nodes
CREATE OR REPLACE TEMP VIEW topics AS
SELECT explode(array("System Design","CPU","Databases","Networking","OS")) AS topic;

CREATE OR REPLACE TEMP VIEW nodes AS
SELECT topic, concat_ws("-", topic, cast(n as string)) AS node_id
FROM topics, range(1,5) t(n);

-- Users
CREATE OR REPLACE TEMP VIEW users AS
SELECT concat("u", lpad(cast(id as string), 3, "0")) AS user_id
FROM range(1,26);

-- Events (start/finish lesson/quiz) across last 24h
INSERT INTO events
SELECT
  current_timestamp() - INTERVAL cast(rand()*24 as int) HOURS AS event_time,
  u.user_id,
  n.topic,
  n.node_id,
  element_at(array("start_lesson","finish_lesson","start_quiz","submit_quiz"), cast(rand()*4 as int)+1) AS event_type,
  map_from_arrays(array("client","session"), array("web","demo"))
FROM users u CROSS JOIN nodes n
WHERE rand() < 0.35;

-- Quiz results (biased so some nodes look "weak")
INSERT INTO quiz_results
SELECT
  current_timestamp() - INTERVAL cast(rand()*24 as int) HOURS AS submitted_at,
  u.user_id, n.topic, n.node_id,
  6 AS items_total,
  greatest(0, least(6, cast(6*rand() - case when rand()<0.2 then 2 else 0 end as int))) AS items_correct,
  cast(30 + rand()*120 as int) AS duration_sec
FROM users u CROSS JOIN nodes n
WHERE rand() < 0.28;

-- Routing logs (Martian model choices)
INSERT INTO routing_logs
SELECT
  current_timestamp() - INTERVAL cast(rand()*24 as int) HOURS AS ts,
  element_at(array("topic_map","chunk_classify","quiz_generate","overview_summarize"), cast(rand()*4 as int)+1) AS task,
  element_at(array("google/gemini-2.5-flash","cohere/command-r-08-2024","meta-llama/llama-3.3-70b-versatile"), cast(rand()*3 as int)+1) AS model_used,
  cast(800 + rand()*2200 as int) AS latency_ms,
  rand() > 0.08 AS valid_json
FROM range(1,600);
