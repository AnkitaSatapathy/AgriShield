import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Phone, MapPin, Map, Home, Sprout, Leaf, Save, Camera, X, Package, ClipboardList } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropUtils';

const Profile = ({ onBack }) => {
  const [USER_ID, setUSER_ID] = useState(localStorage.getItem("USER_ID"));

  const fileInputRef = useRef(null);

  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    phone: '',
    state: '',
    district: '',
    profilePicture: ''
  });

  const [farmInfo, setFarmInfo] = useState({
    landArea: '',
    mainCrop: '',
    farmingType: 'Conventional'
  });

  const [options, setOptions] = useState({
    crops: [],
    states: [],
    state_districts: {}
  });

  const [isLoading, setIsLoading] = useState(true);

  // Cropper states
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let profileData = {};

        // Fetch Profile if USER_ID exists
        if (USER_ID) {
          const profileRes = await fetch(`http://127.0.0.1:8000/api/users/${USER_ID}`);
          if (profileRes.ok) {
            profileData = await profileRes.json();
          }
        }

        // Fetch Options
        const optionsRes = await fetch(`http://127.0.0.1:8000/api/users/options/all`);
        if (optionsRes.ok) {
          const optionsData = await optionsRes.json();
          setOptions(optionsData);
        }

        setPersonalInfo({
          name: profileData.name || '',
          phone: profileData.phone || '',
          state: profileData.state || '',
          district: profileData.district || '',
          profilePicture: profileData.profilePicture || ''
        });
        setFarmInfo({
          landArea: profileData.landArea || '',
          mainCrop: profileData.mainCrop || '',
          farmingType: profileData.farmingType || 'Conventional'
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [USER_ID]);

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setPersonalInfo({ ...personalInfo, state: value, district: '' });
    } else {
      setPersonalInfo({ ...personalInfo, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, currentCroppedAreaPixels) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
      setPersonalInfo(prev => ({ ...prev, profilePicture: croppedImage }));
      setIsCropping(false);
      setTempImage(null);
    } catch (e) {
      console.error(e);
      alert("Failed to crop image.");
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setTempImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFarmChange = (e) => {
    setFarmInfo({ ...farmInfo, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!USER_ID) {
      alert("You must be logged in to save a profile. Please go back and Login.");
      return;
    }

    try {
      const payload = { ...personalInfo, ...farmInfo };
      const response = await fetch(`http://127.0.0.1:8000/api/users/${USER_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Profile saved successfully!");
      } else {
        alert("Error saving profile. Please check the network.");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Error saving profile. Server might be down.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="flex flex-col items-center animate-pulse">
          <Leaf className="w-12 h-12 text-green-500 mb-4 animate-bounce" />
          <p className="text-emerald-700 font-medium text-lg">Loading your farm profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-[#e6fffa] to-[#f8fafc] pb-12 pt-24 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden z-0">
      {/* Animated Background Orbs */}
      <div className="absolute pointer-events-none inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 mix-blend-multiply filter blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-green-400/30 mix-blend-multiply filter blur-[100px] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(52, 211, 153, 0.3); border-color: rgba(255,255,255,0.3); }
          50% { box-shadow: 0 0 30px rgba(52, 211, 153, 0.7); border-color: rgba(52, 211, 153, 0.6); }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-slide-up {
          animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animate-pop-in {
          animation: popIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
      `}</style>

      {/* Fancy Banner */}
      <div className="max-w-4xl mx-auto mb-8 rounded-[2rem] overflow-hidden shadow-2xl relative mt-4 h-72 group animate-slide-up">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] group-hover:scale-110"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1595908688747-d5d1c3e39023?q=80&w=2072&auto=format&fit=crop')" }}
        ></div>
        {/* Vibrant Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/90 via-teal-800/60 to-transparent mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white shadow-lg mx-2" style={{ animation: 'float 6s ease-in-out infinite, pulseGlow 3s infinite' }}>
          <Leaf className="w-4 h-4 text-emerald-300 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide flex items-center">Farmer Profile</span>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 flex items-end">
          <div className="relative group/avatar cursor-pointer animate-pop-in delay-200" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full p-1.5 shadow-2xl relative z-10 transition-all duration-300 hover:shadow-emerald-500/50 group-hover/avatar:scale-105 group-hover/avatar:-translate-y-2 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-inner bg-white">
                {personalInfo.profilePicture ? (
                  <img src={personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                    <User className="w-12 h-12 text-teal-600 drop-shadow-md" />
                  </div>
                )}
              </div>

              {/* Overlay edit icon */}
              <div className="absolute inset-1.5 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300">
                <Camera className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="ml-8 mb-2 transform transition-transform duration-500 group-hover:translate-x-2">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-teal-50 tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              {personalInfo.name || "Farmer Profile"}
            </h1>
            <p className="text-emerald-300 font-medium flex items-center mt-2.5 bg-black/30 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
              <MapPin className="w-4 h-4 mr-1.5 text-teal-400" /> {personalInfo.district || "Update your location"}, {personalInfo.state}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSave} className="space-y-8">

          {/* Personal Information */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(20,184,166,0.1)] transition-all duration-500 border border-emerald-50 overflow-hidden animate-slide-up delay-200">
            <div className="px-8 py-6 border-b border-emerald-50/50 bg-gradient-to-r from-emerald-50/50 to-transparent">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center transform transition-transform duration-300 hover:translate-x-2">
                <div className="bg-gradient-to-br from-emerald-100 to-teal-200 p-2.5 rounded-2xl mr-4 shadow-inner">
                  <User className="w-6 h-6 text-teal-700" />
                </div>
                Personal Details
              </h2>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-green-600">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={personalInfo.name}
                      onChange={handlePersonalChange}
                      className="pl-11 w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-300 font-medium text-gray-800 hover:border-emerald-300"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-emerald-600">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={personalInfo.phone}
                      onChange={handlePersonalChange}
                      className="pl-11 w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-300 font-medium text-gray-800 hover:border-emerald-300"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-emerald-600">State</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Map className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <select
                      name="state"
                      value={personalInfo.state}
                      onChange={handlePersonalChange}
                      className="pl-11 w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-300 font-medium text-gray-800 appearance-none hover:border-emerald-300 cursor-pointer"
                    >
                      <option value="">Select a State</option>
                      {options.states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-emerald-600">District</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <select
                      name="district"
                      value={personalInfo.district}
                      onChange={handlePersonalChange}
                      disabled={!personalInfo.state}
                      className="pl-11 w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-300 font-medium text-gray-800 appearance-none disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-300 cursor-pointer"
                    >
                      <option value="">{personalInfo.state ? 'Select a District' : 'Select State First'}</option>
                      {(options.state_districts[personalInfo.state] || []).map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Farm Information */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(245,158,11,0.1)] transition-all duration-500 border border-amber-50 overflow-hidden animate-slide-up delay-300">
            <div className="px-8 py-6 border-b border-amber-50/50 bg-gradient-to-r from-amber-50/50 to-transparent">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center transform transition-transform duration-300 hover:translate-x-2">
                <div className="bg-gradient-to-br from-amber-100 to-orange-200 p-2.5 rounded-2xl mr-4 shadow-inner">
                  <Home className="w-6 h-6 text-amber-700" />
                </div>
                Farm Details
              </h2>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-amber-600">Total Land Area (in Acres)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Map className="h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                    </div>
                    <input
                      type="number"
                      name="landArea"
                      value={farmInfo.landArea}
                      onChange={handleFarmChange}
                      className="pl-11 w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white outline-none transition-all duration-300 font-medium text-gray-800 hover:border-amber-300"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-amber-600">Main Crop</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Sprout className="h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                    </div>
                    <select
                      name="mainCrop"
                      value={farmInfo.mainCrop}
                      onChange={handleFarmChange}
                      className="pl-11 w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white outline-none transition-all duration-300 font-medium text-gray-800 appearance-none hover:border-amber-300 cursor-pointer"
                    >
                      <option value="">Select a Crop</option>
                      {options.crops.map((crop) => (
                        <option key={crop} value={crop}>{crop.charAt(0).toUpperCase() + crop.slice(1)}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 mt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-4">Farming Practice</label>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <label className={`relative flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 flex-1 w-full overflow-hidden ${farmInfo.farmingType === 'Organic' ? 'bg-emerald-50 border-emerald-500 shadow-md transform -translate-y-1' : 'bg-white border-gray-200 hover:bg-emerald-50/50 hover:border-emerald-300'}`}>
                      {farmInfo.farmingType === 'Organic' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
                      )}

                      <input
                        type="radio"
                        name="farmingType"
                        value="Organic"
                        checked={farmInfo.farmingType === 'Organic'}
                        onChange={handleFarmChange}
                        className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 accent-emerald-600 z-10"
                      />
                      <div className="ml-5 flex items-center z-10">
                        <div className={`p-3 rounded-xl mr-4 transition-colors ${farmInfo.farmingType === 'Organic' ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-500'}`}>
                          <Leaf className="w-6 h-6" />
                        </div>
                        <div>
                          <span className={`block text-lg font-bold transition-colors ${farmInfo.farmingType === 'Organic' ? 'text-emerald-900' : 'text-gray-700'}`}>Organic</span>
                          <span className="text-sm text-gray-500 font-medium">No synthetic fertilizers</span>
                        </div>
                      </div>
                    </label>

                    <label className={`relative flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 flex-1 w-full overflow-hidden ${farmInfo.farmingType === 'Conventional' ? 'bg-blue-50 border-blue-500 shadow-md transform -translate-y-1' : 'bg-white border-gray-200 hover:bg-blue-50/50 hover:border-blue-300'}`}>
                      {farmInfo.farmingType === 'Conventional' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                      )}

                      <input
                        type="radio"
                        name="farmingType"
                        value="Conventional"
                        checked={farmInfo.farmingType === 'Conventional'}
                        onChange={handleFarmChange}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 accent-blue-600 z-10"
                      />
                      <div className="ml-5 flex items-center z-10">
                        <div className={`p-3 rounded-xl mr-4 transition-colors ${farmInfo.farmingType === 'Conventional' ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
                          <Sprout className="w-6 h-6" />
                        </div>
                        <div>
                          <span className={`block text-lg font-bold transition-colors ${farmInfo.farmingType === 'Conventional' ? 'text-blue-900' : 'text-gray-700'}`}>Conventional</span>
                          <span className="text-sm text-gray-500 font-medium">Standard farming practices</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>



          <div className="flex justify-end pt-6 pb-16 animate-pop-in delay-500 relative z-10">
            <button
              type="submit"
              className="px-10 py-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(16,185,129,0.8)] hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.9)] transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 font-bold text-xl flex items-center justify-center group w-full md:w-auto min-w-[280px] border border-white/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-300 blur-md pointer-events-none"></div>
              <Save className="w-7 h-7 mr-3 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
              <span className="relative z-10 tracking-wide text-[1.15rem]">Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cropper Modal */}
      {isCropping && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">Adjust Profile Picture</h3>
              <button onClick={handleCropCancel} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full h-80 bg-gray-900">
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCropCancel}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropSave}
                  className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-colors"
                >
                  Crop & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
