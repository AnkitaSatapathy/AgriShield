import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sprout, Droplets, ThermometerSun, FlaskConical,
  Cloud, CheckCircle, XCircle, TrendingUp,
  Database, Activity, RefreshCw, Loader2,
  BarChart3, Wind, ChevronLeft, ChevronRight,
  Info, BookOpen, TestTube, ExternalLink,
  Phone, Globe, Leaf, AlertTriangle, Zap,
  Sun, Target, Award, ArrowRight, Sparkles,
  Thermometer, CloudRain, Gauge
} from "lucide-react";

/* ─────────────────────────────────────────────
   GLOBAL STYLES injected once
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --c-soil:   #3d2b1f;
    --c-green:  #1a6b3a;
    --c-lime:   #4caf50;
    --c-gold:   #c8973a;
    --c-cream:  #faf7f0;
    --c-mist:   #f1f5f0;
    --c-slate:  #334155;
    --c-fog:    #e8ede6;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--c-mist); }

  .serif { font-family: 'DM Serif Display', serif; }

  /* ── Keyframes ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideRight {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(76,175,80,0.35); }
    70%  { box-shadow: 0 0 0 14px rgba(76,175,80,0); }
    100% { box-shadow: 0 0 0 0 rgba(76,175,80,0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes floatY {
    0%, 100% { transform: translateY(0px);  }
    50%       { transform: translateY(-6px); }
  }
  @keyframes counterUp {
    from { opacity: 0; transform: translateY(12px) scale(0.9); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes dotPulse {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
    40%           { transform: scale(1.1); opacity: 1; }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes borderGlow {
    0%, 100% { border-color: rgba(76,175,80,0.4); box-shadow: 0 0 0 0 rgba(76,175,80,0); }
    50%       { border-color: rgba(76,175,80,0.9); box-shadow: 0 0 16px 2px rgba(76,175,80,0.2); }
  }

  /* ── Utility animation classes ── */
  .anim-fade-up   { animation: fadeUp 0.55s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-fade-in   { animation: fadeIn 0.45s ease both; }
  .anim-scale-in  { animation: scaleIn 0.4s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-slide-in  { animation: slideIn 0.4s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-float     { animation: floatY 3.5s ease-in-out infinite; }
  .anim-pulse-ring{ animation: pulse-ring 2s ease-out infinite; }
  .anim-glow-border { animation: borderGlow 2.5s ease-in-out infinite; }

  /* stagger helpers */
  .d1  { animation-delay: 0.05s; }
  .d2  { animation-delay: 0.12s; }
  .d3  { animation-delay: 0.20s; }
  .d4  { animation-delay: 0.28s; }
  .d5  { animation-delay: 0.36s; }
  .d6  { animation-delay: 0.44s; }

  /* ── Hover lift ── */
  .hover-lift {
    transition: transform 0.22s cubic-bezier(.22,.68,0,1.2), box-shadow 0.22s ease;
  }
  .hover-lift:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.10);
  }

  /* ── Input focus glow ── */
  .input-field:focus {
    outline: none;
    border-color: var(--c-lime);
    box-shadow: 0 0 0 3px rgba(76,175,80,0.18);
  }

  /* ── Shimmer button ── */
  .btn-primary {
    background: linear-gradient(135deg, #1a6b3a 0%, #2e9e56 50%, #1a6b3a 100%);
    background-size: 200% auto;
    transition: background-position 0.5s ease, transform 0.18s ease, box-shadow 0.18s ease;
  }
  .btn-primary:hover {
    background-position: right center;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(26,107,58,0.35);
  }
  .btn-primary:active { transform: translateY(0); }

  /* ── Progress bar fill animation ── */
  .progress-fill {
    transform-origin: left;
    animation: slideRight 1s cubic-bezier(.22,.68,0,1.2) 0.3s both;
  }

  /* ── Card shimmer on hover ── */
  .card-shimmer {
    position: relative;
    overflow: hidden;
  }
  .card-shimmer::after {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    transition: left 0.5s ease;
    pointer-events: none;
  }
  .card-shimmer:hover::after { left: 140%; }

  /* ── Dot loader ── */
  .dot-loader span {
    display: inline-block; width: 7px; height: 7px;
    border-radius: 50%; background: currentColor;
    animation: dotPulse 1.4s ease-in-out infinite;
  }
  .dot-loader span:nth-child(2) { animation-delay: 0.2s; }
  .dot-loader span:nth-child(3) { animation-delay: 0.4s; }

  /* ── Why-chip pill ── */
  .why-chip {
    transition: background 0.2s, transform 0.18s;
  }
  .why-chip:hover { transform: translateY(-2px); }

  /* ── Scrollbar thin ── */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #c8c8c8; border-radius: 4px; }

  /* ── Tab underline slide ── */
  .tab-underline {
    position: relative;
  }
  .tab-underline::after {
    content: '';
    position: absolute; bottom: 0; left: 0;
    width: 100%; height: 2px;
    background: var(--c-gold);
    transform: scaleX(0);
    transition: transform 0.25s ease;
    transform-origin: center;
  }
  .tab-underline.active::after { transform: scaleX(1); }

  /* ── Metric counter ── */
  .metric-num {
    animation: counterUp 0.6s cubic-bezier(.22,.68,0,1.2) both;
  }
`;

function GlobalStyles() {
  useEffect(() => {
    const id = "agrishield-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
  }, []);
  return null;
}

/* ─────────────────────────────────────────────
   CROP DATA
───────────────────────────────────────────── */
// load all crop images from shared data/images directory (Vite glob)
const cropImageModules = import.meta.glob('../data/images/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });

function getCropImage(name) {
  if (!name) return '';
  const key = Object.keys(cropImageModules).find(p =>
    p.toLowerCase().includes(name.toLowerCase())
  );
  return key ? cropImageModules[key] : '';
}

const CROPS = [
  { name:"Rice",        icon:"🌾", img:getCropImage("Rice"), shortDesc:"Staple crop thriving in flooded fields",       description:"Rice is a water-loving cereal grain that forms the basis of diets for over half the world. It thrives in warm, humid climates with standing water, making it ideal for lowland and delta regions.", idealConditions:"High humidity (80-90%), temperature 20-25°C, acidic soil pH 6-7, abundant rainfall 200-300mm.", benefits:"High yield potential up to 6t/ha, drought-resistant varieties available, excellent carbohydrate source.", tips:"Maintain 2-5 inches standing water. Use split nitrogen doses. Rotate with legumes to restore N." },
  { name:"Wheat",       icon:"🌿", img:getCropImage("Wheat"), shortDesc:"Versatile grain for bread and flour",          description:"Wheat is the world's most widely grown cereal crop, prized for its gluten content that makes it ideal for baking. It prefers cool, dry climates during grain fill.", idealConditions:"Cool temperatures 15-20°C, moderate humidity 60-70%, neutral soil pH 6-7, seasonal rainfall 400-600mm.", benefits:"High protein content 10-12%, versatile end-uses, shorter crop duration 110-130 days.", tips:"Sow in November-December. Irrigate at crown root, flowering, and grain-fill stages. Monitor for rust." },
  { name:"Apple",       icon:"🍎", img:getCropImage("Apple"), shortDesc:"Premium temperate fruit for highlands",         description:"Apple is a high-value temperate fruit crop requiring cold winters for proper dormancy and bud break. It thrives in hilly regions and commands strong market prices.", idealConditions:"Temperature 20-25°C, chilling hours 1000+, well-drained soil pH 5.5-6.5, moderate rainfall 1000-1200mm.", benefits:"High per-kg returns, long shelf life, excellent export demand, productive for 30-40 years.", tips:"Prune annually in dormancy. Apply calcium sprays to prevent bitter pit. Thin fruits in June." },
  { name:"Banana",      icon:"🍌", img:getCropImage("Banana"), shortDesc:"Year-round income — fast crop cycle",         description:"Banana is one of the world's most productive crops per unit area, providing continuous income as ratoon crops keep yielding for years from a single planting.", idealConditions:"Temperature 26-30°C, high humidity 70-90%, deep loamy soil pH 6-7.5, high water 1200-2200mm.", benefits:"8-12 t/acre yield, 11-month crop cycle, continuous ratoon harvests for 3-5 years.", tips:"Remove all suckers except one ratoon. Bag fruit bunches at shooting. Irrigate every 3-5 days in summer." },
  { name:"Blackgram",   icon:"🫘", img:getCropImage("Blackgram"), shortDesc:"Fast-maturing pulse with protein power",       description:"Blackgram (Urad dal) is a popular pulse crop of the Indian subcontinent, valued for its high protein content and role in improving soil fertility through nitrogen fixation.", idealConditions:"Warm temperature 25-35°C, moderate humidity, well-drained soil pH 6-7.5, moderate rainfall 600-1000mm.", benefits:"Fixes nitrogen naturally, short duration 60-90 days, high demand as dal in domestic markets.", tips:"Sow at 30x10cm spacing. Avoid waterlogged soils. Harvest pods when they turn black." },
  { name:"Chickpea",    icon:"🟡", img:getCropImage("Chickpea"), shortDesc:"Hardy legume for dry Rabi seasons",           description:"Chickpea is India's most important pulse crop, providing affordable plant protein to millions. It is highly drought-tolerant and fixes atmospheric nitrogen.", idealConditions:"Cool dry climate 15-25°C, low humidity, neutral-alkaline soil pH 6-9, low rainfall 400-500mm.", benefits:"Drought-tolerant, fixes 40-60 kg N/ha, 0.8-1.5 t/acre yield, high protein content.", tips:"Sow October-November in well-drained soil. Avoid waterlogging. Treat seeds with Rhizobium culture." },
  { name:"Coconut",     icon:"🥥", img:getCropImage("Coconut"), shortDesc:"Coastal perennial — 100 years of returns",    description:"The coconut palm is called the 'tree of life' — every part is commercially valuable. It thrives in tropical coastal regions with high humidity and regular rainfall.", idealConditions:"Temperature 20-32°C, high humidity 80-90%, sandy loam pH 5.5-7, high rainfall or irrigation.", benefits:"Productive for 80-100 years, all parts commercially valuable, 40-60 nuts/tree/year.", tips:"Apply potassium-rich fertilizer twice yearly. Mulch heavily at base. Watch for Rhinoceros beetle attacks." },
  { name:"Coffee",      icon:"☕", img:getCropImage("Coffee"), shortDesc:"Premium highland perennial for export",        description:"Coffee is a high-altitude perennial crop that produces prized berries with complex aromatic compounds. Arabica varieties command premium export prices.", idealConditions:"Temperature 15-24°C, high humidity, acidic pH 5.5-6.5, moderate rainfall well-distributed 1500-2500mm.", benefits:"High export value, 30-40 year productive life, supports agro-biodiversity under shade trees.", tips:"Prune annually after harvest. Harvest only red-ripe cherries. Compost pulp back into soil." },
  { name:"Cotton",      icon:"☁️", img:getCropImage("Cotton"), shortDesc:"White gold — premier fiber cash crop",        description:"Cotton is one of the most economically important fiber crops, producing soft bolls used in textiles worldwide. It thrives in long frost-free seasons with high temperatures.", idealConditions:"Warm temperatures 25-30°C, moderate humidity 60-70%, slightly acidic pH 6-7, rainfall 700-900mm.", benefits:"Premium cash crop with high per-acre returns, by-products include cottonseed oil and cakes.", tips:"Control bollworm and whitefly regularly. Apply gypsum in alkaline soils. Pick when bolls fully open." },
  { name:"Grapes",      icon:"🍇", img:getCropImage("Grapes"), shortDesc:"Premium vineyard crop for wine and table",    description:"Grapes are a high-value horticultural crop used for fresh consumption, raisins, juice, and wine. They thrive in semi-arid regions with well-defined seasons.", idealConditions:"Temperature 15-35°C, low humidity during harvest, well-drained loamy soil pH 5.5-7, low rainfall 600-800mm.", benefits:"High per-acre value, multiple end-use markets, suitable for drip irrigation farming.", tips:"Train on trellis. Prune canes severely in winter. Apply potassium sulfate before veraison." },
  { name:"Jute",        icon:"🌱", img:getCropImage("Jute"), shortDesc:"Golden fibre — eco-friendly industrial crop",  description:"Jute is the second most important vegetable fibre after cotton. Known as the 'golden fibre', it is biodegradable, eco-friendly, and used in textiles and packaging.", idealConditions:"Warm humid climate 24-37°C, high humidity 70-90%, alluvial soil pH 6-7.5, heavy rainfall 1500-2000mm.", benefits:"Quick 120-day growth cycle, high demand in packaging industry, improves soil structure.", tips:"Sow in March-April with onset of monsoon. Ret bundles in clean water for 20 days. Dry in shade." },
  { name:"Kidneybeans", icon:"🫘", img:getCropImage("Kidneybeans"), shortDesc:"Protein-rich legume for diverse cuisines",    description:"Kidney beans are a widely consumed legume globally, prized for their high protein and fiber content. They are an important Kharif crop in hilly and rain-fed regions.", idealConditions:"Moderate temperature 18-24°C, moderate humidity, well-drained loamy soil pH 6-7, moderate rainfall 300-400mm.", benefits:"High protein 22-23%, nitrogen-fixing, 45-60 day maturity, strong export demand.", tips:"Avoid sowing in waterlogged areas. Hill up at knee height. Harvest when pods are dry and hard." },
  { name:"Lentil",      icon:"🫘", img:getCropImage("Lentil"), shortDesc:"Drought-hardy winter pulse with high nutrition",description:"Lentil is one of the oldest cultivated crops and a vital protein source in South Asian diets. It grows well in dry, cool winter conditions with minimal irrigation needs.", idealConditions:"Cool temperature 15-25°C, low humidity, well-drained soil pH 6-8, low rainfall 250-400mm.", benefits:"Excellent drought tolerance, fixes nitrogen, 80-100 day maturity, high protein 24-26%.", tips:"Inoculate seeds with Rhizobium. Sow October-November. Avoid saline soils. Harvest at 20% pod moisture." },
  { name:"Maize",       icon:"🌽", img:getCropImage("Maize"), shortDesc:"High-yield grain for food and fodder",         description:"Maize is the highest-yielding cereal globally, used for food, animal feed, and industrial applications. It is highly adaptable and responds well to inputs.", idealConditions:"Warm temperatures 20-30°C, moderate humidity 50-70%, neutral pH 6-7, adequate rainfall 500-800mm.", benefits:"Very high yield potential 4-6t/acre, suitable for mechanised farming, excellent fodder crop.", tips:"Maintain 20-25cm plant spacing. Apply herbicides within 3 days of sowing. Harvest at 30% moisture." },
  { name:"Mango",       icon:"🥭", img:getCropImage("Mango"), shortDesc:"King of fruits — decades of income",          description:"Mango is India's most beloved fruit tree, with over 1,000 varieties. A well-managed orchard provides reliable income for 40-50 years with minimal inputs.", idealConditions:"Temperature 24-30°C, low humidity during flowering, well-drained soil pH 5.5-7.5, dry pre-flowering period.", benefits:"Productive for 40-50 years, 3-5 t/acre yield, strong domestic and export demand.", tips:"Apply potash-rich fertilizer before flowering. Allow a dry period of 2-3 months before flowering. Prune after harvest." },
  { name:"Mothbeans",   icon:"🫘", img:getCropImage("Mothbeans"), shortDesc:"Extreme drought-tolerant Kharif pulse",       description:"Mothbeans (Matki) are one of the most drought-tolerant legumes grown in arid and semi-arid regions. They are an important food security crop requiring minimal rainfall.", idealConditions:"Hot dry temperature 24-38°C, low humidity, sandy loam soil pH 6.5-8, very low rainfall 200-400mm.", benefits:"Extreme drought tolerance, nitrogen-fixing, critical in arid zone food security, high feed value.", tips:"Sow at very low seed rate. No supplemental irrigation needed. Harvest pods as they mature to avoid shattering." },
  { name:"Mungbean",    icon:"🫘", img:getCropImage("Mungbean"), shortDesc:"Short-duration summer pulse — dual season", description:"Mungbean (Green gram) is a fast-growing legume with a 60-75 day crop cycle, allowing it to fit in as a break crop between main seasons. Highly valued as a nutritious dal.", idealConditions:"Warm temperature 25-35°C, moderate humidity, well-drained loamy soil pH 6.5-7.5, moderate rainfall 500-700mm.", benefits:"Very short duration 60-75 days, fits in as relay crop, nitrogen-fixing, high market price.", tips:"Sow in rows 30cm apart. Avoid excessive nitrogen. Harvest pods when 80% turn brown." },
  { name:"Muskmelon",   icon:"🍈", img:getCropImage("Muskmelon"), shortDesc:"Sweet summer crop — 80-day fast returns",    description:"Muskmelon is a warm-season cucurbit grown primarily in summer. With a short growing period and high demand, it provides excellent short-term income for farmers.", idealConditions:"Temperature 24-35°C, low humidity during fruit maturity, sandy loam soil pH 6-7, moderate water.", benefits:"Short 75-90 day cycle, 4-6 t/acre yield, premium summer pricing, suitable for sandy river beds.", tips:"Train vines to single stem. Irrigate by furrow only. Stop irrigation 7-10 days before harvest for sweeter fruit." },
  { name:"Orange",      icon:"🍊", img:getCropImage("Orange"), shortDesc:"Citrus perennial with vitamin-rich fruits",    description:"Orange is a major commercial citrus crop producing vitamin C-rich fruits with strong domestic and juice industry demand. It is a long-term investment crop.", idealConditions:"Subtropical temperature 20-30°C, moderate humidity, well-drained loamy soil pH 6-7, moderate rainfall.", benefits:"Productive for 15-20 years, strong juice industry demand, 3-6 t/acre yield, high nutritional value.", tips:"Prune lightly to maintain canopy. Apply micronutrients including zinc and boron. Control citrus psylla." },
  { name:"Papaya",      icon:"🍈", img:getCropImage("Papaya"), shortDesc:"Fastest-growing tropical fruit tree",          description:"Papaya is one of the fastest-fruiting tropical crops, bearing fruit within 9-12 months of planting. It is grown for fresh fruit, papain enzyme, and industrial processing.", idealConditions:"Warm temperature 22-32°C, moderate humidity, well-drained loamy soil pH 6-6.5, regular irrigation.", benefits:"First harvest within 9-12 months, 15-20 t/acre yield, papain extraction adds revenue.", tips:"Plant on raised beds for drainage. Remove male plants leaving one per 10 females. Harvest at 20% colour break." },
  { name:"Pigeonpeas",  icon:"🫘", img:getCropImage("Pigeonpeas"), shortDesc:"Long-duration legume — drought warrior",      description:"Pigeonpea (Tur/Arhar dal) is one of the most drought-tolerant crop plants, deeply rooted to access subsoil moisture. It is the second most important pulse in India.", idealConditions:"Warm temperature 18-30°C, low-moderate humidity, well-drained soil pH 6-7.5, low rainfall 600-1000mm.", benefits:"Deep root system improves soil, fixes 40-200 kg N/ha, multi-cut pigeon pea for fodder use.", tips:"Sow June-July. Intercrop with cereals for best yield. Harvest when 75% of pods turn brown." },
  { name:"Pomegranate", icon:"🔴", img:getCropImage("Pomegranate"), shortDesc:"Drought-tolerant superfruit with premium value", description:"Pomegranate is a highly profitable, drought-tolerant fruit crop well-suited to semi-arid climates. It commands premium prices both domestically and for export.", idealConditions:"Temperature 25-35°C, low humidity, well-drained loamy soil pH 6.5-7.5, low-moderate rainfall.", benefits:"Excellent drought tolerance, 8-10 t/acre yield, high export value, productive for 25 years.", tips:"Train as single stem. Prune 3-4 primary branches. Bag individual fruits for premium quality." },
  { name:"Sugarcane",   icon:"🎋", img:getCropImage("Sugarcane"), shortDesc:"Tropical giant — 12-month income cycle",      description:"Sugarcane is a tall perennial grass that provides sucrose for sugar production, along with valuable by-products like molasses, bagasse, and ethanol.", idealConditions:"Hot climate 25-35°C, high humidity 80-85%, deep rich soil pH 6-7.5, high water availability.", benefits:"30-40 t/acre yield, multiple ratoon crops, by-products add 40% revenue.", tips:"Plant setts 5-7cm deep, 90cm row spacing. Earthing-up at 45 days. Harvest when brix reaches 20%." },
  { name:"Watermelon",  icon:"🍉", img:getCropImage("Watermelon"), shortDesc:"Fast returns — 80-day summer crop",            description:"Watermelon is a warm-season cucurbit that delivers rapid returns in 80-90 days. Sandy soils and warm temperatures produce the sweetest, highest-quality fruits.", idealConditions:"Temperature 21-35°C, moderate humidity, sandy loam pH 6-7, moderate water with good drainage.", benefits:"80-90 day crop cycle, 8-12 t/acre yield, high summer market premium.", tips:"Use drip irrigation. Ensure cross-pollination with bees. Harvest when the tendril nearest fruit dries." },
];

const CROP_INFO = {
  rice:        { when:"June–July (Kharif)",     water:"High",          yield:"2–3 t/acre",      icon:"🌾", season:"Kharif" },
  wheat:       { when:"Oct–Nov (Rabi)",          water:"Moderate",      yield:"1.5–2.5 t/acre",  icon:"🌿", season:"Rabi" },
  maize:       { when:"June–July / Feb–Mar",     water:"Moderate",      yield:"2–4 t/acre",      icon:"🌽", season:"Kharif/Rabi" },
  jute:        { when:"March–May",               water:"Moderate",      yield:"2–3 t/acre",      icon:"🌱", season:"Kharif" },
  cotton:      { when:"April–June",              water:"Moderate–High", yield:"0.5–1.5 t/acre",  icon:"☁️", season:"Kharif" },
  sugarcane:   { when:"January–March",           water:"Very High",     yield:"30–40 t/acre",    icon:"🎋", season:"Annual" },
  coffee:      { when:"June–August",             water:"Moderate",      yield:"0.5–1 t/acre",    icon:"☕", season:"Perennial" },
  mango:       { when:"July–Aug (planting)",     water:"Low–Moderate",  yield:"3–5 t/acre",      icon:"🥭", season:"Perennial" },
  banana:      { when:"Year-round",              water:"High",          yield:"8–12 t/acre",     icon:"🍌", season:"Annual" },
  grapes:      { when:"January–March",           water:"Low–Moderate",  yield:"4–6 t/acre",      icon:"🍇", season:"Perennial" },
  pomegranate: { when:"June–August",             water:"Low",           yield:"3–5 t/acre",      icon:"🔴", season:"Perennial" },
  watermelon:  { when:"Feb–March",               water:"Moderate",      yield:"8–12 t/acre",     icon:"🍉", season:"Summer" },
  muskmelon:   { when:"Feb–March",               water:"Moderate",      yield:"4–6 t/acre",      icon:"🍈", season:"Summer" },
  apple:       { when:"Nov–Dec (planting)",      water:"Moderate",      yield:"3–5 t/acre",      icon:"🍎", season:"Perennial" },
  orange:      { when:"June–August",             water:"Moderate",      yield:"3–6 t/acre",      icon:"🍊", season:"Perennial" },
  papaya:      { when:"May–June / Sept–Oct",     water:"High",          yield:"15–20 t/acre",    icon:"🍈", season:"Annual" },
  coconut:     { when:"June–Aug (planting)",     water:"High",          yield:"40–60 nuts/tree", icon:"🥥", season:"Perennial" },
  motherbeans: { when:"June–July",               water:"Low",           yield:"0.5–1 t/acre",    icon:"🫘", season:"Kharif" },
  mothbeans:   { when:"June–July",               water:"Low",           yield:"0.5–1 t/acre",    icon:"🫘", season:"Kharif" },
  mungbean:    { when:"Feb–Mar / Jun–Jul",       water:"Low–Moderate",  yield:"0.5–1 t/acre",    icon:"🫘", season:"Kharif/Rabi" },
  blackgram:   { when:"June–July",               water:"Low–Moderate",  yield:"0.4–0.8 t/acre",  icon:"🫘", season:"Kharif" },
  lentil:      { when:"Oct–Nov (Rabi)",          water:"Low",           yield:"0.5–1 t/acre",    icon:"🫘", season:"Rabi" },
  pigeonpeas:  { when:"June–July",               water:"Low",           yield:"0.8–1.5 t/acre",  icon:"🫘", season:"Kharif" },
  chickpea:    { when:"Oct–Nov (Rabi)",          water:"Low",           yield:"0.8–1.5 t/acre",  icon:"🫘", season:"Rabi" },
  kidneybeans: { when:"June–July",               water:"Moderate",      yield:"0.8–1.5 t/acre",  icon:"🫘", season:"Kharif" },
};

function getCropInfo(name) {
  return CROP_INFO[name?.toLowerCase()] || { when:"Consult local office", water:"Moderate", yield:"Varies", icon:"🌱", season:"Varies" };
}

/* ── Marketplace seed product ID map ── */
const CROP_SEED_IDS = {
  apple:       71,
  banana:      72,
  blackgram:   73,
  chickpea:    74,
  coconut:     75,
  coffee:      76,
  cotton:      77,
  grapes:      78,
  jute:        79,
  kidneybeans: 80,
  lentil:      81,
  maize:       82,
  mango:       83,
  mothbeans:   84,
  mungbean:    85,
  muskmelon:   86,
  orange:      87,
  papaya:      88,
  pigeonpeas:  89,
  pomegranate: 90,
  rice:        91,
  watermelon:  92,
  sugarcane:   93,
  wheat:       94,
};

function getMarketplaceLink(cropName) {
  const id = CROP_SEED_IDS[cropName?.toLowerCase()];
  return { seedId: id || null };
}



/* Dynamic "why this crop" reasons based on actual input values */
function buildWhyReasons(cropName, N, P, K, ph, temp, humidity, rainfall) {
  const reasons = [];
  const c = cropName?.toLowerCase();

  // pH reasoning
  if (ph >= 5.5 && ph <= 6.5) {
    if (["rice","maize","soybean","cotton","coffee"].includes(c))
      reasons.push({ icon:"⚗️", text:`Your soil pH of ${ph} falls in the ideal slightly-acidic range for ${cropName}`, tag:"Soil pH", color:"#e8f5e9" });
  } else if (ph >= 6.5 && ph <= 7.5) {
    if (["wheat","chickpea","lentil","sugarcane","maize"].includes(c))
      reasons.push({ icon:"⚗️", text:`Neutral pH ${ph} is optimal for ${cropName}'s nutrient uptake`, tag:"Soil pH", color:"#e8f5e9" });
  } else if (ph > 7.5) {
    if (["sugarcane","chickpea","barley"].includes(c))
      reasons.push({ icon:"⚗️", text:`Your alkaline pH ${ph} suits ${cropName} which tolerates higher pH levels`, tag:"Soil pH", color:"#e8f5e9" });
  } else {
    reasons.push({ icon:"⚗️", text:`Soil pH ${ph} has been matched to crops that thrive in these acidic conditions`, tag:"Soil pH", color:"#e8f5e9" });
  }

  // Nitrogen
  if (N >= 60 && N <= 120)
    reasons.push({ icon:"🟢", text:`Your nitrogen level of ${N} kg/ha is adequate, supporting healthy leaf and stem growth`, tag:"Nitrogen", color:"#f1f8e9" });
  else if (N < 40)
    reasons.push({ icon:"🟢", text:`Low nitrogen (${N} kg/ha) favours leguminous crops that fix their own N from air`, tag:"Nitrogen", color:"#f1f8e9" });
  else
    reasons.push({ icon:"🟢", text:`Nitrogen at ${N} kg/ha supports high-demand crops like ${cropName}`, tag:"Nitrogen", color:"#f1f8e9" });

  // Temperature
  if (temp >= 20 && temp <= 30)
    reasons.push({ icon:"🌡️", text:`Temperature ${temp}°C is within the optimal range for ${cropName}'s vegetative and reproductive stages`, tag:"Temperature", color:"#fff3e0" });
  else if (temp < 20)
    reasons.push({ icon:"🌡️", text:`Cool temperature ${temp}°C favours crops like ${cropName} that prefer temperate conditions`, tag:"Temperature", color:"#fff3e0" });
  else
    reasons.push({ icon:"🌡️", text:`High temperature ${temp}°C matches ${cropName}'s preference for tropical warmth`, tag:"Temperature", color:"#fff3e0" });

  // Rainfall
  if (rainfall >= 100 && rainfall <= 200)
    reasons.push({ icon:"🌧️", text:`Rainfall of ${rainfall}mm/month is well-matched to ${cropName}'s moderate water requirement`, tag:"Rainfall", color:"#e3f2fd" });
  else if (rainfall > 200)
    reasons.push({ icon:"🌧️", text:`High rainfall ${rainfall}mm suits water-intensive crops like ${cropName} that thrive in wet conditions`, tag:"Rainfall", color:"#e3f2fd" });
  else
    reasons.push({ icon:"🌧️", text:`Low rainfall ${rainfall}mm is matched to drought-tolerant ${cropName}`, tag:"Rainfall", color:"#e3f2fd" });

  // Humidity
  if (humidity >= 60 && humidity <= 80)
    reasons.push({ icon:"💧", text:`Relative humidity ${humidity}% creates ideal conditions for ${cropName}'s growth and pollination`, tag:"Humidity", color:"#e8eaf6" });
  else if (humidity > 80)
    reasons.push({ icon:"💧", text:`High humidity ${humidity}% supports water-loving ${cropName} which thrives in humid climates`, tag:"Humidity", color:"#e8eaf6" });
  else
    reasons.push({ icon:"💧", text:`Dry conditions (${humidity}% humidity) suit crops like ${cropName} that prefer low moisture`, tag:"Humidity", color:"#e8eaf6" });

  // NPK balance bonus
  if (Math.abs(N - P) < 25 && Math.abs(P - K) < 25)
    reasons.push({ icon:"⚖️", text:`Your NPK ratio (${N}:${P}:${K}) is well-balanced, which the model weighted strongly in this prediction`, tag:"NPK Balance", color:"#fce4ec" });

  return reasons.slice(0, 5);
}

