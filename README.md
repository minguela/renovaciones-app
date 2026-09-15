# RenovacionesApp

Aplicación multiplataforma para gestionar seguros, suscripciones y renovaciones. Disponible para **iOS** (Expo) y **Web** (PWA).

## Características

- Gestión de renovaciones (seguros, suscripciones, licencias)
- Notificaciones vía WhatsApp, Telegram o Email
- Sincronización en la nube con Neon PostgreSQL
- Autenticación de usuarios
- Calculadora de gastos mensuales/anuales
- Diseño responsive (móvil y web)
- Dark mode

## Arquitectura

```
Frontend: React Native + Expo (iOS/Web)
Backend: Serverless Functions (Vercel/Netlify)
Database: Neon PostgreSQL + autenticación propia
Notifications: WhatsApp (CallMeBot), Telegram Bot, Email (Resend)
```

## Configuración Rápida

### 1. Base de datos

1. Configura `DATABASE_URL` para Neon PostgreSQL en Vercel.
2. Ejecuta `scripts/migrate-to-neon.sql` si instalas un proyecto nuevo.

### 2. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env`:
```
DATABASE_URL=postgresql://...

# Para notificaciones (opcional)
CALLMEBOT_API_KEY=your-key
TELEGRAM_BOT_TOKEN=your-bot-token
RESEND_API_KEY=your-key
CRON_SECRET=long-random-internal-secret
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar localmente

```bash
# iOS (requiere macOS + Xcode)
npx expo run:ios

# Web
npx expo start --web

# Expo Go (iOS/Android)
npx expo start
```

## Configuración de Notificaciones

### WhatsApp (CallMeBot) - Opcional

1. Añade el número que figura en la [guía actual de CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/) a tus contactos (a 15-09-2026 es `+34 623 78 95 80`).
2. Envía: `I allow callmebot to send me messages`
3. Obtén tu API key en [callmebot.com](https://www.callmebot.com/blog/free-api-whatsapp-messages/)
4. En Ajustes, elige WhatsApp, guarda tu propio número con prefijo internacional y envía una prueba. Usa Telegram como canal principal para avisos críticos.

### Telegram - Gratis y recomendado

1. Crea un bot con [@BotFather](https://t.me/BotFather)
2. Copia el token del bot
3. Envía `/start` al bot desde tu cuenta personal.
4. Obtén tu chat ID de `getUpdates` tras iniciar el bot. Nunca pegues el token en la pantalla de la app.
5. En Ajustes, elige **Telegram**, introduce tu Chat ID, activa recordatorios, guarda y pulsa **Probar aviso**. Comprueba que el mensaje aparece en tu chat.
6. Configura `TELEGRAM_BOT_TOKEN` y `CRON_SECRET` en Vercel. El cron se ejecuta a las 07:00 UTC y avisa en el plazo elegido, y a 7, 3, 1 días y el día del cargo si caen dentro de ese plazo.

### Email (Resend) - 100 emails/día gratis

1. Crea cuenta en [resend.com](https://resend.com)
2. Verifica tu dominio o usa `onboarding@resend.dev` para pruebas
3. Copia la API key

## Despliegue

### Web (Vercel)

```bash
npm i -g vercel
vercel
```

### iOS (App Store)

```bash
eas build --platform ios
```

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia servidor de desarrollo |
| `npm run ios` | Ejecuta en simulador iOS |
| `npm run android` | Ejecuta en emulador Android |
| `npm run web` | Ejecuta versión web |
| `npm run lint` | Ejecuta ESLint |

## Workflow Git

```bash
# Nueva feature
git checkout -b feature/nombre-feature main
# ... cambios ...
git commit -m "feat: descripción"
git push origin feature/nombre-feature
# Crear PR en GitHub

# Bugfix
git checkout -b fix/nombre-fix main
# ... cambios ...
git commit -m "fix: descripción"
git push origin fix/nombre-fix
# Crear PR en GitHub
```

## Estructura del proyecto

```
app/                    # Expo Router
├── (tabs)/            # Tabs navigation
│   ├── index.tsx      # Listado de renovaciones
│   └── _layout.tsx    # Tab layout
├── renewal/
│   └── [id].tsx       # Formulario crear/editar
└── _layout.tsx        # Root layout

components/            # Componentes React
├── RenewalCard.tsx    # Tarjeta de renovación
├── AuthScreen.tsx     # Pantalla de login/registro
├── NotificationSettings.tsx  # Config notificaciones
└── ui/                # Componentes base

lib/                   # Librerías y configuración
├── supabase.ts        # Cliente Supabase
└── notifications/     # Servicios de notificación
    ├── whatsapp.ts
    ├── telegram.ts
    └── email.ts

api/                   # Serverless functions
└── send-notification.ts

supabase/
└── schema.sql         # Esquema de base de datos

hooks/
├── useRenewals.ts     # Hook para CRUD de renovaciones
└── useThemeColor.ts   # Hook para tema

types/
└── renewal.ts         # Tipos TypeScript
```

## Licencia

MIT
