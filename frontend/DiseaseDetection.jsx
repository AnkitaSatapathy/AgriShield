import React, { useState } from 'react';
import { 
  Camera, Upload, Leaf, AlertCircle, CheckCircle, Info,
  Droplets, Bug, Wind, Sun, Shield, Activity, BookOpen,
  ChevronRight, RotateCcw, Image, ChevronDown, ChevronUp,
  ChevronLeft, Microscope, Thermometer, Eye
} from 'lucide-react';


import tomatoLateBlight from '../data/images/tomato-late-blight.jpg'
import potatoEarlyBlight from '../data/images/potato-early-blight.jpg';
import pepperBacterialSpot from '../data/images/pepper-bacterial-spot.jpg';
import tomatoMosaicVirus from '../data/images/tomato-mosaic-virus.jpg';
import spiderMites from '../data/images/spider-mites.jpg';
import tomatoLeafMold from '../data/images/tomato-leaf-mold.jpg';


const DiseaseDetection = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);


  // Function to convert technical disease names to layman terms
const getLaymanDiseaseName = (technicalName) => {
  const diseaseMap = {
    "Pepper__bell___Bacterial_spot": "Pepper Bacterial Spot",
    "Pepper__bell___healthy": "Healthy Pepper Plant",
    "Potato___Early_blight": "Potato Early Blight",
    "Potato___healthy": "Healthy Potato Plant",
    "Potato___Late_blight": "Potato Late Blight",
    "Tomato__Target_Spot": "Tomato Target Spot",
    "Tomato__Tomato_mosaic_virus": "Tomato Mosaic Virus",
    "Tomato__Tomato_YellowLeaf__Curl_Virus": "Tomato Yellow Leaf Curl Virus",
    "Tomato_Bacterial_spot": "Tomato Bacterial Spot",
    "Tomato_Early_blight": "Tomato Early Blight",
    "Tomato_healthy": "Healthy Tomato Plant",
    "Tomato_Late_blight": "Tomato Late Blight",
    "Tomato_Leaf_Mold": "Tomato Leaf Mold",
    "Tomato_Septoria_leaf_spot": "Tomato Septoria Leaf Spot",
    "Tomato_Spider_mites_Two_spotted_spider_mite": "Spider Mites Infestation"
  };
  
  return diseaseMap[technicalName] || technicalName;
};

