"use client";

import { useEffect, useState } from 'react';
import { initializeFirebase } from './';
import { FirebaseProvider } from './provider';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
};

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseInstances | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const instances = await initializeFirebase();
        setFirebase(instances);
      } catch (e: any) {
        console.error("Firebase initialization failed:", e);
        setError(e);
      }
    };

    init();
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-destructive">Application Error</h1>
          <p className="mt-2 text-muted-foreground">The application could not start because a required service failed to initialize.</p>
          <p className="mt-4 text-sm text-muted-foreground">
            If you are the site administrator, this is likely due to missing Firebase environment variables in your hosting provider (e.g., Netlify, Vercel).
          </p>
          <div className="mt-4 rounded-md bg-muted p-4 text-left text-xs text-muted-foreground">
            <p className="font-bold">Error Details:</p>
            <pre className="mt-2 whitespace-pre-wrap font-mono">{error.message}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (!firebase) {
    // You can render a loading spinner here
    return (
       <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <FirebaseProvider app={firebase.app} auth={firebase.auth} firestore={firebase.firestore} storage={firebase.storage}>
      {children}
    </FirebaseProvider>
  );
}
