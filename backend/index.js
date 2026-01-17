const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// Configure CORS properly
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'food-scan-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
    }
  }
});

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fitness_db"
});

db.connect(err => {
  if (err) {
    console.error("MySQL Connection Error:", err);
    process.exit(1);
  }
  console.log("MySQL Connected");
});

// Extended food database for better recognition
const enhancedFoodDatabase = {
  weight_loss: [
    { id: 1, name: "Greek Yogurt", calories: 100, protein: 17, carbs: 6, fat: 0.4, category: "dairy", icon: "fa-mortar-pestle", keywords: ["yogurt", "greek", "dairy"] },
    { id: 2, name: "Grilled Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, category: "protein", icon: "fa-drumstick-bite", keywords: ["chicken", "grilled", "breast", "poultry"] },
    { id: 3, name: "Steamed Broccoli", calories: 55, protein: 4, carbs: 11, fat: 0.6, category: "vegetable", icon: "fa-carrot", keywords: ["broccoli", "vegetable", "green", "steamed"] },
    { id: 4, name: "Salmon", calories: 206, protein: 22, carbs: 0, fat: 13, category: "protein", icon: "fa-fish", keywords: ["salmon", "fish", "seafood"] },
    { id: 5, name: "Quinoa Bowl", calories: 220, protein: 8, carbs: 39, fat: 4, category: "grain", icon: "fa-seedling", keywords: ["quinoa", "grain", "bowl", "healthy"] },
    { id: 6, name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, category: "fruit", icon: "fa-apple-alt", keywords: ["apple", "fruit", "red", "green"] },
    { id: 7, name: "Mixed Greens Salad", calories: 50, protein: 3, carbs: 10, fat: 2, category: "vegetable", icon: "fa-leaf", keywords: ["salad", "greens", "vegetable", "lettuce"] },
    { id: 8, name: "Avocado", calories: 160, protein: 2, carbs: 9, fat: 15, category: "fruit", icon: "fa-leaf", keywords: ["avocado", "fruit", "green", "healthy fat"] }
  ],
  muscle_gain: [
    { id: 9, name: "Protein Shake", calories: 150, protein: 30, carbs: 5, fat: 2, category: "supplement", icon: "fa-blender", keywords: ["protein", "shake", "supplement", "drink"] },
    { id: 10, name: "Brown Rice with Chicken", calories: 450, protein: 40, carbs: 45, fat: 8, category: "meal", icon: "fa-utensils", keywords: ["rice", "chicken", "meal", "brown rice"] },
    { id: 11, name: "Eggs (3 whole)", calories: 215, protein: 19, carbs: 1, fat: 15, category: "protein", icon: "fa-egg", keywords: ["eggs", "egg", "breakfast", "protein"] },
    { id: 12, name: "Lean Beef Steak", calories: 250, protein: 26, carbs: 0, fat: 15, category: "protein", icon: "fa-drumstick-bite", keywords: ["beef", "steak", "meat", "protein"] },
    { id: 13, name: "Sweet Potato", calories: 112, protein: 2, carbs: 26, fat: 0, category: "vegetable", icon: "fa-carrot", keywords: ["sweet potato", "potato", "vegetable", "orange"] },
    { id: 14, name: "Cottage Cheese", calories: 120, protein: 14, carbs: 4, fat: 5, category: "dairy", icon: "fa-cheese", keywords: ["cottage cheese", "cheese", "dairy", "protein"] }
  ],
  maintenance: [
    { id: 15, name: "Avocado Toast", calories: 250, protein: 8, carbs: 30, fat: 12, category: "meal", icon: "fa-bread-slice", keywords: ["avocado", "toast", "bread", "breakfast"] },
    { id: 16, name: "Tuna Salad", calories: 180, protein: 20, carbs: 5, fat: 9, category: "protein", icon: "fa-fish", keywords: ["tuna", "salad", "fish", "seafood"] },
    { id: 17, name: "Oatmeal", calories: 150, protein: 5, carbs: 27, fat: 3, category: "grain", icon: "fa-seedling", keywords: ["oatmeal", "oats", "breakfast", "grain"] },
    { id: 18, name: "Mixed Nuts", calories: 170, protein: 5, carbs: 6, fat: 15, category: "snack", icon: "fa-cookie-bite", keywords: ["nuts", "mixed nuts", "snack", "healthy fat"] },
    { id: 19, name: "Vegetable Soup", calories: 120, protein: 4, carbs: 20, fat: 3, category: "soup", icon: "fa-bowl-food", keywords: ["soup", "vegetable soup", "broth", "warm"] },
    { id: 20, name: "Whole Wheat Pasta", calories: 200, protein: 7, carbs: 40, fat: 1, category: "grain", icon: "fa-utensils", keywords: ["pasta", "whole wheat", "noodles", "italian"] }
  ]
};

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "NutriTrack API is running",
    version: "1.0.0",
    endpoints: {
      nutriscan: "/api/nutriscan/analyze (POST)",
      food_suggestions: "/food-suggestions/:goal (GET)",
      user_data: "/user/:user_id (GET)",
      recommendations: "/recommendations/:user_id (GET)"
    }
  });
});

