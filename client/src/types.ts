export interface User {
  id: string;
  email: string;
  name: string;
  allergies: string[];
  dietaryPreferences: string[];
  isGuest?: boolean;
}

export interface ScanResult {
  id: string;
  imageUrl?: string;
  dishName: string;
  ingredients: {
    name: string;
    isAllergen: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    confidence: number;
  }[];
  allergens: string[];
  warnings: {
    type: 'allergy' | 'dietary' | 'health';
    severity: 'low' | 'medium' | 'high';
    message: string;
    ingredient?: string;
  }[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  safetyScore: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}