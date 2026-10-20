# API overview

All endpoints are same-origin; authenticated endpoints use an HTTP-only session cookie.

- `GET /api/health` — database connectivity and AI-key configuration status (never exposes the key).
- `POST /api/auth/register` — `{ email, password, displayName }`
- `POST /api/auth/login` — `{ email, password }`
- `POST /api/auth/logout` — clears session.
- `GET /api/auth/me` — current account.
- `GET /api/conversations` — current user's latest 100 conversations.
- `POST /api/conversations` — create a conversation.
- `GET /api/conversations/:id/messages` — history for an owned conversation.
- `PATCH /api/conversations/:id` — `{ title }`
- `DELETE /api/conversations/:id` — deletes an owned conversation and its messages.
- `POST /api/chat` — `{ content, conversationId? }`; calls provider and persists the exchange.

Errors are JSON `{ "error": "..." }`. Ownership is checked server-side for conversation operations.
