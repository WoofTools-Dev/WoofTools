# WoofTools

![WoofTools](FrontEnd/src/assets/WoofTools-LogoText.png)


> An analytics platform and tools for token pairs on blockchains such as Shibarium and Ethereum.

## Description

WoofTools is a web application that brings together, in one place, tools for traders and anyone with an interest in the ecosystem:
:

- **Woofboard**: panel de análisis con la tabla de tokens, ganadores/perdedores del día, pares actualizados y hot pairs, con gráficos de velas (candlestick) y filtros/sorting por datos.
- **Swap**: swap de tokens (KyberSwap / ShibaSwap) con selección previa de token y aviso de disponibilidad.
- **MultiChart**: compara hasta 2 pares seleccionados en tarjetas con gráficos del mismo tipo que el resto de la app.
- **Pair Explorer**: explorador de pares listados con navegación al explorador de la cadena.
- **Seguridad**: análisis del contrato del token (GoPlus Security).

## Estructura

```
├── Backend/   → API REST (Node.js + Express + Prisma + PostgreSQL)
├── FrontEnd/  → Aplicación web (Angular 16 + Angular Material)
├── pgadmin/   → Configuración de PgAdmin
└── docker-compose.yml
```

## Tecnologías

- **Frontend**: Angular 16, Angular Material, Chart.js (chartjs-chart-financial), KyberSwap Widgets.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
- **Base de datos**: PostgreSQL (dockerizado).
- **Seguridad**: GoPlus Security API.

## Puesta en marcha

### 1. Base de datos

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

## Licencia

Distribuido bajo la [Licencia MIT](LICENSE).
