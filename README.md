# Palmoland 🌴

Landing page para la vaquita del festival privado de los amigos de toda la
vida. Una página estática, sin backend: todo el contenido vive en `data.json`.

**URL:** <https://toxykdude.github.io/palmoland/>

## Cómo funciona

- `index.html` / `styles.css` / `app.js` — la página (vanilla HTML/CSS/JS, sin build).
- `data.json` — la única fuente de verdad: meta total, milestones y participantes.
- `aportar.html` — página de pago: cuenta Bancolombia + QR (link desde el botón "Quiero aportar").
- `finca.html` — galería de la finca con lightbox (imágenes en `images/finca/{thumb,full}`).
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

## Pagos (aportar.html)

- Cuenta de Ahorros Bancolombia **No. 059 397 064 80**.
- QR de pago **PowerHouse** (`images/qr.jpeg`) — negocio del propio organizador;
  los amigos pueden escanearlo con cualquier app bancaria o transferir al número.

Pendientes del admin (marcados con `TODO-ADMIN` en las páginas):
titular de la cuenta, y WhatsApp de contacto. La finca ya está publicada
(`finca.html` — vía Manizales – Medellín, Romboy Pacífico Tres).

## Notas técnicas

- Todo usa rutas relativas porque el sitio vive en el subpath `/palmoland/`.
- Formato de moneda: `Intl.NumberFormat("es-CO", { currency: "COP" })`, sin decimales.
- Mobile-first: ~90% del tráfico llega por WhatsApp en celular.
- El preview de WhatsApp usa `og-image.png` (1200×630) con URLs absolutas de Pages.
