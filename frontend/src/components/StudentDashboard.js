import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ category: '', description: '', priority: 'medium' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // Main effect: authenticate and fetch complaints
  useEffect(() => {
    // Define fetchComplaints inside useEffect to avoid dependency issues
    const fetchComplaints = async () => {
      try {
        const res = await axios.get('/api/complaints/my', {
          headers: { 'x-auth-token': token }
        });
        setComplaints(res.data);
        // Update stats
        const total = res.data.length;
        const pending = res.data.filter(c => c.status === 'pending').length;
        const inProgress = res.data.filter(c => c.status === 'in-progress').length;
        const resolved = res.data.filter(c => c.status === 'resolved').length;
        setStats({ total, pending, inProgress, resolved });
      } catch (err) {
        console.error('Error fetching complaints:', err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    // Authentication checks
    if (!token) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'student') {
      setError('Access denied. Student only.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    fetchComplaints();
  }, [token, user, navigate]); // Dependencies: token, user, navigate (all stable)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.category) {
      setError('Please select a category');
      return;
    }
    if (!form.description.trim()) {
      setError('Please enter a description');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/complaints', form, {
        headers: { 'x-auth-token': token }
      });
      setSuccess('✅ Complaint submitted successfully!');
      setForm({ category: '', description: '', priority: 'medium' });

      // Refresh complaints list by re-fetching (we can't call the internal function directly,
      // so we re-run the same fetching logic or extract it. Since fetchComplaints is inside useEffect,
      // we'll create a separate function or just re-run the fetch logic here.
      const refreshComplaints = async () => {
        try {
          const res = await axios.get('/api/complaints/my', {
            headers: { 'x-auth-token': token }
          });
          setComplaints(res.data);
          const total = res.data.length;
          const pending = res.data.filter(c => c.status === 'pending').length;
          const inProgress = res.data.filter(c => c.status === 'in-progress').length;
          const resolved = res.data.filter(c => c.status === 'resolved').length;
          setStats({ total, pending, inProgress, resolved });
        } catch (err) {
          console.error('Error refreshing complaints:', err);
        }
      };
      refreshComplaints();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Submission error:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('❌ Cannot connect to server. Backend may be down.');
      } else if (err.response?.status === 401) {
        setError('❌ Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else if (err.response?.status === 403) {
        setError('❌ Access denied. Student only.');
      } else {
        setError(err.response?.data?.message || '❌ Failed to submit complaint');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Color helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'in-progress': return '#3498db';
      case 'resolved': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'high': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'plumbing': return '#2980b9';
      case 'electrical': return '#f39c12';
      case 'carpentry': return '#8e44ad';
      case 'cleaning': return '#16a085';
      case 'other': return '#7f8c8d';
      default: return '#2c3e50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'in-progress': return '🛠️';
      case 'resolved': return '✅';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="student-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <header className="student-header">
        <div className="header-content">
          <div className="logo">
            <h1>🏠 Hostel<span>Hub</span></h1>
            <p>Student Portal</p>
          </div>
          <div className="user-menu">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Student'}</span>
              <span className="user-email">{user?.email || ''}</span>
            </div>
            <button onClick={logout} className="logout-btn">
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="welcome-banner">
        <div className="banner-content">
          <h2>Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋</h2>
          <p>Track and manage your hostel complaints from one place.</p>
        </div>
        <div className="quick-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card pending">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card progress">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card resolved">
            <span className="stat-value">{stats.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      <div className="student-main">
        <div className="complaint-form-container">
          <div className="section-header">
            <h3>📝 Submit New Complaint</h3>
            <p>Fill in the details below to report an issue</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="complaint-form">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                <option value="plumbing">🚰 Plumbing</option>
                <option value="electrical">⚡ Electrical</option>
                <option value="carpentry">🪑 Carpentry</option>
                <option value="cleaning">🧹 Cleaning</option>
                <option value="other">📌 Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail..."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label>Priority</label>
              <div className="priority-options">
                <label className={`priority-option ${form.priority === 'low' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="priority"
                    value="low"
                    checked={form.priority === 'low'}
                    onChange={handleChange}
                  />
                  <span className="priority-low">🟢 Low</span>
                </label>
                <label className={`priority-option ${form.priority === 'medium' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="priority"
                    value="medium"
                    checked={form.priority === 'medium'}
                    onChange={handleChange}
                  />
                  <span className="priority-medium">🟡 Medium</span>
                </label>
                <label className={`priority-option ${form.priority === 'high' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="priority"
                    value="high"
                    checked={form.priority === 'high'}
                    onChange={handleChange}
                  />
                  <span className="priority-high">🔴 High</span>
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>

        <div className="complaints-list-container">
          <div className="section-header">
            <h3>📋 My Complaints</h3>
            <p>Track the status of your submitted complaints</p>
          </div>

          {complaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h4>No complaints yet</h4>
              <p>Submit your first complaint using the form</p>
            </div>
          ) : (
            <div className="complaints-timeline">
              {complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="timeline-item"
                  style={{
                    borderLeft: `4px solid ${getStatusColor(complaint.status)}`,
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div className="complaint-header">
                    <span className="complaint-id">#{complaint._id.slice(-6)}</span>
                    <span
                      className="priority-badge"
                      style={{
                        backgroundColor: getPriorityColor(complaint.priority),
                        color: '#fff',
                      }}
                    >
                      {complaint.priority}
                    </span>
                  </div>

                  <h4 className="complaint-category" style={{ color: getCategoryColor(complaint.category) }}>
                    {complaint.category}
                  </h4>

                  <p className="complaint-description">{complaint.description}</p>

                  <div className="complaint-footer">
                    <span className={`status-badge status-${complaint.status.replace('-', '')}`}>
                      {getStatusIcon(complaint.status)} {complaint.status}
                    </span>
                    <span className="complaint-date">
                      📅 {formatDate(complaint.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}