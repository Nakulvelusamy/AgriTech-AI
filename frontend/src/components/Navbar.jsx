import React, { useState, useEffect, useRef, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import web_logo from '../assets/weblogo.png'
import './Navbar.css'
import agri from '../assets/agri.png'
import { FaLeaf, FaSignInAlt, FaHome, FaRulerCombined, FaCloudRain, FaChartLine, FaBars, FaTimes, FaUserPlus, FaSignOutAlt, FaUser, FaEnvelope } from 'react-icons/fa'
import AuthContext from '../context/AuthContext'

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Set active link based on current route
  useEffect(() => {
    const path = location.pathname.substring(1).toLowerCase() || 'home';
    setActiveLink(path);
    
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [location]);
  
  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);
  
  return (
    <div ref={navRef} className={`sample ${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'menu-open' : ''}`}>
      <div className="nav-brand">
        <Link to="/Home">
          <img 
            src={web_logo} 
            height={scrolled ? 70 : 80} 
            width={scrolled ? 70 : 80} 
            alt="AgriTech Logo" 
            className="logo-main"
          />
        </Link>
        
        <div className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
      
      <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
        <li className="nav-item" onClick={() => { setActiveLink("home") }}>
          <Link to='/Home' style={{ textDecoration: 'none' }}>
            <FaHome className="nav-icon" />
            <span>Home</span>
          </Link>
          {activeLink === "home" && <hr />}
        </li>
        
        <li className="nav-item" onClick={() => { setActiveLink("contact") }}>
          <Link to='/contact' style={{ textDecoration: 'none' }}>
            <FaRulerCombined className="nav-icon" />
            <span>Estimation</span>
          </Link>
          {activeLink === "contact" && <hr />}
        </li>
        
        <li className="nav-item" onClick={() => { setActiveLink("content") }}>
          <Link to='/content' style={{ textDecoration: 'none' }}>
            <FaCloudRain className="nav-icon" />
            <span>Precipitation</span>
          </Link>
          {activeLink === "content" && <hr />}
        </li>
        
        <li className="nav-item" onClick={() => { setActiveLink("imageupload") }}>
          <Link to='/ImageUpload' style={{ textDecoration: 'none' }}>
            <FaChartLine className="nav-icon" />
            <span>Production</span>
          </Link>
          {activeLink === "imageupload" && <hr />}
        </li>
        
        <li className="nav-item" onClick={() => { setActiveLink("contactinfo") }}>
          <Link to='/ContactInfo' style={{ textDecoration: 'none' }}>
            <FaEnvelope className="nav-icon" />
            <span>Contact Us</span>
          </Link>
          {activeLink === "contactinfo" && <hr />}
        </li>
        
        <div className="nav-divider"></div>
        
        {isAuthenticated ? (
          <>
            <li className="nav-item user-info">
              <div className="user-greeting">
                <FaUser className="nav-icon" />
                <span>Hello, {user?.username || 'User'}</span>
              </div>
            </li>
            
            <li className="nav-item logout-btn" onClick={handleLogout}>
              <div style={{ textDecoration: 'none', cursor: 'pointer' }}>
                <FaSignOutAlt className="nav-icon" />
                <span>Logout</span>
              </div>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item login-btn" onClick={() => { setActiveLink("login") }}>
              <Link to='/login' style={{ textDecoration: 'none' }}>
                <FaSignInAlt className="nav-icon" />
                <span>Login</span>
              </Link>
              {activeLink === "login" && <hr />}
            </li>
          </>
        )}
      </div>
      
      <div className="nav-right">
        <img 
          src={agri} 
          alt="Agriculture Logo" 
          width={150} 
          height={50} 
          className='icon1'
        />
        
        <div className="theme-toggle">
          <FaLeaf />
        </div>
      </div>
    </div>
  )
}

export default Navbar
