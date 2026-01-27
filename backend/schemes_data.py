import pandas as pd
from typing import List, Dict, Optional
from pathlib import Path


class SchemeManager:
    def __init__(self, schemes_csv_path: Optional[str] = None):
        """Initialize scheme manager with CSV data.

        If `schemes_csv_path` is not provided the path will be resolved
        relative to the repository root (parent of the `backend` folder):
        <repo_root>/data/processed/government_schemes.csv
        """
        if schemes_csv_path is None:
            repo_root = Path(__file__).resolve().parents[1]
            schemes_csv_path = repo_root / "data" / "processed" / "government_schemes.csv"
        else:
            schemes_csv_path = Path(schemes_csv_path)

        if not schemes_csv_path.exists():
            raise FileNotFoundError(f"Government schemes CSV not found at {schemes_csv_path}")

        self.df = pd.read_csv(schemes_csv_path)
        
    def get_eligible_schemes(
        self, 
        state: str,
        farmer_category: str,
        crop_type: Optional[str] = None
    ) -> List[Dict]:
        """
        Get eligible schemes based on farmer profile
        
        Args:
            state: Farmer's state (e.g., "Punjab", "All States")
            farmer_category: "Small", "Marginal", "Large"
            crop_type: Optional crop type (e.g., "Rice", "Wheat")
        
        Returns:
            List of eligible scheme dictionaries
        """
        filtered_schemes = self.df.copy()
        
        # Filter by state (case-insensitive)
        state_mask = (
            filtered_schemes['state_applicability'].str.contains('All States', case=False, na=False) |
            filtered_schemes['state_applicability'].str.contains(state, case=False, na=False)
        )
        filtered_schemes = filtered_schemes[state_mask]
        
        # Filter by farmer category
        category_mask = filtered_schemes['farmer_category'].str.contains(
            farmer_category, case=False, na=False
        )
        filtered_schemes = filtered_schemes[category_mask]
        
        # Filter by crop type if provided
        if crop_type:
            crop_mask = (
                filtered_schemes['crop_types'].str.contains('All Crops', case=False, na=False) |
                filtered_schemes['crop_types'].str.contains(crop_type, case=False, na=False)
            )
            filtered_schemes = filtered_schemes[crop_mask]
        
        # Convert to list of dictionaries
        schemes_list = filtered_schemes.to_dict('records')
        
        # Add eligibility status
        for scheme in schemes_list:
            scheme['is_eligible'] = True
            scheme['eligibility_reason'] = self._get_eligibility_reason(
                scheme, state, farmer_category, crop_type
            )
        
        return schemes_list
    
    def _get_eligibility_reason(
        self, 
        scheme: Dict,
        state: str,
        farmer_category: str,
        crop_type: Optional[str]
    ) -> str:
        """Generate eligibility reason string"""
        reasons = []
        
        if 'All States' in scheme['state_applicability']:
            reasons.append(f"Available in all states including {state}")
        else:
            reasons.append(f"Available in {state}")
        
        reasons.append(f"Eligible for {farmer_category} farmers")
        
        if crop_type:
            if 'All Crops' in scheme['crop_types']:
                reasons.append(f"Applicable for all crops including {crop_type}")
            else:
                reasons.append(f"Applicable for {crop_type}")
        
        return " | ".join(reasons)
    
    def get_all_schemes(self) -> List[Dict]:
        """Get all schemes without filtering"""
        return self.df.to_dict('records')
    
    def get_scheme_by_id(self, scheme_id: str) -> Optional[Dict]:
        """Get specific scheme by ID"""
        scheme = self.df[self.df['scheme_id'] == scheme_id]
        if len(scheme) > 0:
            return scheme.iloc[0].to_dict()
        return None
    
    def get_unique_states(self) -> List[str]:
        """Get list of unique states from schemes"""
        all_states = set()
        for states_str in self.df['state_applicability'].dropna():
            if 'All States' not in states_str:
                states = [s.strip() for s in states_str.split(',')]
                all_states.update(states)
        return sorted(list(all_states))
    
    def get_unique_crops(self) -> List[str]:
        """Get list of unique crop types"""
        all_crops = set()
        for crops_str in self.df['crop_types'].dropna():
            if 'All Crops' not in crops_str:
                crops = [c.strip() for c in crops_str.split(',')]
                all_crops.update(crops)
        return sorted(list(all_crops))
    
    def get_scheme_types(self) -> List[str]:
        """Get list of scheme types"""
        return self.df['scheme_type'].unique().tolist()


# Example usage
if __name__ == "__main__":
    manager = SchemeManager()
    
    # Test eligibility matching
    schemes = manager.get_eligible_schemes(
        state="Punjab",
        farmer_category="Small",
        crop_type="Rice"
    )
    
    print(f"Found {len(schemes)} eligible schemes")
    for scheme in schemes:
        print(f"\n✅ {scheme['scheme_name']}")
        print(f"   Reason: {scheme['eligibility_reason']}")