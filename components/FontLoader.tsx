import { useEffect } from 'react';
import { Platform } from 'react-native';

const FONT_LINKS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500&family=IBM+Plex+Mono:wght@400&display=swap');
`;

export function FontLoader() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = FONT_LINKS;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return null;
}
