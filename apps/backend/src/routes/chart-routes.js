import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { calculateAndSaveChart, getLatestChart, normalizeChartType } from "../services/chart-service.js";

export const chartRouter = Router();

chartRouter.get("/:type", async (req, res, next) => {
  try {
    const chartType = normalizeChartType(req.params.type);
    const result = await getLatestChart(chartType);
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

chartRouter.post("/:type/refresh", requireAdmin, async (req, res, next) => {
  try {
    const chartType = normalizeChartType(req.params.type);
    const result = await calculateAndSaveChart(chartType);
    res.json({ ok: true, refreshed: chartType, ...result });
  } catch (error) {
    next(error);
  }
});
