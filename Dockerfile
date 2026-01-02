# Imagen base
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiamos package.json y lock primero (mejora cache)
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Compilamos TypeScript
RUN npm run build

# Puerto que expone Express
EXPOSE 4000

# Comando de inicio
CMD ["npm", "run", "start"]
