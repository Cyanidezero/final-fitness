# XAMPP Database Setup Instructions

## Step-by-Step Guide to Set Up Database in XAMPP

### 1. Start XAMPP Services

1. Open **XAMPP Control Panel**
2. Start **Apache** (click Start button)
3. Start **MySQL** (click Start button)
   - Make sure both show "Running" in green

### 2. Create Database in phpMyAdmin

1. Open your web browser
2. Go to: `http://localhost/phpmyadmin`
3. Click **"New"** in the left sidebar (or click "Databases" tab at the top)
4. Enter database name: **`fitness_db`**
5. Choose Collation: **`utf8mb4_general_ci`** (or leave default)
6. Click **"Create"** button

### 3. Import SQL File

**Method 1: Using Import Tab (Recommended)**

1. In phpMyAdmin, make sure **`fitness_db`** is selected in the left sidebar
2. Click the **"Import"** tab at the top
3. Click **"Choose File"** or **"Browse"** button
4. Navigate to: `fitness-unfinished/backend/database-xampp.sql`
5. Select the file
6. Scroll down and click **"Go"** or **"Import"** button
7. Wait for success message: "Import has been successfully finished"

**Method 2: Using SQL Tab**

1. In phpMyAdmin, make sure **`fitness_db`** is selected
2. Click the **"SQL"** tab at the top
3. Open `database-xampp.sql` in a text editor
4. Copy ALL the SQL code
5. Paste it into the SQL text area in phpMyAdmin
6. Click **"Go"** button

### 4. Verify Database Creation

After importing, you should see these tables in the left sidebar:
- ✅ users
- ✅ food_database
- ✅ exercise_database
- ✅ food_logs
- ✅ exercise_logs
- ✅ water_logs
- ✅ login_history
- ✅ daily_summary

### 5. Check Data

1. Click on **`food_database`** table
2. Click **"Browse"** tab
3. You should see 30+ food entries

1. Click on **`exercise_database`** table
2. Click **"Browse"** tab
3. You should see 15 exercise entries

### 6. Configure Backend Connection

The backend `index.js` should already be configured for XAMPP defaults:

```javascript
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",  // XAMPP default: empty password
  database: "fitness_db"
});
```

**If you changed your MySQL root password:**
1. Open `fitness-unfinished/backend/index.js`
2. Find line 55-59
3. Update the password if needed

### 7. Test Backend Connection

1. Open terminal/command prompt
2. Navigate to: `fitness-unfinished/backend`
3. Run: `node index.js`
4. You should see: **"MySQL Connected"** in the console

### Troubleshooting

**Problem: "Access denied for user 'root'@'localhost'"**
- Solution: Your MySQL root password might not be empty
- Edit `backend/index.js` and set the correct password

**Problem: "Unknown database 'fitness_db'"**
- Solution: Make sure you created the database first (Step 2)
- Or the database name is different

**Problem: "Table doesn't exist"**
- Solution: Make sure you imported the SQL file correctly (Step 3)
- Try importing again

**Problem: "Cannot connect to MySQL"**
- Solution: Make sure MySQL is running in XAMPP Control Panel
- Check that MySQL port 3306 is not blocked by firewall

**Problem: Tables show but no data**
- Solution: The INSERT statements might have failed
- Check the SQL import result for any errors
- Try running the INSERT statements manually from the SQL tab

### Quick Test Query

In phpMyAdmin SQL tab, try:
```sql
SELECT COUNT(*) as total_foods FROM food_database;
SELECT COUNT(*) as total_exercises FROM exercise_database;
```

Both should return numbers > 0.

---

**Once everything is set up, your database is ready to use!**

The backend will automatically connect when you run `node index.js` in the backend folder.
