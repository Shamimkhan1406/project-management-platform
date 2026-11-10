# Project Management Platform

A Node.js + Express + MongoDB backend for a project management application. This project provides secure authentication, user management, and a foundation for project collaboration features such as team membership, task tracking, notes, and role-based access control.

This repository is built around the product requirements described in [PRD.md](./PRD.md), and the current implementation focuses on authentication and account lifecycle features with a structure ready to expand into a full project management system.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Common Usage Examples](#common-usage-examples)
- [Development Notes](#development-notes)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

## Project Overview

The goal of this project is to provide a backend system for a collaborative project management platform where teams can:

- register and manage user accounts
- authenticate securely with JWT tokens
- create and manage projects
- assign users to projects with different roles
- create and track tasks and subtasks
- manage notes and documents
- support email verification and password reset flows

The platform is designed around three user roles:

- Admin: full system permissions
- Project Admin: project-level management capabilities
- Member: limited project participation

## Features

### Current implementation

The backend already includes:

- User registration
- Login and logout
- JWT-based access and refresh tokens
- Email verification
- Password change and password reset flows
- Current user retrieval
- Validation middleware for request payloads
- MongoDB-based data persistence
- CORS and cookie support

### Planned / product-level features

Based on the PRD, the application is intended to support:

- project creation and management
- project member invitations and role assignment
- task creation, updates, deletion, and status tracking
- subtasks with completion updates
- project notes and comments
- file attachments for tasks
- role-based access control across the system
- health check endpoints for system monitoring

## Technology Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt / bcryptjs for password hashing
- dotenv for environment configuration
- Nodemailer + Mailtrap for email delivery during testing
- CORS for browser-based API access
- Express Validator for request validation

## Project Structure

```bash
project-management-platform/
├── PRD.md
├── package.json
├── .env
├── public/
├── src/
│   ├── app.js
│   ├── index.js
│   ├── controllers/
│   ├── db/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── validators/
│   └── ...
└── README.md
```

### Key folders

- `src/controllers/`: API business logic
- `src/routes/`: route definitions for endpoints
- `src/models/`: MongoDB schemas and model methods
- `src/middlewares/`: auth and validation middleware
- `src/validators/`: request validation rules
- `src/db/`: database connection setup
- `public/`: static files and uploads

## Prerequisites

Before running this project, make sure you have:

- Node.js 18 or newer
- npm or yarn
- MongoDB instance running locally or a MongoDB Atlas cluster
- Mailtrap account or a transactional mail provider for email testing
- A code editor such as VS Code

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Shamimkhan1406/project-management-platform.git
cd project-management-platform
```

2. Install dependencies:

```bash
npm install
```

3. Verify the project scripts:

```bash
cat package.json
```

The project includes the following scripts:

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

## Environment Variables

Create a `.env` file in the project root if it does not already exist. The app expects the following variables:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/project_management
PORT=8000
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

MAIL_TRAP_HOST=sandbox.smtp.mailtrap.io
MAIL_TRAP_PORT=2525
MAIL_TRAP_USER=your_mailtrap_user
MAIL_TRAP_PASS=your_mailtrap_password

FORGOT_PASSWORD_REDIRECT_URL=http://localhost:3000/forgot-password
```

### Explanation of important values

- `MONGO_URI`: MongoDB connection string
- `PORT`: application port; default is 3000, but this project uses 8000 in the sample config
- `CORS_ORIGIN`: allowed frontend origin(s); can be a comma-separated list
- `ACCESS_TOKEN_SECRET`: secret used to sign short-lived access tokens
- `REFRESH_TOKEN_SECRET`: secret used to sign refresh tokens
- `ACCESS_TOKEN_EXPIRY` / `REFRESH_TOKEN_EXPIRY`: token lifetime values
- `MAIL_TRAP_*`: email mock service credentials used for testing email flows
- `FORGOT_PASSWORD_REDIRECT_URL`: frontend route to redirect after password reset

Important: Never commit real secrets to version control. Use a local `.env` file and keep it private.

## Running the Project

### Start in production mode

```bash
npm start
```

### Start in development mode with auto-reload

```bash
npm run dev
```

When the server starts successfully, it connects to MongoDB and listens on the configured port.

Example output:

```bash
MongoDB connected successfully
server is listening on port http://localhost:8000
```

## Authentication Flow

This project uses JSON Web Tokens (JWT) for authentication.

### How registration works

1. User submits registration details such as username, email, and password.
2. Server validates incoming data.
3. A new MongoDB user is created.
4. Password is hashed using bcrypt.
5. Email verification token is generated and emailed to the user.
6. User must verify email before complete access is granted.

### How login works

1. User sends email and password.
2. Server validates credentials.
3. Password comparison is performed using bcrypt.
4. Server generates:
   - access token
   - refresh token
5. Tokens are returned to the client or stored in cookies depending on the app flow.

### JWT usage

The access token is used for protected endpoints and contains user identity details such as:

- user id
- username
- email

The refresh token is used to obtain a new access token after expiry without re-login.

## API Endpoints

The current API structure includes these routes.

### Health check

```http
GET /api/v1/healthcheck
```

Returns server health status.

### Authentication routes

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/verify-email/:verificationToken
POST /api/v1/auth/refesh-token
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password/:resetToken
POST /api/v1/auth/logout
POST /api/v1/auth/current-user
POST /api/v1/auth/change-password
POST /api/v1/auth/resend-email-varification
```

### Notes about route names

Some route names in the code include small naming inconsistencies, such as:

- `/refesh-token` instead of `/refresh-token`
- `/resend-email-varification` instead of `/resend-email-verification`

These are implementation details that may need cleanup in a production-grade API. Always confirm the exact route names in the source before integrating a frontend client.

## Common Usage Examples

### 1. Register a new user

Request:

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "StrongPass123!",
  "fullName": "John Doe"
}
```

### 2. Login

Request:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "StrongPass123!"
}
```

### 3. Get current user

Request:

```http
POST /api/v1/auth/current-user
Authorization: Bearer <access_token>
```

### 4. Forgot password

Request:

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### 5. Verify email

Request:

```http
GET /api/v1/auth/verify-email/<verificationToken>
```

## Development Notes

### Express app setup

The app is initialized in `src/app.js` and includes:

- JSON body parsing
- URL-encoded form parsing
- static file serving from `public/`
- cookie parsing
- CORS configuration
- route registration

### Database connection

The database is initialized in `src/db/index.js` using Mongoose:

```js
await mongoose.connect(process.env.MONGO_URI);
```

This ensures the app connects to MongoDB before serving requests.

### User model features

The `User` model includes fields such as:

- username
- email
- fullName
- password
- refreshToken
- forgotPasswordToken
- emailVerificationToken
- isEmailVerified
- timestamps

The model also contains helper methods for:

- password checking
- JWT token generation
- temporary token creation for email-based flow

## Security Considerations

This project includes foundational security patterns, but it should be reviewed and hardened before production deployment.

Recommended checks include:

- use strong secret values in production
- rotate JWT signing secrets regularly
- enforce HTTPS in production
- validate all incoming request payloads strictly
- sanitize file uploads and file storage paths
- add rate limiting to login and password reset endpoints
- restrict CORS origins instead of allowing `*`
- store tokens in secure, production-safe storage mechanisms
- add logging and monitoring for suspicious activity
- protect email verification and password reset tokens

## Troubleshooting

### MongoDB connection fails

Check:

- whether MongoDB is running
- whether the `MONGO_URI` is correct
- whether the database user has permissions

### App starts but requests fail

Check:

- whether the frontend is calling the correct base URL
- whether `CORS_ORIGIN` matches the frontend domain
- whether the backend is listening on the correct port

### Email verification/reset emails are not sent

Check:

- Mailtrap credentials are correct
- `MAIL_TRAP_HOST`, `MAIL_TRAP_PORT`, `MAIL_TRAP_USER`, and `MAIL_TRAP_PASS` are valid
- the SMTP configuration in your environment is correct

### JWT errors

Check:

- `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are defined
- the token is not expired
- the `Authorization` header uses the correct format: `Bearer <token>`

## Roadmap

A logical next step for this project is to expand the backend into the full PRD feature set:

1. Project CRUD endpoints
2. Member management and role-based authorization
3. Task and subtask API modules
4. Note management API
5. File upload support for task attachments
6. Email notification improvements
7. API documentation with Swagger/OpenAPI
8. Testing coverage with unit and integration tests
9. Deployment configuration for production environments

## License

This project is currently configured with ISC license metadata in `package.json`.

## Summary

This repository provides a strong backend foundation for a project management platform, with a secure auth system and a clean Express/Mongo structure. It aligns with the PRD and is ready to be extended into a full collaborative management application.

For full product expectations and feature scope, refer to [PRD.md](./PRD.md).
