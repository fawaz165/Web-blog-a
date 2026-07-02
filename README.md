# Blog Web Application

A dynamic, secure, and responsive blog platform that allows users to register, log in, create, read, update, and delete blog posts. It features a clean interface, MongoDB database integration, and a premium dark theme toggle with local state persistence.

---

## About The Project

This blog web application has been enhanced to support persistent database storage and secure user authentication. It enables users to interact with blog content through intuitive UI elements and performs all essential CRUD operations (Create, Read, Update, Delete) while ensuring data security and user-specific ownership.

### Features

- **User Authentication**: Secure user registration and login/logout using hashed passwords.
- **Post Ownership & Authorization**: Users can only edit, update, or delete blog posts they created.
- **Database Persistence**: Fully integrated with MongoDB using Mongoose schemas.
- **Dark Theme Toggle**: Switch smoothly between light and dark themes (persists across page reloads via `localStorage`).
- **Responsive Design**: Mobile-friendly layout designed using Bootstrap 5 and modern CSS custom animations.

---

## Built With

- **Node.js** – JavaScript runtime environment
- **Express.js** – Backend web application framework
- **MongoDB** – NoSQL document database for persistence
- **Mongoose** – Elegant MongoDB object modeling for Node.js
- **express-session** – Session middleware for authentication state
- **bcryptjs** – Secure password hashing
- **EJS** – Embedded JavaScript templating engine
- **Bootstrap 5** – Frontend framework for grid layout and components
- **dotenv** – Environment variable management

---

## Getting Started

Follow these steps to run the application locally:

### Prerequisites
1. **Node.js** (v16+ recommended)
2. **MongoDB** (running locally or a connection URI for MongoDB Atlas)

### Setup Instructions
1. Clone the repository and navigate to the project directory:
   ```bash
   cd Web-blog-a-main
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and specify the database connection URI and server port:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/blogDB
   PORT=3000
   SESSION_SECRET=your_super_secret_session_key
   ```

4. Start the application:
   ```bash
   node index.js
   ```

5. Open your browser and navigate to `http://localhost:3000`.
