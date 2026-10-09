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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => setShowForgot(!showForgot)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none">Forgot your password?</button>
          </div>

          {showForgot && (
            <form onSubmit={handleForgot} className="mt-6 space-y-4 pt-6 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700">Enter your email to reset password</label>
                <div className="mt-1">
                  <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                Send Reset Link
              </button>
              {forgotMessage && <div className="text-sm text-green-600 text-center mt-2">{forgotMessage}</div>}
              {forgotError && <div className="text-sm text-red-600 text-center mt-2">{forgotError}</div>}
            </form>
          )}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Create a new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
