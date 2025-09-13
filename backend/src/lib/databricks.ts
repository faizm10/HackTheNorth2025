// src/lib/databricks.ts
import fetch from "node-fetch";

const HOST = process.env.DATABRICKS_HOST!;
const WAREHOUSE_ID = process.env.DATABRICKS_WAREHOUSE_ID!;
const TOKEN = process.env.DATABRICKS_TOKEN!;

if (!HOST || !WAREHOUSE_ID || !TOKEN) {
  throw new Error("Missing Databricks env vars");
}

type StatementResult = { status: { state: string }, result?: { data_array: any[]; row_count: number } };

export async function runSql(sql: string) {
  // 1) submit
  const submit = await fetch(`${HOST}/api/2.0/sql/statements`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      statement: sql,
      warehouse_id: WAREHOUSE_ID,
      wait_timeout: "30s" // optional small wait to avoid polling in trivial cases
    })
  });

  if (!submit.ok) {
    const text = await submit.text();
    throw new Error(`Submit failed: ${submit.status} ${text}`);
  }
  const { statement_id } = await submit.json();

  // 2) poll
  let state = "PENDING";
  let payload: StatementResult | undefined;
  const start = Date.now();
  while (true) {
    const r = await fetch(`${HOST}/api/2.0/sql/statements/${statement_id}`, {
      headers: { "Authorization": `Bearer ${TOKEN}` }
    });
    payload = (await r.json()) as StatementResult;
    state = payload.status.state;
    if (state === "SUCCEEDED" || state === "FAILED" || state === "CANCELED") break;
    if (Date.now() - start > 20000) throw new Error("Databricks query timeout");
    await new Promise(res => setTimeout(res, 500));
  }

  if (state !== "SUCCEEDED") {
    throw new Error(`Query ${state}`);
  }

  // 3) return rows as JSON
  return payload!.result?.data_array ?? [];
}
