#!/bin/bash
set -e
echo "🚀 MASTER SETUP - KROK 1"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then exit 1; fi

bash setup-backend.sh
bash setup-frontend.sh
bash commit-changes.sh

echo "✅ ALL DONE! Run 'python app.py' in backend and 'npm run dev' in frontend."