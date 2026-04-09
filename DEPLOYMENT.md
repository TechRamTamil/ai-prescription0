# Deployment Guide for AI Prescription System

This guide will help you deploy your application to the cloud so it can be accessed in real-time by anyone with the link.

## 🚀 One-Click Deployment on Render (Backend + Database)

Render is excellent for hosting your FastAPI backend and PostgreSQL database.

1.  **Push your code to GitHub**: Ensure your latest changes are pushed to a GitHub repository.
2.  **Create a New Blueprint**:
    - Go to [Render Dashboard](https://dashboard.render.com/).
    - Click **"New +"** and select **"Blueprint"**.
    - Connect your GitHub repository.
    - Render will automatically detect the `render.yaml` file and set up:
        - A PostgreSQL database.
        - A FastAPI web service.
3.  **Configure Environment Variables**:
    - In the Render dashboard, go to your **ai-prescription-backend** service -> **Environment**.
    - Add/Update the following:
        - `GEMINI_API_KEY`: Your Google Gemini API Key.
        - `SMTP_USER`: Your Gmail address.
        - `SMTP_PASSWORD`: Your Gmail App Password.
        - `DOCTOR_SECRET_KEY`: A secret key for doctor login (e.g., `DOC-SECRET-2024`).
        - `ALLOWED_ORIGINS`: Initially set to `*`, update to your frontend URL later.

## ⚛️ Deployment on Vercel (Frontend)

Vercel is the best platform for Next.js applications.

1.  **Go to [Vercel](https://vercel.com/)**.
2.  **Import your GitHub Repository**.
3.  **Configure Environment Variables**:
    - Add `NEXT_PUBLIC_API_URL`: Use the URL of your **Backend service** from Render (e.g., `https://ai-prescription-backend.onrender.com`).
4.  **Deploy**: Click deploy and wait for the build to finish.

## 🗺️ Map API Configuration (Optional)

The system uses OpenStreetMap by default (no key required). If you want a more "premium" look (e.g., Stadia Maps), follow these steps:

1.  **Register** at [Stadia Maps](https://stadiamaps.com/) or another provider.
2.  **Get an API Key**.
3.  **Update Frontend Environment Variables**:
    - `NEXT_PUBLIC_MAP_TILE_URL`: Set to the provider's tile URL (include your API key in the URL if required).
    - `NEXT_PUBLIC_MAP_ATTRIBUTION`: Set the required attribution text.

---

## ✅ Post-Deployment Steps

1.  **Secure CORS**: Once your frontend is live (e.g., `https://my-app.vercel.app`), go back to your **Render Backend service** and update `ALLOWED_ORIGINS` to that specific URL instead of `*`.
2.  **Verify**: Log in as a doctor or patient and verify that AI features and prescriptions are working in the live environment.

---
*Developed with ❤️ for TechRamTamil*
