# Palmoland 🌴

Landing page para la vaquita del festival privado de los amigos de toda la
vida. Una página estática, sin backend: todo el contenido vive en `data.json`.

**URL:** <https://toxykdude.github.io/palmoland/>

## Cómo funciona

- `index.html` / `styles.css` / `app.js` — la página (vanilla HTML/CSS/JS, sin build).
- `data.json` — la única fuente de verdad: meta total, milestones y participantes.
- GitHub Pages sirve la rama `main` (raíz del repo). Cada push a `main` se publica solo.

## Actualizar la vaquita (admins)

1. Edita `data.json` y agrega tu participante al arreglo `participants`:

   ```json
   { "name": "El Pibe", "amount": 150000, "date": "2026-09-20", "emoji": "🎧" }
   ```

2. Commit + push a `main`. En ~1 minuto el sitio se actualiza solo.
3. La barra de progreso, contadores, milestones y la pared de la fama se
   recalculan automáticamente.

Pendientes del admin (marcados con `TODO-ADMIN` en la página):
fecha y finca, Nequi/Daviplata/cuenta bancaria, y el WhatsApp de contacto.

## Notas técnicas

- Todo usa rutas relativas porque el sitio vive en el subpath `/palmoland/`.
- Formato de moneda: `Intl.NumberFormat("es-CO", { currency: "COP" })`, sin decimales.
- Mobile-first: ~90% del tráfico llega por WhatsApp en celular.
- El preview de WhatsApp usa `og-image.png` (1200×630) con URLs absolutas de Pages.
