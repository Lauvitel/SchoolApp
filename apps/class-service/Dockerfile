FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY tsconfig.json nest-cli.json ./
COPY apps/class-service ./apps/class-service

RUN npx prisma generate --config=apps/class-service/prisma/prisma.config.ts
RUN npx nest build class-service

FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/generated/class-service-client ./generated/class-service-client
COPY --from=base /app/apps/class-service/prisma ./apps/class-service/prisma
COPY --from=base /app/tsconfig.json ./tsconfig.json
COPY --from=base /app/package.json ./package.json

EXPOSE 3002

CMD sh -c "npx prisma migrate deploy --config=apps/class-service/prisma/prisma.config.ts && node dist/apps/class-service/main.js"