// GET USER GOALS
app.get("/user/:user_id", (req, res) => {
  const { user_id } = req.params;
  console.log(`Fetching user data for ID: ${user_id}`);
  
  const sql = "SELECT id, goal, daily_calories FROM users WHERE id = ?";
  
  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    if (result.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }
    
    console.log("User found:", result[0]);
    res.json({
      success: true,
      data: result[0]
    });
  });
});

// NUTRI SCAN AI - MAIN ENDPOINT
app.post("/api/nutriscan/analyze", upload.single('image'), async (req, res) => {
  console.log("=== NutriScan Analysis Request ===");
  console.log("Headers:", req.headers);
  console.log("Body fields:", req.body);
  console.log("File:", req.file);
  
  try {
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ 
        success: false, 
        error: "No image file uploaded. Please select an image." 
      });
    }

    const { user_id, user_goal } = req.body;
    console.log(`Received: user_id=${user_id}, user_goal=${user_goal}`);
    
    // Validate required fields
    if (!user_id) {
      console.error("Missing user_id");
      return res.status(400).json({ 
        success: false, 
        error: "User ID is required" 
      });
    }

    let goal = user_goal;
    
    // If goal not provided, fetch from database
    if (!goal) {
      console.log("Fetching goal from database for user:", user_id);
      const userSql = "SELECT goal FROM users WHERE id = ?";
      db.query(userSql, [user_id], (err, result) => {
        if (err || result.length === 0) {
          console.log("Using default goal: maintenance");
          goal = 'maintenance';
        } else {
          goal = result[0].goal;
          console.log("Found goal in DB:", goal);
        }
        
        // Process the food analysis
        const analysisResult = analyzeFoodImage(req.file, goal, user_id);
        console.log("Analysis complete:", analysisResult.data.food.name);
        
        res.json(analysisResult);
      });
    } else {
      console.log("Using provided goal:", goal);
      const analysisResult = analyzeFoodImage(req.file, goal, user_id);
      console.log("Analysis complete:", analysisResult.data.food.name);
      
      res.json(analysisResult);
    }
    
  } catch (error) {
    console.error("NutriScan analysis error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to analyze image. Please try again.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Food analysis logic
function analyzeFoodImage(file, goal, userId) {
  console.log(`Analyzing food image for goal: ${goal}, user: ${userId}`);
  console.log(`File: ${file.filename}, Size: ${file.size} bytes`);
  
  // Get foods for the user's goal
  const goalFoods = enhancedFoodDatabase[goal] || enhancedFoodDatabase.maintenance;
  const allFoods = Object.values(enhancedFoodDatabase).flat();
  
  // Simulate more advanced image analysis
  const analysisResult = simulateAdvancedFoodRecognition(file, goalFoods, allFoods);
  
  return {
    success: true,
    data: {
      food: analysisResult.food,
      analysis: {
        confidence: analysisResult.confidence,
        processing_time: (Math.random() * 0.5 + 1.5).toFixed(2), // 1.5-2.0 seconds
        image_id: file.filename,
        image_url: `/uploads/${file.filename}`,
        timestamp: new Date().toISOString(),
        algorithm: "NutriScan AI v1.0"
      },
      alternatives: getAlternativeSuggestions(analysisResult.food, goalFoods),
      recommendations: getFoodRecommendations(analysisResult.food, goal)
    }
  };
}

function simulateAdvancedFoodRecognition(file, goalFoods, allFoods) {
  const filename = file.filename.toLowerCase();
  const timeOfDay = new Date().getHours();
  let matchedFood = null;
  let confidence = 85 + Math.floor(Math.random() * 15); // 85-99%
  
  // More sophisticated keyword matching
  const keywordMatches = [];
  
  // Check each food for keyword matches
  allFoods.forEach(food => {
    food.keywords.forEach(keyword => {
      if (filename.includes(keyword)) {
        keywordMatches.push({ food, score: 1 });
      }
    });
  });
  
  // If we found keyword matches, use the first one
  if (keywordMatches.length > 0) {
    matchedFood = keywordMatches[0].food;
    confidence = Math.min(99, confidence + 5); // Boost confidence for keyword match
  }
  
  // If no keyword match, select based on time of day and goal
  if (!matchedFood) {
    let filteredFoods = goalFoods;
    
    // Time-based filtering
    if (timeOfDay >= 6 && timeOfDay < 11) {
      // Breakfast foods
      filteredFoods = filteredFoods.filter(f => 
        ['dairy', 'fruit', 'grain', 'meal'].includes(f.category));
    } else if (timeOfDay >= 11 && timeOfDay < 16) {
      // Lunch foods
      filteredFoods = filteredFoods.filter(f => 
        ['protein', 'meal', 'vegetable'].includes(f.category));
    } else if (timeOfDay >= 16 && timeOfDay < 22) {
      // Dinner foods
      filteredFoods = filteredFoods.filter(f => 
        ['protein', 'meal', 'vegetable'].includes(f.category));
    } else {
      // Late night snacks
      filteredFoods = filteredFoods.filter(f => 
        ['fruit', 'snack', 'dairy'].includes(f.category));
    }
    
    // If filtered list is empty, use all goal foods
    if (filteredFoods.length === 0) {
      filteredFoods = goalFoods;
    }
    
    // Random selection from filtered list
    const randomIndex = Math.floor(Math.random() * filteredFoods.length);
    matchedFood = filteredFoods[randomIndex];
  }
  
  // Add realistic variance
  const variance = 0.85 + Math.random() * 0.3; // 0.85-1.15
  
  return {
    food: {
      ...matchedFood,
      calories: Math.round(matchedFood.calories * variance),
      protein: parseFloat((matchedFood.protein * variance).toFixed(1)),
      carbs: parseFloat((matchedFood.carbs * variance).toFixed(1)),
      fat: parseFloat((matchedFood.fat * variance).toFixed(1)),
      estimated_portion: getEstimatedPortion(matchedFood.category),
      meal_suggestion: getMealSuggestion(timeOfDay)
    },
    confidence
  };
}

function getEstimatedPortion(category) {
  const portions = {
    protein: "150-200g",
    vegetable: "1 cup",
    fruit: "1 medium piece",
    dairy: "200g",
    grain: "1 cup cooked",
    meal: "1 serving",
    snack: "1 handful",
    supplement: "1 serving",
    soup: "1 bowl"
  };
  return portions[category] || "1 serving";
}

function getMealSuggestion(hour) {
  if (hour >= 6 && hour < 11) return "Breakfast";
  if (hour >= 11 && hour < 16) return "Lunch";
  if (hour >= 16 && hour < 22) return "Dinner";
  return "Late Night Snack";
}

function getAlternativeSuggestions(mainFood, goalFoods) {
  // Get foods from same category
  const sameCategory = goalFoods.filter(f => 
    f.category === mainFood.category && f.id !== mainFood.id
  );
  
  // Get foods with similar calorie range (±50 calories)
  const similarCalories = goalFoods.filter(f => 
    Math.abs(f.calories - mainFood.calories) < 50 && f.id !== mainFood.id
  );
  
  // Combine and deduplicate
  const alternatives = [...sameCategory, ...similarCalories];
  const uniqueAlternatives = [];
  const seenIds = new Set([mainFood.id]);
  
  for (const alt of alternatives) {
    if (!seenIds.has(alt.id)) {
      seenIds.add(alt.id);
      uniqueAlternatives.push({
        ...alt,
        reason: alt.category === mainFood.category ? 
          `Similar ${alt.category} option` : 
          `Similar calorie count (${alt.calories} cal)`
      });
    }
    
    if (uniqueAlternatives.length >= 3) break;
  }
  
  return uniqueAlternatives;
}

function getFoodRecommendations(food, goal) {
  const recommendations = [];
  
  if (goal === "weight_loss") {
    if (food.calories > 300) {
      recommendations.push("Consider a smaller portion for weight loss");
    }
    if (food.protein < 20) {
      recommendations.push("Add a protein source to stay full longer");
    }
  } else if (goal === "muscle_gain") {
    if (food.protein < 25) {
      recommendations.push("Great for muscle growth - high in protein");
    }
    if (food.calories < 300) {
      recommendations.push("Consider adding a side for extra calories");
    }
  }
  
  // General recommendations
  if (food.fat > 15) {
    recommendations.push("Contains healthy fats - great for satiety");
  }
  if (food.category === "vegetable" || food.category === "fruit") {
    recommendations.push("Rich in vitamins and fiber");
  }
  
  return recommendations.length > 0 ? recommendations : ["Balanced choice for your goals"];
}

// GET FOOD SUGGESTIONS
app.get("/food-suggestions/:goal", (req, res) => {
  const { goal } = req.params;
  console.log(`Fetching food suggestions for goal: ${goal}`);
  
  const suggestions = enhancedFoodDatabase[goal] || enhancedFoodDatabase.maintenance;
  
  res.json({
    success: true,
    data: suggestions.map(food => ({
      id: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      category: food.category,
      icon: food.icon,
      keywords: food.keywords
    })),
    count: suggestions.length,
    goal: goal
  });
});

// LOG SCANNED FOOD
app.post("/api/food/log", (req, res) => {
  console.log("Logging food:", req.body);
  
  const {
    user_id,
    food_name,
    calories,
    protein,
    carbs,
    fat,
    meal_type,
    log_date,
    log_time,
    scanned,
    confidence
  } = req.body;
  
  if (!user_id || !food_name || calories === undefined) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields: user_id, food_name, and calories are required" 
    });
  }
  
  const sql = `
    INSERT INTO food_logs 
    (user_id, food_name, calories, protein, carbs, fat, meal_type, log_date, log_time, scanned, confidence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    user_id,
    food_name,
    calories,
    protein || 0,
    carbs || 0,
    fat || 0,
    meal_type || 'lunch',
    log_date || new Date().toISOString().split('T')[0],
    log_time || new Date().toLocaleTimeString('en-US', { hour12: true }),
    scanned ? 1 : 0,
    confidence || '85%'
  ];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: err.message });
    }
    
    console.log("Food logged successfully, ID:", result.insertId);
    
    res.json({
      success: true,
      data: {
        id: result.insertId,
        message: "Food logged successfully",
        scanned: scanned || false,
        timestamp: new Date().toISOString()
      }
    });
  });
});

// ==================== FOOD DATABASE ENDPOINTS ====================

// GET ALL FOODS FROM DATABASE
app.get("/api/foods", (req, res) => {
  const sql = "SELECT * FROM food_database ORDER BY name ASC";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
});

// SEARCH FOODS
app.get("/api/foods/search", (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ 
      success: false, 
      error: "Search query is required" 
    });
  }
  
  const sql = `
    SELECT * FROM food_database 
    WHERE name LIKE ? OR keywords LIKE ?
    ORDER BY name ASC
  `;
  
  const searchTerm = `%${query}%`;
  
  db.query(sql, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
});

// GET FOOD BY ID
app.get("/api/foods/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM food_database WHERE id = ?";
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Food not found" 
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  });
});

// ==================== EXERCISE DATABASE ENDPOINTS ====================

// GET ALL EXERCISES FROM DATABASE
app.get("/api/exercises", (req, res) => {
  const sql = "SELECT * FROM exercise_database ORDER BY name ASC";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
});

// GET EXERCISE BY TYPE
app.get("/api/exercises/type/:type", (req, res) => {
  const { type } = req.params;
  const sql = "SELECT * FROM exercise_database WHERE type = ?";
  
  db.query(sql, [type], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
});

// GET MET VALUE FOR EXERCISE
app.get("/api/exercises/met/:type", (req, res) => {
  const { type } = req.params;
  const sql = "SELECT met_value FROM exercise_database WHERE type = ? LIMIT 1";
  
  db.query(sql, [type], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Exercise type not found" 
      });
    }
    
    res.json({
      success: true,
      met_value: results[0].met_value
    });
  });
});

// ==================== USER LOGIN WITH DAY STREAK ====================

// USER LOGIN (with automatic day streak increment)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "Email and password are required" 
    });
  }
  
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid email or password" 
      });
    }
    
    const user = results[0];
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if user logged in today
    const checkLoginSql = "SELECT * FROM login_history WHERE user_id = ? AND login_date = ?";
    
    db.query(checkLoginSql, [user.id, today], (err, loginResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          success: false, 
          error: err.message 
        });
      }
      
      let newStreak = user.day_streak;
      let shouldIncrementStreak = false;
      
      // If user hasn't logged in today
      if (loginResults.length === 0) {
        // Insert login record
        const insertLoginSql = "INSERT INTO login_history (user_id, login_date) VALUES (?, ?)";
        db.query(insertLoginSql, [user.id, today], (err) => {
          if (err) {
            console.error("Error inserting login history:", err);
          }
        });
        
        // Check if last login was yesterday (consecutive day)
        if (user.last_login_date === yesterday) {
          // Increment streak
          newStreak = user.day_streak + 1;
          shouldIncrementStreak = true;
        } else if (!user.last_login_date || user.last_login_date !== today) {
          // Reset streak if last login was not yesterday or today
          newStreak = 1;
          shouldIncrementStreak = true;
        }
        
        // Update user's last login date and streak
        if (shouldIncrementStreak) {
          const updateUserSql = "UPDATE users SET last_login_date = ?, day_streak = ? WHERE id = ?";
          db.query(updateUserSql, [today, newStreak, user.id], (err) => {
            if (err) {
              console.error("Error updating user streak:", err);
            }
          });
        } else {
          // Just update last login date
          const updateDateSql = "UPDATE users SET last_login_date = ? WHERE id = ?";
          db.query(updateDateSql, [today, user.id], (err) => {
            if (err) {
              console.error("Error updating last login date:", err);
            }
          });
        }
      }
      
      // Return user data with updated streak
      res.json({
        success: true,
        data: {
          ...user,
          day_streak: newStreak,
          last_login_date: today
        },
        message: shouldIncrementStreak ? `Day streak: ${newStreak} days!` : "Welcome back!"
      });
    });
  });
});

// ==================== EXERCISE LOGGING ====================

// LOG EXERCISE
app.post("/api/exercise/log", (req, res) => {
  const {
    user_id,
    exercise_name,
    exercise_type,
    duration,
    calories,
    log_date,
    log_time
  } = req.body;
  
  if (!user_id || !exercise_name || !duration || calories === undefined) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields: user_id, exercise_name, duration, and calories are required" 
    });
  }
  
  const sql = `
    INSERT INTO exercise_logs 
    (user_id, exercise_name, exercise_type, duration, calories, log_date, log_time)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    user_id,
    exercise_name,
    exercise_type || null,
    duration,
    calories,
    log_date || new Date().toISOString().split('T')[0],
    log_time || new Date().toTimeString().split(' ')[0]
  ];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    // Update daily summary
    updateDailySummary(user_id, log_date || new Date().toISOString().split('T')[0]);
    
    res.json({
      success: true,
      data: {
        id: result.insertId,
        message: "Exercise logged successfully",
        timestamp: new Date().toISOString()
      }
    });
  });
});

