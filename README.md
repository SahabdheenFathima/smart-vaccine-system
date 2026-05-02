# 🏥 Smart Pediatric Health System

A professional, full-stack medical analytics platform designed for pediatric health tracking, immunization management, and development analytics.

## 🚀 Project Overview

The Smart Pediatric Health System provides parents and healthcare providers with a high-fidelity interface to monitor a child's growth, manage vaccination schedules, and maintain a digital clinical history.

---

## 🏗️ Technical Architecture

### 💻 Frontend (React + Tailwind CSS)
Built using **Atomic Design Principles**, the frontend is organized into a modular, scalable structure:
- **Atoms**: Fundamental UI components (Buttons, Inputs, Badges).
- **Molecules**: Compound components (Form Groups, Card Headers).
- **Organisms**: Complex UI sections (Vaccine Tables, Growth Charts).
- **Templates**: Page-level layouts (MainLayout).
- **Pages**: Full application views (Dashboard, Analytics, History).

**Key Features:**
- **Dynamic Growth Analytics**: Interactive Line charts comparing baby growth against WHO standards.
- **Glassmorphism UI**: High-end design with backdrop blurs and premium gradients.
- **Multi-Baby Support**: Switch between multiple child profiles with isolated data tracking.
- **Responsive Design**: Fully optimized for Mobile, Tablet, and Desktop.

### ⚙️ Backend (Node.js + Express + MongoDB)
A robust RESTful API handling secure data persistence and automated health logic:
- **Authentication**: JWT-based secure session management.
- **Data Normalization**: Automatic email normalization (lowercase) to prevent data loss.
- **Automated Vaccine Generator**: Logic-driven vaccine schedule generation based on birth date.
- **Cascade Deletion**: Secure deletion of baby profiles along with all associated medical records.
- **Cron Jobs**: (Optional) Daily reminders for upcoming vaccinations.

---

## 📂 Project Structure

```text
SignupPart-main/
├── Back End/              # Node.js Server
│   ├── models/            # Mongoose Schemas (Vaccine, Growth)
│   ├── routes/            # API Route Handlers
│   ├── index.js           # Main Entry Point & Core Logic
│   └── babyDetails.js     # Primary Baby Schema
└── Front End/             # React Application
    ├── src/
    │   ├── components/    # Atomic Design Components
    │   ├── pages/         # Application Views
    │   ├── assets/        # Professional Images & Styles
    │   └── globals.css    # Central Design System
    └── tailwind.config.js # Premium Theme Configuration
```

---

## 🛠️ Setup & Installation

### 1. Backend Configuration
Navigate to the `Back End` directory and create a `.env` file:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/SmartSystem
JWT_SECRET=your_secure_random_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```
Install dependencies and start:
```bash
npm install
npm start
```

### 2. Frontend Configuration
Navigate to the `Front End` directory:
```bash
npm install
npm run dev
```

---

## 🔄 Core Workflows

### 🧬 Data Flow: New Registration
1. User submits the **New Registration** form.
2. Backend validates data and converts email to **lowercase**.
3. Record is saved to the `babies` collection in MongoDB.
4. **Vaccine Generator** automatically triggers, creating 15+ scheduled doses linked to the new `babyId`.

### 📊 Data Flow: Growth Analytics
1. User selects a baby from the **Analytics Dropdown**.
2. Frontend fetches growth records filtered by `babyId`.
3. Chart.js renders the **Actual Growth** vs. **WHO Standard** for that specific child.

### 🗑️ Data Flow: Profile Deletion
1. User clicks Delete on a profile card.
2. Custom **UI Modal** confirms the action.
3. Backend executes a **Cascade Delete**, removing the Baby, their Vaccines, and their Growth data simultaneously.

---

## 🎨 Design Tokens
- **Primary Color**: `#4F46E5` (Indigo Premium)
- **Background**: Dark Mode (`#0f172a`) / Light Mode Support
- **Typography**: Outfit / Inter
- **Shadows**: Custom Premium Glows

---
*Developed with a focus on medical data integrity and professional UX.*
