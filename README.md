# WoofTools

![WoofTools](FrontEnd/src/assets/WoofTools-LogoText.png)


> An analytics platform and tools for token pairs on blockchains such as Shibarium and Ethereum.

## Description

WoofTools is a web application that brings together, in one place, tools for traders and anyone with an interest in the ecosystem:
:

- **Woofboard**: analytics dashboard featuring the token table, the day’s winners and losers, updated pairs and hot pairs, with candlestick charts and filters/sorting options based on data.
- **Swap**: token swaps (KyberSwap / ShibaSwap) with pre-selection of tokens and availability notificationsff.
- **MultiChart**: Compare up to two selected pairs on cards with graphics in the same style as the rest of the app.
- **Pair Explorer**: Listed pair explorer with navigation to the string explorer.
- **Seguridad**: analysis of the token contract (GoPlus Security).


## Structure

```
├── Backend/   → API REST (Node.js + Express + Prisma + PostgreSQL)
├── FrontEnd/  → Aplication web (Angular 16 + Angular Material)
├── pgadmin/   → Configuration de PgAdmin
└── docker-compose.yml
```

## Tecnology

- **Frontend**: Angular 16, Angular Material, Chart.js (chartjs-chart-financial), KyberSwap Widgets.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
- **Database**: PostgreSQL (dockerized).
- **Security**: GoPlus Security API.

## Commissioning 

### 1. DataBasee

```bash
docker-compose up -d
```

Levanta PostgreSQL en `localhost:5432` y PgAdmin en `http://localhost:5050`.

### 2. Backend

```bash
cd Backend
cp .env.example .env   # ajusta variables si es necesario
npm install
npx prisma generate
npx ts-node prisma/seed.ts
npm run start          # API en http://localhost:8000
```

### 3. Frontend

```bash
cd FrontEnd
npm install
ng serve              # app en http://localhost:4200
```

## Licence

Distribuited down the [Licence MIT](LICENSE).
