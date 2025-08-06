// src/hooks/useFingerprintId.ts
'use client';                                           // safety net

import { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

/** Возвращает visitorId (или null, пока не готово) */
export default function useFingerprintId() {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        const fp          = await FingerprintJS.load();
        const { visitorId } = await fp.get();
        if (!canceled) setId(visitorId);
      } catch (e) {
        console.error('FingerprintJS error:', e);
      }
    })();

    return () => { canceled = true; };
  }, []);

  return id;
}
