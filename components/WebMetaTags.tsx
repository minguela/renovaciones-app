import { useEffect } from 'react';
import { Platform } from 'react-native';

const SITE_NAME = 'Renovaciones';
const SITE_DESCRIPTION = 'Gestiona tus renovaciones y suscripciones de forma inteligente. Recibe avisos antes de que venzan tus servicios.';
const SITE_URL = 'https://renovaciones.vercel.app';
const OG_IMAGE = `${SITE_URL}/assets/images/icon.png`;

export function WebMetaTags({ title, description }: { title?: string; description?: string }) {
  const isWeb = Platform.OS === 'web';
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const pageDesc = description || SITE_DESCRIPTION;

  useEffect(() => {
    if (!isWeb || typeof document === 'undefined') return;

    // Helper to set or update meta tags
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // Helper to set link tags
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
    };

    // Title
    document.title = pageTitle;

    // Standard meta
    setMeta('description', pageDesc);
    setMeta('robots', 'index, follow');

    // Open Graph
    setMeta('og:title', pageTitle, true);
    setMeta('og:description', pageDesc, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', SITE_URL, true);
    setMeta('og:image', OG_IMAGE, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:locale', 'es_ES', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', pageDesc);
    setMeta('twitter:image', OG_IMAGE);

    // Canonical
    setLink('canonical', SITE_URL);

    // Favicon fallback for web (Expo already injects favicon.ico, but this ensures png)
    setLink('icon', `${SITE_URL}/favicon.ico`);
    setLink('apple-touch-icon', `${SITE_URL}/assets/images/icon.png`);

    // Theme color (mobile browser UI)
    setMeta('theme-color', '#FF385C');
    setMeta('msapplication-TileColor', '#FF385C');

    return () => {
      // Cleanup is optional; Expo manages head lifecycle.
      // We leave tags in place to avoid flicker on route changes.
    };
  }, [isWeb, pageTitle, pageDesc]);

  return null;
}
