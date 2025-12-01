import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

let vertexAI = null;
let generativeModel = null;
let aiAvailable = false;

// Function to test a specific model
const testModel = async (vertexAIInstance, modelName) => {
  try {
    console.log(`🔄 Testing model: ${modelName}`);
    
    const testGenerativeModel = vertexAIInstance.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: 512, // Smaller for test
        temperature: 0.2,
      }
    });

    // Test with a simple request
    const testResult = await testGenerativeModel.generateContent('Say "Hello" in one word');
    const response = await testResult.response;
    
    console.log(`✅ Model ${modelName} is available and working`);
    return testGenerativeModel;
    
  } catch (error) {
    console.log(`❌ Model ${modelName} failed: ${error.message}`);
    return null;
  }
};

export const initializeVertexAI = async () => {
  try {
    // Check if required environment variables are set
    if (!process.env.GOOGLE_CLOUD_PROJECT) {
      console.warn('⚠️ GOOGLE_CLOUD_PROJECT not set. AI features will use fallback mode.');
      return;
    }

    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn('⚠️ GOOGLE_APPLICATION_CREDENTIALS not set. AI features will use fallback mode.');
      return;
    }

    // Check if credentials file exists
    if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      console.warn(`⚠️ Credentials file not found: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
      console.warn('🤖 AI features will use intelligent fallback mode');
      return;
    }

    // Check if credentials file is valid JSON
    try {
      const credentialsContent = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
      JSON.parse(credentialsContent);
      console.log('✅ Credentials file is valid JSON');
    } catch (jsonError) {
      console.error('❌ Credentials file is not valid JSON:', jsonError.message);
      console.warn('🤖 AI features will use intelligent fallback mode');
      return;
    }

    console.log('🚀 Initializing Google Cloud Vertex AI...');
    console.log(`📊 Project: ${process.env.GOOGLE_CLOUD_PROJECT}`);
    console.log(`📍 Location: ${process.env.VERTEX_AI_LOCATION || 'us-central1'}`);

    // Initialize Vertex AI
    vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    });

    console.log('✅ Vertex AI client initialized');

    // Try different model names in order of preference
    const modelNames = [
      'gemini-1.5-flash-001',  // Most common
      'gemini-1.0-pro-001',    // Alternative
      'gemini-pro',            // Legacy name
      'gemini-1.5-pro-001'     // Pro version if available
    ];

    let successfulModel = null;
    
    for (const modelName of modelNames) {
      const testModelResult = await testModel(vertexAI, modelName);
      if (testModelResult) {
        generativeModel = testModelResult;
        successfulModel = modelName;
        break;
      }
    }

    if (successfulModel) {
      // Re-initialize with full configuration for the working model
      generativeModel = vertexAI.getGenerativeModel({
        model: successfulModel,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.4,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });

      aiAvailable = true;
      console.log('🎉 Google Cloud Vertex AI Initialized Successfully!');
      console.log(`🤖 Active Model: ${successfulModel}`);
      console.log('💡 Full AI features are now available');
      
    } else {
      throw new Error('No compatible Gemini models found in this region/project');
    }

  } catch (error) {
    console.error('❌ Vertex AI Initialization Failed:', error.message);
    console.log('🤖 AI features will use enhanced intelligent fallback mode');
    console.log('');
    console.log('🔧 Troubleshooting Tips:');
    console.log('   1. Check if Vertex AI API is enabled in Google Cloud Console');
    console.log('   2. Verify your project has access to Gemini models');
    console.log('   3. Try different regions: us-central1, us-east1, europe-west1');
    console.log('   4. Ensure service account has "Vertex AI User" role');
    console.log('   5. Check billing is enabled for the project');
    console.log('');
    console.log('📚 Useful Links:');
    console.log('   • Enable Vertex AI API: https://console.cloud.google.com/vertex-ai');
    console.log('   • Model Availability: https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models');
    console.log('   • Authentication: https://cloud.google.com/docs/authentication');
    
    aiAvailable = false;
  }
};

export const getGenerativeModel = () => {
  if (!generativeModel) {
    throw new Error('Vertex AI not initialized. Check Google Cloud configuration.');
  }
  return generativeModel;
};

export const isAIAvailable = () => {
  return aiAvailable;
};

// Export model info for debugging
export const getAIModelInfo = () => {
  return {
    available: aiAvailable,
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    model: generativeModel ? 'Active' : 'None'
  };
};