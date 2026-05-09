# SPEC.md — Website Conversion Auditor

> **Status:** Awaiting Approval  
> **Version:** 1.0.0  
> **Date:** 2026-05-09

---

## 1. Project Overview

**Website Conversion Auditor** is a full-stack SaaS-style web tool that accepts a target URL,
spins up a headless Chromium browser (Playwright) on the server, runs a multi-category audit,
and returns a structured JSON report rendered as an interactive results dashboard.

### Goals
- Give users actionable insights in < 30 seconds
- Surface performance bottlenecks, SEO gaps, and CRO risks in one pass
- Provide a downloadable annotated screenshot

---

## 2. Monorepo Structure

```
conversion-auditor/
├── SPEC.md                    ← this file
├── package.json               ← root workspace config (npm workspaces)
├── .gitignore
│
├── client/                    ← React + TypeScript + Tailwind
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── types/
│       │   └── audit.ts           ← shared type definitions
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.tsx
│       │   │   └── Footer.tsx
│       │   ├── home/
│       │   │   ├── HeroSection.tsx
│       │   │   └── UrlInputForm.tsx
│       │   └── results/
│       │       ├── ResultsDashboard.tsx
│       │       ├── OverallScoreCard.tsx
│       │       ├── PerformanceSection.tsx
│       │       ├── SeoSection.tsx
│       │       ├── ConversionSection.tsx
│       │       └── ScreenshotPanel.tsx
│       ├── hooks/
│       │   └── useAudit.ts        ← fetch + state machine
│       └── lib/
│           └── api.ts             ← typed API client
│
└── server/                    ← Node.js + Express + Playwright
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts               ← Express entry point
        ├── routes/
        │   └── audit.ts           ← POST /api/audit
        ├── services/
        │   ├── browserService.ts  ← Playwright lifecycle
        │   ├── performanceService.ts
        │   ├── seoService.ts
        │   ├── conversionService.ts
        │   └── screenshotService.ts
        ├── utils/
        │   └── scoring.ts         ← normalise metrics → 0-100
        └── types/
            └── audit.ts           ← canonical type definitions
```

---

## 3. Technology Stack

| Layer            | Technology                     | Rationale                                |
|------------------|--------------------------------|------------------------------------------|
| Frontend         | React 18 + TypeScript          | Component model; strict types            |
| Build tool       | Vite 5                         | Fast HMR; ESM-native                     |
| Styling          | Tailwind CSS v3                | Utility-first; design token alignment    |
| Backend runtime  | Node.js 20 LTS                 | Async I/O; Playwright compatibility      |
| Backend framework| Express 4                      | Lightweight; easy middleware             |
| Browser automation| Playwright 1.44               | Cross-browser; CDP metrics access        |
| Server language  | TypeScript (via tsx)           | Shared types with client                 |
| Package manager  | npm workspaces                 | Monorepo without extra tooling overhead  |
| Image annotation | sharp                          | Server-side PNG compositing, no GUI deps |

---

## 4. API Design

### Endpoint: `POST /api/audit`

**Request Body**
```json
{
  "url": "https://example.com"
}
```

