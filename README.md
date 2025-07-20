# 🛍️ E-Commerce-Colman

A full-stack e-commerce web application enabling users to browse, search, and purchase products, powered by a secure backend and intuitive UI.

---

## 🚀 Features

- **Product Catalogue**: Search, filter, and view product details.
- **Shopping Cart**: Add, remove, and update quantities in cart.
- **User Authentication**: Secure sign-up, login, and user sessions.
- **Checkout & Payments**: Integration with a payment gateway for seamless checkout.
- **Order Management**: Users can view past orders; admins can manage inventory and orders.
- **Responsive UI**: Mobile-first design with a clean layout and accessibility focus.

---

## 🛠️ Tech Stack

| Layer             | Technologies |
|------------------|--------------|
| **Frontend**      | HTML5, CSS3, JavaScript |
| **Backend**       | Node.js, Express.js |
| **Database**      | MongoDB |
| **Authentication**| JWT (JSON Web Tokens) |
| **Hosting**       | (e.g., Render, Heroku, Vercel — update as needed) |

---

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tamir26/E-Commerce-Colman.git
   cd E-Commerce-Colman
   ```
2. **Backend Setup**
   ```bash
   cd backend
    npm install
    cp .env.example .env
   ```
  # Fill in the .env with DB connection string, JWT secret, etc.
   ```bash
    npm run dev
  ```
4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```
5. Access the App
  - Frontend: http://localhost:3000
  - Backend API: http://localhost:5000 (or as configured)
