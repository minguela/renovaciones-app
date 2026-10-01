import { useEffect } from 'react';
import { Platform } from 'react-native';

const CANONICAL_ORIGIN = 'https://renovaciones.dminguela.es';
const OPT_OUT_KEY = 'renovaciones:analytics-opt-out';

export function WebAnalytics() {
  useEffect(() => {
    if (Platform.OS !== 'web' || process.env.NODE_ENV !== 'production') return;

    let active = true;
    void import('@vercel/analytics').then(({ inject }) => {
      if (!active) return;
      inject({
        mode: 'production',
        beforeSend(event) {
          try {
            if (window.localStorage.getItem(OPT_OUT_KEY) === 'true') return null;
          } catch {
            // Continue collection if browser storage is disabled.
          }

          try {
            const url = new URL(event.url);
            if (url.origin !== CANONICAL_ORIGIN || url.pathname !== '/') return null;
            return { ...event, url: `${CANONICAL_ORIGIN}/` };
          } catch {
            return null;
          }
        },
      });
    });

    return () => {
      active = false;
    };
  }, []);

  return null;
}
