from fastapi import APIRouter
from pydantic import BaseModel
import uuid
import os
import requests
from dotenv import load_dotenv
from datetime import datetime, timedelta
load_dotenv()

from csvLoader import load_crop_csv

chatbot_router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

# ===== MODELS =====
class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    tone: str = "formal"
    button_clicked: bool = False

class ChatResponse(BaseModel):
    reply: str
    session_id: str
    show_buttons: bool = False

# ===== SESSION STORE =====
chat_sessions = {}

# ===== LOAD CSV =====
chat_csv_data = load_crop_csv()
CROP_NAMES = list(chat_csv_data.keys())
SEASONS = ["kharif", "rabi", "summer"]

# ===== TOPIC KEYWORDS =====
TOPIC_KEYWORDS = {
    "crop cultivation": ["cultivation", "grow", "growing", "planting", "plant", "how to grow"],
    "soil management": ["soil", "soil health", "soil quality", "soil fertility"],
    "water management": ["water", "irrigation", "watering", "moisture"],
    "pest control": ["pest", "insect", "disease", "pest control", "insects"],
    "fertilizers": ["fertilizer", "nutrient", "npk", "organic fertilizer", "fertilization"],
    "organic farming": ["organic", "organic farming", "chemical free", "natural"]
}

# ===== AGRICULTURE KEYWORDS =====
AGRI_KEYWORDS = [
    "crop", "soil", "water", "fertilizer", "pesticide", "insect", "disease",
    "organic", "farm", "farming", "agriculture", "seed", "plant", "yield", "harvest", "irrigation",
    "compost", "manure", "npk", "nutrient", "pest", "weed", "fungal", "bacteria",
    "tractor", "equipment", "machinery", "livestock", "cattle", "buffalo", "chicken",
    "scheme", "subsidy", "government", "loan", "market", "price", "commodity", "export",
    "agri", "ranch", "plantation", "monsoon", "season", "climate", "weather",
    "storage", "warehouse", "post-harvest", "sustainable", "eco",
    "dairy", "poultry", "fishery", "apiculture", "greenhouse", "polyhouse", "drip", "micro-irrigation",
    "crop rotation", "intercropping", "monoculture", "food security", "agricultural technology", "agritech",
    "kharif", "rabi", "summer"
] + CROP_NAMES

SARCASM_REPLIES = {
    "not_agri": "That doesn't sound like an agriculture question. Let me help with farming topics instead!"
}

FORMAL_REPLIES = {
    "not_agri": "That's not agriculture-related. Please ask about farming, crops, soil, water, or any agricultural topic."
}

# ===== HELPER FUNCTIONS =====
def is_agri_query(msg: str) -> bool:
    msg = msg.lower()
    if any(k.lower() in msg for k in AGRI_KEYWORDS):
        return True
    if any(crop.lower() in msg for crop in CROP_NAMES):
        return True
    return False

def extract_crop_name(msg: str) -> str:
    msg_lower = msg.lower()
    for crop in CROP_NAMES:
        if crop.lower() in msg_lower:
            return crop
    return None

def detect_topic_from_message(msg: str) -> str:
    msg_lower = msg.lower()
    for topic, keywords in TOPIC_KEYWORDS.items():
        for keyword in keywords:
            if keyword in msg_lower:
                return topic
    return None

