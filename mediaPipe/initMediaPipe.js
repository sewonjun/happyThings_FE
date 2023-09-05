import vision from "@mediapipe/tasks-vision";
const { FaceLandmarker, FilesetResolver } = vision;

async function initFaceLandmarker() {
  const fileSetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  const faceLandmarkerInstance = await FaceLandmarker.createFromOptions(
    fileSetResolver,
    {
      baseOptions: {
        modelAssetPath: "../model/face_landmarker.task",
        delegate: "GPU",
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1,
    }
  );

  return faceLandmarkerInstance;
}

export default initFaceLandmarker;
