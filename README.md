# 🛍️ Online Bidding System

A full-stack online bidding platform where users can register, list items for auction, place bids, and manage their auctions seamlessly.

> 🚀 Live site: [onlinebiddingsystem.netlify.app](https://onlinebiddingsystem.netlify.app/)

---

## ✨ Features

- 🔐 **User Authentication**
  - Register/Login with hashed passwords
  - JWT-based secure sessions
- 🧑‍💼 **Role-based Access**
  - Seller: List items for auction
  - Bidder: Browse and place bids
- 🛒 **Item Management**
  - Add new items for bidding
  - View items by categories/status
- 💰 **Real-time Bidding**
  - Place and track live bids on available items
- 📊 **Bid History**
  - View bid history per item
- 🧾 **RESTful API**
  - Clean and well-structured endpoints
- 🐳 **Containerized Deployment**
  - Docker + Render for backend
  - Netlify for frontend
- 🗃️ **PostgreSQL Database**
  - Hosted on Neon.tech

---

## 🧱 Tech Stack

### Frontend
- [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for fast build
- Axios for API integration
- Hosted on [Netlify](https://www.netlify.com/)

### Backend
- [Spring Boot](https://spring.io/projects/spring-boot) with Java 21
- [Spring Security](https://spring.io/projects/spring-security) for auth
- RESTful APIs
- Dockerized and deployed via [Render](https://render.com/)

### Database
- [PostgreSQL](https://www.postgresql.org/) hosted on [Neon.tech](https://neon.tech)

---

## 🚀 Running Locally

### 1. Clone the Repo

```bash
git clone https://github.com/Muskan244/onlineBiddingSystem.git
cd onlineBiddingSystem
````

---

### 2. Backend (Spring Boot)

Make sure Java 21 and Gradle are installed.

```bash
cd backend

./gradlew bootRun         
```

---

### 3. Frontend (React + Vite)

```bash
cd frontend

npm install
npm run dev
```

---

## 🌐 Deployment Details

| Service      | Description         | URL/Note                                                   |
| ------------ | ------------------- | ---------------------------------------------------------- |
| **Frontend** | Netlify             | [View Site](https://onlinebiddingsystem.netlify.app) |
| **Backend**  | Render + Docker     | [Render Dashboard](https://onlinebiddingsystem.onrender.com)                     |
| **Database** | PostgreSQL via Neon | [Neon](https://neon.tech)                                  |

---

## 👩‍💻 Author

* [Muskan Raghav](https://github.com/Muskan244)
