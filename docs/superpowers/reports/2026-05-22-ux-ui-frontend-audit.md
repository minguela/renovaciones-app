# Auditoria UX/UI y Frontend de RenovacionesApp

**Fecha:** 2026-05-22  
**Objetivo:** elevar RenovacionesApp desde una experiencia visual de MVP a un producto SaaS/personal-finance pulido, mobile-first, consistente, legible y mantenible.

## 1. Resumen Ejecutivo

La app tiene una base de producto clara: una tarea concreta, datos de alta frecuencia de consulta, y un flujo principal sencillo de entender. Eso es una ventaja. El problema actual es que la UI y el frontend no expresan todavia esa claridad con la calidad de un producto maduro.

La impresion general hoy es:

- **Producto actual:** `main` ya contiene un salto claro respecto al MVP inicial: OAuth, alta con catalogo, filtros, export CSV, adjuntos, KPIs flotantes y mejor layout web.
- **Calidad visual:** ese avance funcional no esta acompañado todavia por un sistema visual suficientemente disciplinado. Hay primitives y una paleta web `AIRBNB`, pero la composicion de pantallas sigue mezclando reglas locales, hex sueltos y patrones tactiles/web sin una gramatica completa.
- **Riesgo principal:** la app esta ganando capacidad mas rapido que jerarquia. Home, filtros, resumen flotante, acciones, settings y formulario avanzado empiezan a competir por atencion antes de consolidar una experiencia principal muy clara.

Mi lectura dura es esta: **el producto no esta feo por un color concreto; esta poco sistematizado**. La falta de tokens, jerarquias semanticas, variantes de componentes, estados accesibles, reglas responsive y limites de layout hace que cada pantalla tome decisiones propias. Eso produce una sensacion mas amateur que premium aunque algunos bloques aislados sean razonables.

## 2. Alcance y Evidencia

### Evidencia observada en produccion

Se inspecciono `https://renovaciones.dminguela.es` en navegador:

- Pantalla de acceso inicial.
- Login con Apple, Google y email en produccion.
- Ruta directa publica `/renewal/new`.
- Formulario de alta de renovacion accesible desde ruta directa.
- DOM responsive a viewport movil de `390x844`.
- Formulario renderizado en viewport ancho.
- Comportamiento de ruta `/explore`, que devuelve `404` en el despliegue inspeccionado.

Capturas visuales obtenidas:

- Auth en produccion, desktop.
- Primer viewport del formulario de alta en produccion, desktop.

### Evidencia derivada de `main`

Se revisaron las superficies relevantes:

- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/renewal/[id].tsx`
- `app/renewal/new.tsx`
- `app/modal.tsx`
- `components/AuthScreen.tsx`
- `components/CatalogPicker.tsx`
- `components/RenewalCard.tsx`
- `components/RenewalFilters.tsx`
- `components/NotificationSettings.tsx`
- `components/AttachmentsUploader.tsx`
- `components/EmptyState.tsx`
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/Card.tsx`
- `components/ui/icon-symbol.tsx`
- `constants/theme.ts`
- `constants/airbnb-colors.ts`
- `hooks/useAuth.ts`
- `hooks/useRenewals.ts`
- `hooks/useCustomCatalogs.ts`
- `hooks/use-theme-color.ts`
- `hooks/use-color-scheme.web.ts`
- `lib/calculations.ts`
- `lib/export.ts`
- `lib/supabase.ts`
- `types/renewal.ts`

Se ejecuto `npm run lint` sobre `main`:

- Resultado: `0 errors`, `17 warnings`.
- Las warnings afectan a estado/imports no usados, hook dependencies, variables de error sin usar y al estado de signup no expuesto en `AuthScreen` (`setIsLogin` no usado).

### Limitaciones importantes

No se pudo completar un alta real de usuario con email desde la UI desplegada porque el acceso de produccion inspeccionado no expone una accion visible para cambiar de login a registro por email en el primer flujo. En `main`, `AuthScreen` mantiene estado y callback de signup, pero la superficie actual revisada no muestra el affordance de alta email. La version local que se levanto durante la primera pasada tampoco tenia disponibles `EXPO_PUBLIC_SUPABASE_URL` ni `EXPO_PUBLIC_SUPABASE_ANON_KEY` para completar autenticacion local real.

Por eso:

