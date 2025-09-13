// src/routes/admin.ts
import { Router } from "express";
import { runSql } from "../lib/databricks.js";
import { Q_ENGAGEMENT, Q_WEAK_NODES, Q_ROUTING } from "../metrics/queries.js";

export const adminRouter = Router();

adminRouter.get("/engagement", async (_req, res) => {
  try {
    const rows = await runSql(Q_ENGAGEMENT);
    res.json({ ok: true, rows });
  } catch (e:any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

adminRouter.get("/weak-nodes", async (_req, res) => {
  try {
    const rows = await runSql(Q_WEAK_NODES);
    res.json({ ok: true, rows });
  } catch (e:any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

adminRouter.get("/routing", async (_req, res) => {
  try {
    const rows = await runSql(Q_ROUTING);
    res.json({ ok: true, rows });
  } catch (e:any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});
