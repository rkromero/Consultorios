FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/db/package*.json ./packages/db/

RUN npm install

COPY . .

RUN npx prisma generate --schema=./packages/db/prisma/schema.prisma

RUN npm run build -w apps/web
RUN npm run build -w apps/api

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/apps/web/package*.json ./apps/web/
COPY --from=builder /app/packages/db ./packages/db

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma

# Serve Web from API
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start", "-w", "apps/api"]