// GET USER EXERCISE LOGS
app.get("/api/exercise/logs/:user_id", (req, res) => {
  const { user_id } = req.params;
  const { date } = req.query;
  
  let sql = "SELECT * FROM exercise_logs WHERE user_id = ?";
  const params = [user_id];
  
  if (date) {
    sql += " AND log_date = ?";
    params.push(date);
  }
  
  sql += " ORDER BY log_date DESC, log_time DESC";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
});

// ==================== WATER LOGGING ====================

// LOG WATER INTAKE
app.post("/api/water/log", (req, res) => {
  const {
    user_id,
    amount,
    log_date,
    log_time
  } = req.body;
  
  if (!user_id || !amount) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields: user_id and amount are required" 
    });
  }
  
  const sql = `
    INSERT INTO water_logs 
    (user_id, amount, log_date, log_time)
    VALUES (?, ?, ?, ?)
  `;
  
  const values = [
    user_id,
    amount,
    log_date || new Date().toISOString().split('T')[0],
    log_time || new Date().toTimeString().split(' ')[0]
  ];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    // Update daily summary
    updateDailySummary(user_id, log_date || new Date().toISOString().split('T')[0]);
    
    res.json({
      success: true,
      data: {
        id: result.insertId,
        message: "Water intake logged successfully",
        timestamp: new Date().toISOString()
      }
    });
  });
});

