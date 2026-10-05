const apiUrl = 'http://localhost:3000/expense';

const loggedInUser = JSON.parse(localStorage.getItem('user'));
if (!loggedInUser) {
    window.location.href = 'login.html';
}
const config = { headers: { 'Authorization': loggedInUser.token } }; 
 
const form = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const buyPremiumBtn = document.getElementById('buy-premium-btn');
const downloadBtn = document.getElementById('download-expenses-btn');
const premiumDashboardSection = document.getElementById('premium-dashboard-section');

let currentEditId = null;
let currentIncomeEditId = null;
let currentPage = 1;
let currentLimit = localStorage.getItem('expensesLimit') || 5;

// Set initial value in dropdown
document.getElementById('limit-select').value = currentLimit;

document.getElementById('limit-select').addEventListener('change', (e) => {
    currentLimit = e.target.value;
    localStorage.setItem('expensesLimit', currentLimit);
    currentPage = 1; // Reset to page 1 on limit change
    fetchExpenses();
});

document.getElementById('prev-page-btn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchExpenses();
    }
});

document.getElementById('next-page-btn').addEventListener('click', () => {
    currentPage++;
    fetchExpenses();
});

if (loggedInUser.ispremiumuser) {
    buyPremiumBtn.textContent = "👑 Premium User";
    buyPremiumBtn.disabled = true;
    downloadBtn.classList.remove('d-none');
    premiumDashboardSection.classList.remove('d-none');
}

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

document.getElementById('income-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = document.getElementById('income-amount').value;
    const description = document.getElementById('income-description').value;
    const category = document.getElementById('income-category').value;

    const incomeData = { amount, description, category };

    try {
        if (currentIncomeEditId) {
            await axios.put(`http://localhost:3000/income/update-income/${currentIncomeEditId}`, incomeData, config);
            currentIncomeEditId = null;
            document.getElementById('income-submit-btn').textContent = 'Add Income';
        } else {
            await axios.post('http://localhost:3000/income/add-income', incomeData, config);
        }
        document.getElementById('income-form').reset();
        fetchExpenses();
    } catch (error) {
        console.error('Error saving income:', error);
    }
});

async function fetchExpenses() {
    try {
        const response = await axios.get(`${apiUrl}/get-expenses?page=${currentPage}&limit=${currentLimit}`, config);
        const expenses = response.data.allExpenses;
        const totalCount = response.data.totalCount;
        const totalPages = response.data.totalPages || 1;
        
        // Ensure currentPage reflects out-of-bound adjustments by backend
        if (response.data.currentPage) {
            currentPage = response.data.currentPage;
        }

        expenseList.innerHTML = '';

        expenses.forEach(expense => {
            showExpenseOnScreen(expense);
        });

        // Update Pagination UI
        document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('prev-page-btn').disabled = currentPage === 1;
        document.getElementById('next-page-btn').disabled = currentPage >= totalPages;

    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
}

function showExpenseOnScreen(expense) {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'expense-info';
    
    // Check if it's income or expense
    const isIncome = expense.type === 'income';
    const amountClass = isIncome ? 'text-success fw-bold' : 'text-danger fw-bold';
    const typeBadge = isIncome ? '<span class="badge bg-success ms-2">Income</span>' : '<span class="badge bg-danger ms-2">Expense</span>';
    
    infoDiv.innerHTML = `<span class="${amountClass}">$${expense.amount}</span> - ${expense.description} <span class="badge bg-secondary ms-2">${expense.category}</span> ${typeBadge}`;
    
    const actionsDiv = document.createElement('div');
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-outline-warning me-2';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => isIncome ? editIncome(expense) : editExpense(expense);
    actionsDiv.appendChild(editBtn);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteExpense(expense.id, expense.type || 'expense');
    
    actionsDiv.appendChild(deleteBtn);
    
    li.appendChild(infoDiv);
    li.appendChild(actionsDiv);
    
    expenseList.appendChild(li);
}

async function deleteExpense(id, type) {
    try {
        if (type === 'income') {
            await axios.delete(`http://localhost:3000/income/delete-income/${id}`, config);
        } else {
            await axios.delete(`${apiUrl}/delete-expense/${id}`, config);
        }
        fetchExpenses();
    } catch (error) {
        console.error('Error deleting transaction:', error);
    }
}

function editExpense(expense) {
    document.getElementById('amount').value = expense.amount;
    document.getElementById('description').value = expense.description;
    document.getElementById('category').value = expense.category;
    
    currentEditId = expense.id;
    document.getElementById('submit-btn').textContent = 'Update Expense';
}

function editIncome(income) {
    document.getElementById('income-amount').value = income.amount;
    document.getElementById('income-description').value = income.description;
    document.getElementById('income-category').value = income.category;
    
    currentIncomeEditId = income.id;
    document.getElementById('income-submit-btn').textContent = 'Update Income';
}

window.addEventListener('DOMContentLoaded', fetchExpenses);

document.getElementById('buy-premium-btn').addEventListener('click', async (e) => {
    try {
        const response = await axios.get('http://localhost:3000/purchase/premiummembership', config);
        
        const cashfree = Cashfree({
            mode: "sandbox" // Use sandbox for testing
        });
        
        let checkoutOptions = {
            paymentSessionId: response.data.payment_session_id,
            redirectTarget: "_modal",
        };
        
        cashfree.checkout(checkoutOptions).then((result) => {
            if(result.error){
                alert("Payment failed or cancelled!");
                axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
                    order_id: response.data.order_id
                }, config);
            } 
            if(result.paymentDetails){
                axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
                    order_id: response.data.order_id
                }, config).then(() => {
                    alert("Welcome to Premium! You are now a Premium User.");
                    document.getElementById('buy-premium-btn').textContent = "👑 Premium User";
                    document.getElementById('buy-premium-btn').disabled = true;
                    
                    // Update local storage so it persists across refreshes
                    loggedInUser.ispremiumuser = true;
                    localStorage.setItem('user', JSON.stringify(loggedInUser));
                    downloadBtn.classList.remove('d-none');
                    premiumDashboardSection.classList.remove('d-none');
                }).catch(err => alert("Error verifying payment"));
            }
        });
    } catch (error) {
        console.error(error);
        alert("Something went wrong with the payment gateway");
    }
});

