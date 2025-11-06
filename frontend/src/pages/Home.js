import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <main className="home-root">
      <section className="hero">
        <div className="hero-overlay">
          <h1 className="hero-title">SmartSeva</h1>
          <p className="hero-sub">Access government services quickly and securely</p>
          <div className="hero-ctas">
            <button className="btn primary" onClick={() => navigate('/register')}>Register Now</button>
            <a className="btn ghost" href="#about">Learn more</a>
          </div>
        </div>
      </section>

      <section id="about" className="content-section reveal">
        <div className="container-inner">
          <h2>Who is this for?</h2>
          <p>
            SmartSeva is designed for everyday citizens who want one place to manage their
            government interactions — from applying for services to tracking requests. It's simple,
            mobile-friendly, and secure.
          </p>
        </div>
      </section>

      <section className="features reveal">
        <div className="container-inner">
          <h2>Key features</h2>
          <div className="cards">
            <article className="card">
              <h3>Single Registration</h3>
              <p>Sign up once with Aadhaar and manage multiple services without repeating your details.</p>
            </article>
            <article className="card">
              <h3>Secure Data</h3>
              <p>Passwords are hashed and we suggest using HTTPS and best-practice security on the server.</p>
            </article>
            <article className="card">
              <h3>Track Requests</h3>
              <p>Submit applications and track status in real-time from your dashboard.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="cta-strip reveal">
        <div className="container-inner">
          <h2>Ready to get started?</h2>
          <button className="btn primary" onClick={() => navigate('/register')}>Create your account</button>
        </div>
      </section>

      <footer className="site-footer reveal">
        <div className="container-inner">
          <small>© {new Date().getFullYear()} SmartSeva — Built for citizens.</small>
        </div>
      </footer>
    </main>
  );
}
