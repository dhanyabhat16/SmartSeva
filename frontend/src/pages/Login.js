import {useState} from "react";
import {useNavigate} from "react-router-dom";
import "./Login.css";
export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((f) => ({...f, [name]: value}));
    };
    const validate=()=>{ 
        if(!form.email) return "Email is required";
        if(!form.password || form.password.length<6) return "Password must be at least 6 characters";
        return null;
    };
    const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/citizens/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Invalid credentials");
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      
      // Check if user is admin and redirect accordingly
      try {
        const adminCheck = await fetch('http://localhost:5000/api/admin/profile', {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        
        if (adminCheck.ok) {
          // User is admin, redirect to admin dashboard
          navigate("/admin", { replace: true });
        } else {
          // User is not admin, redirect to regular dashboard
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        // If admin check fails, assume regular user
        navigate("/dashboard", { replace: true });
      }
      
      setForm({
        email: "",
        password: "",
      });
    } catch (err) {
      alert("Sign failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="signin-root">
      <button className="back-btn" aria-label="Back to home" onClick={() => navigate('/')}>←</button>
      <div className="signin-container">
      <h3>Sign In</h3>
      <form onSubmit={handleSubmit} className="signin-form">
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
      </form>
      </div>
    </div>
  );
}
