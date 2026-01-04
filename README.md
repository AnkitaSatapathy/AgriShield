# 🌾 AgriShield - Intelligent Agriculture Platform

AI-powered platform for crop failure prediction, disease detection, and farming advisories.

## 📁 Project Structure
```
AgriShield/
├── frontend/              # React application (all files in one folder)
│   ├── node_modules/
│   ├── index.html
│   ├── App.jsx           # Main homepage component
│   ├── index.css
│   ├── main.jsx
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── backend/               # FastAPI backend (all files in one folder)
    ├── main.py           # API routes
    ├── requirements.txt
    └── .env
```

## 🚀 Running the Project

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at: `http://localhost:5173`

### Backend 
```bash
cd backend
python -m venv venv
venv\Scripts\activate     # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```
Runs at: `http://localhost:8000`

## 🛠️ Tech Stack

- **Frontend:** React.js + Vite
- **Backend:** FastAPI
- **ML:** Scikit-learn, TensorFlow
- **Database:** MongoDB

## 📧 Contact

Email: support@agrishield.com  
Phone: +91 724-123-4569

---
© 2026 AgriShield. All rights reserved.