# Plan: Corrección Global de Legibilidad — Texto Blanco sobre Fondo Blanco

## Contexto
Aplicación React Native + Expo Router con build web desplegado en Vercel. El diseño objetivo es estilo Airbnb (light aesthetic). Existe `theme.css` con tokens CSS y `constants/theme.ts` con tokens JS, pero no se usan de forma centralizada ni consistente.

## Problema
Inputs, selects, textareas y otros componentes interactivos muestran texto blanco sobre fondo blanco en web, haciéndolos ilegibles.

## Causa Raíz (diagnosticada)

1. **`theme.css` NO se importa**: El archivo existe pero nunca se carga en la app, por lo que las variables CSS `@theme` son inaccesibles.

2. **React Navigation ThemeProvider fuerza dark theme en web**: En `app/_layout.tsx`:
   ```ts
   const activeTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
   ```
   Si el sistema del usuario está en dark mode, `colorScheme` retorna `'dark'` y `ThemeProvider` aplica `DarkTheme`. Esto inyecta `color-scheme: dark` a nivel de documento en web.

3. **Los inputs en web heredan color del navegador**: Cuando el documento tiene `color-scheme: dark`, los `<input>` nativos del navegador renderizan texto blanco por defecto. Pero los componentes forzan explícitamente `backgroundColor: '#ffffff'`, creando texto blanco sobre fondo blanco.

4. **`useThemeColor` ignora el tema real en web**: El hook en `hooks/use-theme-color.ts` usa `props.dark ?? props.light` para web, sin respetar el `colorScheme` actual. Esto puede devolver colores incorrectos.

5. **Colores hardcodeados dispersos**: Constantes `AIRBNB` duplicadas en `AuthScreen.tsx`, `app/renewal/[id].tsx`, `CatalogPicker.tsx`, etc., con colores literales en lugar de tokens del tema.

## Archivos a Revisar/Modificar

- `app/_layout.tsx` — Forzar tema light en web, importar theme.css
- `hooks/use-theme-color.ts` — Corregir lógica para web
- `components/ui/Input.tsx` — Asegurar color de texto explícito y legible
- `components/AuthScreen.tsx` — Revisar inputs y textos
- `app/renewal/[id].tsx` — Revisar formulario completo (inputs, selects, date pickers)
- `components/CatalogPicker.tsx` — Revisar inputs y textos
- `components/NotificationSettings.tsx` — Revisar inputs
- `components/ui/Card.tsx` — Verificar contraste
- `app/(tabs)/index.tsx` — Verificar textos y fondos

## Estrategia Global

1. **Forzar light theme en web** en `app/_layout.tsx`: el diseño Airbnb es light-only en web. No mezclar con dark mode del sistema.
2. **Importar `theme.css`** en el entry point para que las variables CSS estén disponibles.
3. **Corregir `useThemeColor`** para que respete el `colorScheme` actual incluso en web.
4. **Auditoría de contraste**: buscar todos los `TextInput`, `input` HTML, `select`, y componentes con `backgroundColor` blanco o cercano, y asegurar `color` explícito oscuro.
5. **Reemplazar colores hardcodeados** donde sea posible por tokens de `constants/theme.ts`.
6. **No usar `!important` salvo que sea imprescindible**.
7. **Ejecutar build local** antes de commitear.

## Verificación

- [ ] `npm run build` pasa sin errores
- [ ] Revisar visualmente AuthScreen (login)
- [ ] Revisar visualmente RenewalForm (`/renewal/[id]`)
- [ ] Revisar visualmente CatalogPicker
- [ ] Revisar visualmente NotificationSettings
- [ ] Revisar visualmente Dashboard (`/(tabs)/index`)
- [ ] Buscar en todo el código: `text-white`, `bg-white`, `color: white`, `background: white`, `color: #fff`, `background: #fff`
