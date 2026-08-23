const start = document.querySelector("button#start");
const led = document.querySelector(".recording-led");
const fileName = document.querySelector("input#fileName");
const fileNameContainer = document.querySelector(".item.nombre");
const bitrateSwitch = document.querySelector("#high-bitrate");
const videoMenu = document.querySelector("#video-menu");
const previewVideo = document.querySelector("#preview-video");
const downloadButton = document.querySelector("#download-button");

const TARGET_FRAME_RATE = 60;
const BITS_PER_PIXEL_PER_SECOND = 0.05;
const BITRATE_ROUNDING = 100_000;
const BITRATE_BOOST = 4;

const formats = {
  webmh264: "video/webm; codecs=h264",
  webmav1: "video/webm; codecs=av1",
  webmvp9: "video/webm; codecs=vp9",
};

const OK_ICON = `<svg class="status-icon status-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4.5 4.5L19 7"/></svg>`;

const KO_ICON = `<svg class="status-icon status-ko" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="m7 7 10 10m0-10L7 17"/></svg>`;

let isSupported;
let screenStream;
let startTime;
let timeInterval;

// Module scripts run after the DOM is parsed
checkSupport();

function checkSupport() {
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
}

start.addEventListener("click", async () => {
  if (!isSupported) {
    alert("Navegador no compatible con esta aplicación");
    return;
  }

  const fileNameValue = fileName.value;

  if (!fileNameValue) {
    fileNameContainer.classList.add("wobble-hor-bottom");
    setTimeout(() => {
      fileNameContainer.classList.remove("wobble-hor-bottom");
    }, 800);
    return;
  }

  const selectedFormat = document.querySelector(
    'input[name="video-format"]:checked'
  )?.value;
  const codec = formats[selectedFormat];

  if (!codec || !MediaRecorder.isTypeSupported(codec)) {
    alert("Tu navegador no soporta el formato de vídeo seleccionado");
    return;
  }

  const selectedResolution = document.querySelector("#selected-resolution");
  const width = Number(selectedResolution.dataset.width) || screen.width;
  const height = Number(selectedResolution.dataset.height) || screen.height;

  let bitrate =
    Math.round(
      (width * height * TARGET_FRAME_RATE * BITS_PER_PIXEL_PER_SECOND) /
        BITRATE_ROUNDING
    ) * BITRATE_ROUNDING;

  if (bitrateSwitch.checked) bitrate *= BITRATE_BOOST;

  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: width },
        height: { ideal: height },
        frameRate: { ideal: TARGET_FRAME_RATE },
        cursor: "always",
      },
      audio: true,
    });
  } catch (error) {
    console.error("Error al obtener el stream de pantalla: ", error);
    return;
  }

  startTimer();
  start.disabled = true;
  led.classList.add("recording-led-active");

  let mediaRecorder;

  try {
    mediaRecorder = new MediaRecorder(screenStream, {
      mimeType: codec,
      videoBitsPerSecond: bitrate,
    });
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

    previewVideo.src = recordedVideoURL;
    downloadButton.href = recordedVideoURL;
    downloadButton.download = `${fileNameValue}.webm`;
    videoMenu.classList.add("video-container-visible");

    screenStream.getTracks().forEach((track) => track.stop());
    screenStream = null;
  };

  mediaRecorder.start();
});

document.getElementById("stop").addEventListener("click", () => {
  if (screenStream) {
    screenStream.getTracks().forEach((track) => track.stop());
  }
});

function startTimer() {
  startTime = Date.now();
  timeInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const elapsedTime = Date.now() - startTime;

  // Calcular horas, minutos y segundos
  const hours = Math.floor(elapsedTime / 3600000);
  const minutes = Math.floor((elapsedTime % 3600000) / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);

  // Formatear con ceros a la izquierda
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  document.getElementById("duration").textContent = formattedTime;
}

function stopTimer() {
  clearInterval(timeInterval);
}
