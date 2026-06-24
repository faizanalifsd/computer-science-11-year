# execution_plan.md — Class 11 CS Book Project

> **Goal:** Convert Class 11 CS textbook PDF into a live, AI-powered, monetised web app
> **Reference stack:** See `constitution.md` in this folder
> **Estimated total time:** 7–10 days

---

## Overview

```
Phase 1 → PDF → Markdown            (1–2 days)
Phase 2 → Docusaurus Website        (1 day)
Phase 3 → Backend Setup             (1 day)
Phase 4 → RAG Indexing              (2–3 hours)
Phase 5 → Payment Integration       (3–4 days)
Phase 6 → Deployment                (1 day)
Phase 7 → Testing & Launch          (1 day)
```

---

## Phase 1: PDF → Markdown Conversion

**Goal:** Extract all chapter text from the PDF and produce clean `.md` files.

### Step 1.1 — Test PDF Text Quality

Before writing any scripts, confirm the PDF has selectable text (not scanned images).

```bash
pip install pdfplumber
python -c "
import pdfplumber
with pdfplumber.open('your_book.pdf') as pdf:
    print(pdf.pages[0].extract_text()[:500])
"
```

**Result A — Clean text output:** Proceed with Step 1.2 (pdfplumber).
**Result B — None or garbled:** PDF is scanned. Go to Step 1.2b (OCR).

---

### Step 1.2A — Extract with pdfplumber (Clean PDF)

Create `pdf_to_md.py`:

```python
import pdfplumber
import os

PDF_PATH = "your_book.pdf"
OUTPUT_DIR = "chapters_raw"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Define chapter page ranges based on your PDF table of contents
# Format: (chapter_number, title, start_page, end_page)
CHAPTERS = [
    (1,  "Introduction to Computers",        1,  20),
    (2,  "Computer Hardware",                21,  45),
    (3,  "Number Systems",                   46,  70),
    # ... add all chapters
]

with pdfplumber.open(PDF_PATH) as pdf:
    for num, title, start, end in CHAPTERS:
        text = ""
        for page in pdf.pages[start-1:end]:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n\n"

        slug = f"chapter-{num:02d}-{title.lower().replace(' ', '-')}"
        with open(f"{OUTPUT_DIR}/{slug}.md", "w", encoding="utf-8") as f:
            f.write(f"# Chapter {num}: {title}\n\n")
            f.write(text.strip())

        print(f"Extracted: {slug}.md")
```

Run: `python pdf_to_md.py`

---

### Step 1.2B — Extract with OCR (Scanned PDF)

```bash
pip install pdf2image pytesseract pillow
# Also install Tesseract binary: https://github.com/UB-Mannheim/tesseract/wiki
```

```python
from pdf2image import convert_from_path
import pytesseract, os

PDF_PATH = "your_book.pdf"
OUTPUT_DIR = "chapters_raw"
os.makedirs(OUTPUT_DIR, exist_ok=True)

images = convert_from_path(PDF_PATH, dpi=300)
full_text = ""
for i, img in enumerate(images):
    text = pytesseract.image_to_string(img)
    full_text += f"\n\n--- Page {i+1} ---\n\n{text}"

with open(f"{OUTPUT_DIR}/full_book_ocr.txt", "w", encoding="utf-8") as f:
    f.write(full_text)

print("OCR done. Now manually split into chapter files.")
```

> OCR output will need manual cleanup. Set aside extra time for this step.

---

### Step 1.3 — Format into Docusaurus Markdown

For each raw extracted `.md` file, apply the mandatory chapter structure from `constitution.md` Section 5.

Add frontmatter at the top of each file:

```markdown
---
sidebar_position: 1
---

# Chapter 1: Introduction to Computers

## Learning Objectives
...
```

**Checklist per chapter:**
- [ ] `sidebar_position` frontmatter added
- [ ] Sections: Learning Objectives, Introduction, Core Concepts, Code Example, Common Mistakes, Summary, Review Questions
- [ ] No garbled OCR characters remaining
- [ ] Code blocks properly fenced with triple backticks

---

## Phase 2: Docusaurus Website Setup

**Goal:** New Docusaurus site for the CS11 book (separate from Physical AI project).

### Step 2.1 — Create New Repo & Docusaurus Site

```bash
# Create new GitHub repo: cs11-book (do this on GitHub.com first)

# Then locally:
npx create-docusaurus@latest cs11_website classic --typescript
cd cs11_website
```

