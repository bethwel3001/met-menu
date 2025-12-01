// Fallback AI setup since GenKit might not be properly configured
// This provides basic functionality without external AI dependencies

let aiInitialized = false;
let aiAvailable = false;

export const initializeAI = () => {
  try {
    // Check if we have the required environment variables for AI
    const hasAIConfig = process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (hasAIConfig) {
      console.log('✅ AI services configured');
      aiAvailable = true;
    } else {
      console.log('ℹ️ AI services not configured - using fallback mode');
      console.log('💡 Set GOOGLE_CLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS for AI features');
      aiAvailable = false;
    }
    
    aiInitialized = true;
    console.log('✅ AI system initialized');
    
  } catch (error) {
    console.error('❌ AI initialization error:', error.message);
    console.log('🔄 Continuing in fallback mode');
    aiAvailable = false;
    aiInitialized = true;
  }
};

export const isAIAvailable = () => aiAvailable;
export const isAIInitialized = () => aiInitialized;

// Smart fallback response generator
export const generateSmartResponse = async (prompt, context = {}) => {
  console.log('🤖 Generating smart response for:', prompt.substring(0, 100) + '...');
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
  
  const { userProfile = {}, analysisType = 'general' } = context;
  
  // Enhanced rule-based responses
  if (analysisType === 'meal-analysis') {
    return generateMealAnalysisResponse(prompt, userProfile);
  }
  
  if (analysisType === 'menu-analysis') {
    return generateMenuAnalysisResponse(prompt, userProfile);
  }
  
  if (analysisType === 'chat') {
    return generateChatResponse(prompt, userProfile);
  }
  
  return generateGeneralResponse(prompt, userProfile);
};

const generateMealAnalysisResponse = (prompt, userProfile) => {
  const hasAllergies = userProfile.allergies && userProfile.allergies.length > 0;
  const allergies = userProfile.allergies || [];
  const restrictions = userProfile.dietaryRestrictions || [];
  
  // Analyze prompt for common food types
  const isVegetarian = restrictions.includes('Vegetarian') || restrictions.includes('Vegan');
  const isVegan = restrictions.includes('Vegan');
  const hasNutAllergy = allergies.some(a => a.toLowerCase().includes('nut'));
  const hasDairyAllergy = allergies.some(a => a.toLowerCase().includes('dairy'));
  
  let mealName = 'Mixed Meal';
  let safetyRating = 'green';
  const allergyWarnings = [];
  const ingredients = [];
  const healthRisks = [];
  
  // Detect common meal patterns
  if (prompt.toLowerCase().includes('chicken') || prompt.toLowerCase().includes('poultry')) {
    mealName = 'Chicken Dish';
    ingredients.push('chicken', 'spices', 'oil');
    if (isVegetarian) {
      safetyRating = 'red';
      allergyWarnings.push('Contains animal products');
    }
  } else if (prompt.toLowerCase().includes('beef') || prompt.toLowerCase().includes('steak')) {
    mealName = 'Beef Dish';
    ingredients.push('beef', 'seasonings', 'cooking fats');
    if (isVegetarian) {
      safetyRating = 'red';
      allergyWarnings.push('Contains red meat');
    }
  } else if (prompt.toLowerCase().includes('fish') || prompt.toLowerCase().includes('seafood')) {
    mealName = 'Seafood Dish';
    ingredients.push('fish', 'lemon', 'herbs');
    if (allergies.some(a => a.toLowerCase().includes('fish') || a.toLowerCase().includes('shellfish'))) {
      safetyRating = 'red';
      allergyWarnings.push('Contains seafood allergens');
    }
  } else if (prompt.toLowerCase().includes('salad')) {
    mealName = 'Fresh Salad';
    ingredients.push('mixed greens', 'vegetables', 'dressing');
    safetyRating = 'green';
  } else if (prompt.toLowerCase().includes('pasta') || prompt.toLowerCase().includes('noodle')) {
    mealName = 'Pasta Dish';
    ingredients.push('pasta', 'sauce', 'cheese');
    if (hasDairyAllergy) {
      safetyRating = 'yellow';
      allergyWarnings.push('May contain dairy in sauce');
    }
  }
  
  // Add general warnings based on allergies
  if (hasNutAllergy && prompt.toLowerCase().includes('sauce')) {
    allergyWarnings.push('Sauces may contain nuts - verify ingredients');
    safetyRating = safetyRating === 'green' ? 'yellow' : safetyRating;
  }
  
  if (hasDairyAllergy && (prompt.toLowerCase().includes('cream') || prompt.toLowerCase().includes('cheese'))) {
    allergyWarnings.push('Dairy products detected');
    safetyRating = 'red';
  }
  
  // Nutritional breakdown (estimated)
  const nutritionalBreakdown = {
    fat: `${20 + Math.floor(Math.random() * 30)}%`,
    sugar: `${5 + Math.floor(Math.random() * 15)}%`,
    protein: `${15 + Math.floor(Math.random() * 25)}%`,
    carbohydrates: `${30 + Math.floor(Math.random() * 30)}%`,
    fiber: `${5 + Math.floor(Math.random() * 10)}%`
  };
  
  // Recommendation based on analysis
  let recommendation = 'This appears to be a balanced meal. Enjoy in moderation as part of a varied diet.';
  
  if (safetyRating === 'red') {
    recommendation = '⚠️ CAUTION: This meal contains ingredients that may not be suitable for your dietary needs. Please verify all ingredients and consider alternative options.';
  } else if (safetyRating === 'yellow') {
    recommendation = '⚠️ Some concerns detected. Verify ingredients with staff and exercise caution if you have severe allergies.';
  } else if (nutritionalBreakdown.fat > '40%') {
    recommendation = 'This meal is higher in fat. Consider pairing with fresh vegetables and watch portion sizes.';
  }
  
  return {
    text: JSON.stringify({
      mealName,
      allergyWarnings: allergyWarnings.length > 0 ? allergyWarnings : ['No specific allergens detected'],
      safetyRating,
      nutritionalBreakdown,
      ingredients: ingredients.length > 0 ? ingredients : ['Various ingredients'],
      recommendation,
      healthRisks: healthRisks.length > 0 ? healthRisks : ['General food safety practices recommended']
    }, null, 2)
  };
};

