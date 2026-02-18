# Configuración de Wildcard Subdomains para Landing Pages

## Resumen

Cada organización puede tener una landing page pública accesible desde:
```
https://{slug}.turnio.app
```

Para que esto funcione, se necesita configurar DNS wildcard y que la plataforma de hosting acepte cualquier subdomain.

---

## Paso 1: Dominio

Necesitás un dominio propio (ej: `turnio.app`). Si todavía no tenés uno, compralo en cualquier registrar (Namecheap, Cloudflare, Google Domains, etc.).

## Paso 2: DNS - Wildcard CNAME

En el panel DNS de tu dominio, creá estos registros:

| Tipo  | Nombre | Valor                            | TTL  |
|-------|--------|----------------------------------|------|
| A     | @      | (IP de tu servidor / Railway)    | 3600 |
| CNAME | *      | tu-app.up.railway.app            | 3600 |

El registro `CNAME *` es el wildcard: cualquier subdomain (`vicca.turnio.app`, `centro.turnio.app`) resolverá al mismo servidor.

### Si usás Cloudflare como DNS:

1. Agregá tu dominio a Cloudflare
2. Creá el registro `CNAME *` apuntando a tu app de Railway
3. **Importante**: Poné el proxy en "DNS only" (nube gris) para el wildcard, o configurá SSL flexible

## Paso 3: Railway - Custom Domain

En Railway, la app soporta wildcard domains:

1. Ir a **Settings** > **Networking** > **Custom Domain**
2. Agregar: `*.turnio.app`
3. Railway generará un registro TXT de verificación
4. Agregar ese registro TXT en tu DNS
5. Esperar validación (puede tardar hasta 24hs, usualmente minutos)

También agregar el dominio base:
- `turnio.app` (para la app principal)

## Paso 4: SSL

Railway maneja SSL automáticamente con Let's Encrypt para custom domains, incluyendo wildcards.

Si usás Cloudflare como proxy, configurar:
- SSL/TLS > Full (strict)
- Edge Certificates > siempre activado

## Paso 5: Variables de Entorno

Agregar en Railway las variables de Cloudinary (para imágenes de la landing):

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

Para obtener estas credenciales:
1. Crear cuenta gratis en https://cloudinary.com
2. Ir a Dashboard > Settings > API Keys
3. Copiar Cloud Name, API Key y API Secret

---

## Cómo Funciona Técnicamente

### Flujo de request a un subdomain:

```
Browser: vicca.turnio.app
  → DNS: CNAME *.turnio.app → tu-app.up.railway.app
  → Railway: rutea al container de la app
  → Express:
    1. /api/* → rutas normales de API
    2. Subdomain middleware detecta Host: vicca.turnio.app
    3. Busca LandingPage con slug="vicca" en DB
    4. Si enabled=true: inyecta meta SEO en index.html y sirve SPA
    5. React detecta subdomain → renderiza PublicLandingPage
    6. PublicLandingPage llama GET /api/public/landing/vicca
    7. Renderiza la landing con los datos
```

### Flujo de request al dominio principal:

```
Browser: turnio.app o app.turnio.app
  → Express sirve SPA normalmente
  → React Router maneja /login, /dashboard, etc.
```

---

## Alternativa sin Wildcard: Subdominios Manuales

Si no querés configurar wildcard DNS, podés agregar cada subdomain manualmente:

1. En tu DNS: `CNAME vicca → tu-app.up.railway.app`
2. En Railway: agregar `vicca.turnio.app` como custom domain
3. Repetir por cada organización

Esto es más trabajo pero no requiere wildcard DNS.

---

## Checklist de Seguridad

- [x] Rate limiting en endpoint público (60 req/min por IP)
- [x] Cache-Control headers (5 min public, 10 min s-maxage)
- [x] Sanitización de texto (sin HTML/scripts en contenido)
- [x] Slugs reservados bloqueados (www, api, admin, app, etc.)
- [x] Validación de slug: solo letras, números y guiones, 3-30 chars
- [x] RBAC: solo ADMIN puede editar landing
- [x] No se exponen datos internos en el DTO público (sin tenantId, userId)
- [x] Imágenes validadas: máximo 2MB antes de subir a Cloudinary
- [x] Cloudinary auto-optimiza y limita dimensiones a 1200px
- [x] SEO meta tags inyectados server-side para crawlers

---

## Troubleshooting

### "La landing no se ve en el subdomain"
1. Verificar que el DNS wildcard esté propagado: `dig vicca.turnio.app`
2. Verificar que Railway acepte el domain: Settings > Networking
3. Verificar que la landing esté **enabled** en Configuración > Landing

### "Las imágenes no suben"
1. Verificar variables CLOUDINARY_* en Railway
2. Verificar que la imagen sea < 2MB
3. Revisar logs del API en Railway

### "Error 404 en la landing"
1. Verificar que el slug en la URL coincida con el configurado
2. Verificar que `enabled = true` en la base de datos
