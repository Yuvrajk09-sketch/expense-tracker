# React Migration: Interview Prep Guide

Welcome! As a Senior Software Developer, I've outlined exactly how and why we migrated this Expense Tracker from **Vanilla JavaScript** to **React**. 

If you're heading into a React interview, the interviewer will likely ask you *why* you chose React and *how* it differs from Vanilla JS. This guide maps your old code to your new React code so you can answer those questions confidently. 

---

## 1. Imperative vs. Declarative Programming
**The biggest shift when moving to React is changing how you think about updating the screen.**

### How we did it in Vanilla JS (Imperative):
In your old `main.js`, you gave the browser step-by-step instructions on *how* to build the UI:
```javascript
// Vanilla JS: Micro-managing the DOM
const li = document.createElement('li');
li.className = 'list-group-item';
li.textContent = `${expense.amount} - ${expense.category}`;
document.getElementById('expense-list').appendChild(li);
```
**Why this is bad at scale:** As the app grows, manually tracking which elements to create, update, or destroy becomes a nightmare. It leads to "spaghetti code."

### How we do it in React (Declarative):
In React, you don't touch the DOM directly. Instead, you declare *what* the UI should look like based on the current **State**. React figures out how to update the DOM efficiently using the **Virtual DOM**.
```jsx
// React: State-driven UI
const [expenses, setExpenses] = useState([]);

return (
  <ul className="list-group">
    {expenses.map(expense => (
      <li key={expense.id} className="list-group-item">
        {expense.amount} - {expense.category}
      </li>
    ))}
  </ul>
);
```
**Interview Talking Point:** *"I migrated to React to utilize a declarative approach. Instead of manually querying and mutating DOM nodes, I simply update the component's state, and React handles the DOM reconcilation efficiently via the Virtual DOM."*

---

## 2. Component-Based Architecture
In your old project, you had massive files like `main.js` (nearly 400 lines!) handling everything: forms, tables, premium features, and pagination.

### How we do it in React:
We break the UI down into isolated, reusable pieces called **Components**.
- `<ExpenseForm />` (handles adding/updating)
- `<ExpenseList />` (renders the table)
- `<PremiumDashboard />` (handles charts and leaderboards)

**Interview Talking Point:** *"React's component architecture allowed me to separate concerns. Each component manages its own state and logic, making the codebase highly modular, easier to test, and much easier for a team of developers to collaborate on without merge conflicts."*

---

## 3. Routing (Single Page Application)
### How we did it in Vanilla JS:
When a user logged in, you used:
```javascript
window.location.href = 'index.html';
```
This forces the browser to completely reload the page, re-download the HTML, CSS, and JS, resulting in a slow, clunky user experience.

### How we do it in React:
We use `react-router-dom`. The browser only loads a single HTML file (`index.html`) once. When the user navigates, React instantly swaps out the components on the screen without a full page reload.
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</BrowserRouter>
```
**Interview Talking Point:** *"By implementing React Router, I converted the application into a Single Page Application (SPA). This drastically improved performance and perceived load times since we no longer perform full page refreshes when navigating between views."*

---

## 4. Managing Side Effects (Data Fetching)
### How we did it in Vanilla JS:
You called `fetchExpenses()` globally when the script loaded.

### How we do it in React:
We use the `useEffect` hook. This hook tells React to execute side-effects (like API calls) after the component renders.
```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // This runs once when the component mounts
    axios.get('http://localhost:3000/expense/get-expenses')
      .then(res => setExpenses(res.data.allExpenses));
  }, []); // The empty array ensures it only runs once
}
```
**Interview Talking Point:** *"I used the `useEffect` hook to manage side effects, specifically integrating our Axios API calls. By managing dependency arrays properly, I ensured data fetching only occurs when necessary, preventing infinite render loops."*

---

## 5. Global State (Authentication)
### How we did it in Vanilla JS:
You checked `localStorage` at the top of every single JS file to see if the user was logged in.
```javascript
const loggedInUser = JSON.parse(localStorage.getItem('user'));
if (!loggedInUser) window.location.href = 'login.html';
```

### How we do it in React:
We use the **Context API** (`AuthContext`). We wrap our entire application in a Context Provider. Any component can instantly ask "Is the user logged in?" without repeatedly parsing `localStorage`. If the user logs out, the Context updates, and React instantly kicks them out of protected routes.

**Interview Talking Point:** *"To avoid prop-drilling and redundant localStorage parsing, I implemented React's Context API for global authentication state. This provided a secure and centralized way to manage user sessions and protect private routes."*
