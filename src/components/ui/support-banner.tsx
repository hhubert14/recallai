'use client';

import { useState, useEffect } from 'react';
import { X, Coffee } from 'lucide-react';
import Link from 'next/link';

interface SupportBannerProps {
  userId: string;
}

export function SupportBanner({ userId }: SupportBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    // Get current visit count and last dismissed time from localStorage
    const storageKey = `support-banner`;
    const bannerData = localStorage.getItem(storageKey);
    
    if (bannerData) {
      const { visits, lastDismissed } = JSON.parse(bannerData);
      const daysSinceLastDismissed = lastDismissed 
        ? Math.floor((Date.now() - lastDismissed) / (1000 * 60 * 60 * 24))
        : 999;
      
      // Show banner every 3-4 visits, but only if it's been at least 7 days since last dismissal
      const newVisitCount = visits + 1;
      setVisitCount(newVisitCount);
      
      if (newVisitCount >= 0 && daysSinceLastDismissed >= 7) {
        setIsVisible(true);
      }
      
      // Update visit count
      localStorage.setItem(storageKey, JSON.stringify({
        visits: newVisitCount,
        lastDismissed: lastDismissed
      }));
    } else {
      // First visit
      setVisitCount(1);
      localStorage.setItem(storageKey, JSON.stringify({
        visits: 1,
        lastDismissed: null
      }));
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    const storageKey = `support-banner`;
    localStorage.setItem(storageKey, JSON.stringify({
      visits: 0, // Reset visit count after dismissal
      lastDismissed: Date.now()
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b border-blue-100 dark:border-blue-800">
      <div className="container mx-auto px-6 md:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Coffee className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <span className="font-medium text-blue-700 dark:text-blue-300">Hi! I'm the college student behind RecallAI.</span> I built this because I was tired of watching hours of educational content and retaining almost nothing. Your Premium subscription doesn't just unlock unlimited videos and advanced features, it directly supports a solo developer who's passionate about transforming how we learn. Let's build better study habits together!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/dashboard/pricing"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Support & Upgrade
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
