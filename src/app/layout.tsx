import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Cinematic Edge',
  description:
    'The official portfolio for Mohtasim Moktadir Tasir, a visual storyteller and video editor.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="absolute top-0 left-0 w-full h-full z-0">
            {/* Top center glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-primary/10 blur-[150px] rounded-full transition-opacity duration-500 opacity-0 dark:opacity-100" />
            {/* Left rays */}
            <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 -rotate-45 transition-opacity duration-500 opacity-0 dark:opacity-50">
              <div className="absolute w-full h-1 bg-primary/50 blur-sm mb-4" />
              <div
                className="absolute w-full h-1 bg-primary/30 blur-md mb-8 top-4"
              />
              <div className="absolute w-full h-px bg-secondary/50 blur-sm top-12" />
              <div
                className="absolute w-full h-px bg-secondary/30 blur-md top-16"
              />
            </div>
            {/* Right rays */}
            <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 rotate-45 transition-opacity duration-500 opacity-0 dark:opacity-50">
              <div className="absolute w-full h-1 bg-primary/50 blur-sm mb-4" />
              <div
                className="absolute w-full h-1 bg-primary/30 blur-md mb-8 top-4"
              />
              <div className="absolute w-full h-px bg-secondary/50 blur-sm top-12" />
              <div
                className="absolute w-full h-px bg-secondary/30 blur-md top-16"
              />
            </div>
          </div>
          <FirebaseClientProvider>
            <div className="relative z-10 flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
