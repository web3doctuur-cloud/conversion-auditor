# 🌐 Website Conversion Auditor

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge&logo=vercel)](https://conversion-auditor-client-o3lr.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Render-blue?style=for-the-badge&logo=render)](https://conversion-auditor-backend.onrender.com)
[![Built with](https://img.shields.io/badge/Built%20with-Antigravity%20AI-6366F1?style=for-the-badge&logo=openai)](https://aistudio.google.com)

A **production-ready website auditor** that analyzes any URL for performance metrics, SEO health, and conversion optimization risks — built entirely using AI agent orchestration.

> **⚠️ Note:** The backend runs on Render's free tier. First audit may take 30-50 seconds to spin up the service. Subsequent audits are faster.

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | https://conversion-auditor-client.vercel.app |
| **Backend (Render)** | https://conversion-auditor-backend.onrender.com |
| **GitHub Repository** | https://github.com/web3doctuur-cloud/conversion-auditor |

---

## 📊 What It Does

| Audit Category | Metrics Analyzed |
|----------------|------------------|
| **Performance** | TTFB, First Contentful Paint, DOM Content Loaded, Total Load Time |
| **SEO** | Title tag, Meta description, H1 structure, Image alt attributes, Canonical links |
| **Conversion** | CTA visibility, Trust signals, Typography readability, Mobile responsiveness |
| **Visual** | Full-page screenshot with colored annotations highlighting issues |

### Scoring Weight
overall score = perfomance (30%) + seo (30%) + conversion (40%)*Conversion is weighted highest — because for marketing clients, conversion drives revenue.*

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite |
| **Backend** | Node.js 20, Express, Playwright (Chromium automation) |
| **Deployment** | Docker, Render (backend), Vercel (frontend) |
| **Image Processing** | Sharp (screenshot annotation) |
| **AI Tools Used** | Antigravity (Claude-based agent), DeepSeek (debugging) |

---

## 🤖 How This Project Was Built (AI-First Development)

This project demonstrates a **modern AI-augmented development workflow**:

### Phase 1: Specification-Driven Development
- Wrote a detailed `SPEC.md` documenting architecture, API contracts, and scoring logic
- Used **Antigravity** (Claude-based AI agent) to generate the entire codebase from spec

### Phase 2: AI-Generated Implementation
The AI agent autonomously created:
- Complete React frontend with 8+ components
- Express backend with 4 audit services (performance, SEO, conversion, screenshot)
- Playwright browser automation for live website testing
- TypeScript types and Tailwind styling

### Phase 3: Deployment Debugging with DeepSeek
During Render deployment, encountered Playwright browser installation errors. **DeepSeek AI** provided the critical fix:
- Identified that `npx playwright install --with-deps` fails on Render due to `su: Authentication failure`
- Recommended switching to Playwright's official Docker base image (`mcr.microsoft.com/playwright`)
- Provided exact Dockerfile configuration that resolved the issue

> **DeepSeek's Role:** Debugged the Render deployment failure, explained the root cause (Playwright trying to switch to root user), and delivered the working Dockerfile solution.

---

## 🏗️ Architecture
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Vercel │────▶│ Render │────▶│ Playwright │
│ (Frontend) │ │ (Backend) │ │ (Browser) │
│ React │◀────│ Express │◀────│ Chromium │
└─────────────┘ └─────────────┘ └─────────────┘
│ │ │
▼ ▼ ▼
User enters Audits 4 areas Captures &
URL of website annotates
screenshot

### Data Flow

1. User enters URL in React frontend
2. Frontend sends `POST /api/audit` to Render backend
3. Backend launches Playwright Chromium browser
4. Browser navigates to URL, measures performance, extracts HTML
5. Backend analyzes HTML for SEO and conversion signals
6. Backend captures full-page screenshot and annotates with Sharp
7. Results JSON + image returned to frontend
8. Frontend displays interactive dashboard

---

## 📁 Project Structure
conversion-auditor/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/
│ │ │ ├── HeroSection.tsx
│ │ │ ├── OverallScoreCard.tsx
│ │ │ ├── PerformanceSection.tsx
│ │ │ ├── SeoSection.tsx
│ │ │ ├── ConversionSection.tsx
│ │ │ ├── ScreenshotPanel.tsx
│ │ │ └── ResultsDashboard.tsx
│ │ ├── App.tsx
│ │ ├── main.tsx
│ │ └── index.css
│ └── package.json
├── server/ # Express backend
│ ├── src/
│ │ ├── audit/
│ │ │ ├── performanceService.ts
│ │ │ ├── seoService.ts
│ │ │ ├── conversionService.ts
│ │ │ └── screenshotService.ts
│ │ ├── routes/
│ │ │ └── audit.ts
│ │ └── index.ts
│ └── package.json
├── Dockerfile # Playwright Docker configuration
├── .node-version # Node.js 20.18.0 for Render
├── SPEC.md # Original development specification
└── package.json # Workspace root


---

## 🚀 Local Development

### Prerequisites
- Node.js 20.18.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/web3doctuur-cloud/conversion-auditor.git
cd conversion-auditor

# Install all dependencies
npm install

# Build the server
npm run build -w server

# Start both client and server
npm run dev
# Backend (Render)
ALLOWED_ORIGINS=http://localhost:5173,https://conversion-auditor-client.vercel.app

# Frontend (Vercel)
VITE_API_BASE_URL=http://localhost:3001

