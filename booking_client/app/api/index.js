import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "../config/database.config.js";
// import conciertosRoutes from "../routes/concierto.routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
connectDB();

// Rutas
// app.use("/conciertos", conciertosRoutes);

// Servidor
app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
