import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("Falta MONGO_URI en .env");
 
    await mongoose.connect(uri, {
      serverApi: { version: "1", strict: true, deprecationErrors: true },
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ Conectado a MongoDB:", mongoose.connection.host);
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err.message);
    process.exit(1);
  }
};
//a