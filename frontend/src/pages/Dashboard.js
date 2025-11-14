import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if user is admin and redirect to admin dashboard
    const checkAdmin = async () => {
      try {
        const adminCheck = await fetch('http://localhost:5000/api/admin/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (adminCheck.ok) {
          // User is admin, redirect to admin dashboard
          navigate('/admin', { replace: true });
          return;
        }
      } catch (error) {
        // Not admin, continue with regular dashboard
      }
    };
    
    checkAdmin();

    Promise.all([
      fetch('http://localhost:5000/api/citizens/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('http://localhost:5000/api/departments', { headers: { 'Authorization': `Bearer ${token}` } })
    ])
    .then(async ([profileRes, deptsRes]) => {
      // Check profile response first - if unauthorized, redirect to login
      if (!profileRes.ok) {
        throw new Error('Unauthorized');
      }
      
      const profile = await profileRes.json();
      setUser(profile);
      
      // Handle departments response - if it fails, just set empty array
      if (deptsRes.ok) {
        const depts = await deptsRes.json();
        setDepartments(depts);
      } else {
        console.error('Failed to load departments:', deptsRes.status);
        setDepartments([]); // Set empty array if departments fail
      }
      
      setLoading(false);
    })
    .catch((error) => {
      console.error('Dashboard loading error:', error);
      // Only redirect to login if it's an auth error
      if (error.message === 'Unauthorized') {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        // For other errors, still show dashboard but with empty departments
        setLoading(false);
      }
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const goToServices = () => {
    // navigate to services page and pass department id
    navigate('/services', { state: { deptId: selectedDept } });
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard-root">
      <nav className="dashboard-nav">
        <h1>SmartSeva Dashboard</h1>
        <div className="nav-links">
          <button onClick={() => navigate('/services')} className="btn-link">Services</button>
          <button onClick={() => navigate('/applications')} className="btn-link">My Applications</button>
          <button onClick={() => navigate('/grievances')} className="btn-link">Grievances</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="dashboard-welcome">
          <h2>Welcome, {user?.name}</h2>
          <p>Your Citizen ID: {user?.citizen_id}</p>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Profile Information</h3>
            <div className="profile-details">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Phone:</strong> {user?.phone}</p>
              <p><strong>Address:</strong> {user?.address}</p>
              <p><strong>PIN:</strong> {user?.pin}</p>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button onClick={() => navigate('/services')} className="quick-action-btn">
                Browse Services
              </button>
              <button onClick={() => navigate('/applications')} className="quick-action-btn">
                View Applications
              </button>
              <button onClick={() => navigate('/grievances')} className="quick-action-btn">
                Create Grievance
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-dept">
          <h2>Choose the department</h2>
          <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
            <option value="">-- Select Department --</option>
            {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
          </select>
          <button disabled={!selectedDept} onClick={goToServices} className="btn-service">View Services</button>
        </div>
      </main>
    </div>
  );
}