def get_brief_crop_advice(crop_name: str, csv_info: dict, tone: str = "formal") -> str:
    advice = f"{crop_name.title()} Cultivation Guide\n\n"
    sections = []
    
    if csv_info.get("soil") and csv_info["soil"] != "nan":
        soil_info = csv_info["soil"]
        soil_points = [s.strip() for s in soil_info.split(",") if s.strip()]
        advice += f"🌍 Soil: {soil_points[0] if soil_points else soil_info}\n"
        sections.append("soil")
    
    if csv_info.get("water") and csv_info["water"] != "nan":
        water_info = csv_info["water"]
        water_points = [w.strip() for w in water_info.split(",") if w.strip()]
        advice += f"💧 Water: {water_points[0] if water_points else water_info}\n"
        sections.append("water")
    
    if csv_info.get("fertilizer") and csv_info["fertilizer"] != "nan":
        fert_info = csv_info["fertilizer"]
        fert_points = [f.strip() for f in fert_info.split(",") if f.strip()]
        advice += f"🧴 Fertilizer: {fert_points[0] if fert_points else fert_info}\n"
        sections.append("fertilizer")
    
    if csv_info.get("pesticide") and csv_info["pesticide"] != "nan":
        pest_info = csv_info["pesticide"]
        pest_points = [p.strip() for p in pest_info.split(",") if p.strip()]
        advice += f"🐛 Pest Control: {pest_points[0] if pest_points else pest_info}\n"
        sections.append("pest")
    
    if csv_info.get("diseases") and csv_info["diseases"] != "nan":
        sections.append("disease")
    
    follow_up = None
    if "pest" in sections:
        follow_up = "Want detailed pest prevention methods for " + crop_name + "?"
    elif "fertilizer" in sections:
        follow_up = "Interested in organic fertilizer options for " + crop_name + "?"
    elif "water" in sections:
        follow_up = "Want to know irrigation techniques for " + crop_name + "?"
    elif "soil" in sections:
        follow_up = "Need tips on improving soil health for " + crop_name + "?"
    elif "disease" in sections:
        follow_up = "Want disease management strategies for " + crop_name + "?"
    else:
        follow_up = "Want more details about " + crop_name + " farming?"
    
    advice += f"\n {follow_up}"
    return advice

def get_soil_advice(crop_name: str, csv_info: dict) -> str:
    advice = f"Soil Requirements for {crop_name.title()}\n\n"
    if csv_info.get("soil") and csv_info["soil"] != "nan":
        soil_info = csv_info["soil"]
        soil_points = [s.strip() for s in soil_info.split(",") if s.strip()]
        if soil_points:
            for point in soil_points:
                advice += f"• {point}\n"
        else:
            advice += f"• {soil_info}\n"
    else:
        advice += "• Well-draining soil is preferred\n"
    return advice

def get_water_advice(crop_name: str, csv_info: dict) -> str:
    advice = f"Water Management for {crop_name.title()}\n\n"
    if csv_info.get("water") and csv_info["water"] != "nan":
        water_info = csv_info["water"]
        water_points = [w.strip() for w in water_info.split(",") if w.strip()]
        if water_points:
            for point in water_points:
                advice += f"• {point}\n"
        else:
            advice += f"• {water_info}\n"
    else:
        advice += "• Regular irrigation is recommended\n"
    return advice

def get_fertilizer_advice(crop_name: str, csv_info: dict) -> str:
    advice = f"Fertilizer Requirements for {crop_name.title()}\n\n"
    if csv_info.get("fertilizer") and csv_info["fertilizer"] != "nan":
        fert_info = csv_info["fertilizer"]
        fert_points = [f.strip() for f in fert_info.split(",") if f.strip()]
        if fert_points:
            for point in fert_points:
                advice += f"• {point}\n"
        else:
            advice += f"• {fert_info}\n"
    else:
        advice += "• Balanced NPK fertilizer is recommended\n"
    return advice

def get_pest_advice(crop_name: str, csv_info: dict) -> str:
    advice = f"Pest & Disease Management for {crop_name.title()}\n\n"
    if csv_info.get("pesticide") and csv_info["pesticide"] != "nan":
        pest_info = csv_info["pesticide"]
        pest_points = [p.strip() for p in pest_info.split(",") if p.strip()]
        if pest_points:
            for point in pest_points:
                advice += f"• {point}\n"
        else:
            advice += f"• {pest_info}\n"
    else:
        advice += "• Regular monitoring for pests is essential\n"
    return advice

def rule_based_response(msg: str, tone: str = "formal") -> str:
    msg_lower = msg.lower()

    for crop, info in chat_csv_data.items():
        if crop.lower() in msg_lower:
            if "soil" in msg_lower:
                advice = get_soil_advice(crop, info)
                follow_up = f"Want more details about {crop} soil management?"
                return advice + f"\n\nRelated Topic: {follow_up}"
            if "water" in msg_lower or "irrigation" in msg_lower:
                advice = get_water_advice(crop, info)
                follow_up = f"Interested in irrigation techniques for {crop}?"
                return advice + f"\n\nRelated Topic: {follow_up}"
            if "fertilizer" in msg_lower or "nutrient" in msg_lower:
                advice = get_fertilizer_advice(crop, info)
                follow_up = f"Want to know about organic fertilizer for {crop}?"
                return advice + f"\n\nRelated Topic: {follow_up}"
            if "pesticide" in msg_lower or "insect" in msg_lower or "pest" in msg_lower or "disease" in msg_lower:
                advice = get_pest_advice(crop, info)
                follow_up = f"Want pest prevention strategies for {crop}?"
                return advice + f"\n\nRelated Topic: {follow_up}"

            return get_brief_crop_advice(crop, info, tone)

    return None