- Los estados autenticados de home con datos poblados se evaluan principalmente desde `main` y arquitectura.
- El formulario desplegado si se observa de forma real por ruta directa.
- Los hallazgos sobre estados no observados se marcan como derivados de codigo o inferencia.

## 3. Diagnostico Global

### 3.1 Estructura visual

La app esta organizada en pantallas funcionales, pero no en una arquitectura visual coherente:

- `main` ya diferencia layout compacto y layout web grande, pero el home combina header de stack, filtros, resumen flotante, lista, CTA inferior, export, settings y side panel con demasiadas reglas locales.
- El formulario actual usa secciones, chips, catalogo, fechas, adjuntos y datos de pago; la cobertura de dominio es buena, pero no hay una gramatica visual suficientemente clara de "esencial", "opcional" y "avanzado".
- `AIRBNB`, `Colors`, `useThemeColor` y hex locales coexisten. La base de tema no gobierna todo el sistema.
- `app/modal.tsx` sigue siendo una superficie residual de starter.

La consecuencia es que la aplicacion no transmite todavia "producto diseñado como sistema"; transmite "pantallas que funcionan".

### 3.2 Navegacion y arquitectura de pantallas

Hallazgos:

- En `main` el gate de auth vive dentro de `HomeScreen`, no en un limite de navegacion mas explicito. Eso deja mas facil que rutas secundarias tengan reglas distintas.
- En produccion se pudo abrir `/renewal/new` sin pasar por el home autenticado. Aunque guardar pueda fallar despues, mostrar un formulario largo a un usuario no autenticado es un dead end UX si no es una decision de producto muy intencional.
- `app/(tabs)/_layout.tsx` solo registra una tab real. Si tabs existen solo por el starter, añaden complejidad conceptual sin valor.
- `app/modal.tsx` mantiene contenido de starter y no deberia sobrevivir en una superficie de producto final.

### 3.3 Jerarquia visual

La jerarquia actual es inconsistente:

- El home compacto trata el CTA inferior y la pill de KPIs flotante como capas persistentes, mientras filtros y cards necesitan el mismo espacio visual.
- El home desktop si añade side panel de acciones, pero settings/contacto sigue compartiendo contexto con el dashboard operativo.
- En cards de renovacion, nombre, proveedor, coste y estado viven en una fila comprimida. En pantallas pequenas el estado puede comerse ancho del contenido mas importante.
- El formulario actual secciona mucho; eso mejora scanning, pero tambien crea una experiencia larga y pesada si demasiadas opciones avanzadas aparecen antes de que el usuario haya guardado la renovacion minima.

### 3.4 Sensacion premium

Lo premium aqui no deberia significar glassmorphism, gradientes decorativos ni motion superficial. Deberia significar:

- layout estable;
- copy seguro;
- componentes con estados completos;
- densidad controlada;
- contraste fiable;
- defaults inteligentes;
- flujo principal rapido;
- secondary settings sin invadir.

Hoy la app no llega todavia a ese nivel porque:

- muchas decisiones visuales son hard-coded;
- varios estilos siguen alternando entre default iOS, `AIRBNB` web y decisions ad hoc;
- no hay identidad de marca/producto fuerte en auth;
- faltan microestados de foco, error inline, success y skeleton;
- los breakpoints web no parecen modelados como parte del sistema.

## 4. Hallazgos Priorizados

## Critical

No se confirmo un fallo Critical de perdida de datos o bloqueo total con la evidencia alcanzable.

**C0 potencial si no es intencional:** rutas de creacion accesibles sin sesion en produccion. Si el usuario puede invertir tiempo en un formulario largo y descubrir al guardar que no tenia sesion o no puede persistir, el flujo rompe confianza y conversion. Si el formulario anonimo es intencional, debe explicitarse y ofrecer guardado tras login sin perder datos.

## High

### H1. El home ya concentra demasiadas capas de accion y resumen

**Codigo + producto observado.** La experiencia principal mezcla filtros expandibles, lista, posible ahorro, export, CTA de nueva renovacion, resumen flotante expandible, settings/contacto y logout. En desktop parte se mueve a side panel; en compacto varias capas compiten sobre el mismo viewport.

**Impacto:** jerarquia, escaneo, fatiga de uso y claridad de la tarea principal.

### H2. Auth y limites de acceso son inconsistentes

**Observado + codigo.** El home decide auth dentro de la pantalla. Produccion deja ver `/renewal/new` sin haber pasado por acceso. El usuario no recibe una politica clara: que puede explorar, que requiere cuenta y cuando se le pedira sesion.

