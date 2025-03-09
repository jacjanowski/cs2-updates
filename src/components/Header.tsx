
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Settings, Home, Newspaper } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur bg-background/80 border-b border-border/50 transition-all duration-300 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-lg tracking-tight">CS2 Updates</span>
        </div>
        
        <nav className="flex items-center space-x-1">
          <ThemeToggle />
          <button
            onClick={() => navigate('/')}
            className={cn(
              "p-2 rounded-full transition-all duration-200",
              location.pathname === '/' 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            aria-label="Home"
          >
            <Home size={20} />
          </button>
          
          <button
            onClick={() => navigate('/news')}
            className={cn(
              "p-2 rounded-full transition-all duration-200",
              location.pathname === '/news' 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            aria-label="News"
          >
            <Newspaper size={20} />
          </button>
          
          <button
            onClick={() => navigate('/settings')}
            className={cn(
              "p-2 rounded-full transition-all duration-200",
              location.pathname === '/settings' 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
