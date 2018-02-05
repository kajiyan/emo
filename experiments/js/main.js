(function() {
  'use strict';

  const CROP_WIDTH = 426;
  const CROP_HEIGHT = 240;

  const FACING_MODE = ['user', { exact: 'environment' }];
  let currentStream;
  let currentDeviceIndex = 0;
  let currentFacingModeIndex = 0;
  let constraints = {
    audio: false,
    video: {
      width: 1280,
      height: 720
    }
  };



  document.addEventListener('DOMContentLoaded', function(event) {
    const $$resourceFile = document.getElementById('js-media-Resource-file');
    const $$video = document.getElementById('js-media_Camera');
    const $$canvas = document.getElementById('js-media_Canvas');
    const $$shootingBtn = document.getElementById('js-cntl_Btn-shooting');
    const $$toggleBtn = document.getElementById('js-cntl_Btn-toggle');
    const ctx = $$canvas.getContext('2d');

    let videoSources;

    $$canvas.width = $$canvas.clientWidth;
    $$canvas.height = $$canvas.clientHeight;


    const fileChangeHandler = (e) => {
      e.preventDefault();

      const target = e.dataTransfer || e.target;
      const file = target && target.files && target.files[0];

      if (!file || file.type !== 'image/jpeg') {
        alert('適切なファイルが指定されていません')
        return;
      }

      console.log(file);

      // maxWidth: result.width(),
      // canvas: true,
      // pixelRatio: window.devicePixelRatio,
      // downsamplingRatio: 0.5,
      // orientation: true
    }


    /**
     * getVideoSources
     * システム上で利用できる入出力メディアデバイスの情報を返す
     */
    const getVideoSources = () => {
      let results = [];

      return new Promise((resolve, reject) => {
        if (navigator.mediaDevices) {
          navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
            mediaDevices.forEach((mediaDevice) => {
              if (mediaDevice.kind !== 'videoinput') return;
              results.push({
                name: mediaDevice.label,
                id: mediaDevice.deviceId
              });
            });

            resolve(results);
          });
        } else {
          MediaStreamTrack.getSources((mediaDevices) => {
            mediaDevices.forEach((mediaDevice) => {
              if (mediaDevice.kind !== 'video') return;
              results.push({
                name: mediaDevice.facing,
                id: mediaDevice.id
              });
            });

            resolve(results);
          });
        }
      });
    }


    /**
     * loadAssets
     */
    const loadAssets = () => {
      return new Promise((resolve, reject) => {
        const loadQueue = new createjs.LoadQueue();

        createjs.Sound.alternateExtensions = ['mp3'];
        loadQueue.installPlugin(createjs.Sound);

        const manifest = [
          { id: 'shooting', type: createjs.Types.SOUND, src: `shared/sounds/shooting-0.mp3` }
        ];
        // 並列での読み込み数を設定
        loadQueue.setMaxConnections(6);
        loadQueue.addEventListener('error', (error) => { reject(error) });
        loadQueue.addEventListener('complete', (e) => { resolve(loadQueue) });
        loadQueue.loadManifest(manifest);
      });
    }

    const _events = () => {
      $$shootingBtn.addEventListener('click', (e) => {
        e.preventDefault();

        /*
        (async () => {
          const blob = await (() => {
            return new Promise((resolve, reject) => {
              $$canvas.toBlob((blob) => {
                console.log(blob);
                resolve(blob);
              });
            });
          })();
          console.log(blob);
        })();
        */

        const pixelRatio = window.devicePixelRatio || 1.0;
        const scaledImage = loadImage.scale($$canvas, {
          top: ($$canvas.height / 2) - (CROP_HEIGHT / 2),
          left: ($$canvas.width / 2) - (CROP_WIDTH / 2),
          sourceWidth: $$canvas.width,
          sourceHeight: $$canvas.height,
          minWidth: CROP_WIDTH,
          maxWidth: CROP_WIDTH,
          downsamplingRatio: 0.5
        });

        scaledImage.toBlob((blob) => {
          axios({
            method: 'POST',
            url: 'https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize',
            headers: {
              'Content-Type': 'application/octet-stream',
              // 'Content-Type': 'application/json',
              'Ocp-Apim-Subscription-Key': EMOTION_API_KEY
            },
            data: blob
          }).
            then((response) => {
              console.log(response);
            }).
            catch((error) => {
              console.log(error);
            });
        });

        let img = document.createElement('img');
        img.src = scaledImage.toDataURL('image/png');

        document.getElementById('js-media_Src').appendChild(img);
      });


      /*
      $$toggleBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (typeof currentStream !== 'undefined' && currentStream !== null) {
          currentStream.getTracks().forEach((mediaStreamTrack) => {
            mediaStreamTrack.stop();
          });

          let facingModeLen = FACING_MODE.length;
          currentFacingModeIndex = ((currentFacingModeIndex + 1) % facingModeLen + facingModeLen) % facingModeLen;
          constraints.video.facingMode = FACING_MODE[currentFacingModeIndex];

          currentStream = await navigator.mediaDevices.getUserMedia(constraints);
          $$video.srcObject = currentStream;
        }
      });
      */


      $$resourceFile.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      });
      $$resourceFile.addEventListener('dragleave', (e) => {
        e.preventDefault()
      });
      $$resourceFile.addEventListener('drop', fileChangeHandler);

    }


    /**
     * cameraInitialized
     */
    (async function cameraInitialized() {
      try {
        videoSources = await getVideoSources();

        constraints.video.facingMode = FACING_MODE[currentFacingModeIndex];

        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        const assets = await loadAssets();

        // イベントリスナーの登録をする
        _events();

        // $$video.src = window.URL.createObjectURL(mediaStream);
        // $$video.srcObject = (window.URL && window.URL.createObjectURL(mediaStream)) || mediaStream;
        $$video.srcObject = currentStream;

        (function draw() {
          ctx.drawImage($$video, 0, 0, $$canvas.width, $$canvas.height);
          requestAnimationFrame(draw);
        })();
      } catch (error) {
        console.log(error);
      }
    })();
  }, false);

})();
