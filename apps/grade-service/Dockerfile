FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY tsconfig.json nest-cli.json ./
COPY apps/grade-service ./apps/grade-service

RUN npx prisma generate --config=apps/grade-service/prisma/prisma.config.ts
RUN npx nest build grade-service

FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/generated/grade-service-client ./generated/grade-service-client
COPY --from=base /app/apps/grade-service/prisma ./apps/grade-service/prisma
COPY --from=base /app/tsconfig.json ./tsconfig.json
COPY --from=base /app/package.json ./package.json

EXPOSE 3003

CMD sh -c "npx prisma migrate deploy --config=apps/grade-service/prisma/prisma.config.ts && node dist/apps/grade-service/main.js"