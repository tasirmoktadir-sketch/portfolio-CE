import { Twitter, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-transparent mt-24">
      <div className="container mx-auto flex h-24 items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Specializing in immersive narratives and cutting-edge editing
            techniques
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <Twitter size={20} />
          </Link>
          <Link
            href="#"
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <Instagram size={20} />
          </Link>
          <Link
            href="#"
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <Youtube size={20} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
