const start = document.querySelector("button#start");
const stop = document.querySelector("button#stop");
const video = document.querySelector("video");
const body = document.querySelector("body");
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

const resolutions = {
  2160: { width: 3840, height: 2160 },
  1440: { width: 2560, height: 1440 },
  1080: { width: 1920, height: 1080 },
  768: { width: 1366, height: 768 },
  720: { width: 1280, height: 720 },
  480: { width: 854, height: 480 },
};

const formats = {
  webmh264: "video/webm; codecs=h264",
  webmav1: "video/webm; codecs=av1",
  webmvp9: "video/webm; codecs=vp9",
};

const bitrates = {
  2160: 20000000,
  1440: 10000000,
  1080: 6000000,
  768: 3500000,
  720: 3000000,
  480: 1500000,
};

let isSupported;

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
    check.innerHTML = `<p class="text-short">Tu navegador no es compatible con esta aplicación ❌</p>`;
    isSupported = false;
  } else {
    check.innerHTML = `<p class="text-short">Tu navegador es compatible con esta aplicación ✔️</p>`;
    isSupported = true;
  }
};

let screenStream; // Declara la variable fuera de las funciones para que sea accesible en todo el ámbito

// Botón de inicio de grabación
start.addEventListener("click", () => {
  if (!isSupported /* || screenStream */) {
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

  const resolution = document.querySelector("#selected-resolution").dataset
    .value;

  if (resolution === "native") {
    width = screen.width;
    height = screen.height;
  } else {
    width = resolutions[resolution].width;
    height = resolutions[resolution].height;
  }

  bitrate = bitrates[height] ?? 6000000;

  if (bitrateSwitch.checked) bitrate = bitrate * 4;

  console.log(bitrateSwitch.checked);

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
    /* led.classList.remove("recording-led-active");
    start.disabled = false; */
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
