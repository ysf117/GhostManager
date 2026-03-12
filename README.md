# Ghost Manager 👻

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind 4](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma 7](https://img.shields.io/badge/Prisma-7-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)

**Ghost Manager** is a modern, high-performance subscription management SaaS designed to help users track recurring expenses, manage budgets, and avoid "ghost" subscriptions. Built with the latest web technologies, it features a responsive, accessible dashboard and robust backend integration.

![Dashboard Preview](./public/dashboard-preview.png)


## ✨ Features

- **💳 Subscription Tracking**: Centralized view of all active and paused subscriptions.
- **🌍 Multi-Currency Support**: seamless conversion between USD, EUR, and GBP.
- **🔔 Smart Alerts**: Automated reminders for upcoming renewals and trial expirations.
- **📊 Analytics & Insights**: Visual breakdown of spending by category and billing cycle.
- **💰 Budget Management**: Set monthly limits and track adherence in real-time.
- **🔒 Secure Authentication**: Robust user management via Supabase Auth.

## 🛠️ Tech Stack & Architecture

This project is architected with scalability and maintainability in mind, following **Atomic Design** principles.

### Frontend
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) - Utilizing Server Components for performance.
- **Language**: TypeScript - Strict type safety throughout.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first styling with modern CSS features.
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) (Radix Primitives) - Accessible, unstyled component blocks.
- **State Management**: React Context (e.g., `CurrencyContext`) for global preferences.
- **Forms**: React Hook Form + Zod - Type-safe validation.

### Backend & Database
- **BaaS**: [Supabase](https://supabase.com/) - PostgreSQL database and Authentication.
- **ORM**: [Prisma 7](https://www.prisma.io/) - Type-safe database access with Server Actions.
- **Pooling**: `@prisma/adapter-pg` - Efficient connection pooling for serverless environments.

### Code Quality
- **Design Pattern**: Atomic Design (`atoms`, `molecules`, `organisms`, `templates`).
- **Testing**: Vitest & React Testing Library.
- **Linting**: ESLint + Prettier.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed.
- A [Supabase](https://supabase.com/) project set up (for Auth and Postgres).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/ghost-manager.git
    cd ghost-manager
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    # Database (Supabase Transactions)
    DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
    
    # Direct Connection (for Migrations)
    DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].supabase.com:5432/postgres"

    # Supabase Auth
    NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
    ```

4.  **Run Database Migrations:**
    ```bash
    npx prisma migrate dev
    ```

5.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

```bash
src/
├── actions/        # Server Actions (Mutations)
├── app/            # Next.js App Router Pages
├── components/     # Atomic Design Components
│   ├── atoms/      # Buttons, Inputs, Labels
│   ├── molecules/  # SearchBars, Cards
│   ├── organisms/  # Charts, Tables, Forms
│   └── templates/  # Page Layouts
├── contexts/       # React Context Providers
├── lib/            # Utilities (Prisma, Supabase clients)
└── types/          # TypeScript Interfaces
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