**Impacto:** confianza, claridad funcional y dead ends.

### H3. No existe sistema de diseño operativo

**Codigo.** `Button`, `Input`, `Card`, pantallas y settings definen colores, radios, sombras, spacing y labels por separado. Hay primitives nominales, pero no tokens ni variantes suficientes.

**Impacto:** drift visual, dark mode inconsistente, refactors caros.

### H4. Accesibilidad e interaccion web estan submodeladas

**Codigo.** Las primitives no exponen foco visible, roles/labels explicitos para icon-only actions, sizes, pressed semantics, invalid state consistente ni hint/error structure reusable. Muchos controles usan `TouchableOpacity` como si movil y web fueran equivalentes.

**Impacto:** keyboard UX, focus discoverability, WCAG basica, calidad percibida desktop.

### H5. Mobile-first real todavia no esta cerrado

**Codigo + formulario observado.** Hay columnas laterales en filas de coste/moneda y segmentos largos de frecuencia/dias; cards de renovacion comprimen contenido y estado en una sola fila; el CTA home queda fijo abajo sin una estrategia documentada de safe areas, teclado y listas largas.

**Impacto:** uso con una mano, wrap, fatiga de formularios, claridad en 320-390 px.

### H6. Persiste deuda de starter y navegacion residual

**Codigo.** `app/modal.tsx` conserva texto de plantilla Expo y el tab layout mantiene una unica tab real. Aunque parte no se exponga, esa deuda mete ruido en el modelo de navegacion.

**Impacto:** profesionalidad, riesgo de exposicion accidental, ruido mental para desarrollo.

## Medium

### M1. Dark mode no es semantico

Hay tema base, pero labels, selected chips, date text, cards resumen, inputs y settings siguen usando colores hard-coded. La app cambia algunos backgrounds, no un sistema entero.

### M2. Los formularios dependen demasiado de alerts

Auth ya presenta banner de error, pero la validacion de renewal sigue usando `Alert.alert`. En web eso se siente pobre, interrumpe contexto y no deja errores pegados al campo.

### M3. Estados de carga, error y exito son pobres

Home tiene spinner central; settings tiene spinner en card; `useRenewals` expone `error` pero home no lo renderiza. Falta diferencia entre loading inicial, refresh, save pending, empty filtered, network error y retry.

### M4. El formulario mezcla configuracion esencial y avanzada

El formulario desplegado observado incluye notificaciones, metodos de aviso, archivos, estado, pago, tags y permanencia en el mismo flujo. Es potente, pero para alta rapida puede intimidar si no se colapsa o progressive-disclose.

### M5. Iconografia no esta cerrada

`IconSymbol` necesita seguir auditado como contrato: el dominio usa muchos nombres de SF Symbols, varias llamadas se fuerzan con `as any`, y la consistencia de iconos web/iOS depende de que el mapping no se quede atras.

### M6. El resumen financiero gano datos, pero no criterio de prioridad

Home ya calcula mensual, anual, proximas a 30 dias, categoria mas cara y posibles ahorros. El problema ahora es compositivo: la pill flotante y el bloque de ahorro no explican que mirar primero, no cubren moneda mixta/tendencia y pueden convertirse en ruido si la lista requiere atencion.

### M7. List scanning puede fallar con nombres largos

La card actual trunca nombre y proveedor, y el estado de vencimiento tiene un bloque propio a la derecha. En movil se prioriza un texto relativo largo frente a coste y nombre.

## Low

- Copy y capitalizacion mezclan tono iOS y tono SaaS.
- `+ Añadir Renovación` usa signo en el copy en vez de icono/jerarquia de boton.
- Labels obligatorios con `*` no tienen convencion de helper/error asociada.
- Margenes de `Card` estan embebidos en el componente; eso limita composicion.
- Hay sombras/elevation de estilo distinto segun pantalla.
- Algunos warnings de lint muestran deuda pequeña pero real.

## 5. Auditoria UX/UI por Area

### 5.1 Auth

**Lo que funciona**

- El acceso desplegado es simple y muy legible en desktop.
- Las opciones social y email son faciles de identificar.
- La superficie no esta saturada.

**Lo que falla**