function getSoilTips(N, P, K, ph) {
  const tips = [];
  if (ph < 5.5)      tips.push("Soil is acidic — apply agricultural lime to raise pH before sowing");
  else if (ph > 7.5) tips.push("Soil is alkaline — apply gypsum or sulfur amendments to lower pH");
  else               tips.push(`Soil pH ${ph} is in a healthy range, requiring no immediate correction`);
  if (N < 40)        tips.push("Nitrogen is low — apply urea (45kg/bag) or farm compost before planting");
  else if (N > 120)  tips.push("Nitrogen is high — reduce nitrogenous fertilizers to avoid lodging");
  else               tips.push("Nitrogen levels are adequate for strong vegetative growth");
  if (P < 20)        tips.push("Phosphorus is low — apply SSP or DAP at planting for better root development");
  else               tips.push("Phosphorus levels support good root development and flowering");
  const balanced = Math.abs(N - P) < 25 && Math.abs(P - K) < 25;
  return {
    health: balanced ? "NPK ratio is well-balanced" : "NPK ratio is imbalanced — consider targeted amendments",
    tips: tips.slice(0, 3),
    fertilizer: balanced ? "A standard balanced NPK fertilizer is recommended" : "Consult your local soil testing lab for a custom NPK mix",
  };
}

const NPK_GUIDE = [
  { symbol:"N", full:"Nitrogen",   color:"#388e3c", bgLight:"#e8f5e9", border:"#a5d6a7", role:"Drives leaf & stem growth; essential for chlorophyll production",    deficiency:"Yellowing of older leaves starting from tips, stunted growth",   sources:"Urea, DAP, compost, green manure",      range:"40–120 kg/ha" },
  { symbol:"P", full:"Phosphorus", color:"#e65100", bgLight:"#fff3e0", border:"#ffcc80", role:"Root development, energy transfer, flowering & seed formation",      deficiency:"Purple or reddish discoloration, poor root system, late maturity", sources:"SSP, DAP, rock phosphate",              range:"20–80 kg/ha" },
  { symbol:"K", full:"Potassium",  color:"#6a1b9a", bgLight:"#f3e5f5", border:"#ce93d8", role:"Strengthens cell walls; improves drought and disease tolerance",     deficiency:"Brown leaf margins (tip scorch), weak stems, poor fruit quality",  sources:"Muriate of Potash (MOP), SOP, wood ash", range:"30–100 kg/ha" },
];

