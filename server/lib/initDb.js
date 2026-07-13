import mysql from 'mysql2/promise'

export const initializeDatabase = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    })

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`)
    
    // Switch to the database
    await connection.query(`USE ${process.env.DB_NAME}`)
    
    // 1. Create roles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Seed default roles if roles table is empty
    const [rolesCount] = await connection.query('SELECT COUNT(*) as count FROM roles')
    if (rolesCount[0].count === 0) {
      const defaultRoles = [
        ['admin', 'System Administrator with full access'],
        ['manager', 'Project Manager with access to create/manage own projects'],
        ['video_editor', 'Video Editor staff member'],
        ['translator', 'Translator staff member'],
        ['team_leader', 'Team Leader leading project groups'],
        ['user', 'Standard user / Team member']
      ]
      for (const [name, desc] of defaultRoles) {
        await connection.query('INSERT INTO roles (role_name, description) VALUES (?, ?)', [name, desc])
      }
      console.log('Seeded default roles.')
    }

    // 2. Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin','manager','video_editor','translator','team_leader','user') DEFAULT 'user',
        role_id INT NULL,
        avatar VARCHAR(512) DEFAULT NULL,
        status ENUM('active','suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
      )
    `)

    // 3. Create projects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        end_date DATE NULL,
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // 4. Create project_team_leaders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_team_leaders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_project_leader (project_id, user_id)
      )
    `)

    // 5. Create tasks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status ENUM('Pending', 'In Progress', 'Reviewing', 'Completed') DEFAULT 'Pending',
        assigned_to INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // 6. Create comments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NULL,
        task_id INT NULL,
        user_id INT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // 7. Create files table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NULL,
        task_id INT NULL,
        filename VARCHAR(255) NOT NULL,
        filepath VARCHAR(512) NOT NULL,
        uploaded_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // 8. Create notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        read_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // 9. Create activity_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // 10. Create task_status_history table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS task_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        changed_by INT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // 11. Create user_settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_setting (user_id, setting_key)
      )
    `)

    // Safely add missing columns to existing tables
    const alterQueries = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('admin','manager','video_editor','translator','team_leader','user') DEFAULT 'user'",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INT NULL",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(512) DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('active','suspended') DEFAULT 'active'",
    ]
    for (const q of alterQueries) {
      try { await connection.query(q) } catch (e) { /* ignore if column already exists */ }
    }

    const alterProjectsQueries = [
      "ALTER TABLE projects ADD COLUMN priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium'",
      "ALTER TABLE projects ADD COLUMN status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending'",
      "ALTER TABLE projects ADD COLUMN end_date DATE NULL",
      "ALTER TABLE projects ADD COLUMN created_by INT NULL",
      "ALTER TABLE projects ADD CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL"
    ]
    for (const q of alterProjectsQueries) {
      try { await connection.query(q) } catch (e) { /* ignore if column or constraint already exists */ }
    }
    
    console.log('Database initialized successfully with all 11 tables.')
    await connection.end()
  } catch (error) {
    console.error('Database initialization error:', error.message)
    // Don't exit - server can still run without initialization
  }
}
