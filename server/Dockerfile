FROM node:18-bullseye-slim
WORKDIR /app

# Avoid Puppeteer downloading Chromium; we'll install system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install Chromium and required libs for Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
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

# Install Chromium from Debian repositories
RUN apt-get update && apt-get install -y --no-install-recommends chromium && rm -rf /var/lib/apt/lists/*

# Copy package.json to install server dependencies only
COPY package*.json ./
RUN npm ci --silent

# Copy server code
COPY server ./server

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 3000
CMD ["node", "server/index.js"]
