import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// ------------------- All Complaints Component -------------------
const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchComplaints();
  }, [filterCat, filterStatus]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCat !== 'all') params.append('category', filterCat);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      const url = `/api/complaints?${params}`;
      const res = await axios.get(url, { headers: { 'x-auth-token': token } });
      setComplaints(res.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/complaints/${id}`, { status }, { headers: { 'x-auth-token': token } });
      fetchComplaints();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB');

  if (loading) return <div className="loading">Loading complaints...</div>;

  return (
    <div className="complaints-section">
      <h2>All Complaints</h2>
      <div className="filters">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="carpentry">Carpentry</option>
          <option value="cleaning">Cleaning</option>
          <option value="other">Other</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <button onClick={() => { setFilterCat('all'); setFilterStatus('all'); }} className="clear-filters">
          Clear
        </button>
      </div>

      <div className="complaints-table-container">
        <table className="complaints-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Category</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c._id}>
                <td className="complaint-id">#{c._id.slice(-4)}</td>
                <td>
                  <div className="student-cell">
                    <span className="student-name">{c.student?.name}</span>
                    <span className="student-email">{c.student?.email}</span>
                    <span className="student-room">Room: {c.student?.roomNumber}</span>
                  </div>
                </td>
                <td><span className="category-badge">{c.category}</span></td>
                <td className="description-cell">
                  <div className="description">{c.description}</div>
                </td>
                <td>
                  <span className={`priority-badge priority-${c.priority}`}>{c.priority}</span>
                </td>
                <td>
                  <span className={`status-badge status-${c.status.replace('-','')}`}>{c.status}</span>
                </td>
                <td>{formatDate(c.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    {c.status === 'pending' && (
                      <button onClick={() => updateStatus(c._id, 'in-progress')} className="start-btn" title="Start">▶️ Start</button>
                    )}
                    {c.status === 'in-progress' && (
                      <button onClick={() => updateStatus(c._id, 'resolved')} className="resolve-btn" title="Resolve">✅ Resolve</button>
                    )}
                    {c.status === 'resolved' && (
                      <span className="resolved-indicator">✅</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr><td colSpan="8" className="no-data">No complaints found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ------------------- Students List Component -------------------
const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/students', {
        headers: { 'x-auth-token': token }
      });
      setStudents(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) return <div className="loading">Loading students...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="students-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>All Students</h2>
        <button onClick={fetchStudents} className="refresh-btn">🔄 Refresh</button>
      </div>
      <table className="students-table">
        <thead>
          <tr><th>Name</th><th>Email</th></tr>
        </thead>
        <tbody>
          {students.map((student, idx) => (
            <tr key={idx}>
              <td>{student.name}</td>
              <td>{student.email}</td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr><td colSpan="2" className="no-data">No students found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ------------------- Settings Component -------------------
const Settings = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="settings-section">
      <h2>Settings</h2>
      <div className="setting-item">
        <span>Dark Mode</span>
        <label className="switch">
          <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
};

// ------------------- Main AdminDashboard -------------------
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('complaints');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={`admin-dashboard ${theme}`}>
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <h1>Hostel<span>Hub</span></h1>
            <p>Admin Panel</p>
          </div>
          <div className="admin-profile">
            <div className="admin-avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div className="admin-info">
              <span className="admin-name">{user?.name || 'Admin'}</span>
              <span className="admin-role">Administrator</span>
            </div>
          </div>
        </div>
        <div className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>
            <span className="nav-icon">📋</span> All Complaints
          </div>
          <div className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            <span className="nav-icon">👥</span> Students
          </div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <span className="nav-icon">⚙️</span> Settings
          </div>
        </div>
        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">🚪 Logout</button>
        </div>
      </div>

      <div className="admin-main">
        {activeTab === 'complaints' && <AllComplaints />}
        {activeTab === 'students' && <StudentsList />}
        {activeTab === 'settings' && <Settings theme={theme} setTheme={setTheme} />}
      </div>
    </div>
  );
}