import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://localhost:3000';

const ExpenseList = ({ expenses, limit, setLimit, currentPage, totalPages, setCurrentPage, fetchExpenses, setEditingItem }) => {
  const { user } = useAuth();
  const config = { headers: { Authorization: user?.token } };

  const handleDelete = async (id, type) => {
    try {
      if (type === 'income') {
        await axios.delete(`${BASE_URL}/income/delete-income/${id}`, config);
      } else {
        await axios.delete(`${BASE_URL}/expense/delete-expense/${id}`, config);
      }
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-end items-center mb-4">
        <label className="text-sm font-medium text-slate-700 mr-2 whitespace-nowrap">Rows per page:</label>
        <select 
          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
          value={limit} 
          onChange={(e) => {
            setLimit(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="5">5</option>
          <option value="8">8</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="40">40</option>
        </select>
      </div>

      <div className="space-y-3">
        {expenses.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors gap-4">
            <div>
              <span className="font-semibold text-slate-800">{item.description}</span> <span className="text-slate-500 text-sm ml-1">- {item.category}</span>
            </div>
            <div className="flex items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium mr-4 ${item.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                ${item.amount}
              </span>
              <button className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors mr-2" onClick={() => setEditingItem(item)}>Edit</button>
              <button className="px-3 py-1.5 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors" onClick={() => handleDelete(item.id, item.type)}>Delete</button>
            </div>
          </div>
        ))}
        {expenses.length === 0 && <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">No transactions found.</div>}
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
        <button 
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm" 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Previous
        </button>
        <span className="text-slate-500 text-sm font-medium">Page {currentPage} of {totalPages || 1}</span>
        <button 
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm" 
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ExpenseList;
