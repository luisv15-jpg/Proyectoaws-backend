FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Evita errores en entornos sin terminal (Docker)
ENV CI=true

# Copiar proyecto
COPY . .

# Instalar dependencias
RUN pnpm install

# Build
RUN pnpm run build

# Puerto de tu app
EXPOSE 3002

# IMPORTANTE: tu entrypoint real
CMD ["node", "dist/src/main.js"]
