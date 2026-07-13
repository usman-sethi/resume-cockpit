# AI Resume Architect - Standalone Frontend

This is the standalone, premium React client-side application designed to deploy onto **Vercel** with full Tailwind CSS v4 support, custom framer animations, and PDF export engines.

## Core Capabilities
- **Interactive Laptop Mockup**: Implements the immersive Point of View cockpit viewport.
- **Unified Resume Editor**: Supports live visual layout modifications, bullet rephrasing, and template swaps.
- **Local State & Storage**: Coordinates state synchronizations via lightweight Zustand stores.
- **High-Fidelity PDF Export**: Reliable pagination split layouts matching Chrome standards.

---

## 🚀 Step-by-Step Vercel Deployment

### 1. Import Project to Vercel
1. Log in to your **Vercel Dashboard** (https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your Git repository containing this `/frontend` sub-folder.

### 2. Configure General Settings
In the Vercel import page, customize these parameters:
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend` *(CRITICAL: Tell Vercel to look inside this sub-folder!)*
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

### 3. Add Environment Variables
Add these key-value pairs inside the **Environment Variables** panel:

| Variable Name | Description | Value |
| :--- | :--- | :--- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Auth Integration Key | *Your clerk publishable key (if utilizing Clerk)* |
| `VITE_API_URL` | Your Live Render API Host | `https://resume-cockpit-backend.onrender.com` |

---

### 4. Adjust the Proxy Destination (Optional)
If your Render service uses a custom URL or has a different domain name:
1. Open the `/frontend/vercel.json` file.
2. Replace `https://resume-cockpit-backend.onrender.com` in the `"destination"` parameter with your actual backend's Live URL.
3. Commit and push the changes. Vercel will automatically trigger a rebuild!

---

## 🛠️ Local Development

If you want to run this frontend independently on your local machine:

1. Navigate to the folder:
   ```bash
   cd frontend
   ```
2. Run package installations:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   The client will boot up and run on `http://localhost:5173`.
