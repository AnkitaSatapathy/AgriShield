import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, Leaf, Droplets, Shield, 
  Search, Filter, Star, TrendingUp, CheckCircle,
  XCircle, Plus, Minus, ShoppingBag, AlertCircle,
  Sprout, Users, Award, Truck, Loader2, MapPin, DollarSign
} from 'lucide-react';

const MarketPlace = () => {
  // Product categories and data
  const [products] = useState([
    // ── FERTILIZERS (12) ──
    {
      id: 1,
      name: "Zinc Sulphate",
      category: "fertilizer",
      type: "Micronutrient",
      description: "Essential micronutrient for deficient soils. Promotes healthy plant growth and increases yield.",
      dosage: "25 kg/ha",
      price: 850,
      unit: "25 kg bag",
      rating: 4.8,
      reviews: 493,
      inStock: true,
      usage: "Apply in deficient alkaline soils",
      benefits: ["Corrects zinc deficiency", "Improves crop quality", "Enhances yield"],
      icon: "🌾"
    },
    {
      id: 2,
      name: "Urea 46% N",
      category: "fertilizer",
      type: "Nitrogen Fertilizer",
      description: "High nitrogen content fertilizer. Ideal for split dose application during crop growth.",
      dosage: "120 kg/ha",
      price: 1200,
      unit: "50 kg bag",
      rating: 4.7,
      reviews: 372,
      inStock: true,
      usage: "Split application recommended",
      benefits: ["Quick nitrogen supply", "Promotes vegetative growth", "Water soluble"],
      icon: "💧"
    },
    {
      id: 3,
      name: "DAP 18-46-0",
      category: "fertilizer",
      type: "Phosphate Fertilizer",
      description: "Di-Ammonium Phosphate for strong root development. Perfect for basal application.",
      dosage: "100 kg/ha",
      price: 1450,
      unit: "50 kg bag",
      rating: 4.9,
      reviews: 370,
      inStock: true,
      usage: "Basal application at planting",
      benefits: ["Strong root system", "Early plant vigor", "High phosphorus content"],
      icon: "🌱"
    },
    {
      id: 4,
      name: "NPK 20-20-0",
      category: "fertilizer",
      type: "Complex Fertilizer",
      description: "Complete nutrition complex mixture for balanced plant growth and development.",
      dosage: "As per crop",
      price: 1600,
      unit: "50 kg bag",
      rating: 4.6,
      reviews: 355,
      inStock: true,
      usage: "All-purpose fertilizer",
      benefits: ["Balanced nutrition", "Suitable for all crops", "Easy application"],
      icon: "⚗️"
    },
    {
      id: 5,
      name: "Muriate of Potash",
      category: "fertilizer",
      type: "Potassium Fertilizer",
      description: "Premium potassium fertilizer (0-0-60) for enhanced grain quality and disease resistance.",
      dosage: "60 kg/ha",
      price: 950,
      unit: "50 kg bag",
      rating: 4.7,
      reviews: 340,
      inStock: true,
      usage: "Flowering and fruiting stage",
      benefits: ["Better grain quality", "Disease resistance", "Improved shelf life"],
      icon: "🌾"
    },
    {
      id: 6,
      name: "Magnesium Sulphate (Epsom Salt)",
      category: "fertilizer",
      type: "Micronutrient",
      description: "Rich source of magnesium for chlorophyll production and plant metabolism.",
      dosage: "20 kg/ha",
      price: 620,
      unit: "25 kg bag",
      rating: 4.5,
      reviews: 287,
      inStock: true,
      usage: "Foliar spray or soil application",
      benefits: ["Enhances nutrient uptake", "Improves plant vigor", "Better fruit color"],
      icon: "✨"
    },
    {
      id: 7,
      name: "Ammonium Sulphate 20% N",
      category: "fertilizer",
      type: "Nitrogen Fertilizer",
      description: "Nitrogen and sulfur-based fertilizer for acid soils and specific crops.",
      dosage: "150 kg/ha",
      price: 1100,
      unit: "50 kg bag",
      rating: 4.4,
      reviews: 245,
      inStock: true,
      usage: "Basal or split application",
      benefits: ["Acidifies alkaline soils", "Contains sulfur", "Promotes leaf growth"],
      icon: "🧪"
    },
    {
      id: 8,
      name: "Calcium Ammonium Nitrate",
      category: "fertilizer",
      type: "Nitrogen Fertilizer",
      description: "Balanced nitrogen source with calcium for strong cell structure.",
      dosage: "100 kg/ha",
      price: 1350,
      unit: "50 kg bag",
      rating: 4.6,
      reviews: 312,
      inStock: true,
      usage: "Split application recommended",
      benefits: ["Quick nitrogen supply", "Reduces blossom end rot", "High calcium content"],
      icon: "🥛"
    },
    {
      id: 9,
      name: "Single Super Phosphate (SSP)",
      category: "fertilizer",
      type: "Phosphate Fertilizer",
      description: "Pure phosphorus and sulfur source for enhanced root development.",
      dosage: "80 kg/ha",
      price: 1050,
      unit: "50 kg bag",
      rating: 4.7,
      reviews: 298,
      inStock: true,
      usage: "Basal application",
      benefits: ["Rich in phosphorus", "Contains sulfur", "Improves root strength"],
      icon: "🌳"
    },
    {
      id: 10,
      name: "Potassium Sulphate 50% K",
      category: "fertilizer",
      type: "Potassium Fertilizer",
      description: "Sulfur-containing potassium fertilizer for chloride-sensitive crops.",
      dosage: "50 kg/ha",
      price: 1200,
      unit: "50 kg bag",
      rating: 4.5,
      reviews: 256,
      inStock: true,
      usage: "Flowering and fruiting stage",
      benefits: ["Chloride-free", "Contains sulfur", "Enhanced nutrient uptake"],
      icon: "💎"
    },
    {
      id: 11,
      name: "Borax (Boron Source)",
      category: "fertilizer",
      type: "Micronutrient",
      description: "Essential boron source for flower and fruit development.",
      dosage: "2.5 kg/ha",
      price: 580,
      unit: "5 kg bag",
      rating: 4.6,
      reviews: 189,
      inStock: true,
      usage: "Foliar spray or soil application",
      benefits: ["Improves pollination", "Better fruit setting", "Prevents hollow heart"],
      icon: "🌼"
    },
    {
      id: 12,
      name: "Iron Sulphate (FeSO4)",
      category: "fertilizer",
      type: "Micronutrient",
      description: "Corrects iron deficiency chlorosis in plants, especially on alkaline soils.",
      dosage: "15 kg/ha",
      price: 420,
      unit: "5 kg bag",
      rating: 4.7,
      reviews: 156,
      inStock: true,
      usage: "Foliar spray or soil drench",
      benefits: ["Corrects chlorosis", "Vibrant green leaves", "Cost-effective"],
      icon: "🔴"
    },
    {
      id: 13,
      name: "Manganese Sulphate",
      category: "fertilizer",
      type: "Micronutrient",
      description: "Corrects manganese deficiency in crops. Essential for enzyme functions.",
      dosage: "10 kg/ha",
      price: 540,
      unit: "5 kg bag",
      rating: 4.5,
      reviews: 134,
      inStock: true,
      usage: "Foliar spray or soil application",
      benefits: ["Corrects manganese deficiency", "Improves enzyme activity", "Better disease resistance"],
      icon: "⚙️"
    },
    {
      id: 14,
      name: "Copper Sulphate",
      category: "fertilizer",
      type: "Micronutrient",
      description: "Essential copper source for plant growth and disease prevention.",
      dosage: "5 kg/ha",
      price: 680,
      unit: "5 kg bag",
      rating: 4.6,
      reviews: 167,
      inStock: true,
      usage: "Foliar spray or soil application",
      benefits: ["Essential micronutrient", "Improves disease resistance", "Better photosynthesis"],
      icon: "💠"
    },
    {
      id: 15,
      name: "Ammonium Chloride",
      category: "fertilizer",
      type: "Nitrogen Fertilizer",
      description: "Nitrogen source with chlorine for specific crops and saline soils.",
      dosage: "100 kg/ha",
      price: 980,
      unit: "50 kg bag",
      rating: 4.4,
      reviews: 98,
      inStock: true,
      usage: "Split application",
      benefits: ["Nitrogen source", "Suitable for saline soils", "Economical"],
      icon: "❄️"
    },
    {
      id: 16,
      name: "Sodium Nitrate",
      category: "fertilizer",
      type: "Nitrogen Fertilizer",
      description: "Quick-acting nitrogen source for rapid plant growth.",
      dosage: "80 kg/ha",
      price: 1100,
      unit: "50 kg bag",
      rating: 4.5,
      reviews: 112,
      inStock: true,
      usage: "Split application",
      benefits: ["Quick nitrogen supply", "Fast acting", "Reduces acid soils"],
      icon: "⚪"
    },
    {
      id: 17,
      name: "Phosphoric Acid (85%)",
      category: "fertilizer",
      type: "Phosphate Fertilizer",
      description: "Concentrated phosphorus source for rapid phosphate supply.",
      dosage: "20 L/ha",
      price: 1250,
      unit: "5 liter bottle",
      rating: 4.6,
      reviews: 145,
      inStock: true,
      usage: "Fertigation or foliar spray",
      benefits: ["Concentrated phosphorus", "Rapid absorption", "Improves root development"],
      icon: "🧪"
    },
    {
      id: 18,
      name: "NPK 12-32-16",
      category: "fertilizer",
      type: "Complex Fertilizer",
      description: "High phosphorus complex for flowering and fruiting crops.",
      dosage: "As per crop",
      price: 1700,
      unit: "50 kg bag",
      rating: 4.7,
      reviews: 178,
      inStock: true,
      usage: "Basal or split application",
      benefits: ["High phosphorus", "Suitable for fruits", "Better grain quality"],
      icon: "🎯"
    },
    {
      id: 19,
      name: "NPK 10-26-26",
      category: "fertilizer",
      type: "Complex Fertilizer",
      description: "Balanced phosphorus and potassium for vegetable crops.",
      dosage: "As per crop",
      price: 1650,
      unit: "50 kg bag",
      rating: 4.6,
      reviews: 156,
      inStock: true,
      usage: "Split application",
      benefits: ["Balanced nutrition", "For vegetables", "Improved shelf life"],
      icon: "🥬"
    },
    {
      id: 20,
      name: "Ammonium Nitrate 33% N",
      category: "fertilizer",
      type: "Nitrogen Fertilizer",
      description: "High nitrogen content with calcium for fast crop growth.",
      dosage: "150 kg/ha",
      price: 1180,
      unit: "50 kg bag",
      rating: 4.5,
      reviews: 123,
      inStock: true,
      usage: "Split application",
      benefits: ["High nitrogen", "Fast growth", "Contains calcium"],
      icon: "💪"
    },
    // ── PESTICIDES (20) ──
    {
      id: 21,
      name: "Imidacloprid 17.8 SL",
      category: "pesticide",
      type: "Insecticide",
      description: "Systemic insecticide for effective control of sucking pests and soil insects.",
      dosage: "0.5 ml/L",
      price: 680,
      unit: "500 ml bottle",
      rating: 4.8,
      reviews: 377,
      inStock: true,
      usage: "Spray or soil drench",
      benefits: ["Long-lasting protection", "Systemic action", "Controls aphids, whiteflies"],
      icon: "🛡️"
    },
    {
      id: 22,
      name: "Carbofuran 3G",
      category: "pesticide",
      type: "Insecticide",
      description: "Granular insecticide for gall midge control. Long-lasting soil application.",
      dosage: "10 kg/ha",
      price: 720,
      unit: "5 kg pack",
      rating: 4.7,
      reviews: 374,
      inStock: true,
      usage: "Apply in root zone",
      benefits: ["Soil pest control", "Extended protection", "Easy application"],
      icon: "🐛"
    },
    {
      id: 23,
      name: "Chlorpyrifos 20 EC",
      category: "pesticide",
      type: "Insecticide",
      description: "Broad-spectrum insecticide for stem borer and leaf folder control in rice.",
      dosage: "2 ml/L",
      price: 590,
      unit: "1 liter bottle",
      rating: 4.6,
      reviews: 366,
      inStock: true,
      usage: "Foliar spray",
      benefits: ["Wide spectrum control", "Economical", "Effective on borers"],
      icon: "🦗"
    },
    {
      id: 24,
      name: "Cartap Hydrochloride 50SP",
      category: "pesticide",
      type: "Insecticide",
      description: "Effective against Brown Plant Hopper (BPH) and White Backed Plant Hopper (WBPH).",
      dosage: "1 g/L",
      price: 780,
      unit: "500 g pack",
      rating: 4.7,
      reviews: 353,
      inStock: true,
      usage: "Spray application",
      benefits: ["Controls hoppers", "Fast acting", "Residual effect"],
      icon: "🦟"
    },
    {
      id: 25,
      name: "Tricyclazole 75 WP",
      category: "pesticide",
      type: "Fungicide",
      description: "Specialized fungicide for blast disease control in rice and other crops.",
      dosage: "0.6 g/L",
      price: 820,
      unit: "250 g pack",
      rating: 4.8,
      reviews: 324,
      inStock: true,
      usage: "Preventive spray",
      benefits: ["Blast disease control", "Preventive action", "Safe for crops"],
      icon: "🍄"
    },
    {
      id: 26,
      name: "Mancozeb 75 WP",
      category: "pesticide",
      type: "Fungicide",
      description: "Multi-site fungicide for controlling various fungal diseases in vegetables and fruits.",
      dosage: "0.75 kg/ha",
      price: 550,
      unit: "500 g pack",
      rating: 4.5,
      reviews: 198,
      inStock: true,
      usage: "Foliar spray",
      benefits: ["Broad spectrum", "Contact fungicide", "Cost effective"],
      icon: "🟢"
    },
    {
      id: 27,
      name: "Copper Oxychloride 50 WP",
      category: "pesticide",
      type: "Fungicide",
      description: "Copper-based fungicide for bacterial and fungal disease control.",
      dosage: "1.5 kg/ha",
      price: 480,
      unit: "500 g pack",
      rating: 4.6,
      reviews: 267,
      inStock: true,
      usage: "Foliar spray",
      benefits: ["Bacterial disease control", "Preventive action", "Eco-friendly"],
      icon: "💊"
    },
    {
      id: 28,
      name: "Lambda Cyhalothrin 5 EC",
      category: "pesticide",
      type: "Insecticide",
      description: "Synthetic pyrethroid for fast knockdown of various insect pests.",
      dosage: "0.3 ml/L",
      price: 720,
      unit: "500 ml bottle",
      rating: 4.7,
      reviews: 289,
      inStock: true,
      usage: "Foliar spray",
      benefits: ["Fast acting", "Long residual period", "Broad spectrum"],
      icon: "⚡"
    },
    {
      id: 29,
      name: "Quinalphos 25 EC",
      category: "pesticide",
      type: "Insecticide",
      description: "Organophosphate insecticide for chewing and sucking insect pests.",
      dosage: "1 ml/L",
      price: 620,
      unit: "500 ml bottle",
      rating: 4.4,
      reviews: 210,
      inStock: true,
      usage: "Foliar spray",
      benefits: ["Broad spectrum", "Economical", "Effective contact action"],
      icon: "🎯"
    },
    {
      id: 30,
      name: "Profenofos 50 EC",
      category: "pesticide",
      type: "Insecticide",
      description: "Organophosphate for vegetable and fruit crop pest management.",
      dosage: "1 ml/L",
      price: 650,
      unit: "500 ml bottle",
      rating: 4.5,
      reviews: 234,
      inStock: true,
      usage: "Foliar spray",
      benefits: ["Effective on sucking pests", "Quick knockdown", "Residual action"],
      icon: "🌊"
    },
    {
      id: 31,
      name: "Fipronil 5 SC",
      category: "pesticide",
      type: "Insecticide",
      description: "Modern insecticide for rice and vegetable crop pest control.",
      dosage: "1 ml/L",
      price: 850,
      unit: "500 ml bottle",
      rating: 4.8,
      reviews: 245,
      inStock: true,
      usage: "Foliar spray or soil treatment",
      benefits: ["Long-lasting protection", "Effective on hoppers", "Weather resistant"],
      icon: "🔒"
    },
    {
      id: 32,
      name: "Thiram 75 WP",
      category: "pesticide",
      type: "Fungicide",
      description: "Dithiocarbamate fungicide for seed treatment and foliar application.",
      dosage: "2.5 kg/ha",
      price: 520,
      unit: "500 g pack",
      rating: 4.6,
      reviews: 167,
      inStock: true,
      usage: "Seed treatment or foliar spray",
      benefits: ["Prevents seed-borne diseases", "Protects young plants", "Cost-effective"],
      icon: "🌪️"
    },
    {
      id: 33,
      name: "Hexaconazole 5% EC",
      category: "pesticide",
      type: "Fungicide",
      description: "Triazole fungicide for powdery mildew and rust disease control.",
      dosage: "0.5 ml/L",
      price: 480,
      unit: "500 ml bottle",
      rating: 4.6,
      reviews: 134,
      inStock: true,
      usage: "Foliar spray",
      benefits: ["Controls powdery mildew", "Long residual", "Safe on most crops"],
      icon: "🌫️"
    },
    {
      id: 34,
      name: "Propiconazole 25 EC",
      category: "pesticide",
      type: "Fungicide",
      description: "Systemic fungicide for turf diseases and crop protectant.",
      dosage: "0.5 ml/L",
      price: 560,
      unit: "500 ml bottle",
      rating: 4.5,
      reviews: 121,
      inStock: true,
      usage: "Foliar spray",
      benefits: ["Systemic action", "Long-lasting", "Prevents diseases"],
      icon: "💨"
    },
    {
      id: 35,
      name: "Azoxystrobin 23 SC",
      category: "pesticide",
      type: "Fungicide",
      description: "Broad-spectrum strobilurin fungicide for various crop diseases.",
      dosage: "0.75 ml/L",
      price: 640,
      unit: "500 ml bottle",
      rating: 4.7,
      reviews: 156,
      inStock: true,
      usage: "Foliar spray",
      benefits: ["Broad spectrum", "Systemic action", "Preventive and curative"],
      icon: "🛡️"
    },
    {
      id: 36,
      name: "Myclobutanil 20 EC",
      category: "pesticide",
      type: "Fungicide",
      description: "Triazole fungicide for apple scab and other fungal diseases.",
      dosage: "1 ml/L",
      price: 520,
      unit: "500 ml bottle",
      rating: 4.4,
      reviews: 98,
      inStock: true,
      usage: "Foliar spray",
      benefits: ["Apple scab control", "Preventive action", "Cost-effective"],
      icon: "🍎"
    },
    {
      id: 37,
      name: "Metalaxyl-M 8%",
      category: "pesticide",
      type: "Fungicide",
      description: "Systemic fungicide for downy mildew and damping-off diseases.",
      dosage: "2.5 ml/L",
      price: 580,
      unit: "500 ml bottle",
      rating: 4.6,
      reviews: 112,
      inStock: true,
      usage: "Seed treatment or foliar spray",
      benefits: ["Downy mildew control", "Systemic action", "Prevents damping-off"],
      icon: "💧"
    },
    {
      id: 38,
      name: "Captan 50 WP",
      category: "pesticide",
      type: "Fungicide",
      description: "Multi-site contact fungicide for fruit and vegetable crops.",
      dosage: "2 kg/ha",
      price: 510,
      unit: "500 g pack",
      rating: 4.5,
      reviews: 87,
      inStock: true,
      usage: "Foliar spray",
      benefits: ["Multi-site action", "Contact fungicide", "Broad spectrum"],
      icon: "🎯"
    },
    {
      id: 39,
      name: "Benomyl 50 WP",
      category: "pesticide",
      type: "Fungicide",
      description: "Systemic benzimidazole fungicide for various crop diseases.",
      dosage: "1 kg/ha",
      price: 490,
      unit: "500 g pack",
      rating: 4.4,
      reviews: 76,
      inStock: true,
      usage: "Foliar spray or seed treatment",
      benefits: ["Systemic action", "Wide spectrum", "Improves shelf life"],
      icon: "✨"
    },
    {
      id: 40,
      name: "Oxydecyl Sodium Sulphate 12.5%",
      category: "pesticide",
      type: "Insecticide",
      description: "Contact insecticide for soft-bodied insects and mites.",
      dosage: "2 ml/L",
      price: 420,
      unit: "500 ml bottle",
      rating: 4.3,
      reviews: 65,
      inStock: true,
      usage: "Foliar spray",
      benefits: ["Controls soft insects", "Safe on beneficials", "Economical"],
      icon: "🌱"
    },
    {
      id: 41,
      name: "Neem Oil (Cold Pressed)",
      category: "organic",
      type: "Biopesticide",
      description: "Pure cold-pressed neem oil for organic pest and disease management.",
      dosage: "3-5% solution",
      price: 650,
      unit: "500 ml bottle",
      rating: 4.8,
      reviews: 234,
      inStock: true,
      usage: "Spray on affected plants",
      benefits: ["OMRI certified", "Repels insects", "Antifungal properties"],
      icon: "🌿"
    },
    {
      id: 42,
      name: "Vermicompost",
      category: "organic",
      type: "Soil Amendment",
      description: "Earthworm-derived rich organic matter for soil enrichment.",
      dosage: "5-10 tons/ha",
      price: 380,
      unit: "25 kg bag",
      rating: 4.7,
      reviews: 198,
      inStock: true,
      usage: "Mix in soil before planting",
      benefits: ["Improves soil structure", "Enhances water retention", "Slow-release nutrients"],
      icon: "🪱"
    },
    {
      id: 43,
      name: "Cow Dung Manure (Aged)",
      category: "organic",
      type: "Manure",
      description: "Well-aged cow dung manure rich in organic matter and microbes.",
      dosage: "10-15 tons/ha",
      price: 220,
      unit: "25 kg bag",
      rating: 4.6,
      reviews: 156,
      inStock: true,
      usage: "Incorporate into soil",
      benefits: ["Improves soil fertility", "Better aggregation", "Cost-effective"],
      icon: "🐄"
    },
    {
      id: 44,
      name: "Coconut Coir Pith",
      category: "organic",
      type: "Growing Media",
      description: "Sustainable coconut fiber medium for nursery and potting.",
      dosage: "As per requirement",
      price: 290,
      unit: "5 kg block",
      rating: 4.7,
      reviews: 167,
      inStock: true,
      usage: "Mix with potting soil",
      benefits: ["Sustainable", "High water retention", "Good aeration"],
      icon: "🥥"
    },
    {
      id: 45,
      name: "Bone Meal (Steamed)",
      category: "organic",
      type: "Nutrient",
      description: "Steamed bone meal rich in phosphorus for root development.",
      dosage: "500 kg/ha",
      price: 420,
      unit: "2 kg bag",
      rating: 4.6,
      reviews: 143,
      inStock: true,
      usage: "Mix with compost or soil",
      benefits: ["High phosphorus", "Promotes root growth", "Slow-release"],
      icon: "🦴"
    },
    {
      id: 46,
      name: "Seaweed Extract",
      category: "organic",
      type: "Biostimulant",
      description: "Liquid seaweed extract with minerals and growth hormones.",
      dosage: "20-40 ml/L",
      price: 580,
      unit: "500 ml bottle",
      rating: 4.8,
      reviews: 189,
      inStock: true,
      usage: "Foliar and soil application",
      benefits: ["Plant vigor enhancer", "Stress tolerance", "Mineral-rich"],
      icon: "🌊"
    },
    {
      id: 47,
      name: "Compost (Garden)",
      category: "organic",
      type: "Soil Amendment",
      description: "Well-decomposed garden compost with balanced nutrient content.",
      dosage: "5-8 tons/ha",
      price: 250,
      unit: "25 kg bag",
      rating: 4.6,
      reviews: 134,
      inStock: true,
      usage: "Mix with soil before planting",
      benefits: ["Balanced nutrition", "Improves soil life", "Environmental friendly"],
      icon: "🌲"
    },
    {
      id: 48,
      name: "Bio-fertilizer Azotobacter",
      category: "organic",
      type: "Biofertilizer",
      description: "Nitrogen-fixing bacteria for sustainable nitrogen management.",
      dosage: "5 kg/ha",
      price: 310,
      unit: "1 kg pack",
      rating: 4.7,
      reviews: 121,
      inStock: true,
      usage: "Mix with compost or apply with water",
      benefits: ["Fixes atmospheric nitrogen", "Reduces nitrogen fertilizer need", "Ecofriendly"],
      icon: "🔬"
    },
    {
      id: 49,
      name: "Spinosad (Organic)",
      category: "organic",
      type: "Biopesticide",
      description: "OMRI-certified Spinosad for organic caterpillar and thrips control.",
      dosage: "1 ml/L",
      price: 640,
      unit: "500 ml bottle",
      rating: 4.8,
      reviews: 176,
      inStock: true,
      usage: "Spray on plants",
      benefits: ["Organic certified", "Specific to pests", "No residue"],
      icon: "🍃"
    },
    {
      id: 50,
      name: "Panchagavya (5-Ingredient Mixture)",
      category: "organic",
      type: "Bio-stimulant",
      description: "Traditional 5-ingredient organic mixture for plant vigor and immunity.",
      dosage: "3-5L per acre",
      price: 420,
      unit: "5 L container",
      rating: 4.7,
      reviews: 98,
      inStock: true,
      usage: "Spray on foliage",
      benefits: ["Improves immunity", "Natural growth promoter", "Traditional recipe"],
      icon: "🏺"
    },
    {
      id: 51,
      name: "Trichoderma (Powder)",
      category: "organic",
      type: "Biocontrol",
      description: "Fungal antagonist for soil-borne disease suppression.",
      dosage: "5 kg/ha",
      price: 380,
      unit: "1 kg pack",
      rating: 4.7,
      reviews: 112,
      inStock: true,
      usage: "Mix with soil or compost",
      benefits: ["Controls root diseases", "Improves soil health", "Enzyme secretion"],
      icon: "🦠"
    },
    {
      id: 52,
      name: "Bacillus Thuringiensis (Bt)",
      category: "organic",
      type: "Biopesticide",
      description: "Naturally occurring bacteria for safe Lepidopteran pest control.",
      dosage: "1 kg/ha",
      price: 550,
      unit: "500 g pack",
      rating: 4.8,
      reviews: 187,
      inStock: true,
      usage: "Spray on affected areas",
      benefits: ["Organic approved", "Safe for humans", "Target-specific"],
      icon: "🐛"
    },
    {
      id: 53,
      name: "Neem Cake",
      category: "organic",
      type: "Soil Amendment",
      description: "Oil cake residue rich in nitrogen and natural pest suppressants.",
      dosage: "500 kg/ha",
      price: 280,
      unit: "20 kg bag",
      rating: 4.6,
      reviews: 145,
      inStock: true,
      usage: "Mix with soil before planting",
      benefits: ["Slow-release nutrition", "Nematode repellent", "Sustainable"],
      icon: "🍂"
    },
    {
      id: 54,
      name: "Rock Phosphate",
      category: "organic",
      type: "Mineral Fertilizer",
      description: "Natural mined phosphate rock for long-term phosphorus supply.",
      dosage: "500 kg/ha",
      price: 320,
      unit: "25 kg bag",
      rating: 4.5,
      reviews: 128,
      inStock: true,
      usage: "Mix with soil or compost",
      benefits: ["Long-lasting phosphorus", "Sustainable source", "Improves soil"],
      icon: "⛰️"
    },
    {
      id: 55,
      name: "Wood Ash (Activated)",
      category: "organic",
      type: "Soil Amendment",
      description: "Activated wood ash for potassium and pH management.",
      dosage: "2-5 tons/ha",
      price: 180,
      unit: "20 kg bag",
      rating: 4.4,
      reviews: 87,
      inStock: true,
      usage: "Spread on soil surface",
      benefits: ["Potassium source", "Pest deterrent", "pH regulator"],
      icon: "🔥"
    },
    {
      id: 56,
      name: "Biochar (Premium)",
      category: "organic",
      type: "Soil Amendment",
      description: "Premium quality biochar for soil carbon and water retention.",
      dosage: "10-20 tons/ha",
      price: 650,
      unit: "25 kg bag",
      rating: 4.8,
      reviews: 156,
      inStock: true,
      usage: "Mix into soil",
      benefits: ["Carbon sequestration", "Water retention", "Microbe habitat"],
      icon: "⚫"
    },
    {
      id: 57,
      name: "Organica Humic Acid",
      category: "organic",
      type: "Soil Conditioner",
      description: "Extracted humic acid for soil fertility and nutrient availability.",
      dosage: "10-20 kg/ha",
      price: 490,
      unit: "5 kg pack",
      rating: 4.7,
      reviews: 134,
      inStock: true,
      usage: "Mix with water and apply",
      benefits: ["Enhances CEC", "Chelates nutrients", "Improves structure"],
      icon: "🌍"
    },
    {
      id: 58,
      name: "Amino Acid Chelate",
      category: "organic",
      type: "Micronutrient",
      description: "Amino acid-based micronutrient complex for nutrient deficiency correction.",
      dosage: "500 ml/acre",
      price: 560,
      unit: "500 ml bottle",
      rating: 4.8,
      reviews: 167,
      inStock: true,
      usage: "Foliar spray or soil application",
      benefits: ["Better absorption", "Stress relief", "Balanced micronutrients"],
      icon: "🧬"
    },
    {
      id: 59,
      name: "Mycorrhizal Fungi Consortium",
      category: "organic",
      type: "Biofertilizer",
      description: "Multi-species mycorrhizal fungal inoculant for root enhancement.",
      dosage: "5-10 kg/ha",
      price: 520,
      unit: "1 kg pack",
      rating: 4.7,
      reviews: 143,
      inStock: true,
      usage: "Mix with potting soil or apply to roots",
      benefits: ["Symbiotic relationship", "Nutrient uptake", "Disease resistance"],
      icon: "🍄"
    },
    {
      id: 60,
      name: "Phosphate Solubilizing Bacteria",
      category: "organic",
      type: "Biofertilizer",
      description: "Microorganisms that solubilize fixed phosphorus in soil.",
      dosage: "5 kg/ha",
      price: 340,
      unit: "1 kg pack",
      rating: 4.6,
      reviews: 119,
      inStock: true,
      usage: "Mix with manure or soil",
      benefits: ["Phosphorus availability", "Reduces P fertilizer need", "Sustainable"],
      icon: "🧪"
    },
    {
      id: 61,
      name: "Beneficial Nematodes (Organic)",
      category: "organic",
      type: "Biocontrol",
      description: "Entomopathogenic nematodes for organic soil pest control.",
      dosage: "1 billion/ha",
      price: 480,
      unit: "500 ml bottle",
      rating: 4.7,
      reviews: 156,
      inStock: true,
      usage: "Apply to moist soil",
      benefits: ["Controls white grubs", "Controls root pests", "Chemical-free"],
      icon: "🔍"
    },
    {
      id: 62,
      name: "Organic Growth Promoter",
      category: "organic",
      type: "Bio-stimulant",
      description: "Certified organic plant growth regulator from natural extracts.",
      dosage: "1 ml/L",
      price: 420,
      unit: "500 ml bottle",
      rating: 4.8,
      reviews: 178,
      inStock: true,
      usage: "Spray on plants",
      benefits: ["Plant vigor", "Fruit setting", "Stress management"],
      icon: "📈"
    },
    {
      id: 63,
      name: "Sulfur Powder (Organic)",
      category: "organic",
      type: "Fungicide",
      description: "Pure sulfur powder for fungal disease and mite control.",
      dosage: "2-3 kg/ha",
      price: 280,
      unit: "5 kg pack",
      rating: 4.6,
      reviews: 134,
      inStock: true,
      usage: "Dust or spray suspension",
      benefits: ["Fungicide action", "Mite control", "Low phytotoxicity"],
      icon: "💛"
    },
    {
      id: 64,
      name: "Zeolite (Activated)",
      category: "organic",
      type: "Soil Amendment",
      description: "Natural zeolite for water retention and nutrient exchange.",
      dosage: "2-5 tons/ha",
      price: 350,
      unit: "25 kg bag",
      rating: 4.7,
      reviews: 98,
      inStock: true,
      usage: "Mix into soil",
      benefits: ["Water retention", "Cation exchange", "Odor control"],
      icon: "💎"
    },
    {
      id: 65,
      name: "Silica Extract (Liquid)",
      category: "organic",
      type: "Mineral Fortifier",
      description: "Liquid silica for plant structural strength and disease resistance.",
      dosage: "500 ml/acre",
      price: 480,
      unit: "500 ml bottle",
      rating: 4.8,
      reviews: 145,
      inStock: true,
      usage: "Foliar or soil application",
      benefits: ["Strengthens cell walls", "Disease resistance", "Stress tolerance"],
      icon: "🔷"
    },
    {
      id: 66,
      name: "Microbial Consortium Mix",
      category: "organic",
      type: "Biofertilizer",
      description: "Multi-strain bacterial consortium for complete soil health.",
      dosage: "5-10 kg/ha",
      price: 550,
      unit: "2 kg pack",
      rating: 4.8,
      reviews: 167,
      inStock: true,
      usage: "Mix with organic matter",
      benefits: ["Nutrient cycling", "Disease suppression", "Soil health"],
      icon: "👨‍🔬"
    },
    {
      id: 67,
      name: "Potassium Permanganate (Organic Grade)",
      category: "organic",
      type: "Disinfectant",
      description: "Food-grade KMnO4 powder for organic disease management.",
      dosage: "1 g/L",
      price: 420,
      unit: "500 g pack",
      rating: 4.5,
      reviews: 89,
      inStock: true,
      usage: "Spray solution",
      benefits: ["Fungal control", "Oxidizing action", "Organic approved"],
      icon: "🟣"
    },
    {
      id: 68,
      name: "Kelp Meal (Dried Seaweed)",
      category: "organic",
      type: "Nutrient",
      description: "Dried kelp meal for potassium and trace mineral supplementation.",
      dosage: "500 kg/ha",
      price: 510,
      unit: "5 kg bag",
      rating: 4.7,
      reviews: 121,
      inStock: true,
      usage: "Mix with soil or compost",
      benefits: ["High potassium", "Trace minerals", "Plant vigor enhancer"],
      icon: "🌾"
    },
    {
      id: 69,
      name: "Vermi-compost Tea (Concentrated)",
      category: "organic",
      type: "Liquid Bio-fertilizer",
      description: "Concentrated vermicompost extract with active microorganisms.",
      dosage: "2-5 L per acre",
      price: 680,
      unit: "5 L container",
      rating: 4.9,
      reviews: 198,
      inStock: true,
      usage: "Spray on foliage or soil",
      benefits: ["Microbial diversity", "Nutrient solubility", "Plant immunity boost"],
      icon: "🍯"
    },
    {
      id: 70,
      name: "Soil Test Kit (Sample Pack)",
      category: "organic",
      type: "Testing Kit",
      description: "Quick soil testing sample kit to check NPK levels and pH balance at home.",
      dosage: "Single test",
      price: 1,
      unit: "Trial pack",
      rating: 4.9,
      reviews: 1250,
      inStock: true,
      usage: "Follow instructions in kit",
      benefits: ["Know your soil", "Make informed decisions", "Promotional offer"],
      icon: "🧪"
    }
  ]);

  // State management
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [notification, setNotification] = useState(null);
  const [highlightedProductId, setHighlightedProductId] = useState(null);

  // Check for highlighted product from FarmingTips page
  useEffect(() => {
    const productId = sessionStorage.getItem('highlightProductId');
    if (productId) {
      const id = parseInt(productId);
      setHighlightedProductId(id);
      // Clear the sessionStorage
      sessionStorage.removeItem('highlightProductId');
      // Scroll to the product after a short delay to ensure rendering
      setTimeout(() => {
        const productElement = document.getElementById(`product-${id}`);
        if (productElement) {
          productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Flash the product to draw attention
          productElement.classList.add('flash-highlight');
          setTimeout(() => {
            productElement.classList.remove('flash-highlight');
            setHighlightedProductId(null);
          }, 3000);
        }
      }, 500);
    }
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add to cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    showNotification(`${product.name} added to cart!`, 'success');
  };

  // Update quantity
  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    showNotification('Item removed from cart', 'info');
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* ── NOTIFICATION ────────────────────────────────────────────── */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 ${
          notification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
        } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-slide-in backdrop-blur-sm border border-white/20`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* ── HERO SECTION ────────────────────────────────────────────── */}
      <div 
        className="relative bg-cover bg-center py-16 px-4"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=400&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6 pt-8">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-2xl animate-pulse">
              <ShoppingBag className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
              AgriMart
            </h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-10">
            Premium Fertilizers, Pesticides & Organic Products for Indian Farmers - Direct Supply at Best Prices
          </p>
          
          {/* ── STATS BANNER ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition transform hover:scale-105 text-center">
              <Package className="w-8 h-8 text-green-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{products.length}</div>
              <div className="text-sm text-gray-200">Quality Products</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition transform hover:scale-105 text-center">
              <Users className="w-8 h-8 text-blue-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-sm text-gray-200">Authentic</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition transform hover:scale-105 text-center">
              <Award className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">Direct</div>
              <div className="text-sm text-gray-200">Farm Supply</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition transform hover:scale-105 text-center">
              <Truck className="w-8 h-8 text-purple-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">Free</div>
              <div className="text-sm text-gray-200">Delivery</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* ── SEARCH & FILTER SECTION ────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Search className="w-6 h-6 mr-3 text-green-600" />
            Find Quality Products
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Search className="w-4 h-4 inline mr-2" />
                Search Products
              </label>
              <input
                type="text"
                placeholder="Search by product name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Filter className="w-4 h-4 inline mr-2" />
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition bg-gray-50 hover:bg-white"
              >
                <option value="all">All Categories</option>
                <option value="fertilizer">Fertilizers</option>
                <option value="pesticide">Pesticides</option>
                <option value="organic">Organic Products</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-green-600">
                  <XCircle className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-blue-600">
                  <XCircle className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* ── PRODUCTS GRID ────────────────────────────────────────────── */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Package className="w-6 h-6 mr-3 text-green-600" />
            Featured Products ({filteredProducts.length})
          </h2>

          {filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  id={`product-${product.id}`}
                  className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border border-gray-100 ${
                    highlightedProductId === product.id ? 'ring-4 ring-green-500' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Product Badge & Image Area */}
                  <div className="relative">
                    <div className={`absolute top-3 right-3 ${
                      product.category === 'fertilizer' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                      product.category === 'pesticide' ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                      'bg-gradient-to-r from-emerald-600 to-teal-600'
                    } text-white px-2 py-0.5 rounded-full text-xs font-bold uppercase z-10 shadow-lg`}>
                      {product.type}
                    </div>
                    
                    <div className={`h-40 flex items-center justify-center text-6xl ${
                      product.category === 'fertilizer' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                      product.category === 'pesticide' ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-emerald-400 to-emerald-600'
                    }`}>
                      {product.icon}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-bold text-gray-900 flex-1">{product.name}</h3>
                    </div>

                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{product.description}</p>

                    {/* Specifications */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 mb-4 border border-gray-200">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-600 font-medium">Dosage:</span>
                        <span className="text-gray-900 font-semibold">{product.dosage}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">Pack Size:</span>
                        <span className="text-gray-900 font-semibold">{product.unit}</span>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-4 space-y-1">
                      {product.benefits.slice(0, 2).map((benefit, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 mb-2">
                      <div className="text-xl font-bold text-gray-900">₹{product.price}</div>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1.5 rounded-lg font-semibold text-sm hover:from-green-700 hover:to-emerald-700 shadow-lg transition flex items-center space-x-1"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="w-full text-green-600 font-semibold text-xs hover:text-green-700 hover:bg-green-50 transition py-1.5 rounded-lg"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* ── FLOATING CART BUTTON ────────────────────────────────────────────── */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition transform hover:scale-110 flex items-center justify-center group"
      >
        <ShoppingCart className="w-7 h-7" />
        {cart.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold animate-bounce shadow-lg">
            {cart.length}
          </div>
        )}
      </button>

      {/* ── CART MODAL ────────────────────────────────────────────── */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
            {/* Cart Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 border-b border-gradient-to-r from-green-700 to-emerald-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Shopping Cart</h2>
                    <p className="text-green-100 text-sm">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-xl transition"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-semibold">Your cart is empty</p>
                  <p className="text-gray-500 text-sm mt-2">Add products to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 flex items-center space-x-4 border border-gray-200 hover:border-green-300 transition">
                      <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 ${
                        item.category === 'fertilizer' ? 'bg-gradient-to-br from-green-200 to-green-300' :
                        item.category === 'pesticide' ? 'bg-gradient-to-br from-orange-200 to-orange-300' :
                        'bg-gradient-to-br from-emerald-200 to-emerald-300'
                      }`}>
                        {item.icon}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{item.unit}</p>
                        <p className="text-lg font-bold text-green-600 mt-2">₹{item.price}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="bg-white hover:bg-gray-200 p-2 rounded-lg transition border border-gray-300"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </button>
                        <span className="font-bold text-lg w-10 text-center text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-2 rounded-lg transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition ml-2"
                        title="Remove from cart"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Order Total:
                  </span>
                  <span className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">₹{calculateTotal()}</span>
                </div>
                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 shadow-lg transition transform hover:scale-105">
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-full mt-3 text-gray-700 font-semibold py-3 rounded-xl hover:bg-white transition"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PRODUCT DETAIL MODAL ────────────────────────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Product Details</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              {/* Product Header */}
              <div className="flex items-start space-x-6 mb-6">
                <div className={`w-32 h-32 rounded-2xl flex items-center justify-center text-6xl ${
                  selectedProduct.category === 'fertilizer' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                  selectedProduct.category === 'pesticide' ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                  'bg-gradient-to-br from-emerald-400 to-emerald-600'
                }`}>
                  {selectedProduct.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
                  <p className="text-gray-600 mb-3">{selectedProduct.description}</p>
                  <div className="text-4xl font-bold text-green-600">₹{selectedProduct.price}</div>
                </div>
              </div>

              {/* Product Details Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">Category</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{selectedProduct.category}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">Type</p>
                  <p className="text-lg font-bold text-gray-900">{selectedProduct.type}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">Recommended Dosage</p>
                  <p className="text-lg font-bold text-gray-900">{selectedProduct.dosage}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">Package Size</p>
                  <p className="text-lg font-bold text-gray-900">{selectedProduct.unit}</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-green-50 rounded-xl p-6 mb-6 border-2 border-green-200">
                <h4 className="font-bold text-xl mb-4 flex items-center text-green-900">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                  Key Benefits
                </h4>
                <ul className="space-y-2">
                  {selectedProduct.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <div className="bg-green-200 rounded-full p-1 mt-0.5">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Usage Instructions */}
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <h4 className="font-bold text-xl mb-3 flex items-center text-blue-900">
                  <AlertCircle className="w-6 h-6 mr-2 text-blue-600" />
                  Usage Instructions
                </h4>
                <p className="text-gray-700">{selectedProduct.usage}</p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes flash-highlight {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(34, 197, 94, 0.3);
          }
        }

        .flash-highlight {
          animation: flash-highlight 1s ease-in-out 3;
        }
      `}</style>
    </div>
  );
};

export default MarketPlace;