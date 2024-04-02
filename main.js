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

    const imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
    const barcodeDetector = new BarcodeDetector({ formats: ['pdf417', 'qr_code', 'aztec'] });

    let scanCount = 0;
    let average = 0;
    let last = 0;
    let fail = 0;
    let success = 0;
    const minDelay = 200;

    function updateDom() {
      const timeNode = document.querySelector('.time span');
      const countNode = document.querySelector('.count span');
      const successNode = document.querySelector('.success span');
      const failNode = document.querySelector('.fail span');
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
        const imageBlob = await imageCapture.grabFrame();
        const barcodes = await barcodeDetector.detect(imageBlob);
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