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
    <div className="card shadow p-4">
      <div className="d-flex justify-content-end align-items-center mb-3">
        <label className="form-label me-2 mb-0 text-nowrap">Rows per page:</label>
        <select 
          className="form-select form-select-sm w-auto" 
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

      <ul className="list-group">
        {expenses.map((item) => (
          <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <span className="fw-bold">{item.description}</span> - {item.category}
            </div>
            <div>
              <span className={`badge rounded-pill me-3 ${item.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                ${item.amount}
              </span>
              <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setEditingItem(item)}>Edit</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id, item.type)}>Delete</button>
            </div>
          </li>
        ))}
        {expenses.length === 0 && <li className="list-group-item text-muted text-center">No transactions found.</li>}
      </ul>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button 
          className="btn btn-outline-secondary btn-sm" 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Previous
        </button>
        <span className="text-muted small">Page {currentPage} of {totalPages || 1}</span>
        <button 
          className="btn btn-outline-secondary btn-sm" 
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
