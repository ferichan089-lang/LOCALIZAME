# 🔴 LOCALIZAME

**Red comunitaria de búsqueda de personas desaparecidas en tiempo real**

> MONAD Blitz CDMX Hackathon · Next.js 15 · Neon PostgreSQL · Leaflet

---

## Demo-able Action

> **Crear alerta → aparece en el mapa en vivo → comunidad aporta información → puntos y recompensas**

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15.9 (App Router + Server Components) |
| Database | Neon PostgreSQL + Prisma ORM |
| Maps | Leaflet + react-leaflet (dark tiles) |
| Styling | Tailwind CSS |
| Geolocation | Web Geolocation API (watchPosition) |
| v2 Blockchain | MONAD smart contract (architecture ready) |

---

## Features (MVP)

- 🗺 **Mapa en tiempo real** con marcadores pulsantes de alertas activas
- 🚨 **Crear alerta** en 3 pasos (persona → descripción física → contacto)
- 📍 **Proximidad inteligente**: detecta si estás a ≤2km del último avistamiento
- 🏆 **Sistema de puntos**: 100pts (2km) / 50pts (general) / 25pts (donación)
- 💰 **Fondo de búsqueda**: donaciones por alerta
- 🔒 **Privacidad**: perfil físico de usuarios registrados = privado hasta alerta

---

## Deploy en Vercel

### 1. Configura Neon PostgreSQL

1. Crea cuenta en [neon.tech](https://neon.tech)
2. Crea un proyecto → copia el `DATABASE_URL`

### 2. Deploy en Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ferichan089-lang/LOCALIZAME)

O via CLI:
```bash
npx vercel --prod
```

### 3. Variables de entorno en Vercel

```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
```

### 4. Inicializa la base de datos

```bash
npx prisma db push
```

---

## Dev local

```bash
# 1. Clona el repo
git clone https://github.com/ferichan089-lang/LOCALIZAME
cd LOCALIZAME

# 2. Instala dependencias
npm install

# 3. Configura .env
cp .env.example .env
# Edita DATABASE_URL con tu Neon connection string

# 4. Inicializa DB
npx prisma db push

# 5. Levanta el servidor
npm run dev
```

---

## Arquitectura v2 — MONAD Blockchain

El contrato `AlertaMX.sol` está listo en `/contracts/`. Para la siguiente iteración:

```
Alert creada → registerAlert(bytes32) → MONAD
Donación     → donate(alertId) payable → pool on-chain
Puntos       → submitTip(alertId, withinRadius) → points on-chain
Recompensa   → redeemPoints() → transfiere MON al usuario
```

**Campos preparados en DB:**
- `Alert.txHash` — tx de creación on-chain
- `Donation.txHash` + `Donation.walletAddress`
- `UserProfile.walletAddress` + `points` + `totalEarned`

---

## API

```
GET  /api/alerts              # Lista alertas activas
POST /api/alerts              # Crear alerta
GET  /api/alerts/:id          # Detalle de alerta
PATCH /api/alerts/:id         # Actualizar status
POST /api/alerts/:id/tips     # Enviar información
POST /api/alerts/:id/donate   # Donar al fondo
```
