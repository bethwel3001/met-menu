import React from 'react'
import { Link } from 'react-router-dom'
import { Camera, FileText, Shield, BarChart3, Sparkles, Heart, CheckCircle, Share2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const Home = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: Camera,
      title: 'Instant Image Analysis',
      description: 'Take a photo of your meal and get immediate safety analysis with AI-powered ingredient detection',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      icon: FileText,
      title: 'Menu Scanning',
      description: 'Upload restaurant menus to find safe options tailored to your dietary needs and allergies',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      icon: Shield,
      title: 'Allergy Detection',
      description: 'Advanced AI detects potential allergens with color-coded safety ratings for quick understanding',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    {
      icon: BarChart3,
      title: 'Health Tracking',
      description: 'Monitor your meal history, track reactions, and maintain your food safety journey',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  ]

  const stats = [
    { number: '1000+', label: 'Meals Analyzed' },
    { number: '50+', label: 'Allergens Detected' },
    { number: '99%', label: 'Accuracy Rate' },
    { number: '24/7', label: 'AI Protection' }
  ]

  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SafeMenu - Food Safety App',
        text: 'Check out SafeMenu - an AI-powered app that helps detect allergens and keep your meals safe!',
        url: window.location.origin
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin)
      alert('App link copied to clipboard! Share it with your friends.')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 border border-blue-200 mb-4 sm:mb-6">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">AI-Powered Food Safety</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              Eat with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed">
              AI-powered food analysis to protect you from allergens and help maintain your dietary needs
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-2xl mx-auto">
              SafeMenu uses advanced artificial intelligence to analyze meals, detect potential allergens, 
              and provide personalized safety recommendations based on your unique health profile.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center mb-6 sm:mb-8">
              <Link
                to="/scan"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Camera className="w-4 h-4" />
                Start Scanning
              </Link>
              {user?.profile?.completed < 100 && (
                <Link
                  to="/profile"
                  className="w-full sm:w-auto border border-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Heart className="w-4 h-4" />
                  Complete Profile
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-2 sm:p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200">
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Completion Alert */}
      {user?.profile?.completed < 100 && (
        <section className="bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 bg-amber-100 rounded-full">
                  <CheckCircle className="w-3 h-3 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 text-xs sm:text-sm">Complete Your Profile</h3>
                  <p className="text-amber-600 text-xs">
                    Finish setup to get personalized safety recommendations ({user.profile.completed}% complete)
                  </p>
                </div>
              </div>
              <Link
                to="/profile"
                className="w-full sm:w-auto bg-amber-500 text-white px-3 sm:px-4 py-1.5 rounded-lg font-medium hover:bg-amber-600 transition-colors text-xs sm:text-sm text-center"
              >
                Complete Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-10 sm:py-14 lg:py-18 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              How SafeMenu Protects You
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Advanced features designed to keep you safe and informed about every meal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group relative bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent"
                >
                  {/* Icon Background */}
                  <div className={`inline-flex p-2 rounded-lg ${feature.bgColor} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${feature.textColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" 
                       style={{ background: `linear-gradient(135deg, ${feature.color.replace('from-', '').replace('to-', '').split(' ').map(c => `var(--${c})`).join(', ')})` }} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Safety Colors Section */}
      <section className="py-10 sm:py-14 lg:py-18 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              Understanding Safety Ratings
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Clear color-coded system for quick understanding of meal safety
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { 
                color: 'green', 
                label: 'Safe', 
                description: 'No allergens detected, aligns perfectly with your dietary preferences',
                icon: CheckCircle,
                bg: 'bg-green-50',
                border: 'border-green-200',
                text: 'text-green-700'
              },
              { 
                color: 'yellow', 
                label: 'Moderate', 
                description: 'Some concerns present, verify ingredients and consume with caution',
                icon: Shield,
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                text: 'text-amber-700'
              },
              { 
                color: 'red', 
                label: 'Unsafe', 
                description: 'Contains allergens or significant health risks - avoid consumption',
                icon: Shield,
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-700'
              }
            ].map((rating) => {
              const Icon = rating.icon
              return (
                <div
                  key={rating.color}
                  className={`${rating.bg} ${rating.border} rounded-lg p-4 sm:p-6 text-center border-2 transition-transform duration-200 hover:scale-105`}
                >
                  <div className={`w-10 h-10 rounded-full bg-${rating.color}-500 mx-auto mb-3 flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`text-base font-semibold ${rating.text} mb-1`}>
                    {rating.label}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {rating.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-10 sm:py-14 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Ready to Eat Safely?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-2xl mx-auto">
            Join thousands of users who trust SafeMenu for their food safety needs
          </p>
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
          >
            <Camera className="w-4 h-4" />
            Start Your First Scan
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-14 lg:py-18 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold mb-2">SafeMenu</h3>
              <p className="text-gray-400 text-sm">
                AI-powered food safety and allergen detection
              </p>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold mb-3">Share with Friends</h4>
              <button
                onClick={shareApp}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <Share2 className="w-4 h-4" />
                Share App
              </button>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} SafeMenu. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home