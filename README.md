# AI To-Do App

A React to-do app with inline ChatGTP AI suggestions. Users can add tasks, request a suggestion for each one, and view the AI response directly inside the task card.

## Features

- Add, complete, and delete tasks.
- Ask for an optional `Request Suggestion` AI insight per task.
- View a refined title, category, next step, batching hint, and tags inline.
- Persist tasks locally in the browser.
- Keep the OpenAI API key on the server, not in the client bundle.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   copy .env.example .env
   ```

3. Add your OpenAI API key to `.env`.

4. Start the app:

   ```bash
   npm run dev
   ```

   This starts:

   - the React client on `http://localhost:5173`
   - the Express API on `http://localhost:3001`

If you leave `VITE_API_BASE_URL` blank, the frontend uses the local Vite proxy for `/api`.

## Build for production

```bash
npm run build
npm start
```

After building, the Express server will serve the static React app from `dist/`.

## Deploy with cPanel frontend + Cloud Run backend

Use this route if your cPanel account can host only static files.

### 1. Deploy the backend to Cloud Run

The backend needs these environment variables in Cloud Run:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5-mini
FRONTEND_ORIGIN=https://your-frontend-domain
```

You can keep `min instances = 1` on Cloud Run for a more responsive demo.

### 2. Build the frontend for the live backend

Create `.env.production.local` with:

```env
VITE_API_BASE_URL=https://your-cloud-run-url
```

Then run:

```bash
npm run build
```

### 3. Upload only the built frontend to cPanel

Upload the contents of `dist/` to your subdomain document root so that `index.html` sits directly in that folder.

Do not upload:

- `node_modules/`
- `server/`
- `shared/`
- `.env`
- the rest of the source tree
