import React, { useState } from 'react'
import Header from '../components/HeaderN'
import Footer from '../components/footer'

const Home_User = () => {
    // ข้อมูล Stats Cards
    const statsCards = [
        {
            title: 'ผู้ใช้ทั้งหมด',
            value: 0,
            link: 'จัดการผู้ใช้ →',
            bgColor: 'bg-blue-500',
            icon: '👥'
        },
        {
            title: 'โปรเจคทั้งหมด',
            value: 0,
            link: 'ดูโปรเจค →',
            bgColor: 'bg-teal-500',
            icon: '📁'
        },
        {
            title: 'งานทั้งหมด',
            value: 0,
            subtitle: 'เสร็จแล้ว: ',
            bgColor: 'bg-emerald-500',
            icon: '📋'
        },
        {
            title: 'งานเกินกำหนด',
            value: 0,
            link: 'ต้องดำเนินการด่วน',
            bgColor: 'bg-red-500',
            icon: '⚠️'
        }
    ]

    // ข้อมูลสถานะงาน
    const taskStatus = [
        { label: 'รอดำเนินการ', value: 0, color: 'text-gray-600', bgColor: 'bg-gray-50' },
        { label: 'กำลังทำ', value: 0, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { label: 'รอตรวจสอบ', value: 0, color: 'text-teal-600', bgColor: 'bg-teal-50' },
        { label: 'เสร็จแล้ว', value: 0, color: 'text-emerald-600', bgColor: 'bg-emerald-50' }
    ]

    // ข้อมูลกิจกรรมล่าสุด
    const recentActivities = [
        { user: 'Admin System', action: 'เข้าสู่ระบบ', time: '1 นาทีที่แล้ว' }
    ]

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            
            <main className="p-6 max-w-7xl mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {statsCards.map((card, index) => (
                        <div
                            key={index}
                            className={`${card.bgColor} rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm opacity-90">{card.title}</p>
                                    <p className="text-4xl font-bold mt-1">{card.value}</p>
                                </div>
                                <span className="text-3xl opacity-80">{card.icon}</span>
                            </div>
                            <div className="mt-4 pt-3 border-t border-white/30">
                                {card.subtitle ? (
                                    <p className="text-sm opacity-90">{card.subtitle}</p>
                                ) : (
                                    <p className="text-sm opacity-90 hover:opacity-100 cursor-pointer">
                                        {card.link}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* สถานะงาน */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">⏱️</span>
                            <h3 className="text-lg font-semibold text-gray-800">สถานะงาน</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {taskStatus.map((status, index) => (
                                <div
                                    key={index}
                                    className={`${status.bgColor} rounded-lg p-4 text-center border border-gray-200 hover:shadow-md transition-shadow`}
                                >
                                    <p className={`text-3xl font-bold ${status.color}`}>
                                        {status.value}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">{status.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* กิจกรรมล่าสุด */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📊</span>
                                <h3 className="text-lg font-semibold text-gray-800">กิจกรรมล่าสุด</h3>
                            </div>
                            <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                                ดูทั้งหมด
                            </button>
                        </div>
                        <div className="space-y-1 max-h-80 overflow-y-auto">
                            {recentActivities.map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-gray-800">{activity.user}</p>
                                        <p className="text-sm text-gray-500">{activity.action}</p>
                                    </div>
                                    <span className="text-sm text-gray-400 whitespace-nowrap">
                                        {activity.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default Home_User