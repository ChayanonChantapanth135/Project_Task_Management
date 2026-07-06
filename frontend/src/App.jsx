import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home_Anonymous'
import Home_User from './pages/Home_User'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Home_Anonymous' element={<Home />} />
        <Route path='/Home_User' element={<Home_User />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
