import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, applications, documents, grievances
  const [statusFilter, setStatusFilter] = useState('');
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [error, setError] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (admin) {
      loadDashboardData();
    }
  }, [admin, statusFilter, activeTab]);

  const checkAdminAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 403) {
          alert('Access denied. Admin privileges required.');
          navigate('/dashboard');
          return;
        }
        throw new Error('Unauthorized');
      }

      const adminData = await response.json();
      setAdmin(adminData);
      setLoading(false);
    } catch (error) {
      console.error('Admin auth error:', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const loadDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setDataLoading(true);
    setError(null);
    
    try {
      // Load stats
      try {
        const statsRes = await fetch('http://localhost:5000/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
          console.log('Dashboard stats loaded:', statsData);
        } else {
          const errorData = await statsRes.json();
          console.error('Failed to load stats:', errorData);
          setError(`Failed to load statistics: ${errorData.error || 'Unknown error'}`);
        }
      } catch (statsError) {
        console.error('Error loading stats:', statsError);
        setError('Failed to connect to dashboard API. Check if backend is running.');
      }

      // Load applications
      try {
        const url = statusFilter 
          ? `http://localhost:5000/api/admin/applications?status=${statusFilter}`
          : 'http://localhost:5000/api/admin/applications';
        
        const appsRes = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplications(appsData.applications || []);
          console.log('Applications loaded:', appsData.applications?.length || 0);
        } else {
          const errorData = await appsRes.json();
          console.error('Failed to load applications:', errorData);
        }
      } catch (appsError) {
        console.error('Error loading applications:', appsError);
      }

      // Load pending documents if on documents tab
      if (activeTab === 'documents') {
        try {
          const docsRes = await fetch('http://localhost:5000/api/admin/pending-documents', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (docsRes.ok) {
            const docsData = await docsRes.json();
            setPendingDocuments(docsData);
            console.log('Pending documents loaded:', docsData.length);
          }
        } catch (docsError) {
          console.error('Error loading documents:', docsError);
        }
      }

      // Load grievances if on grievances tab
      if (activeTab === 'grievances') {
        try {
          const grieveRes = await fetch('http://localhost:5000/api/admin/grievances', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (grieveRes.ok) {
            const grieveData = await grieveRes.json();
            setGrievances(grieveData);
            console.log('Grievances loaded:', grieveData.length);
          }
        } catch (grieveError) {
          console.error('Error loading grievances:', grieveError);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(`Connection error: ${error.message}`);
    } finally {
      setDataLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus, remark = '') => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, remark })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      const result = await response.json();
      console.log('Status update result:', result);
      
      // Show email status if available
      let message = result.message || 'Status updated successfully';
      if (result.emailSent === false && result.emailError) {
        message += `\n\nNote: Email notification could not be sent. ${result.emailError}`;
      }
      
      // Update the selected app with new status immediately
      if (selectedApp && selectedApp.app_id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus, remark: remark || selectedApp.remark });
      }
      
      // Reload all data to get fresh application list
      await loadDashboardData();
      
      // Close modal after a short delay to show the update
      setTimeout(() => {
        setSelectedApp(null);
      }, 500);
      
      alert(message);
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Failed to update application status: ${error.message}`);
    }
  };

  const handleDocumentVerify = async (docId, status) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/documents/${docId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verification_status: status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify document');
      }

      const result = await response.json();
      console.log('Document verification result:', result);
      
      // Reload all data to get fresh application list
      await loadDashboardData();
      
      // If we have a selected app, refresh its details
      if (selectedApp && selectedApp.app_id === result.appId) {
        // Reload the application details
        try {
          const appDetailsRes = await fetch(`http://localhost:5000/api/admin/applications/${result.appId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (appDetailsRes.ok) {
            const appDetails = await appDetailsRes.json();
            setSelectedApp(appDetails);
          }
        } catch (err) {
          console.error('Error refreshing application details:', err);
        }
      }
      
      alert(`Document ${status.toLowerCase()} successfully. ${result.appId ? 'Application status may have been updated.' : ''}`);
    } catch (error) {
      console.error('Error verifying document:', error);
      alert(`Failed to verify document: ${error.message}`);
    }
  };

  const handleResolveGrievance = async (grievanceId, resolutionRemark = '') => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/grievances/${grievanceId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolution_remark: resolutionRemark })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resolve grievance');
      }

      const result = await response.json();
      console.log('Grievance resolution result:', result);
      
      // Show email status if available
      let message = result.message || 'Grievance resolved successfully';
      if (result.emailSent === false && result.emailError) {
        message += `\n\nNote: Email notification could not be sent. ${result.emailError}`;
      }
      
      // Reload all data
      await loadDashboardData();
      
      alert(message);
    } catch (error) {
      console.error('Error resolving grievance:', error);
      alert(`Failed to resolve grievance: ${error.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <h1>SmartSeva Admin Dashboard</h1>
        <div className="admin-nav-right">
          <span className="admin-info">
            {admin?.name} ({admin?.role === 'SUPER_ADMIN' ? 'Super Admin' : admin?.dept_name || 'Department Admin'})
          </span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="admin-content">
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={loadDashboardData} className="btn-refresh">Refresh</button>
          </div>
        )}
        
        <div className="admin-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'applications' ? 'active' : ''} 
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button 
            className={activeTab === 'documents' ? 'active' : ''} 
            onClick={() => {
              setActiveTab('documents');
              loadDashboardData();
            }}
          >
            Pending Documents
          </button>
          <button 
            className={activeTab === 'grievances' ? 'active' : ''} 
            onClick={() => {
              setActiveTab('grievances');
              loadDashboardData();
            }}
          >
            Grievances
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="dashboard-stats">
            <div className="stats-header">
              <h2>Overview</h2>
              <button onClick={loadDashboardData} className="btn-refresh-small" disabled={dataLoading}>
                {dataLoading ? 'Loading...' : '🔄 Refresh'}
              </button>
            </div>
            {dataLoading && !stats && (
              <div className="loading-message">Loading statistics...</div>
            )}
            {stats ? (
              <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Applications</h3>
                <p className="stat-value">{stats.total_applications || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <p className="stat-value pending">{stats.pending_applications || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Documents Verified</h3>
                <p className="stat-value verified">{stats.documents_verified_applications || 0}</p>
              </div>
              <div className="stat-card">
                <h3>In Progress</h3>
                <p className="stat-value in-progress">{stats.in_progress_applications || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <p className="stat-value completed">{stats.completed_applications || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Open Grievances</h3>
                <p className="stat-value grievances">{stats.open_grievances || 0}</p>
              </div>
            </div>
            ) : !dataLoading && (
              <div className="no-data">
                <p>No statistics available. Make sure the database has data.</p>
                <button onClick={loadDashboardData} className="btn-primary">Retry</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-section">
            <div className="section-header">
              <h2>Applications</h2>
              <div className="header-actions">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="DOCUMENTS_VERIFIED">Documents Verified</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
                <option value="DOCUMENT_REJECTED">Document Rejected</option>
              </select>
                <button onClick={loadDashboardData} className="btn-refresh-small" disabled={dataLoading}>
                  {dataLoading ? 'Loading...' : '🔄'}
                </button>
              </div>
            </div>

            {dataLoading && applications.length === 0 && (
              <div className="loading-message">Loading applications...</div>
            )}

            {applications.length === 0 && !dataLoading && (
              <div className="no-data">
                <p>No applications found.</p>
              </div>
            )}

            <div className="applications-list">
              {applications.map(app => (
                <div key={app.app_id} className="application-card" onClick={() => setSelectedApp(app)}>
                  <div className="app-header">
                    <h3>{app.service_name}</h3>
                    <span className={`status-badge status-${app.status}`}>{app.status}</span>
                  </div>
                  <p><strong>Application ID:</strong> #{app.app_id}</p>
                  <p><strong>Citizen:</strong> {app.citizen_name}</p>
                  <p><strong>Email:</strong> {app.citizen_email}</p>
                  <p><strong>Phone:</strong> {app.citizen_phone || 'N/A'}</p>
                  <p><strong>Department:</strong> {app.dept_name}</p>
                  <p><strong>Applied:</strong> {new Date(app.applied_date).toLocaleDateString()}</p>
                  {app.completion_date && (
                    <p><strong>Completed:</strong> {new Date(app.completion_date).toLocaleDateString()}</p>
                  )}
                  {app.remark && <p><strong>Remark:</strong> {app.remark}</p>}
                  <p className="app-id-hint">Click to view details and update status</p>
                </div>
              ))}
            </div>

            {selectedApp && (
              <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>Update Application Status</h2>
                  <div className="app-details">
                    <p><strong>Application ID:</strong> #{selectedApp.app_id}</p>
                    <p><strong>Service:</strong> {selectedApp.service_name}</p>
                    <p><strong>Citizen:</strong> {selectedApp.citizen_name}</p>
                    <p><strong>Email:</strong> {selectedApp.citizen_email}</p>
                    <p><strong>Current Status:</strong> {selectedApp.status}</p>
                    {selectedApp.documents && selectedApp.documents.length > 0 && (
                      <div className="doc-status-section">
                        <p><strong>Documents:</strong></p>
                        {selectedApp.documents.map(doc => (
                          <p key={doc.doc_id} className="doc-item">
                            {doc.doc_type}: <span className={`doc-status-${doc.verification_status.toLowerCase()}`}>{doc.verification_status}</span>
                          </p>
                        ))}
                      </div>
                    )}
                    {selectedApp.payments && selectedApp.payments.length > 0 && (
                      <div className="payment-section">
                        <p><strong>Payment:</strong></p>
                        {selectedApp.payments.map(pay => (
                          <p key={pay.payment_id}>
                            ₹{pay.amount} via {pay.payment_mode} - {pay.status} (TXN: {pay.transaction_id})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="status-actions">
                    {selectedApp.status === 'DOCUMENTS_VERIFIED' && (
                      <button 
                        onClick={() => handleStatusUpdate(selectedApp.app_id, 'IN_PROGRESS', 'Processing started')}
                        className="btn-progress"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {selectedApp.status !== 'IN_PROGRESS' && selectedApp.status !== 'DOCUMENTS_VERIFIED' && (
                      <button 
                        onClick={() => handleStatusUpdate(selectedApp.app_id, 'IN_PROGRESS', 'Processing started')}
                        disabled={selectedApp.status === 'IN_PROGRESS'}
                      >
                        Mark In Progress
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        const remark = prompt('Enter completion remark (optional):');
                        handleStatusUpdate(selectedApp.app_id, 'COMPLETED', remark || '');
                      }}
                      disabled={selectedApp.status === 'COMPLETED'}
                      className="btn-complete"
                    >
                      Mark Completed
                    </button>
                    <button 
                      onClick={() => {
                        const remark = prompt('Enter rejection reason:');
                        if (remark) {
                          handleStatusUpdate(selectedApp.app_id, 'REJECTED', remark);
                        }
                      }}
                      disabled={selectedApp.status === 'REJECTED'}
                      className="btn-reject"
                    >
                      Reject
                    </button>
                  </div>
                  <button onClick={() => setSelectedApp(null)} className="btn-close">Close</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-section">
            <h2>Pending Document Verification</h2>
            <div className="documents-list">
              {pendingDocuments.map(doc => (
                <div key={doc.doc_id} className="document-card">
                  <h3>{doc.doc_type}</h3>
                  <p><strong>Application ID:</strong> #{doc.app_id}</p>
                  <p><strong>Citizen:</strong> {doc.citizen_name}</p>
                  <p><strong>Service:</strong> {doc.service_name}</p>
                  <p><strong>Uploaded:</strong> {new Date(doc.uploaded_date).toLocaleDateString()}</p>
                  <div className="document-actions">
                    <button 
                      onClick={() => handleDocumentVerify(doc.doc_id, 'VERIFIED')}
                      className="btn-verify"
                    >
                      Verify
                    </button>
                    <button 
                      onClick={() => handleDocumentVerify(doc.doc_id, 'REJECTED')}
                      className="btn-reject"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {pendingDocuments.length === 0 && <p>No pending documents</p>}
            </div>
          </div>
        )}

        {activeTab === 'grievances' && (
          <div className="grievances-section">
            <h2>Grievances</h2>
            <div className="grievances-list">
              {grievances.map(g => (
                <div key={g.grievance_id} className="grievance-card">
                  <div className="grievance-header">
                    <h3>{g.service_name || 'General'}</h3>
                    <span className={`status-badge status-${g.status}`}>{g.status}</span>
                  </div>
                  <p><strong>Citizen:</strong> {g.citizen_name} ({g.citizen_email})</p>
                  <p><strong>Created:</strong> {new Date(g.created_date).toLocaleDateString()}</p>
                  <p><strong>Description:</strong> {g.description}</p>
                  {g.resolved_date && (
                    <>
                      <p><strong>Resolved:</strong> {new Date(g.resolved_date).toLocaleDateString()}</p>
                      <p><strong>Resolution:</strong> {g.resolution_remark}</p>
                    </>
                  )}
                  {g.status === 'OPEN' && (
                    <button 
                      onClick={() => {
                        const remark = prompt('Enter resolution remark:');
                        if (remark) {
                          handleResolveGrievance(g.grievance_id, remark);
                        }
                      }}
                      className="btn-resolve"
                    >
                      Resolve Grievance
                    </button>
                  )}
                </div>
              ))}
              {grievances.length === 0 && <p>No grievances</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