- Falta una señal de producto fuerte: que datos guardo, que valor obtengo al entrar, por que confiar.
- En el despliegue inspeccionado no se ve registro por email ni aclaracion de como crear cuenta, aunque `AuthScreen` conserva estado/callback de signup.
- La pantalla se parece a un auth shell generico. No vende ni prepara el trabajo del usuario.
- El formulario ya mezcla OAuth, banners y email, pero no termina de decidir la jerarquia entre entrar, registrarse y confiar en el producto.

**Mejora**

- Encabezado de auth con nombre del producto, categoria clara y promesa corta.
- Login y signup con separacion clara si email signup existe.
- SSO como primary cuando sea la via recomendada; email debajo con copy claro.
- Errores inline para email/password.
- Password manager/autocomplete y keyboard flow revisados en web.

### 5.2 Home / Dashboard

**Lo que funciona**

- Flujo base: lista, resumen y CTA.
- Empty state existe.
- Refresh esta contemplado.

**Lo que falla**

- El home ya calcula KPIs y posibles ahorros, pero no diferencia con suficiente calma informacion operativa "que vence pronto" de resumen financiero y acciones de administracion.
- Settings/contacto aparece como expansion desde el dashboard; eso mezcla datos de configuracion y trabajo operativo.
- Header actions son demasiado crudas: un emoji de engranaje y `Salir` destructivo compiten con la tarea principal.
- El CTA inferior y la summary pill son utiles en movil, pero deben convivir con teclado, safe area, filtros y scrolling largo.

**Mejora**

- Home como dashboard compacto:
  - header con saludo/product title y menu de cuenta;
  - metric row sobria;
  - seccion "Proximas" y seccion "Todas";
  - CTA flotante o bottom action solo en movil;
  - CTA toolbar en desktop.
- Settings en screen/modal dedicada.
- Filtros y search solo cuando la lista lo justifique, no antes.

### 5.3 Renewal Card

**Lo que funciona**

- Icono por tipo/color ayuda scanning.
- Coste/frecuencia y vencimiento estan presentes.

**Lo que falla**

- Estado de vencimiento como texto largo a la derecha puede robar ancho.
- Color del estado depende demasiado de rojo/naranja/verde; no hay badge/label semantico robusto.
- No hay states de hover/focus/pressed web mas alla de opacity.

**Mejora**

- Card mobile con dos filas:
  - fila 1: icono, nombre, menu/chevron;
  - fila 2: proveedor opcional, coste, badge de vencimiento.
- Badge con texto corto: `Hoy`, `3 dias`, `Vencida`, `30+ dias`.
- Focus ring visible y target minimo 44 px.

### 5.4 Formulario de Renovacion

**Lo que funciona**

- Secciones logicas claras.
- Tipo, frecuencia, moneda y color usan controles de seleccion rapidos.
- La produccion observada ya contempla muchos atributos de dominio.

**Lo que falla**

- Renewal validation va por alerts y el formulario actual tiene riesgo de ser demasiado largo.
- Segmentos con muchas opciones pueden romper o apretarse en movil.
- "Notas", notificaciones y opciones avanzadas no tienen jerarquia de esencial vs opcional.
- Fecha, coste y frecuencia deberian sentirse como el nucleo; el resto no deberia competir.

**Mejora**

- Formulario en dos niveles:
  - **Basico:** nombre, coste, frecuencia, fecha, tipo/provider.
  - **Opcional:** recordatorios, pago, tags, archivos, permanencia, notas.
- Sticky action footer en movil con `Guardar`.
- Autosave draft solo si el producto lo necesita; como minimo conservar draft si auth aparece al final.
- Error inline y summary de error si hay varios campos.

### 5.5 Notification Settings

**Lo que funciona**

- El componente cubre metodo, toggle y datos requeridos.
- Hay CTA para test notification.

**Lo que falla**

- Vive dentro de un card toggled desde home, no como flujo claro de settings.
- Ayuda de WhatsApp y Telegram es tecnica y larga.
- No hay estado guardado visible persistente mas alla de alert.
- El metodo y el toggle pueden contradecirse mentalmente: metodo distinto de `none` pero notifications disabled.

**Mejora**

- Settings screen con status row: `Recordatorios desactivados` / `Email activo`.
- Canal elegido y estado activo como una misma decision.
- Helper copy orientada a completar setup, con disclosure para instrucciones tecnicas.
- Inline success, test state, disabled test CTA hasta datos validos.

### 5.6 Empty, Loading, Error

**Lo que funciona**

- Hay empty state.
- Hay spinners para initial loading.

