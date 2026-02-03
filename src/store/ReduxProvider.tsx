'use client';

import { useMemo, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, useAppStore } from './store';
import { setAuthToken } from '@/app/services/authToken';
import { restoreSession } from './features/authSlice';

function AuthTokenSync({ children }: { children: React.ReactNode }) {
  const store = useAppStore();
  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    if (token) {
      store.dispatch(restoreSession(token));
    }
  }, [store]);
  useEffect(() => {
    const updateToken = () => {
      setAuthToken(store.getState().auth.token);
    };
    updateToken();
    const unsub = store.subscribe(updateToken);
    return () => unsub();
  }, [store]);
  return <>{children}</>;
}

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = useMemo(() => makeStore(), []);

  if (typeof window === 'undefined') {
    return <Provider store={makeStore()}>{children}</Provider>;
  }

  return (
    <Provider store={store}>
      <AuthTokenSync>{children}</AuthTokenSync>
    </Provider>
  );
}
