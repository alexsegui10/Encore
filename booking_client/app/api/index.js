import dotenv from "dotenv";
// Load environment variables FIRST before importing other modules
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('🔍 Environment variables check:');
console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET ? 'Loaded ✅' : 'Missing ❌');
console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? 'Loaded ✅' : 'Missing ❌');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded ✅' : 'Missing ❌');

import express from "express";
import cors from "cors";
import { connectDB } from "../config/database.config.js";
import eventosRoutes from "../routes/evento.routes.js"; 
import categoryRoutes from "../routes/category.routes.js";
import carouselRoutes from "../routes/carousel.routes.js";
import authRoutes from "../routes/auth.routes.js";
import CommentsRoutes from "../routes/comments.routes.js";
import userRoutes from "../routes/user.routes.js";

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
app.use("/api", CommentsRoutes);
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
