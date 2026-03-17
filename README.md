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

## Build for production

```bash
npm run build
npm start
```

After building, the Express server will serve the static React app from `dist/`.

## Deploy on cPanel

This project needs Node.js support in cPanel because the OpenAI key stays on the server and the Express app handles `/api/insights`.

1. Confirm your hosting plan includes cPanel `Application Manager` or `Node.js` support.
2. Push this repo to GitHub.
3. In cPanel, clone the repo into your home directory, not inside `public_html`.
4. Create a `.env` file in the app directory and add:

   ```env
   OPENAI_API_KEY=your_key_here
   OPENAI_MODEL=gpt-5-mini
   ```

5. Open cPanel `Application Manager` and register the app:
   - Domain: your domain or subdomain
   - Base URL: `/` or a subpath such as `/planner`
   - Application Path: the repo directory relative to your home directory
   - Environment: `Production`
6. Install dependencies and build the app on the server:

   ```bash
   npm install
   npm run build
   ```

7. Start or redeploy the app from cPanel.

This repo includes a top-level `app.js` file because Passenger looks for that filename by default on many cPanel Node.js setups.
Leave `PORT` unset on cPanel unless your host explicitly tells you otherwise, because Passenger manages the application port there.
