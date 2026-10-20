# Security and production checklist

- Keep `.env` out of source control; the AI API key is server-only.
- Set a unique 32+ character `SESSION_SECRET`; use a secret manager in production.
- Use HTTPS and `COOKIE_SECURE=true` in production.
- Use same-origin hosting where possible. Review CORS and cookie behavior if split hosting is needed.
- Configure provider budgets and per-user quotas before public access.
- Add email verification, password reset, account recovery, anti-abuse controls, and support before launch.
- Add privacy notice, user export/deletion, retention rules, backups, restore tests, monitoring, and incident response.
- Conduct a production security review, including CSRF strategy.
- Do not log API keys, passwords, cookies, or conversation content.