const PH_ROWS = [
  { range:"< 4.5",   label:"Strongly Acidic", bg:"#ffebee", tc:"#c62828", note:"Very few crops survive; heavy liming required" },
  { range:"4.5–5.5", label:"Acidic",          bg:"#fff3e0", tc:"#e65100", note:"Tea, blueberry; apply lime for most other crops" },
  { range:"5.5–6.5", label:"Slightly Acidic", bg:"#f9fbe7", tc:"#558b2f", note:"Ideal for rice, maize, potato, most vegetables" },
  { range:"6.5–7.5", label:"Neutral",         bg:"#e8f5e9", tc:"#2e7d32", note:"Best for wheat, cotton, legumes — most versatile range" },
  { range:"7.5–8.5", label:"Alkaline",        bg:"#e3f2fd", tc:"#1565c0", note:"Barley, sugarcane; apply gypsum or sulfur" },
  { range:"> 8.5",   label:"Strongly Alkaline",bg:"#ede7f6",tc:"#4527a0", note:"Requires heavy amendment; very limited crop choice" },
];

const SOIL_STEPS = [
  { n:"01", icon:"🗺️", title:"Collect Samples",   body:"Take 10–15 sub-samples from different spots using a clean soil auger or trowel. Dig 15–20 cm deep. Avoid field edges, trees, or recently fertilized spots." },
  { n:"02", icon:"🪣", title:"Mix & Reduce",       body:"Combine all sub-samples in a clean bucket. Use the quartering method: spread, divide into 4 quadrants, discard two opposite corners, re-mix until ~500g remains." },
  { n:"03", icon:"☀️", title:"Air-Dry the Sample", body:"Dry in shade for 24–48 hours. Never use an oven or direct sunlight — it alters the chemical composition. Remove visible roots, stones, and organic debris." },
  { n:"04", icon:"🏛️", title:"Submit to Lab",      body:"Pack in a clean cloth or paper bag — not plastic. Label with your name, village, field area, and crop history. Submit to the nearest Soil Testing Laboratory or KVK." },
  { n:"05", icon:"📋", title:"Receive Report",     body:"The lab tests for NPK, pH, Organic Carbon, and micronutrients. You will receive a Soil Health Card with fertilizer recommendations typically within 7–15 days." },
  { n:"06", icon:"🌱", title:"Enter Here",         body:"Once you have your Soil Health Card, enter the N, P, K (kg/ha) and pH values directly into the recommendation form below to get your AI-powered crop suggestion." },
];

