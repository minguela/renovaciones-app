# Tech Debt & Assets Status — RenovacionesApp

**Fecha**: 2026-05-22
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
| `icon.png` | 393 KB | ⚠️ GENÉRICO | Parece ser el icono por defecto de Expo (logo azul). **Necesita reemplazo** con branding propio. |
| `favicon.png` | 1.1 KB | ⚠️ GENÉRICO | Muy pequeño, probablemente el favicon por defecto de Expo. **Necesita reemplazo**. |
| `splash-icon.png` | 17.5 KB | ⚠️ GENÉRICO | Icono de splash por defecto de Expo. **Necesita reemplazo**. |
| `notification-icon.png` | — | ⚠️ NO ENCONTRADO | Referenciado en `app.json` pero no listado en `assets/images/`. Verificar que existe o crearlo. |
| `android-icon-foreground.png` | 79 KB | ⚠️ PROBABLEMENTE GENÉRICO | Revisar si coincide con branding propio. |
| `android-icon-background.png` | 17.5 KB | ⚠️ PROBABLEMENTE GENÉRICO | Revisar si coincide con branding propio. |
| `android-icon-monochrome.png` | 4.1 KB | ⚠️ PROBABLEMENTE GENÉRICO | Revisar si coincide con branding propio. |
| `partial-react-logo.png` | — | 🗑️ BASURA | Archivo de plantilla Expo, puede eliminarse. |
| `react-logo.png` / `@2x` / `@3x` | — | 🗑️ BASURA | Archivos de plantilla Expo, pueden eliminarse. |

**Acción recomendada (Fase 3)**:
- Generar iconos propios (1024×1024 para `icon.png`, 512×512 para splash, 32×32 o 48×48 para favicon, 96×96 para notificaciones).
- Alinear colores con la paleta Airbnb Clean (`#FF385C`, `#00A699`, `#007AFF`, `#FFB400`, `#FFFFFF`).
- Eliminar `partial-react-logo.png` y `react-logo*.png` una vez reemplazados.

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
| `og:image` | ⚠️ PLACEHOLDER | Apunta a `/assets/images/icon.png` (genérico por ahora) |
| `canonical` | ✅ AÑADIDO | Apunta a `https://renovaciones.vercel.app` |
| Twitter Cards | ✅ AÑADIDO | `summary_large_image` |
| Sitemap XML | ❌ PENDIENTE | No generado. Considerar `next-sitemap` o script manual post-build. |

**Nota**: El dominio canónico actual es `https://renovaciones.vercel.app`. Si el dominio real de producción cambia a `https://renovaciones.dminguela.es`, actualizar `components/WebMetaTags.tsx` y `public/robots.txt`.

---

## 5. Pendientes de Baja Prioridad

- [ ] Reemplazar iconos genéricos de Expo con branding propio (Fase 3).
- [ ] Generar sitemap.xml (baja prioridad, SPA con rutas estáticas).
- [ ] Revisar si `notification-icon.png` realmente existe (puede estar en otro directorio).
- [ ] Considerar nonces en CSP si se deja de usar inline scripts.
- [ ] Configurar Uptime-Kuma monitor para el dominio de producción.
