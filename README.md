# 🥈 Silvx-v0.1

A full-stack digital silver trading platform built with:

- ⚙️ Express (API Layer)
- 🧮 Prisma + PostgreSQL (Database)
- 🧾 Double-Entry Ledger Engine
- 💰 Spread + Fee Revenue Model
- 🛡 Reserve Guard & Risk Controls
- ⚡ Next.js (Frontend)

This project simulates how a custodial commodity exchange works internally — including solvency enforcement and revenue segregation.

---

# 🏗 Monorepo Structure

```
digital-silver/
│
├── apps/
│   ├── api/        → Express backend
│   └── web/        → Next.js frontend
│
├── packages/
│   ├── db/         → Prisma schema + client
│   ├── ledger/     → Double-entry accounting
│   ├── silver/     → Trading engine
│   ├── pricing/    → Spread price engine
│   ├── limits/     → Risk validation
│   └── utils/      → Decimal helpers
│
├── package.json
└── turbo.json
```

---

# 🚀 Features

## Trading Engine
- Buy / Sell digital silver
- Spread pricing (Buy ≠ Sell)
- 0.5% platform fee
- Revenue account segregation
- Atomic DB transactions

## Risk Controls
- Minimum & Maximum trade limits
- User balance validation
- Reserve guard (prevents insolvency)
- Solvency monitoring endpoint
- Global error middleware

## Admin Monitoring
- Total user silver liability
- System reserve balance
- Reserve ratio
- Revenue tracking

---

# 🛠 Setup & Installation

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/digital-silver.git
cd digital-silver
```

---

## 2️⃣ Install Dependencies (Root)

```bash
npm install
```

This installs all workspace packages.

---

## 3️⃣ Setup PostgreSQL

You can use Docker:

```bash
docker run --name prismadb \
  -e POSTGRES_PASSWORD=devex \
  -d -p 5432:5432 postgres
```

---

## 4️⃣ Create Dummy `.env` Files

### 📦 `packages/db/.env`

```env
DATABASE_URL="postgresql://postgres:devex@localhost:5432/postgres"
```

---

### 🌐 `apps/api/.env`

```env
PORT=4000
```

---

### 🖥 `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 5️⃣ Run Prisma Migration

```bash
cd packages/db
npx prisma migrate dev
npx prisma generate
```

---

## 6️⃣ Seed System Accounts & Reserve

Create system accounts and initial reserve:

```bash
npx ts-node -P tsconfig.json seed-system.ts
```

This creates:

- SYSTEM_INR
- SYSTEM_SILVER
- SYSTEM_REVENUE_INR
- Initial 1000g reserve

---

# ▶ Running the Application

---

## 🔹 Start Backend (API)

```bash
cd apps/api
npx ts-node src/server.ts
```

Server runs at:

```
http://localhost:4000
```

Health check:

```
GET /health
```

---

## 🔹 Start Frontend (Web)

In another terminal:

```bash
cd apps/web
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# 📡 API Endpoints

## 👤 Users

```
POST /users
```

---

## 💳 Deposits

```
POST /deposits
```

---

## 🥈 Silver Trading

```
POST /silver/buy
POST /silver/sell
```

---

## 💰 Balances

```
GET /balances/:userId
```

---

## 📜 Transactions

```
GET /transactions/:userId
```

---

## 🛡 Admin Reserve Status

```
GET /admin/reserve-status
```

Example response:

```json
{
  "totalUserSilver": "29",
  "systemSilver": "971",
  "reserveRatio": "33.48",
  "revenueINR": "12.50"
}
```

---

# 💰 Economic Model

## Spread
Buy price > Sell price  
Platform earns from bid/ask difference.

## Trading Fee
0.5% per trade  
Credited to `SYSTEM_REVENUE_INR`.

## Reserve Guard
Trading is blocked if system silver reserve is insufficient.

---

# 🧮 Accounting Model

All movements follow double-entry bookkeeping.

### BUY Flow

1. USER_INR → SYSTEM_INR (net amount)
2. USER_INR → SYSTEM_REVENUE_INR (fee)
3. SYSTEM_SILVER → USER_SILVER

---

### SELL Flow

1. USER_SILVER → SYSTEM_SILVER
2. SYSTEM_INR → USER_INR (net)
3. SYSTEM_INR → SYSTEM_REVENUE_INR (fee)

---

# 🧠 Risk Layers

1. Trade amount validation
2. User balance validation
3. Reserve guard
4. Atomic DB transactions
5. Global error middleware
6. Async route wrapper

---

# 🧪 Manual Testing Checklist

1. Create User
2. Deposit INR
3. Buy Silver
4. Sell Silver
5. Open Prisma Studio:

```bash
cd packages/db
npx prisma studio
```

Verify:
- Ledger entries are balanced
- Revenue increases
- Reserve ratio updates
- No negative balances

---

# 🔮 Future Enhancements

- Dynamic price simulation
- JWT authentication
- Rate limiting
- Real-time price updates
- PDF statements
- Circuit breaker (halt trading if reserve < 1)
- Admin dashboard

---

# 📜 License

MIT License

---

# 👨‍💻 Author

Built by Devexhhh
