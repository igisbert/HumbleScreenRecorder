const start = document.querySelector("button#start");
const led = document.querySelector(".recording-led");
const fileName = document.querySelector("input#fileName");
const fileNameContainer = document.querySelector(".item.nombre");
const bitrateSwitch = document.querySelector("#high-bitrate");

let height;
let width;
let videoFormatCodec;
let bitrate;

let startTime; // Variable para almacenar el tiempo de inicio
let timeInterval; // Variable para almacenar el ID del intervalo

const formats = {
  webmh264: "video/webm; codecs=h264",
  webmav1: "video/webm; codecs=av1",
  webmvp9: "video/webm; codecs=vp9",
};

let isSupported;

const OK_ICON = `<svg class="status-icon status-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4.5 4.5L19 7"/></svg>`;

const KO_ICON = `<svg class="status-icon status-ko" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="m7 7 10 10m0-10L7 17"/></svg>`;

document.addEventListener("DOMContentLoaded", () => {
  detectMediarecorder();
});

const detectMediarecorder = () => {
  const check = document.getElementById("mediaRecorderCheck");

  const apisAvailable =
    typeof MediaRecorder !== "undefined" &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === "function";

  if (!apisAvailable) {
    check.innerHTML = `<p class="text-short">Tu navegador no es compatible con esta aplicación ${KO_ICON}</p>`;
    isSupported = false;
  } else {
    check.innerHTML = `<p class="text-short">Tu navegador es compatible con esta aplicación ${OK_ICON}</p>`;
    isSupported = true;
  }
};

let screenStream; // Declara la variable fuera de las funciones para que sea accesible en todo el ámbito

// Botón de inicio de grabación
start.addEventListener("click", () => {
  if (!isSupported) {
    alert("Navegador no compatible con esta aplicación");
    return;
  }

  const fileNameValue = fileName.value;

  if (!fileNameValue || fileNameValue === "") {
    fileNameContainer.classList.add("wobble-hor-bottom");
    setTimeout(() => {
      fileNameContainer.classList.remove("wobble-hor-bottom");
    }, 800);
    return;
  }

  const videoFormat =
    document.querySelector('input[name="video-format"]:checked').value ??
    "webm";

  videoFormatCodec = formats[videoFormat];

  if (!videoFormatCodec || !MediaRecorder.isTypeSupported(videoFormatCodec)) {
    alert("Tu navegador no soporta el formato de vídeo seleccionado");
    return;
  }

  const selectedResolution = document.querySelector("#selected-resolution");

  width = Number(selectedResolution.dataset.width) || screen.width;
  height = Number(selectedResolution.dataset.height) || screen.height;

  bitrate = Math.round((width * height * 60 * 0.05) / 100000) * 100000;

  if (bitrateSwitch.checked) bitrate = bitrate * 4;

  navigator.mediaDevices
    .getDisplayMedia({
      video: {
        width: { ideal: width },
        height: { ideal: height },
        frameRate: { ideal: 60 },
        cursor: "always",
      },
      audio: true,
    })
    .then((stream) => {
      startTimer();
      start.disabled = true;
      led.classList.add("recording-led-active");
      screenStream = stream; // Almacena el stream en la variable para que pueda ser accedido en toda la aplicación

      let mediaRecorder;

      try {
        const options = {
          mimeType: videoFormatCodec,
          videoBitsPerSecond: bitrate,
        };

        mediaRecorder = new MediaRecorder(screenStream, options);
      } catch (error) {
        console.error("Error al crear el MediaRecorder: ", error);
        alert("Tu navegador no soporta el formato de vídeo seleccionado");
        stopTimer();
        led.classList.remove("recording-led-active");
        start.disabled = false;
        screenStream.getTracks().forEach((track) => track.stop());
        screenStream = null;
        return;
      }

      const chunks = [];
      let recordedVideoURL = null;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopTimer();
        led.classList.remove("recording-led-active");
        start.disabled = false;

        const recordedBlob = new Blob(chunks, { type: "video/webm" });

        if (recordedVideoURL) URL.revokeObjectURL(recordedVideoURL);
        recordedVideoURL = URL.createObjectURL(recordedBlob);

        const videoContainer = document.querySelector("#video-menu");
        const videoElement = document.querySelector("#preview-video");
        const downloadButton = document.querySelector("#download-button");

        videoElement.src = recordedVideoURL;
        downloadButton.href = recordedVideoURL;
        downloadButton.download = `${fileNameValue}.webm`;
        videoContainer.classList.add("video-container-visible");

        screenStream.getTracks().forEach((track) => track.stop());
        screenStream = null;
      };

      mediaRecorder.start();
    })
    .catch((error) => {
      console.error("Error al obtener el stream de pantalla: ", error);
    });
});

// Botón de detención
const stopButton = document.getElementById("stop");
stopButton.addEventListener("click", () => {
  if (screenStream) {
    screenStream.getTracks().forEach((track) => track.stop());
  }
});

function startTimer() {
  startTime = Date.now();
  timeInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const currentTime = Date.now();
  const elapsedTime = currentTime - startTime;

  // Calcular horas, minutos y segundos
  const hours = Math.floor(elapsedTime / 3600000);
  const minutes = Math.floor((elapsedTime % 3600000) / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);

  // Formatear con ceros a la izquierda
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Actualizar el elemento HTML con el tiempo formateado
  document.getElementById("duration").textContent = formattedTime;
}

function stopTimer() {
  clearInterval(timeInterval);
}
