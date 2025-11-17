import { useState, useEffect } from 'react';
import type { ScanResult } from '../types';
import { scanAPI } from '../lib/api';

export function useScan() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);

  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    try {
      const guestHistory = localStorage.getItem('guestScanHistory');
      if (guestHistory) {
        setHistory(JSON.parse(guestHistory));
        return;
      }

      const response = await scanAPI.getHistory();
      if (response.data.success) {
        setHistory(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load scan history:', err);
    }
  };

  const scanImage = async (file: File) => {
    setScanning(true);
    setError(null);
    
    try {
      const response = await scanAPI.scanImage(file);
      if (response.data.success) {
        const scanResult = response.data.data as ScanResult;
        setResult(scanResult);
        
        // Update history
        const newHistory = [scanResult, ...history.slice(0, 49)]; // Keep last 50 scans
        setHistory(newHistory);
        
        // Save to localStorage if guest
        const guestUser = localStorage.getItem('guestUser');
        if (guestUser) {
          localStorage.setItem('guestScanHistory', JSON.stringify(newHistory));
        }
        
        return scanResult;
      } else {
        throw new Error(response.data.error || 'Scan failed');
      }
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Scan failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setScanning(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('guestScanHistory');
  };

  return {
    scanning,
    result,
    error,
    history,
    scanImage,
    clearResult,
    clearHistory,
    loadScanHistory,
  };
}