**Success Response — `AuditReport`**
```json
{
  "url": "https://example.com",
  "auditedAt": "2026-05-09T15:00:00.000Z",
  "overallScore": 74,
  "performance": {
    "score": 68,
    "ttfb":      { "value": 312,  "unit": "ms", "rating": "yellow" },
    "fcp":       { "value": 1840, "unit": "ms", "rating": "yellow" },
    "dcl":       { "value": 2100, "unit": "ms", "rating": "yellow" },
    "totalLoad": { "value": 3500, "unit": "ms", "rating": "red"    }
  },
  "seo": {
    "score": 80,
    "checks": [
      {
        "id": "title",
        "label": "Title Tag",
        "status": "pass",
        "value": "My Great Website — Home",
        "length": 26,
        "recommendation": null
      },
      {
        "id": "metaDescription",
        "label": "Meta Description",
        "status": "warning",
        "value": "Short desc",
        "length": 10,
        "recommendation": "Expand meta description to 120–160 characters."
      },
      {
        "id": "h1Count",
        "label": "H1 Tag",
        "status": "fail",
        "value": 0,
        "recommendation": "Add exactly one H1 tag to the page."
      },
      {
        "id": "imgAlts",
        "label": "Image Alt Attributes",
        "status": "warning",
        "value": 3,
        "recommendation": "3 images are missing alt text."
      },
      {
        "id": "canonical",
        "label": "Canonical Link",
        "status": "pass",
        "value": "https://example.com/",
        "recommendation": null
      }
    ]
  },
  "conversion": {
    "score": 72,
    "riskLevel": "medium",
    "checks": [
      {
        "id": "ctaAboveFold",
        "label": "Primary CTA Above the Fold",
        "status": "pass",
        "recommendation": null
      },
      {
        "id": "trustSignals",
        "label": "Trust Signals Detected",
        "status": "warning",
        "recommendation": "No testimonials or guarantee badges found."
      },
      {
        "id": "fontReadability",
        "label": "Typography Readability",
        "status": "pass",
        "recommendation": null
      },
      {
        "id": "mobileViewport",
        "label": "Mobile Viewport Meta Tag",
        "status": "pass",
        "recommendation": null
      }
    ],
    "tips": [
      "Add social proof (testimonials, review count) near the fold.",
      "Include a security badge (SSL / payment icons) near CTAs."
    ]
  },
  "screenshot": {
    "base64": "<base64-encoded-png>",
    "mimeType": "image/png",
    "annotations": [
      { "type": "missingAlt", "x": 120, "y": 340, "width": 200, "height": 150 },
      { "type": "h1Missing", "x": 0,   "y": 0,   "width": 0,   "height": 0   }
    ]
  }
}
```

**Error Responses**

| HTTP Status | Meaning                    |
|-------------|----------------------------|
| 400         | Invalid or missing URL     |
| 422         | URL not reachable          |
| 500         | Internal server error      |

---

## 5. Backend Service Architecture

```
POST /api/audit
        │
        ▼
   auditRoute.ts          (validate URL → orchestrate services)
        │
   browserService.ts      (launch Chromium once; new page per request)
        │
   ┌────┴──────────────────────────┐
   │                               │
   ├──► performanceService.ts      │
   │      • window.performance.timing (via page.evaluate)
   │      • CDP session for TTFB
   │
   ├──► seoService.ts
   │      • page.evaluate DOM queries
   │      • title, meta[name=description], h1, img[alt], link[rel=canonical]
   │
   ├──► conversionService.ts
   │      • getBoundingClientRect() for buttons above fold
   │      • keyword scan for trust signals
   │      • viewport meta, computed font-size / line-height
   │
   └──► screenshotService.ts
          • page.screenshot({ fullPage: true })
          • sharp compositing for annotation overlays
          • return base64 PNG
        │
   scoring.ts             (weight & normalise → overallScore)
        │
   JSON response ────────► client
```

### Playwright Browser Lifecycle
- **One shared browser** instance launched once at server start (warm-up)
- Each request opens a **new BrowserContext + Page**, closed after audit
- Audit hard **timeout: 25 s** (Express server timeout: 30 s)
- `userAgent` set to a real Chrome UA to avoid bot detection blocks

---

## 6. Frontend Component Tree & Data Flow

```
App.tsx
├── Header
│
├── HeroSection            (visible when status = IDLE | ERROR)
│   └── UrlInputForm
│       • controlled input (url)
│       • URL constructor validation
│       • on submit → dispatch({ type: 'FETCH', url })
│
├── LoadingOverlay         (visible when status = LOADING)
│   • animated steps: "Launching browser…", "Auditing…", "Analysing…"
│
├── ResultsDashboard       (visible when status = SUCCESS)
│   ├── OverallScoreCard   (animated radial SVG progress, 0–100)
│   ├── PerformanceSection
│   │   └── MetricCard × 4  (TTFB / FCP / DCL / Load — colour-rated)
│   ├── SeoSection
│   │   └── CheckRow × N    (icon + label + status badge + tip)
│   ├── ConversionSection
│   │   ├── RiskScoreMeter  (gauge 0–100)
│   │   └── CheckRow × N
│   └── ScreenshotPanel
│       ├── AnnotatedImage  (img tag, base64 src)
│       └── Download button
│
└── Footer
```

### State Machine (`useAudit` hook — `useReducer`)

```
         submit
IDLE ─────────────► LOADING
                       │
             success ──┤── error
                       │         │
                    SUCCESS    ERROR
                                  │
                              retry → LOADING
```