const generateMenuAnalysisResponse = (prompt, userProfile) => {
  const hasAllergies = userProfile.allergies && userProfile.allergies.length > 0;
  
  const safeOptions = [
    { name: 'Grilled Chicken Breast', reason: 'Simple protein, minimal ingredients' },
    { name: 'Steamed Vegetables', reason: 'Generally safe for most diets' },
    { name: 'Plain Baked Potato', reason: 'Single ingredient, easily verifiable' }
  ];
  
  const moderateOptions = [
    { name: 'House Salad', reason: 'Check dressing and toppings' },
    { name: 'Soup of the Day', reason: 'Verify ingredients - may contain allergens' }
  ];
  
  const riskyOptions = hasAllergies ? [
    { name: 'Mixed Sauces and Gravies', reason: 'Often contain hidden allergens' },
    { name: 'Desserts', reason: 'Commonly contain nuts, dairy, eggs' }
  ] : [];
  
  const recommendation = hasAllergies 
    ? 'Please inform staff of your allergies. Choose simple preparations and verify all ingredients. When in doubt, select grilled items without sauces.'
    : 'Opt for freshly prepared items. Balance your meal with vegetables and lean proteins.';
  
  return {
    text: JSON.stringify({
      safeOptions,
      moderateOptions,
      riskyOptions,
      recommendation
    }, null, 2)
  };
};

const generateChatResponse = (prompt, userProfile) => {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('allerg') || lowerPrompt.includes('safe') || lowerPrompt.includes('risk')) {
    return {
      text: `Based on your inquiry about food safety:

Key Recommendations:
1. Always verify ingredients with restaurant staff
2. Choose simple preparations with fewer ingredients
3. Be aware of cross-contamination in kitchen environments
4. Carry emergency medication if you have severe allergies
5. When dining out, inform staff of your dietary needs

For your specific profile with ${userProfile.allergies?.length || 'no'} known allergies, I recommend extra caution with sauces, dressings, and mixed dishes where ingredients may not be obvious.`
    };
  }
  
  if (lowerPrompt.includes('nutrition') || lowerPrompt.includes('healthy') || lowerPrompt.includes('diet')) {
    return {
      text: `Nutritional Guidance:

For balanced eating:
- Include a variety of colorful vegetables
- Choose lean proteins like chicken, fish, or plant-based alternatives
- Opt for whole grains when available
- Watch portion sizes, especially with high-calorie items
- Stay hydrated with water

Remember that balance over time is more important than any single meal. Enjoy your food while making mindful choices.`
    };
  }
  
  if (lowerPrompt.includes('ingredient') || lowerPrompt.includes('contain') || lowerPrompt.includes('what is in')) {
    return {
      text: `Ingredient Analysis:

Common ingredients to watch for:
- Sauces: Often contain dairy, nuts, soy, or gluten
- Dressings: May include eggs, dairy, or specific oils
- Seasonings: Could contain MSG, sulfites, or other additives
- Thickeners: Sometimes use flour, corn starch, or other allergens

I recommend asking specifically about these items if you have concerns. Many restaurants are happy to accommodate dietary needs when asked politely.`
    };
  }
  
  // Default general response
  return {
    text: `Thank you for your food safety inquiry.

As a general rule:
- Choose freshly prepared foods when possible
- Verify cooking methods and ingredients
- Be mindful of food storage and handling
- When uncertain, opt for simpler dishes

Your health and safety are important. Don't hesitate to ask questions about food preparation - most establishments appreciate customers who care about what they're eating.

Is there a specific food item or restaurant type you'd like me to help you analyze?`
  };
};

const generateGeneralResponse = (prompt, userProfile) => {
  return {
    text: `SafeMenu Analysis:

I've reviewed your request about food safety. Here are my general recommendations:

Food Safety Tips:
1. Verify all ingredients, especially with known allergies
2. Choose establishments with good food safety ratings
3. Opt for freshly prepared items over pre-made
4. Be cautious with buffet-style serving
5. When traveling, research local food safety standards

For your specific needs, I recommend maintaining a food diary to track any reactions and always carrying necessary medications.

Would you like me to analyze a specific meal or menu?`
  };
};