import pandas as pd
from typing import List, Dict, Optional
from pathlib import Path
from itertools import product
import json
import os
import urllib.request



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
        self.df = self.df.fillna("")
        
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
        
        if len(filtered_schemes) == 0:
            # Fallback 1: Relax Crop Filter (Show General schemes for this State + Category)
            if crop_type:
                return self.get_eligible_schemes(state, farmer_category, crop_type=None)
            
            # Fallback 2: Relax State Filter (Show Central schemes for this Category)
            # Only if we are not already looking at "All States" logic
            if state != "All States":
                # Create synthetic "All States" query
                schemes_list = self._filter_schemes("All States", farmer_category, crop_type=None)
                if schemes_list:
                    for s in schemes_list:
                         s['eligibility_reason'] = f"Universal scheme applicable to all states (including {state})"
                    return schemes_list

        # Convert to list of dictionaries
        schemes_list = filtered_schemes.to_dict('records')
        
        # Add eligibility status
        for scheme in schemes_list:
            scheme['is_eligible'] = True
            scheme['eligibility_reason'] = self._get_eligibility_reason(
                scheme, state, farmer_category, crop_type
            )
        
        return schemes_list

    def _filter_schemes(self, state, farmer_category, crop_type=None):
        """Helper to filter schemes dataframe"""
        filtered = self.df.copy()
        
        # Filter by state
        state_mask = (
            filtered['state_applicability'].str.contains('All States', case=False, na=False) |
            filtered['state_applicability'].str.contains(state, case=False, na=False)
        )
        filtered = filtered[state_mask]
        
        # Filter by category
        category_mask = filtered['farmer_category'].str.contains(
            farmer_category, case=False, na=False
        )
        filtered = filtered[category_mask]
        
        # Filter by crop
        if crop_type:
            crop_mask = (
                filtered['crop_types'].str.contains('All Crops', case=False, na=False) |
                filtered['crop_types'].str.contains(crop_type, case=False, na=False)
            )
            filtered = filtered[crop_mask]
            
        return filtered.to_dict('records')
    
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
        
        # 1. Get crops from CSV
        for crops_str in self.df['crop_types'].dropna():
            if 'All Crops' not in crops_str:
                crops = [c.strip() for c in crops_str.split(',')]
                all_crops.update(crops)
                
        # 2. Add Master List of supported crops to ensure dropdown covers everything
        # (These will match with "All Crops" schemes even if not explicitly listed)
        master_crops = [
            'Rice', 'Maize', 'Chickpea', 'Kidneybeans', 'Pigeonpeas', 'Mothbeans', 
            'Mungbean', 'Blackgram', 'Lentil', 'Pomegranate', 'Banana', 'Mango', 
            'Grapes', 'Watermelon', 'Muskmelon', 'Apple', 'Orange', 'Papaya', 
            'Coconut', 'Cotton', 'Jute', 'Coffee', 'Arecanut', 'Arhar/Tur', 'Bajra',
            'Barley', 'Black Pepper', 'Cardamom', 'Cashewnut', 'Castor Seed', 'Coriander',
            'Cotton(Lint)', 'Cowpea(Lobia)', 'Dry Chillies', 'Garlic', 'Ginger', 'Gram',
            'Groundnut', 'Guar Seed', 'Jowar', 'Khesari', 'Linseed',
            'Masoor', 'Mesta', 'Moong(Green Gram)', 'Moth', 'Niger Seed',
            'Onion', 'Peas & Beans (Pulses)', 'Potato', 'Ragi', 'Rapeseed &Mustard',
            'Sesamum', 'Small Millets', 'Soyabean', 'Sugarcane',
            'Sunflower', 'Sweet Potato', 'Tapioca', 'Tobacco', 'Turmeric', 'Urad', 'Wheat'
        ]
        all_crops.update(master_crops)
        
        return sorted(list(all_crops))
    
    def get_scheme_types(self) -> List[str]:
        """Get list of scheme types"""
        return self.df['scheme_type'].unique().tolist()

    def verify_coverage(self) -> Dict:
        """
        Verify scheme coverage across all combinations of State + Category + Crop.
        Returns a summary dictionary including gaps if any.
        """
        states = self.get_unique_states()
        crops = self.get_unique_crops()
        categories = ["Small", "Marginal", "Large"]
        
        total_combinations = len(states) * len(crops) * len(categories)
        gaps = []
        
        for state, crop, category in product(states, crops, categories):
            # We use _filter_schemes directly or get_eligible_schemes with default fallback
            # But get_eligible_schemes has fallback logic built-in now, which we want to test.
            schemes = self.get_eligible_schemes(state, category, crop)
            if len(schemes) == 0:
                gaps.append((state, crop, category))
                
        return {
            "total_checked": total_combinations,
            "gaps_found": len(gaps),
            "gaps": gaps[:10] if gaps else [],  # Show first 10 gaps
            "success": len(gaps) == 0
        }

    def add_schemes(self, new_schemes: List[Dict]) -> Dict:
        """
        Add new schemes to the CSV and sync with notebook.
        Checks for duplicates based on scheme_name.
        """
        initial_count = len(self.df)
        existing_names = set(self.df['scheme_name'].unique())
        
        added_count = 0
        for scheme in new_schemes:
            if scheme['scheme_name'] not in existing_names:
                # Validate required fields
                required_fields = ['scheme_name', 'state_applicability', 'farmer_category', 'crop_types']
                if all(k in scheme for k in required_fields):
                    self.df = pd.concat([self.df, pd.DataFrame([scheme])], ignore_index=True)
                    added_count += 1
                    existing_names.add(scheme['scheme_name'])
        
        if added_count > 0:
            # Save CSV
            repo_root = Path(__file__).resolve().parents[1]
            csv_path = repo_root / "data" / "processed" / "government_schemes.csv"
            self.df.to_csv(csv_path, index=False, encoding='utf-8')
            
            # Sync Notebook
            sync_result = self.sync_notebook()
            
            return {
                "success": True,
                "added": added_count,
                "total_before": initial_count,
                "total_after": len(self.df),
                "sync_status": sync_result
            }
        
        return {"success": False, "message": "No new unique schemes found to add."}

    def sync_notebook(self, notebook_path_relative: str = "government_scheme.ipynb"):
        """
        Sync the current CSV data back to the Jupyter Notebook source code.
        This ensures the notebook remains the source of truth for generation.
        """
        import json
        
        # Resolve notebook path
        repo_root = Path(__file__).resolve().parents[1]
        notebook_path = Path(__file__).parent / notebook_path_relative
        
        if not notebook_path.exists():
            return {"success": False, "error": f"Notebook not found at {notebook_path}"}
            
        current_schemes = self.df.to_dict('records')
        
        try:
            with open(notebook_path, 'r', encoding='utf-8') as f:
                nb_data = json.load(f)
                
            # Find the cell with 'schemes_data ='
            target_cell_index = -1
            for i, cell in enumerate(nb_data['cells']):
                if cell['cell_type'] == 'code':
                    source_code = "".join(cell['source'])
                    if 'schemes_data =' in source_code:
                        target_cell_index = i
                        break
            
            if target_cell_index == -1:
                return {"success": False, "error": "Target cell 'schemes_data =' not found in notebook"}
                
            # Format list of dicts for Python source code
            formatted_list = "schemes_data = [\n"
            for i, s in enumerate(current_schemes):
                formatted_list += "    {\n"
                for k, v in s.items():
                    val_str = str(v).replace("'", "\\'")
                    formatted_list += f"        '{k}': '{val_str}',\n"
                formatted_list += "    }"
                if i < len(current_schemes) - 1:
                    formatted_list += ",\n"
                else:
                    formatted_list += "\n"
            formatted_list += "]\n\n"
            
            # Boilerplate code to preserve
            remaining_code = [
                "# Create DataFrame\n",
                "schemes_df = pd.DataFrame(schemes_data)\n",
                "\n",
                "# Define absolute path to save location\n",
                "save_dir = r'C:\\Users\\KIIT\\Desktop\\AgriShield\\data\\processed'\n",
                "os.makedirs(save_dir, exist_ok=True)\n",
                "\n",
                "# Define filename and full path\n",
                "csv_filename = 'government_schemes.csv'\n",
                "csv_filepath = os.path.join(save_dir, csv_filename)\n",
                "\n",
                "# Save to CSV\n",
                "schemes_df.to_csv(csv_filepath, index=False, encoding='utf-8')\n",
                "\n",
                "# Display summary\n",
                "print(f'✅ Successfully saved {len(schemes_df)} schemes')\n",
                "print(f'\\n📊 Dataset Summary:')\n",
                "print(f'   - Total schemes: {len(schemes_df)}')\n",
                "print(f'   - Columns: {len(schemes_df.columns)}')\n",
                "print(f'   - States covered: {schemes_df[\"state_applicability\"].nunique()}')\n",
                "print(f'   - Scheme types: {schemes_df[\"scheme_type\"].nunique()}')\n",
                "print(f'   - Saved to: {csv_filepath}')"
            ]
            
            # Construct new source (handling newlines carefully)
            new_source = [line + "\n" for line in formatted_list.splitlines()] 
            new_source = [s.replace('\n\n', '\n') for s in new_source]
            full_source = new_source + remaining_code
            
            nb_data['cells'][target_cell_index]['source'] = full_source
            
            with open(notebook_path, 'w', encoding='utf-8') as f:
                json.dump(nb_data, f, indent=1)
                
            return {"success": True, "message": f"Synced {len(current_schemes)} schemes to notebook."}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    def validate_links(self) -> Dict:
        """
        Validate that all scheme application links are active using concurrent requests.
        Returns detailed report of broken links.
        """
        import concurrent.futures
        import urllib.request

        def check_link(url):
            if not isinstance(url, str) or not url.startswith('http'):
                 return url, "Invalid URL"
            try:
                # Fake user agent to avoid 403s
                req = urllib.request.Request(
                    url, 
                    data=None, 
                    headers={'User-Agent': 'Mozilla/5.0'}
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    return url, response.getcode()
            except Exception as e:
                return url, str(e)

        schemes = self.get_all_schemes()
        urls = [s.get('application_link') for s in schemes if s.get('application_link')]
        unique_urls = list(set(urls))
        
        results = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            future_to_url = {executor.submit(check_link, url): url for url in unique_urls}
            for future in concurrent.futures.as_completed(future_to_url):
                url, status = future.result()
                results[url] = status
                
        broken_links = []
        for scheme in schemes:
            url = scheme.get('application_link')
            if not url: continue
            
            status = results.get(url, "Unknown")
            if status != 200:
                 broken_links.append({
                    "scheme_name": scheme['scheme_name'],
                    "url": url,
                    "error": status
                })

        return {
            "total_checked": len(unique_urls),
            "broken_count": len(broken_links),
            "broken_links": broken_links,
            "success": len(broken_links) == 0
        }



    def fix_placeholder_states(self) -> Dict:
        """
        Replace generic state placeholders with specific state lists in the dataset.
        Incorporated from maintenance scripts.
        """
        updates_made = False
        
        # Define mappings
        mappings = {
            'TMC_001': "Punjab, Haryana, Rajasthan, Madhya Pradesh, Gujarat, Maharashtra, Telangana, Andhra Pradesh, Karnataka, Tamil Nadu, Odisha", # Cotton
            'JUTE_TECH_001': "West Bengal, Bihar, Assam, Odisha, Andhra Pradesh, Tripura, Meghalaya", # Jute
            'MOVCD_001': "Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura", # NE States
            'RKVY_MUSH_001': "All States" # Multiple States
        }
        
        for scheme_id, states in mappings.items():
            if scheme_id in self.df['scheme_id'].values:
                current_val = self.df.loc[self.df['scheme_id'] == scheme_id, 'state_applicability'].values[0]
                # Update if current value is the old placeholder or just different (simple check)
                # We specifically check for the placeholders to avoid overwriting manual changes if any
                is_placeholder = any(p in current_val for p in ["Cotton", "Jute", "North East", "Multiple"])
                if is_placeholder:
                    self.df.loc[self.df['scheme_id'] == scheme_id, 'state_applicability'] = states
                    updates_made = True
        
        if updates_made:
            repo_root = Path(__file__).resolve().parents[1]
            csv_path = repo_root / "data" / "processed" / "government_schemes.csv"
            self.df.to_csv(csv_path, index=False, encoding='utf-8')
            self.sync_notebook()
            return {"success": True, "message": "Placeholder states updated and synced."}
        
        return {"success": True, "message": "No placeholder updates needed."}

    def ensure_goa_scheme(self) -> Dict:
        """
        Ensure Goa specific scheme exists to populate state dropdown.
        Incorporated from maintenance scripts.
        """
        if 'GOA_HORT_001' not in self.df['scheme_id'].values:
            new_scheme = {
                "scheme_id": "GOA_HORT_001",
                "scheme_name": "Goa State Horticulture Assistance",
                "description": "Financial assistance for cashew and coconut plantation maintenance in Goa.",
                "benefits": "Subsidy for inputs, technical support",
                "eligibility_criteria": "Farmers with documented land ownership in Goa",
                "documents_required": "Krishi Card, Aadhaar, Land documents",
                "application_link": "https://agri.goa.gov.in/",
                "state_applicability": "Goa",
                "crop_types": "Cashew, Coconut",
                "farmer_category": "Small,Marginal,Large",
                "scheme_type": "Financial Support",
                "required_documents": "Krishi Card, Aadhaar, Land docs"
            }
            return self.add_schemes([new_scheme])
        return {"success": True, "message": "Goa scheme requirement is met."}

    def verify_state_integrity(self) -> Dict:
        """
        Check for any remaining placeholder state names or invalid entries.
        Incorporated from verification scripts.
        """
        states = self.get_unique_states()
        invalid_entries = ["Cotton Growing States", "Jute Growing States", "North East States", "Multiple States"]
        found_invalid = [s for s in states if s in invalid_entries]
        
        return {
            "valid": len(found_invalid) == 0,
            "invalid_entries": found_invalid,
            "total_states": len(states),
            "states_sample": states[:5]
        }

# Example usage
if __name__ == "__main__":
    manager = SchemeManager()
    
    print("--- Running Maintenance Tasks ---")
    
    # 1. Fix Placeholders
    print(manager.fix_placeholder_states())
    
    # 2. Add Missing Schemes (Goa)
    print(manager.ensure_goa_scheme())
    
    # 3. Verify Data Integrity
    verification = manager.verify_state_integrity()
    if verification['valid']:
        print("✅ State List Integrity Verified: Clean.")
    else:
        print(f"❌ State List Verification Failed. Invalid entries: {verification['invalid_entries']}")
    
    # 4. Standard Tests
    schemes = manager.get_eligible_schemes(
        state="Punjab",
        farmer_category="Small",
        crop_type="Rice"
    )
    print(f"\nFound {len(schemes)} eligible schemes for standard query.")
