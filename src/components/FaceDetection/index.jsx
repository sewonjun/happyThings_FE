import { useEffect, useRef, useState } from "react";
import vision from "@mediapipe/tasks-vision";
import { v4 as uuidv4 } from "uuid";
const { FaceLandmarker, DrawingUtils } = vision;

import initMediaPipe from "../../../mediaPipe/initMediaPipe";
import emotionPredictionModel from "../../../util/emotionPredictionModel";
import predictHappiness from "../../../util/predictHappiness";
import drawFaceMask from "../../../util/drawFaceMask";
import CapturedImage from "../CapturedImage";
import LoadingBtn from "../LoadingBtn";

const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureRef = useRef(null);
  const lastTime = useRef(0);
  const imgRef = useRef([]);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [videoDetect, setVideoDetect] = useState(false);
  const [animationId, setAnimationId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [model, setModel] = useState(null);
  const [emotion, setEmotion] = useState(null);
  let imgRefNumber = 0;
  let runningMode = "VIDEO";
  let canvasCtx;

  useEffect(() => {
    async function createFaceLandmarker() {
      const faceLandmarkerInstance = await initMediaPipe();
      setFaceLandmarker(faceLandmarkerInstance);
    }

    async function loadModel() {
      const modelLoaded = await emotionPredictionModel();
      setModel(modelLoaded);
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
    const isWebcamRunning = webcamRunning;
    setWebcamRunning(!isWebcamRunning);
  }

  function handleErrorBtn() {
    predictWebcam();
    setErrorMessage("");
  }

  function handleFaceMask() {
    if (videoDetect && animationId) {
      window.cancelAnimationFrame(animationId);
      videoRef.current.removeEventListener("loadeddata", predictWebcam);

      setWebcamRunning(false);
      setVideoDetect(false);
      setAnimationId(null);

      return;
    }

    if (faceLandmarker && !videoDetect) {
      setVideoDetect(true);

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        enableCam();
      } else {
        alert("getUserMedia() is not supported by your browser");
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

    const openMediaDevices = async constraint => {
      return await navigator.mediaDevices.getUserMedia(constraint);
    };

    try {
      const stream = await openMediaDevices(constraints);
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", predictWebcam);

      if (runningMode === "VIDEO") {
        await faceLandmarker.setOptions({ runningMode: runningMode });
      }
    } catch (error) {
      setErrorMessage("Your device is not available for this service");
    }
  }

  async function predictWebcam() {
    const canvas = canvasRef.current;

    if (canvas === null || webcamRunning === false) return;
    const video = videoRef.current;
    const videoRect = videoRef.current.getBoundingClientRect();

    let startTimeMs = performance.now();
    const results = await faceLandmarker.detectForVideo(video, startTimeMs);

    if (!results.faceLandmarks.length) {
      setErrorMessage("Face Detection Failed");
    }

    canvas?.setAttribute("class", "canvas");
    canvas?.setAttribute("width", videoRect.width);
    canvas?.setAttribute("height", videoRect.height);
    canvas.style.left = videoRect.x;
    canvas.style.top = videoRect.y;
    canvas.style.width = videoRect.width;
    canvas.style.height = videoRect.height;
    canvasCtx = canvasRef.current.getContext("2d");
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    const drawingUtils = new DrawingUtils(canvasCtx);

    if (results.faceLandmarks.length) {
      drawFaceMask(results, drawingUtils, FaceLandmarker);
    }
    const currentTime = performance.now();
    const delay = 500;

    if (!lastTime.current || currentTime - lastTime.current >= delay) {
      lastTime.current = currentTime;

      const capture = captureRef.current;
      capture?.setAttribute("class", "canvas");
      capture?.setAttribute("width", videoRect.width);
      capture?.setAttribute("height", videoRect.height);
      capture.style.left = videoRect.x;
      capture.style.top = videoRect.y;
      capture.style.width = videoRect.width;
      capture.style.height = videoRect.height;
      let captureCtx = captureRef.current.getContext("2d");
      captureCtx.clearRect(0, 0, canvas.width, canvas.height);
      captureCtx.drawImage(
        videoRef.current,
        0,
        0,
        videoRef.current.width,
        videoRef.current.height
      );

      const capturedPicture = captureRef.current.toDataURL("image/png");
      const faceBlendShape = results.faceBlendshapes[0]?.categories;
      const emotionResult = await predictHappiness(faceBlendShape, model);

      setEmotion(emotionResult);
      if (emotionResult === "happy") {
        imgRef.current[imgRefNumber] = {
          capturedPicture,
          faceBlendShape,
        };

        imgRefNumber++;
      }

      if (webcamRunning) {
        const animationFrameId = window.requestAnimationFrame(predictWebcam);
        setAnimationId(animationFrameId);
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
          <div className="flex flex-col h-screen justify-center items-center">
            <div className="flex flex-row bg-stone-200 border-4 border-stone-900 ring-offset-0 p-2 m-1 w-auto rounded-3xl justify-around">
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
              className={`${
                isMobile
                  ? "flex flex-col justify-center items-center w-full h-4/5 border-2 bg-stone-800"
                  : "flex flex-col justify-center items-center w-6/12 h-4/5 border-2 max-w-md bg-stone-800"
              }`}
            >
              <div className="grid grid-cols">
                <div className="relative block w-full h-[360px] border-y border-violet-950">
                  <video
                    ref={videoRef}
                    width="480"
                    height="360"
                    autoPlay
                    playsInline
                    className="w-full h-[360px] bg-white border-8 border-stone-800"
                  ></video>
                </div>
                <div className="absolute block w-fit h-[360px] ">
                  <canvas
                    ref={canvasRef}
                    height="360"
                    className="block w-full h-[360px]"
                  />
                </div>
                <div className="block text-center items-center justify-center my-5 py-5">
                  <button
                    type="button"
                    onClick={handleFaceMask}
                    className="bg-amber-400 hover:bg-white hover:text-amber-400 text-white font-bold py-2 mt-5 px-4 border  rounded text-2xl"
                  >
                    {videoDetect ? "Stop" : "Start"}
                  </button>
                </div>
              </div>
            </div>
            <div className="hidden">
              <canvas ref={captureRef} />
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
        {imgRef.length ? "Select one picture to make a polaroid" : ""}
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
