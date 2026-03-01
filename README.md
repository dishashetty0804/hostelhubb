# HostelHub

A complaint management system for students and administrators.

## Getting Started

1. **Install Docker** if you haven't already.
2. In the workspace root run:
   ```bash
   docker-compose up --build
   ```
   This will start MongoDB, the backend API (on port 5000) and the frontend application (on port 80).

3. **Health check**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return `{ status: 'OK', database: 'connected' }` when the backend is ready.

## Logging In

- **Student**: register through the frontend (`/register`). Only students may self-register; the form collects name, email, password, USN, room number and phone.
- **Admin**: a default administrator account is seeded automatically on server start.

  **Credentials:**
  - Email: `admin@hostelhub.com`
  - Password: `admin123`

  The backend checks on every startup and will recreate the admin account if it is missing.  You can also change these defaults by editing `backend/server.js` or by extending the seeding logic to read from environment variables.

> ⚠️ If you delete the admin user directly from MongoDB, the next time the server starts it will be recreated with the default password.

## Troubleshooting

- If login fails with "Invalid email or password", verify that you are using the correct email/password and that the backend is running (see the health endpoint above).
- For CORS or network errors, ensure the frontend is pointing to `http://localhost:5000` when running in development. When using Docker Compose, accessing the UI via `http://localhost` (port 80) should work.

---

Feel free to customize further or contact the maintainer if you run into issues.# hostelhub
