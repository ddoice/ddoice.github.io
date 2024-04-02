const DEFAULT_VOLUME = 0.1;
let audio;

const playSound = ({ file, volume }) => {
  audio?.pause();
  audio = new Audio(`/sounds/${file}.ogg`);
  audio.volume = volume || DEFAULT_VOLUME;
  audio.play();
};

const setInRange = (value, range) => {
  if (!range) return NaN;
  let x = Math.min(range.max, Math.max(range.min, value));
  x = Math.round(x / range.step) * range.step;
  return x;
};


let modes = ['grabFrame', 'videoCapture', 'takePhoto'];
let mode='grabFrame';

document.addEventListener('DOMContentLoaded', async function () {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 960 },
        height: { ideal: 1280 }
      },
      audio: false
    });

    const videoEl = document.querySelector("#stream");
    videoEl.srcObject = stream;
    await videoEl.play();

    let track = stream.getVideoTracks()[0];
    let settings = track.getSettings();
    let width = settings.width;
    let height = settings.height;

    const imageCapture = new ImageCapture(track);
    const barcodeDetector = new BarcodeDetector({ formats: ['pdf417', 'qr_code', 'aztec'] });

    const { imageWidth, imageHeight } = await imageCapture.getPhotoCapabilities();
    const captureWidth = setInRange(960, imageWidth);
    const captureHeight = setInRange(1280, imageHeight);
    const photoSettings = width && height
      ? {
        imageWidth: captureWidth,
        imageHeight: captureHeight,
      }
      : null;    

    let scanCount = 0;
    let average = 0;
    let last = 0;
    let fail = 0;
    let success = 0;
    const minDelay = 100;

    function toggleMode() {
      mode = modes[(modes.indexOf(mode) + 1) % modes.length];
      scanCount = 0;
      average = 0;
      last = 0;
    }

    async function getSource() {
      if(mode === 'grabFrame') return imageCapture.grabFrame();
      if(mode === 'videoCapture') return videoEl;
      if(mode === 'takePhoto') {
        const imageBlob = await imageCapture.takePhoto(photoSettings);
        const imagen = new Image();
        imagen.src = URL.createObjectURL(imageBlob);
        await new Promise(resolve => {
          imagen.onload = resolve;
        });
        return imagen;
      }
    }

    // add eventlistener click .mode-toggle toggleMode
    document.querySelector('.mode-toggle').addEventListener('click', toggleMode);

    function updateDom() {
      const timeNode = document.querySelector('.time span');
      const countNode = document.querySelector('.count span');
      const successNode = document.querySelector('.success span');
      const failNode = document.querySelector('.fail span');
      const modeNode = document.querySelector('.mode span');
      modeNode.innerHTML = mode;
      successNode.innerHTML = success;
      failNode.innerHTML = fail;
      timeNode.innerHTML = average.toFixed(2);
      countNode.innerHTML = scanCount;
    }

    function updateStats(initial) {
      last = Date.now() - initial;
      scanCount += 1;
      average = scanCount > 1 ? ((average * (scanCount - 1)) + last) / scanCount : last;
    }

    const launchIt = () => setTimeout(async () => {
      try {
        await vamos();
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(launchIt, minDelay);
      }
    }, minDelay);
    
    async function vamos() {
      try {
        const initial = Date.now();
        const source = await getSource();
        const barcodes = await barcodeDetector.detect(source);
        updateStats(initial);
        updateDom();
        if (barcodes.length > 0) {
          success += 1;
          playSound({ file: 'Ceres', volume: 1 });
        } else {
          fail += 1;
        }
      } catch (error) {
        console.error("Error in vamos:", error);
      }
    }
    
    launchIt(0);

  } catch (error) {
    console.error(error);
    alert('There was an error accessing the camera or initializing the application.');
  }
});