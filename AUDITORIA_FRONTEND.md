# Auditoría de Consistencia y Buenas Prácticas — Frontend

**Alcance:** inspección estática de `src/` y ejecución de `pnpm lint` (12-08-2026). No se modificó código fuente. El lint falla con **11 errores**.

## Alta severidad — seguridad, flujo y bloqueo de calidad

- [ ] **[Acceso] Implementar autorización por rol real.** `src/router/ProtectedRoute.tsx:5-22` únicamente valida `isAuthenticated`; nunca consulta `user.rol`. `src/components/layout/Sidebar.tsx:27-39, 63` sólo muestra “PANEL ADMIN/TÉCNICO”. Actualmente un Técnico puede abrir directamente `/usuarios`, `/ubicaciones` y cualquier ruta protegida registrada. Crear guard reutilizable con `allowedRoles` y mantener la validación definitiva en Spring Security.

- [ ] **[Redirección/QR] Conservar el destino solicitado en Login.** `src/router/ProtectedRoute.tsx:8-10` redirige a `/login` sin `state={{ from: location }}`. `src/pages/Login.tsx:28-32` siempre navega a `/cambiar-contrasena` o `/dashboard`, por lo que no retorna a una URL de QR o a una ruta protegida previamente solicitada. Además, no existe ruta de captura pública para UUID. Definir una ruta como `/assets/:qrUuid`, preservar `pathname + search` y restaurarlo después de login/cambio de contraseña.

- [ ] **[Rutas rotas] Corregir destinos inexistentes.** `src/pages/Login.tsx:31`, `src/pages/CambiarContrasena.tsx:43` y `src/router/ProtectedRoute.tsx:19` navegan a `/dashboard`, pero `src/router/index.tsx` no la declara; cae en `*` y termina en `/equipos`. `src/components/layout/Sidebar.tsx:105,127` enlaza `/categorias` y `/configuracion`, que tampoco existen. Declarar páginas/rutas o retirar los enlaces y usar un único destino post-login válido.

- [ ] **[Duplicación/efecto] Eliminar la doble carga de ubicaciones.** `src/components/ui/ModalCrearEquipo.tsx:31-45` y `:50-64` son dos `useEffect` equivalentes disparados con `isOpen`; cada apertura produce dos `GET /maintenances/locations`, estados duplicados y logs repetidos. Conservar una única carga, con cancelación si aplica.

- [ ] **[Token JWT] Endurecer el ciclo de sesión.** `src/context/AuthContext.tsx:24-51` y `src/services/api.ts:10-17` persisten y leen el JWT desde `localStorage`, lo que permite persistencia tras recarga, pero no hay comprobación de expiración, refresh token, interceptor de respuesta `401/403`, limpieza automática ni estrategia ante XSS. Acordar con backend refresh token en cookie `HttpOnly`/`Secure`/`SameSite`, renovar el access token o cerrar sesión de forma controlada. Evitar que el frontend sea la autoridad de permisos.

- [ ] **[Lint bloqueante] Eliminar `any` explícitos (5).** El lint falla por `@typescript-eslint/no-explicit-any` en:
  - `src/components/layout/Sidebar.tsx:15` (`nombreCompleto?: any`) y `:27` (`rol?: any`). El contrato ya define `User.rol: string`; tipar parámetros como `string | undefined` o un tipo de respuesta backend explícito.
  - `src/pages/Login.tsx:33`, `src/pages/CambiarContrasena.tsx:45`, `src/components/ui/ModalCrearUsuario.tsx:63` (`catch (err: any)`). Usar `unknown` + type guard/AxiosError tipado y un normalizador de errores.

## Media severidad — consistencia, mantenibilidad y experiencia