// GET USER WATER LOGS
app.get("/api/water/logs/:user_id", (req, res) => {
  const { user_id } = req.params;
  const { date } = req.query;
  
  let sql = "SELECT * FROM water_logs WHERE user_id = ?";
  const params = [user_id];
  
  if (date) {
    sql += " AND log_date = ?";
    params.push(date);
  }
  
  sql += " ORDER BY log_date DESC, log_time DESC";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
});

// ==================== CALORIE TRACKING & DAILY SUMMARY ====================

// GET USER FOOD LOGS
app.get("/api/food/logs/:user_id", (req, res) => {
  const { user_id } = req.params;
  const { date } = req.query;
  
  let sql = "SELECT * FROM food_logs WHERE user_id = ?";
  const params = [user_id];
  
  if (date) {
    sql += " AND log_date = ?";
    params.push(date);
  }
  
  sql += " ORDER BY log_date DESC, log_time DESC";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
});

// GET DAILY SUMMARY (Calories, macros, water)
app.get("/api/summary/:user_id", (req, res) => {
  const { user_id } = req.params;
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  // Get or create daily summary
  const getSummarySql = "SELECT * FROM daily_summary WHERE user_id = ? AND summary_date = ?";
  
  db.query(getSummarySql, [user_id, targetDate], (err, summaryResults) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    // If summary doesn't exist, calculate and create it
    if (summaryResults.length === 0) {
      updateDailySummary(user_id, targetDate, (summary) => {
        res.json({
          success: true,
          data: summary
        });
      });
    } else {
      res.json({
        success: true,
        data: summaryResults[0]
      });
    }
  });
});