document.getElementById('show-leaderboard-btn').addEventListener('click', async () => {
   
    if (!loggedInUser.ispremiumuser) {
        alert("Buy premium to access the leaderboard!");
        return; 
    }

    try {
        const response = await axios.get('http://localhost:3000/premium/leaderboard', config);
        const leaderboardData = response.data;
        
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = ''; 
        
        leaderboardData.forEach((user, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            
           
            const rank = index === 0 ? '🏆' : `#${index + 1}`;
            
            li.innerHTML = `
                <span><strong>${rank}</strong> ${user.username}</span>
                <span class="badge bg-primary rounded-pill">$${user.totalExpenses}</span>
            `;
            leaderboardList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        alert('Could not load leaderboard.');
    }
});

// AI Financial Advisor Logic
document.getElementById('ask-ai-btn').addEventListener('click', async () => {
    if (!loggedInUser.ispremiumuser) {
        alert("Buy premium to unlock the AI Financial Advisor!");
        return;
    }

    const aiPromptInput = document.getElementById('ai-prompt-input');
    const aiBtn = document.getElementById('ask-ai-btn');
    const aiResponseBox = document.getElementById('ai-response-box');
    
    const userPrompt = aiPromptInput.value.trim();
    if (!userPrompt) {
        alert("Please enter a question or prompt for the AI.");
        return;
    }

    // Show loading state
    aiBtn.textContent = "Analyzing...";
    aiBtn.disabled = true;
    aiResponseBox.classList.remove('d-none');
    aiResponseBox.innerHTML = '<span class="text-muted">Gemini is thinking...</span>';

    try {
        const response = await axios.post('http://localhost:3000/ai/advisor', { prompt: userPrompt }, config);
        
        // Display the response
        aiResponseBox.innerHTML = `<strong class="text-info">Advice:</strong> ${response.data.advice}`;
    } catch (error) {
        console.error('AI Error:', error);
        aiResponseBox.innerHTML = '<span class="text-danger">Failed to get advice. Please try again later.</span>';
    } finally {
        // Reset button
        aiBtn.textContent = "Ask Gemini";
        aiBtn.disabled = false;
        aiPromptInput.value = '';
    }
});

// Premium Dashboard Logic
document.getElementById('load-dashboard-btn').addEventListener('click', async () => {
    try {
        const response = await axios.get('http://localhost:3000/premium/dashboard', config);
        const { dailyBreakdown, monthlyBreakdown } = response.data;

        const dailyTableBody = document.querySelector('#daily-table tbody');
        dailyTableBody.innerHTML = '';
        dailyBreakdown.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.date}</td>
                <td>${item.description}</td>
                <td>${item.category}</td>
                <td>$${item.income.toFixed(2)}</td>
                <td>$${item.expense.toFixed(2)}</td>
            `;
            dailyTableBody.appendChild(tr);
        });

        const monthlyTableBody = document.querySelector('#monthly-table tbody');
        monthlyTableBody.innerHTML = '';
        monthlyBreakdown.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.month}</td>
                <td>$${item.income.toFixed(2)}</td>
                <td>$${item.expense.toFixed(2)}</td>
                <td>$${item.savings.toFixed(2)}</td>
            `;
            monthlyTableBody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Could not load dashboard.');
    }
});

// Download Expenses Feature
document.getElementById('download-expenses-btn').addEventListener('click', async () => {
    try {
        const response = await axios.get('http://localhost:3000/premium/download', {
            ...config,
            responseType: 'blob' 
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'expenses.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('Error downloading expenses:', error);
        alert('Could not download expenses. Please try again.');
    }
});