**Lo que falla**

- Empty state no incluye CTA integrado aunque CTA inferior exista.
- No hay skeleton ni content-preserving refresh.
- Error de `useRenewals` no aparece en home.

**Mejora**

- Empty state con CTA y ejemplo de dato.
- Skeleton card list para carga inicial.
- Inline error banner con retry.
- Toast/snackbar para save success; field errors para validation.

## 6. Mobile-First Real

### Hallazgos

- Targets minimos de `Button` son razonables (`minHeight: 44`), pero chips/options no tienen una regla de minimo tactil.
- Los rows de seleccion con cinco opciones (`Frecuencia`, dias antes) se vuelven delicados a 320-390 px.
- Card y status en una sola fila penalizan names largos.
- El formulario largo exige pensar en sticky save, scroll restoration, keyboard avoidance y safe-area bottom.
- Settings en home no es ergonomico con una mano si empuja la lista y cambia el contexto.

### Reglas recomendadas

- Touch target minimo: `44x44`, preferido `48x48`.
- Padding horizontal mobile: `16`.
- Gap base mobile: `8` o `12`; section gap: `20` o `24`.
- Nunca depender de hover para informacion necesaria.
- Segmented controls de mas de 3-4 opciones deben envolver con criterio o convertirse en chips/grid/menu.
- Acciones destructivas fuera del flujo principal y lejos del CTA de guardado.
- CTA persistente con safe area solo cuando la accion sea la tarea principal actual.

## 7. Accesibilidad Basica

### Riesgos

- Icon-only action `⚙️` en home no modela label accesible.
- Focus web no esta definido en primitives.
- Color comunica mucho estado por si solo.
- Selected chips usan contraste dependiente de tonos hard-coded.
- Alerts reemplazan errores inline.
- `TextInput` labels no se conectan semanticamente en una primitive web-equivalent.

### Minimo exigible

- Focus ring visible en botones, fields, cards clicables y chips.
- `accessibilityLabel` / names de controls icon-only.
- Error text cercano al campo y `aria`/accessibility invalid semantics donde aplique.
- Contraste AA en texto, placeholder secundario y selected states.
- Estado no solo por color: label, icono o forma.

## 8. Copy UX

### Problemas actuales

- Textos correctos pero genericos.
- Auth no termina de hacer visible el paso de login a signup por email.
- `Error` repetido en alerts sin contexto.
- Algunas ayudas son tecnicas antes de ser humanas.

### Propuestas concretas

| Actual | Propuesta |
|---|---|
| `Bienvenido` | `Gestiona tus renovaciones` |
| `Inicia sesión para gestionar tus renovaciones` | `Ten a mano fechas, costes y recordatorios antes de que renueven.` |
| `Sin renovaciones` | `Aun no tienes renovaciones` |
| `Añade tu primera renovación...` | `Empieza con un seguro, suscripcion o licencia. Tarda menos de un minuto.` |
| `+ Añadir Renovación` | `Nueva renovacion` |
| `Crear renovación` | `Guardar renovacion` si la accion persiste; `Crear renovacion` si el acto de alta es el modelo mental principal |
| `No se pudo guardar la renovación` | `No hemos podido guardar la renovacion. Revisa tu conexion y vuelve a intentarlo.` |
| `Activar notificaciones` | `Recibir recordatorios` |
| `Enviar notificación de prueba` | `Probar aviso` |

### Reglas de copy

- Botones con verbo y resultado.
- Placeholder como ejemplo, no sustituto del label.
- Errors con causa o proximo paso.
- Empty states con contexto, CTA y expectativa.
- Menos uppercase funcional si no aporta scanning.

## 9. Componentes

### Duplicados e inconsistencias

- Inputs aparecen como primitive (`Input`) y como `TextInput` custom dentro de auth/settings.
- Toggles se repiten en renewal form y notification settings.
- Chips/segmentos para metodo, tipo, frecuencia, currency y days comparten patron pero no componente.
- Card impone margenes globales aunque a veces la composicion deberia decidirlos.
- Labels, help text y error text no estan unificados en `Field`.

### Componentes recomendados

