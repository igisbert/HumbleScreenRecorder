# Humble Screen Recorder

Aplicación web para grabar la pantalla directamente desde el navegador, sin instalar nada. Permite grabar una pestaña, una ventana de aplicación o toda la pantalla, y descargar el resultado en formato **WebM**.

## Cómo funciona

Utiliza las APIs nativas del navegador:

- **`getDisplayMedia`** para capturar vídeo (y audio) de la pantalla.
- **`MediaRecorder`** para codificar la grabación en tiempo real.

No requiere servidor ni backend: todo el procesamiento ocurre en el cliente y la descarga se genera localmente.

## Características

- Grabación de pestaña, aplicación o pantalla completa.
- Resoluciones dinámicas calculadas a partir de tu pantalla real (nativa y escalas), con bitrate proporcional a la resolución elegida.
- Formatos WebM con VP9, AV1 o H264 (según soporte del navegador).
- Temporizador de duración en directo.
- Previsualización con controles de reproducción propios.
- Recorte del vídeo por línea de tiempo (inicio y fin).
- Exportación en WebM o MP4: el recorte se hace remuxando los paquetes sin re-codificar, así que es rápido y sin pérdida de calidad.

## Requisitos

Un navegador de escritorio compatible (Chrome, Edge, Firefox...). La aplicación comprueba la compatibilidad al cargar; en navegadores sin las APIs necesarias se muestra un aviso.

> Notas: los navegadores solo permiten capturar pantalla en contexto seguro (**HTTPS** o `localhost`). El recorte se ajusta a los keyframes del vídeo (margen imperceptible en la práctica).

## Desarrollo

Proyecto estático construido con [Astro](https://astro.build).

```sh
npm install     # Instalar dependencias
npm run dev     # Servidor de desarrollo en localhost:4321
npm run build   # Build de producción en ./dist/
npm run preview # Previsualizar el build
```
