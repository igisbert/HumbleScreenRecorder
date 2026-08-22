# Grabadora de pantalla

Aplicación web para grabar la pantalla directamente desde el navegador, sin instalar nada. Permite grabar una pestaña, una ventana de aplicación o toda la pantalla, y descargar el resultado en formato **WebM**.

## Cómo funciona

Utiliza las APIs nativas del navegador:

- **`getDisplayMedia`** para capturar vídeo (y audio) de la pantalla.
- **`MediaRecorder`** para codificar la grabación en tiempo real.

No requiere servidor ni backend: todo el procesamiento ocurre en el cliente y la descarga se genera localmente.

## Características

- Grabación de pestaña, aplicación o pantalla completa.
- Formatos WebM con VP9, AV1 o H264 (según soporte del navegador).
- Selección de resolución (nativa hasta 4K) y opción de bitrate mejorado (×4).
- Temporizador de duración en directo.
- Previsualización y descarga del vídeo al terminar.

## Requisitos

Un navegador de escritorio compatible (Chrome, Edge, Firefox...). La aplicación comprueba la compatibilidad al cargar; en navegadores sin las APIs necesarias se muestra un aviso.

> Nota: los navegadores solo permiten capturar pantalla en contexto seguro (**HTTPS** o `localhost`).

## Desarrollo

Proyecto estático construido con [Astro](https://astro.build).

```sh
npm install     # Instalar dependencias
npm run dev     # Servidor de desarrollo en localhost:4321
npm run build   # Build de producción en ./dist/
npm run preview # Previsualizar el build
```
