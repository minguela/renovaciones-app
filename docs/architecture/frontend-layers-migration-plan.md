# Renovaciones App — Migración a Clean Architecture (Expo/React Native)

## Baseline

- Expo 54, React Native 0.81.5, React 19.1.0
- 6 pantallas (tabs, settings, renewal CRUD)
- API layer ya separada (`api/`)
- Hooks existentes (`hooks/useAuth`, `useRenewals`, `useCustomCatalogs`)
- Componentes UI organizados

## Arquitectura objetivo (equivalente a Frontend Layers)

```
src/
  domain/         — entidades (Renewal, Catalog, User)
  application/    — casos de uso (listRenewals, createRenewal, etc.)
  infrastructure/ — repositorios (renewalRepository, catalogRepository)
  hooks/          — controladores de presentación (existente, adaptado)
  components/     — UI components (existente, sin cambios)
```

## Cambios realizados

- Creado `src/domain/entities.ts` con tipos del dominio
- Creado `src/infrastructure/repositories.ts` con repositorios tipados
- Creado `src/application/use-cases.ts` con casos de uso
- Los hooks existentes pueden migrarse progresivamente para usar casos de uso

## Próximos pasos

- Migrar `hooks/useRenewals` para usar `listRenewalsUseCase`
- Migrar `hooks/useCustomCatalogs` para usar `listCatalogsUseCase`
- Mantener compatibilidad con API layer existente
