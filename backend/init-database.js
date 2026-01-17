// Database Initialization Script
// Run this script to set up the database: node init-database.js

const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // Update with your MySQL password
  multipleStatements: true
};

// Create connection without database first
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  
  console.log('Connected to MySQL server');
  
  // Read SQL file
  const sqlFile = path.join(__dirname, 'database.sql');
  
  if (!fs.existsSync(sqlFile)) {
    console.error('Error: database.sql file not found!');
    connection.end();
    process.exit(1);
  }
  
  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  // Execute SQL
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL:', err);
      connection.end();
      process.exit(1);
    }
    
    console.log('✅ Database initialized successfully!');
    console.log('✅ Tables created:');
    console.log('   - users');
    console.log('   - food_database');
    console.log('   - exercise_database');
    console.log('   - food_logs');
    console.log('   - exercise_logs');
    console.log('   - water_logs');
    console.log('   - login_history');
    console.log('   - daily_summary');
    console.log('\n✅ Default food and exercise data inserted!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update database password in index.js if needed');
    console.log('   2. Start the server: npm start or node index.js');
    console.log('   3. Test the API endpoints');
    
    connection.end();
  });
});
