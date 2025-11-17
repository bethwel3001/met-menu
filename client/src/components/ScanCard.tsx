import { motion } from 'framer-motion';
import type { ScanResult } from '../types';

interface ScanCardProps {
  result: ScanResult;
  compact?: boolean;
}

export function ScanCard({ result, compact = false }: ScanCardProps) {
  const getSeverityColor = (severity: string) => {
    return severity === 'high' ? 'text-red-400' : 
           severity === 'medium' ? 'text-amber-400' : 'text-emerald-400';
  };

  const getSafetyColor = (score: number) => {
    return score >= 80 ? 'text-emerald-400' : 
           score >= 60 ? 'text-amber-400' : 'text-red-400';
  };

  const getSafetyBg = (score: number) => {
    return score >= 80 ? 'from-emerald-600 to-emerald-700' : 
           score >= 60 ? 'from-amber-600 to-amber-700' : 'from-red-600 to-red-700';
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-100 truncate">{result.dishName}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getSafetyColor(result.safetyScore)} bg-opacity-20 ${getSafetyColor(result.safetyScore).replace('text', 'bg')}`}>
            {result.safetyScore}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{result.ingredients.length} ingredients</span>
          <span>{result.allergens.length} allergens</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${getSafetyBg(result.safetyScore)} p-6 text-white`}>
        <h2 className="text-2xl font-bold mb-2">{result.dishName}</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="opacity-90">Safety Score</p>
            <p className={`text-4xl font-bold ${getSafetyColor(result.safetyScore)}`}>
              {result.safetyScore}/100
            </p>
          </div>
          {result.allergens.length > 0 && (
            <div className="text-right">
              <p className="opacity-90">Allergens Detected</p>
              <p className="text-2xl font-bold">{result.allergens.length}</p>
            </div>
          )}
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="p-6 border-b border-gray-700">
          <h3 className="font-semibold text-gray-100 mb-3 flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Important Warnings
          </h3>
          <div className="space-y-2">
            {result.warnings.map((warning, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  warning.severity === 'high' 
                    ? 'bg-red-900/30 border-red-500' 
                    : warning.severity === 'medium'
                    ? 'bg-amber-900/30 border-amber-500'
                    : 'bg-blue-900/30 border-blue-500'
                }`}
              >
                <p className={`font-medium ${getSeverityColor(warning.severity)}`}>
                  {warning.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      <div className="p-6 border-b border-gray-700">
        <h3 className="font-semibold text-gray-100 mb-3">Ingredients Analysis</h3>
        <div className="flex flex-wrap gap-2">
          {result.ingredients.map((ingredient, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                ingredient.isAllergen
                  ? 'bg-red-900/50 text-red-300 border border-red-700'
                  : 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
              }`}
            >
              {ingredient.name}
            </span>
          ))}
        </div>
      </div>

      {/* Nutrition */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-100 mb-4">Nutritional Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-400">{result.nutritionalInfo.calories}</p>
            <p className="text-sm text-gray-400">Calories</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">{result.nutritionalInfo.protein}g</p>
            <p className="text-sm text-gray-400">Protein</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">{result.nutritionalInfo.carbs}g</p>
            <p className="text-sm text-gray-400">Carbs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{result.nutritionalInfo.fat}g</p>
            <p className="text-sm text-gray-400">Fat</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">{result.nutritionalInfo.fiber}g</p>
            <p className="text-sm text-gray-400">Fiber</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}