// Helper function to update daily summary
function updateDailySummary(user_id, date, callback) {
  // Calculate totals from food logs
  const foodSql = `
    SELECT 
      SUM(calories) as total_calories,
      SUM(protein) as total_protein,
      SUM(carbs) as total_carbs,
      SUM(fat) as total_fat
    FROM food_logs
    WHERE user_id = ? AND log_date = ?
  `;
  
  // Calculate totals from exercise logs
  const exerciseSql = `
    SELECT SUM(calories) as total_calories_burned
    FROM exercise_logs
    WHERE user_id = ? AND log_date = ?
  `;
  
  // Calculate water intake
  const waterSql = `
    SELECT SUM(amount) as total_water
    FROM water_logs
    WHERE user_id = ? AND log_date = ?
  `;
  
  db.query(foodSql, [user_id, date], (err, foodResults) => {
    if (err) {
      console.error("Error calculating food totals:", err);
      return callback ? callback(null) : null;
    }
    
    db.query(exerciseSql, [user_id, date], (err, exerciseResults) => {
      if (err) {
        console.error("Error calculating exercise totals:", err);
        return callback ? callback(null) : null;
      }
      
      db.query(waterSql, [user_id, date], (err, waterResults) => {
        if (err) {
          console.error("Error calculating water totals:", err);
          return callback ? callback(null) : null;
        }
        
        const totalCalories = foodResults[0].total_calories || 0;
        const totalBurned = exerciseResults[0].total_calories_burned || 0;
        const netCalories = totalCalories - totalBurned;
        const totalProtein = foodResults[0].total_protein || 0;
        const totalCarbs = foodResults[0].total_carbs || 0;
        const totalFat = foodResults[0].total_fat || 0;
        const totalWater = waterResults[0].total_water || 0;
        
        // Insert or update daily summary
        const upsertSql = `
          INSERT INTO daily_summary 
          (user_id, summary_date, total_calories_consumed, total_calories_burned, 
           net_calories, total_protein, total_carbs, total_fat, water_intake)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            total_calories_consumed = VALUES(total_calories_consumed),
            total_calories_burned = VALUES(total_calories_burned),
            net_calories = VALUES(net_calories),
            total_protein = VALUES(total_protein),
            total_carbs = VALUES(total_carbs),
            total_fat = VALUES(total_fat),
            water_intake = VALUES(water_intake),
            updated_at = CURRENT_TIMESTAMP
        `;
        
        db.query(upsertSql, [
          user_id, date, totalCalories, totalBurned, netCalories,
          totalProtein, totalCarbs, totalFat, totalWater
        ], (err, result) => {
          if (err) {
            console.error("Error updating daily summary:", err);
            return callback ? callback(null) : null;
          }
          
          const summary = {
            user_id,
            summary_date: date,
            total_calories_consumed: totalCalories,
            total_calories_burned: totalBurned,
            net_calories: netCalories,
            total_protein: totalProtein,
            total_carbs: totalCarbs,
            total_fat: totalFat,
            water_intake: totalWater
          };
          
          if (callback) {
            callback(summary);
          }
        });
      });
    });
  });
}

