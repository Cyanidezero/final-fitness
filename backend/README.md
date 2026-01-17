# Fitness Tracker Backend API

Complete backend database system for the Fitness Tracker application with food database, exercise database, calorie tracking, and automatic day streak tracking.

## Features

- ✅ **Food Database** - Complete food database with calories, macros, and search functionality
- ✅ **Exercise Database** - Exercise types with MET values for calorie calculation
- ✅ **Calorie Tracking** - Automatic daily summary calculation
- ✅ **Day Streak** - Automatically increments when users login daily
- ✅ **Food Logging** - Track food intake with AI scanning support
- ✅ **Exercise Logging** - Track workouts and calories burned
- ✅ **Water Logging** - Track daily water intake

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Update the database connection in `index.js`:

```javascript
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "YOUR_PASSWORD", // Update this
  database: "fitness_db"
});
```

### 3. Initialize Database

Run the initialization script:

```bash
node init-database.js
```

Or manually run the SQL file:

```bash
mysql -u root -p < database.sql
```

### 4. Start Server

```bash
node index.js
```

The server will run on `http://localhost:3000`

## API Endpoints

### Food Database

- `GET /api/foods` - Get all foods
- `GET /api/foods/search?query=chicken` - Search foods
- `GET /api/foods/:id` - Get food by ID

### Exercise Database

- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/type/:type` - Get exercises by type
- `GET /api/exercises/met/:type` - Get MET value for exercise type

### Authentication

- `POST /api/auth/login` - User login (auto increments day streak)
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Food Logging

- `POST /api/food/log` - Log food entry
- `GET /api/food/logs/:user_id?date=2024-01-01` - Get user food logs
- `DELETE /api/food/logs/:id` - Delete food log

### Exercise Logging

- `POST /api/exercise/log` - Log exercise entry
- `GET /api/exercise/logs/:user_id?date=2024-01-01` - Get user exercise logs
- `DELETE /api/exercise/logs/:id` - Delete exercise log

### Water Logging

- `POST /api/water/log` - Log water intake
- `GET /api/water/logs/:user_id?date=2024-01-01` - Get user water logs
- `DELETE /api/water/logs/:id` - Delete water log

### Daily Summary

- `GET /api/summary/:user_id?date=2024-01-01` - Get daily calorie and macro summary

### Existing Endpoints

- `POST /api/nutriscan/analyze` - AI food scanning
- `POST /api/food/log` - Log scanned food
- `GET /food-suggestions/:goal` - Get food suggestions by goal
- `GET /user/:user_id` - Get user data

## Day Streak Logic

The day streak automatically increments when:
1. User logs in for the first time today
2. Last login was yesterday (consecutive day)
3. Streak resets to 1 if last login was not yesterday

The streak is tracked in the `users` table and `login_history` table.

## Database Schema

### Tables

- **users** - User accounts with profile data
- **food_database** - Master food database
- **exercise_database** - Master exercise database
- **food_logs** - User food entries
- **exercise_logs** - User exercise entries
- **water_logs** - User water intake entries
- **login_history** - Tracks daily logins for streak calculation
- **daily_summary** - Aggregated daily stats (auto-calculated)

## Example Usage

### Login (Auto Day Streak)

```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "day_streak": 5,
    ...
  },
  "message": "Day streak: 5 days!"
}
```

### Log Food

```javascript
POST /api/food/log
{
  "user_id": 1,
  "food_name": "Grilled Chicken Breast",
  "calories": 165,
  "protein": 31,
  "carbs": 0,
  "fat": 3.6,
  "meal_type": "lunch"
}
```

### Get Daily Summary

```javascript
GET /api/summary/1?date=2024-01-15

Response:
{
  "success": true,
  "data": {
    "total_calories_consumed": 1850,
    "total_calories_burned": 300,
    "net_calories": 1550,
    "total_protein": 120,
    "total_carbs": 180,
    "total_fat": 45,
    "water_intake": 2.5
  }
}
```

## Notes

- All dates should be in `YYYY-MM-DD` format
- Times should be in `HH:MM:SS` format
- The daily summary is automatically calculated when food/exercise/water is logged
- Day streak increments only once per day on first login
