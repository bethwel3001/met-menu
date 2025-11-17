export interface User {
  id: string;
  email: string;
  name: string;
  allergies: string[];
  dietaryPreferences: string[];
}

export interface ScanResult {
  id: string;
  dishName: string;
  ingredients: {
    name: string;
    isAllergen: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
  allergens: string[];
  warnings: {
    type: 'allergy' | 'dietary' | 'health';
    severity: 'low' | 'medium' | 'high';
    message: string;
  }[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  safetyScore: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}