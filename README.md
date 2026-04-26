# Quiz App

A real-time quiz buzzer app built with Next.js + Socket.IO (no database required).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production commands

```bash
npm run build
npm run start
```

## Deploy for free (Render)

This project is ready to deploy to **Render Free Web Service**, which gives you a free `*.onrender.com` domain.

### Option A: One-click via `render.yaml`

1. Push this repo to GitHub.
2. In Render, click **New +** → **Blueprint**.
3. Connect your repo.
4. Render will detect `render.yaml` and create the service.

After deployment, Render provides a URL like:

```text
https://quiz-app-xxxx.onrender.com
```

### Option B: Manual Web Service setup

If you prefer manual setup in Render dashboard:

- **Environment:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`

## Notes

- This app stores quiz state in server memory, so data resets on restart/redeploy.
- Socket.IO works with the same single Node server process used by this app.
