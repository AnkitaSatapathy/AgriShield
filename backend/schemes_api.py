from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from schemes_data import SchemeManager

router = APIRouter(prefix="/schemes", tags=["schemes"])

# Initialize scheme manager
scheme_manager = SchemeManager()


# Pydantic models
class SchemeQuery(BaseModel):
    state: str
    farmer_category: str  # "Small", "Marginal", "Large"
    crop_type: Optional[str] = None


class SchemeResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    description: str
    benefits: str
    eligibility_criteria: str
    documents_required: str
    application_link: str
    state_applicability: str
    crop_types: str
    farmer_category: str
    scheme_type: str
    is_eligible: bool
    eligibility_reason: str


# API Endpoints
@router.get("/")
def root():
    return {
        "message": "Government Schemes API",
        "endpoints": {
            "/eligible": "Get eligible schemes based on profile",
            "/all": "Get all schemes",
            "/{scheme_id}": "Get specific scheme",
            "/filters": "Get available filters"
        }
    }


@router.post("/eligible", response_model=List[SchemeResponse])
def get_eligible_schemes(query: SchemeQuery):
    """
    Get schemes eligible for farmer based on profile
    
    Example:
    POST /schemes/eligible
    {
        "state": "Punjab",
        "farmer_category": "Small",
        "crop_type": "Rice"
    }
    """
    try:
        schemes = scheme_manager.get_eligible_schemes(
            state=query.state,
            farmer_category=query.farmer_category,
            crop_type=query.crop_type
        )
        return schemes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/eligible")
def get_eligible_schemes_get(
    state: str = Query(..., description="Farmer's state"),
    farmer_category: str = Query(..., description="Small, Marginal, or Large"),
    crop_type: Optional[str] = Query(None, description="Crop type (optional)")
):
    """
    GET version for easier testing
    
    Example: /schemes/eligible?state=Punjab&farmer_category=Small&crop_type=Rice
    """
    try:
        schemes = scheme_manager.get_eligible_schemes(
            state=state,
            farmer_category=farmer_category,
            crop_type=crop_type
        )
        return {
            "count": len(schemes),
            "schemes": schemes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all")
def get_all_schemes():
    """Get all available schemes"""
    try:
        schemes = scheme_manager.get_all_schemes()
        return {
            "count": len(schemes),
            "schemes": schemes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{scheme_id}")
def get_scheme(scheme_id: str):
    """Get specific scheme by ID"""
    scheme = scheme_manager.get_scheme_by_id(scheme_id)
    if scheme is None:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme


@router.get("/filters/states")
def get_states():
    """Get list of available states"""
    try:
        states = scheme_manager.get_unique_states()
        # Add common states if not in schemes
        common_states = [
            "Punjab", "Haryana", "Uttar Pradesh", "Bihar", "West Bengal",
            "Maharashtra", "Karnataka", "Tamil Nadu", "Andhra Pradesh", "Kerala"
        ]
        all_states = sorted(list(set(states + common_states)))
        return {"states": all_states}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filters/crops")
def get_crops():
    """Get list of available crop types"""
    try:
        crops = scheme_manager.get_unique_crops()
        return {"crops": crops}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filters/categories")
def get_categories():
    """Get farmer categories"""
    return {
        "categories": ["Small", "Marginal", "Large"]
    }


@router.get("/filters/types")
def get_scheme_types():
    """Get scheme types"""
    try:
        types = scheme_manager.get_scheme_types()
        return {"scheme_types": types}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