- `Screen`: safe area, background, max width y spacing por breakpoint.
- `ScreenHeader`: title, subtitle, primary/secondary actions.
- `Field`: label, required, hint, error.
- `Input`, `MoneyInput`, `DateField`.
- `Button`: sizes, variants, icon, loading, fullWidth.
- `IconButton`: accessible label obligatorio.
- `SegmentedControl` para maximo 3-4 opciones.
- `ChoiceChipGroup` para wrap responsive.
- `SwitchRow`.
- `MetricTile`.
- `StatusBadge`.
- `RenewalListItem` y `RenewalCard` solo si ambas densidades aportan valor.
- `EmptyState`, `InlineBanner`, `SkeletonList`, `Toast`.

## 10. Sistema de Diseño Propuesto

### 10.1 Tokens

```ts
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
};
```

### 10.2 Colores semanticos

No diseñar alrededor de hex sueltos por pantalla. Usar roles:

- `bg.canvas`
- `bg.surface`
- `bg.surfaceRaised`
- `text.primary`
- `text.secondary`
- `text.muted`
- `border.subtle`
- `border.strong`
- `accent.primary`
- `accent.primaryPressed`
- `status.success`
- `status.warning`
- `status.danger`
- `status.info`
- `focus.ring`

La paleta puede mantener un acento azul/teal serio, pero el producto no deberia depender de un solo azul para resumen, actions, selected states y links.

### 10.3 Tipografia

| Rol | Mobile | Desktop | Uso |
|---|---|---|---|
| Display | 28/34 | 32/38 | auth/product heading escaso |
| H1 | 24/30 | 28/34 | pantalla |
| H2 | 20/26 | 22/28 | seccion |
| H3 | 17/22 | 18/24 | card title |
| Body | 15/22 | 16/24 | lectura base |
| Meta | 13/18 | 13/18 | hints/status |
| Label | 14/18 | 14/18 | form labels |

Usar weight por jerarquia, no subir todo a bold.

### 10.4 Layout

- Mobile content padding: `16`.
- Tablet content max width: `720`.
- Desktop dashboard max width: `1040-1120`.
- Desktop form max width: `680-760`.
- Breakpoints conceptuales:
  - compact: `< 600`
  - medium: `600-959`
  - wide: `>= 960`
- Home wide puede usar summary + list con aside solo si el aside tiene valor; no inflar cards.
- Forms wide deben centrarse, no estirarse.

### 10.5 Botones

- Sizes:
  - `sm`: 36-40 high.
  - `md`: 44 high.
  - `lg`: 48-52 high.
- Variants:
  - `primary`
  - `secondary`
  - `ghost`
  - `danger`
  - `link`
- States:
  - default, hover web, pressed, focus-visible, loading, disabled.

### 10.6 Fields

- Labels siempre visibles.
- Placeholder como ejemplo.
- Hint y error reservan semantica.
- Required con regla unica: label + helper general o required marker consistente.
- Money/date inputs deben tener affordance propio.

### 10.7 Cards y sombras

- Cards para elementos repetidos y panels reales.
- Sections de pagina no deben ser cards por defecto.
- Una sola politica de elevation:
  - default surface: border only.
  - raised/action surface: shadow suave.
  - modal: elevation superior.

## 11. Propuesta Visual Global

La direccion recomendada:

- **Calma financiera utilitaria:** superficies limpias, informacion clara, decisiones seguras.
- **Densidad moderada:** mas compacta que una landing, mas respirada que una tabla operativa.
- **Color funcional:** acento para accion y foco; estados temporales con badges y tonos semanticos.
- **Mobile premium:** forms cortos por defecto, bottom actions claras, cards escaneables con el pulgar.
- **Desktop adulto:** content max-width, actions en toolbar, foco y hover reales, no un movil gigante centrado.

Referencias de sensacion, no de copia visual: gestor personal con disciplina SaaS, no banca recargada ni app iOS default.

## 12. Quick Wins

1. Eliminar o esconder rutas y contenido residual de starter (`modal`, tabs residuales) que no sean producto.
2. Separar settings de home.
3. Cambiar header actions: `IconButton` accesible para settings/account; `Salir` dentro de menu/account.
4. Unificar `Input` y `TextInput` sueltos bajo `Field`.
5. Renderizar error de `useRenewals` en home con retry.
6. Sustituir alerts de validation por inline field errors.
7. Hacer `Card` sin margenes embebidos y mover spacing al layout.
8. Definir tokens de spacing/radius/color y migrar primitives primero.
9. Corregir icon mapping web antes de añadir mas iconografia.
10. Reducir primera version del formulario a campos esenciales y colapsar advanced sin perder catalogo, adjuntos y configuracion avanzada cuando ya aportan valor.