def ai_response(msg: str, history: list, tone: str = "formal") -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "AI service is not configured. Please ask me about specific crops in our database like rice, wheat, tomato, etc."

    history.append({"role": "user", "content": msg})

    if tone == "formal":
       system_prompt = """
            You are an emotionally intelligent, friendly agricultural expert.

            PERSONALITY:
            • Warm, supportive, and conversational
            • Can accept compliments naturally
            • Can clarify misunderstandings
            • Light humor is allowed
            • Not robotic
            • Not overly dramatic

            CONVERSATION RULES:
            1. If user expresses emotion → acknowledge first, then guide.
            2. If user gives a compliment → respond warmly and continue conversation.
            3. If user says “no that’s not what I meant” → ask a clarifying question.
            4. If user sounds confused → ask what exactly they need.
            5. Keep responses natural and human-like (3–6 sentences).
            6. Still prioritize agricultural help.

            You are helpful like a smart farming friend, not a government manual.
            """

    else:
        system_prompt = """You are a sarcastic, witty agricultural expert who makes farming fun! Keep responses brief (3-4 sentences max) but entertaining.

        COMMUNICATION STYLE:
        • Sarcastic and fun with dry humor
        • Playful but still knowledgeable
        • Can accept compliments naturally
        • Can clarify misunderstandings
        • Use casual language and emojis when relevant
        • Make farming sound exciting, not boring
        
        RESPONSE STRUCTURE:
        1. Witty opening that hooks them (1 sentence)
        2. Actual helpful info with personality (1-2 sentences)
        3. Optional sarcastic closing
        
        KNOWLEDGE AREAS:
        ✓ All crop varieties and cultivation
        ✓ Soil science and health
        ✓ Water and irrigation management
        ✓ Fertilizers and nutrients
        ✓ Pest and disease control
        ✓ Organic farming
        ✓ Farm equipment and technology
        
        Be brief, be funny, be helpful. In that order."""

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "system", "content": system_prompt}] + history
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
            
            follow_up = "Want to know more about this topic?"
            if "pest" in msg.lower() or "insect" in msg.lower():
                follow_up = "Want pest prevention tips?"
            elif "water" in msg.lower() or "irrigation" in msg.lower():
                follow_up = "Interested in irrigation systems?"
            elif "fertilizer" in msg.lower() or "nutrient" in msg.lower():
                follow_up = "Want to explore organic alternatives?"
            elif "soil" in msg.lower():
                follow_up = "Need tips on soil health?"
            elif "disease" in msg.lower():
                follow_up = "Want disease management strategies?"
            elif "crop" in msg.lower() or "grow" in msg.lower():
                follow_up = "Want more cultivation tips?"
            elif "yield" in msg.lower() or "productivity" in msg.lower():
                follow_up = "Interested in increasing productivity?"
            elif "harvest" in msg.lower():
                follow_up = "Want post-harvest handling tips?"
            
            return reply + f"\n\nRelated Topic: {follow_up}"
        else:
            return "AI is currently unavailable. Please ask about crops in our database."

    except Exception as e:
        print(f"Error contacting AI service: {str(e)}")
        return "Error contacting AI service. Please ask about crops in our database."

