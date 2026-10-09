import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetId = searchParams.get('id');
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [message, setMessage] = useState('Verifying link...');

  useEffect(() => {
    if (!resetId) {
      setIsValid(false);
      setMessage('Invalid or missing reset token.');
      return;
    }
    axios.get(`${BASE_URL}/password/resetpassword/${resetId}`)
      .then(res => {
        if (res.data.success) {
          setIsValid(true);
          setMessage('');
        }
      })
      .catch(err => {
        setIsValid(false);
        setMessage(err.response?.data?.message || 'The reset link is invalid or has expired.');
      });
  }, [resetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/password/updatepassword/${resetId}`, { newpassword: newPassword });
      setIsValid(false); // Hide form
      setMessage(res.data.message || 'Successfully updated password. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong updating your password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Password</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          
          {message && (
            <div className={`mb-4 px-4 py-3 rounded relative border ${isValid === false ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 border-blue-200 text-blue-700'}`} role="alert">
              <span className="block sm:inline">{message}</span>
            </div>
          )}
          
          {isValid && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1">
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
              </div>

              <div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
