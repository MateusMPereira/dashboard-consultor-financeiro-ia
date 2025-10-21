# Stage 1: install deps and build
FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install
RUN npm run build

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent


# Copy source and build
COPY . .
RUN npm run build


# Stage 2: run production
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production


# Copy from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./


EXPOSE 3000
CMD ["npm", "run", "start"]
