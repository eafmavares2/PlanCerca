# PlanCerca

PlanCerca es un prototipo móvil para organizar una rutina personal de bienestar con módulos de fuerza, nutrición, hidratación y cardio. La definición del producto aún debe ser validada por el equipo antes de entregar.

## Ejecutar

Requisitos: Node.js y npm instalados. Instala dependencias y levanta Expo:

```bash
npm ci
npx expo start
```

`npx start` no inicia Expo; usa `npx expo start`. Abre la app con Expo Go compatible con Expo SDK 58 y escanea el QR desde un celular conectado a la misma red. La comprobación en un teléfono físico sigue pendiente hasta hacer esa demo en el dispositivo del equipo.

## Flujo disponible

- Inicio de sesión y registro con validación local de correo, nombre y longitud mínima de contraseña.
- Navegación entre acceso, registro e inicio.
- Inicio con una `FlatList` alimentada por datos locales.
- Pantallas separadas para Fuerza, Nutrición, Hidratación y Cardio, cada una con CRUD de registros.
- Barra inferior y deslizamiento horizontal para cambiar de pantalla.
- Cierre de sesión que vuelve al acceso.

El CRUD usa estado local compartido durante la sesión. Los cambios se mantienen al cambiar de sección, pero se reinician al cerrar la app. La autenticación es simulada: no existe backend ni creación de usuario real. No uses credenciales reales.

## Estructura

- `src/App.js`: navegación de autenticación con React Navigation.
- `src/screens/LoginScreen.js`: acceso y validación de formulario.
- `src/screens/RegisterScreen.js`: registro y validación de formulario.
- `src/screens/HomeScreen.js`: lista local, secciones y navegación inferior/deslizante.
- `src/screens/DashboardScreen.js`: resumen de secciones y conteos.
- `src/screens/StrengthScreen.js`, `NutritionScreen.js`, `HydrationScreen.js` y `CardioScreen.js`: pantallas independientes de módulo.
- `src/components/SectionCrudScreen.js`: interfaz compartida para crear, leer, editar y eliminar.
- `src/data/fitness-sections.js`: registros iniciales y etiquetas locales.
- `src/app/`: pantallas del template de Expo Router; no se usan como punto de entrada en este prototipo.
- `docs/definicion-producto.md` y `docs/definicion-producto.pdf`: borrador B1/B2, mapa y bocetos.
- `docs/registro-uso-ia.md` y `docs/registro-uso-ia.pdf`: registro parcial de IA para completar con el resto del período.

## Estado de la entrega 1

| Criterio | Estado actual |
| --- | --- |
| Tres o más pantallas navegables | Implementadas: Acceso, Registro e Inicio, con cuatro vistas de sección. |
| Componentes, estilos, imagen y campos | Implementados; revisar la carga de la imagen con conectividad en el dispositivo. |
| Estado con `useState` | Implementado en autenticación, formularios y selección de sección. |
| `FlatList` con datos locales | Implementada en Inicio. |
| Navegación entre pantallas | Implementada en la app; falta validar en celular físico. |
| Definición del producto y mapa | Borrador Markdown y PDF en `docs/`; confirmar con el equipo y revisar con la plantilla oficial. |
| Registro de IA | Registro Markdown y PDF parcial en `docs/`; añadir las demás interacciones del período. |
| Repositorio y commits del equipo | Requiere publicar/verificar el repositorio y que cada integrante registre sus propios commits. |
| Demo en celular físico y sustentación | Pendientes de realizar por el equipo. |

## Antes de entregar

1. Confirmen que la definición del producto refleja la idea real del equipo y completen nombres y datos faltantes.
2. Revisen los PDF de `docs/` y adapten su contenido a las plantillas oficiales B1/B2 y A3.
3. Prueben registro, validaciones, navegación, gestos y cierre de sesión en el celular físico con la versión compatible de Expo Go.
4. Publiquen el repositorio y revisen permisos, historial de commits de cada integrante y que ningún `.env` ni secreto se haya subido.
5. Ensayen una sustentación de cinco minutos; cada integrante debe poder explicar su pantalla y el estado usado.
