import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  User,
  Tag,
  MessageSquare,
  Send,
  Building,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  Zap,
  FileQuestion,
  Briefcase,
  Users,
} from 'lucide-react';
import '../../components/LandingPage.css';
import './ContactPage.css';

export const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }, 4000);
  };

  return (
    <div className="mf-ref-home mf-contact-wrapper">
      {/* ── 1. NAVBAR HEADER ── */}
      <header className="mf-ref-nav">
        <Link to="/" className="mf-ref-brand">
          <img
            src="/mediflow_logo.svg"
            alt="MediFlow AI Logo"
            className="mf-ref-logo-img"
            style={{ width: '40px', height: '40px' }}
          />
          <div>
            <div className="mf-ref-brand-title">
              Medi<span>Flow</span> <span style={{ color: '#05CD99', fontSize: '18px', fontWeight: 800 }}>AI</span>
            </div>
            <div className="mf-ref-brand-sub">AI POWERED QUEUE &amp; PATIENT FLOW</div>
          </div>
        </Link>

        {/* Center Nav Items (Standard 5 items matching Landing Page) */}
        <ul className="mf-ref-nav-links">
          <li><Link to="/" className="mf-ref-nav-link">Home</Link></li>
          <li><Link to="/about" className="mf-ref-nav-link">About Us</Link></li>
          <li><Link to="/#features" className="mf-ref-nav-link">Features</Link></li>
          <li><Link to="/#how-it-works" className="mf-ref-nav-link">How It Works</Link></li>
          <li><Link to="/contact" className="mf-ref-nav-link active">Contact Us</Link></li>
        </ul>

        {/* Right Action Buttons */}
        <div className="mf-ref-nav-actions">
          <div className="mf-ref-bell" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <button
            className="mf-ref-btn-login"
            style={{ borderColor: '#05CD99', color: '#05CD99' }}
            onClick={() => navigate('/nurse/login')}
          >
            Nurse Station
          </button>
          <button className="mf-ref-btn-login" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="mf-ref-btn-register" onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </header>

      {/* ── 2. TOP HERO BANNER ── */}
      <section
        className="mf-contact-hero"
        style={{ backgroundImage: `url('/hospital_contact_hero.jpg')` }}
      >
        <div className="mf-contact-hero-overlay" />
        <div className="mf-contact-hero-content">
          <div className="mf-contact-badge">WE'RE HERE TO HELP</div>
          <h1 className="mf-contact-title">
            Contact <span>Us</span>
          </h1>
          <p className="mf-contact-subtitle">
            Have a question or need support? Reach out to our team. We'll get back to you as soon as possible.
          </p>

          <div className="mf-contact-highlights">
            <div className="mf-contact-highlight-card">
              <div className="mf-highlight-icon">
                <Clock className="w-5 h-5" />
              </div>
              <div className="mf-highlight-info">
                <h4>Quick Response</h4>
                <p>We reply within 24 hours</p>
              </div>
            </div>

            <div className="mf-contact-highlight-card">
              <div className="mf-highlight-icon">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="mf-highlight-info">
                <h4>Expert Support</h4>
                <p>Our team is ready to help</p>
              </div>
            </div>

            <div className="mf-contact-highlight-card">
              <div className="mf-highlight-icon">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="mf-highlight-info">
                <h4>Secure & Reliable</h4>
                <p>Your data is always safe</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. MAIN 3-COLUMN CONTACT SECTION ── */}
      <section className="mf-contact-main-sec">
        <div className="mf-contact-grid">
          
          {/* Column 1: Get in Touch */}
          <div className="mf-contact-col">
            <h3 className="mf-contact-col-header">Get in Touch</h3>
            <div className="mf-contact-info-list">
              <div className="mf-contact-info-item">
                <div className="mf-contact-info-icon-box">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="mf-contact-info-text">
                  <h4>Address</h4>
                  <p>123 HealthCare Avenue, MedCity,<br />Chennai – 600001, India</p>
                </div>
              </div>

              <div className="mf-contact-info-item">
                <div className="mf-contact-info-icon-box">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="mf-contact-info-text">
                  <h4>Phone</h4>
                  <p>+91 98765 43210</p>
                </div>
              </div>

              <div className="mf-contact-info-item">
                <div className="mf-contact-info-icon-box">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="mf-contact-info-text">
                  <h4>Email</h4>
                  <p>hello@smartflow.com</p>
                </div>
              </div>

              <div className="mf-contact-info-item">
                <div className="mf-contact-info-icon-box">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="mf-contact-info-text">
                  <h4>Working Hours</h4>
                  <p>Mon - Sat: 9:00 AM - 6:00 PM<br />Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Send Us a Message */}
          <div className="mf-contact-col">
            <h3 className="mf-contact-col-header">Send Us a Message</h3>
            {submitted ? (
              <div className="p-8 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-teal-900">Thank You! Your Message Has Been Sent.</h4>
                <p className="text-xs text-teal-700">
                  Our healthcare support executive will contact you shortly via email or phone.
                </p>
              </div>
            ) : (
              <form className="mf-contact-form" onSubmit={handleSubmit}>
                <div className="mf-form-row">
                  <div className="mf-input-group">
                    <User className="w-4 h-4 mf-input-icon" />
                    <input
                      type="text"
                      className="mf-input-field"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mf-input-group">
                    <Mail className="w-4 h-4 mf-input-icon" />
                    <input
                      type="email"
                      className="mf-input-field"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mf-form-row">
                  <div className="mf-input-group">
                    <Phone className="w-4 h-4 mf-input-icon" />
                    <input
                      type="tel"
                      className="mf-input-field"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="mf-input-group">
                    <Tag className="w-4 h-4 mf-input-icon" />
                    <input
                      type="text"
                      className="mf-input-field"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mf-input-group">
                  <MessageSquare className="w-4 h-4 mf-input-icon textarea-icon" />
                  <textarea
                    className="mf-input-field"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="mf-submit-btn">
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Column 3: Our Location & Map */}
          <div className="mf-contact-col">
            <h3 className="mf-contact-col-header">Our Location</h3>
            <div className="mf-map-card">
              <img
                src="/medical_map_preview.jpg"
                alt="Hospital Medical District Map Preview"
                className="mf-map-img"
              />
            </div>

            <div className="mf-visit-us-box">
              <div className="mf-visit-icon">
                <Building className="w-5 h-5" />
              </div>
              <div className="mf-visit-text">
                <h5>Visit Us</h5>
                <p>We'd love to meet you! Feel free to visit our office for a demo or discussion.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 4. BOTTOM SUPPORT TILES & SOCIALS ── */}
      <section className="mf-contact-bottom-sec">
        <div className="mf-bottom-support-grid">
          
          <div className="mf-support-card">
            <div className="mf-support-icon-box">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="mf-support-text">
              <h4>Live Chat Support</h4>
              <p>Chat with our team for instant assistance.</p>
            </div>
          </div>

          <div className="mf-support-card">
            <div className="mf-support-icon-box">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div className="mf-support-text">
              <h4>Help Center</h4>
              <p>Find answers to common questions in our help center.</p>
            </div>
          </div>

          <div className="mf-support-card">
            <div className="mf-support-icon-box">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="mf-support-text">
              <h4>Sales Inquiries</h4>
              <p>Interested in SmartFlow? Talk to our sales team.</p>
            </div>
          </div>

          <div className="mf-support-card">
            <div className="mf-support-icon-box">
              <Users className="w-5 h-5" />
            </div>
            <div className="mf-support-text">
              <h4>Partnerships</h4>
              <p>Let's collaborate to build smarter healthcare.</p>
            </div>
          </div>

          <div className="mf-social-col">
            <h4>Follow Us</h4>
            <div className="mf-social-icons">
              <a href="#facebook" className="mf-social-btn" aria-label="Facebook">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#linkedin" className="mf-social-btn" aria-label="LinkedIn">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#twitter" className="mf-social-btn" aria-label="Twitter">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#youtube" className="mf-social-btn" aria-label="YouTube">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default ContactPage;
