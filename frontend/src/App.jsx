import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ImageUpload from './pages/ImageUpload'
import Content from './pages/Content'
import Contact from './pages/Contact'
import ContactInfo from './pages/ContactInfo'
import Login from './pages/Login'
import Register from './pages/Register'
import SignUpForm from './pages/SignUpForm'
import { AuthProvider } from './context/AuthContext'

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar/>
        <Routes>
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/signup' element={<SignUpForm/>}/>
          <Route path='/Home' element={<Home/>}/>
          <Route path='/ImageUpload' element={<ImageUpload/>}/>
          <Route path='/Content' element={<Content/>}/>
          <Route path='/Contact' element={<Contact/>}/>
          <Route path='/ContactInfo' element={<ContactInfo/>}/>
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  )
}

export default App