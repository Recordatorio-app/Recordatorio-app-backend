import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "./models/Task";
import User from "./models/User";

dotenv.config();

const tasks = [
  {
    title: "Pagar recibo de agua",
    description: "El recibo vence esta semana, revisar monto en Sedapal.",
    status: "pendiente",
    reminderDate: new Date("2025-12-10T09:00:00.000Z"),
    colorKey: "importante",
  },
  {
    title: "Comprar víveres del mes",
    description: "Leche, arroz, avena, frutas, verduras y huevos.",
    status: "pendiente",
    reminderDate: new Date("2025-12-12T14:30:00.000Z"),
    colorKey: "normal",
  },
  {
    title: "Hacer reporte semanal",
    description: "Preparar el reporte de actividades del área de sistemas.",
    status: "pendiente",
    reminderDate: new Date("2025-12-11T18:00:00.000Z"),
    colorKey: "urgente",
  },
  {
    title: "Comprar regalo de cumpleaños",
    description: "Regalo para mamá, revisar opciones en Ripley o Saga.",
    status: "pendiente",
    reminderDate: new Date("2025-12-20T10:00:00.000Z"),
    colorKey: "personal",
  },
  {
    title: "Renovar suscripción de Netflix",
    description: "Verificar método de pago y renovar antes de vencimiento.",
    status: "pendiente",
    reminderDate: new Date("2025-12-30T09:00:00.000Z"),
    colorKey: "baja",
  },
  {
    title: "Agendar cita médica",
    description: "Cita anual, buscar fechas disponibles.",
    status: "pendiente",
    reminderDate: new Date("2025-12-15T08:00:00.000Z"),
    colorKey: "importante",
  },
];

const users = [
  {
    name: "Usuario de Prueba",
    email: "joao@mail.com",
    password: "joao123",
    phone: "1234567890",
  },
];

const seed = async () => {
  try {
    console.log("🔌 Conectando a Mongo...");
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("🗑️ Eliminando registros anteriores...");
    await Task.deleteMany({});
    await User.deleteMany({});

    console.log("👤 Creando usuario...");
    const createdUsers = await User.insertMany(users);

    const userId = createdUsers[0]._id;
    console.log("✔ Usuario creado con ID:", userId);

    const tasksWithUser = tasks.map((task) => ({
      ...task,
      userId,
    }));

    console.log("📥 Insertando tareas con userId...");
    await Task.insertMany(tasksWithUser);

    console.log("✅ Seed ejecutado correctamente.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en el seed:", error);
    process.exit(1);
  }
};

seed();
