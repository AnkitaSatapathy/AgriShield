import React, { useState } from 'react';
import axios from 'axios';
import { Camera, Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import './DiseaseDetection.css';

const DiseaseDetection = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Handle file selection and preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Validate file type
    if (selectedFile && !selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, etc.)');
      return;
    }
    
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError(null);
  };

  // Upload image to FastAPI backend
  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image first!');
      return;
    }
    
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/api/detect-disease", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000 // 30 second timeout
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error uploading image:", error);
      
      if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else if (error.response) {
        setError(error.response.data.detail || 'Failed to analyze image.');
      } else if (error.request) {
        setError('Cannot connect to server. Please ensure the backend is running on http://localhost:8000');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Plant Disease Detection
          </h1>
          <p className="text-xl text-gray-600">
            Upload a leaf image to identify diseases and get treatment recommendations
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Upload Section */}
          <div className="upload-section mb-6">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              id="file-input"
              className="hidden"
            />
            
            {!preview ? (
              <label 
                htmlFor="file-input" 
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 transition cursor-pointer bg-green-50 hover:bg-green-100"
              >
                <Upload className="w-12 h-12 text-green-600 mb-4" />
                <span className="text-lg font-semibold text-gray-700">Click to upload leaf image</span>
                <span className="text-sm text-gray-500 mt-2">Supports: JPG, PNG, JPEG</span>
              </label>
            ) : (
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full max-h-96 object-contain rounded-xl border-2 border-green-200"
                />
                <button
                  onClick={resetForm}
                  className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Detect Button */}
          {preview && (
            <button 
              onClick={handleUpload} 
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6" />
                  <span>Detect Disease</span>
                </>
              )}
            </button>
          )}

          {/* Results Section */}
          {result && (
            <div className="mt-8 animate-fade-in">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-500">
                <div className="flex items-start space-x-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Detection Result</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-600 font-semibold">Disease: </span>
                        <span className="text-red-600 font-bold text-lg">{result.disease}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-semibold">Confidence: </span>
                        <span className="text-green-600 font-bold">{result.confidence}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-semibold">Severity: </span>
                        <span className={`font-bold ${
                          result.severity === 'High' ? 'text-red-600' : 
                          result.severity === 'Medium' ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {result.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Treatment Recommendation */}
                <div className="mt-6 bg-white rounded-lg p-5 shadow-sm border border-green-200">
                  <h4 className="text-lg font-bold text-green-800 mb-3 flex items-center space-x-2">
                    <span>💊</span>
                    <span>Treatment Recommendation</span>
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{result.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-bold text-gray-900 mb-2">High Accuracy</h3>
            <p className="text-gray-600 text-sm">AI-powered CNN model with 84%+ accuracy</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-gray-600 text-sm">Get diagnosis in seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;