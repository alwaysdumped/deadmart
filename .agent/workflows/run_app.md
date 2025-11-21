---
description: How to run the Live MART application (Database, Backend, Frontend)
---

To run the full application, you need to start three separate components in separate terminals.

### 1. Start MongoDB
Ensure MongoDB is running locally.
- **Windows**: Open a terminal and run `mongod` (if added to PATH) or start the MongoDB service.
- **Mac/Linux**: Run `brew services start mongodb-community` or `sudo systemctl start mongod`.

### 2. Start Backend Server
Open a new terminal:
```bash
cd backend
npm run dev
```
*You should see "MongoDB Connected" and "Server running on port 5000".*

### 3. Start Frontend Application
Open a new terminal:
```bash
// turbo
npm run dev
```
*You should see "Local: http://localhost:5173".*

### 4. Access the App
Open your browser and go to [http://localhost:5173](http://localhost:5173).
