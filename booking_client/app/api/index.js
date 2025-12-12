// Load dotenv only when running locally (not in Docker where env vars are set)
if (!process.env.MONGO_URI) {
  const dotenv = await import("dotenv");
  dotenv.config();
}

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "../config/database.config.js";
import eventosRoutes from "../routes/evento.routes.js";
import categoryRoutes from "../routes/category.routes.js";
import carouselRoutes from "../routes/carousel.routes.js";
import authRoutes from "../routes/auth.routes.js";
import CommentsRoutes from "../routes/comments.routes.js";
import userRoutes from "../routes/user.routes.js";
import profileRoutes from "../routes/profile.routes.js";
import paymentRoutes from "../routes/payment.routes.js";
import cartRoutes from "../routes/cart.routes.js";
import { startTokenCleanup } from "../jobs/tokenCleanup.js";
import orderRoutes from "../routes/orders.routes.js";
import ragRoutes from "../routes/rag.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

await connectDB();

startTokenCleanup();

app.get("/", (_req, res) => res.send("API OK"));

// Routes
app.use("/api", eventosRoutes);
app.use("/api", categoryRoutes);
app.use("/api", carouselRoutes);
app.use("/api", CommentsRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", profileRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", ragRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});