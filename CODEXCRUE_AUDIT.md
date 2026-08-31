# CODEXCRUE — Comprehensive Architecture Audit
> Generated: 2026-08-24  
> Status: Pre-refactor baseline

---

## 1. Current Architecture Overview

```
CodexCrue/
├── frontend/          (Vite + React 18 + Redux Toolkit + TailwindCSS)
├── Backend/           (Node.js + Express + MongoDB + JWT Auth)
├── ml-service/        (Python FastAPI + TF-IDF vectorizer + scikit-learn)
├── ai-service/        (placeholder — only a prompts/ folder, no code)
└── docker-compose.yml
```

---

## 2. Frontend Structure

**Framework**: Vite + React 18, React Router v7, Redux Toolkit, Axios, Recharts, TailwindCSS v3  
**Package name in package.json**: `cortexcrew-frontend` (not CodexCrue)

### Pages
| Path | File | Status |
|------|------|--------|
| `/` | `pages/public/Home.jsx` | ✅ Exists, heavily inline-minified |
| `/about` | `pages/public/About.jsx` | ✅ Minimal stub |
| `/courses` | `pages/public/Courses.jsx` | ✅ Public catalog |
| `/courses/:id` | `pages/public/CourseDetails.jsx` | ✅ Public view |
| `/login` | `pages/auth/Login.jsx` | ✅ Working |
| `/register` | `pages/auth/Register.jsx` | ✅ Working (OTP flow) |
| `/forgot-password` | `pages/auth/ForgotPassword.jsx` | ✅ Exists |
| `/reset-password/:token` | `pages/auth/ResetPassword.jsx` | ✅ Exists |
| `/dashboard` | `pages/learner/Dashboard.jsx` | ✅ Working but cluttered |
| `/learning-path` | `pages/learner/LearningPath.jsx` | ✅ Full featured |
| `/skill-gap` | `pages/learner/SkillGap.jsx` | ✅ Minimal, works |
| `/courses (auth)` | `pages/learner/Courses.jsx` | ✅ Auth version |
| `/ai-assistant` | `pages/learner/AIAssistant.jsx` | ✅ Connected to Gemini |
| `/profile` | `pages/learner/Profile.jsx` | ✅ Full edit form |
| `/goal` `/my-goal` | `pages/learner/Goal.jsx` | ✅ Duplicate routes |
| `/progress` | `pages/learner/Progress.jsx` | ✅ Detailed |
| `/resources` | `pages/learner/Resources.jsx` | ✅ Exists |
| `/assessments` | `components/learning/Assessments` | ⚠️ Not in pages/ |
| `/settings` | maps to `/profile` | ⚠️ No dedicated page |
| `/onboarding` | **MISSING** | ❌ No onboarding route or page |
| `/recommendations` | **MISSING** | ❌ No dedicated page |
| `/my-learning` | **MISSING** | ❌ No dedicated page |
| `/features` | maps to `Home.jsx` | ⚠️ Hack redirect |
| `/admin` | `pages/admin/Dashboard.jsx` | ✅ Admin section exists |

### CSS / Design System
- **Multiple competing CSS files**: `index.css` (48KB!), `public.css`, `auth.css`, `auth-theme.css`, `auth-reference.css`, `design-system.css`, `green-overrides.css`
- **Root CSS variables declare dark theme**: `--paper:#0b1020` (dark navy), then OVERRIDDEN lower in same file to light theme: `--paper:#f8faff`
- **Active color palette**: Blue/purple (`#3158c8`, `#7357d8`) — NOT the green brand specified in product vision
- **`green-overrides.css`**: A partial attempt at green branding that is not applied globally
- **TailwindCSS is installed but minimally used** — only `Sidebar.jsx` uses Tailwind classes
- **Design inconsistency**: Sidebar component uses Tailwind (`bg-emerald-500`), rest uses custom CSS vars with blue/purple

