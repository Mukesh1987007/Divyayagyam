# Devyajnam Project

This is the primary repository for **Devyajnam**. The project is built using modern web technologies to support booking astrology/puja services, e-commerce, blogging, and an advanced admin dashboard.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication & Storage:** Supabase
- **Payments:** Razorpay
- **Styling:** Tailwind CSS + Radix UI

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- Yarn package manager (`npm install -g yarn`)
- A PostgreSQL database (e.g., Supabase, Neon)
- A Supabase project (for Storage and optional features)

### 2. Environment Setup
Copy the example environment file and fill in your credentials:
```bash
cp .env.example .env
```
Fill out the variables in `.env` (Database URL, Supabase keys, Admin credentials, Razorpay secrets, etc.).

### 3. Install Dependencies
```bash
yarn install
```

### 4. Database Setup
Push the Prisma schema to your database and generate the Prisma Client:
```bash
yarn db:generate
yarn db:push
```

### 5. Run Development Server
```bash
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts
- `yarn dev` - Starts the local development server.
- `yarn build` - Generates Prisma client and builds the application for production.
- `yarn start` - Starts the production server.
- `yarn db:studio` - Opens Prisma Studio to view and edit database records.
- `yarn build:strict` - Runs a strict build that checks TypeScript and ESLint errors.
