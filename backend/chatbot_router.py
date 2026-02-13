from fastapi import APIRouter
from pydantic import BaseModel
import uuid
import os
import requests
from dotenv import load_dotenv
load_dotenv()

from csvLoader import load_crop_csv

chatbot_router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

# -----------------------------
# Models
# -----------------------------
class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None

class ChatResponse(BaseModel):
    reply: str
    session_id: str

# -----------------------------
# Session Store
# -----------------------------
chat_sessions = {}

# -----------------------------
# Load CSV ONCE
# -----------------------------
chat_csv_data = load_crop_csv()

# -----------------------------
# Keywords
# -----------------------------
AGRI_KEYWORDS = [
    "crop", "soil", "water", "fertilizer",
    "pesticide", "insect", "disease",
    "organic", "farm", "farming", "agriculture",
    "seed", "plant", "yield", "harvest", "irrigation",
    "compost", "manure", "npk", "nutrient",
    "pest", "weed", "fungal", "bacteria",
    "tractor", "equipment", "machinery",
    "livestock", "cattle", "buffalo", "chicken",
    "scheme", "subsidy", "government", "loan",
    "market", "price", "commodity", "export",
    "agri", "farming", "ranch", "plantation",
    "monsoon", "season", "climate", "weather",
    "storage", "warehouse", "post-harvest",
    "organic farming", "sustainable", "eco",
    "product", "brand", "fertiliser", "pesticide brand",
    "dairy", "poultry", "fishery", "apiculture",
    "greenhouse", "polyhouse", "drip", "micro-irrigation",
    "crop rotation", "intercropping", "monoculture",
    "food security", "agricultural technology", "agritech"
]

# -----------------------------
# Helpers
# -----------------------------
def is_agri_query(msg: str) -> bool:
    msg = msg.lower()
    return any(k in msg for k in AGRI_KEYWORDS)

def get_detailed_crop_advice(crop_name: str, csv_info: dict) -> str:
    """
    Generate detailed point-wise advice for a crop
    """
    advice = f"Detailed Cultivation Guide for {crop_name.title()}\n\n"
    
    # Environment Conditions
    advice += f"• Environment Conditions\n"
    if csv_info.get("note") and csv_info["note"] != "nan":
        advice += f"  ◦ {csv_info['note']}\n"
    else:
        advice += "  ◦ General farming conditions apply\n"
    advice += "\n"
    
    # Soil Conditions
    advice += f"• Soil Requirements\n"
    if csv_info.get("soil") and csv_info["soil"] != "nan":
        soil_info = csv_info["soil"]
        soil_points = [s.strip() for s in soil_info.split(",") if s.strip()]
        if soil_points:
            for point in soil_points:
                advice += f"  ◦ {point}\n"
        else:
            advice += f"  ◦ {soil_info}\n"
    else:
        advice += "  ◦ Well-draining soil preferred\n"
    advice += "\n"
    
    # Water Management
    advice += f"• Water Management\n"
    if csv_info.get("water") and csv_info["water"] != "nan":
        water_info = csv_info["water"]
        water_points = [w.strip() for w in water_info.split(",") if w.strip()]
        if water_points:
            for point in water_points:
                advice += f"  ◦ {point}\n"
        else:
            advice += f"  ◦ {water_info}\n"
    else:
        advice += "  ◦ Regular irrigation recommended\n"
    advice += "\n"
    
    # Fertilizer Requirements
    advice += f"• Fertilizer Requirements\n"
    if csv_info.get("fertilizer") and csv_info["fertilizer"] != "nan":
        fert_info = csv_info["fertilizer"]
        fert_points = [f.strip() for f in fert_info.split(",") if f.strip()]
        if fert_points:
            for point in fert_points:
                advice += f"  ◦ {point}\n"
        else:
            advice += f"  ◦ {fert_info}\n"
    else:
        advice += "  ◦ Balanced NPK fertilizer recommended\n"
    advice += "\n"
    
    # Pest & Disease Control
    advice += f"• Pest & Disease Management\n"
    if csv_info.get("pesticide") and csv_info["pesticide"] != "nan":
        pest_info = csv_info["pesticide"]
        pest_points = [p.strip() for p in pest_info.split(",") if p.strip()]
        if pest_points:
            for point in pest_points:
                advice += f"  ◦ {point}\n"
        else:
            advice += f"  ◦ {pest_info}\n"
    else:
        advice += "  ◦ Regular monitoring for pests is essential\n"
    advice += "\n"
    
    # Organic Farming Tips
    advice += f"• Organic Farming Tips\n"
    if csv_info.get("organic_tips") and csv_info["organic_tips"] != "nan":
        organic_info = csv_info["organic_tips"]
        organic_points = [o.strip() for o in organic_info.split(",") if o.strip()]
        if organic_points:
            for point in organic_points:
                advice += f"  ◦ {point}\n"
        else:
            advice += f"  ◦ {organic_info}\n"
    else:
        advice += "  ◦ Use compost and natural manure\n"
    advice += "\n"
    
    # Disease Information
    advice += f"• Common Diseases\n"
    if csv_info.get("diseases") and csv_info["diseases"] != "nan":
        disease_info = csv_info["diseases"]
        disease_points = [d.strip() for d in disease_info.split(",") if d.strip()]
        if disease_points:
            for point in disease_points:
                advice += f"  ◦ {point}\n"
        else:
            advice += f"  ◦ {disease_info}\n"
    else:
        advice += "  ◦ Maintain proper field hygiene\n"
    
    return advice

