# Sistema de Recibos - Alfaparf Milano

Plataforma web para el registro estructurado de recibos de pago por parte de vendedores. Los datos se almacenan en Google Sheets y las imágenes en Cloudinary.

## 🎯 Características

- **Formulario completo** con 4 secciones: información del recibo, formas de pago, facturas e imágenes
- **Validaciones robustas**: RUT chileno (módulo 11), SAP (9 dígitos), montos cuadrados
- **Diseño empresarial**: limpio, responsivo y accesible
- **Integración**: Google Sheets para datos + Cloudinary para imágenes
- **Deploy en Vercel**: SSR con Astro + adaptador serverless

## 📋 Requisitos Previos

1. Cuenta de Google Cloud con APIs habilitadas
2. Google Sheet configurado
3. Service Account con credenciales JSON
4. Cuenta de Cloudinary
5. Cuenta de Vercel para deployment

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```bash
pnpm install
```

### 2. Configurar Google Cloud

#### Paso 2.1 — Crear Proyecto
1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear nuevo proyecto: `recibos-alfaparf`

#### Paso 2.2 — Habilitar APIs
1. En **APIs y servicios → Biblioteca**, habilitar:
   - Google Sheets API

#### Paso 2.3 — Crear Service Account
1. Ir a **APIs y servicios → Credenciales**
2. **Crear credenciales → Cuenta de servicio**
3. Nombre: `recibos-app`
4. En la cuenta creada → **Claves → Agregar clave → JSON**
5. Descargar el archivo JSON

#### Paso 2.4 — Configurar Google Sheet
1. Crear un Google Sheet nuevo
2. Copiar el ID del Sheet (de la URL)
3. Compartir con el email de la Service Account (permisos de **Editor**)

#### Paso 2.5 — Configurar Cloudinary
1. Crear cuenta gratuita en [cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. En el Dashboard, copiar `Cloud name`, `API Key` y `API Secret`
3. Las imágenes se guardarán en la carpeta `recibos-alfaparf`

### 3. Variables de Entorno

Crear archivo `.env` en la raíz:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=recibos-app@recibos-alfaparf.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=abc123xyz...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Nota**: Extraer `client_email` y `private_key` del archivo JSON descargado.

## 💻 Desarrollo Local

```bash
pnpm dev
```

Abrir [http://localhost:4321](http://localhost:4321)

## 📦 Build para Producción

```bash
pnpm build
pnpm preview
```

## 🌐 Deploy en Vercel

### Opción 1: CLI de Vercel

```bash
pnpm add -g vercel
vercel
```

### Opción 2: GitHub + Vercel Dashboard

1. Push del código a GitHub
2. Importar proyecto en Vercel
3. Configurar variables de entorno en **Settings → Environment Variables**

**Variables requeridas en Vercel**:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 📊 Estructura de Datos en Google Sheets

Las columnas del Sheet serán (una fila por forma de pago):

| ID Recibo | Fecha Envío | Nº Recibo | Fecha Recibo | Vendedor | Cliente | RUT | SAP | Monto Total | Tipo Pago | Monto Pago | Fecha Pago | Comprobante | Vencimiento Cheque | Facturas | Foto Recibo | Fotos Adicionales |
|-----------|-------------|-----------|--------------|----------|---------|-----|-----|-------------|-----------|------------|------------|-------------|--------------------|----------|-------------|-------------------|

## 🛠️ Tecnologías

- **Astro 5** — Framework web
- **Tailwind CSS 4** — Estilos
- **TypeScript** — Tipado
- **Google APIs** — Sheets
- **Cloudinary** — Imágenes
- **Vercel** — Hosting serverless

## 📝 Validaciones Implementadas

- **RUT**: Validación chilena con módulo 11
- **SAP**: Exactamente 9 dígitos numéricos
- **RUT o SAP**: Al menos uno obligatorio
- **Número de recibo**: Mayor a 90000
- **Montos**: Suma de pagos = suma de facturas = monto total
- **Formas de pago**: Al menos una requerida
- **Facturas**: Al menos una requerida
- **Foto recibo**: Obligatoria

## 🎨 Diseño

- Tipografía: **Playfair Display** (títulos) + **Inter** (cuerpo)
- Paleta: Tonos slate con acentos oscuros
- Animaciones: Fade-in y slide-up en carga
- Responsivo: Mobile-first con breakpoints MD

## 📞 Soporte

Para problemas o preguntas, contactar al equipo de desarrollo.

---

**Desarrollado por**: Henryck Guaramato  
**Versión**: 1.0.0
