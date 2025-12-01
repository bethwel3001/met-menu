import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Camera, History, User, LogOut, Menu, X, Shield, Home } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Scan', href: '/scan', icon: Camera },
    { name: 'History', href: '/history', icon: History },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
    setIsMobileMenuOpen(false)
  }

  const handleLogoutConfirm = () => {
    logout()
    navigate('/login')
    setShowLogoutConfirm(false)
  }

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false)
  }

  const isActive = (path) => location.pathname === path

  // Enhanced Logout Confirmation Modal with better animation
  const LogoutConfirmation = () => (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-xs w-full p-6 animate-scale-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-14 h-14 bg-red-50 rounded-full mb-4">
            <LogOut className="w-6 h-6 text-red-500" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Log Out?
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            You'll need to sign in again to continue using SafeMenu.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={handleLogoutCancel}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutConfirm}
              className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200 active:scale-95"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'U'
  }

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 group flex-shrink-0"
            >
              <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl group-hover:shadow-md transition-all duration-200">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-gray-900 text-lg leading-none">SafeMenu</span>
                <span className="text-blue-600 text-xs font-medium">Food Safety</span>
              </div>
              <span className="sm:hidden font-bold text-gray-900 text-lg">SafeMenu</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm ${
                      active
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {user && (
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium text-sm ml-2"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              )}
            </div>

            {/* Desktop User Info with DP, Welcome, Name and Email */}
             {user && (
               <div className="hidden md:flex items-center">
                 <div className="flex items-center">

                   {/* Avatar */}
                   <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-600 
                    rounded-full flex items-center justify-center shadow-md">
                     <span className="text-white text-sm font-semibold">
                       {getInitials(user?.profile?.displayName)}
                     </span>
                   </div>

                   {/* Text */}
                   <div className="flex flex-col">
                     <p className="text-[11px] text-blue-600 font-medium tracking-wide">
                       Welcome back
                     </p>

                     <p className="text-sm font-semibold text-gray-900 leading-tight">
                       {user?.profile?.displayName || "User"}
                     </p>

                     <p className="text-xs text-gray-500 truncate max-w-[160px]">
                       {user?.email}
                     </p>
                   </div>
                 </div>
               </div>
             )}


            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200 active:scale-95"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-100 animate-slide-down">
              <div className="flex flex-col space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium text-sm">{item.name}</span>
                      {active && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </Link>
                  )
                })}
                
                {user && (
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 text-left"
                  >
                    <LogOut size={18} />
                    <span className="font-medium text-sm">Logout</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && <LogoutConfirmation />}
    </>
  )
}

export default Navbar