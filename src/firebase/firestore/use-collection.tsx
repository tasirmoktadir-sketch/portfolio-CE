"use client";

import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { useMemoFirebase } from '../use-memo-firebase';
import { FirestorePermissionError } from '../errors';
import { errorEmitter } from '../error-emitter';

type Options = {
  snapshotListen?: boolean;
};

export const useCollection = <T extends DocumentData>(
  query: Query | null,
  options: Options = { snapshotListen: true }
) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedQuery = useMemoFirebase(query);

  useEffect(() => {
    if (!memoizedQuery) {
      setLoading(false);
      return;
    }

    setLoading(true);

    if (options.snapshotListen) {
      const unsubscribe = onSnapshot(
        memoizedQuery,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
          setData(data);
          setLoading(false);
        },
        async (err) => {
          const permissionError = new FirestorePermissionError({
            path: (memoizedQuery as any)._path.segments.join('/'),
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
          setError(permissionError);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      getDocs(memoizedQuery)
        .then((snapshot) => {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
          setData(data);
          setLoading(false);
        })
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: (memoizedQuery as any)._path.segments.join('/'),
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
          setError(permissionError);
          setLoading(false);
        });
    }
  }, [memoizedQuery, options.snapshotListen]);

  return { data, loading, error };
};
