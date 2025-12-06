import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("❌ MONGODB_URI no está definida en el archivo .env");
    }

    console.log("🔍 Usando Mongo URI:", uri);

    await mongoose.connect(uri);

    console.log("✅ MongoDB conectado correctamente");
  } catch (err) {
    console.error("❌ Error MongoDB:", err);
    process.exit(1);
  }
};

export default connectDB;
