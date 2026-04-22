FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json nest-cli.json ./
COPY apps/user-service ./apps/user-service
COPY generated/user-service-client ./generated/user-service-client

RUN npx nest build user-service

FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/generated/user-service-client ./generated/user-service-client

EXPOSE 3001

CMD ["node", "dist/apps/user-service/main.js"]