import React, { useState } from 'react'
import { Camera, Upload, FileText, QrCode, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'

const Scan = () => {
  const [activeTab, setActiveTab] = useState('image')
  const [uploading, setUploading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleFileUpload = async (file, type) => {
    if (!file) return

    setUploading(true)
    setError('')
    setAnalysis(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required. Please log in again.')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/scan/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed')
      }

      if (data.success) {
        setAnalysis(data.data)
      } else {
        throw new Error(data.error?.message || 'Analysis failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) handleFileUpload(file, 'image')
  }

  const handleMenuUpload = (e) => {
    const file = e.target.files[0]
    if (file) handleFileUpload(file, 'menu')
  }

  const getSafetyColor = (rating) => {
    switch (rating) {
      case 'green': return 'text-green-600'
      case 'yellow': return 'text-yellow-600'
      case 'red': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  const getSafetyBg = (rating) => {
    switch (rating) {
      case 'green': return 'bg-green-50 border-green-200'
      case 'yellow': return 'bg-yellow-50 border-yellow-200'
      case 'red': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-200 border-gray-300'
    }
  }

  const tabs = [
    { id: 'image', icon: Camera, label: 'Image Scan' },
    { id: 'menu', icon: FileText, label: 'Menu Upload' },
    { id: 'qr', icon: QrCode, label: 'QR Code' }
  ]

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Meal Analysis
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mt-2">
          Upload images or menus to analyze food safety and ingredients
        </p>
      </div>

      {/* Upload Tabs */}
      <div className="bg-white rounded-xl sm:rounded-lg shadow-lg p-4 sm:p-6 mb-6">
        {/* Mobile-friendly Tabs - REMOVED BORDER-BOTTOM */}
        <div className="flex overflow-x-auto scrollbar-hide -mx-2 sm:mx-0 mb-4 sm:mb-6 pb-2">
          <div className="flex space-x-1 sm:space-x-4 min-w-max px-2 sm:px-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Areas */}
        <div className="space-y-4 sm:space-y-6">
          {activeTab === 'image' && (
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 sm:p-6 md:p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploading}
                capture="environment"
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer flex flex-col items-center space-y-3 sm:space-y-4 ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Camera size={40} className="sm:w-12 sm:h-12 text-blue-600" />
                <div>
                  <p className="text-base sm:text-lg font-semibold text-gray-700">
                    Upload Food Image
                  </p>
                  <p className="text-gray-500 text-sm sm:text-base mt-1">
                    Take a picture or upload an existing photo
                  </p>
                </div>
                <span className="text-blue-600 text-sm font-medium bg-blue-50 px-4 py-2 rounded-lg">
                  Choose File
                </span>
              </label>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="border-2 border-dashed border-green-300 rounded-lg p-4 sm:p-6 md:p-8 text-center hover:border-green-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleMenuUpload}
                className="hidden"
                id="menu-upload"
                disabled={uploading}
              />
              <label
                htmlFor="menu-upload"
                className={`cursor-pointer flex flex-col items-center space-y-3 sm:space-y-4 ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FileText size={40} className="sm:w-12 sm:h-12 text-green-600" />
                <div>
                  <p className="text-base sm:text-lg font-semibold text-gray-700">
                    Upload Menu
                  </p>
                  <p className="text-gray-500 text-sm sm:text-base mt-1">
                    PDF, JPG, PNG, GIF, or WEBP formats
                  </p>
                </div>
                <span className="text-green-600 text-sm font-medium bg-green-50 px-4 py-2 rounded-lg">
                  Choose File
                </span>
              </label>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
              <QrCode size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">
                QR Code scanning coming soon...
              </p>
            </div>
          )}
        </div>

        {uploading && (
          <div className="mt-4 sm:mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <LoadingSpinner size="small" />
              <span className="text-sm sm:text-base">Analyzing your upload...</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm sm:text-base">{error}</p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white rounded-xl sm:rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            Analysis Results
          </h2>
          
          {/* Safety Rating */}
          <div className={`border-2 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 ${getSafetyBg(analysis.analysis.safetyRating)}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">Safety Rating</h3>
                <p className={`text-xl sm:text-2xl font-bold ${getSafetyColor(analysis.analysis.safetyRating)}`}>
                  {analysis.analysis.safetyRating.toUpperCase()}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-gray-700 text-sm sm:text-base">{analysis.analysis.mealName}</p>
                <p className="text-xs sm:text-sm text-gray-500">Meal Identified</p>
              </div>
            </div>
          </div>

          {/* Nutritional Breakdown & Ingredients */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Nutritional Breakdown</h3>
              <div className="space-y-1 sm:space-y-2">
                {analysis.analysis.nutritionalBreakdown && Object.entries(analysis.analysis.nutritionalBreakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="capitalize text-gray-600 text-sm sm:text-base">{key}:</span>
                    <span className="font-semibold text-sm sm:text-base">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Detected Ingredients</h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {analysis.analysis.ingredients && analysis.analysis.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Warnings */}
          {analysis.analysis.allergyWarnings && analysis.analysis.allergyWarnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-red-600 mb-1 sm:mb-2">
                Allergy Warnings
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.analysis.allergyWarnings.map((warning, index) => (
                  <li key={index} className="text-red-600/80 text-sm sm:text-base">{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-green-600 mb-1 sm:mb-2">
              Recommendation
            </h3>
            <p className="text-gray-700 text-sm sm:text-base">{analysis.analysis.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Scan