- [ ] **[Nomenclatura/idioma] Planificar refactorización integral del dominio a inglés.** El código fuente mezcla tipos/identificadores en español con React, Axios y endpoints en inglés. Renombrar de forma atómica archivos, exportaciones, imports, rutas y contratos (manteniendo adaptadores de DTO si Spring Boot conserva JSON en español).

  | Ruta actual | Elementos en español a renombrar (propuesta) |
  |---|---|
  | `src/pages/CambiarContrasena.tsx` | archivo/componente `CambiarContrasena` → `ChangePassword`; `nuevaContrasena`, `confirmarContrasena`, `cargando` → `newPassword`, `confirmPassword`, `isLoading`; textos y comentarios en español. |
  | `src/pages/Equipos.tsx` | archivo/componente `Equipos` → `Assets`/`Equipment`; `equipos`, `cargando`, `cargar`, `datos`, `equipo` → `assets`, `isLoading`, `loadAssets`, `data`, `asset`; comentarios/textos en español. |
  | `src/pages/Ubicaciones.tsx` | archivo/componente `Ubicaciones` → `Locations`; `ubicaciones`, `ubicacionAEditar`, `ubicacionAEliminar`, `eliminando`, `cargar`, `handleNuevaUbicacion`, `handleEditar`, `handleConfirmarEliminar` → equivalentes ingleses; comentarios/textos en español. |
  | `src/pages/Usuarios.tsx` | archivo/componente `Usuarios` → `Users`; `usuarios`, `cargando`, `cargar`, `datos`, `usuario` → equivalentes ingleses; comentarios/textos en español. |
  | `src/pages/Login.tsx` | `correo`, `contrasena`, `cargando`, `usuario` → `email`, `password`, `isLoading`, `user`; comentario en español y textos UI. |
  | `src/services/auth.service.ts` | `contrasena`, `usuario`, `CambiarContrasenaPayload`, `usuarioId`, `nuevaContrasena`, `cambiarContrasenaService` → `password`, `user`, `ChangePasswordPayload`, `userId`, `newPassword`, `changePasswordService`. |
  | `src/services/usuarios.service.ts` | archivo y funciones `obtenerUsuarios`, `crearUsuario`, `datos` → `users.service.ts`, `getUsers`, `createUser`, `data`. |
  | `src/services/equipos.service.ts` | archivo y funciones `obtenerEquipos`, `crearEquipo`, `datos` → `assets.service.ts`/`equipment.service.ts`, `getAssets`, `createAsset`, `data`; comentario en español. |
  | `src/services/ubicaciones.service.ts` | archivo y funciones `obtenerUbicaciones`, `obtenerUbicacionPorId`, `crearUbicacion`, `actualizarUbicacion`, `eliminarUbicacion`, `datos` → `locations.service.ts`, `getLocations`, `getLocationById`, `createLocation`, `updateLocation`, `deleteLocation`, `data`; comentario en español. |
  | `src/services/roles.service.ts` | archivo/función `obtenerRoles` → `roles.service.ts`/`getRoles`. |
  | `src/types/Usuario.ts` | archivo y `UserResponse`/`CreateUserDTO` dependen de JSON español: consolidar como `User`, `CreateUserDto` y mapear `nombre`, `correo`, `contrasena`, `rolId` a contrato backend si no se migra API. |
  | `src/types/Equipo.ts` | archivo/tipos `Equipo`, `CrearEquipoDTO`, campos `codigoInventario`, `fechaAdquisicion`, `ubicacion` → `Asset`, `CreateAssetDto`, `inventoryCode`, `acquisitionDate`, `location`. |
  | `src/types/Ubicacion.ts` | archivo/tipos `Ubicacion`, `CrearUbicacionDTO`, `edificio` → `Location`, `CreateLocationDto`, `building`. |
  | `src/types/Rol.ts` | archivo/tipo `Rol`, `nombre`, `descripcion` → `Role`, `name`, `description`. |
  | `src/context/AuthContext.tsx` | propiedad de contrato `debeCambiarContrasena`, parámetro `debeCambiar`, `updatedUser` contiene clave española; cambiar a `mustChangePassword` internamente o mapear respuesta API. |
  | `src/router/ProtectedRoute.tsx`, `src/router/index.tsx` | ruta `/cambiar-contrasena` y comentarios en español → `/change-password`; actualizar imports de página. |
  | `src/components/layout/Sidebar.tsx` | utilidades `obtenerNombreCorto`, `obtenerEtiquetaPanel`, `obtenerIniciales`, variables `nombreMostrar`, `etiquetaPanel`, `rolTexto`; comentarios en español. |
  | `src/components/ui/ModalCrearUsuario.tsx` | archivo/componente/props `ModalCrearUsuario`, `onUsuarioCreado`; estado `contrasena`, `rolId`, `cargandoRoles`, `guardando`; textos UI en español. |
  | `src/components/ui/ModalCrearEquipo.tsx` | archivo/componente/DTO/props `ModalCrearEquipo`, `CrearEquipoDTO`, `onEquipoCreado`; `guardando`, `ubicaciones`, `cargandoUbicaciones`; comentarios y log en español. |
  | `src/components/ui/ModalUbicacion.tsx` | archivo/componente/props `ModalUbicacion`, `onUbicacionGuardada`, `ubicacionAEditar`; comentarios, mensajes y labels en español. |
  | `src/components/ui/ModalConfirmar.tsx` | archivo/componente/props `ModalConfirmar`, `titulo`, `mensaje`, `cargando`; textos y comentarios en español. |

  `src/main.tsx`, `src/services/api.ts`, `src/components/layout/AppLayout.tsx`, `Navbar.tsx`, `Footer.tsx`, `src/components/ui/DataTable.tsx`, `src/index.css` y configuraciones no exponen identificadores de dominio en español (aunque `Footer.tsx` contiene texto institucional). Los literales visibles al usuario pueden permanecer en español por requisito de producto; la prioridad es unificar nombres de código y contrato interno.

