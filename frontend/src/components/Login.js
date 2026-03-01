import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

export default function Login() {
  const [loginType, setLoginType] = useState('student'); // 'student' or 'admin'
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const navigate = useNavigate();

  useEffect(() => {
    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkServer = async () => {
    try {
      await axios.get('/api/health', { timeout: 2000 });
      setServerStatus('online');
    } catch {
      setServerStatus('offline');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('❌ Cannot connect to server. Backend may be down.');
      } else if (err.response?.status === 400) {
        setError('❌ Invalid email or password');
      } else if (err.response?.status === 401) {
        setError('❌ Unauthorized');
      } else {
        setError('❌ Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fill demo credentials for quick testing
  const fillDemoCredentials = () => {
    if (loginType === 'admin') {
      setFormData({ email: 'admin@hostelhub.com', password: 'admin123' });
    } else {
      setFormData({ email: 'student@test.com', password: '123' });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Hostel<span>Hub</span></h1>
          <p>Hostel Complaint Management</p>
          <div className={`server-status ${serverStatus}`}>
            {serverStatus === 'online' ? '🟢 Server Connected' : '🔴 Server Disconnected'}
          </div>
        </div>

        {/* Role Tabs */}
        <div className="login-tabs">
          <button
            className={`tab ${loginType === 'student' ? 'active' : ''}`}
            onClick={() => {
              setLoginType('student');
              setFormData({ email: '', password: '' });
              setError('');
            }}
          >
            👨‍🎓 Student Login
          </button>
          <button
            className={`tab ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setLoginType('admin');
              setFormData({ email: '', password: '' });
              setError('');
            }}
          >
            👨‍💼 Admin Login
          </button>
        </div>

        <div className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={loginType === 'admin' ? 'admin@hostelhub.com' : 'student@example.com'}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={loading || serverStatus === 'offline'}
            >
              {loading ? 'Logging in...' : serverStatus === 'offline' ? 'Server Offline' : 'Login'}
            </button>
          </form>

         

          {/* Registration link for students */}
          <div className="info-box" style={{ marginTop: '20px' }}>
            {loginType === 'student' ? (
              <p>New student? <a href="/register">Register here</a></p>
            ) : (
              <p>Admin accounts are created by the system administrator.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}