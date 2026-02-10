"use client";

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: any) => {
      console.error(error); // Also log to console for debugging
      toast({
        variant: 'destructive',
        title: 'Permission Error',
        description: error.message || 'You do not have permission to perform this action.',
      });
      // This will now throw the error and trigger the Next.js error overlay in development
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
