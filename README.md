# 🚀 Resume Cockpit | AI Resume Architect

[![Aesthetic UI](https://img.shields.io/badge/UI-Aesthetic%20%26%20Minimal-0052FF?style=for-the-badge&logo=tailwindcss)](https://github.com/usman-sethi/resume-cockpit)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://github.com/usman-sethi/resume-cockpit)
[![Render Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://resume-cockpit-backend.onrender.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

An enterprise-grade, full-stack, AI-driven resume builder and ATS optimizer designed to empower modern professionals. Built using a modern, decoupled architecture with a highly performant **Vite + React 19** frontend and a robust **Express + Node.js + MongoDB** backend.

---

## 🎨 Design Philosophy & Aesthetic Core

Resume Cockpit is built with a **Modernist, High-Contrast Space Slate Theme** featuring:
- **Intense Spatial Harmony**: Generous, deliberate use of negative space, crisp margins, and custom bento-grid layouts.
- **Fluid Micro-Interactions**: Smooth state transitions, interactive item animations, and staggered list entrances powered by `motion` (Framer Motion).
- **Polished Typography**: Intentional font pairings using display sans-serif headers paired with precise monospace trackers for ATS analytics.
- **Dynamic Visuals**: High-fidelity radar charts powered by `recharts` to map keyword metrics, and beautiful generative canvas particles.

---

## 💎 Core Feature Highlights

### 1. The Resume Cockpit Engine (Interactive Editor)
- **Fluid Live Editor**: Edit resume modules (Contact, Education, Experience, Skills, Projects, Certifications) with real-time updates.
- **Reactive Sidebar Controls**: Custom styling variables, custom margins, and toggleable layout options.
- **Drag-and-Drop Orderers**: Easily reorder experience bullet points, skills, or projects with instant local state updates using `Zustand`.

### 2. Generative AI Architect (Powered by `@google/genai`)
- **Interactive Creation Wizard**: Generates a professional resume skeleton in seconds based on your target role, industry, and level.
- **Smart Summary Rewriter**: Reframe your professional summaries dynamically based on specific professional voices (e.g., *Technical*, *Creative*, *Executive*).
- **AI Bullet Optimizer**: Instantly refine raw project bullet points into high-impact, STAR-method accomplishments.

### 3. ATS Audit & Competency Analytics
- **Live ATS Score Indicator**: Dynamically calculates your resume's search visibility score, structural integrity, and grammar safety.
- **Job Description Matcher**: Compare your resume against targeted job descriptions. It extracts keyword gaps, highlights missing skills, and presents tailored optimization advice.
- **Interactive Competency Visualizer**: Features dynamic radar and bar charts rendering skill density and keyword frequency matches.

### 4. Modern High-Fidelity Export Pipeline
- **Pixel-Perfect PDF Generation**: Custom-designed layout compiler with smart page-break protection and clean structural preservation using `jspdf` and `html2canvas`.
- **Global Theme Styling**: Switch between premium template designs (e.g., *Modern Minimalist*, *Technical Compact*, *Executive Classic*).

---

## 🛠️ Full-Stack Technical Architecture

```
                                  +-------------------+
                                  |    Web Client     |
                                  | (Vite + React 19) |
                                  +---------+---------+
                                            |
                         HTTPS API requests | Routing (Vercel Proxy)
                                            v
                                  +---------+---------+
                                  |   API Gateway /   |
                                  |  Express Backend  |
                                  +----+---------+----+
                                       |         |
                Mongoose DB Operations |         | Google Gemini API
                                       v         v
                              +--------+--+   +--+---------------+
                              |  MongoDB  |   | @google/genai SDK|
                              |  Database |   | (Flash/Pro Models|
                              +-----------+   +------------------+
```

### Decoupled Monorepo Structure
```bash
├── backend/                  # Node.js + Express API Backend Server
│   ├── src/                  # Type-safe controller & route source files
│   │   ├── controllers/      # Route handlers (Auth, AI, Resumes, etc.)
│   │   ├── routes/           # Express API endpoints
│   │   └── services/         # Third-party integrations (Gemini, Cloudinary, Resend)
│   ├── server.ts             # Application entry-point and middleware configuration
│   └── tsconfig.json         # TypeScript compiler configurations
│
├── frontend/                 # Vite + React 19 Single Page Application (SPA)
│   ├── src/                  # React Application Code
│   │   ├── components/       # Common UI elements and wrappers
│   │   ├── features/         # Modular feature panels (ATS, AI, Resume, Landing)
│   │   ├── stores/           # Zustand client-side global state store
│   │   └── utils/            # Document export pipelines and mock presets
│   ├── vercel.json           # Vercel deployment & API rewrite gateway
│   └── vite.config.ts        # Vite build configurations with Tailwind v4 support
```

---

## 🚀 Installation & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or above)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas cloud cluster URI)

---

### 1. Backend Configuration (`/backend`)

1. Change directory to `/backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_signing_key
   GEMINI_API_KEY=your_gemini_developer_key
   CLOUDINARY_URL=your_cloudinary_upload_url
   RESEND_API_KEY=your_resend_email_integration_key
   ```
4. Spin up the backend dev server:
   ```bash
   npm run dev
   ```

---

### 2. Frontend Configuration (`/frontend`)

1. Change directory to `/frontend`:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` based on `.env.example`:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. Start the frontend developer preview server:
   ```bash
   npm run dev
   ```

---

## 🌐 Production Deployment Guide

### Backend Deployment (e.g. Render)
To host your server live on **Render**:
1. Connect your GitHub repository to Render and choose the **Web Service** template.
2. Set the root directory of the web service to `backend`.
3. Set the build command to `npm install && npm run build` (which compiles TypeScript).
4. Set the start command to `node dist/server.js`.
5. Add your server secrets inside the **Environment Variables** panel (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.).

---

### Frontend Deployment (e.g. Vercel)
To deploy your static client securely with zero-config API proxies on **Vercel**:
1. Connect your GitHub repository to Vercel and import the project.
2. Select `/frontend` as the root directory of your project.
3. Configure the following environment variables:
   - `VITE_API_URL`: Set this to your live backend server URL (e.g. `https://resume-cockpit-backend.onrender.com`).
4. Vercel reads `/frontend/vercel.json` automatically. This sets up an **API Gateway rewrite ruleset**, mapping client-side requests from `/api/*` directly to the Render backend service, bypassing any CORS restrictions:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://resume-cockpit-backend.onrender.com/api/:path*"
       },
       {
         "source": "/:path*",
         "destination": "/index.html"
       }
     ]
   }
   ```

---

## 🔒 Security & Performance Considerations

- **Server-Side API Gateway Proxy**: Client-side environment variables never contain sensitive developer tokens. All third-party services (such as MongoDB, Gemini AI, Resend, and Cloudinary) are initialized securely and processed strictly server-side on the Express application.
- **JWT Token Expiry**: Implements structured session keys expiring in 24 hours with cryptographic verification via Express authentication middlewares.
- **Bundle Splitting**: The build environment uses automatic Vite optimization splits to isolate large rendering libraries (`recharts`, `html2canvas`, and `jspdf`) into dynamic asynchronous modules, enhancing page-load speeds.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
