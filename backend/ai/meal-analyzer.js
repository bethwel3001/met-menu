import { generateSmartResponse, isAIAvailable } from './genkit-setup.js';

export class MealAnalyzer {
  static async analyzeMealImage(base64Image, userProfile) {
    try {
      console.log('🔍 Analyzing meal image...');
      
      const prompt = `Analyze this food image for user with profile: ${JSON.stringify(userProfile)}`;
      
      const result = await generateSmartResponse(prompt, {
        userProfile,
        analysisType: 'meal-analysis'
      });

      return this.parseAnalysisResult(result.text, userProfile);
    } catch (error) {
      console.error('Meal analysis error:', error);
      return this.getFallbackAnalysis(userProfile);
    }
  }

  static async analyzeMenuText(menuText, userProfile) {
    try {
      console.log('📋 Analyzing menu text...');
      
      const prompt = `Analyze this menu: ${menuText.substring(0, 500)}...`;
      
      const result = await generateSmartResponse(prompt, {
        userProfile,
        analysisType: 'menu-analysis'
      });

      return this.parseMenuAnalysisResult(result.text, userProfile);
    } catch (error) {
      console.error('Menu analysis error:', error);
      return this.getFallbackMenuAnalysis(userProfile);
    }
  }

  static async analyzeTextDescription(description, userProfile) {
    try {
      console.log('📝 Analyzing text description...');
      
      const result = await generateSmartResponse(description, {
        userProfile,
        analysisType: 'meal-analysis'
      });

      return this.parseAnalysisResult(result.text, userProfile);
    } catch (error) {
      console.error('Text analysis error:', error);
      return this.getFallbackAnalysis(userProfile);
    }
  }

  static async chatAboutMeal(message, chatHistory = [], userProfile) {
    try {
      console.log('💬 Processing chat message...');
      
      const context = chatHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n');
      const fullPrompt = `Chat history:\n${context}\n\nNew message: ${message}`;
      
      const result = await generateSmartResponse(fullPrompt, {
        userProfile,
        analysisType: 'chat'
      });

      return {
        response: result.text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Chat error:', error);
      return {
        response: 'I apologize, but I encountered an error processing your message. Please try again or contact support if the issue persists.',
        timestamp: new Date().toISOString()
      };
    }
  }

  static parseAnalysisResult(resultText, userProfile) {
    try {
      // Try to parse as JSON first
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (parsed.mealName && parsed.safetyRating) {
          return this.validateAnalysisResult(parsed, userProfile);
        }
      }
      
      // If JSON parsing fails, create from text
      return this.createAnalysisFromText(resultText, userProfile);
    } catch (error) {
      console.error('Failed to parse analysis result:', error);
      return this.getFallbackAnalysis(userProfile);
    }
  }

  static parseMenuAnalysisResult(resultText, userProfile) {
    try {
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateMenuAnalysisResult(parsed, userProfile);
      }
      
      return this.getFallbackMenuAnalysis(userProfile);
    } catch (error) {
      console.error('Failed to parse menu analysis:', error);
      return this.getFallbackMenuAnalysis(userProfile);
    }
  }

  static validateAnalysisResult(result, userProfile) {
    // Ensure all required fields are present
    const defaultResult = this.getFallbackAnalysis(userProfile);
    
    return {
      mealName: result.mealName || defaultResult.mealName,
      allergyWarnings: Array.isArray(result.allergyWarnings) ? result.allergyWarnings : defaultResult.allergyWarnings,
      safetyRating: ['green', 'yellow', 'red'].includes(result.safetyRating) ? result.safetyRating : defaultResult.safetyRating,
      nutritionalBreakdown: result.nutritionalBreakdown || defaultResult.nutritionalBreakdown,
      ingredients: Array.isArray(result.ingredients) ? result.ingredients : defaultResult.ingredients,
      recommendation: result.recommendation || defaultResult.recommendation,
      healthRisks: Array.isArray(result.healthRisks) ? result.healthRisks : defaultResult.healthRisks
    };
  }

  static validateMenuAnalysisResult(result, userProfile) {
    const defaultResult = this.getFallbackMenuAnalysis(userProfile);
    
    return {
      safeOptions: Array.isArray(result.safeOptions) ? result.safeOptions : defaultResult.safeOptions,
      moderateOptions: Array.isArray(result.moderateOptions) ? result.moderateOptions : defaultResult.moderateOptions,
      riskyOptions: Array.isArray(result.riskyOptions) ? result.riskyOptions : defaultResult.riskyOptions,
      recommendation: result.recommendation || defaultResult.recommendation
    };
  }

  static createAnalysisFromText(text, userProfile) {
    // Create a basic analysis from text response
    const hasWarning = text.toLowerCase().includes('caution') || text.toLowerCase().includes('warning');
    const hasDanger = text.toLowerCase().includes('danger') || text.toLowerCase().includes('avoid');
    
    let safetyRating = 'green';
    if (hasDanger) safetyRating = 'red';
    else if (hasWarning) safetyRating = 'yellow';

    return {
      mealName: 'Analyzed Meal',
      allergyWarnings: hasWarning ? ['Please verify ingredients manually'] : [],
      safetyRating,
      nutritionalBreakdown: {
        fat: 'Estimated',
        sugar: 'Estimated', 
        protein: 'Estimated',
        carbohydrates: 'Estimated',
        fiber: 'Estimated'
      },
      ingredients: ['Various ingredients detected'],
      recommendation: text.length > 300 ? text.substring(0, 300) + '...' : text,
      healthRisks: hasWarning ? ['General food safety precautions advised'] : []
    };
  }

  static getFallbackAnalysis(userProfile = {}) {
    const hasAllergies = userProfile.allergies && userProfile.allergies.length > 0;
    
    return {
      mealName: 'Food Item',
      allergyWarnings: hasAllergies ? ['Manual verification required'] : [],
      safetyRating: hasAllergies ? 'yellow' : 'green',
      nutritionalBreakdown: {
        fat: 'Varies',
        sugar: 'Varies',
        protein: 'Varies',
        carbohydrates: 'Varies',
        fiber: 'Varies'
      },
      ingredients: ['Ingredients analysis unavailable'],
      recommendation: hasAllergies 
        ? 'Please verify all ingredients with staff due to your allergies.'
        : 'Standard food safety practices recommended.',
      healthRisks: hasAllergies ? ['Allergen verification needed'] : []
    };
  }

  static getFallbackMenuAnalysis(userProfile = {}) {
    const hasAllergies = userProfile.allergies && userProfile.allergies.length > 0;
    
    return {
      safeOptions: [
        { name: 'Steamed Vegetables', reason: 'Minimal ingredients, easily verified' },
        { name: 'Grilled Chicken Breast', reason: 'Simple preparation method' },
        { name: 'Plain Rice', reason: 'Single ingredient item' }
      ],
      moderateOptions: [
        { name: 'House Salads', reason: 'Verify dressings and toppings' },
        { name: 'Soup Options', reason: 'Check ingredients list' }
      ],
      riskyOptions: hasAllergies ? [
        { name: 'Sauces and Gravies', reason: 'Common source of hidden allergens' },
        { name: 'Desserts', reason: 'Often contain common allergens' }
      ] : [],
      recommendation: hasAllergies
        ? 'Inform staff of your allergies. Choose simple dishes and verify all ingredients.'
        : 'Select freshly prepared items and maintain balanced nutrition.'
    };
  }
}