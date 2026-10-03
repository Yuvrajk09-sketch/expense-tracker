const apiUrl = 'http://localhost:3000/expense';

const loggedInUser = JSON.parse(localStorage.getItem('user'));
if (!loggedInUser) {
    window.location.href = 'login.html';
}
const config = { headers: { 'Authorization': loggedInUser.token } }; 
 
const form = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalExpenseDisplay = document.getElementById('total-expense');

let currentEditId = null;

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    const expenseData = { amount, description, category };

    try {
        if (currentEditId) {
            await axios.put(`${apiUrl}/update-expense/${currentEditId}`, expenseData, config);
            currentEditId = null;
            document.getElementById('submit-btn').textContent = 'Add Expense';
        } else {
            await axios.post(`${apiUrl}/add-expense`, expenseData, config);
        }
        
        form.reset();
        fetchExpenses();
    } catch (error) {
        console.error('Error saving expense:', error);
    }
});

async function fetchExpenses() {
    try {
        const response = await axios.get(`${apiUrl}/get-expenses`, config);
        const expenses = response.data.allExpenses;
        
        expenseList.innerHTML = '';
        let total = 0;

        expenses.forEach(expense => {
            total += parseFloat(expense.amount);
            showExpenseOnScreen(expense);
        });

        totalExpenseDisplay.textContent = total.toFixed(2);
    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
}

function showExpenseOnScreen(expense) {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'expense-info';
    infoDiv.innerHTML = `<span class="expense-amount">$${expense.amount}</span> - ${expense.description} <span class="badge bg-secondary ms-2">${expense.category}</span>`;
    
    const actionsDiv = document.createElement('div');
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-outline-warning me-2';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editExpense(expense);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteExpense(expense.id);
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    
    li.appendChild(infoDiv);
    li.appendChild(actionsDiv);
    
    expenseList.appendChild(li);
}

async function deleteExpense(id) {
    try {
        await axios.delete(`${apiUrl}/delete-expense/${id}`, config);
        fetchExpenses();
    } catch (error) {
        console.error('Error deleting expense:', error);
    }
}

function editExpense(expense) {
    document.getElementById('amount').value = expense.amount;
    document.getElementById('description').value = expense.description;
    document.getElementById('category').value = expense.category;
    
    currentEditId = expense.id;
    document.getElementById('submit-btn').textContent = 'Update Expense';
}

window.addEventListener('DOMContentLoaded', fetchExpenses);
