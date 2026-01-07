# 🌾 AgriShield - Intelligent Agriculture Platform

AI-powered platform for crop failure prediction, disease detection, and farming advisories.

## 📁 Project Structure
```
AgriShield/
│
├── data/
│   ├── raw/                              # Raw datasets from Kaggle
│   │   ├── crop_production.csv                 
│   │   ├── weather_data.csv                    
│   │   ├── disaster_data.csv                   
│   │   └── soil_data.csv                      
│   │
│   └── processed/                        # Processed/merged datasets
│       └── merged_dataset.csv                   
│
├── models/                               # Trained ML models & encoders
│   ├── crop_failure_model.pkl                 
│   ├── scaler.pkl                             
│   ├── crop_encoder.pkl                       
│   ├── state_encoder.pkl                      
│   ├── crop_list.pkl                          
│   ├── state_list.pkl                         
│   ├── district_list.pkl                      
│   └── district_info.pkl                      
│
├── backend/                              # FastAPI Backend
│   ├── data_preprocessing.ipynb                
│   ├── train_model.ipynb                      
│   ├── test_predictions.ipynb                 
│   ├── predict.py                             
│   ├── main.py                                
│   └── requirements.txt                        
│
└── frontend/                             # React Frontend
    ├── node_modules/                          
    ├── index.html                             
    ├── main.jsx                               
    ├── index.css                              
    ├── App.jsx                          
    ├── RiskPrediction.jsx                     
    ├── vite.config.js                         
    ├── tailwind.config.js                      
    ├── postcss.config.js                      
    ├── package.json                           
    └── .gitignore                             
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