### Components
```
components/
├── common/
│   ├── AppShell.jsx       ✅ Layout wrapper with sidebar
│   ├── AppErrorBoundary.jsx ✅
│   ├── ProtectedRoute.jsx  ✅
│   ├── AdminRoute.jsx      ✅
│   ├── Navbar.jsx          ✅
│   ├── Sidebar.jsx         ⚠️ Unused (AppShell has inline sidebar)
│   ├── Button.jsx          ✅ (but app doesn't use it)
│   ├── Loader.jsx          ✅ (but app doesn't use it)
│   └── Modal.jsx           ✅ (but app doesn't use it)
├── public/
│   ├── PublicLayout.jsx    ✅
│   └── AuthPrompt.jsx      ✅
├── dashboard/
│   ├── RecommendationCard.jsx ✅
│   ├── LearningPathCard.jsx   ✅ (imported nowhere in codebase)
│   ├── ProgressCard.jsx       ✅ (imported nowhere)
│   ├── SkillCard.jsx          ✅ (imported nowhere)
│   └── StatsCard.jsx          ✅ (imported nowhere)
├── ai/                     (empty or stub)
├── assessment/             (empty or stub)
├── learning/
│   └── Assessments.jsx    ⚠️ Lives in components not pages
└── ui/                    (empty or stub)
```

### State Management (Redux)
| Slice | Status |
|-------|--------|
| `authSlice.js` | ✅ Full auth state, token handling |
| `aiSlice.js` | ⚠️ Defined but no page uses dispatch from it |
| `courseSlice.js` | ⚠️ Defined but no page uses it |
| `learningPathSlice.js` | ⚠️ Defined but pages use direct API calls instead |
| `recommendationSlice.js` | ⚠️ Defined but pages use direct API calls |
| `userSlice.js` | ⚠️ Defined but pages use direct API calls |

### Services (Frontend)
| File | Status |
|------|--------|
| `api.js` | ✅ Axios with auto-refresh |
| `auth.service.js` | ✅ (minimal wrapper) |
| `ai.service.js` | ⚠️ 190-byte stub |
| `recommendation.service.js` | ⚠️ 196-byte stub |
| `assessment.service.js` | ❌ Empty (0 bytes) |
| `course.service.js` | ❌ Empty (0 bytes) |
| `learningPath.service.js` | ❌ Empty (0 bytes) |
| `user.service.js` | ❌ Empty (0 bytes) |

---

## 3. Backend Structure

**Framework**: Node.js + Express 4, Mongoose 8, MongoDB Atlas  
**Package name**: `cortexcrew-backend` (not CodexCrue)

### API Routes
| Route | Controller | Status |
|-------|-----------|--------|
| `POST /api/auth/register` | auth.controller | ✅ Sends OTP email |
| `POST /api/auth/verify-otp` | auth.controller | ✅ Verifies OTP, creates session |
| `POST /api/auth/verify-email` | auth.controller | ✅ Alias for verify-otp |
| `POST /api/auth/login` | auth.controller | ✅ JWT + refresh cookie |
| `POST /api/auth/logout` | auth.controller | ✅ Revokes session |
| `GET /api/auth/me` | auth.controller | ✅ Returns auth user |
| `POST /api/auth/refresh` | auth.controller | ✅ Token refresh |
| `POST /api/auth/forgot-password` | auth.controller | ✅ Reset token email |
| `POST /api/auth/reset-password/:token` | auth.controller | ✅ Resets password |
| `GET /api/recommendations` | recommendation.controller | ✅ Full ML pipeline |
| `POST /api/ai/chat` | ai.controller | ✅ Gemini 2.5 Flash |
| `GET /api/ai/history` | ai.controller | ✅ Chat history |
| `DELETE /api/ai/history` | ai.controller | ✅ Clear history |
| `GET /api/skills/gap` | skillGap.controller | ✅ |
| `GET /api/skills` | skill.controller | ✅ |
| `GET /api/learning-path` | learningPath.controller | ✅ |
| `POST /api/learning-path/generate` | learningPath.controller | ✅ |
| `GET /api/goals` | goal.controller | ✅ |
| `POST /api/goals` | goal.controller | ✅ |
| `PUT /api/goals` | goal.controller | ✅ |
| `GET /api/profile` | profile.controller | ✅ |
| `PUT /api/profile` | profile.controller | ✅ |
| `GET /api/progress` | progress.controller | ✅ |
| `POST /api/progress/session` | progress.controller | ✅ |
| `GET /api/courses` | course.controller | ✅ |
| `GET /api/courses/:id` | course.controller | ✅ |
| `GET /api/assessments` | assessment.controller | ✅ |
| `POST /api/feedback` | feedback.controller | ✅ |
| `GET /api/users` | user.controller | ✅ |
| `GET /api/admin/*` | admin.controller | ✅ |

