# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++ sqlite-dev

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm install

COPY . .
ENV DATABASE_URL=file:./dev.db
RUN npx prisma generate
RUN npm run build

# Stage 2: Runner
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache sqlite-libs

ENV NODE_ENV=production

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

EXPOSE 3000

CMD ["sh", "-c", "DATABASE_URL=file:/app/prisma/data/dev.db npx prisma db push && npm start"]
