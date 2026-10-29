# 🚀 Despliegue de AutomatIA en Vercel

Este paquete contiene todos los archivos necesarios y optimizados para cargar y desplegar el sitio web de **AutomatIA** en **Vercel** de manera inmediata.

---

## 📁 Opciones de Despliegue

Tienes dos maneras súper sencillas de cargarlo en Vercel:

### Opción 1: Subiendo la carpeta `deploy_vercel` directamente (Recomendada y más limpia)
La carpeta `deploy_vercel/` contiene **únicamente** los archivos web de producción (`index.html`, `404.html`, `assets/`, `vercel.json`):
1. Ve a [https://vercel.com/new](https://vercel.com/new) e inicia sesión.
2. Si usas la herramienta de **Arrastrar y Soltar** de Vercel o la CLI, selecciona la carpeta `deploy_vercel`.
3. Haz clic en **Deploy**. ¡Tu web estará online en menos de 30 segundos con certificado SSL gratuito y CDN global!

### Opción 2: Desde un repositorio de GitHub (Toda la carpeta `AutomatIA`)
Si conectas tu repositorio de GitHub con Vercel:
1. Sube tu proyecto a GitHub.
2. En [Vercel](https://vercel.com/new), importa tu repositorio.
3. El archivo `.vercelignore` y `vercel.json` ya están configurados para excluir automáticamente archivos innecesarios (`.docx`, `.pptx`, backups) y publicar únicamente el sitio web con optimización de caché para los assets.
4. Haz clic en **Deploy**.

---

## 💻 Vista Previa Local (Servidor de Desarrollo)

Para probar la web en tu navegador localmente:

1. Abre una terminal en esta carpeta (`AutomatIA`).
2. Ejecuta:
   ```bash
   node server.js
   ```
3. Abre tu navegador en:
   **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ Archivos de Configuración Incluidos

- `vercel.json`: Reglas de enrutamiento limpio (`cleanUrls`), compresión y encabezados de caché inmutable para imágenes y logos.
- `.vercelignore`: Lista de exclusión para no subir documentación interna pesada.
- `package.json`: Permite a Vercel y Node.js reconocer los scripts de arranque.
- `server.js`: Servidor HTTP ligero y nativo sin dependencias para pruebas locales inmediatas.
