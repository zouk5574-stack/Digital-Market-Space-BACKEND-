import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// ✅ Routes
app.use("/api/auth", authRoutes);

// ✅ Middleware global d’erreurs (toujours à la fin)
app.use(errorHandler);

export default app;
