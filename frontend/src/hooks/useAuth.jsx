import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data.user)
        } else {
          // Invalid token, remove it
          localStorage.removeItem('token')
        }
      } else {
        // Token verification failed
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError('')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        const { token, user } = data.data
        localStorage.setItem('token', token)
        setUser(user)
        return { success: true }
      } else {
        const errorMessage = data.error?.message || 'Login failed'
        setError(errorMessage)
        return { 
          success: false, 
          error: errorMessage 
        }
      }
    } catch (error) {
      const errorMsg = 'Network error. Please check your connection.'
      setError(errorMsg)
      return { 
        success: false, 
        error: errorMsg 
      }
    }
  }

  const register = async (userData) => {
    try {
      setError('')
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (data.success) {
        const { token, user } = data.data
        localStorage.setItem('token', token)
        setUser(user)
        return { success: true }
      } else {
        const errorMessage = data.error?.message || 'Registration failed'
        setError(errorMessage)
        return { 
          success: false, 
          error: errorMessage 
        }
      }
    } catch (error) {
      const errorMsg = 'Network error. Please check your connection.'
      setError(errorMsg)
      return { 
        success: false, 
        error: errorMsg 
      }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        return { success: false, error: 'Not authenticated' }
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profile: profileData })
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.data.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Profile update failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please check your connection.' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setError('')
  }

  const clearError = () => {
    setError('')
  }

  const getAuthToken = () => {
    return localStorage.getItem('token')
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    error,
    clearError,
    getAuthToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}