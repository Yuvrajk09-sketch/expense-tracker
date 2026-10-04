const apiUrl = 'http://localhost:3000/expense';

const loggedInUser = JSON.parse(localStorage.getItem('user'));
if (!loggedInUser) {
    window.location.href = 'login.html';
}
const config = { headers: { 'Authorization': loggedInUser.token } }; 
 
const form = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalExpenseDisplay = document.getElementById('total-expense');
const buyPremiumBtn = document.getElementById('buy-premium-btn');

if (loggedInUser.ispremiumuser) {
    buyPremiumBtn.textContent = "👑 Premium User";
    buyPremiumBtn.disabled = true;
}

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
        let errorMsg = "Please try again later.";
        if (error.response && error.response.data && error.response.data.message) {
            errorMsg = error.response.data.message;
        }
        aiResponseBox.innerHTML = `<span class="text-danger">Failed to get advice: ${errorMsg}</span>`;
    } finally {
        // Reset button
        aiBtn.textContent = "Ask Gemini";
        aiBtn.disabled = false;
        aiPromptInput.value = '';
    }
});
