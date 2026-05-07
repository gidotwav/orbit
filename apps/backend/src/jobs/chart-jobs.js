import cron from "node-cron";
import { calculateAndSaveChart } from "../services/chart-service.js";

export function startChartJobs() {
  cron.schedule("0 * * * *", () => runJob("hourly"));
  cron.schedule("0 0 * * *", () => runJob("daily"));
  cron.schedule("0 0 * * 1", () => runJob("weekly"));
}

async function runJob(type) {
  try {
    const result = await calculateAndSaveChart(type);
    console.log(`[charts] ${type} atualizado: ${result.data?.length || 0} entradas`);
  } catch (error) {
    console.error(`[charts] falha no job ${type}`, error);
  }
}
