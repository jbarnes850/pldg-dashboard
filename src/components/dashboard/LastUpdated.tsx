'use client';

import { Clock } from 'lucide-react';
import { formatLastUpdated } from '@/lib/time';
import { useEffect, useState } from 'react';

export function LastUpdated() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Update the timestamp whenever data is refreshed
  useEffect(() => {
    setLastUpdate(new Date());
  }, []);
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-sm">
      <Clock className="w-4 h-4" />
      <span>Updated {formatLastUpdated(lastUpdate)}</span>
    </div>
  );
} 