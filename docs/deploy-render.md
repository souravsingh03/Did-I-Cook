Render deployment notes
======================

This document describes how to deploy `apps/api` (backend) and `apps/worker` (background worker) to Render using the repository `render.yaml` manifest.

Before you start
- Create accounts: Render and Vercel (frontend). If you choose Pinecone or another hosted vector DB, create that account too.
- Ensure your repository is pushed to GitHub and the `main` branch is up to date.

Steps
1. Update `render.yaml`
   - Replace `repo: https://github.com/<your-org>/<your-repo>` with your repository URL.
   - Choose plans if you prefer a paid plan.

2. Connect Render to GitHub
   - In the Render dashboard, go to "New" → "Import from GitHub" and connect the repository.
   - Render will detect the `render.yaml` and create services automatically.

3. Set environment variables / secrets
   - For sensitive values (API keys), use the Render dashboard "Environment" tab and add them as secure environment variables.
   - Required examples:
     - `GEMINI_API_KEY` (backend)
     - `PINECONE_API_KEY`, `PINECONE_ENV` (worker) — if using Pinecone
     - `OPENSEARCH_URL`, `OPENSEARCH_USER`, `OPENSEARCH_PASS` — if using hosted OpenSearch instead

4. Verify builds
   - Render will build each service using the `Dockerfile` in `apps/api` and `apps/worker`.
   - Check the build logs in Render for failures and fix any missing packages or build-time env requirements.

5. Configure networking (if using a hosted OpenSearch with IP restrictions)
   - If your vector store or OpenSearch is IP-restricted, allow Render's outbound IPs or use the provider's token-based auth.

6. Frontend (Vercel)
   - Connect `apps/web` to Vercel and set the `NEXT_PUBLIC_API_URL` environment variable to your Render API URL.
   - Deploy and verify the frontend can call the backend endpoints.

7. Test end-to-end
   - Index a document using the worker (run chunking & embedding scripts or trigger an upload from the UI).
   - Call the backend `/search` or `/results` endpoints and confirm responses include evidence.

CI / Auto-deploy notes
- Render supports auto-deploys from GitHub pushes by default. No additional actions needed if `render.yaml` is present.