def get_soil_advice(crop_name: str, csv_info: dict) -> str:
    """
    Get only soil requirements for a crop
    """
    advice = f"<h2>Soil Requirements for {crop_name.title()}</h2>\n"
    if csv_info.get("soil") and csv_info["soil"] != "nan":
        soil_info = csv_info["soil"]
        soil_points = [s.strip() for s in soil_info.split(",") if s.strip()]
        if soil_points:
            for point in soil_points:
                advice += f"  ◦ {point}\n"
        else:
            advice += f"  ◦ {soil_info}\n"
    else:
        advice += "  ◦ Well-draining soil is preferred\n"
    return advice

def get_water_advice(crop_name: str, csv_info: dict) -> str:
    """
    Get only water management for a crop
    """
    advice = f"• Water Management for {crop_name.title()}\n\n"
    if csv_info.get("water") and csv_info["water"] != "nan":
        water_info = csv_info["water"]
        water_points = [w.strip() for w in water_info.split(",") if w.strip()]
        if water_points:
            for point in water_points:
                advice += f"  ◦ {point}\n"
        else:
            advice += f"  ◦ {water_info}\n"
    else:
        advice += "  ◦ Regular irrigation is recommended\n"
    return advice

def get_fertilizer_advice(crop_name: str, csv_info: dict) -> str:
    """
    Get only fertilizer requirements for a crop
    """
    advice = f"• Fertilizer Requirements for {crop_name.title()}\n\n"
    if csv_info.get("fertilizer") and csv_info["fertilizer"] != "nan":
        fert_info = csv_info["fertilizer"]
        fert_points = [f.strip() for f in fert_info.split(",") if f.strip()]
        if fert_points:
            for point in fert_points:
                advice += f"  ◦ {point}\n"
        else:
            advice += f"  ◦ {fert_info}\n"
    else:
        advice += "  ◦ Balanced NPK fertilizer is recommended\n"
    return advice

def get_pest_advice(crop_name: str, csv_info: dict) -> str:
    """
    Get only pest & disease management for a crop
    """
    advice = f"• Pest & Disease Management for {crop_name.title()}\n\n"
    if csv_info.get("pesticide") and csv_info["pesticide"] != "nan":
        pest_info = csv_info["pesticide"]
        pest_points = [p.strip() for p in pest_info.split(",") if p.strip()]
        if pest_points:
            for point in pest_points:
                advice += f"  ◦ {point}\n"
        else:
            advice += f"  ◦ {pest_info}\n"
    else:
        advice += "  ◦ Regular monitoring for pests is essential\n"
    return advice

def get_organic_advice(crop_name: str, csv_info: dict) -> str:
    """
    Get only organic farming tips for a crop
    """
    advice = f"• Organic Farming Tips for {crop_name.title()}\n\n"
    if csv_info.get("organic_tips") and csv_info["organic_tips"] != "nan":
        organic_info = csv_info["organic_tips"]
        organic_points = [o.strip() for o in organic_info.split(",") if o.strip()]
        if organic_points:
            for point in organic_points:
                advice += f"  ◦ {point}\n"
        else:
            advice += f"  ◦ {organic_info}\n"
    else:
        advice += "  ◦ Use compost and natural manure\n"
    return advice

def get_disease_advice(crop_name: str, csv_info: dict) -> str:
    """
    Get only disease information for a crop
    """
    advice = f"• Common Diseases for {crop_name.title()}\n\n"
    if csv_info.get("diseases") and csv_info["diseases"] != "nan":
        disease_info = csv_info["diseases"]
        disease_points = [d.strip() for d in disease_info.split(",") if d.strip()]
        if disease_points:
            for point in disease_points:
                advice += f"  ◦ {point}\n"
        else:
            advice += f"  ◦ {disease_info}\n"
    else:
        advice += "  ◦ Maintain proper field hygiene\n"
    return advice

