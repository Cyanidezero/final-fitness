-- Fitness Tracker Database Schema for XAMPP
-- Import this file into phpMyAdmin:
-- 1. Open phpMyAdmin (http://localhost/phpmyadmin)
-- 2. Click "New" to create a database
-- 3. Name it "fitness_db"
-- 4. Click "Import" tab
-- 5. Choose this file and click "Go"

-- Create database (if not exists - XAMPP phpMyAdmin may already create it)
CREATE DATABASE IF NOT EXISTS fitness_db;
USE fitness_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INT,
    gender ENUM('male', 'female', 'other'),
    height DECIMAL(5,2) COMMENT 'Height in cm',
    weight DECIMAL(5,2) COMMENT 'Weight in kg',
    bmi DECIMAL(4,2),
    goal ENUM('weight_loss', 'muscle_gain', 'maintenance') DEFAULT 'maintenance',
    activity ENUM('sedentary', 'light', 'moderate', 'active', 'very_active') DEFAULT 'moderate',
    daily_calories INT,
    day_streak INT DEFAULT 0,
    last_login_date DATE,
    join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Food Database (Master list of all foods)
CREATE TABLE IF NOT EXISTS food_database (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    calories INT NOT NULL,
    protein DECIMAL(5,2) DEFAULT 0,
    carbs DECIMAL(5,2) DEFAULT 0,
    fat DECIMAL(5,2) DEFAULT 0,
    serving VARCHAR(100),
    category VARCHAR(50),
    icon VARCHAR(50),
    keywords TEXT COMMENT 'Comma-separated keywords for search',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercise Database (Master list of all exercises)
CREATE TABLE IF NOT EXISTS exercise_database (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'running, jogging, cycling, etc.',
    met_value DECIMAL(4,2) NOT NULL COMMENT 'Metabolic Equivalent of Task',
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Food Logs (User's daily food entries)
CREATE TABLE IF NOT EXISTS food_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    food_name VARCHAR(255) NOT NULL,
    calories INT NOT NULL,
    protein DECIMAL(5,2) DEFAULT 0,
    carbs DECIMAL(5,2) DEFAULT 0,
    fat DECIMAL(5,2) DEFAULT 0,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') DEFAULT 'lunch',
    log_date DATE NOT NULL,
    log_time TIME,
    scanned TINYINT(1) DEFAULT 0 COMMENT '1 if scanned via AI, 0 if manual',
    confidence VARCHAR(10) DEFAULT '100%',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, log_date),
    INDEX idx_user_id (user_id)
);

-- Exercise Logs (User's daily exercise entries)
CREATE TABLE IF NOT EXISTS exercise_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    exercise_name VARCHAR(255) NOT NULL,
    exercise_type VARCHAR(50),
    duration INT NOT NULL COMMENT 'Duration in minutes',
    calories INT NOT NULL COMMENT 'Calories burned',
    log_date DATE NOT NULL,
    log_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, log_date),
    INDEX idx_user_id (user_id)
);

-- Water Logs (User's daily water intake)
CREATE TABLE IF NOT EXISTS water_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(4,2) NOT NULL COMMENT 'Amount in liters',
    log_date DATE NOT NULL,
    log_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, log_date),
    INDEX idx_user_id (user_id)
);

-- Login History (Track user logins for streak calculation)
CREATE TABLE IF NOT EXISTS login_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    login_date DATE NOT NULL,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, login_date),
    INDEX idx_user_date (user_id, login_date)
);

-- Daily Summary (Aggregated daily stats)
CREATE TABLE IF NOT EXISTS daily_summary (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    summary_date DATE NOT NULL,
    total_calories_consumed INT DEFAULT 0,
    total_calories_burned INT DEFAULT 0,
    net_calories INT DEFAULT 0,
    total_protein DECIMAL(6,2) DEFAULT 0,
    total_carbs DECIMAL(6,2) DEFAULT 0,
    total_fat DECIMAL(6,2) DEFAULT 0,
    water_intake DECIMAL(5,2) DEFAULT 0 COMMENT 'In liters',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, summary_date),
    INDEX idx_user_date (user_id, summary_date)
);

-- Insert default food database entries
INSERT INTO food_database (name, calories, protein, carbs, fat, serving, category, icon, keywords) VALUES
-- Proteins
('Grilled Chicken Breast', 165, 31, 0, 3.6, '100g', 'protein', 'fa-drumstick-bite', 'chicken,grilled,breast,poultry'),
('Salmon', 206, 22, 0, 13, '100g', 'protein', 'fa-fish', 'salmon,fish,seafood'),
('Eggs (2 whole)', 143, 13, 1, 10, '2 eggs', 'protein', 'fa-egg', 'eggs,egg,breakfast,protein'),
('Lean Beef Steak', 250, 26, 0, 15, '100g', 'protein', 'fa-drumstick-bite', 'beef,steak,meat,protein'),
('Tofu', 76, 8, 2, 4.8, '100g', 'protein', 'fa-cube', 'tofu,soy,vegetarian,protein'),

