import React, { useState } from 'react';
import './login.css';

// ==========================================
// REGISTRATION COMPONENT
// ==========================================
export const Register = ({ onRegister, navigateToLogin }) => {
  const [formData, setFormData] = useState({ name: '', surname: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      return setError('Passwords do not match!');
    }
    setError('');
    onRegister(formData);
  };

  return (
    <div className="auth-page centered-bg">
      <div className="auth-box">
        <h2>Create an Account</h2>
        <p>Set up your workspace to get started.</p>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form stack-form">
          <div className="input-group">
            <label>Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Surname</label>
            <input required type="text" value={formData.surname} onChange={e => setFormData({ ...formData, surname: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Confirm Password</label>
            <input required type="password" value={formData.confirm} onChange={e => setFormData({ ...formData, confirm: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">Create Account</button>
        </form>
        <p className="auth-footer">Already have an account? <span onClick={navigateToLogin}>Log in</span></p>
      </div>
    </div>
  );
};

// ==========================================
// LOGIN COMPONENT
// ==========================================
export const Login = ({ registeredUser, onLogin, navigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!registeredUser) {
      return setError('No account found. Please create one.');
    }
    if (email === registeredUser.email && password === registeredUser.password) {
      onLogin();
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="auth-page right-aligned-bg">
      <div className="login-wrapper-right">
        <div className="auth-box">
          <div className="logo-box">A</div>
          <h2>Sign In</h2>
          <p>Welcome back. Please sign in to your workspace.</p>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form stack-form">
            <div className="input-group">
              <label>Email Address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary">Sign In</button>
          </form>
          <p className="auth-footer">Need an account? <span onClick={navigateToRegister}>Create a new account</span></p>
        </div>
      </div>
    </div>
  );
};