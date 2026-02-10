"use client";

import { useState, useEffect } from 'react';
import { onSnapshot, DocumentReference, DocumentData, getDoc } from 'firebase/firestore';
import { useMemoFirebase } from '../use-memo-firebase';
import { FirestorePermissionError } from '../errors';
import { errorEmitter } from '../error-emitter';

type Options = {
  snapshotListen?: boolean;
};

export const useDoc = <T extends DocumentData>(
  docRef: DocumentReference<T> | null,
  options: Options = { snapshotListen: true }
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedDocRef = useMemoFirebase(docRef);

  useEffect(() => {
    if (!memoizedDocRef) {
      setLoading(false);
      return;
    }

    setLoading(true);
    if (options.snapshotListen) {
      const unsubscribe = onSnapshot(
        memoizedDocRef,
        (snapshot) => {
          const data = snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null;
          setData(data);
          setLoading(false);
        },
        async (err) => {
          const permissionError = new FirestorePermissionError({
            path: memoizedDocRef.path,
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
          setError(permissionError);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      getDoc(memoizedDocRef)
        .then((snapshot) => {
          const data = snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null;
          setData(data);
          setLoading(false);
        })
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: memoizedDocRef.path,
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
          setError(permissionError);
          setLoading(false);
        });
    }
  }, [memoizedDocRef, options.snapshotListen]);

  return { data, loading, error };
};
