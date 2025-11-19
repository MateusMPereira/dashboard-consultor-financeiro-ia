# Etapa 1 - Build
# Etapa 1 - Build
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent || npm install --silent

COPY . .
RUN npm run build

# Etapa 2 - imagem final única (nginx + node server + chromium)
FROM node:18-bullseye-slim
WORKDIR /app

# Do not let Puppeteer download Chromium (we'll use system package)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install nginx, chromium and required libs
RUN apt-get update && apt-get install -y --no-install-recommends \
	nginx \
	chromium \
	ca-certificates \
	fonts-liberation \
	wget \
	gnupg \
	libx11-6 \
	libx11-xcb1 \
	libxcomposite1 \
	libxrandr2 \
	libxss1 \
	libasound2 \
	libatk1.0-0 \
	libatk-bridge2.0-0 \
	libcups2 \
	libgtk-3-0 \
	libnspr4 \
	libnss3 \
	lsb-release \
	&& rm -rf /var/lib/apt/lists/*

# Copy frontend build into nginx web root
COPY --from=builder /app/dist /var/www/html

# Copy package.json and install server dependencies
COPY package*.json ./
RUN npm ci --production --silent

# Copy server code
COPY server ./server

# Copy start script and make executable
COPY server/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose both ports
EXPOSE 80 3000

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

CMD ["/app/start.sh"]