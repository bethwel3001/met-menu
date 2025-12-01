import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, UserPlus, AlertCircle, CheckCircle, Phone } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    profile: {
      displayName: ''
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  const { register, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated (safety check)
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const validateStep1 = () => {
    const newErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number'
    }

    // Display name validation
    if (!formData.profile.displayName.trim()) {
      newErrors.displayName = 'Display name is required'
    } else if (formData.profile.displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password = 'Password must contain both uppercase and lowercase letters'
      } else if (!/(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number'
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error when user starts typing
    const fieldName = name.split('.')[1] || name
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }))
    }
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep2()) return

    setIsSubmitting(true)
    setErrors({})

    try {
      const result = await register(formData)
      
      if (result.success) {
        setSuccess(true)
        // Show success state briefly before redirect
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 2000)
      } else {
        setErrors({ 
          submit: result.error || 'Registration failed. Please try again.' 
        })
        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      setErrors({ 
        submit: 'An unexpected error occurred. Please try again.' 
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Step {currentStep} of 2</span>
        <span className="text-sm text-gray-500">
          {currentStep === 1 ? 'Personal Information' : 'Security Settings'}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-health-blue h-2 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(currentStep / 2) * 100}%` }}
        />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-blue/5 via-white to-health-teal/10 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Success Overlay */}
        {success && (
          <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 animate-fade-in">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-health-green mx-auto mb-4 animate-slide-up" />
              <h2 className="text-2xl font-health font-bold text-gray-900 mb-2">
                Account Created
              </h2>
              <p className="text-gray-600">Welcome to SafeMenu! Redirecting...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-health-teal rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-health font-bold text-gray-900">
              SafeMenu
            </h1>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-600">
            Join thousands protecting their health with AI-powered food safety
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-slide-up">
          <ProgressBar />

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-health-red/10 border border-health-red/20 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-health-red flex-shrink-0" />
                <p className="text-health-red text-sm">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="displayName"
                    name="profile.displayName"
                    type="text"
                    value={formData.profile.displayName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-health-blue focus:border-transparent transition-colors ${
                      errors.displayName ? 'border-health-red focus:ring-health-red' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                  {errors.displayName && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <AlertCircle className="w-5 h-5 text-health-red" />
                    </div>
                  )}
                </div>
                {errors.displayName && (
                  <p className="mt-2 text-sm text-health-red animate-fade-in">
                    {errors.displayName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-health-blue focus:border-transparent transition-colors ${
                      errors.email ? 'border-health-red focus:ring-health-red' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <AlertCircle className="w-5 h-5 text-health-red" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-health-red animate-fade-in">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-health-blue focus:border-transparent transition-colors ${
                      errors.phoneNumber ? 'border-health-red focus:ring-health-red' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                    disabled={isSubmitting}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  {errors.phoneNumber && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <AlertCircle className="w-5 h-5 text-health-red" />
                    </div>
                  )}
                </div>
                {errors.phoneNumber && (
                  <p className="mt-2 text-sm text-health-red animate-fade-in">
                    {errors.phoneNumber}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Used for account recovery and security alerts
                </p>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-health-blue text-white py-3 px-4 rounded-lg font-semibold hover:bg-health-blue/90 focus:ring-2 focus:ring-health-blue focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Continue to Security</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Step 2: Security Settings */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-health-blue/5 border border-health-blue/20 rounded-lg p-4">
                <h3 className="font-semibold text-health-blue mb-1 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Requirements
                </h3>
                <p className="text-health-blue/80 text-sm">
                  Your password must be at least 6 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-health-blue focus:border-transparent transition-colors ${
                      errors.password ? 'border-health-red focus:ring-health-red' : 'border-gray-300'
                    }`}
                    placeholder="Create a strong password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-health-red animate-fade-in">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-health-blue focus:border-transparent transition-colors ${
                      errors.confirmPassword ? 'border-health-red focus:ring-health-red' : 'border-gray-300'
                    }`}
                    placeholder="Re-enter your password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-health-red animate-fade-in">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-health-teal text-white py-3 px-4 rounded-lg font-semibold hover:bg-health-teal/90 focus:ring-2 focus:ring-health-teal focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                  <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-health-blue hover:text-health-blue/80 font-semibold transition-colors focus-health"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>

        {/* Privacy Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
            Your health data is encrypted and never shared without your consent.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register