# FAS Job Flow 🚀

FAS Job Flow is an internal platform for **managing and routing job requests in real time**. It helps teams create, track, and resolve tasks like maintenance, IT support, logistics, and procurement, all with transparency and accountability.

---

## 📌 Vision

Build a versatile platform that makes internal operations smoother and more efficient across sectors like education, healthcare, finance, logistics, retail, government, and NGOs.

---

## ✨ Core Features (MVP)

* Submit and track job requests in real time
* GraphQL API with filtering and subscriptions
* Notifications (in-app and email)
* Status workflow: Pending → Accepted → In Progress → Completed
* Role-based access control (Requester, Resolver, Supervisor)
* Complete audit trail of actions
* Secure authentication using JWT + bcrypt
* AI-assisted job routing (planned for post-MVP)

---

## 🛠 Tech Stack

* **Backend:** NestJS (TypeScript), GraphQL (Apollo), MongoDB (Mongoose)
* **Frontend:** React (Vite, TypeScript, TailwindCSS, Apollo Client)
* **Authentication:** JWT with role-based access
* **Database:** MongoDB (Atlas for production, Docker for local development)
* **DevOps:** Docker, GitHub Actions (CI/CD), multi-stage builds
* **Testing:** Jest (backend), Vitest + React Testing Library (frontend)

---

## 🌿 Branch Strategy

I follow a **trunk-based branching model** with protected branches:

* `main` → Always production-ready
* `dev` → Integration/staging branch
* `feature/*` → New features, merged into `dev`
* `hotfix/*` → Urgent fixes, merged directly into `main`

### 🔒 Branch Protection

**main branch:**

* Pull request reviews required
* All status checks must pass
* No direct pushes
* Enforce linear history

**dev branch:**

* PR reviews required
* Squash merges only
* All checks must pass

---

## 📝 Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

* `feat:` → New feature
* `fix:` → Bug fix
* `chore:` → Tooling/config updates
* `docs:` → Documentation changes
* `test:` → Adding/updating tests
* `refactor:` → Code changes that are not fixes or features

**Examples:**

```bash
feat(auth): add JWT authentication
fix(job): handle null pointer in job resolver
docs(readme): update setup instructions
```

---

## ✅ Getting Started

### Clone the repo

```bash
git clone https://github.com/FAS2024/fas-jobflow.git
cd fas_jobflow
```

### Create branches

```bash
git checkout -b dev
git push -u origin dev

git checkout -b feature/auth-service
git push -u origin feature/auth-service
```

### Workflow

1. Branch from `dev`
2. Commit changes using Conventional Commits
3. Push and open a PR to `dev`
4. Merge `dev` into `main` after testing

---

## 🚀 Deployment

* **Staging:** Automatically deploys from `dev`
* **Production:** Automatically deploys from `main`
* Secrets are managed via GitHub Actions and environment variables

---

## 🔍 Testing

* **Backend:** Jest unit and integration tests
* **Frontend:** Vitest/Jest + React Testing Library
* CI/CD prevents merging if tests fail

---

## 📄 Documentation

* GraphQL Playground (auto-generated)
* Architecture Decision Records (ADRs)
* `README.md` for setup and deployment
* PR and contribution guidelines

---

## 👥 Developer
Fatai Ayinla Sunmonu (FAS)



---

## 📜 License

This project is proprietary and for internal use within FAS only. Unauthorized copying, distribution, or modification is prohibited.
