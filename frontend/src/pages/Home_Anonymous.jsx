import React from 'react'
import Header from '../components/HeaderHome'
import Footer from '../components/footer'

const Home = () => {
  return (
    <div>
      <Header />
      <div className="text-3xl text-blue-500">
        Home For Unregistered Users
      </div>
      <Footer />
    </div>
  )
}

export default Home