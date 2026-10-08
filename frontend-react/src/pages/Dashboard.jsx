import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import PremiumSections from '../components/PremiumSections';

const BASE_URL = 'http://localhost:3000';

function Dashboard() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchExpenses();
    }
  }, [user, currentPage, limit]);

  const fetchExpenses = async () => {
    try {
      const config = { headers: { Authorization: user?.token } };
      const res = await axios.get(`${BASE_URL}/expense/get-expenses?page=${currentPage}&limit=${limit}`, config);
      setExpenses(res.data.allExpenses || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyPremium = async () => {
    try {
      const config = { headers: { Authorization: user?.token } };
      const response = await axios.get(`${BASE_URL}/purchase/premiummembership`, config);
      
      const cashfree = window.Cashfree({ mode: "sandbox" });
      
      let checkoutOptions = {
        paymentSessionId: response.data.payment_session_id,
        redirectTarget: "_modal"
      };

      cashfree.checkout(checkoutOptions).then((result) => {
        if (result.error) {
          alert("Payment failed or cancelled!");
          axios.post(`${BASE_URL}/purchase/updatetransactionstatus`, {
            order_id: response.data.order_id
          }, config);
        }
        if (result.paymentDetails) {
          axios.post(`${BASE_URL}/purchase/updatetransactionstatus`, {
            order_id: response.data.order_id
          }, config).then(() => {
            alert("Welcome to Premium! You are now a Premium User.");
            const updatedUser = { ...user, ispremiumuser: true };
            login(updatedUser);
          }).catch(err => alert("Error verifying payment"));
        }
      });
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  const handleDownload = async () => {
    if (!user.ispremiumuser) {
      alert("Buy premium to download your expenses!");
      return;
    }
    try {
      const config = { headers: { Authorization: user?.token } };
      const response = await axios.get(`${BASE_URL}/premium/download`, { ...config, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expenses.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Could not download expenses');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-center mb-0">Expense Tracker</h2>
        <div>
          <button onClick={handleDownload} className="btn btn-success fw-bold shadow-sm me-2">
            ⬇ Download Report {user.ispremiumuser ? '' : '🔒'}
          </button>
          {user.ispremiumuser ? (
            <button disabled className="btn btn-warning fw-bold shadow-sm">👑 Premium User</button>
          ) : (
            <button onClick={handleBuyPremium} className="btn btn-warning fw-bold shadow-sm">👑 Buy Premium</button>
          )}
          <button onClick={handleLogout} className="btn btn-outline-danger shadow-sm ms-2">Logout</button>
        </div>
      </div>

      <ExpenseForm 
        fetchExpenses={fetchExpenses} 
        editingItem={editingItem} 
        setEditingItem={setEditingItem} 
      />
      
      <ExpenseList 
        expenses={expenses} 
        limit={limit} 
        setLimit={setLimit}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        fetchExpenses={fetchExpenses}
        setEditingItem={setEditingItem}
      />

      <PremiumSections />
    </div>
  );
}

export default Dashboard;
