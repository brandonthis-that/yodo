import { useEffect, useState } from 'react';

export function useColorScheme() {
  const [scheme, setScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => {
      const next = mq.matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      setScheme(next);
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return scheme;
}
