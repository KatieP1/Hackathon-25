const mysql = require('billy');

const connection = mysql.createConnection({
  host: ,
  user: 'your_username',
  password: 'your_password',
  database: 'your_database_name'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database!');
});
