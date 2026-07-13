# AI Resume Architect - Standalone Backend

This is the standalone Node.js/Express API service designed to run on **Render** (or any cloud VPS like AWS/Heroku).

## Core Capabilities
- **Orchestrated Gemini Core**: Relays and streams ATS optimizations, cover letters, and structural resume rewrites using `@google/genai`.
- **Database Persistence**: Secured MongoDB endpoints for saving drafts, user profiles, and metadata.
- **Media Uploads**: Integrates directly with Cloudinary to handle photo/avatar and document uploading securely.
- **Email delivery**: Employs Resend APIs to send dynamic OTPs and validation codes.

---

## 🚀 Step-by-Step Render Deployment

### 1. Create a Web Service on Render
1. Log in to your **Render Console** (https://dashboard.render.com).
2. Click **New** -> **Web Service**.
3. Select **"Deploy from a Git provider"** and point it to your repository containing this `/backend` sub-folder.

### 2. Configure General Settings
In the Render creation flow, customize these fields:
- **Name**: `ai-resume-architect-backend`
- **Region**: Select a region close to your database (e.g., `Oregon (US West)`)
- **Runtime**: `Node`
- **Root Directory**: `backend` *(CRITICAL: Tell Render to look inside this sub-folder!)*
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

---

### 3. Add Environment Variables
In the **Environment** tab, add the following variables:

| Variable Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Target environment mode | `production` |
| `PORT` | Node server port | `3000` *(Render sets this automatically)* |
| `MONGO_URI` | Cloud MongoDB Connection URL | `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/resume_cockpit` |
| `GEMINI_API_KEY` | Your Google Gemini API Secret | `AIzaSy...` |
| `JWT_SECRET` | JWT encoding key | *Generate a random 32-character string* |
| `RESEND_API_KEY` | Resend API key for emailing OTPs | `re_...` |
| `CLERK_SECRET_KEY` | Clerk Auth integration secret | `sk_live_...` *(If utilizing Clerk authentication)* |

---

## 🛠️ Local Development & Testing

If you want to run this backend independently on your local machine:

1. Navigate to the folder:
   ```bash
   cd backend
   ```
2. Create a `.env` file containing the environment variables above.
3. Start the dev server:
   ```bash
   npm run dev
   ```
   The backend will listen on `http://localhost:3000` for REST requests.