def get_topic_response(topic: str, msg: str, session_id: str, tone: str = "formal") -> str:
    msg_lower = msg.lower()
    
    if topic == "crop cultivation":
        return "🌱 Crop Cultivation\n\nWhich crop would you like to know about?\n\n(e.g., rice, wheat, tomato, potato, cotton, sugarcane, maize, groundnut, etc.)"
    elif topic == "soil management":
        return "🌍 Soil Management\n\nWhich crop's soil requirements would you like to know about?\n\n(e.g., rice, wheat, tomato, potato, cotton, sugarcane, maize, groundnut, etc.)"
    elif topic == "water management":
        return "💧 Water Management\n\nWhich crop's irrigation needs would you like to learn about?\n\n(e.g., rice, wheat, tomato, potato, cotton, sugarcane, maize, groundnut, etc.)"
    elif topic == "pest control":
        return "🐛 Pest Control\n\nWhich crop's pest management would you like to know about?\n\n(e.g., rice, wheat, tomato, potato, cotton, sugarcane, maize, groundnut, etc.)"
    elif topic == "fertilizers":
        return "🧴 Fertilizers & Nutrients\n\nWhich crop's fertilizer requirements would you like to know about?\n\n(e.g., rice, wheat, tomato, potato, cotton, sugarcane, maize, groundnut, etc.)"
    elif topic == "organic farming":
        return "🌿 Organic Farming\n\nWhich crop would you like to know about for organic farming practices?\n\n(e.g., rice, wheat, tomato, potato, cotton, sugarcane, maize, groundnut, etc.)"
    
    return None

