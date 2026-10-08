import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://localhost:3000';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${BASE_URL}/user/login`, { email, password });
      if (response.status === 200) {
        login(response.data.user);
        navigate('/dashboard'); 
      }
    } catch (err) {
      if (err.response && (err.response.status === 404 || err.response.status === 401)) {
        setError('Credentials are incorrect');
      } else {
        setError(err.response?.data?.message || 'Error logging in');
      }
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    setForgotError('');
    try {
      const res = await axios.post(`${BASE_URL}/password/forgotpassword`, { email: forgotEmail });
      setForgotMessage(res.data.message);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        <div className="text-center mt-2">
          <button onClick={() => setShowForgot(!showForgot)} className="btn btn-link text-decoration-none shadow-none">Forgot Password?</button>
        </div>

        {showForgot && (
          <form onSubmit={handleForgot} className="mt-3">
            <div className="mb-3">
              <label className="form-label">Enter your email to reset password</label>
              <input type="email" className="form-control" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-warning w-100">Send Reset Link</button>
            {forgotMessage && <div className="text-success text-center mt-2">{forgotMessage}</div>}
            {forgotError && <div className="text-danger text-center mt-2">{forgotError}</div>}
          </form>
        )}
        
        <p className="text-center mt-3 mb-0">Don't have an account? <Link to="/signup" className="text-decoration-none">Sign Up</Link></p>
      </div>
    </div>
  );
}

export default Login;
