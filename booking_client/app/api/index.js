import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "../config/database.config.js";
import eventosRoutes from "../routes/evento.routes.js"; 
import categoryRoutes from "../routes/category.routes.js";
import carouselRoutes from "../routes/carousel.routes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

await connectDB(); 

app.get("/", (_req, res) => res.send("API OK"));

app.use("/api", eventosRoutes);
app.use("/api", categoryRoutes);
app.use("/api", carouselRoutes);
//a

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});