### Database Models
| Model | Fields | Status |
|-------|--------|--------|
| `User` | name, email, password, role, isVerified, otp, resetPasswordToken | ✅ |
| `Profile` | userId, learningGoal, careerGoal, currentSkills, experienceLevel, interests, preferredLanguage | ✅ |
| `Goal` | userId, title, careerTarget, weeklyLearningHours, targetDate, progress | ✅ |
| `Course` | title, description, provider, skills, difficulty, isFree, sourceUrl, contentType | ✅ |
| `LearningPath` | userId, goal, milestones[], overallProgress, status | ✅ |
| `Progress` | userId, courseId, status, completionPercentage, studyMinutes | ✅ |
| `Assessment` | courseId, questions[], difficulty | ✅ |
| `AssessmentAttempt` | userId, assessmentId, score, answers[] | ✅ |
| `ChatHistory` | userId, messages[] | ✅ |
| `Recommendation` | userId, courseId, score, explanation, rank | ✅ |
| `Feedback` | userId, targetType, targetId, rating, sentiment | ✅ |
| `Session` | userId, tokenHash, expiresAt, revokedAt | ✅ |
| `Skill` | name, category | ✅ |
| `Reward` | userId, points, badges[] | ✅ |
| `LearningResource` | title, url, type | ✅ |
| `StudySession` | userId, courseId, durationMinutes | ✅ |

---

## 4. Authentication Flow (Current)

```
Register → POST /api/auth/register
         → OTP sent via email (Gmail App Password)
         → UI shows OTP input field
         
Verify   → POST /api/auth/verify-otp
         → Sets isVerified = true
         → Creates Session, returns JWT access token
         → Frontend stores in localStorage as 'cortex_token'
         
Login    → POST /api/auth/login
         → Checks isVerified
         → Creates Session, returns JWT
         → Refresh token in httpOnly cookie 'codex_refresh_token'
         
Auth State → Redux authSlice
           → initializeAuth() calls GET /api/auth/me on app boot
           → Auto-refresh via axios interceptor on 401
```

**Issues**:
- After register+verify, user goes directly to `/dashboard` — skips onboarding
- No `isOnboardingComplete` flag on User or Profile model
- Login does not check if profile/goal exists before sending to dashboard

---

## 5. AI Implementation

**Provider**: Google Gemini 2.5 Flash  
**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`  
**Key**: Stored in `.env` as `AI_API_KEY`  
**Context**: `aiContext.service.js` builds system prompt with user profile + learning path  
**History**: Stored in MongoDB `ChatHistory` model  
**Route**: `POST /api/ai/chat` (protected, rate-limited)

**Status**: ✅ Real AI — NOT fake. Fully connected.

---

## 6. ML Recommendation Implementation

**Type**: TF-IDF cosine similarity via scikit-learn  
**Service**: FastAPI (Python) on port 8000  
**Model file**: `ml-service/models/tfidf_vectorizer.pkl` (360KB)  
**Training data**: `ml-service/data/train.csv` (59MB), `test.csv` (5MB)

**Flow**:
```
Backend collects available published free courses from MongoDB
→ Sends to ML service POST /recommend (or /predict)
→ ML service vectorizes query: "goal + skills + review"
→ Cosine similarity against course corpus
→ Returns: [{courseId, score, explanation}]
→ Backend maps courseId back to full Course documents
→ Also applies: LLM re-ranking (Gemini), feedback signals, diversity filter
→ Stores results in Recommendation model
```

**Status**: ✅ Real ML — NOT fake. Uses actual TF-IDF vectorizer.  
**Issue**: ML service URL is set TWICE in `.env` (lines 5 and 18), second one wins.

---

## 7. Current Problems

### Critical
1. **No Onboarding page** — users go directly from registration to dashboard
2. **Brand mismatch** — backend/frontend package names say "CortexCrew", app says "CodexCrue"
3. **`constants.js` says `APP_NAME = 'CortexCrew'`** — wrong name everywhere
4. **CORS mismatch** — backend CORS allows `http://localhost:3000` but Vite dev server runs on port 5173
5. **Duplicate ML_SERVICE_URL** in `.env` — line 5 sets `http://localhost:8000/recommend`, line 18 sets `http://127.0.0.1:8000`

