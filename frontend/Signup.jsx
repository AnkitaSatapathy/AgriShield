import React, { useState } from 'react';
import { User, Phone, Lock, ChevronDown, ArrowRight, UserPlus } from 'lucide-react';

const Signup = ({ onBack, onLoginClick }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    userType: 'buyer'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully! Please log in.");
        if (onLoginClick) onLoginClick();
      } else {
        setErrorMsg(data.detail || "Failed to create account. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-green-900/80 via-emerald-800/70 to-blue-900/80 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 max-w-md w-full mx-auto animate-fade-in-down">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 transform transition-all duration-300 hover:shadow-emerald-500/20">

          <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-12 -translate-y-12"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-x-12 translate-y-12"></div>

            <div className="flex justify-center mb-4 relative z-10">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shadow-inner border border-white/30 transform transition-transform hover:scale-105 duration-300">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-white relative z-10 tracking-tight">Create Account</h2>
            <p className="mt-2 text-green-50 relative z-10 font-medium tracking-wide">Join the AgriShield community</p>
          </div>

          <div className="p-8">
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-xl flex items-start text-red-600">
                <div className="mt-0.5 mr-3">
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-green-600">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-11 w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all duration-300 shadow-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-green-600">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-11 w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all duration-300 shadow-sm"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-green-600">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-11 w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all duration-300 shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>



              <button
                type="submit"
                disabled={isLoading}
                className={`w-full mt-2 py-3.5 px-4 flex justify-center items-center rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-0.5 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 hover:shadow-lg shadow-green-500/30'}`}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
                {!isLoading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-base text-gray-600 font-medium">
                Already have an account?{' '}
                <button onClick={onLoginClick} className="font-bold text-green-600 hover:text-green-500 transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-green-600 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                  Log in here
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-white/80 hover:text-white font-medium transition-colors backdrop-blur-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
