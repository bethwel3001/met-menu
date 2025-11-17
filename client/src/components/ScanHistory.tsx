import { motion, AnimatePresence } from 'framer-motion';
import type { ScanResult } from '../types';
import { ScanCard } from './ScanCard';

interface ScanHistoryProps {
  history: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  onClearHistory: () => void;
}

export function ScanHistory({ history, onSelectScan, onClearHistory }: ScanHistoryProps) {
  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No Scan History</h3>
        <p className="text-gray-500">Your food safety scans will appear here</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Scan History</h2>
        <button
          onClick={onClearHistory}
          className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {history.map((scan, index) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectScan(scan)}
              className="cursor-pointer transform transition-transform hover:scale-[1.02]"
            >
              <ScanCard result={scan} compact />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}