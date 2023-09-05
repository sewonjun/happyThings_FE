import { useEffect, useRef, useState } from "react";
import vision from "@mediapipe/tasks-vision";
import { v4 as uuidv4 } from "uuid";
const { FaceLandmarker, DrawingUtils } = vision;
import initMediaPipe from "../../../mediaPipe/initMediaPipe";
import coloredFlower from "../../assets/flowerColored.svg";
import uncoloredFlower from "../../assets/flowerUncolored.svg";
import emotionPredictionModel from "../../../util/emotionPredictionModel";
import predictHappiness from "../../../util/predictHappiness";
import CapturedImage from "../CapturedImage";

const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureRef = useRef(null);
  const lastTime = useRef(0);
  const imgRef = useRef([]);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [videoDetect, setVideoDetect] = useState(false);
  const [animationId, setAnimationId] = useState("");
  const [error, setError] = useState("");
  const [model, setModel] = useState(null);
  const [isHappy, setIsHappy] = useState(false);

  let imgRefNumber = 0;
  let runningMode = "VIDEO";
  let canvasCtx;

  useEffect(() => {
    async function createFaceLandmarker() {
      const faceLandmarkerInstance = await initMediaPipe();
      setFaceLandmarker(faceLandmarkerInstance);
    }

    createFaceLandmarker();
    loadModel();
  }, []);

  useEffect(() => {
    if (error) {
      window.scrollTo(0, 0);
    }
  }, [error]);

  async function loadModel() {
    const modelLoaded = await emotionPredictionModel();
    setModel(modelLoaded);
  }

  function handleErrorBtn() {
    predictWebcam();
    setError(false);
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

    if (faceLandmarker) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        enableCam();
        setVideoDetect(true);
      } else {
        alert("getUserMedia() is not supported by your browser");
      }
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

    if (canvas === null) return;

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

    if (runningMode === "VIDEO") {
      await faceLandmarker.setOptions({ runningMode: runningMode });
    }
    const currentTime = performance.now();
    const delay = 500;

    if (!lastTime.current || currentTime - lastTime.current >= delay) {
      lastTime.current = currentTime;
      let startTimeMs = performance.now();

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

      results = faceLandmarker.detectForVideo(video, startTimeMs);

      if (results.faceLandmarks.length === 0) {
        setError("Face Detection Failed");
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

      const faceBlendShape = results.faceBlendshapes[0].categories;
      const emotionResult = await predictHappiness(faceBlendShape, model);

      setIsHappy(emotionResult);

      if (emotionResult && imgRefNumber < 5) {
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
      window.cancelAnimationFrame(animationId);
      videoRef.current.removeEventListener("loadeddata", predictWebcam);
      predictWebcam();

      return;
    }
  }

  return (
    <>
      {error ? (
        <div className="flex flex-col justify-center items-center mt-10 h-auto w-6/12 m-auto bg-red-500">
          <h1 className="text-base text-gray-50 decoration-solid mb-1">
            Error: you need to keep your face on Video
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
            {isHappy ? (
              <div className="flex flex-row">
                <img src={coloredFlower} alt="" className="w-20" />
                <img src={coloredFlower} alt="" className="w-20" />
                <img src={coloredFlower} alt="" className="w-20" />
              </div>
            ) : (
              <div className="flex flex-row">
                <img src={uncoloredFlower} alt="" className="w-20" />
                <img src={uncoloredFlower} alt="" className="w-20" />
                <img src={uncoloredFlower} alt="" className="w-20" />
              </div>
            )}
            <div className="flex flex-col justify-center items-center w-6/12 h-4/5 border-2 max-w-md bg-stone-800">
              <div className="grid grid-cols">
                <div className="relative block w-full h-[360px] border-y border-violet-950">
                  <video
                    ref={videoRef}
                    width="480"
                    height="360"
                    autoPlay
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
        <>
          <div className="block text-center my-10 mt-20">
            <button
              type="button"
              onClick={() => {
                setWebcamRunning(true);
              }}
              className="bg-amber-400 hover:bg-white hover:text-amber-400 text-white font-bold py-2 px-4 border rounded text-2xl"
            >
              {faceLandmarker ? "Show me your Happy Moment" : "loading..."}
            </button>
          </div>
        </>
      )}
      <div className="flex justify-center align-middle text-center text-2xl py-5">
        {imgRef.length ? "Select one picture to make a polaroid" : ""}
      </div>
      <div className="flex flex-col justify-center align-middle text-center">
        {Array.from({ length: 5 }, (_, i) => i).map(index =>
          imgRef.current[index] ? (
            <CapturedImage
              imgRefCurrent={imgRef.current[index].capturedPicture}
              faceBlendShape={imgRef.current[index].faceBlendShape}
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
