# CortexCrew — Phase 1 Repository Audit

**Audit date:** 2026-08-21  
**Scope:** Repository source, configuration, dependency manifests, persisted model artifacts, and available frontend/backend/ML flows.  
**Constraint:** This phase is an audit only. No product features or fixes were implemented.

## Executive summary

CortexCrew has the outline of a personalized learning platform, but it is not currently a coherent runnable system. The repository contains four conceptual layers—React frontend, Node/Express API, Python ML service, and an `ai-service` prompt folder—plus MongoDB and Redis configuration. In practice, the layers are only partially integrated.

The most urgent issues are:

1. The documented/runtime paths are inconsistent (`Backend/` exists, while scripts and Docker use `backend/`), and Docker references missing Dockerfiles.
2. The learning-path generation route calls `learningPathService.createPath`, which does not exist.
3. Assessment submission calls the service with the wrong argument shape, so user identity is lost and evaluation is broken.
4. The ML service has competing entrypoints; the active `/predict` path uses a hard-coded three-course mock catalog, while the advertised model files and training CSVs are not used. The claimed 99.71% accuracy is an unsupported hard-coded label.
5. The frontend build succeeds, but most learner and admin pages are placeholders, and several service modules are empty.
6. Authentication, validation, secrets, OTP handling, rate limiting, and production configuration are not sufficient for a real deployment.

## 1. Architecture findings

### Current shape

- **Frontend:** React 18 + Vite + Redux Toolkit + React Router. API calls use Axios and a browser `localStorage` JWT.
- **Backend:** Node/Express + Mongoose. Routes/controllers/services/models are separated conceptually. MongoDB is required at startup; Redis is initialized as a side effect when its config module is imported.
- **ML:** FastAPI code exists in both `ml-service/main.py` and `ml-service/app.py`. `app.py` includes `/predict` through `api/routes.py`; `main.py` separately exposes `/recommend` with a different request/response contract.
- **AI:** `ai-service/` contains prompt files and Python helper modules, but no API server, dependency manifest, or backend integration. The backend AI service returns a template string.
- **Data:** MongoDB models cover users, profiles, courses, paths, progress, assessments, feedback, recommendations, and chat history. No migrations, seed scripts, or operational database workflow are present in the actual repository tree.
- **Operations:** `docker-compose.yml` declares MongoDB, Redis, backend, and ML services, but build paths are inconsistent with the repository and required Dockerfiles are absent.

### Main request flow

1. React authenticates against `/api/auth/login` and stores a token in `localStorage`.
2. Protected requests attach that token as a Bearer header.
3. Express verifies the JWT and routes to services.
4. Recommendation requests call `http://localhost:8000/predict`.
5. The ML service ranks its in-memory mock courses and returns IDs that are not expected to exist in the MongoDB course collection.
6. The backend attempts to enrich those IDs from MongoDB and falls back to a fabricated recommendation if the ML request fails.

This means the apparent microservice architecture is present structurally, but the end-to-end data contract is not reliable.

## 2. Critical problems

### P0 — system cannot be deployed through the declared Docker workflow

- `docker-compose.yml` uses `./backend`, but the repository directory is `Backend`.
- It declares `build: ./backend` and `build: ./ml-service`, but no Dockerfiles exist in either directory.
- Root scripts also use lowercase `backend` (`dev:backend`, `install:all`), so the documented commands do not match the checked-in layout.
- The root package is named `cortexcrew`, while the product and backend descriptions alternate between CortexCrew and CodexCrew.

### P0 — learning-path generation is broken at runtime

- `Backend/src/controllers/learningPath.controller.js` calls `learningPathService.createPath(...)`.
- `Backend/src/services/learningPath.service.js` defines `generateAndSavePath(...)`, not `createPath(...)`.
- The implemented generator is therefore unreachable from the route and the route will produce a `TypeError`.

### P0 — assessment submission is broken and unsafe

- `assessment.controller.js` calls `evaluateAssessment(req.params.id, answers)`.
- `assessment.service.js` expects `(userId, assessmentId, answers)`.
- The controller passes the assessment ID as the user ID, the answers array as the assessment ID, and leaves answers undefined.
- There is no assessment-attempt model, no ownership check, no answer-shape validation, and questions expose `correctAnswer` through the GET endpoint.

### P0 — authentication implementations conflict

- `Backend/src/services/auth.service.js` implements one auth flow using `bcrypt`, role-bearing JWTs, and a long default secret.
- `Backend/src/controllers/auth.controller.js` implements a second flow using `bcryptjs`, OTP email verification, and JWTs containing only `id`.
- The routes use the controller implementation, while the service implementation is unused.
- JWT fallback secrets differ (`super_secure...` versus `secret`), and OTP verification tokens omit `role`; downstream admin authorization will not work consistently.

### P1 — ML endpoint is not a real model-backed recommender

