import { useEffect, useRef, useState } from "react";
import vision from "@mediapipe/tasks-vision";
const { FaceLandmarker, DrawingUtils } = vision;
import initMediaPipe from "../../../mediaPipe/initMediaPipe";

const FaceLandmarkDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [videoDetect, setVideoDetect] = useState(false);
  const [animationId, setAnimationId] = useState("");
  const lastTime = useRef(0);
  const videoWidth = "480px";
  let runningMode = "VIDEO";
  let canvasCtx;

  useEffect(() => {
    async function createFaceLandmarker() {
      const faceLandmarkerInstance = await initMediaPipe();
      setFaceLandmarker(faceLandmarkerInstance);
    }

    createFaceLandmarker();
  }, []);

  function handleToggleVideo() {
    setWebcamRunning(true);
  }

  function handleFaceMask() {
    if (videoDetect && animationId) {
      window.cancelAnimationFrame(animationId);
      setWebcamRunning(false);
      setVideoDetect(false);

      return;
    }

    if (faceLandmarker) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        enableCam();
      } else {
        alert("getUserMedia() is not supported by your browser");
      }
      videoRef.current.addEventListener("loadeddata", predictWebcam);
      setVideoDetect(true);
    }
  }

  function enableCam() {
    if (!faceLandmarker) {
      alert("Wait! faceLandmarker not loaded yet.");

      return;
    }

    const constraints = {
      video: true,
    };

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", predictWebcam);
    });
  }

  async function predictWebcam() {
    let results;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const videoRect = videoRef.current?.getBoundingClientRect();
    const radio = video.videoHeight / video.videoWidth;

    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("width", "480px");
    canvas.setAttribute("height", "360px");
    canvas.style.left = videoRect.x;
    canvas.style.top = videoRect.y;
    canvas.style.width = `${videoRef.current.width}px`;
    canvas.style.height = `${videoRef.current.height}px`;
    canvasCtx = canvasRef.current.getContext("2d");
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    let lastVideoTime = -1;
    const drawingUtils = new DrawingUtils(canvasCtx);

    video.style.width = videoWidth + "px";
    video.style.height = videoWidth * radio + "px";

    if (runningMode === "VIDEO") {
      await faceLandmarker.setOptions({ runningMode: runningMode });
    }
    const currentTime = new Date().getTime();
    const delay = 1000;

    if (!lastTime.current || currentTime - lastTime.current >= delay) {
      lastTime.current = currentTime;
      let startTimeMs = performance.now();

      canvasCtx.drawImage(
        videoRef.current,
        0,
        0,
        videoRef.current.width,
        videoRef.current.height
      );
      canvasRef.current.toDataURL("image/png");

      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = faceLandmarker.detectForVideo(video, startTimeMs);
      }

      if (results.faceLandmarks) {
        for (const landmarks of results.faceLandmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: "#C0C0C070", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
            { color: "#FF3030", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
            { color: "#FF3030", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
            { color: "#30FF30", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
            { color: "#30FF30", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
            { color: "#E0E0E0", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LIPS,
            { color: "#E0E0E0", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
            { color: "#FF3030", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
            { color: "#30FF30", lineWidth: 1 }
          );
        }
      }

      if (webcamRunning) {
        const animationFrameId = window.requestAnimationFrame(predictWebcam);
        setAnimationId(animationFrameId);
      }
    } else {
      window.cancelAnimationFrame(animationId);
      return predictWebcam();
    }
  }

  return (
    <>
      <div className="flex justify-center items-center h-screen ">
        <div className="relative grid grid-cols-1 w-6/12 h-3/5 py-20 border-2 border-yellow-400">
          {webcamRunning ? (
            <>
              <div className="block w-full h-[360px] border-2 border-stone-950 bg-black my-5">
                <video
                  id="webcam"
                  ref={videoRef}
                  width="480"
                  height="360"
                  autoPlay
                  className="block border-2 border-stone-950 w-full h-full"
                ></video>
              </div>
              <div className="w-full h-[360px] border-2 border-stone-950 bg-black my-5 flex justify-center items-center">
                <canvas
                  id="output_canvas"
                  ref={canvasRef}
                  width="480"
                  height="360"
                  className="block border-2 border-red-700"
                />
              </div>
              <div className="inline-block text-center">
                <button
                  type="button"
                  onClick={handleFaceMask}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
                >
                  {videoDetect ? "Pause" : "Start"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-full h-[360px] border-2 border-stone-950 bg-black my-5"></div>
              <div className="inline-block text-center">
                <button
                  type="button"
                  onClick={handleToggleVideo}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
                >
                  {faceLandmarker ? "Start video" : "loading..."}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FaceLandmarkDetection;
