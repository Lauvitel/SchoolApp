FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY tsconfig.json nest-cli.json ./
COPY apps/user-service ./apps/user-service

RUN npx prisma generate --config=apps/user-service/prisma/prisma.config.ts
RUN npx nest build user-service

FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/generated/user-service-client ./generated/user-service-client
COPY --from=base /app/apps/user-service/prisma ./apps/user-service/prisma
COPY --from=base /app/tsconfig.json ./tsconfig.json
COPY --from=base /app/package.json ./package.json

EXPOSE 3001

CMD sh -c "npx prisma migrate deploy --config=apps/user-service/prisma/prisma.config.ts && node dist/apps/user-service/main.js"