- `ml-service/app.py` serves `/predict`, but `src/inference.py` uses three hard-coded mock courses.
- `train.csv`, `test.csv`, and the `.pkl` artifacts are not loaded by the active inference path.
- The response IDs are fixed fake ObjectIds, so MongoDB enrichment normally returns no course.
- `ml-service/main.py` separately serves `/recommend` and contains hand-written overlap scoring. This creates two incompatible APIs and two definitions of “the model.”
- The `99.71%` accuracy/precision label is hard-coded in the API and comments; no evaluation code, metric definition, split, baseline, or reproducible experiment supports it.

### P1 — recommendation fallback hides outages and produces false data

`recommendation.service.js` catches every ML/integration error and returns a fabricated score of `0.92`. Users and operators cannot distinguish a valid recommendation from an ML outage, and errors are not surfaced with a degraded-service status.

## 3. Missing features

### Product functionality

- Real dashboard aggregation and learner-specific statistics.
- Profile onboarding and profile editing UI wired to `/api/profile`.
- Learning-path generation UI and route integration.
- Skill-gap UI wired to `/api/skills/gap`; current backend required skills are hard-coded to Java/Spring Boot regardless of the learner goal.
- AI assistant chat window wired to the page; the page is currently a placeholder.
- Assessment listing, attempt persistence, answer submission, result history, and secure scoring.
- Progress tracking UI and course enrollment/completion behavior.
- Recommendation acceptance/feedback loop and persisted recommendation records.
- Admin routing, role-aware navigation, CRUD operations, analytics, and moderation.
- Password reset flow; `ForgotPassword.jsx` exists but no corresponding backend route/service is present.
- OTP verification UI; registration redirects directly to login even though the active controller requires verification.

### Engineering foundations

- Automated tests (unit, integration, API, ML, and frontend).
- API schema/documentation generated from the actual routes.
- Environment templates and startup validation.
- Database seed/import scripts in the checked-in tree.
- Background job scheduler/worker; the job files only log messages and are never scheduled.
- Observability: structured request logs, metrics, traces, health checks for dependencies, and error correlation IDs.
- CI/CD, dependency scanning, secret scanning, and reproducible model build/deployment.

## 4. ML problems

- **No production data path:** inference ignores MongoDB courses and the provided CSV/model artifacts.
- **Mock catalog:** only three hard-coded courses are ranked.
- **Broken model claims:** accuracy is presented as a constant and is not tied to a measured validation result.
- **Contract mismatch:** `/predict` accepts goal/skills/review but ignores `userId` and `completedCourses`; `main.py` exposes a different payload (`user_skills`, `target_skills`, `available_courses`).
- **Recommendation quality:** current TF-IDF similarity has no target-skill taxonomy, prerequisite graph, completion filtering, diversity, freshness, difficulty calibration, or cold-start strategy.
- **Ranking bug risk:** `src/ranking.py` annotates with `np.ndarray` without importing NumPy. Depending on Python evaluation behavior/version, importing that module can fail before serving inference.
- **No model lifecycle:** no training command wired to deployment, artifact versioning, feature/schema version, model checksum, canary/rollback strategy, or drift monitoring.
- **No evaluation discipline:** no precision@k/recall@k/NDCG, coverage, calibration, popularity-bias, fairness, or offline/online experiment framework.
- **Explainability is synthetic:** explanations are template strings based on the request, not evidence from ranked features or course content.

## 5. UI problems

- Production build passes, but build success is not feature completeness.
- `Dashboard.jsx`, `LearningPath.jsx`, and `AIAssistant.jsx` are static placeholder pages.
- The application does not register assessment, progress, admin, forgot-password, or OTP routes even though corresponding files exist.
- Admin pages exist on disk but are unreachable from `App.jsx`; there is no role-aware route guard.
- `Courses.jsx` displays a loading message for both loading and empty/error states, has no error state, and its “Enroll Now” button has no handler.
- Redux slices generally implement only fulfilled cases; pending and rejected states are not reflected in UI.
- Several frontend service files are empty (`assessment.service.js`, `course.service.js`, `learningPath.service.js`, `user.service.js`), while slices duplicate API logic.
- Token persistence in `localStorage` increases XSS impact; there is no logout request, token refresh, session rehydration/user fetch, or 401 interceptor.
- API base URL is hard-coded to `http://localhost:5000/api`; Vite’s proxy is configured but bypassed by the absolute URL and uses port 3000 while common Vite expectations/docs may assume 5173.
- Styling is mostly presentational scaffolding; accessibility, responsive mobile navigation, form validation feedback, skeleton/error states, and keyboard/focus behavior are incomplete.
- There are naming/encoding quality issues such as `Rebommendations.jsx` and visibly corrupted bullet characters in auth placeholders.

## 6. Security problems

### High severity

- A static JWT secret is committed in `docker-compose.yml`, and identical fallback secrets are embedded in source code.
- Registration accepts no role in the active controller, which is safer than the unused service, but the duplicate auth paths create uncertainty and should be consolidated before authorization is trusted.
- JWTs are stored in `localStorage`, making token theft straightforward if an XSS vulnerability is introduced.
- No rate limiting or account lockout exists for login, OTP verification, AI chat, uploads, or feedback.
- OTP generation uses `Math.random()`, stores OTP values in plaintext, and has no attempt counter or resend throttling.

### Medium severity

