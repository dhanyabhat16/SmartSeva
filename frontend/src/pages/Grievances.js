import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Grievances.css";

export default function Grievances() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [grievances, setGrievances] = useState([]);
  const [services, setServices] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [grievanceForm, setGrievanceForm] = useState({
    service_id: '',
    description: ''
  });

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

    loadData(token);
  }, [navigate]);

  const loadData = async (token) => {
    try {
      // Load grievances
      const grieveRes = await fetch('http://localhost:5000/api/grievances', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (grieveRes.ok) {
        const grieveData = await grieveRes.json();
        setGrievances(grieveData);
      }

      // Load services for dropdown
      const servicesRes = await fetch('http://localhost:5000/api/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleCreateGrievance = async () => {
    if (!grievanceForm.service_id || !grievanceForm.description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/grievances', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: parseInt(grievanceForm.service_id),
          description: grievanceForm.description
        })
      });

      if (!response.ok) throw new Error('Failed to create grievance');

      const result = await response.json();
      alert(`Grievance created successfully! Grievance ID: ${result.grievance_id}`);
      setShowCreateModal(false);
      setGrievanceForm({ service_id: '', description: '' });
      loadData(token);
    } catch (error) {
      console.error('Error creating grievance:', error);
      alert('Failed to create grievance. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED': return '#28a745';
      case 'IN_PROGRESS': return '#17a2b8';
      case 'OPEN': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <div className="grievances-loading">Loading...</div>;

  return (
    <div className="grievances-root">
      <nav className="grievances-nav">
        <h1>Grievances</h1>
        <div className="nav-links">
          <button onClick={() => navigate('/dashboard')} className="btn-link">Dashboard</button>
          <button onClick={() => navigate('/services')} className="btn-link">Services</button>
          <button onClick={() => navigate('/applications')} className="btn-link">My Applications</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <main className="grievances-content">
        <div className="grievances-header">
          <h2>Your Grievances</h2>
          <button onClick={() => setShowCreateModal(true)} className="btn-create">
            Create New Grievance
          </button>
        </div>

        {grievances.length === 0 ? (
          <div className="no-grievances">
            <p>You haven't submitted any grievances yet.</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create Your First Grievance
            </button>
          </div>
        ) : (
          <div className="grievances-list">
            {grievances.map(grievance => (
              <div key={grievance.grievance_id} className="grievance-card">
                <div className="grievance-header">
                  <div>
                    <h3>{grievance.service_name || 'General'}</h3>
                    <p className="grievance-id">Grievance ID: #{grievance.grievance_id}</p>
                  </div>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(grievance.status) }}
                  >
                    {grievance.status}
                  </span>
                </div>
                
                <div className="grievance-details">
                  <p className="grievance-description">
                    <strong>Description:</strong> {grievance.description}
                  </p>
                  <p><strong>Created:</strong> {new Date(grievance.created_date).toLocaleDateString()}</p>
                  
                  {grievance.resolved_date && (
                    <p><strong>Resolved:</strong> {new Date(grievance.resolved_date).toLocaleDateString()}</p>
                  )}
                  
                  {grievance.resolution_remark && (
                    <div className="resolution-box">
                      <p><strong>Resolution:</strong></p>
                      <p>{grievance.resolution_remark}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Grievance</h2>
            <div className="grievance-form">
              <div className="form-group">
                <label>Service (Optional)</label>
                <select
                  value={grievanceForm.service_id}
                  onChange={(e) => setGrievanceForm({ ...grievanceForm, service_id: e.target.value })}
                >
                  <option value="">Select Service (Optional)</option>
                  {services.map(service => (
                    <option key={service.service_id} value={service.service_id}>
                      {service.service_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={grievanceForm.description}
                  onChange={(e) => setGrievanceForm({ ...grievanceForm, description: e.target.value })}
                  placeholder="Describe your grievance in detail..."
                  rows="6"
                  required
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleCreateGrievance} className="btn-confirm">
                Submit Grievance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

