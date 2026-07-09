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
        role ENUM('admin','manager','video_editor','translator','team_leader','user') DEFAULT 'user',
        avatar VARCHAR(512) DEFAULT NULL,
        status ENUM('active','suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Safely add missing columns to existing tables
    const alterQueries = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('admin','manager','video_editor','translator','team_leader','user') DEFAULT 'user'",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(512) DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('active','suspended') DEFAULT 'active'",
    ]
    for (const q of alterQueries) {
      try { await connection.query(q) } catch (e) { /* ignore if column already exists */ }
    }
    
    console.log('Database initialized successfully')
    await connection.end()
  } catch (error) {
    console.error('Database initialization error:', error.message)
    // Don't exit - server can still run without initialization
  }
}