- [ ] **[Casing] Normalizar convenciones.** Los componentes/exportaciones React usan PascalCase y handlers/servicios camelCase, correctamente en general. Inconsistencias: `UserResponse` frente a `User` duplica semántica; `CreateUserDTO`/`CrearEquipoDTO`/`CrearUbicacionDTO` mezclan idioma y `DTO` en mayúscula; `Props` es genérico en `ModalCrearEquipo.tsx`, `ModalUbicacion.tsx` y `ModalConfirmar.tsx`. Adoptar `ComponentNameProps` y un único sufijo (`Dto` o `DTO`) para todos.

- [ ] **[Estado] Reducir carga manual repetida y errores invisibles.** `src/pages/Equipos.tsx:11-26`, `src/pages/Usuarios.tsx:11-26`, `src/pages/Ubicaciones.tsx:17-33`, `src/components/ui/ModalCrearEquipo.tsx:31-64`, `src/components/ui/ModalCrearUsuario.tsx:24-32` repiten `useState`/`useEffect`, flags y `console.error`. React Query ya está instalado: usar queries/mutations por recurso, invalidación y un adaptador común de error. No se detectó mezcla Axios/fetch: todo el HTTP actual usa Axios.

- [ ] **[Lint] Resolver actualizaciones de estado dentro de efectos.** El lint marca `react-hooks/set-state-in-effect` en `src/pages/Equipos.tsx:25`, `src/pages/Usuarios.tsx:25`, `src/pages/Ubicaciones.tsx:32`, `src/components/ui/ModalCrearUsuario.tsx:26` y `src/components/ui/ModalUbicacion.tsx:37`. Revisar el patrón de carga/sincronización; React Query o inicialización derivada/por key de modal elimina parte de estos efectos.

- [ ] **[Lint/Fast Refresh] Separar el hook de contexto.** `src/context/AuthContext.tsx:71` exporta `useAuth` junto al componente `AuthProvider`, incumpliendo `react-refresh/only-export-components`. Extraer el contexto/hook a `src/hooks/useAuth.ts` o desactivar la regla sólo con justificación.

- [ ] **[Errores] Centralizar normalización y UX de errores.** `console.error` sin aviso de interfaz está en `src/pages/Equipos.tsx:18`, `Usuarios.tsx:18`, `Ubicaciones.tsx:25,56`, `src/components/ui/ModalCrearEquipo.tsx:37,40,58,82` y `ModalUbicacion.tsx:70`. Hay tratamiento local parcial en Login, cambio de contraseña y creación de usuario. Definir `ApiError`/`getErrorMessage` y un mecanismo UI consistente.

## Baja severidad — limpieza y coherencia visual/arquitectónica

- [ ] **[Componente sin integración] Evaluar o retirar `src/components/ui/DataTable.tsx`.** No hay importación/uso detectado en `src/`; las tres páginas renderizan tablas HTML manualmente. Convertirlo en tabla genérica usada por `Equipos`, `Usuarios` y `Ubicaciones`, o eliminarlo si no aporta valor.

- [ ] **[Mensajes/debug] Retirar logging de desarrollo.** `src/components/ui/ModalCrearEquipo.tsx:37` tiene `console.log("UBICACIONES DESDE BACKEND:", data)` y comentario con emoji. Mantener observabilidad mediante una capa/logger configurado, no logs de datos en producción.

- [ ] **[Tipos HTTP] Completar genéricos Axios.** `src/services/equipos.service.ts:8` usa `api.get("/maintenances/assets")` sin `<Equipo[]>`; los otros listados sí tienen genérico. Homogeneizar todas las operaciones para detectar desajustes backend/frontend en compilación.

- [ ] **[Rutas/UX móvil] Revisar navegación responsive.** `src/components/layout/AppLayout.tsx:7` y `Sidebar.tsx:73` usan sidebar fijo `w-64 h-screen`; no hay control para ocultarlo/abrirlo en móvil. Es relevante para el caso QR en teléfono.

- [ ] **[Fuente de verdad] Alinear el estado de API mostrado.** `src/components/layout/Footer.tsx:8` anuncia “API Railway Conectada”, mientras `src/services/api.ts:5` usa `http://localhost:8080` y Railway está comentado. Sustituir el texto estático por configuración de entorno/estado real.

## Secuencia sugerida de limpieza

1. Corregir guard de roles, ruta/retorno QR y destinos inexistentes.
2. Eliminar doble request, `any`, logs y los 11 errores de lint; exigir `pnpm lint` verde.
3. Centralizar HTTP/errores y consultas con React Query; añadir interceptor 401 y estrategia JWT acordada con backend.
4. Ejecutar el cambio de idioma por dominio (tipos → servicios → componentes → rutas), con DTO mappers para no romper Spring Boot.
5. Consolidar tablas, completar responsive móvil y retirar módulos/enlaces no implementados.
