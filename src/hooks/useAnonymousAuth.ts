import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { ensureAnonymousUser, onAuthChanged } from '@/lib/firebase';

export const useAnonymousAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChanged((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    ensureAnonymousUser().catch((error) => {
      console.error('Failed to sign in anonymously', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading } as const;
};