### Design
6. **Purple/blue color scheme** — not green as required (only partial `green-overrides.css` exists)
7. **Multiple competing CSS files** — 48KB `index.css` with contradictory `:root` definitions (dark vars then immediately overridden with light vars in the same file)
8. **`Sidebar.jsx` uses Tailwind classes** (`bg-emerald-500`) while the rest uses custom CSS — two design systems fighting each other
9. **`Sidebar.jsx` is defined but never used** — `AppShell.jsx` has its own inline sidebar
10. **Multiple unused dashboard components**: `LearningPathCard`, `ProgressCard`, `SkillCard`, `StatsCard` — imported nowhere

### Routing
11. **`/features` maps to `<Home />`** — not a separate page (acceptable but sloppy)
12. **`/my-goal` and `/goal` both exist** — duplicate routes for same component
13. **`/settings` maps to `<Profile />`** — no dedicated settings page
14. **Missing `/onboarding` route**
15. **Missing `/my-learning` route**
16. **Missing `/recommendations` route**
17. **Assessments page lives in `components/learning/`** not `pages/` like everything else

### Services
18. **4 frontend service files are empty** (0 bytes): `assessment.service.js`, `course.service.js`, `learningPath.service.js`, `user.service.js`
19. **Redux slices defined but not used** — pages make direct API calls, ignoring slice actions
20. **`ai-service/` directory has only a `prompts/` folder** — no code at all

### Backend
21. **`app.js` health check says `CortexCrew Backend API`** — wrong name
22. **`Backend/src/config/env.js` references `cortexcrew` in default MongoDB URI**
23. **Missing onboarding endpoint** to mark profile as "onboarded"

### Frontend pages
24. **All pages are severely minified/inline** — `Home.jsx` is 14 lines (4KB), everything jammed into one-liners. Impossible to maintain.
25. **`SkillGap.jsx` is 6 lines** of dense minified JSX — major readability issue
26. **`AIAssistant.jsx` is 12 lines** — all inline
27. **`Register.jsx` is 21 lines** — all state/logic crammed into one-liners

---

## 8. Duplicate / Unused Components

### Unused (never imported):
- `components/common/Sidebar.jsx` — replaced by inline sidebar in AppShell
- `components/common/Button.jsx` — app uses raw `<button>` with CSS classes
- `components/common/Loader.jsx` — not used
- `components/common/Modal.jsx` — not used
- `components/dashboard/LearningPathCard.jsx`
- `components/dashboard/ProgressCard.jsx`
- `components/dashboard/SkillCard.jsx`
- `components/dashboard/StatsCard.jsx`
- `pages/admin/Assessments.jsx`
- `pages/admin/LearningPaths.jsx`
- `pages/admin/Rebommendations.jsx` (typo in filename!)

### Empty services:
- `frontend/src/services/assessment.service.js`
- `frontend/src/services/course.service.js`
- `frontend/src/services/learningPath.service.js`
- `frontend/src/services/user.service.js`

---

## 9. Proposed Architecture (Post-Refactor)

