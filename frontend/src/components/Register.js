import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    usn: '',
    roomNumber: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    // Clean inputs: trim and remove any backslashes (common cause of JSON error)
    const cleanedData = {
      name: form.name.trim().replace(/\\/g, ''),
      email: form.email.trim().replace(/\\/g, ''),
      password: form.password,
      usn: form.usn.trim().replace(/\\/g, ''),
      roomNumber: form.roomNumber.trim().replace(/\\/g, ''),
      phoneNumber: form.phoneNumber.trim().replace(/\\/g, '')
    };

    setLoading(true);
    try {
      await axios.post('/api/auth/register', cleanedData);
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err.response || err);
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Hostel<span>Hub</span></h1>
          <p>Student Registration</p>
        </div>
        <div className="auth-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>USN *</label>
              <input name="usn" value={form.usn} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Room Number *</label>
              <input name="roomNumber" value={form.roomNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input type="password" name="confirm" value={form.confirm} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
            <div className="info-box">
              Already have an account? <a href="/login">Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}