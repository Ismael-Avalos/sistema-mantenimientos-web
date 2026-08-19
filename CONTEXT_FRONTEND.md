# Contexto Frontend — Sistema de Mantenimientos

## Propósito y estado del flujo

SPA responsive para administrar activos tecnológicos, sus ubicaciones y usuarios. Cada equipo tiene `qrUuid`, destinado a formar una URL pública que la cámara nativa de un teléfono puede abrir al leer un QR; el flujo final debe identificar el activo y llevar al usuario autenticado a su mantenimiento/detalle.

**Implementado:** autenticación JWT, cambio obligatorio de contraseña inicial, shell de aplicación, consulta/alta de equipos, consulta/alta de usuarios y CRUD de ubicaciones. La lógica de negocio, autorización efectiva y CRUD definitivo pertenecen a la API REST Spring Boot + Spring Security + JWT.

**Pendiente:** mantenimientos (registro, historial, detalle), ruta de captura pública por UUID y retorno post-login, pantalla de detalle de activo, reportes PDF/Excel, PWA/móvil y política de sesión JWT persistente/renovable.

## Stack

- React 19 + TypeScript 6; Vite 8 (`@vitejs/plugin-react`) y alias `@ -> src`.
- React Router DOM 7, router de navegador (`createBrowserRouter`).
- Tailwind CSS 4 vía `@tailwindcss/vite`; iconos `lucide-react`.
- Axios 1 como cliente REST. `@tanstack/react-query` y `@tanstack/react-table` están instalados, pero las vistas usan `useState`/`useEffect`; no hay `QueryClient`, store Redux/Zustand ni hooks propios.
- Estado global actual: `AuthContext`; sesión en `localStorage`.

## Árbol relevante

```text
Frontend/
├─ public/
├─ src/
│  ├─ components/
│  │  ├─ layout/ AppLayout.tsx, Sidebar.tsx, Navbar.tsx, Footer.tsx
│  │  └─ ui/ DataTable.tsx, ModalCrearEquipo.tsx, ModalCrearUsuario.tsx,
│  │          ModalUbicacion.tsx, ModalConfirmar.tsx
│  ├─ context/ AuthContext.tsx
│  ├─ pages/ Login.tsx, CambiarContrasena.tsx, Equipos.tsx,
│  │          Ubicaciones.tsx, Usuarios.tsx
│  ├─ router/ index.tsx, ProtectedRoute.tsx
│  ├─ services/ api.ts, auth.service.ts, equipos.service.ts,
│  │            ubicaciones.service.ts, usuarios.service.ts, roles.service.ts
│  ├─ types/ Equipo.ts, Ubicacion.ts, Usuario.ts, Rol.ts
│  ├─ main.tsx
│  └─ index.css
├─ vite.config.ts
├─ tsconfig*.json
└─ package.json
```

No existen directorios `hooks`, `store` o `views`; `pages` concentra las vistas. `DataTable.tsx` no está integrado por las páginas actuales.

## Rutas, autenticación y acceso

| Ruta | Estado/resultado actual |
|---|---|
| `/login` | Pública; `loginService`, guarda token/usuario, luego navega a `/cambiar-contrasena` o `/dashboard`. |
| `/cambiar-contrasena` | Protegida; obligatoria si `user.debeCambiarContrasena`. |
| `/`, `/equipos` | Protegidas; ambas muestran `Equipos`. |
| `/ubicaciones`, `/usuarios` | Protegidas; dentro de `AppLayout`. |
| `*` | Redirige a `/equipos`. |

`ProtectedRoute` exige `isAuthenticated` (`token && user`). Ante falta de sesión redirige a `/login`, **sin** `state.from`, query ni UUID; por tanto hoy se pierde la ruta original. Tampoco existe `/dashboard`: las navegaciones a esa ruta terminan en el comodín y luego `/equipos`.

El rol es `user.rol: string`. Sidebar sólo adapta la etiqueta visual (`ADMIN`/`TÉCNICO`); no hay guards ni permisos por ruta/acción para Técnico vs Administrador. La API debe seguir imponiendo la autorización. Para el QR pendiente, usar una ruta pública estable, p. ej. `/activo/:uuid`, y en el guard enviar `Navigate` con `state={{ from: location }}`; tras login, navegar a `location.state?.from ?? '/equipos'`.

`AuthProvider` persiste `auth_token` y `auth_user` en `localStorage`; el inicio rehidrata ambos. `logout()` los elimina. Axios lee `auth_token` y añade `Authorization: Bearer <token>` en cada request. No hay refresh token, expiración, cookie `HttpOnly`, interceptor de respuestas/401 ni PWA.

## Contratos de datos

