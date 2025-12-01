import { getGenerativeModel, isAIAvailable } from '../config/cloud.js';

export class AIService {
  static async analyzeMealImage(base64Image, userProfile) {
    try {
      if (!isAIAvailable()) {
        console.log('🤖 Using VISUAL fallback analysis - Google Cloud not configured');
        // Since we can't analyze the actual image, we'll be honest about it
        return this.honestFallbackAnalysis(userProfile);
      }

      const model = getGenerativeModel();
      
      const prompt = this.buildMealAnalysisPrompt(userProfile);
      
      const request = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }
        ]
      };

      console.log('🔍 Sending request to Vertex AI for meal analysis...');
      
      const result = await model.generateContent(request);
      const response = await result.response;
      
      console.log('✅ Received AI response from Vertex AI');
      
      const analysis = this.parseAIAnalysisResponse(response.candidates[0].content.parts[0].text);
      console.log('📊 AI Analysis completed:', analysis.mealName);
      
      return analysis;

    } catch (error) {
      console.error('❌ AI Service Error, using honest fallback:', error.message);
      return this.honestFallbackAnalysis(userProfile);
    }
  }

  // Honest fallback that doesn't pretend to analyze the image
  static honestFallbackAnalysis(userProfile) {
    console.log('🔄 Using HONEST fallback - no image analysis available');
    
    const hasAllergies = userProfile.allergies && userProfile.allergies.length > 0;
    const allergies = userProfile.allergies || [];
    const restrictions = userProfile.dietaryRestrictions || [];
    
    return {
      mealName: 'Unable to Identify - Manual Verification Required',
      allergyWarnings: [
        '⚠️ AI analysis unavailable',
        'Please verify all ingredients manually',
        'Check with restaurant staff about allergens'
      ],
      safetyRating: 'yellow', // Always yellow when we can't analyze
      nutritionalBreakdown: {
        fat: 'Unknown - verify manually',
        sugar: 'Unknown - verify manually', 
        protein: 'Unknown - verify manually',
        carbohydrates: 'Unknown - verify manually',
        fiber: 'Unknown - verify manually'
      },
      ingredients: [
        'Ingredients cannot be automatically detected',
        'Please check with food provider',
        'Verify preparation methods'
      ],
      recommendation: `Since AI analysis is currently unavailable, please:\n\n1. 🧾 Ask restaurant staff for ingredient list\n2. 🚨 Inform them about your ${hasAllergies ? 'allergies: ' + allergies.join(', ') : 'dietary needs'}\n3. 🔍 Check for cross-contamination risks\n4. 📱 Take photos of ingredients if available`,
      healthRisks: [
        'Limited analysis capability',
        'Manual verification required',
        'Potential allergen exposure'
      ]
    };
  }

  static async analyzeMenuText(menuText, userProfile) {
    try {
      if (!isAIAvailable()) {
        return this.honestMenuFallback(userProfile);
      }

      const model = getGenerativeModel();
      
      const prompt = this.buildMenuAnalysisPrompt(menuText, userProfile);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return this.parseAIMenuResponse(response.candidates[0].content.parts[0].text);

    } catch (error) {
      console.error('AI Menu Analysis Error:', error.message);
      return this.honestMenuFallback(userProfile);
    }
  }

  static honestMenuFallback(userProfile) {
    const hasAllergies = userProfile.allergies && userProfile.allergies.length > 0;
    
    return {
      safeOptions: [
        { 
          name: 'Consult Restaurant Staff', 
          reason: 'AI analysis unavailable - staff can provide accurate ingredient information' 
        }
      ],
      moderateOptions: [
        { 
          name: 'Simple Preparations Recommended', 
          reason: 'Choose plainly cooked items until verification is possible' 
        }
      ],
      riskyOptions: [
        { 
          name: 'Complex Dishes and Sauces', 
          reason: 'May contain hidden allergens - verification needed' 
        }
      ],
      recommendation: `🔍 Manual Verification Required\n\nSince AI analysis is unavailable:\n• Ask staff for detailed ingredient lists\n• Request to see packaging or labels\n• Choose simple, single-ingredient items\n• Avoid buffets and pre-made foods when possible`
    };
  }

  static async generateChatResponse(message, context, userProfile) {
    try {
      if (!isAIAvailable()) {
        return this.honestChatResponse(message, userProfile);
      }

      const model = getGenerativeModel();
      
      const prompt = this.buildChatPrompt(message, context, userProfile);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.candidates[0].content.parts[0].text;

    } catch (error) {
      console.error('AI Chat Error:', error.message);
      return this.honestChatResponse(message, userProfile);
    }
  }

  static honestChatResponse(message, userProfile) {
    return `I apologize, but the AI analysis feature is currently unavailable. 

However, I can still provide general food safety guidance:

🔒 Always follow these safety steps:
1. Verify ingredients with restaurant staff
2. Check food labels and packaging
3. Ask about preparation methods
4. Be aware of cross-contamination risks

For your specific needs regarding "${message}", I recommend consulting directly with food providers and healthcare professionals for accurate information.

The SafeMenu team is working to restore full AI functionality. Thank you for your understanding.`;
  }

  // ... keep the existing buildPrompt methods and parse methods the same
  static buildMealAnalysisPrompt(userProfile) {
    return `
      You are a food safety and nutrition expert. Analyze the provided food image and provide a detailed safety assessment.

      USER PROFILE:
      - Allergies: ${userProfile.allergies?.join(', ') || 'None reported'}
      - Dietary Restrictions: ${userProfile.dietaryRestrictions?.join(', ') || 'None reported'}
      - Health Conditions: ${userProfile.healthConditions?.join(', ') || 'None reported'}
      - Preferences: ${userProfile.preferredMeat?.join(', ') || 'No specific preferences'}

      Provide your analysis in this exact JSON format:
      {
        "mealName": "identified meal name",
        "allergyWarnings": ["list of potential allergens detected"],
        "safetyRating": "green|yellow|red",
        "nutritionalBreakdown": {
          "fat": "percentage estimate",
          "sugar": "percentage estimate",
          "protein": "percentage estimate",
          "carbohydrates": "percentage estimate",
          "fiber": "percentage estimate"
        },
        "ingredients": ["list of main detected ingredients"],
        "recommendation": "detailed safety and consumption advice",
        "healthRisks": ["list of potential health risks based on user profile"]
      }

      SAFETY RATING GUIDE:
      - GREEN: Safe for user, no detected allergens, aligns with dietary preferences
      - YELLOW: Some concerns present, moderate consumption advised, verify ingredients
      - RED: Contains detected allergens or significant health risks, avoid consumption

      Be accurate and conservative in your assessment. When uncertain, choose a more cautious rating.
    `;
  }

  static parseAIAnalysisResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format from AI');
    } catch (error) {
      console.error('AI Response Parsing Error:', error);
      throw new Error('Failed to parse AI analysis response');
    }
  }

  static parseAIMenuResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid menu analysis response format');
    } catch (error) {
      console.error('Menu Response Parsing Error:', error);
      throw new Error('Failed to parse menu analysis response');
    }
  }
}