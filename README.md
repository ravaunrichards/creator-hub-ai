# Creator Hub AI

An original responsive AI assistant platform with accounts, persistent conversations, and a server-side AI API integration. It is a separate project and does not modify any other Creator Hub repository or deployment.

## Implemented in this release

- Responsive chat interface for Android, tablets, and desktop.
- Account registration/login with hashed passwords and HTTP-only session cookies.
- Create/select/rename/delete conversations and load saved message history.
- PostgreSQL persistence for users, conversations, and messages.
- Server-side OpenAI Responses API integration; the API key is never shipped to the browser.
- Basic validation, rate limiting, security headers, and ownership checks.
- Docker Compose, schema/migration, API notes, and automated tests.

## Honest scope note

This is a functional first release, not a claim that every ChatGPT feature is present. Voice calls, image generation, web search, file analysis, billing, team workspaces, and model training are not implemented yet. AI responses require a valid provider key and a model enabled for your account. No API key is included.

## Requirements

- Node.js 20+ and npm
- PostgreSQL 16+ or Docker
- An AI provider API key

## Start with Docker

1. Copy `.env.example` to `.env`.
2. Set a unique random `SESSION_SECRET` and `OPENAI_API_KEY`.
3. Set `OPENAI_MODEL` to a model available to your account.
4. Run `docker compose up --build`.
5. Open `http://localhost:3000`.

## Start locally

1. Create a PostgreSQL database/user.
2. Copy `.env.example` to `.env` and configure `DATABASE_URL`.
3. Run `npm install` and then `npm start`.
4. Open `http://localhost:3000`.

Run automated tests with `npm test`. Tests do not call the live AI API.

## Configuration

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port, default 3000 |
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Unique 32+ character signing secret |
| `OPENAI_API_KEY` | Server-only AI provider key |
| `OPENAI_MODEL` | Model available to the account, default `gpt-5` |
| `OPENAI_BASE_URL` | Optional compatible API endpoint |
| `COOKIE_SECURE` | Set `true` behind HTTPS |
| `ALLOWED_ORIGIN` | Optional exact browser origin if split-hosted |

## Production readiness

Before public launch, configure HTTPS, managed secrets, database backups, email verification and password reset, abuse controls, user quotas, privacy/retention policies, provider spend alerts, monitoring, and a security review. Never commit `.env`.

## Project map

- `frontend/`: responsive browser interface
- `backend/src/`: API, auth, persistence, AI integration
- `backend/test/`: validation tests
- `database/`: schema and initial migration
- `docs/`: API and security notes

Tests verify local validation logic; they do not prove live provider access or production deployment.
