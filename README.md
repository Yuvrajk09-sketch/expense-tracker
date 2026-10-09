# Expenso: Premium SaaS Expense Tracker

![Expenso Banner](https://via.placeholder.com/1200x400.png?text=Expenso:+Premium+Financial+SaaS)

Expenso is a modern, high-performance, full-stack expense tracking application designed with a premium SaaS aesthetic. Built for speed and scale, Expenso allows users to track their daily finances, upgrade to premium features, and compete on financial leaderboards.

## 🚀 Key Features

- **Modern SaaS Dashboard**: A beautiful, responsive interface built with Tailwind CSS v4 and Lucide-React icons.
- **Robust Authentication**: Secure user login, signup, and JWT-based session management, featuring instant post-signup auto-login.
- **Premium Tier System**: Users can upgrade to a Premium account unlocking exclusive analytics and a real-time leaderboard.
- **Dynamic Ledger**: Seamlessly record, edit, and categorize both Income and Expenses via a streamlined layout.
- **Mobile First, Desktop Perfect**: Features a resilient off-canvas sidebar that stays out of your way until you need it.

## 💻 Tech Stack

### Frontend (Client)
- **Framework**: React.js 18
- **Build Tool**: Vite (Lightning fast HMR & optimized builds)
- **Styling**: Tailwind CSS v4 (Zero-runtime utility classes)
- **Routing**: React Router DOM (with Lazy-loaded Code Splitting)
- **State Management**: React Context API (`AuthContext`)
- **HTTP Client**: Axios

### Backend (Server)
- **Runtime**: Node.js & Express.js
- **Database**: MySQL / PostgreSQL (Sequelize ORM)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **Architecture**: MVC (Controllers, Routes, Services)

## ⚡ Performance Optimizations

Expenso was architected with web vitals and perceived performance in mind:

1. **Purged Legacy CSS**: Completely migrated away from Bootstrap to pure Tailwind CSS, reducing the CSS payload by over 100KB and eliminating layout reflow conflicts.
2. **React Lazy Loading**: Implemented component-level Code Splitting (`React.lazy` & `Suspense`). Users only download the exact Javascript required for the page they are currently viewing.
3. **Vendor Chunking**: Configured Rollup (`vite.config.js`) to split heavy dependencies (`react`, `axios`, `lucide-react`) into highly cacheable vendor chunks, guaranteeing near-instant subsequent page loads.
4. **Form Hardening**: Added strict JS-level keystroke interception on financial inputs to prevent invalid scientific notation (`e`, `+`) from polluting state.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL or PostgreSQL database running locally

### Installation

1. Clone the repository
2. Install Backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install Frontend dependencies:
   ```bash
   cd frontend-react
   npm install
   ```

### Running Locally

1. Start the backend server (ensure your `.env` is configured with DB credentials and JWT secret):
   ```bash
   npm run start
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```

Open your browser to `http://localhost:5173` and start tracking!
