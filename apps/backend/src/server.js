import "dotenv/config";
import cors from "cors";
import express from "express";
import { config, hasSupabase } from "./config.js";
import { adminRouter } from "./routes/admin-routes.js";
import { authRouter } from "./routes/auth-routes.js";
import { chartRouter } from "./routes/chart-routes.js";
import { playRouter } from "./routes/play-routes.js";
import { publicRouter } from "./routes/public-routes.js";
import { startChartJobs } from "./jobs/chart-jobs.js";

const app = express();

app.use(cors({ origin: config.frontendUrl }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "orbitune-backend",
    supabase: hasSupabase ? "configured" : "demo-local",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/plays", playRouter);
app.use("/api/charts", chartRouter);
app.use("/api", publicRouter);
app.use("/api/admin", adminRouter);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Rota nao encontrada.",
    path: req.path,
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    ok: false,
    error: error.message || "Erro interno do backend.",
  });
});

startChartJobs();

app.listen(config.port, () => {
  console.log(`Orbitune backend em http://localhost:${config.port}`);
});