/* ─────────────────────────────────────────────
   REUSABLE COMPONENTS
───────────────────────────────────────────── */
function InputField({ label, name, value, onChange, placeholder, hint, icon: Icon, unit, delay = 0 }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="anim-fade-up" style={{ animationDelay: `${delay}s` }}>
      <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:"#374151", marginBottom:"6px", letterSpacing:"0.02em" }}>{label}</label>
      <div style={{ position:"relative" }}>
        {Icon && <Icon style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", width:"16px", height:"16px", color: focused ? "var(--c-lime)" : "#9ca3af", transition:"color 0.2s" }} />}
        <input
          type="number" name={name} value={value} onChange={onChange}
          placeholder={placeholder} step="0.1"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="input-field"
          style={{
            width:"100%", paddingLeft:"38px", paddingRight: unit ? "44px" : "12px",
            paddingTop:"11px", paddingBottom:"11px",
            border: `2px solid ${focused ? "var(--c-lime)" : "#e5e7eb"}`,
            borderRadius:"12px", fontSize:"0.88rem", color:"#1f2937",
            background:"#fff", outline:"none", transition:"border-color 0.2s, box-shadow 0.2s",
            fontFamily:"'DM Sans', sans-serif",
            boxShadow: focused ? "0 0 0 3px rgba(76,175,80,0.15)" : "none",
          }}
        />
        {unit && <span style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", fontSize:"0.72rem", fontWeight:600, color:"#9ca3af" }}>{unit}</span>}
      </div>
      {hint && <p style={{ fontSize:"0.7rem", color:"#9ca3af", marginTop:"4px" }}>{hint}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
function AnimCounter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const num = parseFloat(to);
    const duration = 900;
    const step = 16;
    const increment = num / (duration / step);
    const t = setInterval(() => {
      start += increment;
      if (start >= num) { setVal(num); clearInterval(t); }
      else setVal(Math.floor(start * 10) / 10);
    }, step);
    return () => clearInterval(t);
  }, [to]);
  return <span className="metric-num">{val}{suffix}</span>;
}

