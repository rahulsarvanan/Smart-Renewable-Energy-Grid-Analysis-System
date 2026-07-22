---
description: Security rules
globs: ["*"]
---

Never expose:

- API Keys
- Supabase Service Key
- Gemini API Key

Always:

- Validate inputs
- Sanitize outputs
- Use HTTPS
- Store secrets in .env
