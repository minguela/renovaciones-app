# Plan: Solucionar redireccion OAuth a URL larga de Vercel

## Fecha
2026-05-14

## Problema
Tras hacer login con Google/Apple OAuth en web, el navegador termina en la URL larga de Vercel (`renovaciones-app-minguela9109-6446s-projects.vercel.app`) en vez de quedarse en la URL corta canonica (`renovaciones-app.vercel.app`).

## Diagnostico (completado)

### 1. El codigo ya fuerza redirectTo a la URL corta
En `lib/supabase.ts` tenemos:
```ts
const PRODUCTION_URL = 'https://renovaciones-app.vercel.app/';
function getWebRedirectUrl(): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  if (origin.includes('renovaciones-app-minguela9109')) {
    return PRODUCTION_URL;
  }
  return origin;
}
```
Esto se usa en `signInWithGoogle` y `signInWithApple` como `redirectTo`.

### 2. Verificacion con curl al endpoint de autorizacion de Supabase
```bash
curl -s "https://grgmuqaigqgrbjvzjecn.supabase.co/auth/v1/authorize?provider=google&redirect_to=https://renovaciones-app.vercel.app/"
```
Respuesta: Genera URL de Google con `redirect_to=https%3A%2F%2Frenovaciones-app.vercel.app%2F`.  
**Conclusion**: El `redirectTo` llega correctamente a Supabase.

### 3. Verificacion con curl al callback de Supabase
```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" \
  "https://grgmuqaigqgrbjvzjecn.supabase.co/auth/v1/callback?code=fake&state=test&redirect_to=https://renovaciones-app.vercel.app/"
```
Respuesta:
```
303 https://renovaciones-app-minguela9109-6446s-projects.vercel.app/?error=invalid_request...
```
**Conclusion**: Supabase redirige al callback usando la **URL larga**, ignorando el `redirect_to` pasado. Esto indica que en el dashboard de Supabase, la **Site URL** esta configurada como la URL larga.

## Causa raiz
Supabase Auth usa la **Site URL** configurada en el dashboard como URL base para el callback OAuth. El parametro `redirectTo` del cliente solo funciona como *allowed redirect URL*, pero el callback final usa la Site URL. Si la Site URL esta configurada con la URL larga de Vercel, todos los callbacks OAuth terminan en esa URL.

## Solucion

### Paso 1: Configurar Supabase Authentication (manual, dashboard)
1. Ir a https://supabase.com/dashboard/project/grgmuqaigqgrbjvzjecn/settings/auth
2. En **Site URL**, poner: `https://renovaciones-app.vercel.app/`
3. En **Redirect URLs**, agregar:
   - `https://renovaciones-app.vercel.app/**`
   - `https://renovaciones-app-minguela9109-6446s-projects.vercel.app/**`
   - `http://localhost:8081/**` (para desarrollo local)
4. Guardar cambios.

### Paso 2: Corregir PRODUCTION_URL en codigo (evitar barra final)
En `lib/supabase.ts`, la constante tiene barra final:
```ts
const PRODUCTION_URL = 'https://renovaciones-app.vercel.app/';
```
Cambiar a:
```ts
const PRODUCTION_URL = 'https://renovaciones-app.vercel.app';
```
La barra final puede causar problemas de normalizacion de URL con Supabase (algunos servicios tratan `https://domain/` y `https://domain` como diferentes).

### Paso 3: Verificar build local
```bash
npm run build
```
Asegurar que no haya errores de sintaxis.

### Paso 4: Desplegar y probar
1. Hacer push a main (o mergear PR)
2. Esperar deploy de Vercel
3. Acceder a `https://renovaciones-app-minguela9109-6446s-projects.vercel.app/`
4. Hacer login con Google
5. Verificar que tras el login la URL queda en `https://renovaciones-app.vercel.app/` (o al menos no en la larga)

### Paso 5: Opcional - Configurar dominio personalizado en Vercel
Si el problema persiste por comportamiento interno de Vercel, considerar agregar un dominio personalizado (ej. `renovaciones.app`) en Vercel > Settings > Domains y configurar ese dominio como Site URL en Supabase.

## Archivos a modificar
- `lib/supabase.ts` (quitar barra final de PRODUCTION_URL)

## Notas
- No es necesario cambiar `app/_layout.tsx` ni `app/(tabs)/_layout.tsx` para este fix.
- El SecurityError anterior (`history.replaceState` cross-origin) era un intento erroneo de solucionarlo por el lado del cliente; el fix correcto es configurar Supabase.
