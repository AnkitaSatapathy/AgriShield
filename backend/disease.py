from fastapi import APIRouter, File, UploadFile, HTTPException
from PIL import Image
import numpy as np
import tensorflow as tf
import io
import json

router = APIRouter(
    prefix="/api",
    tags=["Disease Detection"]
)

# Load model once
model = tf.keras.models.load_model("../models/best_cpu_model.keras")

# ✅ Load class indices dynamically (MATCHES TRAINED MODEL)
with open("../models/class_indices.json", "r") as f:
    class_indices = json.load(f)

CLASS_NAMES = {v: k for k, v in class_indices.items()}

# Comprehensive disease information with descriptions and treatments
DISEASE_INFO = {
    "Pepper__bell___Bacterial_spot": {
        "description": "Bacterial spot is caused by Xanthomonas bacteria and is one of the most destructive pepper diseases. It causes water-soaked lesions on leaves that turn brown with yellow halos, raised scab-like spots on fruits, and severe defoliation. The disease thrives in warm (75-86°F), wet conditions and spreads rapidly through rain splash and contaminated tools.",
        "treatment": "Remove infected leaves immediately. Apply copper-based bactericides (copper hydroxide) every 7-10 days. Use disease-free certified seeds - treat seeds by soaking in 10% bleach solution for 2 minutes. Space plants 18-24 inches apart for air circulation. Avoid overhead watering - use drip irrigation. Disinfect all tools with bleach solution. Rotate crops for 3-4 years away from peppers, tomatoes, eggplants. Control solanaceous weeds like nightshade."
    },
    "Pepper__bell___healthy": {
        "description": "Your pepper plant is healthy and showing no signs of disease! The leaves are vibrant, growth is strong, and there are no visible lesions, spots, or discoloration.",
        "treatment": "Continue excellent care practices: Water deeply at the base of plants (not overhead). Apply balanced fertilizer every 2-3 weeks. Monitor plants weekly for any early signs of pests or disease. Maintain 18-24 inch spacing between plants. Remove yellowing leaves promptly. Mulch around base to retain moisture and prevent soil splash. Keep garden tools clean and sterilized."
    },
    "Potato___Early_blight": {
        "description": "Early blight is caused by the Alternaria solani fungus and is one of the most common potato and tomato diseases. It starts on lower, older leaves as small brown spots with distinctive target-like concentric rings (bull's-eye pattern). Surrounding tissue turns yellow, leaves die and drop off. Can cause significant defoliation and sun scalding of tubers. Thrives in warm (75-85°F), humid conditions.",
        "treatment": "Remove and destroy infected lower leaves immediately (can remove up to 1/3 of plant leaves). Apply fungicide containing chlorothalonil or copper every 7-10 days. Mulch heavily with straw or wood chips to prevent soil splash onto leaves. Water at soil level only - avoid wetting foliage. Rotate crops every 2-3 years with non-solanaceous plants. Space plants adequately for air circulation. Remove all crop debris at season end."
    },
     "Potato___healthy": {
        "description": "Excellent! Your potato plant is in perfect health with no disease symptoms. The foliage is green and vigorous, showing strong growth patterns.",
        "treatment": "Maintain current care: Hill soil around plants as they grow (prevents tuber greening). Water deeply once or twice weekly (1-2 inches total). Don't overwater - potatoes need well-drained soil. Apply balanced fertilizer when plants are 6 inches tall. Monitor weekly for Colorado potato beetles and disease signs. Mulch to conserve moisture. Harvest when plants begin to yellow naturally."
    },
    "Potato___Late_blight": {
        "description": "Late blight is a devastating disease caused by Phytophthora infestans - the same pathogen that caused the Irish Potato Famine. It can destroy entire crops within days. Symptoms include irregularly shaped, water-soaked lesions with light green halos, white cottony fungal growth on leaf undersides, brown shriveled leaves and stems, and firm brown rot on tubers. Thrives in cool (60-70°F), wet weather with high humidity above 90%.",
        "treatment": "IMMEDIATE ACTION REQUIRED: Remove and destroy all infected plants immediately (do not compost). Apply fungicide (chlorothalonil or mancozeb) every 5-7 days preventively in wet weather. Improve air circulation - increase plant spacing. Never work with wet plants. Avoid overhead watering completely. Hill soil to prevent spores reaching tubers. Apply copper fungicides preventively. Plant resistant varieties if available. Harvest healthy tubers quickly before disease spreads. Destroy all infected debris - do not leave in garden."
    },
    "Tomato__Target_Spot": {
        "description": "Target spot is a fungal disease causing concentric ring lesions (target-like patterns) on leaves and fruits. It thrives in warm, humid conditions and can cause significant defoliation, reducing plant vigor and exposing fruits to sun damage.",
        "treatment": "Remove affected leaves immediately. Apply fungicides containing chlorothalonil or mancozeb every 7-10 days. Space plants 24-36 inches apart for maximum air circulation. Use drip irrigation or soaker hoses - never overhead watering. Mulch around plants to prevent soil splash. Prune lower leaves as plant grows. Remove all plant debris at end of season. Rotate crops annually. Stake or cage plants to improve airflow."
    },
    "Tomato__Tomato_mosaic_virus": {
        "description": "Tomato Mosaic Virus (ToMV) is a highly persistent viral disease with no cure. It causes distinctive mottled light and dark green mosaic patterns on leaves, leaf curling and distortion, stunted plant growth, and reduced fruit size. The virus spreads mechanically through contaminated tools, hands, and clothing, and can survive in plant debris and soil for extended periods. It's extremely contagious.",
        "treatment": "NO CURE - Remove and destroy infected plants immediately (burn or trash, never compost). Wash hands thoroughly with soap before handling healthy plants. Sterilize all pruning tools between plants using 10% bleach solution (1 part bleach to 9 parts water). Control aphid vectors with neem oil or insecticidal soap. Plant only certified virus-free seeds and transplants. Use virus-resistant tomato varieties. Remove solanaceous weeds that can harbor the virus. Clean greenhouse thoroughly between crops."
    },
    "Tomato__Tomato_YellowLeaf__Curl_Virus": {
        "description": "Tomato Yellow Leaf Curl Virus (TYLCV) is transmitted exclusively by whiteflies (Bemisia tabaci). It causes severe upward leaf curling, yellowing between veins, stunted plant growth, and significantly reduced fruit production. Plants infected early may produce almost no fruit. This is one of the most economically damaging tomato diseases worldwide.",
        "treatment": "Remove and destroy infected plants to prevent whitefly spread. Control whiteflies aggressively: spray with insecticidal soap, neem oil, or horticultural oil every 5-7 days. Use yellow sticky traps to monitor and catch whiteflies. Apply reflective silver mulches to deter whiteflies from landing. Plant virus-resistant tomato varieties (look for TYLCV resistance). Use insect screening in greenhouses (mesh smaller than 50x50). Remove infected plants and solanaceous weeds within 100 feet. Plant tomatoes away from previous infected areas. Time planting to avoid peak whitefly populations."
    },
    "Tomato_Bacterial_spot": {
        "description": "Bacterial spot affects tomatoes similarly to peppers, caused by Xanthomonas species. It creates small, dark, water-soaked spots on leaves with yellow halos, raised spots on fruits, and can cause severe defoliation. Thrives in warm (75-86°F), humid conditions and spreads through water splash and contaminated equipment.",
        "treatment": "Apply copper-based bactericide (copper hydroxide) at first sign of disease and continue every 7-10 days. Remove infected leaves immediately. Use certified disease-free seeds or treat seeds in hot water (122°F for 25 minutes) or 10% bleach for 1 minute. Space plants 18-24 inches apart. Use only drip irrigation - avoid getting leaves wet. Never work with plants when wet. Disinfect tools between plants (10% bleach solution). Rotate away from tomatoes, peppers, eggplants for 3 years. Remove volunteer tomato plants. Mulch to prevent soil splash. Plant resistant varieties when available."
    },
    "Tomato_Early_blight": {
        "description": "Early blight is caused by Alternaria solani fungus and typically appears after first fruits form. It starts on lower leaves as small brown spots that develop distinctive concentric rings (target pattern) with yellow halos. The disease progresses upward, causing leaves to yellow, wither, and drop. Severe defoliation exposes fruits to sun scald. Thrives in warm (75-85°F) temperatures with alternating wet and dry periods.",
        "treatment": "Remove and destroy infected lower leaves (up to 1/3 of plant). Apply fungicide containing chlorothalonil, mancozeb, or copper every 7-10 days. Start fungicide applications preventively before symptoms appear if disease occurred previously. Mulch heavily around plants with straw or wood chips to prevent soil splash. Water only at soil level using drip irrigation or soaker hoses. Stake or cage tomatoes to keep leaves off ground. Space plants 24-36 inches apart. Remove all plant debris at season end. Rotate crops every 2-3 years. Plant resistant varieties like 'Mountain Magic', 'Iron Lady', or 'Defiant PHR'. Maintain good fertility but avoid excess nitrogen."
    },
    "Tomato_healthy": {
        "description": "Perfect! Your tomato plant is thriving with no disease symptoms. The foliage is vibrant green, growth is strong and vigorous, and fruits are developing normally.",
        "treatment": "Continue your excellent care routine: Water deeply 1-2 times weekly (1-1.5 inches total). Water at base of plant, not on foliage. Apply balanced fertilizer or compost every 2-3 weeks. Prune suckers on indeterminate varieties. Stake or cage plants for support. Mulch around plants to conserve moisture and prevent soil-borne diseases. Monitor weekly for early signs of pests or disease. Remove yellowing lower leaves. Ensure good air circulation. Practice crop rotation annually."
    },
    "Tomato_Late_blight": {
        "description": "Late blight is caused by Phytophthora infestans - the same pathogen that caused the Irish Potato Famine. This is extremely serious and can destroy entire tomato crops within 5-7 days. Symptoms include irregular, water-soaked lesions with pale green halos, white fuzzy fungal growth on leaf undersides, rapidly browning and dying foliage, and firm brown rot on fruits. Thrives in cool (60-70°F), wet, humid conditions above 90% humidity.",
        "treatment": "EMERGENCY ACTION: Remove entire infected plants immediately and destroy (burn or trash - never compost). Apply fungicide (chlorothalonil, mancozeb, or copper) every 5-7 days in wet weather - start BEFORE symptoms if late blight is in your area. Never let leaves get wet - use only drip irrigation. Dramatically increase plant spacing for air flow. Avoid working with wet plants entirely. Harvest unaffected fruits immediately. Remove all solanaceous weeds. Don't plant tomatoes near potatoes. Use resistant varieties like 'Mountain Magic', 'Defiant', 'Iron Lady'. Monitor weather - late blight spreads rapidly when night temperatures stay above 50°F with high humidity. Clean up ALL plant debris immediately."
    },
    "Tomato_Leaf_Mold": {
        "description": "Leaf mold is caused by the Passalora fulva fungus and is most common in greenhouses and high tunnels. It creates pale green to yellow spots on upper leaf surfaces with distinctive olive-green to gray fuzzy mold growth on undersides. Leaves curl, wither and die. Thrives when humidity exceeds 85% with poor air circulation and temperatures of 70-80°F.",
        "treatment": "Reduce humidity below 85% - this is critical. Increase ventilation dramatically: open greenhouse vents, use fans, space plants farther apart (30-36 inches). Remove and destroy infected leaves. Water only in morning so plants dry by evening. Never wet foliage - use drip irrigation. Apply sulfur-based fungicides or copper fungicides every 7-10 days. Prune plants to improve air flow. Use resistant varieties like 'Royesta', 'Carousel', 'Funtasia'. Avoid high nitrogen fertilization. Heat greenhouse above 80°F if possible to reduce humidity. Clean greenhouse thoroughly between crops."
    },
    "Tomato_Septoria_leaf_spot": {
        "description": "Septoria leaf spot is caused by the Septoria lycopersici fungus. It produces numerous small (1/16 to 1/4 inch), circular spots with gray or tan centers and dark brown borders on leaves. Tiny black dots (fungal fruiting bodies) appear in the center of spots. Disease starts on lower leaves and progresses upward, causing yellowing and defoliation. Thrives in warm (60-80°F), wet, humid conditions.",
        "treatment": "Remove and destroy all infected lower leaves immediately. Apply fungicide containing chlorothalonil, mancozeb, or copper every 7-10 days. Mulch heavily (3-4 inches) with straw, wood chips, or black plastic to prevent soil splash onto leaves - this is very important as fungus overwinters in soil. Water only at soil level using drip irrigation. Stake plants to keep foliage off ground. Space plants 24-36 inches apart. Prune lower branches for air flow. Remove all plant debris at end of season and destroy. Rotate crops annually. Avoid overhead watering completely."
    },
    "Tomato_Spider_mites_Two_spotted_spider_mite": {
        "description": "Two-spotted spider mites (Tetranychus urticae) are tiny arachnid pests (1/50 inch) barely visible to naked eye. They feed by piercing plant cells and sucking sap, causing fine yellow stippling or speckling on leaves, yellowing and bronzing of foliage, fine webbing on leaf undersides, and eventual leaf drop. Mites reproduce extremely rapidly (new generation every 7-10 days) in hot (80-90°F), dry conditions below 50% humidity. A single female can lay 100+ eggs.",
        "treatment": "Spray plants with strong stream of water to physically dislodge mites - repeat every 2-3 days. Apply insecticidal soap or neem oil, thoroughly coating undersides of leaves, every 5-7 days for 3 weeks. Use horticultural oil sprays. Increase humidity around plants through misting or wet mulch - mites hate humidity. Introduce beneficial predatory mites (Phytoseiulus persimilis) for biological control. Keep plants well-watered - drought-stressed plants are most susceptible. Remove heavily infested leaves and destroy. Avoid pesticides that kill natural predators. Apply sulfur dust if organic. Use reflective mulches. Monitor closely - early detection is key as populations explode rapidly."
    }
}

def preprocess_image(image):
    # ✅ FIXED: must match training image size
    image = image.resize((160, 160))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@router.post("/detect-disease")
async def detect_disease(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image file")

    try:
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
        img = preprocess_image(image)

        preds = model.predict(img)
        idx = int(np.argmax(preds))
        confidence = float(np.max(preds))
        
        disease_name = CLASS_NAMES[idx]
        disease_data = DISEASE_INFO.get(disease_name, {
            "description": "Plant disease detected. Consult with a plant disease specialist for proper diagnosis.",
            "treatment": "Follow general plant care practices and consult local agricultural extension for specific recommendations."
        })

        return {
            "disease": disease_name,
            "confidence": f"{confidence * 100:.2f}%",
            "description": disease_data["description"],
            "treatment": disease_data["treatment"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
