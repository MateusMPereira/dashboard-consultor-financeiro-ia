# Etapa 1 - Build do Frontend
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent || npm install --silent

COPY . .
RUN npm run build

# Etapa 2 - Imagem final
FROM node:20-alpine
WORKDIR /app

# Copiar o build do frontend da etapa de build
COPY --from=builder /app/dist ./dist

# Expor a porta que o servidor Node.js vai usar
EXPOSE 80

# Comando para iniciar o servidor de arquivos estáticos (servindo o frontend)
CMD ["npx", "serve", "dist"]
