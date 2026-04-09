import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';

export default function Home() {
  const navigate = useNavigate();
  const setShowSetupModal = useGameStore((state) => state.setShowSetupModal);

  const handlePlay = () => {
    setShowSetupModal(true);
    navigate('/play');
  };

  return (
    <main className="min-h-screen wood-texture">
      <section className="relative flex min-h-screen items-center justify-center px-4">        
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl text-primary drop-shadow-sm font-[Cinzel]">
              Cheesify
            </h1>
          </div>

          <p className="mx-auto max-w-xl text-lg leading-relaxed md:text-2xl text-muted-foreground italic">
            Experience the elegance of chess. Play against friends or challenge the ENGINE itself.
          </p>

          <div className="pt-4 flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              onClick={handlePlay} 
              className="min-w-[240px] text-lg font-[Cinzel] font-semibold tracking-wide btn-wood"
            >
              Play Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}