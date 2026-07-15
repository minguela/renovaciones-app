# Tech Debt & Assets Status — RenovacionesApp

**Fecha**: 2026-07-15 (actualizado)
**Objetivo**: Documentar deuda técnica, estado de assets visuales, y tareas pendientes de seguridad/SEO.

---

## 1. TODOs / FIXMEs en Código Fuente

**Resultado del triage**: `0 (cero)` comentarios TODO/FIXME/HACK/XXX reales en el código propio del proyecto.

| Tipo | Cantidad | Ubicación |
|------|----------|-----------|
| TODO/FIXME/HACK/XXX en app/src/lib/components | 0 | N/A |
| Falsos positivos (palabras españolas: "todos", "método", UUID template) | ~8 | grep exclude list aplicado |
| Planes de agentes externos | 1 | `.hermes/plans/` (no es código de la app) |

**Conclusión**: El código base está limpio de deuda documentada. No hay tareas críticas bloqueantes.

---

## 2. Estado de Assets Visuales (Iconos / Favicon)

**Directorio**: `assets/images/`

| Archivo | Tamaño | Estado | Nota |
|---------|--------|--------|------|
| `icon.png` | 32 KB | ✅ PERSONALIZADO | Icono naranja/degradado con símbolo refresh. Actualizado 2026-06-04. |
| `favicon.png` | 1.2 KB | ✅ PERSONALIZADO | Mismo diseño que icon.png. |
| `splash-icon.png` | 32 KB | ✅ PERSONALIZADO | Mismo diseño. |
| `notification-icon.png` | 8 KB | ✅ PRESENTE | Icono de notificación personalizado. |
| `android-icon-foreground.png` | 79 KB | ⚠️ POR REVISAR | Verificar si coincide con branding propio. |
| `android-icon-background.png` | 17 KB | ⚠️ POR REVISAR | Verificar si coincide con branding propio. |
| `android-icon-monochrome.png` | 4 KB | ⚠️ POR REVISAR | Verificar si coincide con branding propio. |
| `partial-react-logo.png` | — | 🗑️ ELIMINADO | Limpiado 2026-07-15. |
| `react-logo.png` / `@2x` / `@3x` | — | 🗑️ ELIMINADOS | Limpiados 2026-07-15. |

**Acción recomendada**:
- Los iconos principales ya están personalizados con branding propio (naranja degradado + símbolo refresh). ✅

---

## 3. Seguridad — Estado Actual

| Medida | Estado | Archivo |
|--------|--------|---------|
| Variables env en `vercel.json` | ✅ LIMPIO | `vercel.json` no contiene secrets hardcodeados |
| `.env.example` placeholders | ✅ ACTUALIZADO | Placeholders claros con warnings de seguridad |
| Headers de seguridad HTTP | ✅ AÑADIDOS | `vercel.json`: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| Cache de assets | ✅ AÑADIDO | `Cache-Control: public, max-age=31536000, immutable` para `/assets/*` |
| `robots.txt` | ✅ AÑADIDO | `public/robots.txt` — permite todo excepto `/renewal/` |
| `.env.local` en `.gitignore` | ✅ VERIFICADO | Ya está presente |

**Nota CSP**: La política permite `'unsafe-inline'` y `'unsafe-eval'` en scripts porque Expo static export genera inline scripts/styles. Esto es aceptable para SPAs estáticas pero debería revisarse si en el futuro se migra a SSR o se implementa nonces.

---

## 4. SEO — Estado Actual

| Medida | Estado | Archivo |
|--------|--------|---------|
| Meta tags dinámicos (web) | ✅ AÑADIDO | `components/WebMetaTags.tsx` |
| Inyección en layout raíz | ✅ AÑADIDO | `app/_layout.tsx` importa `<WebMetaTags />` |
| `robots.txt` | ✅ AÑADIDO | `public/robots.txt` |
| `og:image` | ✅ ACTUALIZADO | `https://renovaciones.dminguela.es/assets/images/icon.png` |
| `canonical` | ✅ ACTUALIZADO | Apunta a `https://renovaciones.dminguela.es` |
| Twitter Cards | ✅ AÑADIDO | `summary_large_image` |
| Sitemap XML | ✅ GENERADO | `public/sitemap.xml` con rutas principales |

**Nota**: Dominio canónico actualizado a `https://renovaciones.dminguela.es`. Actualizado en `WebMetaTags.tsx`, `robots.txt`, `lib/supabase.ts` y `scripts/demo-notifications.js`.

---

## 5. Pendientes de Baja Prioridad

- [x] Reemplazar iconos genéricos de Expo con branding propio — ya están personalizados (2026-06-04).
- [x] Generar sitemap.xml — generado en `public/sitemap.xml` (2026-07-15).
- [x] Eliminar assets basura Expo — limpiados (2026-07-15).
- [x] Actualizar dominio canónico a `renovaciones.dminguela.es` — hecho (2026-07-15).
- [ ] Configurar Uptime-Kuma monitor para el dominio de producción.
- [ ] Revisar `getWebRedirectUrl()` en `lib/supabase.ts` — la detección del Vercel URL largo sigue funcionando pero el dominio canónico ya apunta a dminguela.es.