### Frontend
- **Single CSS system**: Replace all CSS files with one unified `index.css` using green brand (#16A34A)
- **Remove TailwindCSS** from Sidebar (or migrate everything to Tailwind — pick one)
- **Add `/onboarding` page** — multi-step wizard
- **Add `/my-learning` page** — active enrollments
- **Add `/recommendations` page** — dedicated recommendations view
- **Fix `/features`, `/how-it-works` routes** — real anchor sections on Home
- **Proper sidebar** per spec: Dashboard, My Learning, Learning Path, Recommendations, Skill Gap, AI Assistant, Assessments, Progress + Profile/Settings/Logout
- **Onboarding guard** in ProtectedRoute or separate middleware

### Backend
- **Add `isOnboarded` field to Profile** (or `onboardingCompletedAt`)
- **Add `POST /api/profile/onboarding` endpoint** to save onboarding data and mark complete
- **Fix CORS origin** to include both `3000` and `5173`
- **Fix brand name** in health check and config defaults

### ML Service
- **Status**: Working — preserve as-is
- Fix duplicate env var in `.env`

---

## 10. Environment Variables Required

### Backend (`Backend/.env`)
| Variable | Purpose | Status |
|----------|---------|--------|
| `PORT` | Server port (5000) | ✅ |
| `MONGO_URI` | MongoDB Atlas connection | ✅ |
| `JWT_SECRET` | Access token signing | ✅ |
| `JWT_REFRESH_SECRET` | Refresh token signing | ✅ |
| `ML_SERVICE_URL` | ML FastAPI URL | ⚠️ Duplicated |
| `EMAIL_USER` | Gmail sender | ✅ |
| `EMAIL_PASS` | Gmail app password | ✅ |
| `AI_API_URL` | Gemini endpoint | ✅ |
| `AI_API_KEY` | Gemini API key | ✅ |
| `AI_MODEL` | Model name | ✅ |
| `CORS_ORIGIN` | Frontend origin | ⚠️ Only port 3000, needs 5173 |
| `YOUTUBE_API_KEY` | YouTube discovery | ✅ |
| `CLOUDINARY_*` | Avatar uploads | ✅ |

### Frontend (`frontend/.env`)
| Variable | Purpose | Status |
|----------|---------|--------|
| `VITE_API_BASE_URL` | Backend API URL | ⚠️ Falls back to localhost:5000 |

### ML Service (`ml-service/.env`)
| Variable | Purpose | Status |
|----------|---------|--------|
| `MODEL_PATH` | Path to vectorizer .pkl | ✅ |
| `MODEL_VERSION` | Version string | ✅ |

---

## 11. Implementation Plan

### Phase 0: Safety fixes (no functionality changes)
- Fix CORS to allow port 5173
- Fix duplicate ML_SERVICE_URL in .env
- Fix brand name strings (CortexCrew → CodexCrue)
- Fix `constants.js` APP_NAME

### Phase 1: Add Onboarding
- Add `isOnboarded` to Profile model
- Add `POST /api/profile/onboarding` endpoint  
- Create `/onboarding` page (multi-step)
- Guard: after login, if !profile.isOnboarded → redirect to /onboarding

### Phase 2: Design System Overhaul
- Consolidate all CSS into one clean file with green (#16A34A) branding
- Remove dead CSS variables (dark theme remnants)
- Fix sidebar to match spec (with icons, proper nav items)
- Remove Tailwind from Sidebar.jsx or migrate everything

### Phase 3: Fix Routing
- Add missing routes: /onboarding, /my-learning, /recommendations
- Remove duplicate /my-goal route
- Fix /features to properly scroll to Home sections

### Phase 4: Clean Up
- Remove unused components
- Remove empty service files or implement them
- Fix minified pages — make them readable

### Phase 5: Home Page Redesign
- Green brand, proper hero with learning path visual
- All 8 sections as specified

### Phase 6: Sidebar & Dashboard
- Match sidebar spec exactly
- Simplify dashboard to match product vision

---

## 12. Commands to Run

### Frontend
```bash
cd frontend
npm install
npm run dev        # Starts Vite dev server (usually port 5173)
```

### Backend
```bash
cd Backend
npm install
npm run dev        # Starts nodemon (port 5000)
```

### ML Service
```bash
cd ml-service
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

---

## 13. Known Issues (Pre-Refactor)

| # | Issue | Severity |
|---|-------|----------|
| 1 | No /onboarding flow — users land on complex dashboard | HIGH |
| 2 | Purple/blue brand, not green | HIGH |
| 3 | CORS mismatch port 3000 vs 5173 | HIGH |
| 4 | 6 empty/stub service files | MEDIUM |
| 5 | 5 unused Redux slices | LOW |
| 6 | 8 unused components | LOW |
| 7 | All pages severely minified/unreadable | MEDIUM |
| 8 | Typo in admin page filename (Rebommendations) | LOW |
| 9 | /settings maps to /profile | LOW |
| 10 | APP_NAME = 'CortexCrew' in constants.js | MEDIUM |
| 11 | Duplicate ML_SERVICE_URL env var | MEDIUM |
| 12 | Dark theme CSS vars declared then immediately overridden | LOW |
