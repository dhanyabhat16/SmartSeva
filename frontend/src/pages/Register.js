import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    age: "",
    phone: "",
    email: "",
    aadhaar: "",
    address: "",
    pin: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.name) return "Name is required";
    if (!form.email) return "Email is required";
    if (!form.password || form.password.length < 6)
      return "Password must be at least 6 characters";
    if (!/^[0-9]{12}$/.test(form.aadhaar)) return "Aadhaar must be 12 digits";
    if (!/^[0-9]{6}$/.test(form.pin)) return "PIN must be 6 digits";
    if (!/^[0-9]{10}$/.test(form.phone)) return "Phone must be 10 digits";
    return null;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/citizens/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Server error");
      }
      navigate("/", { replace: true });
      setForm({
        name: "",
        dob: "",
        gender: "",
        age: "",
        phone: "",
        email: "",
        aadhaar: "",
        address: "",
        pin: "",
        password: "",
      });
    } catch (err) {
      alert("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="register-root">
      <button className="back-btn" aria-label="Back to home" onClick={() => navigate('/')}>←</button>
      <div className="register-container">
      <h3>Citizen Registration</h3>
      <form onSubmit={handleSubmit} className="register-form">
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
        <input name="dob" type="date" value={form.dob} onChange={handleChange} />
        <select name="gender" value={form.gender} onChange={handleChange}>
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input name="age" type="number" min="0" placeholder="Age" value={form.age} onChange={handleChange} />
        <input name="phone" placeholder="Phone (10 digits)" value={form.phone} onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="aadhaar" placeholder="Aadhaar (12 digits)" value={form.aadhaar} onChange={handleChange} />
        <textarea name="address" placeholder="Address" value={form.address} onChange={handleChange}></textarea>
        <input name="pin" placeholder="PIN (6 digits)" value={form.pin} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
      </form>
      </div>
    </div>
  );
}
