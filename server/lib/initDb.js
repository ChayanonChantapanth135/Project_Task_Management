import mysql from 'mysql2/promise'

export const initializeDatabase = async () => {
  let connection;
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    })

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`)
    
    // Switch to the database
    await connection.query(`USE ${process.env.DB_NAME}`)
    
    // Create users table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    console.log('Database initialized successfully')
    await connection.end()
  } catch (error) {
    console.error('Database initialization error:', error.message)
    // Don't exit - server can still run without initialization
  }
}
