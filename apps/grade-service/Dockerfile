FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json nest-cli.json ./
COPY apps/grade-service ./apps/grade-service
COPY generated/grade-service-client ./generated/grade-service-client

RUN npx nest build grade-service

FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/generated/grade-service-client ./generated/grade-service-client

EXPOSE 3003

CMD ["node", "dist/apps/grade-service/main.js"]