## 13. Mejoras Pantalla por Pantalla

### Auth

- Marca/product title.
- Ruta clara para crear cuenta.
- Inline errors.
- Social auth order segun estrategia real.
- Helper de privacidad/trust corto si aporta.

### Home

- Dashboard hierarchy: title, metrics, upcoming renewals, all renewals.
- Account/settings fuera del header destructivo.
- Empty state con CTA.
- Retry/error banner.
- Desktop max width.

### Renewal Form

- Basic first.
- Advanced disclosure.
- Field groups.
- Sticky save en compact.
- Inline validation.
- Delete en edit only, segregado.

### Settings

- Screen dedicada.
- Estado actual visible.
- Canal + datos + test flow.
- Helpers progresivos.

## 14. Propuestas de Codigo

### 14.1 Tokens y tema

```ts
export const lightTheme = {
  color: {
    canvas: '#F6F7F9',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF2F6',
    text: '#15181D',
    textSecondary: '#5D6672',
    border: '#DCE2EA',
    accent: '#1769E0',
    focus: '#0B63F6',
    danger: '#D92D20',
    warning: '#DC6803',
    success: '#079455',
  },
  space,
  radius,
};
```

### 14.2 Field

```tsx
type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
};

export function Field({ label, hint, error, required, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}{required ? ' *' : ''}
      </Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}
```

### 14.3 Button evolution

```tsx
<Button
  size="lg"
  variant="primary"
  icon="plus"
  fullWidth={isCompact}
  loading={saving}
  title="Guardar renovacion"
  onPress={handleSave}
/>
```

### 14.4 Layout wrapper

```tsx
export function Screen({ children, kind = 'dashboard' }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.body, kind === 'form' ? styles.formWidth : styles.dashboardWidth]}>
        {children}
      </View>
    </SafeAreaView>
  );
}
```

### 14.5 Arquitectura visual

- No migrar a Tailwind/NativeWind solo por moda.
- Si se mantiene React Native StyleSheet, centralizar tokens y component variants.
- Si se adopta una utility layer, hacerlo despues de fijar primitives, no antes.
- Este proyecto no es Nuxt; las propuestas deben vivir en Expo Router/React Native Web.

## 15. Plan de Refactor Visual por Fases

### Fase 0. Cerrar contratos de flujo

- Confirmar que produccion sale de `main` y que auth/formulario publicados son la fuente de verdad.
- Definir politica de auth para rutas de alta/edicion y signup email.
- Definir qué requiere sesion.
- Quitar starter noise.

### Fase 1. Fundaciones

- Tokens semanticos.
- Theme light/dark.
- Spacing/radius/elevation.
- `Screen` y width rules.

### Fase 2. Primitives

- `Button`, `IconButton`, `Field`, `Input`, `Card`, `SwitchRow`, chip groups, badges.
- States web/mobile.
- Accessibility labels and focus.

### Fase 3. Refactor de flujos principales

- Auth.
- Home/list/empty/error.
- Renewal create/edit mobile first.
- Settings/notifications.

### Fase 4. Responsive y QA

- Viewports compact, medium, wide.
- Keyboard nav.
- Dark mode.
- Long names, low data, dense data.
- Loading/error/success QA.

### Fase 5. Pulido de producto

- Microinteracciones utiles.
- Skeletons.
- Better temporal status.
- Search/filter only if data volume justifies it.
- Copy polish and analytics of friction points.

## 16. Backlog Inicial Recomendado

### Sprint visual 1

- Auth/routing policy.
- Limpieza de superficies residuales.
- Tokens + primitives.
- Home empty/error/CTA.

### Sprint visual 2

- Renewal form basic/advanced.
- Renewal card/list scanning.
- Settings screen.
- Dark and responsive QA.

### Sprint visual 3

- Polished feedback states.
- Copy system.
- Product metrics and temporal summaries.
- Accessibility QA fixes.

## 17. Conclusion

RenovacionesApp tiene buen scope para volverse muy agradable: el problema a resolver es concreto y el usuario vuelve por fechas, dinero y tranquilidad. Para que se sienta premium, el siguiente paso no es pintar botones al azar. Es **cerrar auth/routing, formalizar primitives y rediseñar los dos flujos que mas pesan en movil: home/listado y alta/edicion**.

Cuando eso este bien, el resto del pulido visual dejara de ser maquillaje y empezara a acumular valor.
