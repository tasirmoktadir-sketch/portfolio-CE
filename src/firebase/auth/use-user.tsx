"use client";
import { Auth, onAuthStateChanged, User } from "firebase/auth";
import { useState, useEffect } from "react";
import { useAuth as useFirebaseAuth } from "../provider";

export const useUser = () => {
  const { auth } = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading, auth };
};

// Main hook for easy access to user, loading state, and auth object
export const useAuth = useUser;
