# Restaurant Reservation System

This project is a simple restaurant reservation system with a React frontend and a Node.js (Express) backend.

## Getting Started

### Backend (Node.js/Express)

1. Open a terminal and navigate to `server` directory:
   ```powershell
   cd "e:\Resturant Reservation System\server"
   ```
2. Start the server:
   ```powershell
   node index.js
   ```
   The backend will run on http://localhost:5000

### Frontend (React)

1. Open a new terminal and navigate to `client` directory:
   ```powershell
   cd "e:\Resturant Reservation System\client"
   ```
2. Start the React app:
   ```powershell
   npm start
   ```
   The frontend will run on http://localhost:3000

## Features

- View available tables
- Make a reservation
- View all reservations

## Notes

- This is a demo using in-memory data. Reservations and tables will reset when the server restarts.
- For production, connect to a real database and add authentication.
