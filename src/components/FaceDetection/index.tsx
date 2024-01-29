import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { v4 as uuidv4 } from "uuid";

import initMediaPipe from "../../../mediaPipe/initMediaPipe";
import predictHappiness from "../../../util/predictHappiness";
import drawFaceMask from "../../../util/drawFaceMask";
import CapturedImage from "../CapturedImage";
import LoadingBtn from "../LoadingBtn";
import emotionPredictionModel from "../../../util/emotionPredictionModel";

type Emotion = "happy" | "unhappy" | "neutral" | null;

interface FaceBlendShape {
  index: number;
  score: number;
  categoryName: string;
  displayName: string;
}

interface ImageRef {
  capturedPicture: string;
  faceBlendShape: FaceBlendShape[];
}

const FaceDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);
  const lastTime = useRef<number>(0);
  const imgRef = useRef<ImageRef[]>([]);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(
    null
  );
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
  const [videoDetect, setVideoDetect] = useState<boolean>(false);
  const [animationId, setAnimationId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [model, setModel] = useState<unknown>(null);
  const [emotion, setEmotion] = useState<Emotion>(null);
  let imgRefNumber = 0;
  const runningMode = "VIDEO";

  useEffect(() => {
    async function createFaceLandmarker() {
      const faceLandmarkerInstance = await initMediaPipe();
      setFaceLandmarker(faceLandmarkerInstance);
    }

    async function loadModel() {
      const model = await emotionPredictionModel();
      if (model) {
        setModel(model);
      }
    }

    createFaceLandmarker();
    loadModel();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      window.scrollTo(0, 0);
    }
  }, [errorMessage]);

  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent;
      if (/Mobi|Android/i.test(ua)) {
        setIsMobile(true);
      }

      if (/iPhone/i.test(ua)) {
        setIsMobile(true);
      }
    };
    checkMobile();
    window.addEventListener("checkMobile", checkMobile);

    return () => window.removeEventListener("checkMobile", checkMobile);
  }, []);

  function handleWebCamRunning() {
    setWebcamRunning(prev => !prev);
  }

  function handleErrorBtn() {
    predictWebcam();
    setErrorMessage("");
  }

  async function handleFaceMask() {
    if (videoDetect && animationId) {
      window.cancelAnimationFrame(animationId);
      videoRef.current!.removeEventListener("loadeddata", predictWebcam);

      setWebcamRunning(false);
      setVideoDetect(false);
      setAnimationId(null);

      return;
    }

    if (faceLandmarker && !videoDetect) {
      setVideoDetect(true);

      if (navigator.mediaDevices) {
        enableCam();
      } else {
        alert("Camera is not supported on your device.");
      }
    }
  }

  async function enableCam() {
    if (!faceLandmarker) {
      alert("Wait! faceLandmarker not loaded yet.");

      return;
    }

    const constraints = {
      video: true,
    };

    const openMediaDevices = async (constraint: MediaStreamConstraints) => {
      return await navigator.mediaDevices.getUserMedia(constraint);
    };

    try {
      const stream = await openMediaDevices(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      }

      if (runningMode === "VIDEO") {
        await faceLandmarker.setOptions({ runningMode: runningMode });
      }
    } catch (error) {
      setErrorMessage("Your device is not available for this service");
    }
  }

  async function predictWebcam() {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (
      canvas === null ||
      webcamRunning === false ||
      video === null ||
      faceLandmarker === null
    )
      return;

    const videoRect = video.getBoundingClientRect();
    const startTimeMs = performance.now();
    const results = await faceLandmarker.detectForVideo(video, startTimeMs);

    if (!results.faceLandmarks.length) {
      setErrorMessage("Face Detection Failed");
    }

    canvas.setAttribute("width", videoRect.width.toString());
    canvas.setAttribute("height", videoRect.height.toString());
    canvas.style.width = videoRect.width + "px";
    canvas.style.height = videoRect.height + "px";
    const canvasCtx = canvas.getContext("2d");

    if (canvasCtx) {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      const drawingUtils = new DrawingUtils(canvasCtx!);
      drawFaceMask(results, drawingUtils, FaceLandmarker);
    }

    const currentTime = performance.now();
    const delay = 500;

    if (!lastTime.current || currentTime - lastTime.current >= delay) {
      lastTime.current = currentTime;

      const capture = captureRef.current;
      const video = videoRef.current;
      const videoContainerRect =
        videoContainerRef.current?.getBoundingClientRect();

      if (capture && video) {
        captureRef.current.setAttribute("width", videoRect.width.toString());
        captureRef.current.setAttribute("height", videoRect.height.toString());
        captureRef.current.style.left = videoRect.x + "px";
        captureRef.current.style.top = videoRect.y + "px";
        captureRef.current.style.width = videoContainerRect!.width + "px";
        captureRef.current.style.height = videoContainerRect!.height + "px";
        const captureCtx = captureRef.current.getContext("2d");

        if (captureCtx) {
          captureCtx.clearRect(0, 0, canvas.width, canvas.height);
          captureCtx.drawImage(video, 0, 0, videoRect.width, videoRect.height);
        }

        capture.toBlob(async blob => {
          const faceBlendShape = results.faceBlendshapes[0]?.categories;
          const emotionResult = await predictHappiness(faceBlendShape, model);
          setEmotion(emotionResult);

          if (emotionResult === "happy" && blob !== null) {
            const capturedPicture = URL.createObjectURL(blob);

            imgRef.current[imgRefNumber] = {
              capturedPicture,
              faceBlendShape,
            };

            imgRefNumber++;
          }

          if (webcamRunning) {
            const animationFrameId =
              window.requestAnimationFrame(predictWebcam);
            setAnimationId(animationFrameId);
          }
        }, "image/png");
      }
    } else {
      if (webcamRunning) {
        const animationFrameId = window.requestAnimationFrame(predictWebcam);
        setAnimationId(animationFrameId);
      }
    }
  }

  return (
    <>
      {errorMessage ? (
        <div className="flex flex-col justify-center items-center mt-10 h-auto w-6/12 m-auto bg-red-500">
          <h1 className="text-base text-gray-50 decoration-solid mb-1">
            Error: {errorMessage}
          </h1>
          <button
            onClick={handleErrorBtn}
            type="button"
            className="text-gray-50 bg-black h-auto p-1 m-1"
          >
            Restart
          </button>
        </div>
      ) : (
        <></>
      )}
      {webcamRunning ? (
        <>
          <div className="flex flex-col h-screen items-center">
            <div className="flex grow-0 flex-row h-auto w-auto bg-stone-200 border-2 border-stone-900 ring-offset-0 p-2 m-1  rounded-3xl justify-around">
              <div
                className={`text-4xl p-3 m-2 ${
                  emotion === "unhappy" ? "bg-red-600 " : "bg-stone-300"
                } rounded-full border-4 border-stone-900 shadow-md`}
              >
                🙁
              </div>
              <div
                className={`text-4xl p-3 m-2 ${
                  emotion === "neutral"
                    ? "bg-yellow-400 shadow-md"
                    : "bg-stone-300"
                } rounded-full border-4 border-stone-900 shadow-md`}
              >
                😐
              </div>
              <div
                className={`text-4xl p-3 m-2 ${
                  emotion === "happy" ? "bg-lime-400" : "bg-stone-300"
                } rounded-full border-4 border-stone-900 stone-md`}
              >
                🙂
              </div>
            </div>
            <div
              className={`
                flex flex-col justify-center items-center ${
                  isMobile ? "w-10/12" : "w-6/12"
                } h-4/5 border-2 max-w-md bg-stone-800`}
            >
              <div className="grid grid-rows-4 w-full h-full m-10">
                <div
                  className="relative block row-span-3"
                  ref={videoContainerRef}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="absolute block w-full h-full"
                  ></video>
                  <canvas
                    ref={canvasRef}
                    className="absolute block w-full h-full"
                  />
                  <canvas ref={captureRef} className="hidden" />
                </div>
                <div className="block cursor-pointer text-center items-center row-span-1 justify-center my-5 py-5">
                  <button
                    type="button"
                    onClick={handleFaceMask}
                    className="cursor-pointer z-10 bg-amber-400 hover:bg-white hover:text-amber-400 text-white font-bold py-2 px-4 border rounded text-2xl"
                  >
                    {videoDetect ? "Stop" : "Start"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <LoadingBtn
          faceLandmarker={faceLandmarker}
          handleWebCamRunning={handleWebCamRunning}
        />
      )}
      <div className="flex justify-center align-middle text-center text-2xl py-5">
        {imgRef.current.length ? "Select one picture to make a polaroid" : ""}
      </div>
      <div className="flex flex-col justify-center align-middle text-center">
        {imgRef.current
          .slice(-5)
          .map(imgData =>
            imgData ? (
              <CapturedImage
                imgRefCurrent={imgData.capturedPicture}
                faceBlendShape={imgData.faceBlendShape}
                key={uuidv4()}
              />
            ) : (
              <></>
            )
          )}
      </div>
    </>
  );
};

export default FaceDetection;
