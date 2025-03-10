import { useEffect, useState } from "react";
import Header from "@/components/Header";
import UpdateCard, { UpdateData } from "@/components/UpdateCard";
import { SteamAPI } from "@/utils/steamAPI";
import notificationService from "@/utils/notificationService";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DEFAULT_NEWS_IMAGE = '/lovable-uploads/8db559b1-a09b-4644-b634-2215dba9100c.png';

const Index = () => {
  const [updates, setUpdates] = useState<UpdateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchUpdates = async (showRefreshAnimation = false) => {
    try {
      if (showRefreshAnimation) {
        setRefreshing(true);
      }
      
      const { updates: newUpdates, hasNewUpdate } = await SteamAPI.getUpdates();
      
      let updatesToUse = newUpdates;
      if (newUpdates.length === 0) {
        updatesToUse = Array(10).fill(null).map((_, i) => ({
          title: `Update ${i + 1}`,
          description: `This is a sample CS2 update ${i + 1} with some description text.`,
          date: new Date(Date.now() - i * 86400000).toISOString(),
          url: `https://example.com/update-${i + 1}`,
          imageUrl: DEFAULT_NEWS_IMAGE
        }));
      }
      
      setUpdates(updatesToUse);
      setLastChecked(new Date());
      setError(null);
      
      if (hasNewUpdate && newUpdates.length > 0) {
        notificationService.showNotification(newUpdates[0]);
      }
    } catch (err) {
      console.error('Error fetching updates:', err);
      setError('Failed to load updates. Please try again.');
    } finally {
      setLoading(false);
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    notificationService.init((updates) => {
      fetchUpdates();
    });
    
    fetchUpdates();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const settings = notificationService.getSettings();
        if (SteamAPI.shouldCheckForUpdates(settings.checkFrequency)) {
          fetchUpdates();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleRefresh = () => {
    fetchUpdates(true);
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 5);
      setLoadingMore(false);
    }, 300);
  };

  const visibleUpdates = updates.slice(0, visibleCount);
  const hasMoreUpdates = updates.length > visibleCount;

  return (
    <div className="min-h-screen bg-background pt-20 pb-10 px-4">
      <Header />
      
      <main className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">CS2 Updates</h1>
            <p className="text-muted-foreground">
              {lastChecked 
                ? `Last checked: ${lastChecked.toLocaleTimeString()} ${lastChecked.toLocaleDateString()}`
                : 'Checking for updates...'}
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            aria-label="Refresh updates"
          >
            <RefreshCw size={16} className={cn(
              "mr-2 transition-transform",
              refreshing && "animate-spin"
            )} />
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="rounded-lg bg-destructive/10 text-destructive p-4 mb-6">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {loading ? (
            Array(3).fill(null).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden shadow animate-pulse">
                <Skeleton className="h-40 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))
          ) : (
            <>
              {visibleUpdates.map((update, index) => (
                <UpdateCard 
                  key={update.url || index} 
                  update={update} 
                  isNew={index === 0 && visibleCount === 5} 
                />
              ))}
              
              {hasMoreUpdates && (
                <div className="pt-4 text-center">
                  <Button
                    variant="secondary"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full sm:w-auto transition-all"
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} className="mr-2" />
                        See more updates ({Math.min(5, updates.length - visibleCount)} more)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
