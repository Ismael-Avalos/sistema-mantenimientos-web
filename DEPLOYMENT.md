# Despliegue en Vercel con backend en Render

## Frontend en Vercel

1. Importar el repositorio y seleccionar como Root Directory la carpeta que contiene este `package.json` (`Frontend` si el repositorio incluye ambos proyectos).
2. Usar el preset Vite, comando `npm run build` y directorio de salida `dist`. Estos valores también están en `vercel.json`.
3. En Settings → Environment Variables, agregar para Production:

   ```dotenv
   VITE_API_URL=https://sistema-de-mantenimientos.onrender.com
   ```

   No agregar `/api`: los servicios ya incluyen ese prefijo. Para probar despliegues Preview, configurar también esa variable en Preview y autorizar su origen exacto en el backend.
4. `VITE_APP_URL` es opcional: al omitirla, los QR usan el dominio desde el que se abre la aplicación. Para que siempre apunten al dominio estable de producción, definirla con la URL pública del frontend, sin barra final. No usar aquí la URL de Render ni localhost.
5. Desplegar. Si cambia una variable `VITE_*`, volver a desplegar: Vite incorpora sus valores durante la compilación. Estas variables son públicas; no guardar secretos en ellas.

`vercel.json` permite abrir o recargar rutas de React Router y enlaces `/mantenimiento/qr/...` sin un 404 del alojamiento.

## Backend en Render

El cliente ya utiliza `withCredentials: true` para la cookie de renovación y Bearer para las llamadas autenticadas. En el código local del backend (`Backend/mantenimientos`), los ajustes siguientes ya se leen de variables de entorno. Configurarlos en Render sustituyendo el dominio de ejemplo por el real:

```dotenv
APP_CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
APP_REFRESH_COOKIE_SECURE=true
APP_REFRESH_COOKIE_SAME_SITE=None
```

Los orígenes deben ser exactos, sin barra final ni rutas. Si se necesitan varios, separarlos con comas; por ejemplo, el dominio de producción y `http://localhost:5173` para probar localmente contra Render. No usar `*`: el backend permite credenciales y también valida el origen en refresh y logout.

Render y Vercel están en sitios diferentes, por eso la cookie requiere `SameSite=None; Secure` en esta conexión directa. Los navegadores que bloquean cookies de terceros pueden impedir restaurar la sesión incluso con estos ajustes; en ese caso se debe evaluar un dominio propio compartido (por ejemplo `app.ejemplo.com` y `api.ejemplo.com`) o un proxy del mismo origen.

Estos nombres se verificaron en el backend local; confirmar que Render ejecuta esa misma versión. No se modificó la configuración remota.

## Desarrollo local

Se conserva el backend predeterminado `http://localhost:8080`. Para personalizarlo, copiar `.env.example` a `.env.local` en la raíz del frontend y reiniciar `npm run dev`. Un archivo `src/.env` no se carga con la configuración actual de Vite. No es necesario mover ese archivo para seguir usando los valores predeterminados.

Para probar contra Render desde local, definir `VITE_API_URL=https://sistema-de-mantenimientos.onrender.com` en `.env.local` y autorizar el origen local en Render.

## Comprobación después del despliegue

- Iniciar sesión y verificar que las peticiones apuntan a Render.
- Recargar una ruta interna y abrir un enlace QR directamente.
- Recargar la página con una sesión iniciada para comprobar la cookie y `/api/auth/refresh`.
- Cerrar sesión y comprobar que no aparecen errores CORS ni `AUTH_ORIGIN_DENIED`.

Referencias: [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite) y [variables de entorno de Vite](https://vite.dev/guide/env-and-mode).
