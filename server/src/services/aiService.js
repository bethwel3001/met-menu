const { VertexAI } = require('@google-cloud/vertexai');
const { ImageAnnotatorClient } = require('@google-cloud/vision');

class AIService {
  constructor() {
    this.vertexAI = null;
    this.visionClient = null;
    this.generativeModel = null;
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      // Initialize Vertex AI
      this.vertexAI = new VertexAI({
        project: process.env.GOOGLE_CLOUD_PROJECT,
        location: process.env.VERTEX_AI_LOCATION || 'us-central1',
      });

      // Initialize Vision Client
      this.visionClient = new ImageAnnotatorClient();

      // Initialize Generative Model (Gemini)
      this.generativeModel = this.vertexAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.2,
        },
      });

      this.initialized = true;
      console.log('✅ Vertex AI & Vision API initialized successfully');

    } catch (error) {
      console.error('❌ AI Service initialization failed:', error.message);
      throw new Error(`AI service initialization failed: ${error.message}`);
    }
  }

  async analyzeFoodImage(imageBuffer, userAllergies = []) {
    try {
      if (!this.initialized) {
        throw new Error('AI service not initialized. Check Google Cloud configuration.');
      }

      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Invalid image data provided');
      }

      console.log('🔍 Starting real Vertex AI analysis...');

      // Step 1: Use Vision API for object detection
      const visionAnalysis = await this.analyzeWithVisionAPI(imageBuffer);
      
      // Step 2: Use Gemini for detailed food analysis
      const geminiAnalysis = await this.analyzeWithGemini(imageBuffer, visionAnalysis, userAllergies);
      
      // Step 3: Format and validate the results
      const finalResult = this.formatAnalysisResult(geminiAnalysis, userAllergies);
      
      console.log('✅ Vertex AI analysis completed successfully');
      return finalResult;

    } catch (error) {
      console.error('❌ Vertex AI analysis failed:', error.message);
      throw new Error(`Food analysis failed: ${error.message}`);
    }
  }

  async analyzeWithVisionAPI(imageBuffer) {
    try {
      console.log('👁️ Using Vision API for object detection...');

      const [objectResult] = await this.visionClient.objectLocalization({
        image: { content: imageBuffer.toString('base64') },
      });

      const [labelResult] = await this.visionClient.labelDetection({
        image: { content: imageBuffer.toString('base64') },
      });

      const [webDetection] = await this.visionClient.webDetection({
        image: { content: imageBuffer.toString('base64') },
      });

      return {
        objects: objectResult.localizedObjectAnnotations || [],
        labels: labelResult.labelAnnotations || [],
        webEntities: webDetection.webDetection?.webEntities || []
      };

    } catch (error) {
      console.error('Vision API error:', error);
      throw new Error('Image analysis service unavailable');
    }
  }

  async analyzeWithGemini(imageBuffer, visionData, userAllergies) {
    try {
      console.log('🧠 Using Gemini for detailed food analysis...');

      const prompt = this.buildFoodAnalysisPrompt(visionData, userAllergies);
      
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
                  data: imageBuffer.toString('base64')
                }
              }
            ]
          }
        ]
      };

      const response = await this.generativeModel.generateContent(request);
      
      if (!response.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('No valid response from AI model');
      }

      const responseText = response.response.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI response format invalid');
      }

      const analysisResult = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!analysisResult.dishName || !Array.isArray(analysisResult.ingredients)) {
        throw new Error('AI response missing required fields');
      }

      return analysisResult;

    } catch (error) {
      console.error('Gemini analysis error:', error);
      throw new Error('Food analysis service temporarily unavailable');
    }
  }

  buildFoodAnalysisPrompt(visionData, userAllergies) {
    const detectedObjects = visionData.objects.map(obj => obj.name).join(', ');
    const detectedLabels = visionData.labels.map(label => label.description).join(', ');
    const webEntities = visionData.webEntities.map(entity => entity.description).join(', ');

    return `You are a food safety expert AI. Analyze this food image and provide a detailed, accurate JSON response.

CRITICAL: You MUST return ONLY valid JSON with this exact structure:
{
  "dishName": "accurate descriptive name of the dish",
  "ingredients": [
    {
      "name": "specific ingredient name",
      "isAllergen": true/false,
      "riskLevel": "low/medium/high",
      "confidence": 0.95
    }
  ],
  "allergens": ["list of actual allergens detected"],
  "warnings": [
    {
      "type": "allergy/dietary/health",
      "severity": "low/medium/high",
      "message": "specific warning message",
      "ingredient": "related ingredient if any"
    }
  ],
  "nutritionalInfo": {
    "calories": estimated number,
    "protein": estimated grams,
    "carbs": estimated grams,
    "fat": estimated grams,
    "fiber": estimated grams
  },
  "safetyScore": 0-100
}

CONTEXT:
- Detected objects: ${detectedObjects}
- Detected labels: ${detectedLabels}
- Web entities: ${webEntities}
- User allergies: ${userAllergies.join(', ') || 'None provided'}

ANALYSIS GUIDELINES:
1. Be extremely accurate about ingredients - only include what you can confidently identify
2. Pay special attention to common allergens: peanuts, tree nuts, dairy, eggs, wheat, soy, fish, shellfish, sesame
3. Consider hidden allergens (peanut oil in sauces, dairy in bread, etc.)
4. Estimate nutritional values based on visible portion sizes
5. Safety score should reflect actual risks: 90-100 (very safe), 70-89 (generally safe), 50-69 (caution), 0-49 (high risk)
6. Only generate warnings for confirmed risks
7. Be culturally aware of different cuisines and cooking methods

IMPORTANT: Return ONLY the JSON object, no additional text or explanations.`;
  }

  formatAnalysisResult(analysis, userAllergies) {
    // Validate and enhance the AI response
    const validatedResult = {
      dishName: analysis.dishName?.trim() || 'Unknown Dish',
      ingredients: Array.isArray(analysis.ingredients) ? analysis.ingredients : [],
      allergens: Array.isArray(analysis.allergens) ? analysis.allergens : [],
      warnings: Array.isArray(analysis.warnings) ? analysis.warnings : [],
      nutritionalInfo: analysis.nutritionalInfo || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      },
      safetyScore: typeof analysis.safetyScore === 'number' ? 
        Math.max(0, Math.min(100, analysis.safetyScore)) : 50
    };

    // Enhance with additional safety checks
    validatedResult.allergens = this.detectRealAllergens(validatedResult.ingredients, userAllergies);
    validatedResult.safetyScore = this.calculateRealSafetyScore(validatedResult.ingredients, userAllergies);
    validatedResult.warnings = this.generateRealWarnings(validatedResult.ingredients, userAllergies);

    return validatedResult;
  }

  detectRealAllergens(ingredients, userAllergies) {
    const allergenMap = {
      'peanut': ['peanut', 'groundnut', 'arachis'],
      'tree nut': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia'],
      'dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein'],
      'egg': ['egg', 'mayonnaise', 'albumin'],
      'wheat': ['wheat', 'flour', 'bread', 'pasta', 'gluten'],
      'soy': ['soy', 'soya', 'tofu', 'edamame', 'soybean'],
      'fish': ['fish', 'salmon', 'tuna', 'cod', 'trout'],
      'shellfish': ['shrimp', 'prawn', 'lobster', 'crab', 'crayfish', 'scallop'],
      'sesame': ['sesame', 'tahini']
    };

    const detectedAllergens = new Set();

    userAllergies.forEach(userAllergy => {
      const allergyLower = userAllergy.toLowerCase();
      const relatedTerms = allergenMap[allergyLower] || [allergyLower];

      ingredients.forEach(ingredient => {
        const ingName = ingredient.name.toLowerCase();
        if (relatedTerms.some(term => ingName.includes(term))) {
          detectedAllergens.add(userAllergy);
        }
      });
    });

    return Array.from(detectedAllergens);
  }

  calculateRealSafetyScore(ingredients, userAllergies) {
    let score = 100;
    
    ingredients.forEach(ingredient => {
      if (ingredient.isAllergen) {
        const matchesUserAllergy = userAllergies.some(allergy => {
          const allergyLower = allergy.toLowerCase();
          return ingredient.name.toLowerCase().includes(allergyLower);
        });
        
        if (matchesUserAllergy) {
          score -= 40; // Major risk for direct allergen match
        } else if (ingredient.riskLevel === 'high') {
          score -= 20; // High risk ingredient
        } else if (ingredient.riskLevel === 'medium') {
          score -= 10; // Medium risk
        }
      }
    });

    // Bonus for clear, identifiable ingredients
    const clearIngredients = ingredients.filter(ing => 
      ing.confidence > 0.8 && ing.riskLevel === 'low'
    ).length;
    
    score += Math.min(10, clearIngredients * 2);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  generateRealWarnings(ingredients, userAllergies) {
    const warnings = [];
    
    // Allergy warnings
    userAllergies.forEach(allergy => {
      const riskyIngredients = ingredients.filter(ingredient => {
        const ingName = ingredient.name.toLowerCase();
        const allergyLower = allergy.toLowerCase();
        return ingName.includes(allergyLower) || 
               this.getAllergySynonyms(allergyLower).some(synonym => ingName.includes(synonym));
      });

      if (riskyIngredients.length > 0) {
        warnings.push({
          type: 'allergy',
          severity: 'high',
          message: `CONTAINS ${allergy.toUpperCase()}. This dish is UNSAFE for your allergy.`,
          ingredient: riskyIngredients[0].name
        });
      }
    });

    // Cross-contamination warnings
    const highRiskIngredients = ingredients.filter(ing => 
      ing.riskLevel === 'high' && !warnings.some(w => w.ingredient === ing.name)
    );

    highRiskIngredients.forEach(ingredient => {
      warnings.push({
        type: 'health',
        severity: 'medium',
        message: `Contains ${ingredient.name} - common allergen, may cause cross-contamination`,
        ingredient: ingredient.name
      });
    });

    return warnings;
  }

  getAllergySynonyms(allergy) {
    const synonymMap = {
      'peanut': ['groundnut', 'peanut', 'arachis'],
      'dairy': ['milk', 'cheese', 'butter', 'cream', 'whey'],
      'gluten': ['wheat', 'flour', 'bread', 'pasta'],
      'shellfish': ['shrimp', 'prawn', 'lobster', 'crab'],
      'soy': ['soy', 'soya', 'tofu']
    };
    return synonymMap[allergy] || [allergy];
  }

  async analyzeMenuText(menuText, userPreferences = {}) {
    try {
      if (!this.initialized) {
        throw new Error('AI service not initialized');
      }

      console.log('📝 Analyzing menu text with Genkit simulation...');

      // For now, we'll use Gemini for text analysis until Genkit is fully available
      const prompt = this.buildMenuAnalysisPrompt(menuText, userPreferences);
      
      const request = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      };

      const response = await this.generativeModel.generateContent(request);
      const responseText = response.response.candidates[0].content.parts[0].text;
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from menu analysis');
      }

      const analysisResult = JSON.parse(jsonMatch[0]);
      return this.formatAnalysisResult(analysisResult, userPreferences.allergies || []);

    } catch (error) {
      console.error('Menu analysis error:', error);
      throw new Error(`Menu analysis failed: ${error.message}`);
    }
  }

  buildMenuAnalysisPrompt(menuText, userPreferences) {
    const userAllergies = userPreferences.allergies || [];

    return `Analyze this restaurant menu text and provide food safety insights.

Return ONLY valid JSON with this structure:
{
  "dishName": "most relevant dish name from menu",
  "ingredients": [
    {
      "name": "identified ingredient",
      "isAllergen": true/false,
      "riskLevel": "low/medium/high",
      "confidence": 0.9
    }
  ],
  "allergens": ["detected allergens"],
  "warnings": [
    {
      "type": "allergy/dietary/health",
      "severity": "low/medium/high",
      "message": "specific warning",
      "ingredient": "related ingredient"
    }
  ],
  "nutritionalInfo": {
    "calories": estimated,
    "protein": estimated,
    "carbs": estimated,
    "fat": estimated,
    "fiber": estimated
  },
  "safetyScore": 0-100
}

MENU TEXT:
${menuText.substring(0, 4000)} <!-- Limit input size -->

USER ALLERGIES: ${userAllergies.join(', ') || 'None'}

ANALYSIS FOCUS:
- Identify potential allergens based on menu descriptions
- Flag dishes with high-risk ingredients
- Estimate nutritional content based on dish type
- Provide specific warnings for user's allergies
- Consider cooking methods mentioned (fried, grilled, raw, etc.)

Return ONLY the JSON object.`;
  }
}

module.exports = new AIService();