// DELETE FOOD LOG
app.delete("/api/food/logs/:id", (req, res) => {
  const { id } = req.params;
  
  // Get log to find user_id and date for summary update
  const getLogSql = "SELECT user_id, log_date FROM food_logs WHERE id = ?";
  
  db.query(getLogSql, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Food log not found" 
      });
    }
    
    const { user_id, log_date } = results[0];
    
    const deleteSql = "DELETE FROM food_logs WHERE id = ?";
    
    db.query(deleteSql, [id], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          success: false, 
          error: err.message 
        });
      }
      
      // Update daily summary
      updateDailySummary(user_id, log_date);
      
      res.json({
        success: true,
        message: "Food log deleted successfully"
      });
    });
  });
});

// DELETE EXERCISE LOG
app.delete("/api/exercise/logs/:id", (req, res) => {
  const { id } = req.params;
  
  const getLogSql = "SELECT user_id, log_date FROM exercise_logs WHERE id = ?";
  
  db.query(getLogSql, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Exercise log not found" 
      });
    }
    
    const { user_id, log_date } = results[0];
    
    const deleteSql = "DELETE FROM exercise_logs WHERE id = ?";
    
    db.query(deleteSql, [id], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          success: false, 
          error: err.message 
        });
      }
      
      updateDailySummary(user_id, log_date);
      
      res.json({
        success: true,
        message: "Exercise log deleted successfully"
      });
    });
  });
});

