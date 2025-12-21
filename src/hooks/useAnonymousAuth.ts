import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { ensureAnonymousUser, isFirebaseConfigured, onAuthChanged } from '@/lib/firebase';

type UseAnonymousAuthResult = {
  user: User | null;
  loading: boolean;
};

export const useAnonymousAuth = (): UseAnonymousAuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    let cancelled = false;

    // Start anonymous sign-in; do not set state synchronously in effect body.
    ensureAnonymousUser()
      .catch(() => {
        // Stop loading if auth bootstrap fails (async callback is fine).
        if (!cancelled) setLoading(false);
      });

    const unsubscribe = onAuthChanged((nextUser) => {
      if (cancelled) return;
      setUser(nextUser);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { user, loading };
};
