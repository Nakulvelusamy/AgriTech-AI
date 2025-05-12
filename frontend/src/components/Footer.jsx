import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="farm-footer">
      <div className="wheat-field-container">
        <div className="wheat-field">
          {/* Generate multiple wheat stalks */}
          {[...Array(20)].map((_, index) => (
            <div key={index} className="wheat-stalk" style={{ 
              left: `${index * 5}%`, 
              animationDelay: `${index * 0.1}s`,
              height: `${80 + Math.random() * 40}px`
            }}>
              <div className="wheat-head"></div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="footer-content">
        <div className="footer-section contact-info">
          <h3>Contact Us</h3>
          <div className="contact-card">
            <div className="contact-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="contact-details">
              <p><a href="mailto:velusamynakul@gmail.com">velusamynakul@gmail.com</a></p>
              <p><a href="tel:+916382941615">+91 6382941615</a></p>
            </div>
          </div>
        </div>
        
        <div className="footer-section quick-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/Home">Home</Link></li>
            <li><Link to="/Content">Content</Link></li>
            <li><Link to="/ImageUpload">Image Upload</Link></li>
            <li><Link to="/Contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className="footer-section newsletter">
          <h3>Stay Updated</h3>
          <p>Subscribe to our newsletter for the latest updates</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Your Email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="social-icons">
          <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
          <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
          <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
          <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} Farm Land. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;