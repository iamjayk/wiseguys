# Getting Started
Welcome to the Project! This guide will help you get your backend and frontend up and running locally using Docker Compose.

## Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/install/) installed

## Quick Start

```bash
docker-compose up --build
```

- The backend will be available at: [http://localhost:5000/graphql](http://localhost:5000/graphql)
- The frontend will be available at: [http://localhost:3000](http://localhost:3000)

## Project Overview

**Backend**
- Location: `platform/backend`
- Python 3.13 (Flask, Strawberry GraphQL, JWT Auth)
- Exposes `/graphql` endpoint
- Uses SQLite database stored in the Docker volume

**Frontend**
- Location: `platform/frontend`
- Node.js (Next.js)
- Talks to the backend GraphQL API

## Environment Variables

The backend and frontend are configured through environment variables in `docker-compose.yml`. The important ones:

- `DATABASE_PATH`: location of the SQLite database (default in container: `/data/characters.db`)
- `SECRET_KEY`: used for JWT token signing (change this in production!)
- `JWT_EXPIRY_MINUTES`: how long tokens are valid
- `NEXT_PUBLIC_GRAPHQL_URI`: URL the frontend uses to talk to the backend (defaults to the internal docker network)

## Development

To stop the services:

```bash
docker-compose down
```

### Making Code Changes

- Edit the source code in `platform/backend` or `platform/frontend`. Docker will automatically rebuild when you restart the containers.

### Admin & DB

- The SQLite data persists in the Docker volume `sqlite_data` even when containers stop.
- To reset the DB, remove the volume:

```bash
docker-compose down -v
```

## Running Without Docker (Optional)

**Backend:**
```bash
cd platform/backend
pip install -r requirements.txt
export FLASK_ENV=development
python main.py
```
**Frontend:**
```bash
cd platform/frontend
pnpm install
pnpm dev
```

## Running Tests

*See `.github/workflows/ci.yml` for CI test details.*

## Troubleshooting

- If you change dependencies, make sure to rebuild: `docker-compose up --build`
- Ensure ports 3000 & 5000 are free.

---

Feel free to open issues or contribute!
