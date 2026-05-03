# 🚀 MeterFlow - API Monetization & Management Platform

MeterFlow is a robust, full-stack API monetization and management platform designed for developers and organizations to manage, monitor, and monetize their APIs with ease. It provides a comprehensive dashboard for tracking usage, managing API keys, and handling billing, all while ensuring high performance through a Redis-backed usage queue.

---

## 📖 Table of Contents

- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Key Management](#-api-key-management)
- [Analytics & Monitoring](#-analytics--monitoring)
- [Billing & Monetization](#-billing--monetization)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Core Features

### 🔑 API Key Management

- **Custom Naming**: Users can assign human-readable names to their API keys.
- **Full CRUD Operations**: Generate, rename, rotate, revoke, and permanently delete keys.
- **Secure Storage**: Keys are hashed and securely stored, with only necessary metadata exposed.

### 📊 Comprehensive Analytics

- **Real-time Monitoring**: Track API traffic, latency, and error rates.
- **Visual Data**: Interactive charts showing usage trends over the last 30 days.
- **Detailed Logs**: Access logs for every request, including status codes, methods, and timestamps.

### 💰 Monetization & Billing

- **Subscription Plans**: Manage different tiers of API access.
- **Usage Tracking**: Automatically monitor consumption to enforce limits and handle billing.
- **Dashboard Overview**: Clear summary of billing status and plan details.

### 🛡️ Security & Gateway

- **Middleware Protection**: Robust auth middleware for protecting sensitive routes.
- **API Gateway**: Centralized entry point for validating keys and tracking usage before reaching backend services.
- **Role-Based Access**: Support for 'Owner' and 'Admin' roles to manage resources.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend

- **Environment**: Node.js
- **Framework**: Express.js (v5)
- **Database**: MongoDB (Mongoose)
- **Cache & Queue**: Redis (BullMQ & ioredis)
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt.js

---

## 🏗️ Project Architecture

MeterFlow uses a decoupled architecture for maximum scalability:

1.  **Frontend**: A high-performance SPA built with Vite and React, focusing on a premium, responsive UI.
2.  **API Gateway**: A middleware layer that intercepts API calls, validates keys, and queues usage data.
3.  **Usage Engine**: A Redis-backed BullMQ system that processes API usage asynchronously to prevent bottlenecks.
4.  **Backend Services**: RESTful controllers handling business logic, authentication, and database interactions.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Redis Server (Running locally or via cloud)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd MeterFlow
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend` folder:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/meterflow
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   JWT_SECRET=your_super_secret_key
   ```

   Start the backend:

   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
MeterFlow/
├── backend/
│   ├── config/             # Database and Redis configurations
│   ├── controllers/        # Request handlers (Keys, APIs, Analytics, Billing)
│   ├── middleware/         # Auth and Gateway interceptors
│   ├── models/             # Mongoose schemas (User, Api, ApiKey, Usage)
│   ├── routes/             # Express API routes
│   ├── queues/             # BullMQ workers for usage processing
│   └── index.js            # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components & Layouts
│   │   ├── pages/          # Dashboard, APIs, Keys, Analytics, etc.
│   │   ├── services/       # Axios API client
│   │   ├── store/          # Zustand state management
│   │   └── App.jsx         # Routing configuration
│   └── tailwind.config.js  # Styling configuration
└── README.md
```

---

## 📈 Analytics & Monitoring

The Analytics Engine provides a deep dive into your API performance:

- **Total Traffic**: Cumulative request count.
- **Average Latency**: Real-time measurement of response times.
- **Error Rate**: Percentage of non-2xx responses.
- **Usage Graphs**: Beautifully rendered charts using Recharts for daily trends.

---

## 📄 API Key Management Details

| Feature        | Description                                                  |
| :------------- | :----------------------------------------------------------- |
| **Generation** | Create new keys with custom names via a modal interface.     |
| **Rotation**   | Invalidate an old key and generate a new one instantly.      |
| **Revocation** | Temporarily disable a key without deleting it.               |
| **Rename**     | Update the label of an existing key for better organization. |
| **Delete**     | Permanently remove a key from the database.                  |

---

## 🎨 Design Philosophy

MeterFlow is built with a **Premium UI/UX** approach:

- **Modern Aesthetics**: Glassmorphism, subtle shadows, and a clean typography system.
- **Responsive Layout**: Sidebar-driven navigation that adapts to all screen sizes.
- **Interactive Feedback**: Loading states, success/error modals, and smooth transitions.

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the ISC License. See `LICENSE` for more information.

---

**🚀 Happy Coding with MeterFlow!**
