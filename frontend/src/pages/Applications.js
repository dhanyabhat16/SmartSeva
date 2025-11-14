import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Applications.css";

export default function Applications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount: '', payment_mode: 'UPI' });
  const [documentData, setDocumentData] = useState({ doc_type: '', doc: null });

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

    loadApplications(token);
  }, [navigate]);

  const loadApplications = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load applications');

      const data = await response.json();
      setApplications(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading applications:', error);
      setLoading(false);
    }
  };

  const handlePayNow = (application) => {
    setSelectedApp(application);
    setPaymentData({ 
      amount: application.fee || '', 
      payment_mode: 'UPI' 
    });
    setShowPaymentModal(true);
  };

  const handleUploadDocument = (application) => {
    setSelectedApp(application);
    setDocumentData({ doc_type: '', doc: null });
    setShowDocumentModal(true);
  };

  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    
    if (!paymentData.amount || !paymentData.payment_mode) {
      alert('Please fill in all payment details');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/applications/${selectedApp.app_id}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(paymentData.amount),
          payment_mode: paymentData.payment_mode
        })
      });

      if (!response.ok) throw new Error('Payment failed');

      const result = await response.json();
      alert(`Payment successful! Transaction ID: ${result.transaction_id}`);
      setShowPaymentModal(false);
      loadApplications(token);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const handleDocumentUpload = async () => {
    const token = localStorage.getItem('token');
    
    if (!documentData.doc_type || !documentData.doc) {
      alert('Please select document type and upload a file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('doc', documentData.doc);
      formData.append('doc_type', documentData.doc_type);

      const response = await fetch(`http://localhost:5000/api/applications/${selectedApp.app_id}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      alert(`Document uploaded successfully! Document ID: ${result.doc_id}`);
      setShowDocumentModal(false);
      setDocumentData({ doc_type: '', doc: null });
      loadApplications(token);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Document upload failed. Please try again.');
    }
  };

  const handleFileChange = (e) => {
    setDocumentData({ ...documentData, doc: e.target.files[0] });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#28a745';
      case 'IN_PROGRESS': return '#17a2b8';
      case 'DOCUMENTS_VERIFIED': return '#0b5ed7';
      case 'PENDING': return '#ffc107';
      case 'REJECTED': return '#dc3545';
      case 'DOCUMENT_REJECTED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <div className="applications-loading">Loading...</div>;

  return (
    <div className="applications-root">
      <nav className="applications-nav">
        <h1>My Applications</h1>
        <div className="nav-links">
          <button onClick={() => navigate('/dashboard')} className="btn-link">Dashboard</button>
          <button onClick={() => navigate('/services')} className="btn-link">Services</button>
          <button onClick={() => navigate('/grievances')} className="btn-link">Grievances</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <main className="applications-content">
        <div className="applications-header">
          <h2>Your Applications</h2>
          <button onClick={() => navigate('/services')} className="btn-apply-new">
            Apply for New Service
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="no-applications">
            <p>You haven't applied for any services yet.</p>
            <button onClick={() => navigate('/services')} className="btn-primary">
              Browse Services
            </button>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map(app => (
              <div key={app.app_id} className="application-card">
                <div className="app-header">
                  <h3>{app.service_name}</h3>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(app.status) }}
                  >
                    {app.status}
                  </span>
                </div>
                
                <div className="app-details">
                  <p><strong>Application ID:</strong> #{app.app_id}</p>
                  <p><strong>Applied Date:</strong> {new Date(app.applied_date).toLocaleDateString()}</p>
                  {app.completion_date && (
                    <p><strong>Completion Date:</strong> {new Date(app.completion_date).toLocaleDateString()}</p>
                  )}
                  {app.remark && <p><strong>Remark:</strong> {app.remark}</p>}
                  {app.fee && <p><strong>Fee:</strong> ₹{app.fee}</p>}
                  {app.payment_status && (
                    <p><strong>Payment Status:</strong> 
                      <span className={`payment-status ${app.payment_status.toLowerCase()}`}>
                        {app.payment_status}
                      </span>
                    </p>
                  )}
                </div>

                <div className="app-actions">
                  {/* Show document verification status */}
                  {app.documents && app.documents.length > 0 && (
                    <div className="doc-status-info">
                      <p><strong>Documents:</strong></p>
                      <div className="doc-status-badges">
                        {app.documents.map(doc => (
                          <span key={doc.doc_id} className={`doc-status ${doc.verification_status.toLowerCase()}`}>
                            {doc.doc_type}: {doc.verification_status}
                          </span>
                        ))}
                      </div>
                      {app.has_pending_documents && (
                        <p className="doc-waiting">⏳ Waiting for document verification...</p>
                      )}
                      {app.has_rejected_documents && (
                        <p className="doc-rejected">❌ Some documents were rejected. Please upload again.</p>
                      )}
                      {app.all_documents_verified && (
                        <p className="doc-verified">✅ All documents verified!</p>
                      )}
                    </div>
                  )}
                  
                  {/* Show payment button only when documents are verified or status is DOCUMENTS_VERIFIED */}
                  {(app.can_pay || app.status === 'DOCUMENTS_VERIFIED') && app.fee && !app.payment_status && (
                    <button 
                      onClick={() => handlePayNow(app)}
                      className="btn-pay"
                    >
                      Pay Now
                    </button>
                  )}
                  
                  {/* Show upload document button if documents not all verified */}
                  {app.status !== 'COMPLETED' && app.status !== 'REJECTED' && app.status !== 'DOCUMENT_REJECTED' && 
                   (!app.all_documents_verified || app.has_rejected_documents) && (
                    <button 
                      onClick={() => handleUploadDocument(app)}
                      className="btn-upload"
                    >
                      {app.has_rejected_documents ? 'Re-upload Document' : 'Upload Document'}
                    </button>
                  )}
                  
                  {app.transaction_id && (
                    <p className="transaction-id">TXN ID: {app.transaction_id}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showPaymentModal && selectedApp && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Make Payment</h2>
            <div className="payment-details">
              <h3>{selectedApp.service_name}</h3>
              <p><strong>Application ID:</strong> #{selectedApp.app_id}</p>
              <p><strong>Amount:</strong> ₹{selectedApp.fee}</p>
            </div>
            <div className="payment-form">
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Payment Mode</label>
                <select
                  value={paymentData.payment_mode}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_mode: e.target.value })}
                >
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="NetBanking">Net Banking</option>
                  <option value="Wallet">Wallet</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowPaymentModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handlePayment} className="btn-confirm">
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

      {showDocumentModal && selectedApp && (
        <div className="modal-overlay" onClick={() => setShowDocumentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Upload Document</h2>
            <div className="document-details">
              <h3>{selectedApp.service_name}</h3>
              <p><strong>Application ID:</strong> #{selectedApp.app_id}</p>
            </div>
            <div className="document-form">
              <div className="form-group">
                <label>Document Type</label>
                <select
                  value={documentData.doc_type}
                  onChange={(e) => setDocumentData({ ...documentData, doc_type: e.target.value })}
                >
                  <option value="">Select Document Type</option>
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Address Proof">Address Proof</option>
                  <option value="Identity Proof">Identity Proof</option>
                  <option value="Property Proof">Property Proof</option>
                  <option value="Old Bill">Old Bill</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Upload File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {documentData.doc && (
                  <p className="file-name">Selected: {documentData.doc.name}</p>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowDocumentModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleDocumentUpload} className="btn-confirm">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

