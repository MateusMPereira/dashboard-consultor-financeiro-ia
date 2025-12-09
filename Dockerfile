# Etapa 1 - Build do Frontend
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent || npm install --silent

COPY . .
RUN npm run build

# Etapa 2 - Imagem final com Node.js Server + Chromium
FROM node:20-bullseye-slim
WORKDIR /app

# Não deixar o Puppeteer baixar o Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Instalar Chromium e dependências
RUN apt-get update && apt-get install -y --no-install-recommends \
	chromium \
	ca-certificates \
	fonts-liberation \
	libasound2 \
	libatk-bridge2.0-0 \
	libatk1.0-0 \
	libcairo2 \
	libcups2 \
	libdbus-1-3 \
	libexpat1 \
	libfontconfig1 \
	libgbm1 \
	libgcc1 \
	libglib2.0-0 \
	libgtk-3-0 \
	libnspr4 \
	libnss3 \
	libpango-1.0-0 \
	libpangocairo-1.0-0 \
	libstdc++6 \
	libx11-6 \
	libx11-xcb1 \
	libxcb1 \
	libxcomposite1 \
	libxcursor1 \
	libxdamage1 \
	libxext6 \
	libxfixes3 \
	libxi6 \
	libxrandr2 \
	libxrender1 \
	libxss1 \
	libxtst6 \
	lsb-release \
	wget \
	xdg-utils \
	&& rm -rf /var/lib/apt/lists/*

# Copiar dependências do projeto
COPY package*.json ./
# Instalar somente dependências de produção
RUN npm ci --production --silent

# Copiar o código do servidor
COPY server ./server

# Configurar variáveis de ambiente do Supabase para o servidor
# ATENÇÃO: Em produção, configure SUPABASE_URL e SUPABASE_KEY diretamente no EasyPanel
RUN echo "SUPABASE_URL=$SUPABASE_URL" >> server/.env && \
    echo "SUPABASE_KEY=$SUPABASE_KEY" >> server/.env

# Copiar o build do frontend da etapa de build
COPY --from=builder /app/dist ./dist

# Expor a porta que o servidor Node.js vai usar
EXPOSE 3000

# Definir o caminho do executável do Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Comando para iniciar o servidor
CMD ["node", "server/index.js"]
