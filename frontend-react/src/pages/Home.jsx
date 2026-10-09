import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import { Download, Crown } from 'lucide-react';

const BASE_URL = 'http://localhost:3000';

export const Home = () => {
  const { user, login } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (user) {
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

  // Calculate totals for stats
  const totalExpensesAmount = expenses.reduce((acc, curr) => acc + (Number(curr.expenseAmount) || 0), 0);

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownload} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
          >
            <Download size={18} />
            Download Report {!user.ispremiumuser && '🔒'}
          </button>
          
          {user.ispremiumuser ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300 rounded-lg shadow-sm font-medium">
              <Crown size={18} className="text-amber-600" />
              Premium Member
            </div>
          ) : (
            <button 
              onClick={handleBuyPremium}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-sm font-medium"
            >
              <Crown size={18} />
              Buy Premium
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col max-w-5xl mx-auto gap-8 w-full">
        {/* Forms Section (Top) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-semibold text-center text-black mb-6">
             {editingItem ? 'Edit Transaction' : 'Record New Transaction'}
          </h2>
          <div className="expense-form-wrapper">
            <ExpenseForm 
              fetchExpenses={fetchExpenses} 
              editingItem={editingItem} 
              setEditingItem={setEditingItem} 
            />
          </div>
        </div>

        {/* Transactions List Section (Bottom) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
          <h2 className="text-xl font-semibold text-center text-black mb-6">Your Transactions</h2>
          <div className="expense-list-wrapper">
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
          </div>
        </div>
      </div>
    </div>
  );
};
