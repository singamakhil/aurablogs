# 🚀 Deployment Guide: Live Hosting

This guide provides instructions for hosting your AuraBlogs application for free using Turso, Render, and Vercel.

## 1. Database: Turso (LibSQL)
1. Sign up at [turso.tech](https://turso.tech).
2. Create a new database named `aurablogs`.
3. Copy your **Database URL** and **Auth Token**.

## 2. Backend: Render
1. Sign up at [render.com](https://render.com).
2. Create a new **Web Service**.
3. Connect your GitHub repo: `singamakhil/aurablogs`.
4. **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   - `TURSO_DB_URL`: (Your URL)
   - `TURSO_DB_AUTH_TOKEN`: (Your Token)
   - `FRONTEND_URL`: (Your Vercel URL - update this later)
   - `NODE_ENV`: `production`

## 3. Frontend: Vercel
1. Sign up at [vercel.com](https://vercel.com).
2. Import your GitHub repo.
3. **Settings**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
4. **Environment Variables**:
   - `VITE_API_URL`: (Your Render Backend URL)
5. **Final Touch**: After deployment, copy your Vercel URL and update the `FRONTEND_URL` in your Render settings.

---
*Your application is now live!*