/* ─────────────────────────────────────────────
   CROP CAROUSEL
───────────────────────────────────────────── */
function CropCarousel() {
  const [idx, setIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const go = useCallback((dir) => {
    setIdx(i => (i + dir + CROPS.length) % CROPS.length);
    setAnimKey(k => k + 1);
  }, []);

  const crop = CROPS[idx];

  return (
    <div className="hover-lift" style={{ background:"#fff", borderRadius:"20px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", border:"1px solid #eaeaea", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px 14px", borderBottom:"1px solid #f3f4f6" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ background:"linear-gradient(135deg,#1a6b3a,#2e9e56)", padding:"8px", borderRadius:"10px" }}>
            <BookOpen style={{ width:"18px", height:"18px", color:"#fff" }} />
          </div>
          <div>
            <span className="serif" style={{ fontSize:"1.05rem", fontWeight:400, color:"#1a1a1a" }}>Available Crops</span>
            <span style={{ fontSize:"0.75rem", color:"#9ca3af", marginLeft:"8px" }}>{idx + 1} / {CROPS.length}</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          {[-1, 1].map(dir => (
            <button key={dir} onClick={() => go(dir)}
              style={{ width:"36px", height:"36px", borderRadius:"50%", border:"2px solid #e5e7eb", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-lime)"; e.currentTarget.style.background = "#f0fdf4"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#fff"; }}>
              {dir === -1 ? <ChevronLeft style={{ width:"16px", color:"#4b5563" }} /> : <ChevronRight style={{ width:"16px", color:"#4b5563" }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Card body */}
      <div key={animKey} className="anim-fade-in" style={{ display:"flex", gap:"0" }}>
        {/* Image */}
        <div style={{ position:"relative", width:"300px", minWidth:"260px", height:"260px", flexShrink:0, margin:"24px 0 24px 24px", borderRadius:"16px", overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.16)" }}>
          <img src={crop.img} alt={crop.name} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.6s ease" }}
            onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)" }} />
          <div style={{ position:"absolute", bottom:"14px", left:"16px" }}>
            <p style={{ color:"#fff", fontWeight:700, fontSize:"1.25rem", fontFamily:"'DM Serif Display',serif", margin:0 }}>{crop.name}</p>
            <p style={{ color:"rgba(255,255,255,0.75)", fontSize:"0.75rem", margin:0 }}>{crop.shortDesc}</p>
          </div>
        </div>

        {/* Details — 2 column grid for wider layout */}
        <div style={{ flex:1, padding:"24px 28px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px 32px", alignContent:"center" }}>
          {[
            { icon:<Info style={{width:"13px",height:"13px"}} />, label:"DESCRIPTION",      text:crop.description,      color:"#1a6b3a" },
            { icon:<Target style={{width:"13px",height:"13px"}} />, label:"IDEAL CONDITIONS", text:crop.idealConditions, color:"#1565c0" },
            { icon:<TrendingUp style={{width:"13px",height:"13px"}} />, label:"KEY BENEFITS",   text:crop.benefits,         color:"#c62828" },
            { icon:<Award style={{width:"13px",height:"13px"}} />,    label:"PRO TIPS",         text:crop.tips,             color:"#e65100" },
          ].map(({ icon, label, text, color }, i) => (
            <div key={label} className="anim-slide-in" style={{ animationDelay: `${i * 0.07}s` }}>
              <p style={{ fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.08em", color, display:"flex", alignItems:"center", gap:"4px", marginBottom:"4px" }}>{icon}{label}</p>
              <p style={{ fontSize:"0.82rem", color:"#4b5563", lineHeight:1.6, margin:0 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div style={{ display:"flex", justifyContent:"center", gap:"6px", paddingBottom:"16px" }}>
        {CROPS.map((_, i) => (
          <button key={i} onClick={() => { setIdx(i); setAnimKey(k => k+1); }}
            style={{ borderRadius:"99px", border:"none", cursor:"pointer", padding:0, transition:"all 0.25s",
              width: i === idx ? "22px" : "8px", height:"8px",
              background: i === idx ? "var(--c-green)" : "#d1d5db" }} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SOIL TEST BOX
───────────────────────────────────────────── */
function SoilTestBox() {
  const [tab, setTab] = useState("what");
  const [openNPK, setOpenNPK] = useState(null);

  const tabs = [["what","What is it?"],["how","How to Test"],["npk","NPK & pH"],["labs","Find Labs"]];

  return (
    <div style={{ background:"#fff", borderRadius:"20px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", border:"1px solid #eaeaea", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg, #c8973a 0%, #e6b347 50%, #c8973a 100%)", backgroundSize:"200% auto", padding:"24px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <div style={{ background:"rgba(255,255,255,0.22)", padding:"10px", borderRadius:"12px", backdropFilter:"blur(6px)" }}>
              <TestTube style={{ width:"22px", height:"22px", color:"#fff" }} />
            </div>
            <div>
              <h2 className="serif" style={{ color:"#fff", margin:0, fontSize:"1.25rem", fontWeight:400 }}>Soil Testing Guide</h2>
              <p style={{ color:"rgba(255,255,255,0.78)", fontSize:"0.8rem", margin:0 }}>Know your soil. Grow smarter.</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:"12px" }}>
            {[["🔬","6+ Parameters","Per sample"],["💰","Free / ₹5–50","At govt. labs"],["📅","Every 2–3 yrs","Recommended"]].map(([ic,v,l]) => (
              <div key={l} style={{ background:"rgba(255,255,255,0.18)", borderRadius:"12px", padding:"12px 18px", textAlign:"center", backdropFilter:"blur(4px)", minWidth:"110px" }}>
                <div style={{ fontSize:"1.2rem", marginBottom:"3px" }}>{ic}</div>
                <div style={{ fontWeight:700, color:"#fff", fontSize:"0.82rem" }}>{v}</div>
                <div style={{ color:"rgba(255,255,255,0.72)", fontSize:"0.7rem" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid #f3f4f6" }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`tab-underline ${tab === id ? "active" : ""}`}
            style={{ flex:1, padding:"14px 8px", fontSize:"0.8rem", fontWeight:600, border:"none", background:"none", cursor:"pointer",
              color: tab === id ? "var(--c-gold)" : "#6b7280", transition:"color 0.2s",
              borderBottom: tab === id ? "2px solid var(--c-gold)" : "2px solid transparent",
              fontFamily:"'DM Sans',sans-serif" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding:"24px" }}>
        {/* WHAT */}
        {tab === "what" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }} className="anim-fade-in">
            <div style={{ background:"#fffbf0", border:"1px solid #f3d07a", borderRadius:"14px", padding:"16px" }}>
              <p style={{ color:"#78350f", fontSize:"0.85rem", lineHeight:1.65, margin:0 }}>
                <strong>Soil testing</strong> is a scientific analysis of your farm soil to determine its nutrient content, pH level, and overall health. Just like a doctor checks your blood before prescribing medicine, soil testing tells you <em>exactly</em> what your farm needs — before you spend money on fertilizers.
              </p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:"10px" }}>
              {[
                ["💸","Save Fertilizer Cost","Apply only what your soil needs. Farmers save ₹3,000–₹10,000/acre by avoiding over-fertilization.","#f0fdf4","#166534"],
                ["📈","Increase Yield","Balanced nutrition increases crop yield by 10–30% compared to guesswork-based fertilizer use.","#eff6ff","#1e40af"],
                ["🌍","Protect Environment","Excess fertilizer runs into water bodies, causing pollution. Soil tests prevent wastage.","#f0fdfa","#115e59"],
                ["🌾","Choose the Right Crop","Soil data helps select the best crop — exactly what this app does with your N, P, K, pH inputs!","#faf5ff","#6b21a8"],
              ].map(([ic,title,desc,bg,tc]) => (
                <div key={title} className="hover-lift card-shimmer" style={{ background:bg, borderRadius:"12px", padding:"14px", border:"1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:"1.4rem", marginBottom:"6px" }}>{ic}</div>
                  <p style={{ fontWeight:700, color:tc, fontSize:"0.82rem", margin:"0 0 4px" }}>{title}</p>
                  <p style={{ fontSize:"0.75rem", color:"#4b5563", margin:0, lineHeight:1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ background:"#f9fafb", borderRadius:"14px", padding:"16px" }}>
              <p style={{ fontWeight:700, color:"#111827", fontSize:"0.82rem", margin:"0 0 10px" }}>What a soil report includes:</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))", gap:"6px" }}>
                {["🟢 Nitrogen (N) – kg/ha","🟠 Phosphorus (P) – kg/ha","🟣 Potassium (K) – kg/ha","⚗️ Soil pH (0–14)","🌿 Organic Carbon (%)","💧 Electrical Conductivity","⚡ Zinc, Sulphur, Boron","🧱 Soil texture type"].map(t => (
                  <div key={t} style={{ background:"#fff", borderRadius:"8px", padding:"8px 12px", fontSize:"0.75rem", color:"#374151", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>{t}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HOW */}
        {tab === "how" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"14px" }} className="anim-fade-in">
            <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:"12px", padding:"12px 16px", display:"flex", gap:"10px" }}>
              <Info style={{ width:"16px", height:"16px", color:"#2563eb", flexShrink:0, marginTop:"1px" }} />
              <p style={{ fontSize:"0.82rem", color:"#1e40af", margin:0 }}><strong>Best time:</strong> 3–4 weeks before sowing, or right after harvest. Avoid sampling immediately after applying fertilizers or irrigation.</p>
            </div>
            {SOIL_STEPS.map((s, i) => (
              <div key={s.n} className="anim-slide-in" style={{ animationDelay:`${i*0.06}s`, display:"flex", gap:"14px" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                  <div style={{ width:"36px", height:"36px", background:"linear-gradient(135deg,#c8973a,#e6b347)", color:"#fff", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.72rem", fontWeight:700, boxShadow:"0 3px 8px rgba(200,151,58,0.4)", flexShrink:0 }}>{s.n}</div>
                  {i < SOIL_STEPS.length-1 && <div style={{ width:"2px", flex:1, background:"linear-gradient(to bottom, #e6b347, transparent)", marginTop:"4px", minHeight:"18px" }} />}
                </div>
                <div style={{ paddingBottom:"8px", flex:1 }}>
                  <p style={{ fontWeight:700, color:"#1f2937", fontSize:"0.85rem", margin:"4px 0 3px" }}>{s.icon} {s.title}</p>
                  <p style={{ fontSize:"0.78rem", color:"#6b7280", margin:0, lineHeight:1.55 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NPK */}
        {tab === "npk" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }} className="anim-fade-in">
            <div>
              <p style={{ fontWeight:700, color:"#1f2937", fontSize:"0.85rem", display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
                <Activity style={{ width:"16px", height:"16px", color:"#388e3c" }} />The 3 Major Nutrients
              </p>
              {NPK_GUIDE.map(n => (
                <div key={n.symbol} style={{ border:`2px solid ${n.border}`, borderRadius:"14px", overflow:"hidden", marginBottom:"8px", transition:"box-shadow 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 14px ${n.border}80`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                  <button onClick={() => setOpenNPK(openNPK === n.symbol ? null : n.symbol)}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:"12px", padding:"12px 16px", background:n.bgLight, border:"none", cursor:"pointer", textAlign:"left", fontFamily:"'DM Sans',sans-serif" }}>
                    <div style={{ width:"38px", height:"38px", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"1.1rem", color:n.color, background:"#fff", border:`2px solid ${n.border}`, boxShadow:`0 2px 6px ${n.border}80`, flexShrink:0 }}>{n.symbol}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:700, color:"#1f2937", fontSize:"0.85rem", margin:0 }}>{n.full}</p>
                      <p style={{ fontSize:"0.72rem", color:"#6b7280", margin:0 }}>{n.range}</p>
                    </div>
                    <ChevronRight style={{ width:"16px", color:"#9ca3af", transform: openNPK===n.symbol?"rotate(90deg)":"none", transition:"transform 0.2s" }} />
                  </button>
                  {openNPK === n.symbol && (
                    <div className="anim-fade-in" style={{ padding:"14px 16px", background:"#fff", borderTop:`1px solid ${n.border}`, display:"flex", flexDirection:"column", gap:"6px" }}>
                      <p style={{ fontSize:"0.78rem", color:"#374151", margin:0 }}><strong style={{ color:n.color }}>Role:</strong> {n.role}</p>
                      <p style={{ fontSize:"0.78rem", color:"#374151", margin:0 }}><strong style={{ color:n.color }}>Deficiency:</strong> {n.deficiency}</p>
                      <p style={{ fontSize:"0.78rem", color:"#374151", margin:0 }}><strong style={{ color:n.color }}>Sources:</strong> {n.sources}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontWeight:700, color:"#1f2937", fontSize:"0.85rem", display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
                <FlaskConical style={{ width:"16px", height:"16px", color:"#c8973a" }} />Soil pH Reference Scale
              </p>
              <div style={{ borderRadius:"14px", overflow:"hidden", border:"1px solid #e5e7eb" }}>
                {PH_ROWS.map((r, i) => (
                  <div key={r.range} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 14px", background: i%2===0?"#f9fafb":"#fff" }}>
                    <span style={{ fontFamily:"monospace", fontWeight:700, color:"#374151", width:"56px", fontSize:"0.75rem", flexShrink:0 }}>{r.range}</span>
                    <span style={{ background:r.bg, color:r.tc, padding:"3px 10px", borderRadius:"99px", fontSize:"0.7rem", fontWeight:600, width:"130px", textAlign:"center", flexShrink:0 }}>{r.label}</span>
                    <span style={{ fontSize:"0.75rem", color:"#6b7280" }}>{r.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LABS */}
        {tab === "labs" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"14px" }} className="anim-fade-in">
            <div className="anim-pulse-ring" style={{ background:"#fff1f2", border:"2px solid #fca5a5", borderRadius:"14px", padding:"14px 16px", display:"flex", gap:"12px" }}>
              <Phone style={{ width:"18px", height:"18px", color:"#dc2626", flexShrink:0, marginTop:"2px" }} />
              <div>
                <p style={{ fontWeight:700, color:"#991b1b", fontSize:"0.85rem", margin:"0 0 2px" }}>Kisan Helpline — Toll Free 24×7</p>
                <p style={{ fontWeight:800, color:"#dc2626", fontSize:"1.05rem", margin:"0 0 2px", fontFamily:"monospace" }}>1800-180-1551</p>
                <p style={{ fontSize:"0.72rem", color:"#991b1b", margin:0 }}>Guidance in your local language on soil, crops, and farming</p>
              </div>
            </div>
            {[
              { cat:"🏛️ Government Labs", bg:"#eff6ff", border:"#bfdbfe", items:[
                { name:"Soil Health Card Portal", desc:"Free soil testing + view your farm's complete history", url:"https://soilhealth.dac.gov.in", tag:"Free" },
                { name:"Krishi Vigyan Kendra (KVK)", desc:"Nearest farm science centre with on-site testing", url:"https://kvk.icar.gov.in", tag:"Free" },
                { name:"ICAR Institutes", desc:"Indian Council of Agricultural Research state labs", url:"https://icar.org.in", tag:"Subsidized" },
              ]},
              { cat:"💻 Online Tools", bg:"#f0fdf4", border:"#bbf7d0", items:[
                { name:"ISRO Bhuvan Soil Map", desc:"Satellite-based soil mapping for your region", url:"https://bhuvan.nrsc.gov.in", tag:"Free" },
                { name:"FAO Global Soil Partnership", desc:"Global soil data, reference maps & guidance", url:"https://www.fao.org/global-soil-partnership/en/", tag:"Free" },
                { name:"eNAM Farmer Portal", desc:"Market prices + agricultural advisory for farmers", url:"https://enam.gov.in", tag:"Free" },
              ]},
            ].map(({ cat, bg, border, items }) => (
              <div key={cat} style={{ border:`1px solid ${border}`, borderRadius:"14px", overflow:"hidden", background:bg }}>
                <p style={{ fontWeight:700, color:"#1f2937", fontSize:"0.82rem", padding:"12px 16px", margin:0, borderBottom:`1px solid ${border}` }}>{cat}</p>
                {items.map(item => (
                  <div key={item.name} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"10px 16px", borderTop:`1px solid rgba(0,0,0,0.04)`, background:"rgba(255,255,255,0.6)" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap" }}>
                        <span style={{ fontWeight:600, color:"#111827", fontSize:"0.82rem" }}>{item.name}</span>
                        <span style={{ background:"#e5e7eb", color:"#4b5563", fontSize:"0.65rem", padding:"2px 8px", borderRadius:"99px", fontWeight:600 }}>{item.tag}</span>
                      </div>
                      <p style={{ fontSize:"0.73rem", color:"#6b7280", margin:"2px 0 0" }}>{item.desc}</p>
                    </div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"0.73rem", color:"#2563eb", fontWeight:600, textDecoration:"none", flexShrink:0, marginLeft:"12px", marginTop:"2px" }}
                      onMouseEnter={e => e.currentTarget.style.color="#1d4ed8"}
                      onMouseLeave={e => e.currentTarget.style.color="#2563eb"}>
                      Visit <ExternalLink style={{ width:"11px", height:"11px" }} />
                    </a>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"14px", padding:"16px" }}>
              <p style={{ fontWeight:700, color:"#1f2937", fontSize:"0.82rem", display:"flex", alignItems:"center", gap:"6px", margin:"0 0 10px" }}>
                <Globe style={{ width:"14px", height:"14px" }} />How to find your nearest lab
              </p>
              <ol style={{ fontSize:"0.78rem", color:"#4b5563", margin:0, paddingLeft:"18px", lineHeight:1.9 }}>
                <li>Visit <strong>soilhealth.dac.gov.in</strong> → click "Soil Testing Lab Locator"</li>
                <li>Enter your State, District, and Block name</li>
                <li>View the nearest lab with address and contact details</li>
                <li>Most government labs test for free or charge ₹5–₹50 per sample</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   WHY THIS CROP SECTION
───────────────────────────────────────────── */
function WhyThisCrop({ cropName, N, P, K, ph, temperature, humidity, rainfall, confidence }) {
  const reasons = buildWhyReasons(cropName, N, P, K, ph, temperature, humidity, rainfall);
  const confPct = Math.round(confidence * 100);

  return (
    <div className="anim-scale-in" style={{ background:"linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%)", border:"2px solid #86efac", borderRadius:"18px", padding:"22px", marginTop:"16px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
        <div style={{ background:"linear-gradient(135deg,#1a6b3a,#2e9e56)", padding:"8px", borderRadius:"10px", boxShadow:"0 3px 10px rgba(26,107,58,0.3)" }}>
          <Sparkles style={{ width:"18px", height:"18px", color:"#fff" }} />
        </div>
        <div>
          <h3 className="serif" style={{ margin:0, fontSize:"1.05rem", color:"#14532d", fontWeight:400 }}>
            Why <em>{cropName.charAt(0).toUpperCase()+cropName.slice(1)}</em>? — ML Reasoning
          </h3>
          <p style={{ margin:0, fontSize:"0.73rem", color:"#16a34a" }}>Here is exactly why the model chose this crop for your conditions</p>
        </div>
      </div>

      {/* Reason chips */}
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {reasons.map((r, i) => (
          <div key={i} className="anim-slide-in why-chip" style={{ animationDelay:`${i*0.07}s`, background:"#fff", border:"1px solid #bbf7d0", borderRadius:"12px", padding:"11px 14px", display:"flex", alignItems:"flex-start", gap:"10px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize:"1.1rem", flexShrink:0, marginTop:"1px" }}>{r.icon}</span>
            <div style={{ flex:1 }}>
              <span style={{ display:"inline-block", background:r.color, color:"#374151", fontSize:"0.65rem", fontWeight:700, padding:"2px 8px", borderRadius:"99px", marginBottom:"4px", letterSpacing:"0.05em" }}>{r.tag}</span>
              <p style={{ fontSize:"0.8rem", color:"#1f2937", margin:0, lineHeight:1.5 }}>{r.text}</p>
            </div>
            <CheckCircle style={{ width:"15px", height:"15px", color:"#16a34a", flexShrink:0, marginTop:"3px" }} />
          </div>
        ))}
      </div>

      {/* Input summary */}
      <div style={{ marginTop:"14px", background:"rgba(255,255,255,0.7)", borderRadius:"12px", padding:"12px 14px", border:"1px solid #d1fae5" }}>
        <p style={{ fontSize:"0.72rem", fontWeight:700, color:"#065f46", margin:"0 0 8px", letterSpacing:"0.05em" }}>INPUT PARAMETERS USED</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
          {[
            { icon:<Activity style={{width:"11px",height:"11px"}} />, label:`N: ${N}`, unit:"kg/ha" },
            { icon:<Activity style={{width:"11px",height:"11px"}} />, label:`P: ${P}`, unit:"kg/ha" },
            { icon:<Activity style={{width:"11px",height:"11px"}} />, label:`K: ${K}`, unit:"kg/ha" },
            { icon:<FlaskConical style={{width:"11px",height:"11px"}} />, label:`pH: ${ph}`, unit:"" },
            { icon:<Thermometer style={{width:"11px",height:"11px"}} />, label:`${temperature}`, unit:"°C" },
            { icon:<Droplets style={{width:"11px",height:"11px"}} />, label:`${humidity}`, unit:"%" },
            { icon:<CloudRain style={{width:"11px",height:"11px"}} />, label:`${rainfall}`, unit:"mm" },
          ].map(({ icon, label, unit }) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:"4px", background:"#fff", border:"1px solid #d1fae5", borderRadius:"8px", padding:"4px 10px", fontSize:"0.72rem", fontWeight:600, color:"#065f46" }}>
              {icon}{label}<span style={{ color:"#6b7280", fontWeight:400 }}>{unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RECOMMENDATION FORM
───────────────────────────────────────────── */
function RecommendationForm() {
  const empty = { N:"", P:"", K:"", ph:"", temperature:"", humidity:"", rainfall:"" };
  const [form, setForm] = useState(empty);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef(null);

  const handleShopNow = (cropName) => {
    const { seedId } = getMarketplaceLink(cropName);
    if (seedId) {
      sessionStorage.setItem('highlightProductId', String(seedId));
    }
    sessionStorage.setItem('highlightCropName', cropName.toLowerCase());
    // App uses hash-based routing opened in new tab — open marketplace the same way
    window.open(window.location.origin + '/#/marketplace', '_blank');
  };

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setResult(null);
    const fields = [["N","Nitrogen"],["P","Phosphorus"],["K","Potassium"],["ph","Soil pH"],["temperature","Temperature"],["humidity","Humidity"],["rainfall","Rainfall"]];
    for (const [k,l] of fields) {
      if (!form[k] || form[k].toString().trim()==="") { setError(`Please fill in: ${l}`); return; }
    }
    const ph=+form.ph, hum=+form.humidity, tmp=+form.temperature;
    if (ph<0||ph>14)    { setError("pH must be between 0 and 14"); return; }
    if (hum<0||hum>100) { setError("Humidity must be between 0% and 100%"); return; }
    if (tmp<-10||tmp>60){ setError("Temperature must be between -10°C and 60°C"); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/predict", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ N:+form.N, P:+form.P, K:+form.K, ph:+form.ph, temperature:+form.temperature, humidity:+form.humidity, rainfall:+form.rainfall }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Prediction failed");
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 150);
    } catch(err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const reset = () => { setForm(empty); setResult(null); setError(""); };

  const cropInfo = result ? getCropInfo(result.recommended_crop) : null;
  const soilTips = result ? getSoilTips(+form.N,+form.P,+form.K,+form.ph) : null;
  const confPct  = result ? Math.round(result.confidence*100) : 0;

  return (
    <div style={{ background:"#fff", borderRadius:"20px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", border:"1px solid #eaeaea", overflow:"hidden" }}>
      {/* Form header */}
      <div style={{ background:"linear-gradient(135deg,#1a4a2e 0%,#1a6b3a 50%,#1a4a2e 100%)", backgroundSize:"200% auto", padding:"22px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <div className="anim-pulse-ring" style={{ background:"rgba(255,255,255,0.18)", padding:"10px", borderRadius:"12px" }}>
            <Sprout style={{ width:"22px", height:"22px", color:"#fff" }} />
          </div>
          <div>
            <h2 className="serif" style={{ color:"#fff", margin:0, fontSize:"1.25rem", fontWeight:400 }}>Crop Recommendation Engine</h2>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:"0.78rem", margin:0 }}>Enter your soil data and local weather for an AI-powered prediction</p>
          </div>
        </div>
      </div>

      <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:"24px" }}>
        {/* Soil Nutrients */}
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"8px", padding:"5px 12px", marginBottom:"16px" }}>
            <Activity style={{ width:"13px", height:"13px", color:"#16a34a" }} />
            <span style={{ fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.08em", color:"#15803d", textTransform:"uppercase" }}>Soil Nutrients</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:"14px" }}>
            <InputField label="Nitrogen (N)"   name="N"  value={form.N}  onChange={change} placeholder="e.g. 90"  hint="Available N in soil" icon={Activity}     unit="kg/ha" delay={0.05} />
            <InputField label="Phosphorus (P)" name="P"  value={form.P}  onChange={change} placeholder="e.g. 42"  hint="Available P"         icon={Activity}     unit="kg/ha" delay={0.10} />
            <InputField label="Potassium (K)"  name="K"  value={form.K}  onChange={change} placeholder="e.g. 43"  hint="Available K"         icon={Activity}     unit="kg/ha" delay={0.15} />
            <InputField label="Soil pH"        name="ph" value={form.ph} onChange={change} placeholder="e.g. 6.5" hint="Range: 3.5–9.0"      icon={FlaskConical} unit="pH"    delay={0.20} />
          </div>
        </div>

        {/* Weather */}
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:"8px", padding:"5px 12px", marginBottom:"16px" }}>
            <Cloud style={{ width:"13px", height:"13px", color:"#2563eb" }} />
            <span style={{ fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.08em", color:"#1d4ed8", textTransform:"uppercase" }}>Weather Conditions</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:"14px" }}>
            <InputField label="Temperature" name="temperature" value={form.temperature} onChange={change} placeholder="e.g. 28"  hint="Growing season avg." icon={ThermometerSun} unit="°C"  delay={0.25} />
            <InputField label="Humidity"    name="humidity"    value={form.humidity}    onChange={change} placeholder="e.g. 65"  hint="Relative humidity"  icon={Droplets}      unit="%"   delay={0.30} />
            <InputField label="Rainfall"    name="rainfall"    value={form.rainfall}    onChange={change} placeholder="e.g. 120" hint="Monthly/seasonal avg" icon={Wind}          unit="mm"  delay={0.35} />
          </div>
          <div style={{ marginTop:"12px", display:"flex", alignItems:"flex-start", gap:"8px", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:"12px", padding:"10px 14px" }}>
            <Cloud style={{ width:"14px", height:"14px", color:"#2563eb", marginTop:"2px", flexShrink:0 }} />
            <p style={{ fontSize:"0.75rem", color:"#1e40af", margin:0 }}><strong>Rainfall tip:</strong> Enter the average monthly rainfall for your growing season, not a single-day reading. This matches the model's training scale.</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="anim-scale-in" style={{ background:"#fff1f2", border:"1px solid #fca5a5", borderRadius:"12px", padding:"14px 16px", display:"flex", alignItems:"flex-start", gap:"10px" }}>
            <XCircle style={{ width:"18px", height:"18px", color:"#dc2626", flexShrink:0, marginTop:"1px" }} />
            <p style={{ fontSize:"0.85rem", color:"#dc2626", fontWeight:600, margin:0 }}>{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={submit} disabled={loading} className="btn-primary"
            style={{ flex:1, color:"#fff", border:"none", padding:"14px 20px", borderRadius:"14px", fontWeight:700, fontSize:"0.95rem", cursor: loading?"not-allowed":"pointer", opacity: loading?0.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", fontFamily:"'DM Sans',sans-serif" }}>
            {loading ? (
              <><div className="dot-loader" style={{ display:"flex", gap:"4px", color:"rgba(255,255,255,0.9)" }}><span/><span/><span/></div><span>Analyzing your soil…</span></>
            ) : (
              <><Sprout style={{ width:"18px", height:"18px" }} /><span>Get Crop Recommendation</span><ArrowRight style={{ width:"16px", height:"16px" }} /></>
            )}
          </button>
          {result && (
            <button onClick={reset}
              style={{ padding:"14px 18px", background:"#f3f4f6", border:"1px solid #e5e7eb", borderRadius:"14px", color:"#374151", fontWeight:600, fontSize:"0.85rem", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.background="#e5e7eb"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#f3f4f6"; }}>
              <RefreshCw style={{ width:"15px", height:"15px" }} />Reset
            </button>
          )}
        </div>
      </div>

      {/* ── RESULTS ── */}
      {result && (
        <div ref={resultRef} style={{ borderTop:"1px solid #f3f4f6" }}>
          {/* API Warnings */}
          {result.warnings?.length > 0 && (
            <div style={{ margin:"16px 24px 0", background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:"14px", padding:"14px 16px", display:"flex", flexDirection:"column", gap:"8px" }} className="anim-fade-in">
              {result.warnings.map((w,i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"8px" }}>
                  <AlertTriangle style={{ width:"14px", height:"14px", color:"#d97706", flexShrink:0, marginTop:"2px" }} />
                  <p style={{ fontSize:"0.75rem", color:"#92400e", margin:0 }}>{w}</p>
                </div>
              ))}
            </div>
          )}

          {/* Hero result card */}
          <div style={{ margin:"16px 24px 0" }} className="anim-scale-in">
            <div style={{ background:"linear-gradient(135deg, #f0fdf4, #ecfdf5, #f0fdf4)", border:"2px solid #86efac", borderRadius:"20px", overflow:"hidden", boxShadow:"0 4px 20px rgba(22,163,74,0.12)" }}>
              {/* Top row */}
              <div style={{ padding:"20px 22px 16px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
                <div>
                  <p style={{ fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.1em", color:"#16a34a", textTransform:"uppercase", margin:"0 0 8px" }}>✦ Best Recommendation</p>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <span style={{ fontSize:"3rem", lineHeight:1 }}>{cropInfo.icon}</span>
                    <div>
                      <h3 className="serif" style={{ margin:"0 0 8px", fontSize:"2rem", color:"#14532d", fontWeight:400, textTransform:"capitalize" }}>{result.recommended_crop}</h3>
                      <button
                        onClick={() => handleShopNow(result.recommended_crop)}
                        style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"linear-gradient(135deg,#1a6b3a,#2e9e56)", color:"#fff", textDecoration:"none", padding:"8px 16px", borderRadius:"10px", fontSize:"0.82rem", fontWeight:700, boxShadow:"0 3px 10px rgba(26,107,58,0.3)", transition:"all 0.2s", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                        onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 16px rgba(26,107,58,0.4)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 3px 10px rgba(26,107,58,0.3)"; }}>
                        <ExternalLink style={{ width:"13px", height:"13px" }} />
                        Shop Now — Marketplace
                      </button>
                    </div>
                  </div>
                </div>
                {/* Quick stats */}
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {[["📅",cropInfo.when,"When to Plant"],["💧",cropInfo.water,"Water Need"],["📦",cropInfo.yield,"Est. Yield"],["🌱",cropInfo.season,"Season"]].map(([ic,v,l]) => (
                    <div key={l} className="hover-lift" style={{ background:"#fff", borderRadius:"12px", padding:"8px 14px", display:"flex", alignItems:"center", gap:"10px", border:"1px solid #d1fae5", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                      <span style={{ fontSize:"1.1rem" }}>{ic}</span>
                      <div>
                        <p style={{ fontSize:"0.72rem", fontWeight:700, color:"#1f2937", margin:0 }}>{v}</p>
                        <p style={{ fontSize:"0.65rem", color:"#9ca3af", margin:0 }}>{l}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why This Crop */}
              <div style={{ padding:"0 22px 0" }}>
                <WhyThisCrop
                  cropName={result.recommended_crop}
                  N={+form.N} P={+form.P} K={+form.K} ph={+form.ph}
                  temperature={+form.temperature} humidity={+form.humidity} rainfall={+form.rainfall}
                  confidence={result.confidence}
                />
              </div>

              {/* Soil & Fertilizer */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px,1fr))", margin:"16px 22px", gap:"12px" }}>
                <div style={{ background:"#fff", borderRadius:"14px", padding:"16px", border:"1px solid #d1fae5" }}>
                  <p style={{ fontWeight:700, color:"#1f2937", fontSize:"0.82rem", display:"flex", alignItems:"center", gap:"6px", margin:"0 0 10px" }}>
                    <Leaf style={{ width:"14px", height:"14px", color:"#16a34a" }} />Soil Insights
                  </p>
                  {soilTips.tips.map((t,i) => (
                    <div key={i} className="anim-slide-in" style={{ animationDelay:`${i*0.08}s`, display:"flex", alignItems:"flex-start", gap:"8px", marginBottom:"8px" }}>
                      <CheckCircle style={{ width:"14px", height:"14px", color:"#22c55e", flexShrink:0, marginTop:"2px" }} />
                      <p style={{ fontSize:"0.78rem", color:"#4b5563", margin:0, lineHeight:1.5 }}>{t}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#fffbf0", borderRadius:"14px", padding:"16px", border:"1px solid #fed7aa" }}>
                  <p style={{ fontWeight:700, color:"#1f2937", fontSize:"0.82rem", display:"flex", alignItems:"center", gap:"6px", margin:"0 0 10px" }}>
                    <FlaskConical style={{ width:"14px", height:"14px", color:"#ea580c" }} />Fertilizer Advice
                  </p>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:"5px", background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:"8px", padding:"4px 10px", marginBottom:"8px" }}>
                    <Gauge style={{ width:"11px", height:"11px", color:"#ea580c" }} />
                    <span style={{ fontSize:"0.73rem", fontWeight:600, color:"#c2410c" }}>{soilTips.health}</span>
                  </div>
                  <p style={{ fontSize:"0.78rem", color:"#6b7280", margin:0, lineHeight:1.55 }}>{soilTips.fertilizer}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alternatives */}
          {result.alternatives?.length > 0 && (
            <div style={{ margin:"16px 24px 24px" }} className="anim-fade-up">
              <p style={{ fontWeight:700, color:"#374151", fontSize:"0.85rem", display:"flex", alignItems:"center", gap:"6px", margin:"0 0 12px" }}>
                <BarChart3 style={{ width:"15px", height:"15px", color:"#6b7280" }} />Alternative Crops
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:"10px" }}>
                {result.alternatives.map((alt,i) => {
                  const ai = getCropInfo(alt.crop);
                  return (
                    <div key={alt.crop} className="hover-lift card-shimmer anim-slide-in" style={{ animationDelay:`${i*0.08}s`, display:"flex", alignItems:"center", gap:"12px", background:"#fff", borderRadius:"14px", padding:"12px 14px", border:"1px solid #e5e7eb", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                      <div style={{ width:"44px", height:"44px", background:"linear-gradient(135deg,#f0fdf4,#d1fae5)", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", flexShrink:0 }}>{ai.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:700, color:"#1f2937", fontSize:"0.85rem", margin:"0 0 4px", textTransform:"capitalize" }}>{alt.crop}</p>
                        <p style={{ fontSize:"0.72rem", color:"#6b7280", margin:0 }}>{ai.when} · {ai.season}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function AgriShield() {
  return (
    <div style={{ minHeight:"100vh", background:"var(--c-mist)", fontFamily:"'DM Sans',sans-serif" }}>
      <GlobalStyles />

      {/* ── Navbar ── */}
      <nav style={{
        background: "#fff",
        borderBottom: "1px solid #d1fae5",
        padding:"0 32px", height:"56px", display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:100,
      }}>
        {/* Left: logo + name */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ background:"#1a6b3a", padding:"8px", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Sprout style={{ width:"18px", height:"18px", color:"#fff" }} />
          </div>
          <span style={{ fontSize:"1.1rem", fontWeight:700, color:"#1a6b3a", letterSpacing:"-0.01em", fontFamily:"'DM Sans',sans-serif" }}>AgriShield</span>
        </div>
        {/* Right: back link */}
        <a href="/" style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"0.85rem", fontWeight:500, color:"#1a6b3a", textDecoration:"none", transition:"opacity 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.opacity="0.7"}
          onMouseLeave={e => e.currentTarget.style.opacity="1"}>
          <ChevronLeft style={{ width:"15px", height:"15px" }} />Back to Home
        </a>
      </nav>

      {/* ── Hero ── */}
      <div style={{
        position:"relative",
        backgroundImage:"linear-gradient(rgba(0,0,0,0.62),rgba(0,0,0,0.62)),url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1800&h=700&fit=crop)",
        backgroundSize:"cover", backgroundPosition:"center",
        padding:"72px 24px 64px", textAlign:"center",
      }}>
        {/* Subtle grain overlay */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity:0.6, pointerEvents:"none" }} />

        <div style={{ maxWidth:"820px", margin:"0 auto", position:"relative" }}>
          <div className="anim-fade-up" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"14px", marginBottom:"18px" }}>
            <div style={{ background:"linear-gradient(135deg,#1a6b3a,#4ade80)", padding:"12px", borderRadius:"18px", boxShadow:"0 6px 24px rgba(26,107,58,0.5)" }}>
              <Sprout style={{ width:"32px", height:"32px", color:"#fff" }} />
            </div>
            <h1 className="serif" style={{ color:"#fff", fontSize:"clamp(1.9rem,5vw,3.2rem)", margin:0, fontWeight:400, letterSpacing:"-0.01em" }}>
              Smart Crop Recommendation
            </h1>
          </div>

          <p className="anim-fade-up d2" style={{ color:"rgba(255,255,255,0.82)", fontSize:"1rem", maxWidth:"560px", margin:"0 auto 32px", lineHeight:1.65 }}>
            AI-powered crop selection based on soil nutrients, climate conditions, and advanced machine learning algorithms
          </p>

          {/* Stats */}
          <div className="anim-fade-up d3" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", maxWidth:"520px", margin:"0 auto" }}>
            {[
              { icon:BarChart3, val:97,   suffix:"%", label:"Accuracy Rate" },
              { icon:Sprout,    val:22,   suffix:"+", label:"Crops Covered" },
              { icon:Database,  val:2.2,  suffix:"K", label:"Training Records" },
              { icon:Activity,  val:7,    suffix:" NPK", label:"Parameters Used" },
            ].map(({ icon:Icon, val, suffix, label }) => (
              <div key={label} style={{ background:"rgba(0,0,0,0.35)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:"14px", padding:"16px 10px", textAlign:"center" }}>
                <Icon style={{ width:"20px", height:"20px", color:"#4ade80", margin:"0 auto 6px", display:"block" }} />
                <div style={{ fontSize:"1.5rem", fontWeight:800, color:"#fff" }}><AnimCounter to={val} suffix={suffix} /></div>
                <div style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.65)", marginTop:"2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"28px 32px 56px", display:"flex", flexDirection:"column", gap:"24px" }}>
        {/* Section labels */}
        {[
          { label:"01 — Available Crops", sub:"Browse crops and their ideal conditions", comp:<CropCarousel /> },
          { label:"02 — Soil Testing Guide", sub:"Understand your soil, grow better", comp:<SoilTestBox /> },
          { label:"03 — Crop Recommendation", sub:"Enter your parameters and get an AI-powered suggestion", comp:<RecommendationForm /> },
        ].map(({ label, sub, comp }, i) => (
          <div key={label} className="anim-fade-up" style={{ animationDelay:`${i*0.12}s`, display:"flex", flexDirection:"column", gap:"8px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", paddingLeft:"4px" }}>
              <span style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em", color:"#1a6b3a", textTransform:"uppercase" }}>{label}</span>
              <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,#d1fae5,transparent)" }} />
            </div>
            <p style={{ fontSize:"0.78rem", color:"#6b7280", margin:"0 0 4px", paddingLeft:"4px" }}>{sub}</p>
            {comp}
          </div>
        ))}
      </div>
    </div>
  );
}