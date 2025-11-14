const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'citizens',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.message);
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('Database does not exist. Please create it using:');
            console.error('CREATE DATABASE citizens;');
            console.error('And then create the Citizen table using the SQL in README.md');
        }
    });

module.exports = pool;