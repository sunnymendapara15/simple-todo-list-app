# Simple Todo List App

This repository contains a small todo list application separated into a React frontend and an Express backend. It demonstrates a full-stack workflow that keeps data in a lightweight JSON store so todos survive server restarts.

## Features
- Add, toggle, and delete todos with a responsive UI.
- Filters for all / active / completed tasks.
- Express API with validation, error handling, and a JSON file datastore.
- React app that fetches the backend, handles errors, and keeps UI state in sync.

## Structure
- `frontend/` – React (Create React App) client.
- `backend/` – Express REST API.
- `backend/data/todos.json` – persistent JSON store.

## Getting started

### Backend
```bash
cd backend
npm install
npm run dev   # starts nodemon on port 4000
```
The server exposes:
- `GET /todos` – list all todos.
- `POST /todos` – create a todo (e.g. `{ "title": "Buy milk" }`).
- `PATCH /todos/:id` – update a todo (`completed` or `title`).
- `DELETE /todos/:id` – remove a todo.

### Frontend
```bash
cd frontend
npm install
npm start
```
The React app runs on port 3000 by default and hits the backend at `http://localhost:4000`. If you need a different backend host, set the `REACT_APP_API_BASE_URL` environment variable before starting the client.

## Testing
- Backend: use curl, Postman, or the UI to hit the REST endpoints.
- Frontend: `npm test` runs the CRA test harness (no automated tests provided, but you can add them).

## Next steps
- Swap the JSON file for a proper database when scaling beyond prototypes.
- Add authentication so todos are scoped per user.
- Deploy the backend and frontend to hosting platforms that support Node services.
