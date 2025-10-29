FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent || npm install --silent

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0

COPY --from=builder /app ./

EXPOSE 80
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "80", "-H", "0.0.0.0"]