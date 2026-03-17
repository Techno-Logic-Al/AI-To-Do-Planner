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
