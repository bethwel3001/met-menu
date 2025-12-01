import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Shield, LogIn, AlertCircle, CheckCircle, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGuestLoading, setIsGuestLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  // Redirect if already authenticated (safety check)
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors({})

    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        setSuccess(true)
        // Show success state briefly before redirect
        setTimeout(() => {
          navigate(from, { replace: true })
        }, 1500)
      } else {
        setErrors({ 
          submit: result.error || 'Login failed. Please check your credentials and try again.' 
        })
      }
    } catch (error) {
      setErrors({ 
        submit: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGuestLogin = async () => {
    setIsGuestLoading(true)
    setErrors({})

    try {
      // Generate a unique guest email
      const guestEmail = `guest-${Date.now()}@safemenu.com`
      const guestPassword = `guest-${Math.random().toString(36).slice(-8)}`
      
      const result = await login(guestEmail, guestPassword)
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate(from, { replace: true })
        }, 1500)
      } else {
        setErrors({ 
          submit: 'Unable to create guest session. Please try again.' 
        })
      }
    } catch (error) {
      setErrors({ 
        submit: 'Failed to create guest account. Please try again.' 
      })
    } finally {
      setIsGuestLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-blue/5 via-white to-health-teal/10 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Success Overlay */}
        {success && (
          <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 animate-fade-in">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-health-green mx-auto mb-4 animate-slide-up" />
              <h2 className="text-2xl font-health font-bold text-gray-900 mb-2">
                Login Successful
              </h2>
              <p className="text-gray-600">Redirecting to your dashboard...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-health-blue rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-health font-bold text-gray-900">
              SafeMenu
            </h1>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Sign in to continue your food safety journey
          </p>
        </div>

        {/* Guest Login Option */}
        <div className="bg-health-teal/10 border border-health-teal/20 rounded-lg p-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-health-teal mb-1 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Quick Access
              </h3>
              <p className="text-health-teal/80 text-sm">
                Try SafeMenu without creating an account
              </p>
            </div>
            <button
              onClick={handleGuestLogin}
              disabled={isGuestLoading}
              className="bg-health-teal text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-health-teal/90 focus:ring-2 focus:ring-health-teal focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isGuestLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span>{isGuestLoading ? 'Entering...' : 'Login as Guest'}</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign in with your account</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-slide-up">
          {/* Email Field */}
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

          {/* Password Field */}
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
                placeholder="Enter your password"
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

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-health-red/10 border border-health-red/20 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-health-red flex-shrink-0" />
                <p className="text-health-red text-sm">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-health-blue text-white py-3 px-4 rounded-lg font-semibold hover:bg-health-blue/90 focus:ring-2 focus:ring-health-blue focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <LoadingSpinner size="small" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
          </button>

          {/* Forgot Password */}
          <div className="text-center">
            <button
              type="button"
              className="text-health-blue hover:text-health-blue/80 text-sm font-medium transition-colors focus-health"
            >
              Forgot your password?
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-health-teal hover:text-health-teal/80 font-semibold transition-colors focus-health"
              >
                Create one here
              </Link>
            </p>
          </div>
        </form>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Your data is protected with enterprise-grade security and encryption
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login