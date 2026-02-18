import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

import { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useStorage } from './provider';
import { FirebaseClientProvider } from './client-provider';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUser } from './auth/use-user';
import { useMemoFirebase } from './use-memo-firebase';

export function initializeFirebase() {
  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase configuration is missing. If you are the administrator, please check your environment variables (e.g., NEXT_PUBLIC_FIREBASE_API_KEY).');
  }
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  return { app, auth, firestore, storage };
}

export {
  FirebaseProvider,
  FirebaseClientProvider,
  useCollection,
  useDoc,
  useUser,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useStorage,
  useMemoFirebase,
};
