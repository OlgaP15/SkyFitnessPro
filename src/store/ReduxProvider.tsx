'use client';

import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './store';

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = useMemo(() => makeStore(), []);

  if (typeof window === 'undefined') {
    // На сервере создаем новый store
    return <Provider store={makeStore()}>{children}</Provider>;
  }

  return <Provider store={store}>{children}</Provider>;
}
