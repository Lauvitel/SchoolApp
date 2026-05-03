# SchoolInc — Application de gestion scolaire

Application full-stack de gestion scolaire construite avec **NestJS** (backend GraphQL, architecture microservices), **Angular 19** (frontend) et **PostgreSQL** (via Prisma).

---

##  Architecture

```
┌─────────────┐      ┌──────────────────────────────────────────────┐
│  Frontend   │      │              API Gateway (:3000)             │
│  Angular 19 │─────▶│  Apollo Gateway — fédère les sous-graphes    │
│   (:4200)   │      └────────┬──────────────┬──────────────┬───────┘
└─────────────┘               │              │              │
                              ▼              ▼              ▼
                     ┌──────────────┐ ┌─────────────┐ ┌─────────────┐
                     │ User Service │ │Class Service│ │Grade Service│
                     │   (:3001)    │ │  (:3002)    │ │  (:3003)    │
                     │  GraphQL     │ │  GraphQL    │ │  GraphQL    │
                     └──────┬───────┘ └──────┬──────┘ └──────┬──────┘
                            │                │               │
                            ▼                ▼               ▼
                     ┌──────────────┐ ┌─────────────┐ ┌─────────────┐
                     │  PostgreSQL  │ │  PostgreSQL  │ │  PostgreSQL  │
                     │  (:5433)     │ │  (:5434)     │ │  (:5435)     │
                     └──────────────┘ └─────────────┘ └─────────────┘
```

Chaque microservice possède **sa propre base de données** et expose un **sous-graphe GraphQL** fédéré par l'API Gateway via Apollo Federation.

---

## Démarrage

### Prérequis

- **Node.js** ≥ 20
- **npm** ≥ 10
- **Docker** & **Docker Compose**

### 1. Configurer l'environnement

Copier les `.env.example` en `.env` :

```bash
cp apps/user-service/.env.example  apps/user-service/.env
cp apps/class-service/.env.example apps/class-service/.env
cp apps/grade-service/.env.example apps/grade-service/.env
```

### 2. Démarrage complet avec Docker Compose

```bash
docker compose up --build
```

L'application sera disponible sur :
- **Frontend** : http://localhost:4200
- **Gateway GraphQL** : http://localhost:3000/graphql