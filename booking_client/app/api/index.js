import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "../config/database.config.js";
import eventosRoutes from "../routes/evento.routes.js"; 
import categoryRoutes from "../routes/category.routes.js";
import carouselRoutes from "../routes/carousel.routes.js";
import authRoutes from "../routes/auth.routes.js";
import userRoutes from "../routes/user.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

await connectDB(); 

app.get("/", (_req, res) => res.send("API OK"));

// Routes
app.use("/api", eventosRoutes);
app.use("/api", categoryRoutes);
app.use("/api", carouselRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Servidor escuchando en http://127.0.0.1:${PORT}`);
});