def get_chatbot_response(msg: str, session_id: str, tone: str = "formal") -> tuple[str, str, bool]:
    """Returns (response, session_id, show_buttons)"""

     # ===== SESSION INITIALIZATION =====
    if session_id not in chat_sessions:
        chat_sessions[session_id] = {
            "history": [], 
            "visited": False,
            "button_clicked": False,
            "last_crop": None, 
            "last_topic": None,
            "last_bot_message": None,
            "cooldown_until": None,
            "current_topic": None
        }

    session = chat_sessions[session_id]
    msg_lower = msg.lower()
    show_buttons = False

    # ===== CLARIFICATION HANDLING =====
    if is_clarification(msg):
        response = (
            "Ohhh I see — thanks for clarifying 😊\n\n"
            "Can you tell me exactly what you're facing so I can help better?"
        )
        session["last_bot_message"] = response
        return response, session_id, False

    if not session["button_clicked"]:
        if not session["visited"]:
            session["visited"] = True
            response = "🌾 Which crop would you like to know about?\n\n(e.g., rice, wheat, tomato, potato, cotton, sugarcane, maize, groundnut, etc.)\n\nAnd which season? (Kharif, Rabi, or Summer)"
            session["last_bot_message"] = response
            return response, session_id, False
        
        msg_lower = msg.lower()
        greeting_keywords = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening", "howdy", "hola"]
        is_greeting = any(keyword in msg_lower for keyword in greeting_keywords)
        
        if is_greeting:
            if tone == "formal":
                greeting_response = "Hello! 👋 Welcome to AgriShield, your agricultural assistant.\n\n🤖 Select a topic to get started:\n\n[🌱 Crop Cultivation] [🌍 Soil Management]\n[💧 Water Management] [🐛 Pest Control]\n[🧴 Fertilizers] [🌿 Organic Farming]"
            else:
                greeting_response = "Hey there! 👋 Welcome to AgriShield - where we help you grow stuff without killing it! 🌾\n\n🤖 Select a topic to get started:\n\n[🌱 Crop Cultivation] [🌍 Soil Management]\n[💧 Water Management] [🐛 Pest Control]\n[🧴 Fertilizers] [🌿 Organic Farming]"
            session["last_bot_message"] = greeting_response
            return greeting_response, session_id, False
        
        button_response = "🤖 Select a topic to get started:\n\n[🌱 Crop Cultivation] [🌍 Soil Management]\n[💧 Water Management] [🐛 Pest Control]\n[🧴 Fertilizers] [🌿 Organic Farming]\n\nOr tell me which crop you'd like to learn about!"
        session["last_bot_message"] = button_response
        return button_response, session_id, False

    msg_lower = msg.lower()
    
    # ===== COOLDOWN CHECK =====
    if session.get("cooldown_until"):
        now = datetime.now()
        cooldown_time = session["cooldown_until"]
        
        if now < cooldown_time:
            remaining = cooldown_time - now
            remaining_seconds = int(remaining.total_seconds())
            remaining_minutes = remaining_seconds // 60
            remaining_secs = remaining_seconds % 60
            
            cooldown_msg = f"⏳ Please wait {remaining_minutes}m {remaining_secs}s before asking another question.\n\n🤖 Select a topic to explore:\n\n[🌱 Crop Cultivation] [🌍 Soil Management]\n[💧 Water Management] [🐛 Pest Control]\n[🧴 Fertilizers] [🌿 Organic Farming]"
            session["last_bot_message"] = cooldown_msg
            return cooldown_msg, session_id, False
        else:
            session["cooldown_until"] = None
    
    # ===== CHECK IF USER CLICKED A TOPIC BUTTON =====
    # Topics that can be selected
    topic_options = ["crop cultivation", "soil management", "water management", "pest control", "fertilizers", "organic farming"]
    user_selected_topic = None
    
    for topic in topic_options:
        if topic.lower() == msg_lower:
            user_selected_topic = topic
            break
    
    # If user selected a topic button, ask which crop and season
    if user_selected_topic:
        session["current_topic"] = user_selected_topic
        session["last_crop"] = None
        session["last_topic"] = None
        topic_response = get_topic_response(user_selected_topic, msg, session_id, tone)
        session["last_bot_message"] = topic_response
        return topic_response, session_id, False
    
    # ===== NEGATIVE RESPONSE HANDLER (FIX) =====
    negative_keywords = ["no", "nope", "nah", "don't", "dont", "not interested", "skip", "maybe later", "later"]
    is_negative = any(keyword in msg_lower for keyword in negative_keywords)
    
    if is_negative and session.get("last_bot_message"):
        # CHECK FOR FOLLOW-UP QUESTION FIRST (before topic detection)
        last_msg = session.get("last_bot_message", "")
        
        if "Related Topic:" in last_msg:
            # User said no to follow-up - show topic buttons WITHOUT asking crop/season
            session["last_crop"] = None
            session["last_topic"] = None
            # DO NOT reset button_clicked - keep it True so we stay in main flow
            
            # Return topic buttons directly (NOT crop/season prompt)
            if tone == "formal":
                options_response = "🤖 Select a topic to explore:\n\n[🌱 Crop Cultivation] [🌍 Soil Management]\n[💧 Water Management] [🐛 Pest Control]\n[🧴 Fertilizers] [🌿 Organic Farming]"
            else:
                options_response = "No problem! Let's explore something else.\n\n🤖 Select a topic:\n\n[🌱 Crop Cultivation] [🌍 Soil Management]\n[💧 Water Management] [🐛 Pest Control]\n[🧴 Fertilizers] [🌿 Organic Farming]"
            
            session["last_bot_message"] = options_response
            return options_response, session_id, True
        else:
            # No follow-up question, check for topic keywords
            detected_topic = detect_topic_from_message(msg)
            
            if detected_topic:
                session["current_topic"] = detected_topic
                topic_response = get_topic_response(detected_topic, msg, session_id, tone)
                session["last_bot_message"] = topic_response
                return topic_response, session_id, False
            else:
                # Regular no response
                session["cooldown_until"] = datetime.now() + timedelta(minutes=2)
                
                if tone == "formal":
                    no_response = "Understood! Feel free to explore other topics or come back later."
                else:
                    no_response = "No problem! Come back when you need us. 😊"
                
                session["last_bot_message"] = no_response
                return no_response, session_id, True
    
    # ===== AFFIRMATIVE RESPONSE HANDLER =====
    affirmative_keywords = ["yes", "yeah", "yep", "ok", "okay", "sure", "please", "definitely", "absolutely"]
    is_affirmative = any(keyword in msg_lower for keyword in affirmative_keywords)
    
    if is_affirmative and session.get("last_bot_message"):
        last_msg = session["last_bot_message"]
        last_crop = session.get("last_crop")
        
        if "Related Topic:" in last_msg and last_crop and last_crop in chat_csv_data:
            question_part = last_msg.split("Related Topic:")[1].strip()
            csv_info = chat_csv_data[last_crop]
            detailed_response = None
            new_follow_up = None
            
            if "pest prevention" in question_part.lower() or ("pest" in question_part.lower() and "management" not in question_part.lower()):
                detailed_response = get_pest_advice(last_crop, csv_info)
                new_follow_up = f"Want disease management details for {last_crop}?"
            elif "disease" in question_part.lower():
                detailed_response = get_pest_advice(last_crop, csv_info)
                new_follow_up = f"Want organic pest control methods for {last_crop}?"
            elif "irrigation" in question_part.lower() or "water" in question_part.lower():
                detailed_response = get_water_advice(last_crop, csv_info)
                new_follow_up = f"Want soil management tips for {last_crop}?"
            elif "soil" in question_part.lower():
                detailed_response = get_soil_advice(last_crop, csv_info)
                new_follow_up = f"Want water management tips for {last_crop}?"
            elif "fertilizer" in question_part.lower() or "organic" in question_part.lower():
                detailed_response = get_fertilizer_advice(last_crop, csv_info)
                new_follow_up = f"Want pest prevention strategies for {last_crop}?"
            else:
                detailed_response = get_brief_crop_advice(last_crop, csv_info, tone)
                new_follow_up = f"Want more details about {last_crop}?"
            
            if detailed_response and new_follow_up:
                full_response = detailed_response + f"\n\nRelated Topic: {new_follow_up}"
                session["last_bot_message"] = full_response
                return full_response, session_id, False

    # ===== AGRICULTURE CHECK =====
    if not is_affirmative and not is_negative and not is_agri_query(msg):
        not_agri_msg = FORMAL_REPLIES["not_agri"] if tone == "formal" else SARCASM_REPLIES["not_agri"]
        session["last_bot_message"] = not_agri_msg
        return not_agri_msg, session_id, False

    crop_found = extract_crop_name(msg)
    if crop_found:
        session["last_crop"] = crop_found

    csv_reply = rule_based_response(msg, tone)
    if csv_reply:
        if "pest" in msg_lower or "disease" in msg_lower:
            session["last_topic"] = "pest"
        elif "water" in msg_lower or "irrigation" in msg_lower:
            session["last_topic"] = "water"
        elif "fertilizer" in msg_lower or "nutrient" in msg_lower or "npk" in msg_lower:
            session["last_topic"] = "fertilizer"
        elif "soil" in msg_lower:
            session["last_topic"] = "soil"
        elif "organic" in msg_lower:
            session["last_topic"] = "organic"
        else:
            session["last_topic"] = "general"
        
        session["last_bot_message"] = csv_reply
        return csv_reply, session_id, False

    ai_reply = ai_response(msg, session["history"], tone)
    session["last_bot_message"] = ai_reply
    return ai_reply, session_id, False

