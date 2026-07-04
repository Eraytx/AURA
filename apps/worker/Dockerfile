# Stage 1: deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json turbo.json ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/database/package.json ./packages/database/
RUN npm ci --only=production

# Stage 2: builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN npm run build --workspace=worker

# Stage 3: production
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/apps/worker/package.json ./
CMD ["node", "dist/index.js"]
