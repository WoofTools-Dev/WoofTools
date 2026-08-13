# Contrato del feeder — Wooftools

Contrato que debe cumplir cualquier proceso externo ("feeder") que escriba datos en la base
de datos de Wooftools. La base de datos es PostgreSQL y se accede mediante Prisma
(`Backend/prisma/schema.prisma`).

## 1. Reglas generales

1. **Nunca escribir en `EntityLike`.** La tabla de likes la gestiona exclusivamente la API
   (`POST /api/likes` y `GET /api/likes/status`). El feeder no debe crear, borrar ni
   actualizar filas de esa tabla.
2. **`score` (DashboardData) y `popularity` (HotPair) se escriben siempre en 0.** Son
   contadores de likes; la API de likes los incrementa dentro de una transacción. Si el
   feeder los sobreescribe, borra los votos de los usuarios.
3. **Escribir con `upsert`** usando las claves únicas de cada modelo (ver tabla abajo), para
   que las ejecuciones repetidas sean idempotentes.
4. **Respetar los campos de control** de la sección 3 en cada fila insertada o actualizada.
5. **Nunca borrar** filas de `DashboardData` ni de `HotPair`: un like referencia a su
   `id`. Borrar una entidad rompe los contadores. Para ocultar contenido se usa
   `isVisible = false`.

## 2. Claves únicas para upsert (por red)

| Modelo | Clave única |
| --- | --- |
| `DashboardData` | `chainId` + `pairAddress` |
| `LivePair` | `chainId` + `pairAddress` |
| `SwapTransaction` | `chainId` + `txHash` |
| `DailyWinner` | `chainId` + `date` + `username` |
| `DailyLoser` | `chainId` + `date` + `username` |
| `UpdatedRRSS` | `chainId` + `profileName` |
| `HotPair` | `chainId` + `pairName` |

## 3. Campos de control (presentes en todos los modelos)

| Campo | Tipo | Valor esperado |
| --- | --- | --- |
| `chain` | String | Nombre corto de red: `"ethereum"` o `"shibarium"` |
| `chainId` | Int | `1` (Ethereum) o `109` (Shibarium). Debe ser coherente con `chain`. |
| `source` | String | Identificador del origen, p.ej. `"graph-ethereum"`. Nunca dejar el default `"seed"`. |
| `lastSyncedAt` | DateTime? | Marca de la última sincronización del feeder. |
| `updatedAt` | DateTime | Lo gestiona Prisma (`@updatedAt`). No hay que asignarlo manualmente. |
| `isVisible` | Boolean | `true` para que la fila aparezca en las APIs de lectura. |
| `isPinned` | Boolean | `false` salvo criterio editorial explícito. |
| `displayOrder` | Int | Orden de visualización, `0` por defecto. |

## 4. Campos numéricos y compactos (solo `DashboardData`)

El frontend muestra cadenas compactas (`volume`, `swaps`, `liquidity`, `marketCap`),
pero ordena y filtra por los campos numéricos:

| Campo compacto | Campo numérico equivalente |
| --- | --- |
| `volume` | `volumeNumeric` (Decimal) |
| `swaps` | `swapsNumeric` (Int) |
| `liquidity` | `liquidityNumeric` (Decimal) |
| `marketCap` | `marketCapNumeric` (Decimal) |

- El feeder debe rellenar **ambos** (compacto y numérico) con el mismo valor.
- El compacto admite formato corto (`"45.2K"`, `"1.5M"`, `"3.2B"`) o número plano.
- `score` se ignora y se escribe `0` (ver sección 1).

## 5. Series de precios

- `previousPrices` (Float[]) y `previousTimes` (Float[]) deben ir **alineados** y con la
  misma longitud: `times[i]` es el timestamp Unix (segundos) de `prices[i]`.
- La primera vela del dashboard/hotpair se calcula desde el `price`/`tokenPriceUSD`
  actual, así que la serie debe incluir precios históricos previos al precio vigente.

## 6. Ejemplo (DashboardData)

```ts
const row = {
  token0Name: 'BONE',
  token1Name: 'WETH',
  pairAddress: '0x...',
  price: 0.4231,
  percentage24H: 12.5,
  score: 0,                    // siempre 0, lo gestiona la API de likes
  contracts: '0x...',
  created: new Date(),
  volume: '45.2K',
  volumeNumeric: 45200,
  swaps: '812',
  swapsNumeric: 812,
  liquidity: '1.2M',
  liquidityNumeric: 1200000,
  marketCap: '8.5M',
  marketCapNumeric: 8500000,
  dex: ['chewy'],
  chain: 'shibarium',
  chainId: 109,
  source: 'graph-chewy',
  lastSyncedAt: new Date(),
  isVisible: true,
  isPinned: false,
  displayOrder: 0,
};

await prisma.dashboardData.upsert({
  where: { chainId_pairAddress: { chainId: 109, pairAddress: row.pairAddress } },
  update: row,
  create: row,
});
```

## 7. APIs de lectura consumidas por el frontend

| Endpoint | Uso |
| --- | --- |
| `GET /api/dashboard/data?chain=&walletAddress=` | Tabla principal del woofboard. `walletAddress` opcional añade `likedByMe`, `myCount`, `remainingLikes`. |
| `GET /hotpair/hot-pairs?chain=&walletAddress=` | Hot pairs + mini gráficas. Ídem con `walletAddress`. |
| `GET /api/live-pairs?chain=` | Página live pairs. |
| `GET /api/swaps?chain=` | Big swap explorer. |
| `GET /dailyWinner/daily-winners?chain=` · `GET /dailyLoser/daily-losers?chain=` · `GET /updatedRRSS/updated-rrss?chain=` | Rankings del woofboard. |
| `POST /api/likes` · `GET /api/likes/status` | Sistema de likes (no los toca el feeder). |

Las APIs de lectura filtran por defecto `isVisible = true` y excluyen filas
`isVisible = false`.