### Step 2.2 — Replace Default Content

```bash
# Delete default docs
rm docs/tutorial-*
rm docs/intro.md

# Copy your chapter files in
cp ../chapters_raw/*.md docs/
```

### Step 2.3 — Update `docusaurus.config.ts`

Key changes from the default:

```typescript
const config: Config = {
  title: 'Class 11 Computer Science',
  tagline: 'Your complete CS textbook — with AI assistant',
  url: 'https://YOUR_GITHUB_USERNAME.github.io',
  baseUrl: '/cs11-book/',
  organizationName: 'YOUR_GITHUB_USERNAME',
  projectName: 'cs11-book',

  presets: [[
    'classic',
    {
      docs: { sidebarPath: './sidebars.ts' },
      blog: false,   // disable blog
      theme: { customCss: './src/css/custom.css' },
    }
  ]],
}
```

### Step 2.4 — Add Chat Widget

Copy `ChatWidget.jsx` and `chat.css` from the Physical AI project:
- `src/components/ChatWidget.jsx` — update `BACKEND_URL` to new backend URL
- `src/css/chat.css` — no changes needed
- `src/theme/Root.js` — no changes needed (injects widget on every page)

### Step 2.5 — Update `sidebars.ts`

```typescript
const sidebars: SidebarsConfig = {
  tutorialSidebar: [{ type: 'autogenerated', dirName: '.' }],
};
export default sidebars;
```

### Step 2.6 — Test Locally

```bash
npm install
npm start
# Visit http://localhost:3000/cs11-book/
```

### Step 2.7 — Set Up GitHub Actions Deploy

Copy `.github/workflows/deploy.yml` from the Physical AI project.
Update `working-directory` paths to match new folder structure.

---

## Phase 3: Backend Setup

**Goal:** FastAPI backend for RAG + payment. Reuse Physical AI backend as base.

### Step 3.1 — Copy & Adapt Backend

```bash
cp -r ../Hackathon_1/backend ./backend
```

Files to keep (unchanged):
- `embeddings.py` — Jina AI embeddings, no changes needed
- `requirements.txt` — add `stripe`, `python-jose[cryptography]`
- `runtime.txt` — keep `python-3.11.9`

Files to modify:
- `main.py` — add payment + auth routes
- `rag.py` — change `COLLECTION = "cs11_book"`

### Step 3.2 — Update `rag.py`

Change only two things:

```python
COLLECTION = "cs11_book"   # was "physical_ai_book"

SYSTEM_PROMPT = """You are Robo, a friendly teaching assistant for a Class 11 Computer Science textbook.

Rules:
- Answer ONLY based on the provided book context. Do not use outside knowledge.
- Always cite the chapter: "Based on Chapter X..."
- If context is insufficient, say: "I couldn't find that in the book. Try rephrasing or check Chapter X directly."
- Keep answers under 300 words.
- Use simple language appropriate for 11th class students.
- End every response with: "Want me to explain [related concept]?"
"""
```

### Step 3.3 — Update `requirements.txt`

Add to existing requirements:
```
stripe==7.9.0
python-jose[cryptography]==3.3.0
passlib==1.7.4
```

---

## Phase 4: RAG Indexing

**Goal:** Index all chapter content into Qdrant so Robo can search it.

### Step 4.1 — Update `indexer.py`

Change two constants:

```python
COLLECTION = "cs11_book"
DOCS_PATH = "../cs11_website/docs/*.md"
```

### Step 4.2 — Set Up `.env`

```bash
cp .env.example .env
# Fill in: GROQ_API_KEY, OPENROUTER_API_KEY, JINA_API_KEY
# Fill in: QDRANT_URL, QDRANT_API_KEY (from Qdrant Cloud dashboard)
# Fill in: NEON_DATABASE_URL
```

### Step 4.3 — Run Indexer

```bash
cd backend
pip install -r requirements.txt
python indexer.py
```

Expected output:
```
Collection 'cs11_book' ready (dim=768).
  chapter-01-introduction-to-computers: 4 chunks
  chapter-02-computer-hardware: 6 chunks
  ...
Embedding 60 chunks via Jina AI...
Done! Indexed 60 chunks from 10 chapters.
```

### Step 4.4 — Test RAG

```bash
uvicorn main:app --reload --port 8002

curl -X POST http://localhost:8002/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is RAM?", "selected_text": ""}'
```

Expected: Answer citing a chapter, no hallucination.

---

## Phase 5: Payment Integration

