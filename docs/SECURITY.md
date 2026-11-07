# Security

- Pairing codes are short-lived (5 minutes).
- Device tokens are hashed with SHA-256 and stored in SQLite.
- All requests require Bearer token.
- Actions are allowlisted; no arbitrary shell.
- Process spawning uses shell:false with validated paths.
- Rate limiting enabled.
- Critical actions require confirmation.