# System Design Document - Ticket Booking System

## 1. High-Level Architecture

The system follows a standard 3-tier architecture:
- **Client**: React SPA (Single Page Application) handling UI and user interactions.
- **Server**: Node.js/Express REST API handling business logic and coordination.
- **Database**: PostgreSQL relational database for persistent storage and data integrity.

### Diagram
[Client] <-> [Load Balancer] <-> [API Server Cluster] <-> [PostgreSQL Master/Slave]

## 2. Database Design

We use a relational model to ensure ACID properties, which are crucial for booking systems.

### Schema
- **Show**: Represents an event/trip.
  - `id`, `name`, `startTime`, `totalSeats`
- **Seat**: Represents a specific seat for a show.
  - `id`, `showId`, `number`, `status` (AVAILABLE, BOOKED, LOCKED), `bookingId`
  - Index on `(showId, number)` for fast lookups.
  - Index on `(showId, status)` for finding available seats.
- **Booking**: Represents a user's reservation.
  - `id`, `userId`, `showId`, `status`, `createdAt`

### Scaling Strategy
- **Read Replicas**: Since the ratio of "viewing shows" to "booking" is high (Read-heavy), we can use Read Replicas for `GET` requests (listing shows, viewing seat maps).
- **Sharding**: For massive scale, we can shard the database by `ShowId` or `Region`. All data for a specific show resides on one shard, ensuring transactions remain local and efficient.

## 3. Concurrency Control

Handling race conditions is the core challenge. We use **Pessimistic Locking** (via `FOR UPDATE`) or **Optimistic Locking** (via Conditional Updates) to prevent overbooking.

### Implemented Strategy: Conditional Updates (Optimistic-like)
We use a "Compare-and-Set" approach within a transaction.
Query:
```sql
UPDATE Seat 
SET status = 'BOOKED', bookingId = $bookingId 
WHERE id IN ($seatIds) AND status = 'AVAILABLE'
```
- If the number of updated rows equals the number of requested seats, the booking succeeds.
- If fewer rows are updated, it means another transaction modified a seat state concurrently. The transaction is rolled back.
- This is efficient as it avoids long-held locks on reading, only locking during the write.

## 4. Caching Strategy

- **CDN**: Cache static assets (frontend build).
- **Redis**:
  - Cache `GET /shows` response with a short TTL (e.g., 30s).
  - Cache `GET /shows/:id` (Seat Map) with very short TTL (e.g., 1-2s) or use Server-Sent Events (SSE) / WebSockets for real-time invalidation.
  - **Inventory Cache**: Store available seat counts in Redis for fast checking before hitting DB (needs careful sync).

## 5. Message Queues (Optional/Future)

- **Booking Processing**: For extremely high load (e.g., flash sales), we can decouple the booking request.
  - User Request -> Queue -> Worker -> DB Transaction.
  - User polls for status.
  - This smooths out traffic spikes and prevents DB overload.
- **Notifications**: Use queues for sending email/SMS confirmations asynchronously.

## 6. Booking Expiry (Bonus)

To handle "held" seats (e.g., user selects but doesn't pay):
1. Set seat status to `LOCKED` with a `lockedAt` timestamp.
2. Background Cron Job (or Redis Key Expiry event) checks for locks older than 2 minutes.
3. Revert status to `AVAILABLE` if expired.