**Goal:** Gate Chapter 2+ and Robo behind Stripe payment.

### Step 5.1 — Set Up Stripe Account

1. Create account at stripe.com
2. Get `STRIPE_SECRET_KEY` from Dashboard → Developers → API keys
3. Create a Product: "Class 11 CS Book Access"
4. Create a Price (one-time, e.g. PKR 500 or USD 5)
5. Copy the `price_xxx` ID → `STRIPE_PRICE_ID` in `.env`

### Step 5.2 — Add Neon DB Tables

```sql
-- Run this in Neon SQL editor

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  has_access BOOLEAN DEFAULT FALSE,
  access_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_logs (
  id SERIAL PRIMARY KEY,
  user_email TEXT,
  question TEXT,
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 5.3 — Add Payment Routes to `main.py`

New endpoints to add:

```python
# POST /create-checkout-session
# → Creates Stripe Checkout session, returns checkout URL

# POST /stripe-webhook
# → Receives Stripe events, marks user as paid in DB, returns JWT

# GET /verify-token
# → Validates JWT from frontend, returns {valid: true/false}
```

Full implementation:

```python
import stripe
import os
from jose import jwt
from datetime import datetime, timedelta

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
JWT_SECRET = os.getenv("JWT_SECRET")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

class CheckoutRequest(BaseModel):
    email: str

class TokenResponse(BaseModel):
    token: str
    valid: bool

@app.post("/create-checkout-session")
async def create_checkout(payload: CheckoutRequest):
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price": os.getenv("STRIPE_PRICE_ID"),
            "quantity": 1,
        }],
        mode="payment",
        customer_email=payload.email,
        success_url="https://YOUR_GITHUB_USERNAME.github.io/cs11-book/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url="https://YOUR_GITHUB_USERNAME.github.io/cs11-book/cancelled",
    )
    return {"checkout_url": session.url}

