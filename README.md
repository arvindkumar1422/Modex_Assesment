# BookMyShow Clone

A full-stack movie booking application built with React, Node.js, Express, Prisma, and PostgreSQL.

## Features

- **User Authentication**: Email-based OTP login.
- **Movie Browsing**: View currently running movies with details.
- **Booking System**: Select seats and book tickets.
- **My Bookings**: View your booking history with QR codes.
- **Admin Dashboard**: Manage movies and shows (accessible at `/admin`).

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Prisma ORM

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- PostgreSQL

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd modex
    ```

2.  **Install dependencies:**
    ```bash
    # Install root dependencies (if any)
    npm install

    # Install backend dependencies
    cd backend
    npm install

    # Install frontend dependencies
    cd ../frontend
    npm install
    ```

3.  **Environment Setup:**

    - Create a `.env` file in the `backend` directory:
      ```env
      DATABASE_URL="postgresql://user:password@localhost:5432/modex?schema=public"
      JWT_SECRET="your_super_secret_key"
      PORT=3000
      ```

4.  **Database Setup:**

    ```bash
    cd backend
    npx prisma migrate dev
    npx ts-node --esm src/seed.ts # Seed initial data
    ```

5.  **Run the Application:**

    - **Backend:**
      ```bash
      cd backend
      npm run dev
      ```

    - **Frontend:**
      ```bash
      cd frontend
      npm run dev
      ```

6.  **Access the App:**
    - Frontend: `http://localhost:5173`
    - Backend: `http://localhost:3000`

## Deployment

### Vercel (Frontend + Backend)

This project is configured for deployment on Vercel.

1.  Push the code to GitHub.
2.  Import the project into Vercel.
3.  Set the Root Directory to `.` (root).
4.  Configure Environment Variables in Vercel:
    - `DATABASE_URL`: Your production PostgreSQL connection string (e.g., from Neon or Supabase).
    - `JWT_SECRET`: A secure secret key.
5.  Deploy!

Note: The backend is configured as a Serverless Function in `api/index.ts`.

- **Admin**: Create shows/events with seat capacity.
- **User**: View shows, book seats.
- **Concurrency**: Handles multiple users booking the same seat simultaneously using database transactions and optimistic locking strategies (via status checks).
- **Real-time**: Frontend polls for seat availability updates.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Router, Axios.

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- PostgreSQL Database

### Backend Setup

1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment:
   Create a `.env` file in `backend` with your database URL:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/ticket_booking?schema=public"
   ```
4. Run Migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start Server:
   ```bash
   npm run dev
   ```
   (You may need to add `"dev": "ts-node src/index.ts"` to `package.json` scripts if not present, or use `npx ts-node src/index.ts`)

### Frontend Setup

1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Dev Server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

## API Documentation

- `POST /api/admin/shows`: Create a show. Body: `{ name, startTime, totalSeats }`
- `GET /api/shows`: List all shows.
- `GET /api/shows/:id`: Get show details with seats.
- `POST /api/bookings`: Book seats. Body: `{ showId, seatIds, userId }`

## Concurrency Handling

The system uses database transactions to ensure atomicity. When booking seats:
1. A transaction is started.
2. The system attempts to update the selected seats ONLY if their status is `AVAILABLE`.
3. If any seat is already booked (update fails or count doesn't match), the transaction is rolled back.
4. This prevents overbooking even under high load.
