import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Recordatorio App API",
      version: "1.0.0",
      description:
        "API REST para gestión de tareas y recordatorios con notificaciones push y WhatsApp.",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: ["./src/controllers/*.ts"], 
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };