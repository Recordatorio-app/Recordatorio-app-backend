# Recordatorio App – Backend

API REST para la gestión de tareas y recordatorios con notificaciones automáticas por WhatsApp y Push Notifications.

---

## 📌 Descripción

**Recordatorio App** es una plataforma que permite a los usuarios gestionar actividades y recibir recordatorios automáticos antes de su vencimiento.

El sistema envía alertas **3 días antes** mediante **WhatsApp (Meta Developers API)** y notificaciones **Push** usando **Firebase Cloud Messaging**.

El backend está desarrollado con **Node.js y Express**, diseñado para ser escalable, seguro y fácilmente desplegable mediante **Docker**, utilizando **MongoDB** como base de datos.

---

## 🛠️ Stack Tecnológico

- **Node.js 20**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **WhatsApp Cloud API (Meta Developers)**
- **Firebase Cloud Messaging (Push Notifications)**
- **Swagger / OpenAPI 3.0**
- **Docker & Docker Compose**

---

## 🚀 Funcionalidades Principales

- Autenticación de usuarios con JWT
- Gestión completa de tareas (CRUD)
- Filtros por estado (Pendiente / Completada)
- Recordatorios automáticos 3 días antes del vencimiento
- Envío de notificaciones por WhatsApp usando plantillas aprobadas
- Notificaciones Push en tiempo real con Firebase
- Paleta de colores personalizada por usuario
- Documentación de la API con Swagger

---

## 📚 Documentación de la API

La documentación Swagger está disponible en:
http://localhost:4000/api/docs


---

## 🐳 Ejecución Local con Docker

Esta aplicación está completamente containerizada para facilitar su ejecución local.

### Requisitos

- **Docker Engine** 20.10 o superior
- **Docker Compose** 1.29 o superior

---

### 📥 Clonar el Repositorio

```bash
git clone https://github.com/Recordatorio-app/Recordatorio-app-backend.git
cd Recordatorio-app-backend
```

### Ejecutar la Aplicación

Antes de iniciar, asegúrate de que Docker esté en ejecución.

```bash
docker compose up --build -d
```

Este comando:

- Construye la aplicación Node.js (Express)

- Inicia MongoDB en un contenedor

- Conecta la API a la base de datos automáticamente

### Probar la API

- Usar Swagger UI

- Usar la colección de Postman incluida en el proyecto

### Detener la Aplicación

```bash
docker compose down
```

### Eliminar todos los recursos

```bash
docker compose down --volumes --rmi all
```
### Variables de Entorno

Crea un archivo **.env** en la raiz del proyecto

PORT=4000
MONGODB_URI=mongodb://mongo:27017/recordatorio

JWT_SECRET=your_jwt_secret

# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

### Frontend

El frontend está desarrollado con Next.js y se encuentra desplegado en Vercel.

URL: https://recordatorio-app.vercel.app/

Repositorio frontend: https://github.com/Recordatorio-app/Recordatorio-app-frontend
