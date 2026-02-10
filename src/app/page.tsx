import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { FeaturedWork } from '@/components/featured-work';

export default function Home() {
  return (
    <>
      <section className="container mx-auto flex h-[calc(100vh-250px)] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-6xl font-bold tracking-tight md:text-8xl text-foreground drop-shadow-lg">
          Crafting The
          <br />
          Future Of Motion.
        </h1>
        <div className="mt-12">
          <Button
            asChild
            variant="ghost"
            className="group text-foreground uppercase tracking-widest hover:bg-transparent"
          >
            <Link href="#featured-work">
              <PlayCircle
                className="mr-4 h-16 w-16 text-foreground transition-all duration-300 group-hover:text-primary group-hover:scale-110 group-hover:animate-pulse"
                style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary)))' }}
              />
              View Showreel
            </Link>
          </Button>
        </div>
      </section>

      <div
        id="featured-work"
        className="container mx-auto px-4 py-12 md:px-6 scroll-m-20"
      >
        <section className="mt-12">
          <FeaturedWork />
        </section>
      </div>
    </>
  );
}
