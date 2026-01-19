# Setup Guide

## Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ and pnpm installed

## Database Setup

1. **Start PostgreSQL with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
   
   The `.env` file should contain:
   ```
   DATABASE_URL="postgresql://traya:traya_password@localhost:5432/traya_quiz?schema=public"
   ```

3. **Generate Prisma Client:**
   ```bash
   pnpm db:generate
   ```

4. **Run migrations:**
   ```bash
   pnpm db:migrate
   ```

5. **Seed the database with initial questions:**
   ```bash
   pnpm db:seed
   ```

## Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   pnpm dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)**

## Database Management

- **View database in Prisma Studio:**
  ```bash
  pnpm db:studio
  ```

- **Stop PostgreSQL:**
  ```bash
  docker-compose down
  ```

- **Stop and remove volumes (clean slate):**
  ```bash
  docker-compose down -v
  ```

## API Endpoints

- `GET /api/questions` - Fetch all questions
- `GET /api/categories` - Fetch all categories
- `POST /api/users` - Create or get user (requires phone)
- `GET /api/users?phone=xxx` or `?email=xxx` - Get user by phone/email
- `POST /api/submit` - Submit complete quiz form (requires phone, creates user and all answers)
- `POST /api/answers` - Submit or update a single answer (requires userId)
- `GET /api/answers?userId=xxx` - Get all answers for a user
- `POST /api/upload` - Upload image file

## Database Schema

The database uses a simplified structure:
- **User**: Identified by phone number (required, unique)
- **Answer**: Directly linked to User and Question (one answer per user per question)
- No FormSubmission or sessionId - answers are directly linked to users
