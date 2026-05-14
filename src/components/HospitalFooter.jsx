/**
 * HospitalFooter.jsx – Premium hospital footer component
 * Matches the Pulse_Matrix design language with glassmorphism and medical color palette.
 */

export default function HospitalFooter() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", icon: "bi-house-fill" },
    { label: "About", icon: "bi-info-circle-fill" },
    { label: "Services", icon: "bi-clipboard2-pulse-fill" },
    { label: "Doctors", icon: "bi-person-badge-fill" },
    { label: "Emergency", icon: "bi-exclamation-triangle-fill" },
    { label: "Contact", icon: "bi-envelope-fill" },
  ];

  const socialLinks = [
    { name: "Instagram", icon: "bi-instagram", url: "https://instagram.com", color: "#E4405F" },
    { name: "X", icon: "bi-twitter-x", url: "https://x.com", color: "#000000" },
    { name: "Facebook", icon: "bi-facebook", url: "https://facebook.com", color: "#1877F2" },
    { name: "LinkedIn", icon: "bi-linkedin", url: "https://linkedin.com", color: "#0A66C2" },
    { name: "YouTube", icon: "bi-youtube", url: "https://youtube.com", color: "#FF0000" },
    { name: "WhatsApp", icon: "bi-whatsapp", url: "https://wa.me/919876543210", color: "#25D366" },
    { name: "Telegram", icon: "bi-telegram", url: "https://t.me/pulsematrix", color: "#0088CC" },
    { name: "Threads", icon: "bi-threads", url: "https://threads.net", color: "#000000" },
  ];

  const workingHours = [
    { day: "Monday – Friday", time: "8:00 AM – 10:00 PM" },
    { day: "Saturday", time: "9:00 AM – 6:00 PM" },
    { day: "Sunday", time: "10:00 AM – 4:00 PM" },
    { day: "Emergency / ICU", time: "24 / 7 Available" },
  ];

  return (
    <footer className="pm-footer">
      {/* Top wave separator */}
      <div className="pm-footer-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,40 C360,120 720,0 1080,80 C1260,110 1380,60 1440,40 L1440,120 L0,120 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="pm-footer-main">
        <div className="pm-footer-container">

          {/* Row 1: 4-Column Grid */}
          <div className="pm-footer-grid">

            {/* Column 1: Brand & About */}
            <div className="pm-footer-col pm-footer-brand-col">
              <div className="pm-footer-logo">
                <div className="pm-footer-logo-icon">
                  <i className="bi bi-heart-pulse-fill" />
                </div>
                <div>
                  <h3 className="pm-footer-brand-name">
                    Pulse<span className="pm-footer-accent">_Matrix</span>
                  </h3>
                  <span className="pm-footer-brand-tag">Smart Hospital</span>
                </div>
              </div>
              <p className="pm-footer-about">
                Pulse_Matrix is a next-generation Smart Hospital Emergency Management System 
                delivering real-time triage intelligence, bed analytics, and personnel 
                orchestration. We empower healthcare professionals with cutting-edge technology 
                to save lives faster.
              </p>
              <div className="pm-footer-certifications">
                <span className="pm-footer-cert"><i className="bi bi-shield-check" /> HIPAA Compliant</span>
                <span className="pm-footer-cert"><i className="bi bi-award" /> NABH Accredited</span>
                <span className="pm-footer-cert"><i className="bi bi-patch-check" /> ISO 9001:2015</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="pm-footer-col">
              <h4 className="pm-footer-heading">
                <i className="bi bi-link-45deg me-2" />Quick Links
              </h4>
              <ul className="pm-footer-links">
                {quickLinks.map(link => (
                  <li key={link.label}>
                    <a href="#" onClick={e => e.preventDefault()}>
                      <i className={`bi ${link.icon}`} />
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div className="pm-footer-col">
              <h4 className="pm-footer-heading">
                <i className="bi bi-telephone-fill me-2" />Contact Us
              </h4>
              <ul className="pm-footer-contact">
                <li>
                  <div className="pm-footer-contact-icon"><i className="bi bi-envelope-fill" /></div>
                  <div>
                    <span className="pm-footer-contact-label">Email</span>
                    <a href="mailto:info@pulsematrix.health">info@pulsematrix.health</a>
                  </div>
                </li>
                <li>
                  <div className="pm-footer-contact-icon"><i className="bi bi-telephone-fill" /></div>
                  <div>
                    <span className="pm-footer-contact-label">Phone</span>
                    <a href="tel:+919876543210">+91 98765 43210</a>
                  </div>
                </li>
                <li>
                  <div className="pm-footer-contact-icon pm-footer-contact-emergency"><i className="bi bi-exclamation-triangle-fill" /></div>
                  <div>
                    <span className="pm-footer-contact-label">Emergency Helpline</span>
                    <a href="tel:108" className="pm-footer-emergency-num">108</a>
                  </div>
                </li>
                <li>
                  <div className="pm-footer-contact-icon pm-footer-contact-ambulance"><i className="bi bi-truck" /></div>
                  <div>
                    <span className="pm-footer-contact-label">Ambulance</span>
                    <a href="tel:102" className="pm-footer-emergency-num">102</a>
                  </div>
                </li>
                <li>
                  <div className="pm-footer-contact-icon"><i className="bi bi-geo-alt-fill" /></div>
                  <div>
                    <span className="pm-footer-contact-label">Address</span>
                    <span className="pm-footer-address">Pulse_Matrix Medical Centre, MG Road, Bengaluru, Karnataka 560001, India</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Column 4: Working Hours */}
            <div className="pm-footer-col">
              <h4 className="pm-footer-heading">
                <i className="bi bi-clock-fill me-2" />Working Hours
              </h4>
              <ul className="pm-footer-hours">
                {workingHours.map(h => (
                  <li key={h.day} className={h.day.includes("Emergency") ? "pm-footer-hours-emergency" : ""}>
                    <span className="pm-footer-hours-day">{h.day}</span>
                    <span className="pm-footer-hours-time">{h.time}</span>
                  </li>
                ))}
              </ul>
              <div className="pm-footer-emergency-banner">
                <i className="bi bi-activity" />
                <span>Emergency services available <strong>24/7</strong></span>
              </div>
            </div>
          </div>

          {/* Social Media Row */}
          <div className="pm-footer-social-row">
            <h4 className="pm-footer-social-title">Connect With Us</h4>
            <div className="pm-footer-social-icons">
              {socialLinks.map(s => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pm-footer-social-link"
                  title={s.name}
                  style={{ "--social-color": s.color }}
                >
                  <i className={`bi ${s.icon}`} />
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="pm-footer-bottom">
        <div className="pm-footer-container">
          <div className="pm-footer-bottom-inner">
            <div className="pm-footer-copyright">
              <i className="bi bi-c-circle me-1" />
              {currentYear} <strong>Pulse_Matrix</strong>. All Rights Reserved.
            </div>
            <div className="pm-footer-bottom-links">
              <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
              <span className="pm-footer-dot">·</span>
              <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
              <span className="pm-footer-dot">·</span>
              <a href="#" onClick={e => e.preventDefault()}>Sitemap</a>
            </div>
            <div className="pm-footer-credit">
              Built with <i className="bi bi-heart-fill pm-footer-heart" /> using React + Three.js
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
