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

    const $$resultImgContainer = document.getElementById('js-result_ImgContainer');
    const $$resultDataEmotion = document.getElementById('js-result-Data-emotion');

    const ctx = $$canvas.getContext('2d');

    let videoSources;

    $$canvas.width = $$canvas.clientWidth;
    $$canvas.height = $$canvas.clientHeight;


    const fileChangeHandler = (e) => {
      e.preventDefault();

      $$resourceFile.classList.remove('media-Resource-dragover');

      const target = e.dataTransfer || e.target;
      const file = target && target.files && target.files[0];

      if (!file || (file.type !== 'image/jpeg' && file.type !== 'image/png')) {
        alert('適切なファイルが指定されていません')
        return;
      }

      // maxWidth: result.width(),
      // canvas: true,
      // pixelRatio: window.devicePixelRatio,
      // downsamplingRatio: 0.5,
      // orientation: true

      loadImage(
        file,
        (canvas) => {
          let img = document.createElement('img');
          img.src = canvas.toDataURL('image/png');

          while ($$resultImgContainer.firstChild) {
            $$resultImgContainer.removeChild($$resultImgContainer.firstChild);
          }
          img.classList.add('result_Img', 'sw-Image-w_fluid');
          $$resultImgContainer.appendChild(img);

          (async () => {
            const blob = await toBlob({ canvas });
            const emotionResponse = await postEmotionAPI({ blob });
            const computerVisionResponse = await postComputerVision({ blob });

            $$resultDataEmotion.innerHTML = JSON.stringify(emotionResponse.data, '', '    ') + JSON.stringify(computerVisionResponse.data, '', '    ');
            // $$resultDataEmotion.innerHTML = JSON.stringify(emotionResponse.data, '', '    ');
          })();
        },
        {
          canvas: true,
          downsamplingRatio: 0.5,
          orientation: true
        }
      );
    }



    /**
     * --------------------------------------------------
     * postEmotionAPI
     *
     * @typedef Keydata
     * @type {Object}
     * @property {Blob} Keydata.blob | 解析対象となるBlobオブジェクト
     *
     * @param {Keydata} keydata | 必須の引数
     * @returns {Promise} API Response
     */
    const postEmotionAPI = (keydata) => {
      return new Promise((resolve, reject) => {
        axios({
          method: 'POST',
          url: 'https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize?visualFeatures=Categories、Description',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': EMOTION_API_KEY
          },
          data: keydata.blob
        }).
          then((response) => { resolve(response) }).
          catch((error) => { resolve(error) });
      });
    }


    const postComputerVision = (keydata) => {
      return new Promise((resolve, reject) => {
        axios({
          method: 'POST',
          url: 'https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': '20365278a878447aa2bed97605602d32'
          },
          data: keydata.blob
        }).
          then((response) => { resolve(response) }).
          catch((error) => { resolve(error) });
      });
    }


    /**
     * --------------------------------------------------
     * toBlob
     *
     * @typedef Keydata
     * @type {Object}
     * @property {HTMLCanvasElement} Keydata.canvas | blobデータを取得する<canvas>要素
     *
     * @param {Keydata} keydata.canvas | 必須の引数
     * @returns {Promise} 引数に指定されたcanvasのBlobデータ
     */
    const toBlob = (keydata) => {
      return new Promise((resolve, reject) => {
        try {
          keydata.canvas.toBlob((blob) => {
            resolve(blob);
          });
        } catch (error) {
          resolve(reject);
        }
      });
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
        const canvas = loadImage.scale($$canvas, {
          top: ($$canvas.height / 2) - (CROP_HEIGHT / 2),
          left: ($$canvas.width / 2) - (CROP_WIDTH / 2),
          sourceWidth: $$canvas.width,
          sourceHeight: $$canvas.height,
          minWidth: CROP_WIDTH,
          maxWidth: CROP_WIDTH,
          downsamplingRatio: 0.5
        });

        (async () => {
          const blob = await toBlob({ canvas });
          const emotionResponse = await postEmotionAPI({ blob });
          const computerVisionResponse = await postComputerVision({ blob });

          $$resultDataEmotion.innerHTML = JSON.stringify(emotionResponse.data, '', '    ') + JSON.stringify(computerVisionResponse.data, '', '    ');
        })();

        let img = document.createElement('img');
        img.classList.add('result_Img', 'sw-Image-w_fluid');
        img.src = canvas.toDataURL('image/png');

        while ($$resultImgContainer.firstChild) {
          $$resultImgContainer.removeChild($$resultImgContainer.firstChild);
        }

        $$resultImgContainer.appendChild(img);
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
        $$resourceFile.classList.add('media-Resource-dragover');
        e.dataTransfer.dropEffect = 'copy';
      });
      $$resourceFile.addEventListener('dragleave', (e) => {
        e.preventDefault()
        $$resourceFile.classList.remove('media-Resource-dragover');
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
