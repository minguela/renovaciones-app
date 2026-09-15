/**
 * The web product has a deliberately light visual system. Do not inherit the
 * operating system preference here: doing so changes the canvas to the native
 * dark palette after hydration and leaves the login screen almost black.
 */
export function useColorScheme() {
  return 'light';
}
