# Palmoland 🌴

Landing page para la vaquita del festival privado de los amigos de toda la
vida. Una página estática, sin backend: todo el contenido vive en `data.json`.

**URL:** <https://toxykdude.github.io/palmoland/>

## Cómo funciona

- `index.html` / `styles.css` / `app.js` — la página (vanilla HTML/CSS/JS, sin build).
- `data.json` — la única fuente de verdad: meta total, milestones y participantes.
- `aportar.html` — página de pago: cuenta Bancolombia + QR (link desde el botón "Quiero aportar").
- `images/pals/` — fotos de perfil de la banda (recortes circulares de WhatsApp).
- GitHub Pages sirve la rama `main` (raíz del repo). Cada push a `main` se publica solo.

## Actualizar la vaquita (admins)

1. Edita `data.json` y agrega tu participante al arreglo `participants`:

   ```json
   { "name": "Caliche", "amount": 100000, "date": "2026-09-28", "emoji": "📐",
     "photo": "images/pals/caliche-obando-palmar-arquitecto.png" }
   ```

   - `photo` es opcional: si va, se muestra la foto; si no, se muestra el `emoji`.
   - Fotos disponibles en `images/pals/` (una por pal, nombre del archivo = nombre del contacto).

2. Commit + push a `main`. En ~1 minuto el sitio se actualiza solo.
3. La barra de progreso, contadores, milestones y la pared de la fama se
   recalculan automáticamente.

## Cuenta Bancolombia (aportar.html)

- Cuenta de Ahorros **No. 059 397 064 80**.
- El QR está pendiente (TODO-ADMIN en la página): cuando exista el QR real de
  la cuenta, guardar como `images/qr.jpeg` y reemplazar el bloque
  `qr-placeholder` en `aportar.html` por el `<img>` que está en el comentario.

Pendientes del admin (marcados con `TODO-ADMIN` en las páginas):
fecha y finca, titular de la cuenta, WhatsApp de contacto, y el QR de Bancolombia.

## Notas técnicas

- Todo usa rutas relativas porque el sitio vive en el subpath `/palmoland/`.
- Formato de moneda: `Intl.NumberFormat("es-CO", { currency: "COP" })`, sin decimales.
- Mobile-first: ~90% del tráfico llega por WhatsApp en celular.
- El preview de WhatsApp usa `og-image.png` (1200×630) con URLs absolutas de Pages.
