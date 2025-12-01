import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, Heart, AlertTriangle, Utensils, Camera, Edit3, Save, X, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    displayName: '',
    healthConditions: [],
    allergies: [],
    dietaryRestrictions: [],
    preferredMeat: [],
    favoriteMeals: []
  })
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState(null)
  const [showCompletionTips, setShowCompletionTips] = useState(false)

  useEffect(() => {
    if (user?.profile) {
      setProfile({
        displayName: user.profile.displayName || '',
        healthConditions: user.profile.healthConditions || [],
        allergies: user.profile.allergies || [],
        dietaryRestrictions: user.profile.dietaryRestrictions || [],
        preferredMeat: user.profile.preferredMeat || [],
        favoriteMeals: user.profile.favoriteMeals || []
      })
    }
  }, [user])

  const healthConditions = [
    'Diabetes', 'High Blood Pressure', 'Heart Disease', 'Celiac Disease',
    'Lactose Intolerance', 'Irritable Bowel Syndrome', 'Thyroid Disorder',
    'Kidney Disease', 'Liver Disease', 'None'
  ]

  const commonAllergies = [
    'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat/Gluten', 
    'Fish', 'Shellfish', 'Sesame', 'Sulfites', 'None'
  ]

  const dietaryRestrictions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo',
    'Low Sodium', 'Low Carb', 'Halal', 'Kosher', 'Pescatarian', 'None'
  ]

  const meatPreferences = [
    'Chicken', 'Beef', 'Pork', 'Lamb', 'Fish', 'Seafood',
    'Turkey', 'Duck', 'Venison', 'None'
  ]

  const sections = [
    { id: 'personal', icon: User, title: 'Personal Info', color: 'blue' },
    { id: 'health', icon: Heart, title: 'Health Conditions', color: 'red' },
    { id: 'allergies', icon: AlertTriangle, title: 'Allergies', color: 'yellow' },
    { id: 'dietary', icon: Utensils, title: 'Dietary Restrictions', color: 'green' },
    { id: 'preferences', icon: User, title: 'Meat Preferences', color: 'blue' }
  ]

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaveMessage('')
    
    try {
      const result = await updateProfile(profile)
      
      if (result.success) {
        setSaveMessage('Profile updated successfully!')
        setIsEditing(false)
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (error) {
      setError('An unexpected error occurred')
      console.error('Profile update error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (user?.profile) {
      setProfile({
        displayName: user.profile.displayName || '',
        healthConditions: user.profile.healthConditions || [],
        allergies: user.profile.allergies || [],
        dietaryRestrictions: user.profile.dietaryRestrictions || [],
        preferredMeat: user.profile.preferredMeat || [],
        favoriteMeals: user.profile.favoriteMeals || []
      })
    }
    setIsEditing(false)
    setError('')
    setSaveMessage('')
    setActiveSection(null)
  }

  const handleCheckboxChange = (category, value) => {
    setProfile(prev => {
      const currentArray = prev[category] || []
      
      if (value === 'None') {
        return {
          ...prev,
          [category]: currentArray.includes('None') ? [] : ['None']
        }
      }
      
      if (currentArray.includes('None')) {
        return {
          ...prev,
          [category]: [value]
        }
      }
      
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      
      return {
        ...prev,
        [category]: newArray
      }
    })
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          avatar: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const calculateCompletion = () => {
    return user?.profile?.completed || 0
  }

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'U'
  }

  const toggleSection = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId)
  }

  const getCompletionTips = () => {
    const tips = []
    if (!profile.displayName) tips.push('Add your display name')
    if (profile.healthConditions.length === 0) tips.push('Select health conditions')
    if (profile.allergies.length === 0) tips.push('Add your allergies')
    if (profile.dietaryRestrictions.length === 0) tips.push('Set dietary restrictions')
    return tips
  }

  const CompletionTip = ({ tip, completed }) => (
    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
        completed ? 'bg-green-500' : 'bg-gray-300'
      }`}>
        {completed && <CheckCircle className="w-4 h-4 text-white" />}
      </div>
      <span className={`text-sm ${completed ? 'text-gray-600' : 'text-gray-900'}`}>
        {tip}
      </span>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
      {/* Mobile Header */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600">Completion</div>
            <div className="text-xl font-bold text-blue-600">{calculateCompletion()}%</div>
          </div>
        </div>

        {/* Mobile Progress Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload-mobile"
                  disabled={!isEditing}
                />
                <label
                  htmlFor="avatar-upload-mobile"
                  className={`cursor-pointer ${!isEditing ? 'cursor-not-allowed' : ''}`}
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {getInitials(profile.displayName)}
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white">
                      <Camera className="w-3 h-3" />
                    </div>
                  )}
                </label>
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">
                  {profile.displayName || 'User'}
                </h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Profile Complete</span>
              <span>{calculateCompletion()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateCompletion()}%` }}
              />
            </div>
          </div>

          {/* Edit Buttons */}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Completion Tips Toggle */}
        <button
          onClick={() => setShowCompletionTips(!showCompletionTips)}
          className="w-full bg-blue-100 text-blue-700 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 mb-4"
        >
          <span>Improve Profile Completion</span>
          {showCompletionTips ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Completion Tips */}
        {showCompletionTips && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Complete Your Profile</h3>
            <div className="space-y-2">
              {getCompletionTips().map((tip, index) => (
                <CompletionTip key={index} tip={tip} completed={false} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-600">Profile Completion</div>
          <div className="text-2xl font-bold text-blue-600">{calculateCompletion()}%</div>
        </div>
      </div>

      {/* Messages */}
      {saveMessage && (
        <div className="mb-6 bg-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Save className="w-5 h-5 text-green-600" />
            <p className="text-green-600 font-medium">{saveMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-100 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload-desktop"
                  disabled={!isEditing}
                />
                <label
                  htmlFor="avatar-upload-desktop"
                  className={`cursor-pointer ${!isEditing ? 'cursor-not-allowed' : ''}`}
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-xl font-bold">
                        {getInitials(profile.displayName)}
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute bottom-2 right-2 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  )}
                </label>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                {profile.displayName || 'User'}
              </h2>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-gray-500 text-sm mt-1">{user?.phoneNumber}</p>
            </div>

            <div className="space-y-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Profile Complete</span>
                <span>{calculateCompletion()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateCompletion()}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form - Mobile Accordion & Desktop Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
            {/* Mobile Accordion */}
            <div className="lg:hidden space-y-3">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                
                return (
                  <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={20} className={`text-${section.color}-600`} />
                        <span className="font-semibold text-gray-800">{section.title}</span>
                      </div>
                      {isActive ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    {isActive && (
                      <div className="p-4">
                        {section.id === 'personal' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Display Name
                              </label>
                              <input
                                type="text"
                                value={profile.displayName}
                                onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                placeholder="Your display name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                              </label>
                              <div className="relative">
                                <input
                                  type="tel"
                                  value={user?.phoneNumber || ''}
                                  disabled
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  <Phone className="w-5 h-5 text-gray-400" />
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Phone number cannot be changed for security reasons
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {section.id === 'health' && (
                          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                            {healthConditions.map(condition => (
                              <label key={condition} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                isEditing ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={profile.healthConditions.includes(condition)}
                                  onChange={() => handleCheckboxChange('healthConditions', condition)}
                                  disabled={!isEditing}
                                  className="rounded text-blue-600 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <span className={`flex-1 ${!isEditing ? 'text-gray-500' : 'text-gray-700'}`}>
                                  {condition}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {['allergies', 'dietary', 'preferences'].includes(section.id) && (
                          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                            {(section.id === 'allergies' ? commonAllergies : 
                              section.id === 'dietary' ? dietaryRestrictions : meatPreferences).map(item => (
                              <label key={item} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                isEditing ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={profile[section.id === 'allergies' ? 'allergies' : 
                                    section.id === 'dietary' ? 'dietaryRestrictions' : 'preferredMeat'].includes(item)}
                                  onChange={() => handleCheckboxChange(
                                    section.id === 'allergies' ? 'allergies' : 
                                    section.id === 'dietary' ? 'dietaryRestrictions' : 'preferredMeat', 
                                    item
                                  )}
                                  disabled={!isEditing}
                                  className="rounded text-blue-600 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <span className={`flex-1 ${!isEditing ? 'text-gray-500' : 'text-gray-700'}`}>
                                  {item}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Desktop Form */}
            <div className="hidden lg:block space-y-8">
              {/* Personal Information */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User size={20} className="mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                      placeholder="Your display name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={user?.phoneNumber || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Phone number cannot be changed for security reasons
                    </p>
                  </div>
                </div>
              </section>

              {/* Health Conditions */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Heart size={20} className="mr-2 text-red-600" />
                  Health Conditions
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {healthConditions.map(condition => (
                    <label key={condition} className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                      isEditing ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'
                    }`}>
                      <input
                        type="checkbox"
                        checked={profile.healthConditions.includes(condition)}
                        onChange={() => handleCheckboxChange('healthConditions', condition)}
                        disabled={!isEditing}
                        className="rounded text-blue-600 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`flex-1 ${!isEditing ? 'text-gray-500' : 'text-gray-700'}`}>
                        {condition}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Allergies */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertTriangle size={20} className="mr-2 text-yellow-600" />
                  Allergies
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {commonAllergies.map(allergy => (
                    <label key={allergy} className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                      isEditing ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'
                    }`}>
                      <input
                        type="checkbox"
                        checked={profile.allergies.includes(allergy)}
                        onChange={() => handleCheckboxChange('allergies', allergy)}
                        disabled={!isEditing}
                        className="rounded text-blue-600 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`flex-1 ${!isEditing ? 'text-gray-500' : 'text-gray-700'}`}>
                        {allergy}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Dietary Restrictions */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Utensils size={20} className="mr-2 text-green-600" />
                  Dietary Restrictions
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {dietaryRestrictions.map(restriction => (
                    <label key={restriction} className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                      isEditing ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'
                    }`}>
                      <input
                        type="checkbox"
                        checked={profile.dietaryRestrictions.includes(restriction)}
                        onChange={() => handleCheckboxChange('dietaryRestrictions', restriction)}
                        disabled={!isEditing}
                        className="rounded text-blue-600 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`flex-1 ${!isEditing ? 'text-gray-500' : 'text-gray-700'}`}>
                        {restriction}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Meat Preferences */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Meat Preferences
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {meatPreferences.map(meat => (
                    <label key={meat} className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                      isEditing ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'
                    }`}>
                      <input
                        type="checkbox"
                        checked={profile.preferredMeat.includes(meat)}
                        onChange={() => handleCheckboxChange('preferredMeat', meat)}
                        disabled={!isEditing}
                        className="rounded text-blue-600 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`flex-1 ${!isEditing ? 'text-gray-500' : 'text-gray-700'}`}>
                        {meat}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile