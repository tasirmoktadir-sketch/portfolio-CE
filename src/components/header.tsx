"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Film, User, Mail, Menu, Briefcase, Star, LogOut, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

const navLinks = [
  { href: "/", label: "Work", icon: Film },
  { href: "/about", label: "About", icon: User },
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/testimonials", label: "Testimonials", icon: Star },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { auth, user, loading } = useAuth();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold">
            Cinematic Edge
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary font-semibold" : "text-foreground/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            {loading ? <Skeleton className="w-20 h-8" /> : (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">Admin <ChevronDown className="ml-2 h-4 w-4" /></Button>
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
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
              )
            )}
          </div>

          <div className="flex items-center md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col p-6">
                  <Link
                    href="/"
                    className="mb-8 flex items-center space-x-2"
                    onClick={() => setSheetOpen(false)}
                  >
                    <span className="font-bold">Cinematic Edge</span>
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSheetOpen(false)}
                        className={cn(
                          "flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                          pathname === link.href
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground"
                        )}
                      >
                        <link.icon className="h-5 w-5" />
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-8 border-t pt-6">
                  {loading ? <Skeleton className="w-full h-10" /> : (
                    user ? (
                      <Button onClick={() => {handleLogout(); setSheetOpen(false);}} className="w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <Link href="/login" onClick={() => setSheetOpen(false)}>Login</Link>
                      </Button>
                    )
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
