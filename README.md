# Expense Tracker Full Stack 💰

A full-stack Expense Tracker application built with Node.js, Express, MySQL (Sequelize), and plain HTML/CSS/JS. It features secure JWT authentication, complete CRUD functionality for expenses, and a fully integrated Cashfree Payment Gateway to allow users to upgrade to a "Premium" status.

## 🚀 Features

*   **User Authentication**: Secure Sign-up and Login using `bcrypt` for password hashing and `jsonwebtoken` for stateless session management.
*   **Expense Management**: Users can Add, Edit, Delete, and View their daily expenses.
*   **Data Isolation**: Every expense is tied strictly to the logged-in user via Foreign Keys. A user can only see and modify their own expenses.
*   **Premium Membership**: Users can purchase a Premium Membership via the **Cashfree Payment Gateway**.

---

## 🏗️ Architecture & Technologies Used

### Frontend (Client-Side)
*   **HTML/CSS/Bootstrap**: For a clean, responsive UI.
*   **Vanilla JavaScript**: Handles DOM manipulation and events.
*   **Axios**: For making asynchronous HTTP requests to the backend.
*   **Cashfree V3 JS SDK**: Renders the secure payment modal natively in the browser.

### Backend (Server-Side)
*   **Node.js & Express**: The core server handling all API routes.
*   **Sequelize ORM**: Manages database queries safely without writing raw SQL.
*   **jsonwebtoken (JWT)**: Generates 1-hour expiry tokens for authorization.
*   **bcrypt**: Hashes user passwords before storing them in the database.
*   **dotenv**: Keeps environment variables (like API keys and Secrets) hidden securely.

### Database
*   **MySQL**: Relational database storing all application data.

---

## 🗄️ Database Models & Relationships

1.  **User Model**: Stores `id`, `username`, `email`, `password` (hashed), and `ispremiumuser` (boolean).
2.  **Expense Model**: Stores `id`, `amount`, `description`, `category`. 
    *   *Relationship*: `Expense.belongsTo(User)` and `User.hasMany(Expense)`.
3.  **Order Model**: Stores `id`, `paymentid`, `orderid`, `status` (`PENDING`, `SUCCESSFUL`, `FAILED`).
    *   *Relationship*: `Order.belongsTo(User)` and `User.hasMany(Order)`.

---

## 💳 Cashfree Payment Integration (Logic Breakdown)

Integrating the payment gateway requires a careful "handshake" between the frontend, the backend, and the Cashfree servers. Here is the exact breakdown of how the premium purchase flow works:

### 1. Backend Order Creation (`purchaseController.js`)
When a user wants to buy premium, your backend must first register the "intent to pay" directly with Cashfree.
*   **The Route**: `GET /purchase/premiummembership`.
*   **Authentication**: It passes through the `auth.js` middleware, identifying the user via their JWT token.
*   **Calling Cashfree**: Your backend uses `axios` to send a secure, server-to-server request to `https://sandbox.cashfree.com/pg/orders` containing the amount (₹2500) and the user's details.
*   **Database Entry**: Before responding to the frontend, the backend inserts a `PENDING` row into the `orders` table to track this attempt.
*   **The Response**: Cashfree replies with a highly secure `payment_session_id`. Your backend forwards this ID to your frontend.

### 2. Frontend UI & SDK (`index.html` & `main.js`)
The frontend is responsible for rendering the payment pop-up to the user.
*   **The Button**: Clicking the "👑 Buy Premium" button triggers the API call above.
*   **The SDK**: Using the `<script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>`, the frontend passes the received `payment_session_id` into `cashfree.checkout({...})`. This tells the Cashfree SDK to open the secure payment overlay iframe on your screen.

### 3. Payment Verification & UI Update
Once the user enters their test card details and clicks "Pay", Cashfree processes the money. 
*   **The Callback**: The Cashfree pop-up triggers a `.then()` block in `main.js`. 
*   **Calling the Backend Again**: The frontend takes the receipt ID (`result.paymentDetails.paymentMessage`) and sends it to the final backend route: `POST /purchase/updatetransactionstatus`.
*   **The Final Update**: 
    1.  The backend looks up the `PENDING` order via the `order_id`.
    2.  If the payment was a success, it updates the order `status` to `SUCCESSFUL` and logs the `paymentid`.
    3.  It updates the user's row: `ispremiumuser = true`.
*   **Frontend Polish**: Finally, the frontend updates `localStorage` to remember the user is premium (`loggedInUser.ispremiumuser = true`) and instantly updates the button to a disabled "👑 Premium User" badge.

---

## 🛠️ Setup & Installation

1.  **Clone the Repository**.
2.  **Backend Setup**:
    *   Navigate to the `backend` folder.
    *   Run `npm install`.
    *   Create a `.env` file based on the environment variables required (JWT Secret, Cashfree keys).
    *   Start the server: `node server.js`.
3.  **Frontend Setup**:
    *   Navigate to the `frontend` folder.
    *   Serve the frontend using a local server (e.g., `npx serve` or VS Code Live Server) to prevent `file:///` CORS/security blocks with the payment gateway.
4.  **Database Sync**: Sequelize automatically syncs the tables on startup (`sequelize.sync({ alter: true })`).
