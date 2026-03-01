# Wise Guys 🎬

A full-stack web app for tracking gangster movies & TV — The Godfather, Goodfellas, The Sopranos, and more. Browse titles, manage your watchlist, and leave your mark.

---

## Tech Stack

**Backend**
- Python 3.13 · Flask · Strawberry GraphQL
- JWT authentication (register/login)
- SQLite with persistent Docker volume

**Frontend**
- Next.js 14 · TypeScript · Tailwind CSS
- Apollo Client (GraphQL)
- Auth via JWT stored in localStorage

**Infrastructure**
- Backend → [Fly.io](https://fly.io) (Docker, persistent volume)
- Frontend → [Vercel](https://vercel.com)
- CI/CD → GitHub Actions

---

## Project Structure

```
wiseguys/
├── src/
│   ├── backend/          # Flask + Strawberry GraphQL API
│   │   ├── main.py       # App entry point, CORS, route registration
│   │   ├── auth_routes.py# /auth/register and /auth/login
│   │   ├── schema.py     # GraphQL schema (queries + mutations)
│   │   ├── db.py         # SQLite helpers, seed data
│   │   ├── config.py     # Centralised env/secret loading
│   │   ├── graphql_view.py # JWT-protected GraphQL view
│   │   ├── Dockerfile
│   │   └── fly.toml      # Fly.io deployment config
│   └── frontend/         # Next.js app
│       ├── app/          # App Router pages (login, register, titles, profile)
│       ├── components/   # Shared UI components
│       ├── lib/          # Apollo client, auth helpers, GraphQL queries
│       ├── Dockerfile
│       └── vercel.json   # Vercel deployment config
├── docker-compose.yml    # Local development
└── .github/workflows/
    ├── ci.yml            # Lint, build, smoke test on every push
    └── deploy-backend.yml# Auto-deploy backend to Fly.io on src/backend/** changes
```

---

## Running Locally

### With Docker (recommended)

Requires [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/install/).

```bash
docker compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:5000/graphql|

To stop:
```bash
docker compose down
```

To wipe the database and start fresh:
```bash
docker compose down -v
```

---

### Without Docker

**Backend**
```bash
cd src/backend
pip install -r requirements.txt
SECRET_KEY=dev python main.py
```

**Frontend**
```bash
cd src/frontend
pnpm install
pnpm dev
```

---

## Environment Variables

### Backend

| Variable            | Default                    | Description                              |
|---------------------|----------------------------|------------------------------------------|
| `SECRET_KEY`        | *(insecure dev fallback)*  | JWT signing key — **must be set in prod**|
| `DATABASE_PATH`     | `/data/characters.db`      | Path to the SQLite database file         |
| `JWT_EXPIRY_MINUTES`| `10080` (7 days)           | How long JWT tokens remain valid         |
| `CORS_ORIGINS`      | `http://localhost:3000`    | Comma-separated list of allowed origins  |

### Frontend

| Variable                  | Default                          | Description                        |
|---------------------------|----------------------------------|------------------------------------|
| `NEXT_PUBLIC_GRAPHQL_URI` | `http://localhost:5000/graphql`  | GraphQL endpoint — baked in at build time |

---

## Deployment

### Backend → Fly.io

```bash
cd src/backend
fly launch --name wiseguys-api --no-deploy
fly volumes create sqlite_data --region lhr --size 1
fly secrets set SECRET_KEY="$(openssl rand -hex 32)"
fly secrets set CORS_ORIGINS="https://your-app.vercel.app,http://localhost:3000"
fly deploy
```

Any push to `main` that touches `src/backend/**` will automatically redeploy via GitHub Actions.
Add `FLY_API_TOKEN` to your GitHub repo secrets to enable this:

```bash
fly tokens create deploy -x 999999h
gh secret set FLY_API_TOKEN --body "your-token-here"
```

### Frontend → Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** → `src/frontend`
3. Add environment variable: `NEXT_PUBLIC_GRAPHQL_URI=https://your-api.fly.dev/graphql`
4. Under **Settings → Git → Ignored Build Step**, add:
   ```
   git diff --quiet HEAD^ HEAD -- src/frontend/
   ```
   This skips Vercel rebuilds when only backend files changed.

---

## CI / CD

| Trigger | What runs |
|---|---|
| Push or PR to `main` | `ci.yml` — Python smoke test, frontend lint + build |
| Push to `main` touching `src/backend/**` | `deploy-backend.yml` — `fly deploy` |
| Push to `main` touching `src/frontend/**` | Vercel webhook — rebuild and deploy |

---

## API

The GraphQL playground is available at `/graphql` when running locally.

**Auth endpoints (REST)**
```
POST /auth/register   { email, password, displayName }
POST /auth/login      { email, password }
```

**GraphQL queries**
```graphql
query { titles { id name type year cast } }
query { title(id: 1) { name description } }
query { me { id email displayName } }
```

**GraphQL mutations** *(require Authorization: Bearer <token>)*
```graphql
mutation { createTitle(input: { type: "movie", name: "...", year: 2024 }) { id } }
mutation { updateTitle(id: 1, input: { name: "..." }) { id name } }
mutation { deleteTitle(id: 1) }
mutation { updateProfile(input: { displayName: "..." }) { id } }
```

---

## License

MIT