- CORS is hard-coded to one localhost origin in Express and wildcarded with credentials in the ML service. The ML service should not be publicly browser-accessible and must not use `allow_origins=["*"]` with credentials.
- No request-body size limits, security headers beyond Helmet defaults, CSRF strategy, input sanitization, or robust schema validation is wired into routes. Validators exist but are not attached.
- Error handling returns raw error messages and logs full stacks; production logging may disclose implementation details or sensitive values.
- Avatar upload relies on environment credentials but has no explicit file-size limit, MIME/content validation, abuse controls, or delete/replace lifecycle.
- Assessment GET returns correct answers, allowing clients to cheat.
- AI chat echoes user input in a generated response and has no prompt/content policy, token budget, abuse control, or privacy boundary.
- No authorization check verifies that users may access a specific assessment/course/path resource beyond route-level authentication.

## 7. Database problems

- MongoDB startup requires `MONGO_URI`, but there is no checked-in `.env.example`, schema migration strategy, readiness retry, or graceful shutdown.
- `Profile` requires `learningGoal` and `careerGoal`, but registration does not create a profile; most learner flows therefore depend on an unimplemented onboarding step.
- `LearningPath` has a `userId` index but no uniqueness constraint, while the service assumes one path per user. Concurrent generation can create duplicates.
- `Progress` has no compound unique index on `{ userId, courseId }`; concurrent upserts can create duplicate progress records.
- `Recommendation` has no lifecycle fields for model version, generated-at batch, rank position, expiry, acceptance timestamp, or feedback linkage. The service does not persist recommendations at all.
- `Assessment` stores answers and correct answers together in the same document and exposes them via learner reads.
- No assessment attempt/result collection means scores cannot be audited, retaken, compared, or tied to progress safely.
- `ChatHistory` is defined but unused; there is no retention, pagination, encryption, or deletion policy.
- Course `skills` are free-form strings while skill-gap logic uses case-normalized strings and hard-coded taxonomies; aliases and relationships will drift.
- `Course.find(filter)` passes arbitrary query parameters directly into MongoDB. This enables unbounded queries and makes the API contract/data types implicit.
- Missing indexes are likely for common queries such as course status/category/skills combinations, feedback target, and assessment course.
- No referential cleanup policy exists for deleted users/courses, so orphaned paths, progress, feedback, and recommendations are possible.

## 8. Recommended implementation order

### Phase 1 — make the system deterministic and runnable

1. Standardize the directory name and commands (`Backend` versus `backend`), add valid Dockerfiles, pin service versions, and add `.env.example` files.
2. Remove duplicate auth implementations; choose one controller/service flow, use one required JWT secret, include stable claims, and wire validation.
3. Fix runtime contract errors: learning-path method mismatch, assessment argument mismatch, undefined/empty frontend services, and ML entrypoint selection.
4. Add a single health/readiness contract that checks MongoDB, Redis, and ML dependencies without crashing or silently degrading.
5. Add linting, unit tests for services, API integration tests for auth/profile/path/progress/assessment, and a smoke test for the complete local stack.

### Phase 2 — establish secure domain foundations

6. Define the domain contracts and ownership rules: user/profile, course/catalog, skill taxonomy, path/milestones, progress, assessment attempts, recommendations, and feedback.
7. Add database indexes, uniqueness constraints, validation, seed data, migration/versioning practice, and safe course query filters.
8. Secure authentication and uploads: HttpOnly secure cookies or a documented token strategy, rate limits, password reset, hashed/expiring OTPs, CSRF posture, upload limits, and production CORS.
9. Implement real persistence for paths, progress, recommendations, feedback, chat history, and assessment attempts.

### Phase 3 — restore end-to-end learner functionality

10. Complete onboarding/profile flows and connect dashboard, profile, skill-gap, path generation, courses, progress, and assessment UI to the API.
11. Add route coverage and role-aware admin screens; make every loading, empty, error, and unauthorized state explicit.
12. Replace duplicated frontend API logic with a consistent service/query layer and add 401/session handling.

### Phase 4 — replace the ML/AI demos with production services

13. Define one ML API and schema; load versioned artifacts or a reproducible retrieval/ranking pipeline; use real catalog data and valid MongoDB IDs.
14. Build offline evaluation and calibration before exposing accuracy claims. Track precision@k, recall@k, NDCG, coverage, cold-start behavior, and bias.
15. Add feature/model versioning, observability, timeouts, circuit breaking, explicit degraded responses, and feedback-driven retraining.
16. Integrate the AI service through a controlled backend boundary with prompt versioning, data minimization, moderation, usage limits, and auditable explanations.

### Phase 5 — operational readiness

17. Add scheduled workers for recommendations/analytics, metrics and alerts, backups/restore tests, CI/CD, dependency and secret scanning, and a production deployment runbook.

## Verification performed

- Frontend production build: **passes** (`vite build`).
- Backend Express app import: **passes** as a module-load smoke check; this does not exercise database startup or broken route execution.
- ML `app` import: **passes** in the current local Python environment; endpoint behavior and model quality remain unverified because no service integration test exists.
- No repository test suite was found.
- No implementation changes were made as part of this audit.

