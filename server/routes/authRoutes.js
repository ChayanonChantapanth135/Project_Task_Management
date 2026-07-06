import express from 'express'
import {connectToDatabase} from '../lib/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body
    console.log('Register request received:', { username, email })
    try {
        const db = await connectToDatabase()
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]) 
        if (rows.length > 0) {
            return res.status(409).json({ message: 'User already exists' })
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const result = await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashPassword])
        console.log('User registered successfully:', { username, email })
        res.status(201).json({ message: 'User registered successfully' })
    }catch (error) {
        console.error('Registration error:', error.message)
        res.status(500).json({ message: error.message })
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    console.log('Login request received:', { email })
    try {
        const db = await connectToDatabase()
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]) 
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not existed' })
        }

        const isMatch = await bcrypt.compare(password, rows[0].password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        const token = jwt.sign({ id: rows[0].id }, process.env.JWT_KEY, { expiresIn: '3h' });

        return res.status(201).json({token:token})
    }catch (error) {
        console.error('Login error:', error.message)
        res.status(500).json({ message: error.message })
    }
})

export default router;