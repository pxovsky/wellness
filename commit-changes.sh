#!/bin/bash
set -e
echo "📝 GIT COMMIT - AI-v1.0"
if [ ! -d .git ]; then echo "❌ Run git init first"; exit 1; fi
git add -A
git commit -m "AI-v1.0: Frontend-Backend Sync (KROK 1)

- Backend: Pydantic, Flask, SQLite
- Frontend: ApiClient, Async Storage, Sync
- MVP 100% Functional"
echo "✅ Commit AI-v1.0 created"
git log --oneline -1