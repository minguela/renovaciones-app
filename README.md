# RenovacionesApp

Aplicación multiplataforma para gestionar seguros, suscripciones y renovaciones. Disponible para **iOS** (Expo) y **Web** (PWA).

## Características

- Gestión de renovaciones (seguros, suscripciones, licencias)
- Notificaciones vía WhatsApp, Telegram o Email
- Sincronización en la nube con Supabase
- Autenticación de usuarios
- Calculadora de gastos mensuales/anuales
- Diseño responsive (móvil y web)
- Dark mode

## Arquitectura

```
Frontend: React Native + Expo (iOS/Web)
Backend: Serverless Functions (Vercel/Netlify)
Database: Supabase (PostgreSQL + Auth)
Notifications: WhatsApp (CallMeBot), Telegram Bot, Email (Resend)
```

## Configuración Rápida

### 1. Supabase (Base de datos)

1. Crea proyecto en [supabase.com](https://supabase.com)
2. Ve a SQL Editor y ejecuta el contenido de `supabase/schema.sql`
3. Copia URL y anon key desde Settings > API

### 2. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Para notificaciones (opcional)
CALLMEBOT_API_KEY=your-key
TELEGRAM_BOT_TOKEN=your-bot-token
RESEND_API_KEY=your-key
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

### WhatsApp (CallMeBot) - Gratis

1. Añade `+34 644 16 71 91` a tus contactos
2. Envía: `I allow callmebot to send me messages`
3. Obtén tu API key en [callmebot.com](https://www.callmebot.com/blog/free-api-whatsapp-messages/)
4. Guarda en tu perfil de la app

### Telegram - Gratis

1. Crea un bot con [@BotFather](https://t.me/BotFather)
2. Copia el token del bot
3. Escribe un mensaje al bot
4. Obtén tu chat ID: `https://api.telegram.org/bot<TOKEN>/getUpdates`
5. Configura en la app

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
