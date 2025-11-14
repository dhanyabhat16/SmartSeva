import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Services.css";

export default function Services() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [user, setUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if user is admin and redirect
    const checkAdmin = async () => {
      try {
        const adminCheck = await fetch('http://localhost:5000/api/admin/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (adminCheck.ok) {
          navigate('/admin', { replace: true });
          return;
        }
      } catch (error) {
        // Not admin, continue
      }
    };
    
    checkAdmin();

    // Get deptId from navigation state or URL params
    const deptId = location.state?.deptId || new URLSearchParams(location.search).get('deptId') || '';
    
    loadData(token, deptId);
  }, [location, navigate]);

  const loadData = async (token, deptId = '') => {
    try {
      // Load user profile
      const profileRes = await fetch('http://localhost:5000/api/citizens/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUser(profile);
      }

      // Load departments
      const deptsRes = await fetch('http://localhost:5000/api/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (deptsRes.ok) {
        const depts = await deptsRes.json();
        setDepartments(depts);
        if (deptId) {
          setSelectedDept(deptId);
        }
      }

      // Load services
      const servicesRes = await fetch('http://localhost:5000/api/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (servicesRes.ok) {
        const svcs = await servicesRes.json();
        setServices(svcs);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setSelectedDept(deptId);
    // Filter services by department
  };

  const filteredServices = selectedDept 
    ? services.filter(s => s.dept_id == selectedDept)
    : services;

  const handleApply = (service) => {
    setSelectedService(service);
    setShowApplyModal(true);
  };

  const handleConfirmApply = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: selectedService.service_id
        })
      });

      if (!response.ok) throw new Error('Failed to apply');

      const result = await response.json();
      alert(`Application created successfully! Application ID: ${result.app_id}`);
      setShowApplyModal(false);
      navigate('/applications');
    } catch (error) {
      console.error('Error applying for service:', error);
      alert('Failed to apply for service. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <div className="services-loading">Loading...</div>;

  return (
    <div className="services-root">
      <nav className="services-nav">
        <h1>SmartSeva Services</h1>
        <div className="nav-links">
          <button onClick={() => navigate('/dashboard')} className="btn-link">Dashboard</button>
          <button onClick={() => navigate('/applications')} className="btn-link">My Applications</button>
          <button onClick={() => navigate('/grievances')} className="btn-link">Grievances</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <main className="services-content">
        <div className="services-header">
          <h2>Available Services</h2>
          <div className="department-filter">
            <label>Filter by Department:</label>
            <select value={selectedDept} onChange={handleDepartmentChange}>
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.dept_id} value={dept.dept_id}>{dept.dept_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="services-grid">
          {filteredServices.map(service => (
            <div key={service.service_id} className="service-card">
              <div className="service-header">
                <h3>{service.service_name}</h3>
                <span className="service-badge">₹{service.fee}</span>
              </div>
              <p className="service-description">{service.description}</p>
              <div className="service-info">
                <p><strong>Processing Time:</strong> {service.processing_days} days</p>
                <p><strong>Fee:</strong> ₹{service.fee}</p>
              </div>
              <button 
                onClick={() => handleApply(service)} 
                className="btn-apply"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="no-services">
            <p>No services available for the selected department.</p>
          </div>
        )}
      </main>

      {showApplyModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Apply for Service</h2>
            <div className="apply-details">
              <h3>{selectedService.service_name}</h3>
              <p><strong>Description:</strong> {selectedService.description}</p>
              <p><strong>Fee:</strong> ₹{selectedService.fee}</p>
              <p><strong>Processing Time:</strong> {selectedService.processing_days} days</p>
              <p className="apply-note">
                After applying, you can upload required documents and make payment on the Applications page.
              </p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowApplyModal(false)} className="btn-cancel">Cancel</button>
              <button onClick={handleConfirmApply} className="btn-confirm">Confirm Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

