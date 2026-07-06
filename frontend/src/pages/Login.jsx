import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Home_User from './Home_User'

const Register = () => {
    const [values, setValues] = React.useState({
        email: '',
        password: ''
    })
    const [message, setMessage] = React.useState('')
    const [error, setError] = React.useState('')
    const navigate = useNavigate()

    const handleChange = (e) => {
        setValues({...values, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage('')
        setError('')

        // Validation
        if (!values.email || !values.password) {
            setError('กรุณากรอกข้อมูลให้ครบทุกช่อง')
            return
        }

        try {
            const response = await axios.post('http://127.0.0.1:3000/auth/login', values)
            
            setMessage(response.data.message || 'เข้าสู่ระบบสำเร็จ! กำลังนำทางไปยังหน้าแรก...')
            setValues({ email: '', password: '' })
            
            if (response.status === 201) {
                // หน่วงเวลาเล็กน้อยเพื่อให้ผู้ใช้เห็นข้อความสำเร็จก่อนเปลี่ยนหน้า
                setTimeout(() => {
                    navigate('/Home_User')
                }, 2000); 
            }
        } catch (err) {
            setError(err.response?.data?.message || 'การเข้าสู่ระบบล้มเหลว โปรดลองอีกครั้ง')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-white to-yellow-400 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
                    Login
                </h2>
                {message && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md border border-green-200">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            อีเมล
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="ป้อนอีเมลของคุณ"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            รหัสผ่าน
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="ป้อนรหัสผ่านของคุณ"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-yellow-500 text-black py-2.5 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold"
                    >
                        เข้าสู่ระบบ
                    </button>
                </form>
                <div className="text-center mt-6 text-gray-600 text-sm">
                    ยังไม่มีบัญชีใช่ไหม?{' '}
                    <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                        สร้างบัญชีใหม่
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Register