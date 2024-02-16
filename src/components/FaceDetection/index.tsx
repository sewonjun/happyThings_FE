import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

import initMediaPipe from "../../../mediaPipe/initMediaPipe";
import predictHappiness from "../../../util/predictHappiness";
import drawFaceMask from "../../../util/drawFaceMask";
import LoadingBtn from "../LoadingBtn";
import emotionPredictionModel from "../../../util/emotionPredictionModel";
import ErrorMessage from "../ErrorMessage";
import EmotionIndicator from "../EmotionIndicator";
import WebcamVideo from "../WebcamVideo";
import CapturedList from "../CapturedList";

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

function FaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);
  const lastTime = useRef<number>(0);
  const capturedImageCount = useRef(0);
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
  const [isLoading, setIsLoading] = useState<boolean | null>(null);
  const [capturedImages, setCapturedImages] = useState<ImageRef[]>([]);
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

  function handleRestart() {
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

    setIsLoading(true);

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
        videoRef.current.onloadeddata = () => {
          setIsLoading(false);
          videoRef.current!.play();
        };
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
            capturedImageCount.current += 1;

            setCapturedImages(prevImages => [
              ...prevImages,
              {
                capturedPicture,
                faceBlendShape,
              },
            ]);
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
        <ErrorMessage handleRestart={handleRestart} message={errorMessage} />
      ) : (
        <></>
      )}
      {webcamRunning ? (
        <>
          <div className="flex flex-col h-screen items-center">
            <EmotionIndicator emotion={emotion} />
            {isLoading && <div className="loading-container">Loading...</div>}
            <WebcamVideo
              isMobile={isMobile}
              videoContainerRef={videoContainerRef}
              videoRef={videoRef}
              canvasRef={canvasRef}
              captureRef={captureRef}
              handleFaceMask={handleFaceMask}
              videoDetect={videoDetect}
            />
          </div>
        </>
      ) : (
        <LoadingBtn
          faceLandmarker={faceLandmarker}
          handleWebCamRunning={handleWebCamRunning}
        />
      )}
      <CapturedList
        capturedImages={capturedImages}
        capturedImageCount={capturedImageCount}
      />
    </>
  );
}

export default FaceDetection;
