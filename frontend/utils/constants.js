/**
 * Application Constants
 * Contains all static data like states, crops, etc.
 */

// All 29 Indian States + Union Territories
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Jammu and Kashmir"
];

// Districts by State
export const DISTRICTS_BY_STATE = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Kadapa", "Chittoor", "Dakshin Kannada", "Nellore", "Prakasam", "West Godavari", "East Godavari", "Anantapur"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Aalo", "Bomdila", "Tezu", "Ziro", "Changlang", "Lohit", "Papum Pare", "Upper Subansiri", "West Kameng", "Dibang Valley"],
  "Assam": ["Guwahati", "Silchar", "Barpeta", "Bongaigaon", "Cachar", "Darang", "Dhemaji", "Dhubri", "Dibrugarh", "Golaghat", "Hailakandi", "Jorhat", "Kamrup", "Karbi Anglong", "Katmandu", "Kokrajhar", "Lakhimpur", "Morigaon", "Nagaon", "Nalbari", "North Cachar Hills", "Sibsagar", "Sonitpur", "Tinsukia"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Munger", "Darbhanga", "Madhubani", "Samastipur", "Sitamarhi", "Muzaffarpur", "East Champaran", "West Champaran", "Saran", "Siwan", "Gopalganj", "Jehanabad", "Nalanda", "Aurangabad", "Arwal", "Buxar", "Kaimur", "Lakhisarai", "Sheikhpura", "Jamui", "Khagaria", "Purnea", "Supaul", "Araria", "Katihar"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Jagdalpur", "Rajnandgaon", "Dhamtari", "Kabirdham", "Korba", "Raigarh", "Kanker", "Janjgir-Champa", "Gariaband", "Balod", "Balrampur", "Bemetara", "Bijapur", "Manpur", "Narayanpur", "Sukma"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Junagadh", "Jamnagar", "Bhavnagar", "Anand", "Kheda", "Panchmahal", "Sabarkantha", "Gandhinagar", "Banaskantha", "Narmada", "Bharuch", "Valsad", "Navsari", "Tapi", "Kutch", "Botad", "Morbi", "Chhota Udaipur", "Devbhumi Dwarka", "Gir Somnath", "Mahisagar", "Panchmahal", "Porbandar"],
  "Haryana": ["Faridabad", "Gurgaon", "Hisar", "Rohtak", "Panipat", "Ambala", "Yamunanagar", "Karnal", "Kaithal", "Kurukshetra", "Sonipat", "Bhiwani", "Mahendragarh", "Rewari", "Nuh", "Palwal", "Charkhi Dadri", "Fatehabad", "Jind"],
  "Himachal Pradesh": ["Shimla", "Solan", "Kasauli", "Kinnaur", "Spiti", "Lahaul", "Mandi", "Kangra", "Chamba", "Una", "Bilaspur", "Hamirpur", "Sirmaur"],
  "Jharkhand": ["Ranchi", "Dhanbad", "Jamshedpur", "Giridih", "Hazaribagh", "Bokaro", "Deoghar", "Godda", "Koderma", "Lohardaga", "Dumka", "Pakur", "Jamtara", "Sahibganj", "Ramgarh", "Khunti", "Saraikela Kharsawan", "West Singhbhum", "East Singhbhum"],
  "Karnataka": ["Bangalore", "Mysore", "Mangalore", "Belgaum", "Hubli", "Davangere", "Bellary", "Tumkur", "Kolar", "Chitradurga", "Chikmagalur", "Hassan", "Kodagu", "Udupi", "Uttara Kannada", "Raichur", "Kurnool", "Bijapur", "Bagalkot", "Mandya", "Khandwa", "Vikarabad"],
  "Kerala": ["Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna", "Seoni", "Chhindwara", "Betul", "Hoshangabad", "Dindori", "Mandla", "Balaghat", "Raisen", "Sehore", "Vidisha", "Damoh", "Panna", "Tikamgarh", "Chhatarpur", "Morena", "Guna", "Ashoknagar", "Neemuch", "Mandsaur", "Ratlam", "Shajapur", "Dewas", "Dhar", "Khargone", "Khandwa", "Burhanpur", "Sheopur", "Shivpuri", "Rajgarh", "Alirajpur"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Aurangabad", "Nashik", "Akola", "Amravati", "Beed", "Bid", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Nanded", "Nandurbar", "Osmananad", "Parbhani", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal", "Ahmednagar", "Belgaum", "Washim"],
  "Manipur": ["Imphal", "Imphal West", "Imphal East", "Bishnupur", "Thoubal", "Ukhrul", "Senapati", "Tamenglong", "Churachandpur", "Chandel"],
  "Meghalaya": ["Shillong", "Tura", "Baghmara", "East Khasi Hills", "West Khasi Hills", "South Garo Hills", "North Garo Hills", "East Garo Hills", "Ri Bhoi", "Jaintia Hills", "Sohra"],
  "Mizoram": ["Aizawl", "Saiha", "Kolasib", "Lunglei", "Mamit", "Serchhip", "Lawngtlai", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Longleng", "Zunheboto", "Wokha", "Tuensang", "Mon", "Peren", "Phek"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Bargarh", "Balangir", "Balasore", "Bhadrak", "Boudh", "Debagarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
  "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Hoshiarpur", "Sangrur", "Bathinda", "Firozpur", "Faridkot", "Gurdaspur", "Mansa", "Kapurthala", "Mohali", "Ropar", "Fatehgarh Sahib", "Barnala"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Udaipur", "Ajmer", "Bikaner", "Nagaur", "Alwar", "Bharatpur", "Dholpur", "Karauli", "Sawai Madhopur", "Banswara", "Chittorgarh", "Dungarpur", "Jaisalmer", "Barmer", "Pali", "Sirohi", "Bhilwara", "Sikar", "Jhunjhunu", "Churu", "Tonk"],
  "Sikkim": ["Gangtok", "East Sikkim", "West Sikkim", "North Sikkim", "South Sikkim"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tirunelveli", "Kanyakumari", "Thanjavur", "Erode", "Dindigul", "Tiruppur", "Villupuram", "Vellore", "Ranipet", "Tiruvannamalai", "Chengalpattu", "Kanchipuram", "Cuddalore", "Kallakurichi", "Nagercoil", "Srivilliputhur", "Sivakasi", "Tenkasi", "Paramakudi", "Ramanathapuram", "Pudukkottai", "Karur", "Ariyalur", "Perambalur", "Namakkal", "Omalur"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Mahbubnagar", "Tandur", "Tandega", "Vikarabad", "Medak", "Jagtial", "Adilabad", "Nirmal", "Peddapalli", "Jangaon", "Hanmakonda", "Hanamkonda", "Mancherial", "Miryalaguda"],
  "Tripura": ["Agartala", "Aizawl", "Udaipur", "Dharmanagar", "Ambassa", "Kailashahar", "Khowai", "Belonia", "Sabroom", "Gomati"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Varanasi", "Agra", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Etah", "Mathura", "Firozabad", "Mainpuri", "Etawah", "Jalaun", "Jhansi", "Lalitpur", "Chitrakoot", "Banda", "Mahoba", "Hamirpur", "Fatehpur", "Raebareli", "Sultanpur", "Ambedkar Nagar", "Azamgarh", "Mau", "Ballia", "Ghazipur", "Chandauli", "Jaunpur", "Santkabirnagar", "Kushinagar", "Deoria", "Gorakhpur", "Maharajganj", "Siddharthnagar", "Basti", "Sant Kabir Nagar", "Faizabad", "Amethi", "Raebareli", "Pratapgarh", "Sitapur", "Lakhimpur Kheri", "Kheri", "Hardoi", "Lucknow", "Barabanki", "Raibareli", "Unnao", "Kanpur Dehat", "Kanpur Nagar", "Jajmau", "Fatehpur", "Fatehjang"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Udham Singh Nagar", "Nainital", "Almora", "Pithoragarh", "Bageshwar", "Champawat", "Pauri", "Tehri", "Uttarkashi", "Chamoli", "Rudraprayag"],
  "West Bengal": ["Kolkata", "Darjeeling", "Jalpaiguri", "Cooch Behar", "Alipurduar", "Kalimpong", "North Dinajpur", "South Dinajpur", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "South 24 Parganas", "East Midnapore", "West Midnapore", "Bankura", "Birbhum", "Bardhaman", "Hooghly", "Howrah", "Purba Bardhaman", "Paschim Bardhaman", "Purulia"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Leh", "Kargil", "Samba", "Kathua", "Udhampur", "Reasi", "Ramban", "Kishtwar", "Anantnag", "Pulwama", "Shopian", "Shupiyan", "Kulgam", "Ganderbal", "Budgam", "Srinagar", "Baramulla", "Kupwara", "Bandipora"]
};

// States supported for risk prediction (24 states from model training)
export const RISK_PREDICTION_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Jammu And Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Punjab",
  "Sikkim",
  "Tamil Nadu",
  "Tripura",
  "Uttar Pradesh",
  "West Bengal"
];

// Comprehensive crop list (matches your Weather.jsx)
export const CROPS_LIST = [
  // Cereals
  "Rice", "Wheat", "Maize", "Barley", "Oats", "Sorghum",
  // Millets
  "Pearl Millet", "Finger Millet", "Foxtail Millet", "Little Millet", "Kodo Millet", "Barnyard Millet",
  // Cash Crops
  "Cotton", "Sugarcane", "Jute",
  // Oilseeds
  "Groundnut", "Soybean", "Sunflower", "Mustard", "Sesame", "Linseed", "Castor",
  // Pulses
  "Chickpea", "Pigeon Pea", "Green Gram", "Black Gram", "Lentil", "Field Pea",
  // Vegetables
  "Potato", "Onion", "Tomato", "Brinjal", "Chilli", "Capsicum", "Cabbage", 
  "Cauliflower", "Okra", "Carrot", "Radish", "Spinach",
  // Fruits
  "Banana", "Mango", "Apple", "Grapes", "Orange", "Papaya", "Pineapple", "Coconut",
  // Beverages & Others
  "Tea", "Coffee", "Rubber",
  // Spices
  "Turmeric", "Ginger", "Garlic", "Coriander", "Cumin", "Fenugreek", "Clove", 
  "Cardamom", "Arecanut"
];

// Weather condition thresholds
export const WEATHER_THRESHOLDS = {
  HEAVY_RAIN: 60,        // mm
  HIGH_TEMPERATURE: 35,  // °C
  HIGH_HUMIDITY: 85,     // %
  STRONG_WIND: 15,       // km/h
  LOW_TEMPERATURE: 10,   // °C
  EXTREME_HEAT: 40,      // °C
};

// Risk levels
export const RISK_LEVELS = {
  LOW: {
    label: "Low",
    color: "green",
    bgClass: "bg-green-100",
    textClass: "text-green-800",
    borderClass: "border-green-300"
  },
  MEDIUM: {
    label: "Medium",
    color: "yellow",
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-800",
    borderClass: "border-yellow-300"
  },
  HIGH: {
    label: "High",
    color: "red",
    bgClass: "bg-red-100",
    textClass: "text-red-800",
    borderClass: "border-red-300"
  }
};

// Alert types
export const ALERT_TYPES = {
  WARNING: "warning",
  HEAT: "heat",
  HUMIDITY: "humidity",
  WIND: "wind",
  INFO: "info",
  FROST: "frost",
  DROUGHT: "drought"
};

// Weather icons mapping
export const WEATHER_ICONS = {
  "clear sky": "☀️",
  "few clouds": "🌤️",
  "scattered clouds": "⛅",
  "broken clouds": "☁️",
  "overcast clouds": "☁️",
  "shower rain": "🌧️",
  "rain": "🌧️",
  "light rain": "🌦️",
  "moderate rain": "🌧️",
  "heavy intensity rain": "⛈️",
  "thunderstorm": "⛈️",
  "snow": "❄️",
  "mist": "🌫️",
  "fog": "🌫️",
  "haze": "🌫️",
  "default": "🌤️"
};

// Day names
export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Error messages
export const ERROR_MESSAGES = {
  NO_WEATHER_DATA: "Unable to fetch weather data. Please check your location details.",
  NO_ADVISORY_DATA: "Unable to fetch advisory data. Please try again.",
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please fill in all required fields.",
  LOCATION_NOT_FOUND: "Location not found. Please check state and district names."
};

// Success messages
export const SUCCESS_MESSAGES = {
  WEATHER_FETCHED: "Weather data loaded successfully!",
  ADVISORY_FETCHED: "Advisory data loaded successfully!"
};

export default {
  INDIAN_STATES,
  DISTRICTS_BY_STATE,
  CROPS_LIST,
  WEATHER_THRESHOLDS,
  RISK_LEVELS,
  ALERT_TYPES,
  WEATHER_ICONS,
  DAYS_OF_WEEK,
  API_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};