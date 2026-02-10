'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  LogOut,
  ChevronDown,
  LogIn,
  User,
  Mail,
  Film,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useUser, useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import { ThemeToggle } from './theme-toggle';

const navLinks = [
  { href: '/#featured-work', label: 'Work', icon: Film },
  { href: '/about', label: 'About', icon: User },
  { href: '/contact', label: 'Contact', icon: Mail },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { user, loading } = useUser();
  const { auth } = useFirebase();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent border-b border-border">
      <div className="container flex h-24 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-semibold uppercase tracking-wider text-foreground text-lg text-glow">
            Cinematic Edge
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center space-x-8 text-sm font-medium md:flex">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-primary text-foreground uppercase tracking-widest text-xs',
                  pathname === link.href ? 'text-primary font-semibold' : ''
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <Skeleton className="w-20 h-8" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-foreground uppercase text-xs">
                    Admin <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => router.push('/admin')}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" onClick={() => router.push('/login')} className="text-foreground uppercase text-xs">
                Admin Login
              </Button>
            )}
            <ThemeToggle />
          </div>

          <div className="flex items-center md:hidden gap-2">
            <ThemeToggle />
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] bg-background border-l-border"
              >
                <div className="flex flex-col p-6">
                  <Link
                    href="/"
                    className="mb-8 flex items-center space-x-2"
                    onClick={() => setSheetOpen(false)}
                  >
                    <span className="font-bold uppercase">
                      Cinematic Edge
                    </span>
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSheetOpen(false)}
                        className={cn(
                          'flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground uppercase',
                          pathname === link.href
                            ? 'bg-accent text-accent-foreground'
                            : 'text-foreground'
                        )}
                      >
                        <link.icon className="h-5 w-5" />
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-8 border-t pt-6">
                    {loading ? (
                      <Skeleton className="w-full h-10" />
                    ) : user ? (
                      <Button
                        onClick={() => {
                          handleLogout();
                          setSheetOpen(false);
                        }}
                        className="w-full uppercase"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          router.push('/login');
                          setSheetOpen(false);
                        }}
                        className="w-full uppercase"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Admin Login
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