-- Carbs
('Brown Rice (cooked)', 112, 2.6, 23, 0.9, '100g', 'grain', 'fa-seedling', 'rice,brown,grain'),
('White Rice (cooked)', 130, 2.7, 28, 0.3, '100g', 'grain', 'fa-seedling', 'rice,white,grain'),
('Quinoa (cooked)', 120, 4.4, 22, 1.9, '100g', 'grain', 'fa-seedling', 'quinoa,grain,healthy'),
('Sweet Potato', 86, 1.6, 20, 0.1, '100g', 'vegetable', 'fa-seedling', 'sweet potato,potato,vegetable'),
('Whole Wheat Bread', 247, 13, 41, 4.2, '100g', 'grain', 'fa-bread-slice', 'bread,whole wheat,grain'),
('Oatmeal', 68, 2.4, 12, 1.4, '100g cooked', 'grain', 'fa-seedling', 'oatmeal,oats,breakfast,grain'),

-- Vegetables
('Broccoli', 34, 2.8, 7, 0.4, '100g', 'vegetable', 'fa-leaf', 'broccoli,vegetable,green'),
('Spinach', 23, 2.9, 3.6, 0.4, '100g', 'vegetable', 'fa-leaf', 'spinach,vegetable,green'),
('Salad Bowl', 120, 5, 15, 6, '1 bowl', 'vegetable', 'fa-leaf', 'salad,greens,vegetable,lettuce'),
('Carrots', 41, 0.9, 10, 0.2, '100g', 'vegetable', 'fa-carrot', 'carrots,vegetable,orange'),

-- Fruits
('Guava', 68, 2.6, 14, 1, '100g', 'fruit', 'fa-apple-alt', 'guava,fruit,tropical'),
('Apple', 52, 0.3, 14, 0.2, '100g', 'fruit', 'fa-apple-alt', 'apple,fruit,red,green'),
('Banana', 89, 1.1, 23, 0.3, '100g', 'fruit', 'fa-banana', 'banana,fruit,yellow'),
('Blueberries', 57, 0.7, 14, 0.3, '100g', 'fruit', 'fa-apple-alt', 'blueberries,berry,fruit'),
('Orange', 47, 0.9, 12, 0.1, '100g', 'fruit', 'fa-apple-alt', 'orange,fruit,citrus'),

-- Fats
('Avocado', 160, 2, 9, 15, '100g', 'fruit', 'fa-leaf', 'avocado,fruit,healthy fat'),
('Almonds', 579, 21, 22, 50, '100g', 'snack', 'fa-seedling', 'almonds,nuts,snack'),
('Peanut Butter', 588, 25, 20, 50, '100g', 'snack', 'fa-mortar-pestle', 'peanut butter,nuts,spread'),
('Olive Oil', 884, 0, 0, 100, '100g', 'fat', 'fa-tint', 'olive oil,oil,fat'),

-- Dairy
('Greek Yogurt', 100, 18, 6, 0.4, '100g', 'dairy', 'fa-mortar-pestle', 'yogurt,greek,dairy'),
('Cottage Cheese', 98, 11, 3.4, 4.3, '100g', 'dairy', 'fa-mortar-pestle', 'cottage cheese,cheese,dairy'),
('Milk (2%)', 50, 3.3, 5, 2, '100ml', 'dairy', 'fa-mortar-pestle', 'milk,dairy,drink'),

-- Other
('Protein Shake', 180, 30, 10, 2, '1 serving', 'supplement', 'fa-blender', 'protein,shake,supplement,drink'),
('Energy Bar', 250, 10, 30, 8, '1 bar', 'snack', 'fa-cookie', 'energy bar,snack,bar');

-- Insert default exercise database entries
INSERT INTO exercise_database (name, type, met_value, description, icon) VALUES
('Running', 'running', 11.5, 'Running at moderate pace (6-7 mph)', 'fa-running'),
('Jogging', 'jogging', 7.0, 'Jogging at slow pace (5 mph)', 'fa-running'),
('Walking', 'walking', 3.5, 'Walking at moderate pace (3.5 mph)', 'fa-walking'),
('Cycling', 'cycling', 8.0, 'Cycling at moderate pace (12-14 mph)', 'fa-bicycle'),
('Swimming', 'swimming', 8.3, 'Swimming laps at moderate pace', 'fa-swimmer'),
('Weight Lifting', 'weightlifting', 5.0, 'Weight training/resistance training', 'fa-dumbbell'),
('Yoga', 'yoga', 2.5, 'Hatha yoga, general practice', 'fa-spa'),
('Pilates', 'pilates', 3.0, 'Pilates exercises', 'fa-spa'),
('Dancing', 'dancing', 6.0, 'General dancing', 'fa-music'),
('Basketball', 'basketball', 8.0, 'Playing basketball', 'fa-basketball-ball'),
('Soccer', 'soccer', 7.0, 'Playing soccer/football', 'fa-futbol'),
('Tennis', 'tennis', 7.3, 'Playing tennis', 'fa-table-tennis'),
('Elliptical', 'elliptical', 7.0, 'Elliptical trainer', 'fa-running'),
('Rowing', 'rowing', 7.0, 'Rowing machine', 'fa-water'),
('Hiking', 'hiking', 6.0, 'Hiking with backpack', 'fa-mountain');