def is_clarification(msg: str):
    phrases = [
        "that's not what i meant",
        "you don't understand",
        "not what i said",
        "no that's wrong",
        "i meant",
        "let me explain"
    ]
    msg_lower = msg.lower()
    return any(p in msg_lower for p in phrases)

def is_compliment(msg: str):
    compliments = [
        "good job",
        "good",
        "superb",
        "very well done",
        "you're helpful",
        "thank you",
        "thanks",
        "you're smart",
        "great bot"
    ]
    msg_lower = msg.lower()
    return any(c in msg_lower for c in compliments)

# ===== API ENDPOINT =====
@chatbot_router.post("/", response_model=ChatResponse)
def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())
    
    # --- Initialize session if button clicked ---
    if req.button_clicked and session_id in chat_sessions:
        chat_sessions[session_id]["button_clicked"] = True
    elif req.button_clicked:
        if session_id not in chat_sessions:
            chat_sessions[session_id] = {
                "history": [], 
                "visited": False,
                "button_clicked": True,
                "last_crop": None, 
                "last_topic": None,
                "last_bot_message": None,
                "cooldown_until": None,
                "current_topic": None
            }
        else:
            chat_sessions[session_id]["button_clicked"] = True
    
    # --- COMPLIMENT HANDLER ---
    if is_compliment(req.message):
        response = (
            "That really means a lot — thank you! 😊🌾\n\n"
            "I'm here anytime you need help. What would you like to explore next?"
        )
        if session_id not in chat_sessions:
            chat_sessions[session_id] = {
                "history": [],
                "visited": False,
                "button_clicked": False,
                "last_crop": None,
                "last_topic": None,
                "last_bot_message": response,
                "cooldown_until": None,
                "current_topic": None
            }
        else:
            chat_sessions[session_id]["last_bot_message"] = response
        
        # Immediately return without calling normal chatbot logic
        return {"reply": response, "session_id": session_id, "show_buttons": False}
    
    # --- NORMAL CHATBOT FLOW ---
    reply, _, show_buttons = get_chatbot_response(req.message, session_id, req.tone)
    
    if "What would you like to know about" in reply:
        if session_id in chat_sessions:
            chat_sessions[session_id]["button_clicked"] = False
    
    return {"reply": reply, "session_id": session_id, "show_buttons": show_buttons}
