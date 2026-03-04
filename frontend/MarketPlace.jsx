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
      image: "https://m.media-amazon.com/images/I/713geAwU5vL.jpg"
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
      image: "https://5.imimg.com/data5/ANDROID/Default/2025/7/530155878/IQ/TD/OZ/89965844/product-jpeg-500x500.jpg"
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
      image: "https://5.imimg.com/data5/ANDROID/Default/2022/5/KI/NZ/OA/49437380/product-jpeg.jpg"
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
      image: "https://cpimg.tistatic.com/03752519/b/5/NPK-20-20-0-Fertilizer.jpg"
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
      image: "https://m.media-amazon.com/images/I/71-kyZvVTLL.jpg"
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
      image: "https://m.media-amazon.com/images/I/81or-pPHSxS.jpg"
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
      image: "https://cpimg.tistatic.com/7017332/b/1/ammonium-sulphate.jpg"
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
      image: "https://5.imimg.com/data5/ANDROID/Default/2023/1/NV/UL/TM/100389172/product-jpeg.jpg"
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
      image: "https://inputs.kalgudi.com/data/p_images/1683279263594.png"
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
      image: "https://5.imimg.com/data5/SJ/TZ/OH/GLADMIN-29199958/selection-170-500x500.png"
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
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb0_a121ShQJ5a-9M46YaBF3g68vL02OkCrA&s"
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
      image: "https://3.imimg.com/data3/MM/GL/MY-927110/ferrous-sulphate.jpg"
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
      image: "https://www.innovativeagrify.com/cdn/shop/files/mnsulphate2kg.png?v=1750227962&width=1946"
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
      image: "https://m.media-amazon.com/images/I/81aO2gMzuoL._AC_UF1000,1000_QL80_.jpg"
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
      image: "https://5.imimg.com/data5/MM/JP/CK/SELLER-16199489/bnjmbhjmhk-500x500.jpg"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2023/9/341040280/LF/ZW/XN/139302294/sodium-nitrate-99-extra-pure.jpg"
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
      image: "https://5.imimg.com/data5/ANDROID/Default/2022/3/QC/IQ/RF/38477453/1648350127058-jpg.jpg"
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
      image: "https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2019-09/npk-12-32-16.png"
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
      image: "https://kissanemart.com/storage/iffco-102626-major-nutrient.jpg"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2025/9/547740676/BS/WG/TE/95667856/ammonium-nitrate-500x500.jpeg"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2021/2/JV/NB/UK/9847984/2694b071-cdda-4f0d-8ebb-444a7109eb31.jpg"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2024/3/398968978/XA/FR/PQ/79851997/furadan-3g-insecticide.jpg"
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
      image: "https://dujjhct8zer0r.cloudfront.net/media/prod_image/2740249481743498805.webp"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2023/6/316066776/IL/ER/ND/149490071/cartap-50-.jpeg"
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
      image: "https://dujjhct8zer0r.cloudfront.net/media/prod_image/19833535791727759362.webp"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2021/7/QW/GH/SA/6616513/mancozeb-75-wp-contact-fungicide.jpg"
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
      image: "https://easy2agri.in/cdn/shop/files/1.jpg?v=1685599192"
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
      image: "https://cdn.shopify.com/s/files/1/0722/2059/files/thumbnail_4b72bfe9-a10c-460e-95ac-85277a8c8681.png?v=1751895771&width=384&format=webp"
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
      image: "https://images.jdmagicbox.com/quickquotes/images_main/quinalphos-25-ec-801271149-dhkeml2l.jpg"
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
      image: "https://5.imimg.com/data5/NF/SJ/YE/SELLER-48133236/whatsapp-image-2019-11-18-at-3-57-29-pm-500x500.jpeg"
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
      image: "https://www.bestagrolife.com/img/Fasten.png"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2023/12/371642625/SZ/JJ/TO/9550204/thiron-thiram-75-ws-ds.jpg"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2025/6/517531766/ZQ/JR/CR/3978161/hexokine-hexaconazole-5-ec-500x500.png"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2025/3/498668619/YX/NY/YS/110019580/whatsapp-image-2025-03-12-at-5-26-01-pm-3.jpeg"
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
      image: "https://www.katyayaniorganics.com/wp-content/uploads/2022/06/Azoxy-1.png"
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
      image: "https://cpimg.tistatic.com/08700746/b/4/Myclob-Myclobutanil-10-Percent-WP.jpg"
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
      image: "https://www.katyayaniorganics.com/wp-content/uploads/2023/10/400-gm-17.png"
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
      image: "https://cpimg.tistatic.com/11124843/b/4/Captan-50-WP-Fungicide..jpg"
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
      image: "https://image.made-in-china.com/202f0j00BAwlsztMMTcN/Fungicide-Benomyl-Benlate50-Wp-Fungicide-Benomyl-50-Wp-50-Wp-Fungicide-Benomyl-with-Best-Price-for-Sale.jpg"
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
      image: "https://cpimg.tistatic.com/08001205/s/4/Sodium-Sulphate-Anhydrous.jpg"
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
      image: "https://m.media-amazon.com/images/I/61Cra7kHlxL.jpg"
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
      image: "https://rukminim2.flixcart.com/image/480/640/xif0q/soil-manure/n/9/4/1-vermicompost-1kg-1-vermi-compost-original-imah947vhv8h9yye.jpeg?q=90"
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
      image: "https://m.media-amazon.com/images/I/71+CZ2NYGWL._AC_UF1000,1000_QL80_.jpg"
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
      image: "https://m.media-amazon.com/images/I/71+CZ2NYGWL._AC_UF1000,1000_QL80_.jpg"
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
      image: "https://dms.mydukaan.io/original/jpeg/upload_file_service/00ee6ab7-d259-42a3-b332-1b86310249cb/11.jpg"
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
      image: "https://www.legendagroindia.com/wp-content/uploads/2023/04/46.png"
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
      image: "https://m.media-amazon.com/images/I/81PrJVYjazL._AC_UF350,350_QL80_.jpg"
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
      image: "https://m.media-amazon.com/images/I/71qaEY+DyFL.jpg"
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
      image: "https://www.katyayaniorganics.com/wp-content/uploads/2022/06/Spino45-Slide-1.webp"
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
      image: "https://5.imimg.com/data5/ANDROID/Default/2025/7/525341580/VX/LJ/KD/11636987/product-jpeg-500x500.jpg"
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
      image: "https://m.media-amazon.com/images/I/61kA8t-efbL._AC_UF1000,1000_QL80_.jpg"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2023/2/CE/IN/IF/108900452/bacillus-thuringiensis.jpg"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2023/9/347884257/DF/RW/XS/4785906/neem-oil-cake.png"
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
      image: "https://m.media-amazon.com/images/I/61z21cm1Z9L._AC_UF1000,1000_QL80_.jpg"
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
      image: "https://5.imimg.com/data5/ANDROID/Default/2024/6/425760869/HR/AV/AY/221858701/product-jpeg-500x500.jpg"
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
      image: "https://m.media-amazon.com/images/I/81KDoh0ETfL.jpg"
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
      image: "https://m.media-amazon.com/images/I/61hCV6ZszJL._AC_UF1000,1000_QL80_.jpg"
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
      image: "https://dujjhct8zer0r.cloudfront.net/media/prod_image/18644183161735207229.webp"
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
      image: "https://m.media-amazon.com/images/I/8107IiNfJDL._AC_UF1000,1000_QL80_.jpg"
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
      image: "https://5.imimg.com/data5/XH/GJ/MY-3497614/phosphate-solubilizing-bacteria.png"
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
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbsU_Xr4HggM07Dt90HozfnazVuhNFT1eAOg&s"
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
      image: "https://organicbazar.net/cdn/shop/files/PlantGrowthPromoterNew.jpg?v=1703743756"
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
      image: "https://3.imimg.com/data3/UM/TC/MY-891317/sulphur-powder-500x500.jpg"
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
      image: "https://cpimg.tistatic.com/9757315/b/4/c-max-zeomax-advance-specially-activated-natural-zeolite-powder..jpg"
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
      image: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/now/now01492/l/63.jpg"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2023/9/348509780/MA/GW/ZY/190607023/whatsapp-image-2023-09-28-at-5-22-40-pm-500x500.jpeg"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2024/9/452850665/VE/AJ/BF/25369132/potassium-permanganate-chemical.jpeg"
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
      image: "https://m.media-amazon.com/images/I/71PHKQ8GYGL._AC_UF1000,1000_QL80_.jpg"
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
      image: "https://5.imimg.com/data5/SELLER/Default/2024/2/388657172/ZT/FB/YZ/181011561/vermicompost-tea-500x500.jpg"
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
      image: "https://www.thespruce.com/thmb/VA7xpXC6WabuEfrZpJIPWVlOPHw=/4206x0/filters:no_upscale():max_bytes(150000):strip_icc()/healthy-soil-and-how-to-make-it-2539853-hero-fdf9b0280dca41cb8ae9614e6fc4a0b0.jpg"
    },
    // ── SEEDS (22) ──
    {
      id: 71,
      name: "Apple Seeds",
      category: "seed",
      type: "Seed",
      description: "High germination apple seeds for orchard planting.",
      dosage: "As per planting guide",
      price: 120,
      unit: "100 g packet",
      rating: 4.5,
      reviews: 89,
      inStock: true,
      usage: "Sow in well-drained soil",
      benefits: ["High germination", "Disease resistant", "Uniform growth"],
      image: "https://media.istockphoto.com/id/474987794/photo/dry-apple-seeds.jpg?s=612x612&w=0&k=20&c=pwZGgdWA0Wa-xL389lB65rXG6xX_KSmlbQ0EMJ9YgZo="
    },
    {
      id: 72,
      name: "Banana Seeds",
      category: "seed",
      type: "Seed",
      description: "Quality banana seeds for plantation.",
      dosage: "As per planting guide",
      price: 100,
      unit: "100 g packet",
      rating: 4.4,
      reviews: 76,
      inStock: true,
      usage: "Sow in sandy loam soil",
      benefits: ["Good sprouting", "High yield potential"],
      image: "https://5.imimg.com/data5/ANDROID/Default/2020/12/LC/VP/XQ/43357090/product-jpeg-500x500.jpg"
    },
    {
      id: 73,
      name: "Blackgram Seeds",
      category: "seed",
      type: "Seed",
      description: "High-yielding blackgram seeds suitable for various soils.",
      dosage: "5-6 kg/ha",
      price: 80,
      unit: "1 kg packet",
      rating: 4.3,
      reviews: 54,
      inStock: true,
      usage: "Plant after rice harvest",
      benefits: ["Short duration", "Good disease tolerance"],
      image: "https://5.imimg.com/data5/PF/MN/MY-37621083/organic-black-gram-seeds.jpg"
    },
    {
      id: 74,
      name: "Chickpea Seeds",
      category: "seed",
      type: "Seed",
      description: "Premium chickpea seeds for rabi cultivation.",
      dosage: "80-100 kg/ha",
      price: 150,
      unit: "1 kg packet",
      rating: 4.6,
      reviews: 68,
      inStock: true,
      usage: "Sow in well-prepared soil",
      benefits: ["Good nodulation", "High protein content"],
      image: "https://cdn.britannica.com/65/176565-050-D6AB65D7/chickpeas-garbanzos.jpg"
    },
    {
      id: 75,
      name: "Coconut Seeds",
      category: "seed",
      type: "Seed",
      description: "Certified coconut seeds for new plantations.",
      dosage: "2-3 seeds/pit",
      price: 200,
      unit: "Pack of 10",
      rating: 4.2,
      reviews: 31,
      inStock: true,
      usage: "Plant in raised beds",
      benefits: ["Tolerant to salinity", "High oil content"],
      image: "https://5.imimg.com/data5/SELLER/Default/2022/8/WJ/OP/DK/1064512/coconut-seeds.jpeg"
    },
    {
      id: 76,
      name: "Coffee Seeds",
      category: "seed",
      type: "Seed",
      description: "Arabica coffee seeds for quality plantation.",
      dosage: "10-12 kg/ha",
      price: 250,
      unit: "500 g packet",
      rating: 4.7,
      reviews: 45,
      inStock: true,
      usage: "Sow in shade net",
      benefits: ["Uniform seedlings", "High cup quality"],
      image: "https://plus.unsplash.com/premium_photo-1666976506284-bbd70064976d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y29mZmVlJTIwc2VlZHxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
      id: 77,
      name: "Cotton Seeds",
      category: "seed",
      type: "Seed",
      description: "BT cotton seeds with superior boll quality.",
      dosage: "20-25 kg/ha",
      price: 180,
      unit: "1 kg packet",
      rating: 4.5,
      reviews: 92,
      inStock: true,
      usage: "Plant after monsoon onset",
      benefits: ["High ginning outturn", "Pest resistance"],
      image: "https://5.imimg.com/data5/SELLER/Default/2024/3/400318533/CZ/BF/CX/18861196/cotton-seeds.png"
    },
    {
      id: 78,
      name: "Grapes Seeds",
      category: "seed",
      type: "Seed",
      description: "Quality grape seeds for vineyard establishment.",
      dosage: "As per spacing",
      price: 220,
      unit: "100 seeds pack",
      rating: 4.4,
      reviews: 38,
      inStock: true,
      usage: "Sow in nursery beds",
      benefits: ["Good germination", "Disease free"],
      image: "https://media.istockphoto.com/id/97475269/photo/grapes-seeds.jpg?s=612x612&w=0&k=20&c=btL_9DNbVbzAXvkMr6OnYmymXBEfk7jif0gDT3NXIQM="
    },
    {
      id: 79,
      name: "Jute Seeds",
      category: "seed",
      type: "Seed",
      description: "Certified jute seeds for fibre production.",
      dosage: "7-8 kg/ha",
      price: 90,
      unit: "1 kg packet",
      rating: 4.2,
      reviews: 27,
      inStock: true,
      usage: "Sow after rice",
      benefits: ["Fast maturing", "High fibre"],
      image: "https://5.imimg.com/data5/SELLER/Default/2023/12/372286271/VQ/SM/LC/50667673/loose-jute-seeds.jpg"
    },
    {
      id: 80,
      name: "Kidneybeans Seeds",
      category: "seed",
      type: "Seed",
      description: "High-yield kidneybeans seeds for rabi cropping.",
      dosage: "50 kg/ha",
      price: 140,
      unit: "1 kg packet",
      rating: 4.3,
      reviews: 59,
      inStock: true,
      usage: "Plant in rows",
      benefits: ["Good shelf life", "Disease tolerant"],
      image: "https://5.imimg.com/data5/SELLER/Default/2021/1/IH/LS/DY/120490310/red-kidney-beans.jpg"
    },
    {
      id: 81,
      name: "Lentil Seeds",
      category: "seed",
      type: "Seed",
      description: "Premium lentil seeds for high protein yield.",
      dosage: "80-90 kg/ha",
      price: 160,
      unit: "1 kg packet",
      rating: 4.6,
      reviews: 71,
      inStock: true,
      usage: "Sow in well-drained soil",
      benefits: ["High protein", "Good nodulation"],
      image: "https://5.imimg.com/data5/SELLER/Default/2023/2/KJ/QA/RC/185067263/dried-lentil-seeds.jpeg"
    },
    {
      id: 82,
      name: "Maize Seeds",
      category: "seed",
      type: "Seed",
      description: "Hybrid maize seeds for robust growth.",
      dosage: "25 kg/ha",
      price: 200,
      unit: "1 kg packet",
      rating: 4.7,
      reviews: 102,
      inStock: true,
      usage: "Plant during monsoon",
      benefits: ["High yield", "Drought tolerant"],
      image: "https://5.imimg.com/data5/HO/NR/MY-43014498/maize-seed-500x500.jpg"
    },
    {
      id: 83,
      name: "Mango Seeds",
      category: "seed",
      type: "Seed",
      description: "Quality mango seeds for nursery propagation.",
      dosage: "N/A",
      price: 70,
      unit: "10 seeds pack",
      rating: 4.1,
      reviews: 54,
      inStock: true,
      usage: "Soak before sowing",
      benefits: ["Good germination", "Varietal purity"],
      image: "https://c.ndtvimg.com/2025-05/j9etk8cs_mango-seed_625x300_23_May_25.jpg?im=FeatureCrop,algorithm=dnn,width=620,height=350?im=FaceCrop,algorithm=dnn,width=1200,height=886"
    },
    {
      id: 84,
      name: "Mothbeans Seeds",
      category: "seed",
      type: "Seed",
      description: "Drought tolerant mothbeans seeds.",
      dosage: "8-10 kg/ha",
      price: 95,
      unit: "1 kg packet",
      rating: 4.3,
      reviews: 33,
      inStock: true,
      usage: "Sow in light soil",
      benefits: ["Quick maturity", "Low input"],
      image: "https://5.imimg.com/data5/SELLER/Default/2025/1/478254420/LE/OW/PX/124470028/moth-bean-seeds.jpg"
    },
    {
      id: 85,
      name: "Mungbean Seeds",
      category: "seed",
      type: "Seed",
      description: "Quality mungbean seeds with high protein.",
      dosage: "15 kg/ha",
      price: 110,
      unit: "1 kg packet",
      rating: 4.5,
      reviews: 60,
      inStock: true,
      usage: "Plant after wheat",
      benefits: ["Fast growth", "Nitrogen fixer"],
      image: "https://media.istockphoto.com/id/481275428/photo/mung-beans-poured-from-the-sack.jpg?s=612x612&w=0&k=20&c=0fhXUTSFNAOelDisralouhP__sWcJFCO8l-TI2j_cjc="
    },
    {
      id: 86,
      name: "Muskmelon Seeds",
      category: "seed",
      type: "Seed",
      description: "Sweet muskmelon seeds for high quality fruits.",
      dosage: "2 kg/ha",
      price: 130,
      unit: "500 g packet",
      rating: 4.4,
      reviews: 45,
      inStock: true,
      usage: "Sow in raised beds",
      benefits: ["Sweet taste", "High sugars"],
      image: "https://beejwala.com/cdn/shop/products/muskmelon-seeds-1_compressed_500x.jpg?v=1653576919"
    },
    {
      id: 87,
      name: "Orange Seeds",
      category: "seed",
      type: "Seed",
      description: "Citrus orange seeds for orchard establishment.",
      dosage: "Based on spacing",
      price: 90,
      unit: "Pack of 20",
      rating: 4.2,
      reviews: 29,
      inStock: true,
      usage: "Stratify before sowing",
      benefits: ["Good germination", "Disease free"],
      image: "https://m.media-amazon.com/images/I/512bWVtKb0L._AC_UF1000,1000_QL80_.jpg"
    },
    {
      id: 88,
      name: "Papaya Seeds",
      category: "seed",
      type: "Seed",
      description: "Fresh papaya seeds for quick sprouting.",
      dosage: "N/A",
      price: 50,
      unit: "Packet of 30",
      rating: 4.3,
      reviews: 40,
      inStock: true,
      usage: "Dry before storage",
      benefits: ["High viability", "Uniform growth"],
      image: "https://sustainablebartender.com/wp-content/uploads/2020/11/IMG_20201012_153653_1_-removebg-preview.png"
    },
    {
      id: 89,
      name: "Pigeonpeas Seeds",
      category: "seed",
      type: "Seed",
      description: "Durable pigeonpeas seeds for kharif season.",
      dosage: "30 kg/ha",
      price: 120,
      unit: "1 kg packet",
      rating: 4.4,
      reviews: 52,
      inStock: true,
      usage: "Sow in rows",
      benefits: ["Drought resistance", "Protein rich"],
      image: "https://media.istockphoto.com/id/1840879008/photo/pigeon-pea-grain-cajanus-cajan.jpg?s=612x612&w=0&k=20&c=17IWoQV1WrEwWyy39DxGPHlSOqIoBIbZMM_JEodCuUs="
    },
    {
      id: 90,
      name: "Pomegranate Seeds",
      category: "seed",
      type: "Seed",
      description: "High quality pomegranate seeds for orchards.",
      dosage: "N/A",
      price: 210,
      unit: "Pack of 15",
      rating: 4.5,
      reviews: 34,
      inStock: true,
      usage: "Clean before sowing",
      benefits: ["High germination", "Vigorous seedlings"],
      image: "https://5.imimg.com/data5/SELLER/Default/2023/10/357137876/IM/DH/CN/4859852/dry-pomegranate-seeds-500x500.jpg"
    },
    {
      id: 91,
      name: "Rice Seeds",
      category: "seed",
      type: "Seed",
      description: "HYV rice seeds for high-yield cultivation.",
      dosage: "40 kg/ha",
      price: 160,
      unit: "1 kg packet",
      rating: 4.6,
      reviews: 150,
      inStock: true,
      usage: "Nursery bed method",
      benefits: ["Short duration", "High yield"],
      image: "https://m.media-amazon.com/images/I/51+DIZ54e5L._AC_UF1000,1000_QL80_.jpg"
    },
    {
      id: 92,
      name: "Watermelon Seeds",
      category: "seed",
      type: "Seed",
      description: "Sweet watermelon seeds for summer crop.",
      dosage: "2 kg/ha",
      price: 140,
      unit: "500 g packet",
      rating: 4.5,
      reviews: 81,
      inStock: true,
      usage: "Plant in ridges",
      benefits: ["Fruit sweetness", "High weight"],
      image: "https://thewholesaler.in/cdn/shop/products/WATERMELON-SEEDS-Citrullus-lanatus-TheWholesalerCo-35646936_460x@2x.jpg?v=1755873725"
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

 // Check for highlighted product from FarmingTips or CropRecommendation page
  useEffect(() => {
    // Inject flash-highlight CSS once
    const styleId = 'flash-highlight-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes flashPulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.8), 0 0 0 0 rgba(34,197,94,0.4); }
          30%  { box-shadow: 0 0 0 12px rgba(34,197,94,0.5), 0 0 32px 8px rgba(34,197,94,0.3); }
          60%  { box-shadow: 0 0 0 6px rgba(34,197,94,0.3), 0 0 16px 4px rgba(34,197,94,0.15); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0), 0 0 0 0 rgba(34,197,94,0); }
        }
        .flash-highlight {
          animation: flashPulse 1s ease-out 3;
          outline: 3px solid #22c55e !important;
          outline-offset: 2px;
        }
      `;
      document.head.appendChild(style);
    }

    const productId = sessionStorage.getItem('highlightProductId');
    const category  = sessionStorage.getItem('highlightCategory'); // 'fertilizer' | 'organic' | 'seed' | 'pesticide'
    const cropName  = sessionStorage.getItem('highlightCropName');

    if (productId) {
      const id = parseInt(productId);
      setHighlightedProductId(id);

      // Set category filter so the highlighted product card is visible immediately
      if (category) {
        setSelectedCategory(category);
      } else {
        // Legacy fallback: if no category stored, show all products
        setSelectedCategory('all');
      }

      // Clear sessionStorage
      sessionStorage.removeItem('highlightProductId');
      sessionStorage.removeItem('highlightCategory');
      sessionStorage.removeItem('highlightCropName');

      // If crop name was stored, pre-fill the search
      if (cropName) {
        const displayName = cropName.charAt(0).toUpperCase() + cropName.slice(1);
        setSearchQuery(displayName);
      }

      // Scroll to the highlighted product after render
      setTimeout(() => {
        const productElement = document.getElementById(`product-${id}`);
        if (productElement) {
          productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          productElement.classList.add('flash-highlight');
          setTimeout(() => {
            productElement.classList.remove('flash-highlight');
            setHighlightedProductId(null);
          }, 3500);
        }
      }, 600);
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
            Premium Seeds, Fertilizers, Pesticides & Organic Products for Indian Farmers - Direct Supply at Best Prices
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
                <option value="seed">Seeds</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                {selectedCategory === 'seed' ? 'Seeds' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
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
                      product.category === 'organic' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' :
                      /* seeds */ 'bg-gradient-to-r from-yellow-500 to-yellow-700'
                    } text-white px-2 py-0.5 rounded-full text-xs font-bold uppercase z-10 shadow-lg`}>
                      {product.type}
                    </div>
                    
                    <div className="h-40 overflow-hidden bg-gray-100">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
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
                      <div className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden bg-gray-200">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
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
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
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