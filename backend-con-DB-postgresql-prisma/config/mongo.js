import mongoose from "mongoose";
import "dotenv/config";

export async function connectToMongoDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("No se encontro la variable MONGODB_URI");
    }

    await mongoose.connect(mongoUri);
    console.log("Conexion exitosa a MongoDB");
  } catch (error) {
    console.log("Error al conectarse con MongoDB:", error.message);
    process.exit(1);
  }
}