@app.post("/stripe-webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        email = session.get("customer_email")
        # Mark user as paid in Neon DB
        # (use asyncpg or psycopg2 to update users table)
        token = jwt.encode(
            {"email": email, "exp": datetime.utcnow() + timedelta(days=30)},
            JWT_SECRET, algorithm="HS256"
        )
        # Store token or just return it via redirect
    return {"status": "ok"}

@app.get("/verify-token")
async def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {"valid": True, "email": payload["email"]}
    except Exception:
        return {"valid": False}
```

### Step 5.4 — Frontend Payment Gate

Add to `ChatWidget.jsx` — check token before sending to `/chat`:

```javascript
const token = localStorage.getItem("cs11_access_token");
if (!token) {
  // Show paywall modal instead of chat
  showPaywall();
  return;
}

// Verify token with backend
const verify = await fetch(`${BACKEND_URL}/verify-token?token=${token}`);
const { valid } = await verify.json();
if (!valid) {
  localStorage.removeItem("cs11_access_token");
  showPaywall();
  return;
}
// Proceed with /chat call
```

Add payment button component (shows when not paid):

```javascript
const handlePayment = async () => {
  const email = prompt("Enter your email:");
  const res = await fetch(`${BACKEND_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const { checkout_url } = await res.json();
  window.location.href = checkout_url; // Redirect to Stripe
};
```

### Step 5.5 — Success Page

Create `docusaurus_website/src/pages/success.tsx`:
- Reads `session_id` from URL params
- Calls backend to get JWT token
- Stores token in `localStorage`
- Redirects to Chapter 2

### Step 5.6 — Test Payment (Stripe Test Mode)

Use Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC.

Checklist:
- [ ] Checkout session created and redirects to Stripe
- [ ] After payment, webhook fires and user marked as paid
- [ ] JWT token returned to frontend and stored
- [ ] Chat widget allows access after token stored
- [ ] Token expiry blocks access after 30 days
- [ ] Refund in Stripe dashboard → access revoked (optional but good)

---

## Phase 6: Deployment

### Step 6.1 — Backend → Render.com

1. Push `backend/` folder to GitHub
2. Render.com → New Web Service → connect repo
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables in Render dashboard
6. Copy the Render URL (e.g. `https://cs11-book-api.onrender.com`)

### Step 6.2 — Configure Stripe Webhook for Production

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://cs11-book-api.onrender.com/stripe-webhook`
3. Events to listen: `checkout.session.completed`
4. Copy Webhook Signing Secret → `STRIPE_WEBHOOK_SECRET` in Render env vars

### Step 6.3 — Frontend → GitHub Pages

```bash
cd cs11_website
npm run build         # test build locally first
git add .
git commit -m "Initial CS11 book deployment"
git push
# GitHub Actions will auto-deploy to GitHub Pages
```

Update `ChatWidget.jsx` `BACKEND_URL` to point to Render URL before final push.

---

## Phase 7: Testing & Launch

### Pre-Launch Checklist

**Content:**
- [ ] All chapters accessible on GitHub Pages
- [ ] No broken links in sidebar navigation
- [ ] Images (if any) render correctly
- [ ] Chapter 1 opens without any login/payment required

**RAG / Robo:**
- [ ] Ask 3 questions per chapter — all answers cite correct chapter
- [ ] Ask an out-of-scope question — Robo says "not found", doesn't hallucinate
- [ ] Selected text context works (highlight text → ask question → context included)
- [ ] Robo ends every response with "Want me to explain...?"

**Payment:**
- [ ] Stripe test payment works end-to-end
- [ ] Access granted after payment
- [ ] Access blocked if no token or expired token
- [ ] Switch Stripe to live mode (`sk_live_...` key)

**Performance:**
- [ ] First chat response arrives within 5 seconds
- [ ] Render.com cold start warning shown if backend is sleeping (free tier spins down)

**Mobile:**
- [ ] Chat widget usable on mobile screen
- [ ] Book readable on mobile

### Launch Steps

1. Announce in relevant student groups / WhatsApp / Facebook
2. Share Chapter 1 link as a free sample
3. Offer early-bird pricing (discounted first week)
4. Monitor Stripe dashboard for first payments
5. Monitor Render.com logs for errors

---

## Folder Structure (Final)

```
cs11-book/                         ← New GitHub repo root
├── backend/
│   ├── main.py                    ← FastAPI app + payment routes
│   ├── rag.py                     ← RAG pipeline (collection: cs11_book)
│   ├── embeddings.py              ← Jina AI embeddings (unchanged)
│   ├── indexer.py                 ← Indexes chapters into Qdrant
│   ├── db.py                      ← Neon DB helpers (users, chat_logs)
│   ├── requirements.txt
│   ├── runtime.txt                ← python-3.11.9
│   └── .env                       ← Never commit this
│
├── cs11_website/                  ← Docusaurus site
│   ├── docs/
│   │   ├── chapter-01-*.md
│   │   ├── chapter-02-*.md
│   │   └── ...
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatWidget.jsx     ← Robo chat widget
│   │   ├── pages/
│   │   │   ├── index.tsx
│   │   │   └── success.tsx        ← Post-payment redirect page
│   │   ├── theme/
│   │   │   └── Root.js            ← Injects ChatWidget on every page
│   │   └── css/
│   │       ├── custom.css
│   │       └── chat.css
│   ├── docusaurus.config.ts
│   └── sidebars.ts
│
├── pdf_tools/
│   ├── pdf_to_md.py               ← PDF extraction script
│   └── your_book.pdf              ← Source PDF (do not commit to public repo)
│
├── constitution.md                ← Project rules and identity
├── execution_plan.md              ← This file
└── .gitignore                     ← Include: .env, __pycache__, node_modules, *.pdf
```

---

## Quick Reference — Key Commands

```bash
# Extract PDF
python pdf_tools/pdf_to_md.py

# Index chapters into Qdrant
cd backend && python indexer.py

# Run backend locally
cd backend && uvicorn main:app --reload --port 8002

# Run frontend locally
cd cs11_website && npm start

# Build frontend (test before deploy)
cd cs11_website && npm run build

# Test chat API
curl -X POST http://localhost:8002/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is a CPU?", "selected_text": ""}'

# Test payment checkout
curl -X POST http://localhost:8002/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## Timeline Summary

| Day | Task |
|-----|------|
| Day 1 | Test PDF extraction, fix encoding/OCR issues |
| Day 2 | Finish all chapter `.md` files, format & clean |
| Day 3 | Docusaurus site setup, local test, GitHub Pages deploy |
| Day 4 | Backend setup, RAG indexing, test Robo locally |
| Day 5 | Stripe setup, DB tables, payment routes |
| Day 6 | Frontend payment gate, success page, token flow |
| Day 7 | Full end-to-end test (payment → access → chat) |
| Day 8 | Fix bugs, mobile test, final deployment |
| Day 9 | Switch to Stripe live mode, announce launch |
| Day 10 | Monitor, gather first student feedback |
