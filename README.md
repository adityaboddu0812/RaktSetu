# 🩸 RaktSetu – Blood Donor Finder Platform

RaktSetu is a full-stack MERN-based platform designed to bridge the gap between **blood donors** and **hospitals** in need. Built with modern technologies, it provides a secure, efficient, and real-time system for managing blood donation requests, emergency alerts, and donor coordination.

---

## 🔗 Live Project  
👉 [https://raktsetu11.netlify.app](https://raktsetu11.netlify.app)

---

## 🛠️ Tech Stack

### Backend
- Node.js, Express.js
- MongoDB + Mongoose
- JWT Authentication, bcryptjs
- Security: Helmet, CORS, Rate Limiting

### Frontend
- React 18, TypeScript, Vite
- Tailwind CSS, shadcn-ui, MUI
- React Router, React Query
- Zod (Schema Validation)

---

## 📁 Project Structure

```bash
📁 RaktSetu/
├── backend/       # Express.js API, routes, controllers, MongoDB models
├── frontend/      # React app (Vite + TS + Tailwind + shadcn-ui)
├── .gitignore
├── README.md      # You're here



---

## 🌐 Deployment

- **Frontend:** Deployed on Netlify  
  - Set `VITE_API_URL` in `.env` to your backend URL

- **Backend:** Deployed on Render / Railway / Heroku  
  - Set environment variables:
    - `MONGODB_URI`
    - `JWT_SECRET`
    - `PORT`

---

## 🔐 User Roles & Key Features

### 🏥 Hospitals
- Register & login
- Request blood by type & urgency
- View matching nearby donors
- Emergency request support

### 💉 Donors
- Register & set availability
- Receive donation requests
- Accept/decline and track history

### 🛡️ Admin
- Approve hospitals
- View & manage all users
- Monitor platform activity

---

## 📚 API Overview

- `/api/auth/*` – Role-based login & register
- `/api/donors/*` – Donor operations & availability
- `/api/hospitals/*` – Hospital requests & dashboard
- `/api/admin/*` – Admin user & request management

> All APIs are protected using JWT & role-based middleware.

---

## 📈 Future Plans

- SMS/Email alerts (via Twilio or NodeMailer)
- Google Maps for donor-hospital matching
- Admin analytics dashboard
- Donor badge/reward system
- Multi-language support

---

## ✨ Developed with ❤️ by [Aditya Boddu](https://github.com/adityaboddu)
