# HostelHub – Room Allotment Management System

A robust, lightweight backend REST API for managing hostel room allotments, built with **Node.js**, **Express.js**, and **SQLite**.

---

## Table of Contents

- [1. Project Title](#1-project-title)
- [2. Project Description](#2-project-description)
- [3. Problem Statement](#3-problem-statement)
- [4. Project Objectives](#4-project-objectives)
- [5. Technologies Used](#5-technologies-used)
- [6. Features](#6-features)
- [7. Database Design](#7-database-design)
- [8. Database Relationships](#8-database-relationships)
- [9. Project Folder Structure](#9-project-folder-structure)
- [10. API Documentation](#10-api-documentation)
- [11. API Endpoints and HTTP Methods](#11-api-endpoints-and-http-methods)
- [12. Smart Search Functionality](#12-smart-search-functionality)
- [13. Validation and Error Handling](#13-validation-and-error-handling)
- [14. Installation Instructions](#14-installation-instructions)
- [15. How to Run the Project](#15-how-to-run-the-project)
- [16. Postman Testing Instructions](#16-postman-testing-instructions)
- [17. Sample API Requests and Responses](#17-sample-api-requests-and-responses)
- [18. Group Members and Responsibilities](#18-group-members-and-responsibilities)
- [19. Conclusion](#19-conclusion)

---

## 1. Project Title

**HostelHub – Room Allotment Management System**

---

## 2. Project Description

**HostelHub** is a backend RESTful API built for educational and commercial hostel facilities to streamline and automate room allotment procedures. Built using **Node.js**, **Express.js**, and **SQLite** (via the synchronous, high-performance `better-sqlite3` driver), HostelHub enables administrators to manage resident profiles, maintain room inventories, allot rooms without booking conflicts, and perform case-insensitive partial searches across room records.

The application follows a modular, layered software architecture adhering to separation of concerns: routing, middleware input validation, controller business logic, and transactional database management.

---

## 3. Problem Statement

Managing hostel room allocations manually through spreadsheets or physical paper registers introduces frequent operational hurdles:

1. **Risk of Double Booking:** Multiple residents may inadvertently be assigned to the same room due to lack of real-time conflict constraints.
2. **Data Inconsistency:** Manual records lack schema enforcement, allowing missing details, invalid email addresses, or non-existent room numbers.
3. **Inefficient Information Retrieval:** Locating rooms across multiple blocks or checking room occupancy requires time-consuming manual inspection.
4. **Lack of Referential Integrity:** Modifying or deleting room records while an active resident resides in them can cause orphaned records and administrative confusion.

HostelHub directly resolves these challenges by providing an automated backend API with strict database constraints, reusable input validation middleware, and relational integrity.

---

## 4. Project Objectives

- **Develop a RESTful API:** Provide clear, predictable HTTP endpoints adhering to standard conventions and status codes.
- **Implement Full CRUD Operations:** Enable creating, reading, updating, and deleting rooms, as well as managing residents.
- **Prevent Duplicate Room Allotments:** Enforce database-level `UNIQUE` constraints and controller-level pre-checks so that a room cannot be allotted to more than one resident simultaneously.
- **Relational Data Aggregation via SQL JOIN:** Link allotments with resident and room records to produce informative, human-readable response payloads.
- **Provide Smart Search Capabilities:** Implement case-insensitive partial text searching across room names and blocks using SQL `LIKE ... COLLATE NOCASE`.
- **Enforce Strict Input Validation & Error Handling:** Validate URL parameters and request bodies prior to database operations and return consistent, standardized JSON error objects.
- **Maintain Clean Code Architecture:** Decouple routes, controllers, middleware, and database initialization for high maintainability.

---

## 5. Technologies Used

| Technology | Role / Usage |
|---|---|
| **Node.js** | Server-side JavaScript runtime environment |
| **Express.js (v5.x)** | Fast, unopinionated web framework for routing and middleware handling |
| **SQLite3 (`better-sqlite3`)** | Fast, synchronous, file-based relational database engine |
| **Nodemon** | Development utility that automatically restarts the server on code changes |
| **Postman** | Comprehensive API testing, automated verification test scripts, and validation |
| **JavaScript (CommonJS)** | Core application programming language (`require` / `module.exports`) |

---

## 6. Features

- **Room Inventory Management:**
  - Create new rooms with name and block designations.
  - Retrieve a list of all rooms or fetch single room details by ID.
  - Update existing room details with real-time validation.
  - Delete rooms safely with conflict protection (prevents deleting currently allotted rooms).
- **Resident Directory:**
  - Register new residents with validated name and email formats.
  - View all registered residents or fetch a single resident by ID.
- **Conflict-Free Room Allotment:**
  - Allot available rooms to valid residents.
  - Automatic validation preventing room double-booking via `UNIQUE` constraints and pre-allotment checks.
- **SQL JOIN Queries:**
  - Allotment listing endpoints join `allotments`, `residents`, and `rooms` tables to return readable resident names, room numbers, and block names.
- **Smart Search:**
  - Filter rooms dynamically by searching terms across `name` and `block` fields.
  - Case-insensitive, partial substring matching with graceful empty array handling (`message: "Nothing found"`).
- **Input Validation Middleware:**
  - Reusable validators for positive integer IDs, non-empty text fields, and email regex patterns.
- **Automatic Database Seeding:**
  - Auto-creates tables with foreign keys enabled (`PRAGMA foreign_keys = ON`).
  - Pre-seeds sample data on first run without creating duplicate rows on subsequent restarts.
- **Graceful Process Termination:**
  - Handles `SIGINT` and `SIGTERM` signals to cleanly close database connections before exiting.

---

## 7. Database Design

HostelHub stores data in a persistent SQLite database located at `database/hostelhub.db`. Foreign key constraints are explicitly activated via `PRAGMA foreign_keys = ON;`.

### Schema Definitions

#### 1. `residents` Table
Stores contact information of hostel residents.

```sql
CREATE TABLE IF NOT EXISTS residents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL
);
```

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for the resident |
| `name` | `TEXT` | `NOT NULL` | Full name of the resident |
| `email` | `TEXT` | `NOT NULL` | Email address of the resident |

---

#### 2. `rooms` Table
Stores details of rooms available across hostel blocks.

```sql
CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  block TEXT NOT NULL
);
```

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for the room |
| `name` | `TEXT` | `NOT NULL` | Room label or number (e.g., "Room 101") |
| `block` | `TEXT` | `NOT NULL` | Hostel block designation (e.g., "Block A") |

---

#### 3. `allotments` Table
Junction table tracking room assignments to residents.

```sql
CREATE TABLE IF NOT EXISTS allotments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resident_id INTEGER NOT NULL,
  room_id INTEGER NOT NULL UNIQUE,
  FOREIGN KEY (resident_id) REFERENCES residents(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);
```

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for the allotment record |
| `resident_id` | `INTEGER` | `NOT NULL`, `FOREIGN KEY` | Reference to `residents.id` |
| `room_id` | `INTEGER` | `NOT NULL`, `UNIQUE`, `FOREIGN KEY` | Reference to `rooms.id` (Enforces 1:1 occupancy) |

---

## 8. Database Relationships

The database architecture employs relational mappings using foreign keys and unique constraints:

```
┌─────────────────────────┐                ┌─────────────────────────┐
│        residents        │                │          rooms          │
├─────────────────────────┤                ├─────────────────────────┤
│ id (PK)         INTEGER │───┐        ┌───│ id (PK)         INTEGER │
│ name            TEXT    │   │        │   │ name            TEXT    │
│ email           TEXT    │   │        │   │ block           TEXT    │
└─────────────────────────┘   │        │   └─────────────────────────┘
                              │        │
                              ▼        ▼
                   ┌───────────────────────────────┐
                   │          allotments           │
                   ├───────────────────────────────┤
                   │ id (PK)               INTEGER │
                   │ resident_id (FK)      INTEGER │
                   │ room_id (FK, UNIQUE)  INTEGER │
                   └───────────────────────────────┘
```

- **`residents` to `allotments` (One-to-Many):** One resident can hold room allocations across different contexts, referenced by foreign key `resident_id`.
- **`rooms` to `allotments` (One-to-One):** Each room can be allotted to at most one resident at any given time. This rule is enforced by the `UNIQUE` constraint placed on `allotments.room_id`.
- **Referential Integrity Enforcement:** Foreign keys prevent assigning non-existent residents or rooms. When attempting to delete a room that is actively allotted, the controller checks the `allotments` table and aborts with HTTP `409 Conflict`.

---

## 9. Project Folder Structure

```
hostelhub/
├── controllers/
│   ├── allotmentController.js    # Allotment business logic & SQL JOIN queries
│   ├── residentController.js     # Resident CRUD business logic
│   └── roomController.js          # Room CRUD logic & Smart Search implementation
├── database/
│   ├── db.js                     # SQLite connection, table DDL, and sample seeder
│   └── hostelhub.db              # Persistent SQLite database file
├── middleware/
│   └── validate.js               # Express validation middleware (IDs, body fields)
├── node_modules/                 # Installed project dependencies
├── postman/
│   └── HostelHub_API_Testing.postman_collection.json # 13 automated Postman tests
├── routes/
│   ├── allotmentRoutes.js        # Route mappings for /allotments
│   ├── residentRoutes.js         # Route mappings for /residents
│   └── roomRoutes.js             # Route mappings for /rooms
├── tests/                        # Dedicated directory for test suites
├── _test_server.js               # Automated integration verification script
├── app.js                        # Express app configuration & server initialization
├── package.json                  # Project dependencies, scripts, and metadata
├── package-lock.json             # Locked dependency versions
└── README.md                     # Comprehensive project documentation
```

---

## 10. API Documentation

### Base URL

```
http://localhost:3000
```

### Standard Response Format

HostelHub APIs return responses in standard JSON format:

- **Success Responses:** Include `"status": "success"` and a `"data"` object or array.
- **Error Responses:** Include `"status": "error"`, a descriptive `"message"`, and optional `"errors"` validation arrays.

### Content-Type

All `POST` and `PUT` request bodies must include the header:
```http
Content-Type: application/json
```

---

## 11. API Endpoints and HTTP Methods

### System & Health Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/` | Root endpoint welcome message | `200 OK` |
| `GET` | `/health` | Server uptime and health status | `200 OK` |

### Rooms Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/rooms` | Retrieve all rooms | `200 OK`, `500 Internal Server Error` |
| `GET` | `/rooms?q={search_term}` | Smart search rooms by name or block | `200 OK`, `500 Internal Server Error` |
| `GET` | `/rooms/:id` | Retrieve a single room by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/rooms` | Create a new room | `201 Created`, `400 Bad Request`, `500 Internal Server Error` |
| `PUT` | `/rooms/:id` | Update an existing room by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/rooms/:id` | Delete a room by ID | `204 No Content`, `400 Bad Request`, `404 Not Found`, `409 Conflict` |

### Residents Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/residents` | Retrieve all registered residents | `200 OK`, `500 Internal Server Error` |
| `GET` | `/residents/:id` | Retrieve a single resident by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/residents` | Register a new resident | `201 Created`, `400 Bad Request`, `500 Internal Server Error` |

### Allotments Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/allotments` | Retrieve all allotments with SQL JOIN | `200 OK`, `500 Internal Server Error` |
| `POST` | `/allotments` | Assign a room to a resident | `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict` |

---

## 12. Smart Search Functionality

The smart search functionality is accessible through the `GET /rooms?q={search_term}` endpoint. It allows hostel managers to quickly locate rooms by typing any portion of a room name or block identifier.

### SQL Implementation

The search query uses SQL parameterized input combined with `LIKE` and `COLLATE NOCASE` to ensure security and case-insensitivity:

```sql
SELECT * FROM rooms 
WHERE name LIKE ? COLLATE NOCASE 
   OR block LIKE ? COLLATE NOCASE;
```
*(Parameter values passed as `%${q.trim()}%`)*

### Characteristics
- **Partial Matching:** Matches patterns anywhere within the `name` or `block` attributes.
- **Case-Insensitive:** Treats uppercase, lowercase, and mixed-case inputs identically.
- **SQL Injection Safe:** Uses prepared statements with bound parameters (`?`).
- **Graceful Empty State:** When no records match, the API returns HTTP `200 OK` with an empty array and descriptive message, rather than a `404` error.

### Three Smart Search Test Cases

#### Test Case 1: Lowercase Partial Search
- **Request:** `GET /rooms?q=room`
- **Expected Status:** `200 OK`
- **Behavior:** Returns all room records whose `name` or `block` contains the lowercase substring `"room"` (e.g., `"Room 101"`, `"Room 102"`, `"Room 201"`, `"Room 202"`).

#### Test Case 2: Uppercase Case-Insensitive Verification
- **Request:** `GET /rooms?q=ROOM`
- **Expected Status:** `200 OK`
- **Behavior:** Returns the exact same set of records as Test Case 1, confirming case-insensitivity across uppercase and lowercase inputs.

#### Test Case 3: No Match Handling
- **Request:** `GET /rooms?q=zzz`
- **Expected Status:** `200 OK`
- **Expected Response Body:**
  ```json
  {
    "message": "Nothing found",
    "rooms": []
  }
  ```
- **Behavior:** Returns an explicit HTTP `200 OK` with `{ "message": "Nothing found", "rooms": [] }`, confirming that empty search queries do not trigger false `404 Not Found` errors.

---

## 13. Validation and Error Handling

HostelHub uses a dedicated validation middleware layer (`middleware/validate.js`) that intercepts requests and validates input before passing execution to the controllers.

### Middleware Validators

| Middleware Function | Scope | Validation Rules |
|---|---|---|
| `validateId(paramName)` | All routes with `/:id` | Checks that ID is supplied, is a valid integer, and is strictly greater than 0 (`id > 0`). |
| `validateRoomInput` | `POST /rooms`, `PUT /rooms/:id` | Validates that `name` and `block` are provided, are string types, and are not empty after trimming whitespace. |
| `validateResidentInput` | `POST /residents` | Validates that `name` is a non-empty string and `email` conforms to standard email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`). |
| `validateAllotmentInput` | `POST /allotments` | Checks that `resident_id` and `room_id` are both provided and are valid positive integers. |

### HTTP Status Code Standards

| Status Code | Description | Scenario in HostelHub |
|---|---|---|
| `200 OK` | Request succeeded | Successful `GET` queries, updates via `PUT`, and search operations |
| `201 Created` | Resource created | Successful `POST` creations for rooms, residents, or allotments |
| `204 No Content` | Action succeeded with no body | Successful `DELETE` of a room |
| `400 Bad Request` | Client input error | Malformed IDs, missing required fields, or invalid email format |
| `404 Not Found` | Resource absent | Target room or resident ID does not exist in the database |
| `409 Conflict` | Business rule conflict | Attempting to allot an already-occupied room, or deleting an allotted room |
| `500 Internal Server Error` | Server execution error | Unexpected database or internal runtime failure |

### Standardized Error Payload Examples

**Validation Failure (`400 Bad Request`):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "Room name is required",
    "Block name must be a non-empty string"
  ]
}
```

**Invalid ID (`400 Bad Request`):**
```json
{
  "status": "error",
  "message": "Invalid id: must be a positive integer"
}
```

**Not Found (`404 Not Found`):**
```json
{
  "status": "error",
  "message": "Room with id 999 not found"
}
```

**Conflict (`409 Conflict`):**
```json
{
  "status": "error",
  "message": "Room with id 1 is already allotted to another resident"
}
```

---

## 14. Installation Instructions

### Prerequisites

Ensure you have the following installed on your workstation:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (Node Package Manager, distributed automatically with Node.js)

Verify your Node.js and npm installations:
```bash
node -v
npm -v
```

### Step-by-Step Installation

1. **Clone the repository or extract the project directory:**
   ```bash
   cd hostelhub
   ```

2. **Install all required project dependencies:**
   ```bash
   npm install
   ```
   This command installs the packages specified in `package.json`:
   - `express`: Core web application framework.
   - `better-sqlite3`: High-performance SQLite driver.
   - `nodemon` *(devDependency)*: Automatically restarts the node application upon file modifications.

---

## 15. How to Run the Project

### Running in Development Mode (Recommended)

To start the server with live auto-reloading using `nodemon`:

```bash
npm run dev
```

### Running in Production Mode

To start the server directly using Node:

```bash
npm start
```

### Server Startup Output

Upon running the server, the terminal displays confirmation of database connection, constraint activation, table readiness, and listening address:

```text
Connected to SQLite database at .../hostelhub/database/hostelhub.db
Foreign key constraints enabled
All tables created successfully
Sample data already exists, skipping seed
HostelHub server is running on http://localhost:3000
Health check: http://localhost:3000/health
```

### Verifying Server Health

Confirm the API is healthy by visiting `http://localhost:3000/health` in your browser or executing:

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "success",
  "message": "HostelHub server is running",
  "timestamp": "2026-11-15T10:00:00.000Z"
}
```

---

## 16. Postman Testing Instructions

HostelHub includes an exportable, pre-configured Postman test suite containing **13 automated test requests** located at `postman/HostelHub_API_Testing.postman_collection.json`.

### Step 1: Import the Collection
1. Launch the **Postman** application.
2. In the top-left navigation panel, click the **Import** button.
3. Choose the file located at `postman/HostelHub_API_Testing.postman_collection.json`.
4. The collection named **HostelHub API Testing** will appear in your Postman Collections panel.

### Step 2: Configure Environment Variables
The collection contains a default collection variable `baseUrl` set to:
```
http://localhost:3000
```
No extra environment configuration is required unless you modify the port in `app.js`.

### Step 3: Execute the Test Suite
1. Ensure your local server is running via `npm run dev`.
2. Right-click the **HostelHub API Testing** collection in Postman and select **Run collection**.
3. Confirm that all 13 requests are selected.
4. Click **Run HostelHub API Testing**.

### Postman Test Suite Breakdown

| # | Folder | Request Name | Method & Target | Test Assertions |
|---|---|---|---|---|
| 1 | **Rooms** | 1. Get All Rooms | `GET /rooms` | Status 200, status `'success'`, data array structure |
| 2 | **Rooms** | 2. Get Room by ID | `GET /rooms/1` | Status 200, checks `id: 1`, validates properties |
| 3 | **Rooms** | 3. Add Room | `POST /rooms` | Status 201, creates `"Room 301"`, captures `createdRoomId` |
| 4 | **Rooms** | 4. Update Room | `PUT /rooms/{{createdRoomId}}` | Status 200, validates name updated to `"Room 301-A"` |
| 5 | **Rooms** | 5. Delete Room | `DELETE /rooms/{{createdRoomId}}` | Status 204, confirms deletion of created room |
| 6 | **Residents** | 6. Get All Residents | `GET /residents` | Status 200, validates array and resident object properties |
| 7 | **Residents** | 7. Get Resident by ID | `GET /residents/1` | Status 200, validates resident `id: 1` details |
| 8 | **Residents** | 8. Add Resident | `POST /residents` | Status 201, creates resident `"Suresh Menon"` |
| 9 | **Allotments** | 9. Get All Allotments (JOIN) | `GET /allotments` | Status 200, verifies joined fields (`resident_name`, `room_name`, `block`) |
| 10 | **Allotments** | 10. Create Allotment | `POST /allotments` | Status 201, allots room 4 to resident 3, verifies joined payload |
| 11 | **Smart Search** | 11. Smart Search — `q=room` | `GET /rooms?q=room` | Status 200, validates all matched rooms contain `"room"` |
| 12 | **Smart Search** | 12. Smart Search — `q=ROOM` | `GET /rooms?q=ROOM` | Status 200, verifies identical count & results as lowercase |
| 13 | **Smart Search** | 13. Smart Search — `q=zzz` | `GET /rooms?q=zzz` | Status 200, validates empty array and `"Nothing found"` message |

---

## 17. Sample API Requests and Responses

### 1. Create a New Room
- **Method:** `POST`
- **Endpoint:** `/rooms`
- **Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Room 301",
  "block": "Block C"
}
```

**Response (`201 Created`):**
```json
{
  "status": "success",
  "message": "Room created successfully",
  "data": {
    "id": 5,
    "name": "Room 301",
    "block": "Block C"
  }
}
```

---

### 2. Get All Rooms
- **Method:** `GET`
- **Endpoint:** `/rooms`

**Response (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Room 101",
      "block": "Block A"
    },
    {
      "id": 2,
      "name": "Room 102",
      "block": "Block A"
    },
    {
      "id": 3,
      "name": "Room 201",
      "block": "Block B"
    },
    {
      "id": 4,
      "name": "Room 202",
      "block": "Block B"
    }
  ]
}
```

---

### 3. Update a Room
- **Method:** `PUT`
- **Endpoint:** `/rooms/1`
- **Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Room 101-A",
  "block": "Block A"
}
```

**Response (`200 OK`):**
```json
{
  "status": "success",
  "message": "Room updated successfully",
  "data": {
    "id": 1,
    "name": "Room 101-A",
    "block": "Block A"
  }
}
```

---

### 4. Delete an Unoccupied Room
- **Method:** `DELETE`
- **Endpoint:** `/rooms/5`

**Response (`204 No Content`):**
*(Empty response body)*

---

### 5. Create a Resident
- **Method:** `POST`
- **Endpoint:** `/residents`
- **Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Suresh Menon",
  "email": "suresh.menon@email.com"
}
```

**Response (`201 Created`):**
```json
{
  "status": "success",
  "message": "Resident created successfully",
  "data": {
    "id": 4,
    "name": "Suresh Menon",
    "email": "suresh.menon@email.com"
  }
}
```

---

### 6. Create an Allotment
- **Method:** `POST`
- **Endpoint:** `/allotments`
- **Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "resident_id": 3,
  "room_id": 4
}
```

**Response (`201 Created`):**
```json
{
  "status": "success",
  "message": "Room allotted successfully",
  "data": {
    "id": 3,
    "resident_name": "Rahul Verma",
    "room_name": "Room 202",
    "block": "Block B"
  }
}
```

---

### 7. Get All Allotments (SQL JOIN Query)
- **Method:** `GET`
- **Endpoint:** `/allotments`

**Response (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "resident_name": "Arun Kumar",
      "room_name": "Room 101",
      "block": "Block A"
    },
    {
      "id": 2,
      "resident_name": "Priya Sharma",
      "room_name": "Room 201",
      "block": "Block B"
    }
  ]
}
```

---

### 8. Smart Search — No Match Found
- **Method:** `GET`
- **Endpoint:** `/rooms?q=zzz`

**Response (`200 OK`):**
```json
{
  "message": "Nothing found",
  "rooms": []
}
```

---

### 9. Validation Error Response
- **Method:** `POST`
- **Endpoint:** `/rooms`
- **Request Body:** `{}`

**Response (`400 Bad Request`):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "Room name is required",
    "Block name is required"
  ]
}
```

---

### 10. Conflict Error — Room Already Allotted
- **Method:** `POST`
- **Endpoint:** `/allotments`
- **Request Body:**
  ```json
  {
    "resident_id": 3,
    "room_id": 1
  }
  ```

**Response (`409 Conflict`):**
```json
{
  "status": "error",
  "message": "Room with id 1 is already allotted to another resident"
}
```

---

### 11. Conflict Error — Deleting an Allotted Room
- **Method:** `DELETE`
- **Endpoint:** `/rooms/1`

**Response (`409 Conflict`):**
```json
{
  "status": "error",
  "message": "Cannot delete room with id 1 because it is currently allotted to a resident"
}
```

---

## 18. Group Members and Responsibilities

| Group Member | Primary Roles & Responsibilities | Key Deliverables |
|---|---|---|
| **Member 1** | Project Architecture & Server Setup | Express application configuration, modular routing setup, graceful shutdown mechanisms |
| **Member 2** | Database Engineering & Relational Design | SQLite schema creation, foreign key configurations, transactions, idempotent sample data seeding |
| **Member 3** | Room Domain & Validation Middleware | Full CRUD endpoints for `/rooms`, reusable request body & ID validation middleware |
| **Member 4** | Resident Domain & Relational Allotment Logic | Resident registration endpoints, conflict-free room allocation engine, SQL `JOIN` query logic |
| **Member 5** | Smart Search, API Testing & Documentation | Case-insensitive Smart Search (`LIKE ... COLLATE NOCASE`), 13 Postman test cases, comprehensive README documentation |

> *Note: Update the table above with your specific group member names prior to project submission.*

---

## 19. Conclusion

The **HostelHub Room Allotment Management System** represents a production-grade backend demonstration of REST API development fundamentals:

- **Clean Architectural Separation:** Clear division between routing (`routes/`), request validation (`middleware/`), business logic execution (`controllers/`), and data storage (`database/`).
- **Relational Integrity:** Rigorous use of primary keys, foreign keys, and unique constraints in SQLite to preserve referential consistency and prevent room over-allocation.
- **Defensive Error Handling:** Comprehensive request sanitization, positive integer validation, duplicate detection, and standard HTTP response status codes.
- **Smart Data Retrieval:** Flexible querying through parameterized, case-insensitive partial searches and multi-table SQL `JOIN` operations.
- **Test Automation:** Fully automated Postman collection validating all standard, edge, and error test scenarios across the system lifecycle.