// DELETE WATER LOG
app.delete("/api/water/logs/:id", (req, res) => {
  const { id } = req.params;
  
  const getLogSql = "SELECT user_id, log_date FROM water_logs WHERE id = ?";
  
  db.query(getLogSql, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Water log not found" 
      });
    }
    
    const { user_id, log_date } = results[0];
    
    const deleteSql = "DELETE FROM water_logs WHERE id = ?";
    
    db.query(deleteSql, [id], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          success: false, 
          error: err.message 
        });
      }
      
      updateDailySummary(user_id, log_date);
      
      res.json({
        success: true,
        message: "Water log deleted successfully"
      });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`API Base URL: http://localhost:${PORT}`);
  console.log(`\n=== Available Endpoints ===`);
  console.log(`Food Database: GET /api/foods, GET /api/foods/search?query=...`);
  console.log(`Exercise Database: GET /api/exercises, GET /api/exercises/type/:type`);
  console.log(`User Login: POST /api/auth/login (auto day streak increment)`);
  console.log(`Food Logs: POST /api/food/log, GET /api/food/logs/:user_id`);
  console.log(`Exercise Logs: POST /api/exercise/log, GET /api/exercise/logs/:user_id`);
  console.log(`Water Logs: POST /api/water/log, GET /api/water/logs/:user_id`);
  console.log(`Daily Summary: GET /api/summary/:user_id?date=YYYY-MM-DD`);
});