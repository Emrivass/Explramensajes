# FP Mensaje — Explora FP × Ucademy

Herramienta post-llamada: el comercial pega el **Record ID** del negocio de
HubSpot y **Claude escribe los mensajes de WhatsApp** y elige qué dosier y
recursos adjuntar, según el perfil del lead. Todo en **Vercel** (web + API en
un mismo sitio, mismo dominio, sin líos de CORS ni proxys externos).

## Archivos (esta es toda la estructura, no falta nada)

```
index.html        ← la herramienta (la web)
api/
  └─ deal.js       ← función serverless (HubSpot + relay a Claude)
README.md          ← esto
```

> ⚠️ La carpeta se llama **`api`** (en minúsculas) y el archivo **`deal.js`**.
> Vercel convierte `api/deal.js` en la URL `/api/deal` automáticamente.
> La web llama a `/api/deal` (mismo dominio): **no hay que configurar nada** en
> el engranaje ⚙︎. Si quedaba una conexión antigua a un "val", la web la borra sola.

## Crear de cero (10 min, todo gratis)

### 1) Repositorio en GitHub
- Crea un repo **nuevo** (vacío).
- Sube **los 3 elementos** respetando la carpeta `api/`:
  `Add file → Upload files` y arrastra `index.html`, la carpeta `api` (con
  `deal.js` dentro) y `README.md`. Si GitHub no te deja arrastrar la carpeta,
  crea el archivo a mano: `Add file → Create new file`, nombre `api/deal.js`,
  pega el contenido y commit.

### 2) Importar en Vercel
- `vercel.com → Add New → Project → Import` ese repo.
- No cambies nada en la detección. **Deploy**.

### 3) Variables de entorno (EL PASO CLAVE)
En Vercel → tu proyecto → **Settings → Environment Variables**, añade **las dos**
(marca Production, Preview y Development en cada una):

| Name                 | Value                         |
|----------------------|-------------------------------|
| `HUBSPOT_TOKEN`      | tu token privado `pat-...`    |
| `ANTHROPIC_API_KEY`  | tu clave de la API `sk-ant-...` |

Los nombres deben ser **exactos** (mayúsculas y guiones bajos igual que arriba).

### 4) Redeploy
Vercel → **Deployments** → en el último, menú `⋯` → **Redeploy** (para que tome
las variables).

### 5) Probar
- Abre `https://TU-PROYECTO.vercel.app`.
- Pega un **Record ID** (p. ej. `494908106958`) y pulsa **Traer del CRM**.
- Debe rellenar los datos y, en unos segundos, **Claude escribe los mensajes**.

## HubSpot — permisos del token
La app privada de HubSpot necesita estos scopes:
- `crm.objects.deals.read`
- `crm.objects.owners.read`  (para traer el propietario/comercial que firma)

Propiedades de negocio que usa: `motivacion_ulterior`, `contexto_personal`,
`hubspot_owner_id`, `formulacion_global`, `nombre`, `dealname`.

## Comprobaciones rápidas si algo falla
Abre estas URLs en el navegador (cambia el dominio por el tuyo):

- **¿Vive la función?** `https://TU-PROYECTO.vercel.app/api/deal?id=494908106958`
  - Devuelve un JSON con datos → ✅ HubSpot OK.
  - `{"error":"Falta el id del negocio"}` con un id válido → el `api/deal.js`
    desplegado es viejo (sin la parte POST). Vuelve a subir este `api/deal.js`.
  - 404 → el archivo no está en `api/deal.js`. Créalo ahí.

- **El error al escribir con IA** (sale en la propia web, en rojo, al «Regenerar con IA»):
  - `HTTP 400 · sin ANTHROPIC_API_KEY` → falta la variable o está mal escrita.
  - `HTTP 400 · Falta el id del negocio` → `api/deal.js` viejo (vuelve a subirlo).
  - `HTTP 401` → token de HubSpot mal o sin scopes.

## Notas
- Todo gratis: Vercel (plan Hobby) + HubSpot. La API de Anthropic se paga por
  uso, pero con el modelo Haiku son céntimos por lead (puedes ponerle un límite
  de gasto bajo en console.anthropic.com).
- Los dosieres/recursos salen de Google Drive (enlaces dentro de la web);
  asegúrate de que están compartidos como "cualquiera con el enlace".
