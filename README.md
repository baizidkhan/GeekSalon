# GeekSalon — Client

Next.js 16 frontend for the GeekSalon salon management platform.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- The **server stack** must be started first (see `../server/README.md`)
- The shared Docker network `geeksalon-dev` must exist (one-time setup below)

---

## One-Time Setup

Run this once on your machine. You never need to run it again unless you delete the network.

```powershell
docker network create geeksalon-dev
```

---

## Running with Docker

### 1. Start the server first

Follow the instructions in `../server/README.md` to get the server running.

### 2. Start the client

```powershell
# From the client/ directory
docker compose -f docker-compose.local.yml up --build
```

The first run will take a few minutes to install dependencies. Subsequent runs are fast.

### 3. Open the app

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Main website |
| http://localhost:3000/admin | Admin dashboard |

---

## Default Admin Credentials

```
Email:    admin@admin.com
Password: 123456
```

---

## Environment Variables

The Docker compose file sets all required variables automatically. For reference:

| Variable | Docker value | Description |
|----------|-------------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | API URL used by the browser |
| `INTERNAL_API_BASE_URL` | `http://makeover-server-dev:4000` | API URL used by Next.js SSR (server-side) |

> The `.env.local` file is used for native (non-Docker) development only. Docker compose variables always take precedence.

---

## Stopping

```powershell
# Stop and remove containers
docker compose -f docker-compose.local.yml down

# Stop and also remove volumes (clears node_modules and .next cache)
docker compose -f docker-compose.local.yml down -v
```

---

## Troubleshooting

**`fetch failed` / `ETIMEDOUT` errors in the logs**
- Make sure the server stack is running: `docker ps` should show `makeover-server-dev`
- Make sure the shared network exists: `docker network ls | findstr geeksalon-dev`
- If the network is missing, recreate it: `docker network create geeksalon-dev`

**Port 3000 already in use**
- Something else is using port 3000. Stop it or change the port mapping in `docker-compose.local.yml`.

**Changes not reflecting**
- The container uses file-watch polling (`CHOKIDAR_USEPOLLING=true`). Changes should appear within ~1–2 seconds. If not, restart the container.

**Slow first load**
- Normal on first run — Next.js compiles pages on demand. Subsequent visits are instant.
