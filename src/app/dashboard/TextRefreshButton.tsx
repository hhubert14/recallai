'use client';

import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function TextRefreshButton() {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        router.refresh();
        // Reset the loading state after a short delay
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    return (
        <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
        >
            <RefreshCw 
                className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} 
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
    );
}