State shape:
```ts
type AuditState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: AuditReport }
  | { status: 'error'; message: string }
```

---

## 7. Scoring Algorithm

### Overall Score (weighted average)
```
overallScore = round(
  performance.score * 0.35 +
  seo.score         * 0.35 +
  conversion.score  * 0.30
)
```
Clamped to **0–100**.

### Performance Score

Each metric maps to a sub-score; then weighted:

| Metric     | Weight | Green (100)  | Yellow (60)     | Red (20)  |
|------------|--------|--------------|-----------------|-----------|
| TTFB       | 25%    | < 200 ms     | 200 – 600 ms    | > 600 ms  |
| FCP        | 35%    | < 1 800 ms   | 1 800 – 3 000 ms| > 3 000 ms|
| DCL        | 20%    | < 2 000 ms   | 2 000 – 4 000 ms| > 4 000 ms|
| Total Load | 20%    | < 3 000 ms   | 3 000 – 6 000 ms| > 6 000 ms|

### SEO Score
- pass = 100 · warning = 60 · fail = 0  
- Average of all check scores

### Conversion Score
Starts at **100**, point deductions:
| Check failure          | Deduction |
|------------------------|-----------|
| CTA not above fold     | −25       |
| No trust signals       | −20       |
| Poor font readability  | −15       |
| No mobile viewport tag | −40       |

---

## 8. Design System

### Color Tokens
```css
--color-primary:  #6366F1;  /* Indigo       — interactive elements */
--color-success:  #10B981;  /* Emerald      — pass / good scores   */
--color-warning:  #F59E0B;  /* Amber        — warnings             */
--color-danger:   #EF4444;  /* Red          — failures             */
--color-bg:       #0F0F1A;  /* Near-black   — page background      */
--color-surface:  #1A1A2E;  /* Dark card bg                        */
--color-border:   #2D2D44;  /* Subtle dividers                     */
--color-text:     #E2E8F0;  /* Primary text                        */
--color-muted:    #94A3B8;  /* Secondary / label text              */
```

### Typography
- Font: **Inter** (loaded via Google Fonts)
- Base size: 16 px; scale via Tailwind (`text-sm` → `text-4xl`)

### Reusable Patterns
- Cards: `bg-surface border border-border rounded-xl p-6 shadow-lg shadow-black/30`
- Primary button: `bg-primary hover:bg-primary/90 text-white rounded-lg px-6 py-3 transition-all duration-200`
- Transitions: `transition-all duration-300 ease-in-out`

---

## 9. Environment Variables

### `server/.env`
```
PORT=4000
ALLOWED_ORIGINS=http://localhost:5173
AUDIT_TIMEOUT_MS=25000
```

### `client/.env`
```
VITE_API_BASE_URL=http://localhost:4000
```

---

## 10. npm Scripts

```jsonc
// root package.json
{
  "workspaces": ["client", "server"],
  "scripts": {
    "dev":         "concurrently \"npm run dev -w server\" \"npm run dev -w client\"",
    "install:all": "npm install && npx playwright install chromium"
  }
}
```

---

## 11. Constraints & Mitigations

| Constraint                              | Mitigation                                              |
|-----------------------------------------|---------------------------------------------------------|
| Playwright cold-start latency           | Reuse single browser; warm up on server start           |
| Sites blocking headless browsers        | Real Chrome UA; stealth-friendly headers                |
| Server-side image annotation (no canvas)| `sharp` for PNG compositing — no display server needed  |
| Audit timeout                           | 25 s hard limit; returns partial data + `timedOut` flag |
| CORS for local dev                      | `cors` middleware; `ALLOWED_ORIGINS` env var            |
| Very tall full-page screenshots         | Cap at 10 000 px height; compress to reduce base64 size |

---

## 12. Out of Scope (v1)

- User accounts / auth
- Audit history persistence (no database)
- PDF export
- Lighthouse integration (using custom Playwright metrics)
- Rate limiting (deferred to v2)

---

## 13. Approval Checklist

Before implementation begins, please confirm:

- [ ] Monorepo structure looks correct
- [ ] API response shape covers everything you need
- [ ] Scoring weights (35 / 35 / 30) feel right
- [ ] Dark-mode-only design is acceptable (or should we add light mode toggle?)
- [ ] `sharp` for screenshot annotation is acceptable
- [ ] Node 20 + npm workspaces is available on your machine
