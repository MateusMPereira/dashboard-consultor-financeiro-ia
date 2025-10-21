# -------- Stage 1: Build --------
FROM node:18-alpine AS builder
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm ci --silent || npm install --silent

# Copia todo o código e faz o build
COPY . .
RUN npm run build

# -------- Stage 2: Run --------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0

# Copia tudo o que o Next precisa pra rodar
COPY --from=builder /app ./

EXPOSE 80
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "80", "-H", "0.0.0.0"]
