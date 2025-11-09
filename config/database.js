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
  
// Helper function to run queries that return a single row
  const queryOne = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
};

// Helper function to run INSERT, UPDATE, DELETE queries
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            lastID: this.lastID,
            changes: this.changes
          });
        }
      });
    });
};
  
// Export database functions
module.exports = {db, query, queryOne, run};