```ts
interface User { id: string; nombre: string; correo: string; rol: string;
  activo: boolean; debeCambiarContrasena: boolean }
interface UserResponse extends User { createdAt: string; updatedAt: string }
interface CreateUserDTO { nombre: string; correo: string; contrasena: string; rolId: string }

interface Rol { id: string; nombre: string; descripcion?: string }

interface Ubicacion { id: string; nombre: string; edificio?: string | null; createdAt?: string }
type CrearUbicacionDTO = Omit<Ubicacion, 'id' | 'createdAt'>

interface Equipo { id: string; qrUuid: string; codigoInventario: string;
  nombre: string; tipo: string; marca: string; modelo: string;
  serialEquipo: string; estado: string; fechaAdquisicion: string;
  ubicacion?: Ubicacion | null; createdAt: string }
interface CrearEquipoDTO extends Omit<Equipo,
  'id' | 'qrUuid' | 'createdAt' | 'ubicacion'> { ubicacionId?: string | null }
```

Fechas son `string`; el formulario de equipo envía `fechaAdquisicion` como `YYYY-MM-DD`. `estado` se usa como texto (`ACTIVO`, `MANTENIMIENTO`, `INACTIVO`), sin union type.

## Servicios y endpoints

`api` usa `baseURL: http://localhost:8080` (URL Railway está comentada). Toda respuesta se obtiene como `response.data`.

| Servicio | Firma | HTTP |
|---|---|---|
| auth | `loginService(LoginCredentials): Promise<AuthResponse>` | `POST /api/auth/login` |
| auth | `cambiarContrasenaService(CambiarContrasenaPayload): Promise<void>` | `POST /api/auth/cambiar-contrasena` |
| usuarios | `obtenerUsuarios(): Promise<UserResponse[]>` | `GET /maintenances/users` |
| usuarios | `crearUsuario(CreateUserDTO): Promise<UserResponse>` | `POST /maintenances/users` |
| roles | `obtenerRoles(): Promise<Rol[]>` | `GET /maintenances/roles` |
| equipos | `obtenerEquipos(): Promise<Equipo[]>` | `GET /maintenances/assets` |
| equipos | `crearEquipo(CrearEquipoDTO): Promise<Equipo>` | `POST /maintenances/assets` |
| ubicaciones | `obtenerUbicaciones(): Promise<Ubicacion[]>` | `GET /maintenances/locations` |
| ubicaciones | `obtenerUbicacionPorId(id): Promise<Ubicacion>` | `GET /maintenances/locations/:id` |
| ubicaciones | `crearUbicacion(CrearUbicacionDTO): Promise<Ubicacion>` | `POST /maintenances/locations` |
| ubicaciones | `actualizarUbicacion(id, CrearUbicacionDTO): Promise<Ubicacion>` | `PUT /maintenances/locations/:id` |
| ubicaciones | `eliminarUbicacion(id): Promise<void>` | `DELETE /maintenances/locations/:id` |

```ts
interface LoginCredentials { correo: string; contrasena: string }
interface AuthResponse { token: string; usuario: User }
interface CambiarContrasenaPayload { usuarioId: string; nuevaContrasena: string }
```

La API debe conservar estos nombres/casing o adaptar los DTOs en los servicios. Agregar servicios futuros por recurso y tipar `api.get<T>()`/`api.post<T>()`; instalar un interceptor de respuesta para 401 y renovación/cierre de sesión según el contrato backend.

## Convenciones y observaciones

- Componentes/páginas: PascalCase; funciones de servicio y handlers: camelCase; DTOs con sufijo `DTO`; interfaces y tipos: PascalCase. Archivos de servicios usan minúsculas con `.service.ts`; hay mezcla de imports relativos y `@/`.
- Idioma dominante: español para dominio, variables, textos y comentarios; dependencias/identificadores de framework en inglés. Se mezclan `User`/`UserResponse` con `Usuario`, y `Equipo`/`Ubicacion` con endpoints en inglés (`assets`, `locations`, `users`). Mantener el contrato backend explícito y unificar gradualmente.
- Las páginas repiten carga manual con `useEffect`; React Query está disponible para caché, mutaciones, invalidación y estados de error.
- `ModalCrearEquipo` contiene dos `useEffect` equivalentes que cargan ubicaciones; consolidar antes de extenderlo. Varios errores sólo se registran en consola, sin feedback UI.
- Sidebar enlaza rutas aún inexistentes: `/categorias`, `/configuracion`; no deben asumirse como módulos implementados.
- El layout usa sidebar fijo de `w-64` y `h-screen`; no hay menú colapsable/móvil, pese a los estilos Tailwind responsive puntuales.
