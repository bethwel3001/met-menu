import React, { useState, useEffect } from 'react'
import { Calendar, Clock, AlertTriangle, CheckCircle, Loader } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const History = () => {
  const { user } = useAuth()
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchScanHistory()
  }, [])

  const fetchScanHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/scan/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch scan history')
      }
      
      const data = await response.json()
      if (data.success) {
        setScans(data.data.scans)
      } else {
        setError(data.error?.message || 'Failed to load history')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getSafetyIcon = (rating) => {
    switch (rating) {
      case 'green':
        return <CheckCircle className="text-health-green" size={20} />
      case 'yellow':
        return <AlertTriangle className="text-health-yellow" size={20} />
      case 'red':
        return <AlertTriangle className="text-health-red" size={20} />
      default:
        return <Clock className="text-gray-400" size={20} />
    }
  }

  const getSafetyColor = (rating) => {
    switch (rating) {
      case 'green': return 'safety-green'
      case 'yellow': return 'safety-yellow'
      case 'red': return 'safety-red'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Scan History
        </h1>
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-health-blue animate-spin mr-3" />
          <span className="text-gray-600">Loading your scan history...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Scan History
        </h1>
        <div className="bg-health-red/10 border border-health-red/20 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-health-red mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-health-red mb-2">
            Failed to Load History
          </h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchScanHistory}
            className="mt-4 bg-health-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-health-blue/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Scan History
      </h1>

      {scans.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No scans yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start by scanning your first meal to see your history here.
          </p>
          <a
            href="/scan"
            className="bg-health-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-health-blue/90 transition-colors"
          >
            Start Scanning
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {scans.map((scan) => (
            <div
              key={scan._id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getSafetyIcon(scan.result.safetyRating)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {scan.result.mealName}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {formatDate(scan.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSafetyColor(scan.result.safetyRating)}`}>
                    {scan.result.safetyRating.toUpperCase()}
                  </span>
                  <span className="text-gray-400 text-sm capitalize">
                    {scan.type}
                  </span>
                </div>
              </div>
              
              {scan.result.allergyWarnings.length > 0 && (
                <div className="mt-3 p-3 bg-health-yellow/10 rounded-lg">
                  <p className="text-sm text-health-yellow font-medium">
                    Allergy Warnings: {scan.result.allergyWarnings.join(', ')}
                  </p>
                </div>
              )}
              
              <p className="mt-3 text-gray-600 text-sm">
                {scan.result.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History