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
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Reset Password</h2>
        
        {message && <div className={`alert ${isValid === false ? 'alert-danger' : 'alert-info'}`}>{message}</div>}
        
        {isValid && (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100">Update Password</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
