import mysql from 'mysql2/promise'

let connection;

/**
 * เชื่อมต่อกับฐานข้อมูล MySQL (ใช้รูปแบบ Singleton เพื่อแชร์การเชื่อมต่อเดียว)
 * @returns {Promise<Connection>} ออบเจกต์การเชื่อมต่อฐานข้อมูล
 */
export const connectToDatabase = async () => {
  if (!connection) {
    connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    })
  }
  return connection;
}