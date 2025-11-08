const sqlite3 = require('sqlite3');
const path = require('path');

// Database file path
DB_name = path.resolve(__dirname, '../billy.db');

// Connect to the SQLite database file
const db = new sqlite3.Database('./billy.db', (err) => {
    if (err) {
      console.error('Failed to connect to SQLite:', err.message);
    } else {
      console.log('Connected to SQLite database: billy.db');
    }
  });

// Helper function to run queries that return multiple rows
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
};


// Export database functions
module.exports = {db, query};