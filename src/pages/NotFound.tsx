import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center wood-texture bg-background">
      <div className="wood-panel p-12 rounded-xl text-center max-w-md mx-4 shadow-2xl">
        <div className="text-6xl mb-4">♟</div>
        <h1 className="mb-2 text-5xl font-bold font-[Cinzel] text-primary">404</h1>
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-4 rounded-full" />
        <p className="mb-6 text-xl text-muted-foreground font-[Cinzel]">This square is empty</p>
        <p className="mb-8 text-sm text-muted-foreground italic">
          The page you're looking for seems to have been captured.
        </p>
        <Button 
          asChild 
          className="wood-button font-[Cinzel] font-semibold tracking-wide"
        >
          <a href="/">
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;