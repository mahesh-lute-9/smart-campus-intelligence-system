# Smart Campus Intelligence System

Production-style, multi-tenant campus intelligence platform built with Flask, PostgreSQL, and Render. The system combines role-based dashboards, placement-readiness analytics, AI advising, tenant isolation, audit logging, CSV operations, and production health checks into one portfolio-grade SaaS case study.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB)
![Flask](https://img.shields.io/badge/Flask-3.1-000000)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-4169E1)
![Tests](https://img.shields.io/badge/pytest-85%20passing-2EA44F)
![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7)

## Why This Project Exists

Most campus apps are CRUD portals. This project is designed like a real SaaS product: each institution has isolated data, admins can audit sensitive actions, faculty can identify at-risk students, and students get personalized placement-readiness guidance.

It is intentionally scoped as a portfolio and resume project for backend/product engineering interviews, especially companies that value production thinking: reliability, security, architecture, testing, deployment, and tradeoff awareness.

## Engineering Highlights

| Area | Implementation |
| --- | --- |
| Multi-tenancy | Shared-schema SaaS model with `institutions`, `institution_id` scoping, tenant-aware auth payloads, and tenant isolation regression tests |
| Auth & Security | JWT via Bearer/cookie, bcrypt, OTP reset, token blacklist, timing-safe login, rate limiting, secure headers, proxy-aware cookies |
| Data Platform | PostgreSQL, migration runner, connection pooling, schema hardening, tenant-aware uniqueness constraints, database-backed media storage |
| Student Success | Readiness scoring, placement prediction, attendance, marks, mock tests, skills, goals, wellbeing, peer learning |
| AI | Gemini-backed student advisor and faculty insights, feature-gated by institution plan with safe fallback behavior |
| Enterprise Ops | Health checks, structured logging, request IDs, audit logs, CSV exports/imports, async report-job simulation |
| Deployment | Render Blueprint with managed PostgreSQL, Gunicorn, SSL DB mode, strict startup validation |
| Testing | 85 automated tests covering auth, readiness, tenant hardening, health endpoints, media storage, AI helpers, peer learning, and company matching |

## Architecture

```text
Browser / Jinja UI / Vanilla JS
        |
        v
Flask Blueprints
        |
        v
Service Layer
        |
        v
PostgreSQL with migrations + pooled connections
```

Tenant context is resolved from subdomain/header/body for public auth flows, then enforced from the authenticated JWT institution for protected APIs. This prevents one campus from reading or mutating another campus's data.

Read the full architecture write-up: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Key Features

- Student dashboard with placement-readiness score, trend insights, goals, alerts, and company matching.
- Faculty dashboard with class analytics, at-risk watchlist, interventions, classroom marks, and attendance management.
- Admin dashboard with users, departments, subjects, CSV exports/imports, audit logs, institution context, and async report jobs.
- Super-admin institution management for SaaS onboarding.
- Authenticated media upload/download APIs that store file bytes in PostgreSQL for Render-safe persistence.
- AI assistant for student advice and faculty class insights, gated by plan tier.
- Production health endpoints: `/health/live`, `/health/ready`, `/health/startup`.

## API Examples

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/login` | Login and receive JWT/cookie |
| `GET` | `/student/dashboard` | Student readiness dashboard |
| `GET` | `/faculty/summary` | Faculty class summary |
| `GET` | `/admin/exports/students` | Tenant-scoped CSV export |
| `POST` | `/admin/imports/students` | Tenant-scoped CSV import |
| `GET` | `/admin/audit-logs` | Sensitive action audit trail |
| `POST` | `/admin/reports/jobs` | Start async report job |
| `POST` | `/media/upload` | Upload authenticated user media into PostgreSQL |
| `GET` | `/media/<file_id>` | Download an accessible uploaded file |
| `GET` | `/health/ready` | Readiness probe with DB check |

## Local Development

Prerequisites:

- Python 3.11+
- PostgreSQL 14+

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

Seed demo data:

```bash
python scripts/seed_data.py
```

Run tests:

```bash
pytest -q
```

Current baseline: `85 passed`.

## Render Deployment

This repo includes `render.yaml` for one-click deployment:

- Web service: Gunicorn via `wsgi:application`
- Database: Render managed PostgreSQL
- Health check: `/health/ready`
- Media: uploaded bytes are stored in PostgreSQL, not ephemeral Render disk
- Production env: `STRICT_STARTUP_VALIDATION=true`, `DB_SSL_MODE=require`, secure cookies

Deployment and demo guidance: [docs/DEMO.md](docs/DEMO.md)

## Resume Bullets

- Built a production-style multi-tenant campus intelligence SaaS using Flask, PostgreSQL, JWT auth, and Render, supporting role-based dashboards for admins, faculty, and students.
- Implemented tenant isolation across protected APIs with institution-scoped data access, feature gating, audit logs, and regression tests to prevent cross-campus data leakage.
- Designed placement-readiness analytics using attendance, marks, skills, mock tests, goals, and AI-assisted advising to identify at-risk and placement-ready students.
- Added production hardening with migrations, connection pooling, secure headers, rate limiting, health checks, CSV/media operations, async report jobs, and 85 automated tests.

## Honest Scope

This is a strong portfolio/pilot-grade SaaS prototype, not a full enterprise SIS replacement. The next real production steps would be SSO, object storage, deeper audit coverage, backup/restore policy, observability dashboards, and integrations with existing SIS/LMS platforms.

## License

MIT. See [LICENSE](LICENSE).
