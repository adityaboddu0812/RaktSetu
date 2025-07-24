# RaktSetu - Blood Donor Finder Platform

A mern-stack web application to connect blood donors with hospitals in need. Built with Node.js, Express, MongoDB, React, TypeScript, Vite, shadcn-ui, and Tailwind CSS.

---
## Project Link : https://raktsetu11.netlify.app/

## 🛠️ Tech Stack
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT
- **Frontend:** React, TypeScript, Vite, shadcn-ui, Tailwind CSS

---

## 🚀 Project Structure
```
├── backend/    # Express API, MongoDB models, routes
├── frontend/   # React app (Vite + TypeScript)
├── README.md   # (You are here)
```

---

## ⚡ Quick Start

### 1. Clone the repository
```sh
git clone https://github.com/dussaanushka1605/minifinaldone.git
cd minifinaldone
```

### 2. Backend Setup
```sh
cd backend
npm install
```
- Create a `.env` file in `backend/`:
  ```env
  PORT=5001
  MONGODB_URI=your-mongodb-uri
  JWT_SECRET=your-secret-key
  ```
- Start MongoDB (locally or use MongoDB Atlas)
- Start the backend server:
  ```sh
  npm run dev   # for development
  npm start     # for production
  ```

### 3. Frontend Setup
```sh
cd ../frontend
npm install
```
- Create a `.env` file in `frontend/` (if you use environment variables, e.g. for API URL):
  ```env
  VITE_API_URL=http://localhost:5001
  ```
- Start the frontend dev server:
  ```sh
  npm run dev
  ```

---

## 🌐 Deployment
- **Backend:** Deploy to Render, Railway, Heroku, etc. Set environment variables in the dashboard.
- **Frontend:** Deploy to Vercel, Netlify, etc. Set `VITE_API_URL` to your backend’s deployed URL.

---

## 🔑 Default Admin Credentials
- Email: `raktsetuadmin@gmail.com`
- Password: `Raktsetu@123`

---

## 📚 API Overview
- Donor, Hospital, and Admin authentication (JWT)
- Donor registration, profile, and dashboard
- Hospital registration, verification, and dashboard
- Admin management of hospitals and donors

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
This project is for educational/demo purposes. 