def rule_based_response(msg: str):
    msg_lower = msg.lower()

    # Check if user is asking for crop advice (general or specific)
    for crop, info in chat_csv_data.items():
        if crop in msg_lower:
            # Specific queries for individual aspects
            if "soil" in msg_lower:
                return get_soil_advice(crop, info)
            if "water" in msg_lower:
                return get_water_advice(crop, info)
            if "fertilizer" in msg_lower:
                return get_fertilizer_advice(crop, info)
            if "pesticide" in msg_lower or "insect" in msg_lower or "pest" in msg_lower:
                return get_pest_advice(crop, info)
            if "organic" in msg_lower:
                return get_organic_advice(crop, info)
            if "disease" in msg_lower:
                return get_disease_advice(crop, info)

            # If asking for general advice, provide detailed guide
            if any(keyword in msg_lower for keyword in ["advice", "guide", "how to grow", "cultivation", "farming", "tips", "details", "information"]):
                return get_detailed_crop_advice(crop, info)

            # Default: provide detailed guide if crop is mentioned
            return get_detailed_crop_advice(crop, info)

    return None

def ai_response(msg: str, history: list):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "AI service is not configured."

    history.append({"role": "user", "content": msg})

    # Enhanced system prompt for detailed responses
    system_prompt = """You are a professional agricultural expert with a direct, no-nonsense communication style. You provide expert guidance without being overly polite or condescending.

    COMMUNICATION STYLE:
    • Professional and knowledgeable - speak with authority
    • Direct and straightforward - get to the point efficiently
    • Engage with a subtle wit and dry humor when appropriate
    • Neutral sassy tone - confident without being rude or cheesy
    • Practical and results-oriented
    • Example tone: "That approach won't work", "Here's what actually matters", "Let me be direct with you"
    • No excessive friendliness or slang - keep it dignified but real
    
    RESPONSE STRUCTURE:
    1. Start with a brief engaging paragraph that explains the context or importance
    2. Follow with point-by-point breakdown using clear formatting
    3. Be specific and actionable - farmers need real solutions
    
    COMPREHENSIVE KNOWLEDGE AREAS:
    ✓ All crop varieties and cultivation methods
    ✓ Soil science and soil health management
    ✓ Water management and irrigation
    ✓ Fertilizers and nutrient management (with specific product recommendations)
    ✓ Integrated Pest Management (IPM) and disease control
    ✓ Farm equipment and agricultural technology
    ✓ Organic farming and certification
    ✓ Crop rotation and sustainable practices
    ✓ Government schemes and subsidies
    ✓ Market trends and agricultural commodities
    ✓ Post-harvest management and storage
    ✓ Livestock and dairy farming
    ✓ Climate-smart agriculture
    
    RESPONSE FORMAT for detailed queries:
    [Engaging introductory paragraph explaining why this matters]
    
    • Main Point 1
      - Sub-point 1
      - Sub-point 2
    • Main Point 2
      - Sub-point 1
    
    Use bold formatting for headings when appropriate. Be concise but thorough."""

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            }
        ] + history
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    try:
        r = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=20
        )

        if r.status_code == 200:
            reply = r.json()["choices"][0]["message"]["content"]
            history.append({"role": "assistant", "content": reply})
            return reply
        else:
            print(f"GROQ API error: {r.status_code} - {r.text}")
            return "AI is currently unavailable."

    except Exception as e:
        print(f"Error contacting AI service: {str(e)}")
        return "Error contacting AI service."

def get_chatbot_response(msg: str, session_id: str):
    if session_id not in chat_sessions:
        chat_sessions[session_id] = {"history": [], "visited": False}

    session = chat_sessions[session_id]

    if not session["visited"]:
        session["visited"] = True
        return (
            "Welcome to AgriShield\n\n"
            "I provide comprehensive agricultural guidance covering:\n\n"
            "   • Crop cultivation and management\n"
            "   • Soil health and optimization\n"
            "   • Water management and irrigation\n"
            "   • Fertilizer and nutrient management\n"
            "   • Pest and disease control\n"
            "   • Organic farming practices\n"
            "   • Farm equipment and technology\n"
            "   • Government schemes and subsidies\n"
            "   • Market analysis and commodities\n"
            "   • Livestock and dairy farming\n"
            "   • Post-harvest management\n\n"
            "Ask me anything agriculture-related and I'll provide detailed, actionable guidance."
        )

    if not is_agri_query(msg):
        return "That's not an agriculture question. I handle farming, crops, soil, and related topics. Keep it relevant and I'll give you solid answers."

    csv_reply = rule_based_response(msg)
    if csv_reply:
        return csv_reply

    # Try AI if API key exists
    ai_reply = ai_response(msg, session["history"])
    if "AI service is not configured." in ai_reply:
        return "My extended services are temporarily down, but I have comprehensive agricultural knowledge. Ask your farming question and I'll handle it."
    
    return ai_reply


# -----------------------------
# API Endpoint
# -----------------------------
@chatbot_router.post("/", response_model=ChatResponse)
def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())
    reply = get_chatbot_response(req.message, session_id)
    return {"reply": reply, "session_id": session_id}