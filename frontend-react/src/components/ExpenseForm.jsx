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
    <div className="w-full">
      {editingItem && (
        <div className="flex justify-between items-center mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
          <span className="font-semibold text-blue-700 text-lg">
            Currently Editing {editingItem.type === 'expense' ? 'Expense' : 'Income'}: <span className="font-bold">{editingItem.description}</span>
          </span>
          <button className="px-4 py-2 bg-slate-500 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors shadow-sm" onClick={cancelEdit}>
            Cancel Edit
          </button>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6 mb-4">
        <div className="w-full">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
          <h5 className="text-lg font-semibold text-rose-600 mb-4">{editingItem?.type === 'expense' ? 'Update Expense' : 'Add Expense'}</h5>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input type="number" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} required min="0" step="any" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500" value={expenseCat} onChange={e => setExpenseCat(e.target.value)}>
                <option>Food</option>
                <option>Petrol</option>
                <option>Electricity</option>
                <option>Movie</option>
                <option>Other</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm mt-2">
              {editingItem?.type === 'expense' ? 'Update Expense' : 'Add Expense'}
            </button>
          </form>
        </div>
      </div>

      <div className="w-full">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
          <h5 className="text-lg font-semibold text-emerald-600 mb-4">{editingItem?.type === 'income' ? 'Update Income' : 'Add Income'}</h5>
          <form onSubmit={handleAddIncome} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input type="number" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} required min="0" step="any" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" value={incomeDesc} onChange={e => setIncomeDesc(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" value={incomeCat} onChange={e => setIncomeCat(e.target.value)}>
                <option>Salary</option>
                <option>Bonus</option>
                <option>Gift</option>
                <option>Other</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm mt-2">
              {editingItem?.type === 'income' ? 'Update Income' : 'Add Income'}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ExpenseForm;
