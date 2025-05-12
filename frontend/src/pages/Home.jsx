import React, { useEffect, useRef, useState } from 'react'
import bird_image from '../assets/farm1.png'
import './Home.css'
import farmer from '../assets/farmer.png'
import growth from '../assets/grow.png'
import bussiness from '../assets/bussiness.png'
import f1 from '../assets/f1.png'
import f2 from '../assets/f2.png'
import { 
  FaInstagramSquare, 
  FaWhatsapp, 
  FaArrowRight, 
  FaLeaf, 
  FaChartLine, 
  FaCloudSunRain, 
  FaSeedling, 
  FaMapMarkedAlt,
  FaUsers,
  FaEnvelope,
  FaPhone,
  FaGlobe
} from "react-icons/fa";
import { FaPinterest } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);
  const assessmentsRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const contactRef = useRef(null);
  
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Wheat Farmer, Punjab",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "This platform has transformed how I manage my 15-acre wheat farm. The precipitation analysis tool helped me optimize irrigation, saving 30% on water costs while increasing my yield by 20%."
    },
    {
      name: "Anita Sharma",
      role: "Rice Cultivator, West Bengal",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "The land suitability prediction is incredibly accurate! I was skeptical at first, but after following the recommendations, my rice production increased by 25% compared to last season."
    },
    {
      name: "Vijay Patel",
      role: "Agricultural Cooperative Leader",
      image: "https://randomuser.me/api/portraits/men/67.jpg",
      text: "Our cooperative of 200+ farmers has seen remarkable improvements since adopting this platform. The production estimator has helped us better plan our harvests and negotiate better prices."
    }
  ];
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);
  
  // Animation on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    const elements = [
      featuresRef.current, 
      benefitsRef.current,
      assessmentsRef.current, 
      statsRef.current,
      testimonialsRef.current,
      contactRef.current
    ];
    
    elements.forEach(el => {
      if (el) observer.observe(el);
    });
    
    return () => {
      elements.forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);
  
  return (
    <div>
      {/* Hero Section */}
      <div className='whole'>
        <div className='sample-image'>
          <p>Choose the right land to grow the perfect crop</p>
          <h3>Revolutionizing agriculture with smart technology</h3>
          <h4>"The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings"</h4>
          <div className="hero-buttons">
            <button className="primary-btn" onClick={()=>navigate('/Contact')}>
              Get Started <FaArrowRight style={{ marginLeft: '8px' }} />
            </button>
            <button className="secondary-btn" onClick={()=>navigate('/ImageUpload')}>
              Try Production Tool <FaChartLine style={{ marginLeft: '8px' }} />
            </button>
          </div>
        </div>
        <div className="text-name">
          <img src={bird_image} alt="Agricultural landscape" />
        </div>
      </div>
      
      {/* Features Section */}
      <div ref={featuresRef} className="section" style={{ opacity: 0, transition: 'opacity 1s ease-out' }}>
        <h1>New Opportunities</h1>
        <h3>The only platform enabling you to analyze, plan and optimize agricultural land use</h3>
        
        <div className="container">
          <div className="main">
            <div className="card">
              <div className="front">
                <img src={farmer} alt="Farmer icon" /> 
                <p>Connect with farmers</p>
              </div>
              <div className="back">
                <p>Direct engagement with farmers helps understand their challenges and needs, leading to better support, training, and resources that significantly enhance productivity.</p>
              </div>
            </div>
          </div>
          
          <div className="main">
            <div className="card">
              <div className="front">
                <img src={bussiness} alt="Business growth icon" /> 
                <p>Grow your business</p>
              </div>
              <div className="back">
                <p>Building direct relationships with farmers ensures a steady and reliable supply of raw materials, reducing dependency on intermediaries and improving your supply chain.</p>
              </div>
            </div>
          </div>
          
          <div className="main">
            <div className="card">
              <div className="front">
                <img src={growth} alt="Social impact icon" /> 
                <p>Social impact improvement</p>
              </div>
              <div className="back">
                <p>Supporting farmers creates jobs within the agricultural sector and related industries, driving economic growth and improving rural livelihoods and communities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Benefits Section - NEW */}
      <div ref={benefitsRef} className="benefits-section" style={{ opacity: 0, transition: 'opacity 1s ease-out' }}>
        <h1>Why Choose Our Platform?</h1>
        
        <div className="benefits-container">
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaLeaf />
            </div>
            <h3>Sustainable Farming</h3>
            <p>Our tools promote sustainable agricultural practices that preserve soil health and reduce environmental impact while maximizing yields.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaCloudSunRain />
            </div>
            <h3>Weather Intelligence</h3>
            <p>Advanced precipitation analysis and weather forecasting help you make informed decisions about planting, irrigation, and harvesting.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaSeedling />
            </div>
            <h3>Crop Optimization</h3>
            <p>Identify the ideal crops for your land based on soil composition, climate conditions, and market demand to maximize profitability.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaMapMarkedAlt />
            </div>
            <h3>Land Mapping</h3>
            <p>Interactive mapping tools allow you to visualize your land, plan field layouts, and identify areas for improvement or expansion.</p>
          </div>
        </div>
      </div>
      
      {/* Tools Section */}
      <div ref={assessmentsRef} className="section" style={{ opacity: 0, transition: 'opacity 1s ease-out' }}>
        <h1>Smart Agricultural Tools</h1>
        
        <div className="img-container">
          <div className="img-con">
            <img src={f1} alt="Land prediction tool" />
            <p>Rapid Prediction of Land Suitability</p>
            <button onClick={()=>navigate('/Contact')}>Explore Tool</button>
          </div>
          
          <div className="img-con">
            <img src={f2} alt="Precipitation visualization" />
            <p>Advanced Precipitation Analysis</p>
            <button onClick={()=>navigate('/Content')}>Explore Tool</button>
          </div>
          
          <div className="img-con">
            <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" alt="Crop production estimator" />
            <p>Crop Production Estimator</p>
            <button onClick={()=>navigate('/ImageUpload')}>Explore Tool</button>
          </div>
        </div>
      </div>
      
      {/* Stats Section - NEW */}
      <div ref={statsRef} className="stats-section" style={{ opacity: 0, transition: 'opacity 1s ease-out' }}>
        <h1>Our Impact</h1>
        
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">10,000+</div>
            <div className="stat-label">Farmers Supported</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">25%</div>
            <div className="stat-label">Average Yield Increase</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">30%</div>
            <div className="stat-label">Water Usage Reduction</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">500,000+</div>
            <div className="stat-label">Hectares Analyzed</div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section - NEW */}
      <div ref={testimonialsRef} className="testimonials-section" style={{ opacity: 0, transition: 'opacity 1s ease-out' }}>
        <h1>Success Stories</h1>
        
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <div className="quote-mark">"</div>
              <p>{testimonials[activeTestimonial].text}</p>
              <div className="testimonial-author">
                <img 
                  src={testimonials[activeTestimonial].image} 
                  alt={testimonials[activeTestimonial].name} 
                  className="author-image" 
                />
                <div className="author-info">
                  <h4>{testimonials[activeTestimonial].name}</h4>
                  <p>{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <button 
                key={index} 
                className={`dot ${index === activeTestimonial ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(index)}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Contact Section */}
      <div ref={contactRef} className="section" style={{ opacity: 0, transition: 'opacity 1s ease-out' }}>
        <h1>Get In Touch</h1>
        
        <footer>
          <div className="footer-content">
            <div className="footer-section">
              <h3>About Us</h3>
              <p>We're dedicated to revolutionizing agriculture through innovative technology solutions that empower farmers and promote sustainable practices.</p>
            </div>
            
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li onClick={() => navigate('/Home')}>Home</li>
                <li onClick={() => navigate('/Contact')}>Land Estimation</li>
                <li onClick={() => navigate('/Content')}>Precipitation Analysis</li>
                <li onClick={() => navigate('/ImageUpload')}>Production Estimator</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Contact Us</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <p>skyspheretechnologies@gmail.com</p>
                </div>
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <p>+91 8796483444</p>
                </div>
                <div className="contact-item">
                  <FaGlobe className="contact-icon" />
                  <p>www.skyspheretechnologies.net</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="footer-social">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <FaInstagramSquare className="social-icon" />
              <FaWhatsapp className="social-icon" />
              <FaPinterest className="social-icon" />
              <FaUsers className="social-icon" />
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2025 AgriTech Solutions - All rights reserved</p>
            <p>Empowering farmers with technology for a sustainable future</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Home