// Get disease description
const getDiseaseDescription = (technicalName) => {
  const descriptions = {
    "Pepper__bell___Bacterial_spot": "Bacterial spot is a serious disease caused by Xanthomonas bacteria affecting peppers. It spreads in warm, humid conditions and causes significant yield loss.",
    "Pepper__bell___healthy": "Great news! Your pepper plant is healthy with no disease symptoms detected.",
    "Potato___Early_blight": "Early blight is a common fungal disease caused by Alternaria solani. It starts on lower leaves and gradually moves up the plant.",
    "Potato___healthy": "Excellent! Your potato plant shows no signs of disease and is growing healthily.",
    "Potato___Late_blight": "Late blight is a devastating disease caused by Phytophthora infestans. It can destroy entire crops within days under favorable conditions.",
    "Tomato__Target_Spot": "Target spot is a fungal disease causing concentric ring lesions on leaves and fruit. It thrives in warm, humid conditions.",
    "Tomato__Tomato_mosaic_virus": "Tomato Mosaic Virus is a highly persistent viral disease causing mottled leaves and reduced plant vigor. It spreads through tools and handling.",
    "Tomato__Tomato_YellowLeaf__Curl_Virus": "This virus is transmitted by whiteflies and causes severe leaf curling, yellowing, and stunted growth.",
    "Tomato_Bacterial_spot": "Bacterial spot affects tomatoes, causing water-soaked lesions on leaves and fruits. It spreads rapidly in humid weather.",
    "Tomato_Early_blight": "Early blight creates characteristic target-spot patterns on leaves. It's common in warm, humid conditions.",
    "Tomato_healthy": "Perfect! Your tomato plant is in excellent health with no disease symptoms.",
    "Tomato_Late_blight": "Late blight is the same disease that caused the Irish potato famine. It thrives in cool, wet weather and spreads rapidly.",
    "Tomato_Leaf_Mold": "Leaf mold is common in greenhouses, creating yellow spots on upper leaf surfaces with fuzzy mold underneath.",
    "Tomato_Septoria_leaf_spot": "Septoria leaf spot causes numerous small circular spots with gray centers. It spreads rapidly in wet conditions.",
    "Tomato_Spider_mites_Two_spotted_spider_mite": "Spider mites are tiny pests that feed on plant sap. They reproduce rapidly in hot, dry conditions."
  };
  
  return descriptions[technicalName] || "Plant disease detected. Follow the recommended treatment for best results.";
};

  // Common diseases showcase with images
  const commonDiseases = [
    {
      name: "Tomato Late Blight",
      icon: "🍅",
      image: tomatoLateBlight,
      shortDesc: "Fungal disease causing rapid plant death",
      description: "A severe fungal disease that causes dark, water-soaked lesions on leaves, stems, and fruits which can kill the entire crop in days",
      cause: "Caused by Phytophthora infestans fungus, favored by cool (15-20°C), wet conditions with high humidity above 90%.",
      symptoms: "Dark brown to black lesions with white fuzzy growth on leaf undersides, water-soaked spots on stems, firm brown rot on fruits.",
      prevention: "Remove infected plants immediately. Apply copper-based fungicide preventively. Improve air circulation and avoid overhead watering."
    },
    {
      name: "Potato Early Blight",
      icon: "🥔",
      image: potatoEarlyBlight,
      shortDesc: "Fungal disease with distinctive target-spot lesions",
      description: "Common fungal disease affecting potatoes and tomatoes, characterized by concentric ring patterns on infected leaves.",
      cause: "Caused by Alternaria solani fungus. Thrives in warm temperatures (24-29°C) with alternating wet and dry periods.",
      symptoms: "Brown-black spots with concentric rings (target pattern) on older leaves, yellowing around spots, premature leaf drop.",
      prevention: "Apply chlorothalonil fungicide. Rotate crops every 2-3 years. Space plants properly. Remove infected debris."
    },
    {
      name: "Pepper Bacterial Spot",
      icon: "🌶️",
      image: pepperBacterialSpot,
      shortDesc: "Bacterial infection causing water-soaked leaf spots",
      description: "Highly contagious bacterial disease affecting peppers, causing significant yield loss and fruit quality degradation.",
      cause: "Caused by four Xanthomonas species. Spread through water splash, contaminated tools, and infected seeds. Favored by warm, humid weather.",
      symptoms: "Small water-soaked spots on leaves turning brown, raised corky spots on fruits, yellow halos around lesions, leaf drop.",
      prevention: "Use disease-free seeds. Apply copper bactericide. Disinfect tools. Ensure 18-24 inch spacing. Avoid overhead irrigation."
    },
    {
      name: "Tomato Mosaic Virus",
      icon: "🍅",
      image: tomatoMosaicVirus,
      shortDesc: "Viral disease causing mottled, distorted foliage",
      description: "Persistent viral infection causing distinctive mosaic patterns and reduced plant vigor, affecting yield and fruit quality.",
      cause: "Transmitted mechanically through infected tools, hands, and by aphids. Can survive in plant debris and soil for extended periods.",
      symptoms: "Mottled light and dark green patterns on leaves, leaf curling and distortion, stunted growth, reduced fruit size and yield.",
      prevention: "Remove infected plants immediately. Control aphid vectors with neem oil. Use virus-resistant varieties. Wash hands and sterilize tools."
    },
    {
      name: "Spider Mites Infestation",
      icon: "🕷️",
      image: spiderMites,
      shortDesc: "Tiny pests causing stippling and webbing damage",
      description: "Microscopic arachnids that feed on plant sap, causing extensive damage through rapid reproduction under favorable conditions.",
      cause: "Two-spotted spider mite (Tetranychus urticae) thrives in hot (27-32°C), dry conditions below 50% humidity. Spreads via wind and contact.",
      symptoms: "Fine stippling or speckling on leaves, yellowing, bronzing of foliage, fine webbing on undersides, leaf drop in severe cases.",
      prevention: "Spray with insecticidal soap or neem oil weekly. Increase humidity with misting. Introduce predatory mites. Keep plants well-watered."
    },
    {
      name: "Tomato Leaf Mold",
      icon: "🍃",
      image: tomatoLeafMold,
      shortDesc: "Fungal disease with fuzzy mold on leaf undersides",
      description: "Common greenhouse disease causing yellow spots on upper leaf surfaces with distinctive olive-green to gray fuzzy mold underneath.",
      cause: "Caused by Passalora fulva (formerly Cladosporium fulvum). Thrives in high humidity above 85% with poor air circulation.",
      symptoms: "Pale green to yellow spots on upper leaf surfaces, olive-green to gray fuzzy growth on undersides, leaf curling and death.",
      prevention: "Maintain humidity below 85%. Ensure good ventilation. Space plants adequately. Apply sulfur-based fungicide if needed."
    }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an image first!");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/detect-disease", {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Detection failed');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to analyze image. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const toggleCard = (index) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(commonDiseases.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(commonDiseases.length / 3)) % Math.ceil(commonDiseases.length / 3));
  };

  const diseasesPerSlide = 3;
  const totalSlides = Math.ceil(commonDiseases.length / diseasesPerSlide);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center py-20 px-4"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&h=400&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl animate-pulse">
              <Camera className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
              Plant Disease Detection
            </h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto animate-fade-in">
            ML-powered diagnosis using advanced computer vision to identify plant diseases instantly
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { icon: Leaf, value: "15+", label: "Diseases Detected", color: "green" },
              { icon: Activity, value: "98%", label: "Accuracy", color: "blue" },
              { icon: Camera, value: "Instant", label: "Analysis", color: "purple" },
              { icon: Shield, value: "Expert", label: "Recommendations", color: "yellow" }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition transform hover:scale-105 cursor-pointer"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <stat.icon className={`w-8 h-8 text-${stat.color}-300 mx-auto mb-2`} />
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Common Diseases Carousel with Flip Cards */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <Leaf className="w-8 h-8 mr-3 text-green-600" />
              Common Plant Diseases Library
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-medium">
                {currentSlide + 1} / {totalSlides}
              </span>
            </div>
          </div>

          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full hover:from-green-700 hover:to-emerald-700 transition shadow-xl transform hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full hover:from-green-700 hover:to-emerald-700 transition shadow-xl transform hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Cards Container */}
            <div className="overflow-hidden px-2">
              <div 
                className="flex transition-transform duration-500 ease-in-out gap-6"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIdx) => (
                  <div key={slideIdx} className="min-w-full grid md:grid-cols-3 gap-6">
                    {commonDiseases.slice(slideIdx * diseasesPerSlide, (slideIdx + 1) * diseasesPerSlide).map((disease, idx) => {
                      const cardIdx = slideIdx * diseasesPerSlide + idx;
                      const isFlipped = flippedCards[cardIdx];

                      return (
                        <div key={cardIdx} className="perspective-1000">
                          <div 
                            className={`relative w-full h-[500px] transition-transform duration-700 cursor-pointer`}
                            style={{
                              transformStyle: 'preserve-3d',
                              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                            }}
                            onClick={() => toggleCard(cardIdx)}
                          >
                            {/* Front of Card */}
                            <div 
                              className="absolute w-full h-full backface-hidden"
                              style={{ backfaceVisibility: 'hidden' }}
                            >
                              <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition border-2 border-gray-200 hover:border-green-400">
                                <div className="relative h-48 overflow-hidden">
                                  <img 
                                    src={disease.image} 
                                    alt={disease.name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
                                    <span className="text-3xl">{disease.icon}</span>
                                  </div>
                                </div>
                                
                                <div className="p-6">
                                  <h3 className="font-bold text-xl text-gray-900 mb-3">{disease.name}</h3>
                                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{disease.shortDesc}</p>
                                  
                                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-200">
                                    <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center">
                                      <Eye className="w-4 h-4 mr-2" />
                                      Quick Info:
                                    </p>
                                    <p className="text-xs text-blue-800">{disease.description}</p>
                                  </div>
                                  
                                  <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-semibold flex items-center justify-center space-x-2 shadow-lg">
                                    <BookOpen className="w-4 h-4" />
                                    <span>Click to Know More</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Back of Card */}
                            <div 
                              className="absolute w-full h-full backface-hidden"
                              style={{ 
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)'
                              }}
                            >
                              <div className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-2xl overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-2xl font-bold">{disease.name}</h3>
                                  <span className="text-3xl">{disease.icon}</span>
                                </div>

                                <div className="space-y-4">
                                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                    <h4 className="font-bold text-sm mb-2 flex items-center">
                                      <Microscope className="w-4 h-4 mr-2" />
                                      CAUSE
                                    </h4>
                                    <p className="text-sm text-indigo-50 leading-relaxed">
                                      {disease.cause}
                                    </p>
                                  </div>

                                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                    <h4 className="font-bold text-sm mb-2 flex items-center">
                                      <AlertCircle className="w-4 h-4 mr-2" />
                                      SYMPTOMS
                                    </h4>
                                    <p className="text-sm text-indigo-50 leading-relaxed">
                                      {disease.symptoms}
                                    </p>
                                  </div>

                                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                    <h4 className="font-bold text-sm mb-2 flex items-center">
                                      <Shield className="w-4 h-4 mr-2" />
                                      PREVENTION
                                    </h4>
                                    <p className="text-sm text-indigo-50 leading-relaxed">
                                      {disease.prevention}
                                    </p>
                                  </div>
                                </div>

                                <button className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl transition font-semibold flex items-center justify-center space-x-2">
                                  <RotateCcw className="w-4 h-4" />
                                  <span>Click to Flip Back</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide 
                      ? 'w-8 bg-green-600' 
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

      {/* Upload Section - Centered */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 transform hover:shadow-3xl transition">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <Camera className="w-8 h-8 mr-3 text-green-600 animate-bounce" />
              Upload Plant Image
            </h2>
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl transition font-semibold shadow-lg transform hover:scale-105"
            >
              <Info className="w-5 h-5" />
              <span>How It Works</span>
              {showHowItWorks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {/* How It Works Collapsible Section */}
          {showHowItWorks && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border-2 border-blue-300 animate-slide-down">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Upload, title: "Upload Image", desc: "Take a clear photo of the affected plant leaf and upload it", color: "green" },
                  { icon: Activity, title: "ML Analysis", desc: "Our deep learning model analyzes using computer vision", color: "blue" },
                  { icon: Shield, title: "Get Results", desc: "Receive instant diagnosis with treatment recommendations", color: "purple" }
                ].map((step, idx) => (
                  <div key={idx} className="text-center transform hover:scale-110 transition">
                    <div className={`bg-${step.color}-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <step.icon className={`w-10 h-10 text-${step.color}-600`} />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Centered Upload Area */}
          <div className="max-w-2xl mx-auto">
            <div className={`border-4 border-dashed rounded-2xl p-8 text-center transition transform hover:scale-105 ${
              preview ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl' : 'border-gray-300 bg-gray-50 hover:border-green-300'
            }`}>
              {preview ? (
                <div className="space-y-4">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-80 mx-auto rounded-xl shadow-2xl object-contain transform hover:scale-105 transition"
                  />
                  <div className="flex gap-3 justify-center">
                    <label className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition flex items-center space-x-2 shadow-lg transform hover:scale-105">
                      <Image className="w-5 h-5" />
                      <span>Change Image</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={resetUpload}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition flex items-center space-x-2 shadow-lg transform hover:scale-105"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-24 h-24 mx-auto text-gray-400 mb-4 animate-bounce" />
                  <p className="text-2xl font-semibold text-gray-700 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG up to 10MB
                  </p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 hover:shadow-2xl transition font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Activity className="w-7 h-7" />
                  <span>Detect Disease</span>
                </>
              )}
            </button>
          </div>
          
        {/* Results Section */}
{/* Results Section */}
{result && (
  <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 animate-fade-in">
    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
      <BookOpen className="w-8 h-8 mr-3 text-green-600" />
      Detailed Disease Analysis
    </h2>

    {/* Disease Name & Confidence */}
    <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-4 rounded-full">
            <AlertCircle className="w-12 h-12" />
          </div>
          <div>
            <p className="text-sm text-green-100">Detected Disease</p>
            <h3 className="text-4xl font-bold">{getLaymanDiseaseName(result.disease)}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-green-100">Confidence</p>
          <p className="text-5xl font-bold">{result.confidence}</p>
        </div>
      </div>
    </div>

    {/* Combined Information Box */}
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-300 shadow-lg">
      {/* About the Disease */}
      <div className="mb-8">
        <h4 className="font-bold text-2xl mb-4 flex items-center text-blue-900">
          <Info className="w-7 h-7 mr-3" />
          About This Disease
        </h4>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <p className="text-gray-700 leading-relaxed text-lg">
            {result.description}
          </p>
        </div>
      </div>

      {/* Treatment & Prevention */}
      <div>
        <h4 className="font-bold text-2xl mb-4 flex items-center text-green-900">
          <Shield className="w-7 h-7 mr-3" />
          Treatment & Prevention
        </h4>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300 shadow-md">
          <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
            {result.treatment}
          </p>
        </div>
      </div>

      {/* Important Note */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-r-xl">
        <div className="flex items-start">
          <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-yellow-900 mb-2">Important Note</h5>
            <p className="text-yellow-800 text-sm">
              {result.disease.includes('healthy') 
                ? "Keep up the excellent work! Regular monitoring and preventive care are essential for maintaining healthy plants."
                : "Early detection and prompt action are crucial. Always remove and destroy infected plant material (don't compost). For severe infections, consult your local agricultural extension office for region-specific recommendations."}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
        </div>


      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default DiseaseDetection;