# Task Management Application

Production-ready full-stack task manager built with Next.js App Router, PostgreSQL, Prisma ORM, JWT authentication, secure HTTP-only cookies, AES encryption for sensitive payload fields, and protected frontend routes.

## Live Deployment / Repository

- Live URL: Add your deployed URL here (for example, Vercel/Render/Railway).
- GitHub Repository: Add your repository link here.

## Tech Stack

- Frontend: Next.js 16 (App Router) + React + Tailwind CSS
- Backend: Next.js API Route Handlers
- Database: PostgreSQL + Prisma
- Security: JWT + HttpOnly cookies + bcrypt password hashing + AES-256-GCM encryption
- Validation: Zod

## Core Features

- User registration and login
- JWT-based auth stored in secure HTTP-only cookie
- Password hashing with bcrypt (`bcryptjs`)
- Task CRUD APIs: title, description, status, created date
- Ownership authorization (users can only access their own tasks)
- Task listing with pagination, status filtering, and title search
- Protected routes (`/dashboard`) and auth route redirection middleware
- Structured JSON error responses and proper HTTP status codes

## Security Highlights

- `HttpOnly` cookies with `SameSite=Strict` and `Secure` in production
- AES-256-GCM encryption of task `description` before DB storage
- Zod input validation for request bodies and query params
- No hardcoded secrets; all sensitive values loaded from environment variables
- Prisma ORM prevents SQL injection through parameterized queries

## Architecture Overview

- `src/app/api/auth/*`: register, login, logout, session profile (`me`)
- `src/app/api/tasks/*`: authenticated task CRUD and list APIs
- `src/lib/auth.ts`: token signing/verification, password hashing, cookie helpers
- `src/lib/crypto.ts`: AES encryption/decryption helpers
- `src/lib/schemas.ts`: validation schemas
- `src/lib/api.ts`: success/error response wrappers and error handling
- `prisma/schema.prisma`: `User` and `Task` models with status enum and indexes
- `middleware.ts`: route protection and auth-route redirect behavior

## Local Setup

1. Install dependencies:

	 ```bash
	 npm install
	 ```

2. Create environment file:

	 ```bash
	 cp .env.example .env
	 ```

	 On Windows PowerShell:

	 ```powershell
	 Copy-Item .env.example .env
	 ```

3. Fill `.env` values:

	 - `DATABASE_URL`: PostgreSQL connection string
	 - `JWT_SECRET`: at least 32 random characters
	 - `ENCRYPTION_KEY`: 64 hex chars (32-byte key)

4. Generate Prisma client and run migration:

	 ```bash
	 npm run prisma:generate
	 npm run prisma:migrate -- --name init
	 ```

5. Start app:

	 ```bash
	 npm run dev
	 ```

6. Open `http://localhost:3000`

## API Documentation (Sample Requests/Responses)

Base URL (local): `http://localhost:3000`

### 1) Register

`POST /api/auth/register`

Request:

```json
{
	"email": "user@example.com",
	"password": "SecurePass123"
}
```

Response `201`:

```json
{
	"success": true,
	"data": {
		"user": {
			"id": "clx...",
			"email": "user@example.com"
		}
	}
}
```

### 2) Login

`POST /api/auth/login`

Request:

```json
{
	"email": "user@example.com",
	"password": "SecurePass123"
}
```

Response `200`:

```json
{
	"success": true,
	"data": {
		"user": {
			"id": "clx...",
			"email": "user@example.com"
		}
	}
}
```

### 3) Create Task

`POST /api/tasks`

Request:

```json
{
	"title": "Prepare interview notes",
	"description": "Review auth and deployment sections",
	"status": "IN_PROGRESS"
}
```

Response `201`:

```json
{
	"success": true,
	"data": {
		"task": {
			"id": "clx...",
			"title": "Prepare interview notes",
			"description": "Review auth and deployment sections",
			"status": "IN_PROGRESS",
			"createdDate": "2026-02-26T12:00:00.000Z",
			"ownerId": "clx...",
			"updatedAt": "2026-02-26T12:00:00.000Z"
		}
	}
}
```

### 4) List Tasks (Pagination + Filter + Search)

`GET /api/tasks?page=1&limit=5&status=TODO&search=prepare`

Response `200`:

```json
{
	"success": true,
	"data": {
		"tasks": [],
		"pagination": {
			"page": 1,
			"limit": 5,
			"total": 0,
			"totalPages": 0
		}
	}
}
```

### 5) Update Task

`PUT /api/tasks/:taskId`

Request:

```json
{
	"status": "DONE"
}
```

Response `200`: updated task object.

### 6) Delete Task

`DELETE /api/tasks/:taskId`

Response `200`:

```json
{
	"success": true,
	"data": {
		"message": "Task deleted"
	}
}
```

### Error Response Shape

```json
{
	"success": false,
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Validation failed"
	}
}
```

## Deployment Notes

This app is ready to deploy to Vercel, Render, Railway, Azure, or AWS.

Minimum deployment steps:

1. Push this repository to GitHub.
2. Create a managed PostgreSQL instance.
3. Set environment variables in your hosting platform:
	 - `DATABASE_URL`
	 - `JWT_SECRET`
	 - `ENCRYPTION_KEY`
4. Deploy and run Prisma migration command.
5. Verify auth cookie behavior over HTTPS (`Secure` cookie enabled in production).

## Suggested Production Improvements

- Add rate limiting for auth endpoints
- Add CSRF mitigation strategy if using non-`Strict` same-site policy
- Add audit logging and centralized monitoring
- Add integration tests for auth and ownership controls
