
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import UpdateCard, { UpdateData } from "@/components/UpdateCard";
import { NewsAPI } from "@/utils/newsAPI";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const News = () => {
  const [news, setNews] = useState<UpdateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);

  // Function to fetch news
  const fetchNews = async (showRefreshAnimation = false) => {
    try {
      if (showRefreshAnimation) {
        setRefreshing(true);
      }
      
      const newNewsItems = await NewsAPI.getNews();
      
      // Create some example news if none are returned from the API
      let newsToUse = newNewsItems;
      if (newNewsItems.length === 0) {
        // Generate sample news for demonstration
        newsToUse = Array(10).fill(null).map((_, i) => ({
          title: `News Article ${i + 1}`,
          description: `This is a sample CS2 news article ${i + 1} with some description text.`,
          date: new Date(Date.now() - i * 86400000).toISOString(), // Each day earlier
          url: `https://example.com/news-${i + 1}`,
          imageUrl: i % 2 === 0 ? 'https://picsum.photos/800/400?random=' + i : undefined
        }));
      }
      
      setNews(newsToUse);
      setLastChecked(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Please try again.');
    } finally {
      setLoading(false);
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  // Initialize
  useEffect(() => {
    // Fetch news on component mount
    fetchNews();
    
    // Add event listener for when app comes back from background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (NewsAPI.shouldCheckForNews('daily')) {
          fetchNews();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Manual refresh
  const handleRefresh = () => {
    fetchNews(true);
  };

  // Load more news
  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 5);
      setLoadingMore(false);
    }, 300);
  };

  // Get visible news
  const visibleNews = news.slice(0, visibleCount);
  const hasMoreNews = news.length > visibleCount;

  return (
    <div className="min-h-screen bg-background pt-20 pb-10 px-4">
      <Header />
      
      <main className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">CS2 News</h1>
            <p className="text-muted-foreground">
              {lastChecked 
                ? `Last checked: ${lastChecked.toLocaleTimeString()} ${lastChecked.toLocaleDateString()}`
                : 'Checking for news...'}
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            aria-label="Refresh news"
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
            // Loading skeletons
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
              {visibleNews.map((newsItem, index) => (
                <UpdateCard 
                  key={newsItem.url || index} 
                  update={newsItem} 
                  isNew={index === 0 && visibleCount === 5} 
                />
              ))}
              
              {hasMoreNews && (
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
                        See more news ({Math.min(5, news.length - visibleCount)} more)
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

export default News;
