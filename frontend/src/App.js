import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.js";
import Register from "./pages/Register.js";
import Login from "./pages/Login.js";
import Dashboard from "./pages/Dashboard.js";
import Services from "./pages/Services.js";
import Applications from "./pages/Applications.js";
import Grievances from "./pages/Grievances.js";
import AdminDashboard from "./pages/AdminDashboard.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/services" element={<Services />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/grievances" element={<Grievances />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
