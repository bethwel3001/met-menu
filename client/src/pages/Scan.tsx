import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScan } from '../hooks/useScan';
import { useAuth } from '../hooks/useAuth';
import { UploadZone } from '../components/UploadZone';
import { ScanCard } from '../components/ScanCard';
import { ScanHistory } from '../components/ScanHistory';
import { Button } from '../components/Button';

type ViewMode = 'scan' | 'history' | 'result';

export function Scan() {
  const [viewMode, setViewMode] = useState<ViewMode>('scan');
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const { scanning, result, error, history, scanImage, clearResult, clearHistory } = useScan();
  const { user, logout } = useAuth();

  const handleFileSelect = async (file: File) => {
    try {
      await scanImage(file);
      setViewMode('result');
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const handleViewHistory = () => {
    setViewMode('history');
    setSelectedScan(null);
  };

  const handleSelectScan = (scan: any) => {
    setSelectedScan(scan);
    setViewMode('result');
  };

  const handleNewScan = () => {
    setViewMode('scan');
    setSelectedScan(null);
    clearResult();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-700">
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-700">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-100 mb-2">Scan Failed</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={handleNewScan} className="w-full">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayResult = selectedScan || result;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">MateMenu</h1>
                <p className="text-sm text-gray-400">Food Safety Scanner</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation */}
              <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={handleNewScan}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'scan' 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Scan
                </button>
                <button
                  onClick={handleViewHistory}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'history' 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  History ({history.length})
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold text-gray-100 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-400">
                      {user.isGuest ? 'Guest Mode' : user.email}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {user.isGuest ? 'Exit' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {viewMode === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Welcome Section */}
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Food Safety Scanner
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  {user?.isGuest ? (
                    <>Upload a food photo to analyze ingredients, detect allergens, and get nutritional insights.</>
                  ) : (
                    <>Welcome back, {user?.name}! Upload a food photo for AI-powered safety analysis.</>
                  )}
                </p>
              </div>

              {/* Guest Mode Notice */}
              {user?.isGuest && (
                <div className="p-4 bg-amber-900/20 border border-amber-700 rounded-xl flex items-start space-x-3">
                  <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-amber-200 text-sm">
                      <strong>Guest Mode:</strong> You're exploring MateMenu. 
                      <button className="ml-1 text-amber-300 font-semibold hover:underline">
                        Create an account
                      </button>{' '}
                      to save your scan history and preferences.
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Zone */}
              <UploadZone 
                onFileSelect={handleFileSelect} 
                scanning={scanning}
              />

              {/* Quick Stats */}
              {history.length > 0 && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <p className="text-2xl font-bold text-emerald-400">{history.length}</p>
                    <p className="text-sm text-gray-400">Total Scans</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <p className="text-2xl font-bold text-amber-400">
                      {Math.round(history.reduce((acc, scan) => acc + scan.safetyScore, 0) / history.length)}
                    </p>
                    <p className="text-sm text-gray-400">Avg Safety</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <p className="text-2xl font-bold text-blue-400">
                      {history.reduce((acc, scan) => acc + scan.ingredients.length, 0)}
                    </p>
                    <p className="text-sm text-gray-400">Ingredients</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {viewMode === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ScanHistory 
                history={history}
                onSelectScan={handleSelectScan}
                onClearHistory={clearHistory}
              />
            </motion.div>
          )}

          {viewMode === 'result' && displayResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <ScanCard result={displayResult} />
              <div className="text-center space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleNewScan} variant="secondary">
                    New Scan
                  </Button>
                  <Button onClick={handleViewHistory}>
                    View History
                  </Button>
                </div>
                {user?.isGuest && (
                  <p className="text-sm text-gray-500">
                    Create an account to save your scan history and get personalized recommendations
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}