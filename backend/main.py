"""
AgriShield FastAPI Backend
Crop Failure Risk Prediction + Weather Advisory API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional
import pickle
import os
import pandas as pd
from fastapi import Request
from dotenv import load_dotenv

# Import existing routers and functions
try:
    from disease import router as disease_router
    disease_service_available = True
except Exception as e:
    disease_service_available = False
    print(f"⚠️ Disease service unavailable: {e}")
from chatbot_router import chatbot_router
from crop_recommendation_api import router as crop_recommendation_router    
from predict import predict_crop_failure, crop_list, state_list, district_list
from schemes_data import SchemeManager
from schemes_api import router as schemes_router

# Import NEW weather services
from weather_service import WeatherService
from advisory_service import AdvisoryService

# Import SEASONAL ANALYSIS services
try:
    from seasonal_analysis_service import SeasonalAnalysisService
    seasonal_service_available = True
    print("✅ Seasonal Analysis Service imported")
except Exception as _se:
    seasonal_service_available = False
    print(f"⚠️ Seasonal Analysis Service unavailable: {_se}")

# Load environment variables
load_dotenv()

# Initialize Scheme Manager
try:
    scheme_manager = SchemeManager()
    print("✅ Scheme Manager initialized successfully")
except Exception as e:
    print(f"⚠️ Scheme Manager initialization failed: {e}")
    scheme_manager = None


# ============================================================================
# FASTAPI APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="AgriShield API",
    description="Crop Failure Risk Prediction + Weather Advisory System using Machine Learning",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============================================================================
# CORS MIDDLEWARE - MUST BE BEFORE ROUTES
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*", # Allow all origins for development to fix CORS issues with dynamic ports
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    max_age=600,
)

# Include existing routers
if disease_service_available:
    app.include_router(disease_router)
app.include_router(crop_recommendation_router)
app.include_router(schemes_router)
app.include_router(chatbot_router)

try:
    from user_api import router as user_router
    app.include_router(user_router)
    print("✅ User API router included successfully")
except Exception as e:
    print(f"⚠️ User API router inclusion failed: {e}")

try:
    from auth_api import router as auth_router
    app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
    print("✅ Auth API router included successfully")
except Exception as e:
    print(f"⚠️ Auth API router inclusion failed: {e}")

# ============================================================================
# INITIALIZE WEATHER SERVICES
# ============================================================================

try:
    weather_service = WeatherService()
    advisory_service = AdvisoryService(csv_path=os.path.join(os.path.dirname(__file__), "..", "data", "processed", "advisory.csv"))
    weather_services_available = True
    print("✅ Weather services initialized successfully")
except Exception as e:
    weather_services_available = False
    print(f"⚠️ Weather services initialization failed: {str(e)}")

# Initialize seasonal analysis service
seasonal_analysis_svc = None
if seasonal_service_available:
    try:
        seasonal_analysis_svc = SeasonalAnalysisService()
        print("✅ Seasonal Analysis Service initialized successfully")
    except Exception as e:
        print(f"⚠️ Seasonal Analysis Service initialization failed: {str(e)}")

# ============================================================================
# PYDANTIC MODELS - EXISTING
# ============================================================================

class RiskPredictionRequest(BaseModel):
    """Request model for crop failure risk prediction"""
    crop: str = Field(..., description="Crop name (e.g., Rice, Wheat, Cotton)")
    state: str = Field(..., description="State name")
    district: str = Field(..., description="District name")
    season: str = Field(..., description="Season (Kharif, Rabi, Summer, Whole Year)")
    temperature: float = Field(..., description="Average temperature in Celsius", ge=-10, le=50)
    rainfall: float = Field(..., description="Total expected rainfall in mm", ge=0, le=5000)
    humidity: float = Field(..., description="Average humidity percentage", ge=0, le=100)
    disaster_occurred: int = Field(0, description="Disaster occurrence (0=No, 1=Yes)", ge=0, le=1)
    
    class Config:
        schema_extra = {
            "example": {
                "crop": "Rice",
                "state": "Punjab",
                "district": "Punjab",
                "season": "Kharif",
                "temperature": 28.0,
                "rainfall": 1200.0,
                "humidity": 75.0,
                "disaster_occurred": 0
            }
        }


class DistrictInfo(BaseModel):
    """District information model"""
    soil_type: str
    soil_quality: float
    state: str
    district: str


class RiskPredictionResponse(BaseModel):
    """Response model for crop failure risk prediction"""
    risk_score: float = Field(..., description="Risk score percentage (0-100)")
    risk_level: str = Field(..., description="Risk level (Low, Medium, High)")
    color: str = Field(..., description="Color code (green, orange, red)")
    explanation: str = Field(..., description="Detailed explanation of risk factors")
    recommendations: list = Field(..., description="List of actionable recommendations")
    district_info: DistrictInfo = Field(..., description="District soil information")


# ============================================================================
# PYDANTIC MODELS - NEW WEATHER ENDPOINTS
# ============================================================================

class WeatherRequest(BaseModel):
    """Request model for weather data"""
    state: str = Field(..., description="State name")
    district: str = Field(..., description="District name")
    crop: Optional[str] = Field(None, description="Crop name (optional)")
    
    class Config:
        schema_extra = {
            "example": {
                "state": "Punjab",
                "district": "Ludhiana",
                "crop": "Rice"
            }
        }


class AdvisoryRequest(BaseModel):
    """Request model for crop advisory"""
    crop: str = Field(..., description="Crop name")
    weather_conditions: dict = Field(..., description="Current weather conditions")
    
    class Config:
        schema_extra = {
            "example": {
                "crop": "Rice",
                "weather_conditions": {
                    "temperature": 32.0,
                    "humidity": 78.0,
                    "rainfall": 45.0,
                    "wind_speed": 12.0,
                    "soil_moisture": 70.0
                }
            }
        }


class SeasonalAnalysisRequest(BaseModel):
    """Request model for seasonal crop suitability analysis"""
    state: str = Field(..., description="State name (e.g., Odisha)")
    district: str = Field(..., description="District / city name (e.g., Bhubaneswar)")
    crop: str = Field(..., description="Crop name (e.g., Rice, Wheat, Cotton)")

    class Config:
        schema_extra = {
            "example": {
                "state": "Odisha",
                "district": "Bhubaneswar",
                "crop": "Rice"
            }
        }


# ============================================================================
# API ENDPOINTS - EXISTING
# ============================================================================

@app.get("/", tags=["Root"])
def read_root():
    """Root endpoint - API information"""
    return {
        "message": "Welcome to AgriShield API",
        "description": "Crop Failure Risk Prediction + Weather Advisory System",
        "version": "2.0.0",
        "status": "active",
        "features": {
            "risk_prediction": "enabled",
            "weather_advisory": "enabled" if weather_services_available else "disabled",
            "disease_detection": "enabled",
            "crop_recommendation": "enabled",
            "seasonal_analysis": "enabled" if (seasonal_service_available and seasonal_analysis_svc) else "disabled"
        },
        "endpoints": {
            "risk_prediction": "POST /api/predict-risk",
            "weather_current": "POST /api/weather",
            "weather_forecast": "POST /api/weather/forecast",
            "weather_complete": "POST /api/weather/complete",
            "advisory": "POST /api/advisory",
            "seasonal_analysis": "POST /api/seasonal-analysis",
            "health": "GET /api/health",
            "crops": "GET /api/crops",
            "states": "GET /api/states",
            "risk_prediction_states": "GET /api/risk-prediction/states",
            "districts": "GET /api/districts",
            "documentation": "GET /docs"
        }
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AgriShield Risk Prediction + Weather API",
        "version": "2.0.0",
        "model_loaded": True,
        "weather_service": "active" if weather_services_available else "inactive"
    }


@app.get("/api/crops", tags=["Data"])
def get_crops(include_advisory: Optional[bool] = False):
    """Get canonical list of available crops from the trained model.

    By default this returns the canonical `crop_list` used by the ML model
    (the authoritative 55 crops). Set `include_advisory=true` to merge in
    advisory-only crops from the advisory service when weather services are available.
    """
    # Use canonical model crop list as the single source of truth
    canonical_crops = crop_list or []

    if include_advisory and weather_services_available:
        try:
            advisory_crops = advisory_service.get_available_crops()
            combined = list(set(canonical_crops + advisory_crops))
            return {
                "crops": sorted(combined),
                "count": len(combined),
                "message": "Canonical crops combined with advisory crops"
            }
        except Exception:
            # Fallback to canonical list if advisory retrieval fails
            pass

    return {
        "crops": sorted(canonical_crops),
        "count": len(canonical_crops),
        "message": "Canonical crop list from trained model"
    }


@app.get("/api/states", tags=["Data"])
def get_states():
    """Get list of available states - ALL 29 INDIAN STATES"""
    all_states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal", "Jammu and Kashmir"
    ]
    
    return {
        "states": sorted(all_states),
        "count": len(all_states),
        "message": "All 29 Indian states available"
    }


@app.get("/api/risk-prediction/states", tags=["Data"])
def get_risk_prediction_states():
    """Get list of states supported for risk prediction (24 states from model training)"""
    risk_states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Delhi",
        "Goa", "Gujarat", "Haryana", "Jammu And Kashmir", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Punjab", "Sikkim",
        "Tamil Nadu", "Tripura", "Uttar Pradesh", "West Bengal"
    ]
    
    return {
        "states": sorted(risk_states),
        "count": len(risk_states),
        "message": "States supported for risk prediction (model trained on these 24 states)"
    }


@app.get("/api/districts", tags=["Data"])
def get_districts(limit: Optional[int] = 100):
    """Get list of available districts"""
    return {
        "districts": district_list[:limit],
        "total_count": len(district_list),
        "showing": min(limit, len(district_list)),
        "message": "Available districts for prediction"
    }


@app.post("/api/predict-risk", response_model=RiskPredictionResponse, tags=["Prediction"])
def predict_risk(request: RiskPredictionRequest):
    """
    Predict crop failure risk based on input parameters
    
    This endpoint accepts crop, location, season, and weather data to predict
    the risk of crop failure using a trained machine learning model.
    """
    
    try:
        # Call prediction function
        result = predict_crop_failure(
            crop=request.crop,
            state=request.state,
            district=request.district,
            season=request.season,
            temperature=request.temperature,
            rainfall=request.rainfall,
            humidity=request.humidity,
            disaster_occurred=request.disaster_occurred
        )
        
        # Check for errors
        if 'error' in result:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": result['error'],
                    "available_crops": result.get('available_crops', []),
                    "available_states": result.get('available_states', [])
                }
            )
        
        return result
    
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=f"Validation error: {str(e)}"
        )
    
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


# ============================================================================
# API ENDPOINTS - NEW WEATHER FEATURES
# ============================================================================

@app.post("/api/weather", tags=["Weather"])
async def get_weather(request: WeatherRequest):
    """
    Get current weather data for a specific location
    
    **Parameters:**
    - **state**: State name
    - **district**: District name
    - **crop**: (Optional) Crop name for additional context
    
    **Returns:**
    - Current weather conditions (temperature, humidity, rainfall, wind speed, etc.)
    """
    if not weather_services_available:
        raise HTTPException(
            status_code=503,
            detail="Weather service is currently unavailable. Please check API key configuration."
        )
    
    try:
        weather_data = weather_service.get_current_weather(request.district, request.state)
        
        if not weather_data:
            raise HTTPException(
                status_code=404,
                detail=f"Weather data not found for {request.district}, {request.state}. Please check state and district names."
            )
        
        return {
            "success": True,
            "data": weather_data,
            "location": {
                "state": request.state,
                "district": request.district,
                "formatted": f"{request.district}, {request.state}, India"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching weather data: {str(e)}"
        )


@app.post("/api/weather/forecast", tags=["Weather"])
async def get_forecast(request: WeatherRequest):
    """
    Get 7-day weather forecast for a specific location
    
    **Returns:**
    - 7-day weather forecast with daily high/low temperatures and precipitation
    """
    if not weather_services_available:
        raise HTTPException(
            status_code=503,
            detail="Weather service is currently unavailable. Please check API key configuration."
        )
    
    try:
        forecast_data = weather_service.get_forecast(request.district, request.state)
        
        if not forecast_data:
            raise HTTPException(
                status_code=404,
                detail=f"Forecast data not found for {request.district}, {request.state}"
            )
        
        return {
            "success": True,
            "data": forecast_data,
            "location": {
                "state": request.state,
                "district": request.district,
                "formatted": f"{request.district}, {request.state}, India"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching forecast data: {str(e)}"
        )


@app.post("/api/advisory", tags=["Advisory"])
async def get_advisory(request: AdvisoryRequest):
    """
    Get crop-specific advisory based on current weather conditions
    
    **Parameters:**
    - **crop**: Crop name
    - **weather_conditions**: Dict with temperature, humidity, rainfall, wind_speed, soil_moisture
    
    **Returns:**
    - Crop-specific advisories and alerts based on weather thresholds
    """
    if not weather_services_available:
        raise HTTPException(
            status_code=503,
            detail="Advisory service is currently unavailable."
        )
    
    try:
        advisories = advisory_service.get_advisories_for_crop(
            crop_name=request.crop,
            weather_data=request.weather_conditions
        )
        
        return {
            "success": True,
            "data": {
                "crop": request.crop,
                "advisories": advisories,
                "total_alerts": len(advisories),
                "weather_conditions": request.weather_conditions
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching advisory data: {str(e)}"
        )


@app.post("/api/weather/complete", tags=["Weather"])
async def get_complete_weather_advisory(request: WeatherRequest):
    """Get weather data, forecast, and crop advisory in ONE call"""
    if not weather_services_available:
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    
    try:
        location = f"{request.district}, {request.state}, India"
        
        # Get current weather
        current_weather = weather_service.get_current_weather(request.district, request.state)
        if not current_weather:
            raise HTTPException(status_code=404, detail=f"Weather data not found for {location}")
        
        # Get forecast
        forecast = weather_service.get_forecast(request.district, request.state)
        
        # Get crop advisory if crop is specified
        advisory_data = None
        if request.crop:
            try:
                weather_conditions = {
                    "temperature": current_weather.get("temperature", 0),
                    "humidity": current_weather.get("humidity", 0),
                    "rainfall": current_weather.get("rainfall", 0),
                    "wind_speed": current_weather.get("wind_speed", 0),
                    "soil_moisture": current_weather.get("humidity", 0)  # Approximate
                }
                
                print(f"\n=== Processing Advisory for {request.crop} ===")
                print(f"Weather conditions: {weather_conditions}")
                
                # Get advisories
                advisories = advisory_service.get_advisories(
                    crop_name=request.crop,
                    weather_conditions=weather_conditions
                )
                
                # Get guidance
                guidance = advisory_service.get_crop_specific_guidance(
                    crop_name=request.crop,
                    weather_conditions=weather_conditions
                )
                
                # Calculate risk
                risk_level = advisory_service.calculate_risk_level(advisories)
                
                # Format as bullet points (each point separated by newline)
                def format_guidance_list(items):
                    """Format list items with bullet points"""
                    if not items:
                        return []
                    # Take up to 5 unique items
                    unique_items = list(set(items))[:5]
                    return unique_items
                
                advisory_data = {
                    "advisories": advisories,
                    "risk_level": risk_level,
                    "guidance": {
                        "irrigation": format_guidance_list(guidance.get('irrigation', [])),
                        "sowing": format_guidance_list(guidance.get('sowing', [])),
                        "spraying": format_guidance_list(guidance.get('spraying', [])),
                        "harvesting": format_guidance_list(guidance.get('harvesting', [])),
                        "general": format_guidance_list(guidance.get('general', []))
                    },
                    "weather_conditions": weather_conditions
                }
                
                print(f"Advisory generated with {len(advisories)} alerts")
                print(f"Guidance points - Irrigation: {len(advisory_data['guidance']['irrigation'])}, "
                      f"Sowing: {len(advisory_data['guidance']['sowing'])}, "
                      f"Spraying: {len(advisory_data['guidance']['spraying'])}, "
                      f"Harvesting: {len(advisory_data['guidance']['harvesting'])}")
                
            except Exception as e:
                print(f"Advisory error: {str(e)}")
                import traceback
                traceback.print_exc()
                
                advisory_data = {
                    "advisories": [],
                    "risk_level": "Low",
                    "guidance": {
                        "irrigation": [
                            f"Monitor soil moisture for {request.crop} regularly",
                            f"Irrigate based on crop growth stage",
                            f"Avoid waterlogging in {request.crop} fields"
                        ],
                        "sowing": [
                            f"Use certified seeds for {request.crop}",
                            f"Follow recommended spacing for {request.crop}",
                            f"Ensure proper seed depth for optimal germination"
                        ],
                        "spraying": [
                            f"Scout fields regularly for {request.crop} pests",
                            f"Use recommended pesticides for {request.crop}",
                            f"Apply during calm weather conditions"
                        ],
                        "harvesting": [
                            f"Harvest {request.crop} at physiological maturity",
                            f"Avoid harvesting during wet conditions",
                            f"Ensure proper drying after harvest"
                        ],
                        "general": [
                            f"Monitor {request.crop} for disease symptoms",
                            f"Maintain field sanitation"
                        ]
                    },
                    "error": f"Using fallback advisory: {str(e)}"
                }
        
        return {
            "success": True,
            "data": {
                "current_weather": current_weather,
                "forecast": forecast,
                "advisory": advisory_data,
                "location": {
                    "state": request.state,
                    "district": request.district,
                    "formatted": location
                }
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ============================================================================
# API ENDPOINT - SEASONAL CROP SUITABILITY ANALYSIS (NEW FEATURE)
# ============================================================================

@app.post("/api/seasonal-analysis", tags=["Seasonal Analysis"])
async def get_seasonal_analysis(request: SeasonalAnalysisRequest):
    """
    **Seasonal Crop Suitability Analysis** — Historical + Predictive Intelligence

    Compares the current season's weather to 20 years of historical data for
    the selected city/state and tells you whether this year is better or worse
    than previous years for growing the chosen crop.

    **What it returns:**
    - 📅 12-month projected forecast (actual + normals-based projection)
    - 📊 Season-vs-history comparison (current year vs last 10 seasons)
    - 🌀 Recurring disaster/cyclone warnings based on historical patterns
    - ✅/❌ Overall crop suitability verdict with score (0-100)
    - 🔄 Multi-cycle cultivation recommendation

    **Data source:** Open-Meteo Archive API (ERA5 reanalysis, free, no key needed)
    covering 2004–2023 + current year actuals.
    """
    if not seasonal_service_available or seasonal_analysis_svc is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Seasonal Analysis Service is unavailable. "
                "Ensure 'seasonal_analysis_service.py' and 'historical_weather_service.py' "
                "are present in the backend directory."
            )
        )

    try:
        result = seasonal_analysis_svc.get_seasonal_analysis(
            state=request.state,
            district=request.district,
            crop=request.crop,
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Analysis failed. Check district name.")
            )

        return {
            "success": True,
            "data": result,
            "location": {
                "state": request.state,
                "district": request.district,
                "formatted": f"{request.district}, {request.state}, India",
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Seasonal analysis error: {str(e)}")


# ============================================================================
# INFORMATION ENDPOINTS
# ============================================================================

@app.get("/api/info", tags=["Information"])
def get_api_info():
    """Get detailed API information"""
    return {
        "api_name": "AgriShield - Comprehensive Agricultural Platform",
        "version": "2.0.0",
        "description": "AI-powered crop failure risk assessment + real-time weather advisory system",
        "features": [
            "Crop failure risk prediction using ML",
            "Real-time weather data integration",
            "7-day weather forecasting",
            "Crop-specific agricultural advisory",
            "Weather-based risk alerts",
            "Multi-crop and multi-state support",
            "Disease detection",
            "Crop recommendation system"
        ],
        "technology": {
            "framework": "FastAPI",
            "ml_library": "scikit-learn",
            "weather_api": "OpenWeatherMap",
            "model_type": "Classification + Advisory Rules",
            "python_version": "3.8+"
        },
        "data_sources": [
            "Government crop production data",
            "Historical weather data",
            "OpenWeatherMap real-time data",
            "Agricultural advisory database",
            "Disaster records",
            "Soil quality data"
        ],
        "supported_crops": len(crop_list),
        "supported_states": 29,
        "weather_service_status": "active" if weather_services_available else "inactive"
    }


# ============================================================================
# ERROR HANDLERS
# ============================================================================




@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    if exc.status_code == 404:
        return JSONResponse(
            status_code=404,
            content={
                "error": "Endpoint not found",
                "message": f"The endpoint {request.url.path} does not exist",
                "available_endpoints": [
                    "/",
                    "/api/health",
                    "/api/predict-risk",
                    "/api/weather",
                    "/api/weather/forecast",
                    "/api/weather/complete",
                    "/api/advisory",
                    "/api/crops",
                    "/api/states",
                    "/api/districts",
                    "/schemes/eligible",
                    "/schemes/all",
                    "/schemes/filters/states",
                    "/schemes/filters/crops",
                    "/schemes/filters/types",
                    "/docs"
                ]
            }
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
            "contact": "support@agrishield.com"
        }
    )


# ============================================================================
# STARTUP EVENT
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    print("\n" + "="*80)
    print(" "*25 + "AGRISHIELD API SERVER")
    print(" "*28 + "Version 2.0.0")
    print("="*80)
    print(f"\n✅ API Version: 2.0.0")
    print(f"✅ Risk Prediction Models: Loaded")
    print(f"✅ Weather Service: {'Active' if weather_services_available else 'Inactive (check .env)'}")
    print(f"✅ Advisory Service: {'Active' if weather_services_available else 'Inactive'}")
    print(f"✅ Seasonal Analysis Service: {'Active' if (seasonal_service_available and seasonal_analysis_svc) else 'Inactive'}")
    print(f"✅ Supported Crops: {len(crop_list)}")
    states_count = len(scheme_manager.get_unique_states()) if scheme_manager else "Unknown"
    print(f"✅ Supported States: {states_count} (Government Schemes)")
    print(f"✅ Risk Prediction States: 24 (Model trained states)")
    print(f"✅ Supported Districts: {len(district_list)}")
    print(f"\n📖 API Documentation: http://localhost:8000/docs")
    print(f"🔗 API Base URL: http://localhost:8000")
    print(f"🌤️  Weather Endpoint: POST http://localhost:8000/api/weather/complete")
    print("\n" + "="*80 + "\n")


# ============================================================================
# MAIN (for running with uvicorn directly)
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )