# WorkPulse — Multi-Tenant Workforce Performance Ecosystem

WorkPulse is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed for organizations to manage employees, track live shift attendance, allocate tasks with interactive progress tracking, resolve company helpdesk queries, and evaluate employee KPI performance scores.

---

## 🚀 Key Highlights & Capabilities

- **Multi-Tenant Company Isolation by Email Domain (`@company.com`)**:
  - When users register with `user@company.com`, the system automatically provisions their isolated tenant workspace.
  - Queries, tickets, resolution chat threads, tasks, live attendance rosters, and team analytics are strictly restricted to members of the same company domain.
- **User Profile & Avatar (DP) Management**:
  - Users can update their profile picture (DP) using a gallery of curated avatars or any custom image URL.
  - Edit full name, username, title/designation, department, phone number, and bio.
- **Real-Time Attendance & Shift Clocking**:
  - Global one-click punch in/out timer in the top header navigation.
  - Detailed timesheets, weekly work hour compliance visualizer, and shift duration history logs.
  - Live clocked-in roster showing colleagues currently working on shift.
- **Task Allocation & Progress Tracking**:
  - Allocate tasks with priority levels (Urgent, High, Medium, Low), deadlines, and descriptions.
  - Interactive progress percentage sliders and milestone progress updates.
- **Transparent 0–100 KPI Evaluation**:
  - Weighted composite scorecard based on **Task Velocity (45%)**, **Weekly Hours Compliance (35%)**, and **Query Resolution (20%)**.
  - Dynamic performance tiers (Top Performer, Strong Contributor, Developing).
- **Company Helpdesk & Discussion Threads**:
  - Raise technical blockers, HR inquiries, or task issues with priority badges.
  - Interactive chat discussion threads between employees and managers.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Lucide Icons, Pure CSS (custom responsive design tokens & glassmorphism)
- **Backend**: Node.js, Express.js, JWT (JSON Web Tokens), bcryptjs
- **Database**: MongoDB with Mongoose ODM

---

## 📦 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── controllers/      # Auth, Tasks, Attendance, Queries, Analytics
│   │   ├── middleware/       # JWT Auth verification
│   │   ├── models/           # User, Task, Attendance, Query (all tenant-scoped)
│   │   ├── routes/           # REST API Route definitions
│   │   ├── utils/            # Performance scoring engine & date utilities
│   │   ├── seed.js           # Database seeder with realistic workforce data
│   │   └── server.js         # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/              # Centralized fetch API client
│   │   ├── components/       # Common, Analytics, Attendance, Queries, Tasks
│   │   ├── context/          # AuthContext (user state, profile updates, punch timer)
│   │   ├── pages/            # Login, Dashboard, Tasks, Attendance, Queries, Performance
│   │   ├── App.jsx
│   │   ├── index.css         # Complete UI design system
│   │   └── main.jsx
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017` (or MongoDB Atlas connection URI)

---

### 1. Backend Setup

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file from `.env.example`:
     ```bash
     cp .env.example .env
     ```
   - Make sure your MongoDB URI and port are set:
     ```env
     PORT=5000
     MONGO_URI=mongodb://127.0.0.1:27017/employee_ecosystem
     JWT_SECRET=your_jwt_secret_key_here
     CLIENT_URL=http://localhost:5173
     ```
4. Seed demo accounts and sample data:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open another terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend runs on `http://localhost:5173`.*

---

## 🔐 Default Demo Credentials

You can use the seeded credentials below or create a new account with your own company email:

| Role | Email / Username | Password | Company Domain |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@workpulse.com` (or `admin`) | `admin123` | `workpulse.com` |
| **Manager** | `manager@workpulse.com` (or `manager`) | `manager123` | `workpulse.com` |
| **Employee** | `alex@workpulse.com` (or `alex`) | `alex123` | `workpulse.com` |
| **Employee** | `priya@workpulse.com` (or `priya`) | `priya123` | `workpulse.com` |

---

## 📜 License
This project is open source and available under the [MIT License](LICENSE).
