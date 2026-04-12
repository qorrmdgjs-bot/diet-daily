'use client';

import { useEffect } from 'react';
import { applyTheme, getInitialTheme } from '@/utils/theme';

export default function ThemeInitializer() {
  useEffect(() => {
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);
  }, []);

  return null;
}
