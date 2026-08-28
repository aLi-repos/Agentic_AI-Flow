# Agentflow_AI Deployment

This project deploys as two services:

- **Backend:** Render Web Service using `server/`
- **Frontend:** Vercel project using `client/`

Use a hosted MongoDB database, such as MongoDB Atlas, for production. Do not rely on the in-memory fallbacks in production because their data is lost when a service restarts. Configure a hosted Redis instance if durable BullMQ background jobs are required.

## 1. Push the project to GitHub

From the project root:

```bash
git init
git add .
git status
git commit -m "Prepare Agentflow_AI for deployment"
git branch -M main
git remote add origin https://github.com/<your-account>/<your-repository>.git
git push -u origin main
```

Replace the repository URL with your GitHub repository. If GitHub asks for authentication, use GitHub CLI or a personal access token; never commit a token or password to this project.

Before pushing, confirm that `.env` files and `node_modules/` are ignored:

```bash
git status --short --ignored
```

## 2. Deploy the backend on Render

1. In Render, select **New > Web Service** and connect the GitHub repository.
2. Set **Root Directory** to `server`.
3. Set **Runtime** to `Node`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Choose a plan and create the service.
7. Add the environment variables below in Render. Use generated, unique values for secrets.

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | The deployed Vercel URL, for example `https://your-app.vercel.app` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `REDIS_URL` | Your hosted Redis URL, preferably `rediss://...` |
| `JWT_SECRET` | A long random secret |
| `JWT_EXPIRES_IN` | `7d` or your chosen token lifetime |
| `CREDENTIAL_ENCRYPTION_KEY` | A long random secret; keep it stable so existing encrypted credentials remain readable |
| `OPENROUTER_API_KEY` | Optional OpenRouter API key |
| `GEMINI_API_KEY` | Optional Gemini API key |

Render supplies `PORT` automatically. Do not hard-code it in the service settings. After deployment, verify:

```text
https://<render-service>.onrender.com/api/health
```

The response should contain `"status":"healthy"`.

## 3. Deploy the frontend on Vercel

1. In Vercel, select **Add New > Project** and import the same GitHub repository.
2. Set **Root Directory** to `client`.
3. Framework preset: **Next.js**.
4. Keep the build command as `npm run build` and the install command as `npm install`.
5. Add these Production environment variables:

```env
NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://<render-service>.onrender.com
```

6. Deploy the project.
7. Copy the Vercel production URL into Render's `CLIENT_URL` value and redeploy the Render service if the URL changed.

The frontend uses `NEXT_PUBLIC_API_URL` for REST requests and `NEXT_PUBLIC_SOCKET_URL` for live Socket.IO execution updates. These values are embedded during the Vercel build, so redeploy after changing them.

## 4. Production checks

- Open the Vercel URL and register or log in.
- Confirm the dashboard loads without browser console CORS errors.
- Create or load a workflow and verify REST requests reach Render.
- Start an execution and confirm live Socket.IO timeline events appear.
- Confirm MongoDB Atlas allows connections from Render. For an initial test, MongoDB Atlas can allow all IPs, but restrict access before production where possible.
- Confirm Redis TLS credentials and connectivity if background execution queues are enabled.
- Rotate any secret that was ever committed or shared.

## Updating a deployment

Push changes to the tracked branch:

```bash
git add .
git commit -m "Describe the change"
git push
```

Render and Vercel can then rebuild automatically from the connected branch.
