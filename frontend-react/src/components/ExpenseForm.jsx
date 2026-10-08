import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://localhost:3000';

const ExpenseForm = ({ fetchExpenses, editingItem, setEditingItem }) => {
  const { user } = useAuth();
  const config = { headers: { Authorization: user?.token } };

  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseCat, setExpenseCat] = useState('Food');

  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDesc, setIncomeDesc] = useState('');
  const [incomeCat, setIncomeCat] = useState('Salary');

  useEffect(() => {
    if (editingItem) {
      if (editingItem.type === 'expense') {
        setExpenseAmount(editingItem.amount);
        setExpenseDesc(editingItem.description);
        setExpenseCat(editingItem.category);
      } else if (editingItem.type === 'income') {
        setIncomeAmount(editingItem.amount);
        setIncomeDesc(editingItem.description);
        setIncomeCat(editingItem.category);
      }
    }
  }, [editingItem]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      if (editingItem && editingItem.type === 'expense') {
        await axios.put(`${BASE_URL}/expense/update-expense/${editingItem.id}`, {
          amount: expenseAmount, description: expenseDesc, category: expenseCat
        }, config);
        setEditingItem(null);
      } else {
        await axios.post(`${BASE_URL}/expense/add-expense`, {
          amount: expenseAmount, description: expenseDesc, category: expenseCat
        }, config);
      }
      setExpenseAmount(''); setExpenseDesc(''); setExpenseCat('Food');
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert('Failed to save expense');
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      if (editingItem && editingItem.type === 'income') {
        await axios.put(`${BASE_URL}/income/update-income/${editingItem.id}`, {
          amount: incomeAmount, description: incomeDesc, category: incomeCat
        }, config);
        setEditingItem(null);
      } else {
        await axios.post(`${BASE_URL}/income/add-income`, {
          amount: incomeAmount, description: incomeDesc, category: incomeCat
        }, config);
      }
      setIncomeAmount(''); setIncomeDesc(''); setIncomeCat('Salary');
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert('Failed to save income');
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setExpenseAmount(''); setExpenseDesc(''); setExpenseCat('Food');
    setIncomeAmount(''); setIncomeDesc(''); setIncomeCat('Salary');
  };

  return (
    <div className="row mb-4">
      {editingItem && (
        <div className="col-12 mb-3 text-end">
          <span className="me-3 fw-bold text-primary">Editing: {editingItem.description}</span>
          <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel Edit</button>
        </div>
      )}
      
      <div className="col-md-6">
        <div className="card shadow p-4 h-100">
          <h5 className="mb-3 text-danger">{editingItem?.type === 'expense' ? 'Update Expense' : 'Add Expense'}</h5>
          <form onSubmit={handleAddExpense}>
            <div className="mb-2">
              <label className="form-label">Amount</label>
              <input type="number" className="form-control" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Description</label>
              <input type="text" className="form-control" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <select className="form-select" value={expenseCat} onChange={e => setExpenseCat(e.target.value)}>
                <option>Food</option>
                <option>Petrol</option>
                <option>Electricity</option>
                <option>Movie</option>
                <option>Other</option>
              </select>
            </div>
            <button type="submit" className="btn btn-danger w-100">
              {editingItem?.type === 'expense' ? 'Update Expense' : 'Add Expense'}
            </button>
          </form>
        </div>
      </div>

      <div className="col-md-6 mt-4 mt-md-0">
        <div className="card shadow p-4 h-100 border-success">
          <h5 className="mb-3 text-success">{editingItem?.type === 'income' ? 'Update Income' : 'Add Income'}</h5>
          <form onSubmit={handleAddIncome}>
            <div className="mb-2">
              <label className="form-label">Amount</label>
              <input type="number" className="form-control" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Description</label>
              <input type="text" className="form-control" value={incomeDesc} onChange={e => setIncomeDesc(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <select className="form-select" value={incomeCat} onChange={e => setIncomeCat(e.target.value)}>
                <option>Salary</option>
                <option>Bonus</option>
                <option>Gift</option>
                <option>Other</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success w-100">
              {editingItem?.type === 'income' ? 'Update Income' : 'Add Income'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
