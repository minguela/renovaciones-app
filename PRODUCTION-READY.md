# PRODUCTION-READY — RenovacionesApp

**Fecha**: 2026-07-15 (actualizado)
**Estado**: ✅ EN PRODUCCIÓN
**Framework**: Expo Router (React Native Web)
**Build**: ✅ Pasa (`expo export --platform web`)
**Deploy**: ✅ Activo en https://renovaciones.dminguela.es
**Rama final**: `main`

---

## Estado Producción

| Componente | Estado | URL |
|------------|--------|-----|
| RenovacionesApp web | ✅ Deployed | https://renovaciones.dminguela.es |
| Expo static export | ✅ Generado | `dist/` |
| Supabase | ✅ Conectado | Variables configuradas |
| API send-notification | ✅ Funcional | `/api/send-notification` |
| Favicon | ✅ 200 | `/favicon.ico` |

---

## Rama y Commits

- **Rama final**: `main`
- **Commit HEAD**: `ecdb3cd` — fix(build): remove pnpm packageManager to prevent Vercel pnpm install failure
- **Commit anterior**: `ba7a118` — fix(api): use SUPABASE_SERVICE_ROLE_KEY to match Vercel env var name
- **Base**: `5c94fa7` — feat: floating glassmorphism summary pill + contextual card menu (#28)
- **Remote**: `origin/main` actualizado
- **Merge completado**: `feature/web-notifications` → `integration/renovaciones-production` → `main` (fast-forward)

---

## Variables de Entorno Vercel (Production)

| Variable | Estado | Nota |
|----------|--------|------|
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ Configurada | Acceso público Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ Configurada | Acceso público Supabase |
| `SUPABASE_URL` | ✅ Configurada | Server-side Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Configurada | Server-side Supabase |
| `CALLMEBOT_API_KEY` | ❌ No configurada | WhatsApp notifications |
| `TELEGRAM_BOT_TOKEN` | ❌ No configurada | Telegram notifications |
| `RESEND_API_KEY` | ❌ No configurada | Email notifications |
| `EXPO_PUBLIC_PROJECT_ID` | ❌ No configurada | Push notifications (mobile) |

**Nota**: Las variables de notificación son opcionales. La app funciona sin ellas (las notificaciones simplemente no se enviarán hasta que se configuren).

---

## Build y Deploy

```bash
cd ~/apps/renovaciones-app

# Instalar dependencias
npm install

# Build local (requiere variables de entorno o usar URL fallback de Supabase)
npm run build
# Output: dist/

# Deploy a Vercel
vercel --prod
```

**Vercel config** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "installCommand": "npm install",
  "cleanUrls": true,
  "rewrites": [
    { "source": "/renewal/:id", "destination": "/renewal/[id].html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=()" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://api.resend.com https://api.callmebot.com https://api.telegram.org; font-src 'self' data:; manifest-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Build script** (`package.json`):
```json
"build": "expo export --platform web"
```

---

## Smoke Tests Producción (Ejecutados)

| Test | Resultado | Status |
|------|-----------|--------|
| Cargar web | HTML con "Renovaciones", 29978 bytes | ✅ 200 |
| POST /api/send-notification | `{"error":"Notifications disabled"}` | ✅ 400 (esperado) |
| JS bundles | `_expo/static/js/web/entry-*.js` cargado | ✅ |
| Favicon | `/favicon.ico` responde | ✅ 200 |
| Rutas estáticas | `/renewal/new`, `/renewal/[id]` generadas | ✅ |

---

## Merge main + feature/web-notifications completado

### Auditoría

| Aspecto | Resultado |
|---------|-----------|
| Riesgo inicial | MEDIO — main nunca había sido deployado |
| Estrategia elegida | **C** — Rama de integración `integration/renovaciones-production` basada en main |
| Archivos solo en main | 43 archivos (glassmorphism, KPIs, catálogos, E2E tests, CI/CD, Edge Functions, migraciones) |
| Archivos solo en feature | 1 archivo (`app/(tabs)/explore.tsx`) |
| Archivos modificados en ambas | 25 archivos |

### Cambios aplicados a main

1. **Fix SUPABASE_SERVICE_ROLE_KEY**: `api/send-notification.ts` usaba `SUPABASE_SERVICE_KEY` pero Vercel configura `SUPABASE_SERVICE_ROLE_KEY`.
2. **Fix build Vercel**: Eliminado `packageManager: pnpm@11.1.1` y `pnpm-lock.yaml` para evitar que Vercel ejecute `pnpm install` fallido por `unrs-resolver` build script approval.

### Funcionalidades preservadas de main

- ✅ Glassmorphism summary pill
- ✅ Dashboard KPIs bottom bar
- ✅ Catálogos personalizados y autocomplete
- ✅ E2E tests (Playwright)
- ✅ CI/CD (GitHub Actions)
- ✅ Theme system completo (theme.css, FontLoader, Toast)
- ✅ Supabase Edge Functions
- ✅ Migraciones de base de datos
- ✅ Export/backup de datos
- ✅ OAuth redirect fixes (PRODUCTION_URL)

### Backup creado

- `backup/renovaciones-prod-before-merge-20250521-XXXXXX` desde `feature/web-notifications`

---

## Rollback

```bash
cd ~/apps/renovaciones-app

# Opción A: Revertir a commit anterior en main y redeployar
git revert HEAD --no-edit
git push origin main
vercel --prod

# Opción B: Volver a feature/web-notifications y redeployar
git checkout feature/web-notifications
vercel --prod

# Opción C: Deploy commit anterior directamente
vercel --prod
```

Rollback más rápido: ir al dashboard de Vercel y hacer "Redeploy" del deploy anterior de `feature/web-notifications`.

---

## Pendiente

- [ ] Configurar variables de notificación si se quiere usar WhatsApp/Telegram/Email
- [ ] Configurar Uptime-Kuma monitor para renovaciones.dminguela.es
- [ ] Ejecutar E2E tests en CI: `npm run test:e2e`
- [ ] Test con imagen real de menú si se integra OCR (no aplica actualmente)
- [ ] Reemplazar iconos genéricos de Expo con branding propio (ver `TECH-DEBT.md`)
- [ ] Generar sitemap.xml para SEO completo
- [ ] Revisar dominio canónico en `WebMetaTags.tsx` si cambia el dominio de producción

## Seguridad & SEO (Aplicado 2026-05-22)

- `vercel.json` ahora incluye headers de seguridad (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- Cache de assets de 1 año para `/assets/*`.
- Componente `WebMetaTags` inyecta meta tags OG/Twitter/canonical en web.
- `robots.txt` presente en `public/robots.txt`.
- Ver `TECH-DEBT.md` para estado detallado de assets y deuda técnica.
